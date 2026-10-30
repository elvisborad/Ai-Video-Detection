import React, { useState } from "react";
import { X, Copy, Check, FileCode, Terminal, Globe } from "lucide-react";

export function ApiDocumentation({ isOpen, onClose, currentApiUrl, onSaveApiUrl }) {
  const [copied, setCopied] = useState("");
  const [tempUrl, setTempUrl] = useState(currentApiUrl || "http://localhost:8000");

  if (!isOpen) return null;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const curlExample = `curl -X POST "${tempUrl}/api/predict" \\
  -F "file=@video_sample.mp4" \\
  -F "interval=1.0" \\
  -F "max_frames=12" \\
  -F "aggregation=mean"`;

  const pythonExample = `import requests

url = "${tempUrl}/api/predict"
files = {"file": open("video_sample.mp4", "rb")}
data = {
    "interval": 1.0,
    "max_frames": 12,
    "aggregation": "mean"
}

response = requests.post(url, files=files, data=data)
result = response.json()
print("Classification:", result["label"])
print("AI Score:", result["ai_generated_score"])
print("Decision Threshold:", result["decision_threshold"])`;

  const jsonResponseSchema = `{
  "label": "AI_GENERATED" | "REAL",
  "ai_generated_score": 0.8842,
  "decision_threshold": 0.628847,
  "frames_analyzed": 12,
  "aggregation": "mean",
  "confidence_margin": 0.2554,
  "is_close_to_threshold": false,
  "model_architecture": "ResNet-50",
  "frame_scores": [
    { "frameIndex": 1, "timestamp": "0.0s", "score": 0.842 },
    { "frameIndex": 2, "timestamp": "1.0s", "score": 0.891 }
  ]
}`;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FileCode size={22} color="var(--color-teal)" />
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-navy)" }}>
                Backend REST API Integration Contract
              </h2>
              <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                Specification for connecting this frontend to the Python prediction backend
              </p>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {/* Backend Endpoint Config */}
        <div style={{ marginBottom: "20px", padding: "14px", backgroundColor: "var(--color-ivory)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-gray-200)" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-navy)", marginBottom: "6px" }}>
            Configured Backend Base URL:
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "0.85rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-gray-300)",
                backgroundColor: "var(--color-white)",
              }}
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onSaveApiUrl(tempUrl)}
            >
              Save URL
            </button>
          </div>
        </div>

        {/* Endpoints */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-navy)", marginBottom: "8px" }}>
            1. POST /api/predict
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--color-gray-600)", marginBottom: "8px" }}>
            Receives a multipart video file and sampling options. Runs frame extraction and ResNet-50 inference.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-gray-500)" }}>
              Expected JSON Response Schema:
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => copyToClipboard(jsonResponseSchema, "schema")}
            >
              {copied === "schema" ? <Check size={14} color="var(--color-teal)" /> : <Copy size={14} />}
              <span>{copied === "schema" ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <pre className="code-snippet">{jsonResponseSchema}</pre>
        </div>

        {/* cURL Example */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-navy)" }}>
              cURL Request
            </h4>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => copyToClipboard(curlExample, "curl")}
            >
              {copied === "curl" ? <Check size={14} color="var(--color-teal)" /> : <Copy size={14} />}
              <span>{copied === "curl" ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <pre className="code-snippet">{curlExample}</pre>
        </div>

        {/* Python Example */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-navy)" }}>
              Python Requests Client
            </h4>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => copyToClipboard(pythonExample, "python")}
            >
              {copied === "python" ? <Check size={14} color="var(--color-teal)" /> : <Copy size={14} />}
              <span>{copied === "python" ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <pre className="code-snippet">{pythonExample}</pre>
        </div>
      </div>
    </div>
  );
}
