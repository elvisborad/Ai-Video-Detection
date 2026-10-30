"""
Threaded API Bridge and Static Server for AI Video Authenticity Detection.
Zero external dependencies - uses standard library `http.server.ThreadingHTTPServer`.

Provides:
- GET  /api/health      -> Server & ResNet-50 model status
- POST /api/predict     -> Real-time video inference via src.predict_video
- GET  /*               -> Serves built frontend from frontend/dist
"""

import sys
import os
import json
import cgi
import tempfile
import socket
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PORT = int(os.environ.get("PORT", 8000))
HOST = os.environ.get("HOST", "127.0.0.1")
MAX_UPLOAD_BYTES = 250 * 1024 * 1024
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "").strip()
ALLOWED_ORIGINS = {
    origin.strip() for origin in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",") if origin.strip()
}
ROOT_DIR = Path(__file__).resolve().parent
DIST_DIR = ROOT_DIR / "frontend" / "dist"
CHECKPOINT_PATH = ROOT_DIR / "results" / "models" / "best_model.pt"

# Ensure root is in sys.path to import src
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))


class AuthenticityApiHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR if DIST_DIR.is_dir() else ROOT_DIR), **kwargs)

    def _send_cors_headers(self):
        origin = self.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.send_header("Access-Control-Allow-Private-Network", "true")

    def do_OPTIONS(self):
        self.send_response(204)
        if self.headers.get("Origin") in ALLOWED_ORIGINS:
            self._send_cors_headers()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/config" or self.path == "/api/config/":
            self._send_json(200, {"google_client_id": GOOGLE_CLIENT_ID})
            return

        if self.path == "/api/health" or self.path == "/api/health/":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            response = {
                "status": "online",
                "model": "ResNet-50 (Transfer Learning)",
                "checkpoint": str(CHECKPOINT_PATH),
                "checkpoint_exists": CHECKPOINT_PATH.is_file(),
                "decision_threshold": 0.628847,
                "classes": ["REAL", "AI_GENERATED"]
            }
            body = json.dumps(response).encode("utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        # Serve static SPA frontend
        if DIST_DIR.is_dir():
            rel_path = self.path.split("?")[0].lstrip("/")
            file_path = DIST_DIR / rel_path
            if not file_path.is_file():
                # Fallback to index.html for SPA routes
                self.path = "/index.html"

        return super().do_GET()

    def do_POST(self):
        if self.path == "/api/auth/google":
            self._handle_google_auth()
            return
        if self.path == "/api/predict" or self.path == "/api/predict/":
            self._handle_predict()
            return
        
        self.send_response(404)
        self._send_cors_headers()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def _verify_google_credential(self, credential):
        if not GOOGLE_CLIENT_ID:
            raise RuntimeError("Google OAuth is not configured on the server")
        from google.auth.transport import requests
        from google.oauth2 import id_token

        claims = id_token.verify_oauth2_token(credential, requests.Request(), GOOGLE_CLIENT_ID)
        if not claims.get("sub") or not claims.get("email") or not claims.get("email_verified"):
            raise ValueError("Google account email is not verified")
        return {key: claims.get(key) for key in ("sub", "email", "name", "picture") if claims.get(key)}

    def _handle_google_auth(self):
        if not GOOGLE_CLIENT_ID:
            self._send_json_error(503, "Google OAuth is not configured. Set GOOGLE_CLIENT_ID on the backend.")
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 32_000:
                self._send_json_error(400, "Invalid sign-in request")
                return
            payload = json.loads(self.rfile.read(length))
            credential = payload.get("credential", "")
            if not isinstance(credential, str) or not credential:
                self._send_json_error(400, "Missing Google credential")
                return
            user = self._verify_google_credential(credential)
            self._send_json(200, {"user": user})
        except RuntimeError as exc:
            self._send_json_error(503, str(exc))
        except Exception:
            self._send_json_error(401, "Google sign-in could not be verified")

    def _send_json(self, code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def _handle_predict(self):
        try:
            authorization = self.headers.get("Authorization", "")
            if not authorization.startswith("Bearer "):
                self._send_json_error(401, "Sign in with Google before using the analyzer")
                return
            try:
                self._verify_google_credential(authorization[7:].strip())
            except RuntimeError as exc:
                self._send_json_error(503, str(exc))
                return
            except Exception:
                self._send_json_error(401, "Google sign-in expired or could not be verified")
                return

            content_type = self.headers.get("Content-Type", "")
            if not content_type.startswith("multipart/form-data"):
                self._send_json_error(400, "Expected multipart/form-data with video file")
                return

            try:
                content_length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                content_length = 0
            if content_length <= 0 or content_length > MAX_UPLOAD_BYTES:
                self._send_json_error(413, "Upload must be between 1 byte and 250 MB")
                return

            environ = {
                "REQUEST_METHOD": "POST",
                "CONTENT_TYPE": self.headers["Content-Type"],
                "CONTENT_LENGTH": self.headers.get("Content-Length", 0),
            }
            form = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ=environ)

            if "file" not in form:
                self._send_json_error(400, "No 'file' field found in form submission")
                return

            file_item = form["file"]
            filename = getattr(file_item, "filename", "uploaded_video.mp4")
            interval = float(form.getvalue("interval", 1.0))
            max_frames = int(form.getvalue("max_frames", 12))
            aggregation = str(form.getvalue("aggregation", "mean")).lower()
            if Path(filename).suffix.lower() not in {".mp4", ".mov", ".avi", ".mkv", ".webm", ".mpeg", ".mpg"}:
                self._send_json_error(400, "Unsupported video file extension")
                return
            if not 0.1 <= interval <= 60 or not 1 <= max_frames <= 64 or aggregation not in {"mean", "median"}:
                self._send_json_error(400, "Invalid sampling or aggregation options")
                return

            # Save uploaded video to temporary file
            suffix = Path(filename).suffix or ".mp4"
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
                tmp.write(file_item.file.read())
                temp_video_path = tmp.name

            try:
                # Import live predict function from src.predict_video
                from src.predict_video import predict

                if not CHECKPOINT_PATH.is_file():
                    raise FileNotFoundError(f"Checkpoint not found at {CHECKPOINT_PATH}")

                label, score, count = predict(
                    video=temp_video_path,
                    checkpoint=str(CHECKPOINT_PATH),
                    interval=interval,
                    max_frames=max_frames,
                    device="cpu",
                    aggregation=aggregation
                )

                threshold = 0.628847
                margin = score - threshold
                is_close = abs(margin) < 0.05

                result = {
                    "label": label,
                    "ai_generated_score": round(score, 4),
                    "aiGeneratedScore": round(score, 4),
                    "decision_threshold": threshold,
                    "decisionThreshold": threshold,
                    "frames_analyzed": count,
                    "framesAnalyzed": count,
                    "aggregation": aggregation,
                    "confidence_margin": round(margin, 4),
                    "confidenceMargin": round(margin, 4),
                    "is_close_to_threshold": is_close,
                    "isCloseToThreshold": is_close,
                    "model_architecture": "ResNet-50",
                    "modelArchitecture": "ResNet-50 (Transfer Learning)",
                    "filename": filename,
                    "analyzed_at": None,
                    "analyzedAt": None,
                    "frame_scores": [
                        {"frameIndex": i + 1, "timestamp": f"{(i * interval):.1f}s", "score": round(score, 4)}
                        for i in range(count)
                    ],
                    "frameScores": [
                        {"frameIndex": i + 1, "timestamp": f"{(i * interval):.1f}s", "score": round(score, 4)}
                        for i in range(count)
                    ]
                }

                body = json.dumps(result).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(body)

            finally:
                if os.path.exists(temp_video_path):
                    try:
                        os.remove(temp_video_path)
                    except Exception:
                        pass

        except Exception as exc:
            self._send_json_error(500, f"Inference execution failed: {str(exc)}")

    def _send_json_error(self, code, message):
        body = json.dumps({"error": message}).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(body)


def run():
    print(f"Starting local AI Video Authenticity server at {HOST}:{PORT}...")
    print(f"Serving UI from {DIST_DIR}...")
    print(f"Model Checkpoint: {CHECKPOINT_PATH}")
    server = ThreadingHTTPServer((HOST, PORT), AuthenticityApiHandler)
    server.daemon_threads = True
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        server.server_close()


if __name__ == "__main__":
    run()
