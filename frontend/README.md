# AI Video Authenticity Web Frontend

A responsive web dashboard for deepfake and synthetic video authenticity detection, built with React, Vite, and Lucide icons.

The frontend interfaces with the project's **ResNet-50 transfer learning binary classifier**, presenting frame-sampled confidence scores, validation-calibrated decision thresholds, and diagnostic breakdowns.

---

## Visual Design System & Palette

The user interface follows a calm, academic, and enterprise-grade aesthetic:
* **Deep Navy (`#14213D`)**: Primary headings, navigation bar, strong typography.
* **Teal (`#0F8B8D`)**: Primary actions, progress bars, active highlights.
* **Warm Ivory (`#F7F5F0`)**: Page background, soft panels, and contrast surfaces.
* **Pure White (`#FFFFFF`)**: Card surfaces and dialog containers.
* **Neutral Slate (`#E2E8F0`, `#64748B`)**: Borders and secondary metadata text.
* **Accessible Restrained Status Tints**:
  * `REAL`: `#EBF5F5` background, `#0D6F71` text, `#A2D2D2` border.
  * `AI_GENERATED`: `#FDF3EC` background, `#963E1B` text, `#F0D1BD` border.

---

## Features

1. **Video Upload Card & Drag-and-Drop Dropzone**
   * Drag-and-drop or file browser supporting `.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`, `.mpeg`, `.mpg`.
   * Video stream preview player with duration and format tags.
   * Configurable inference sampling settings (sampling interval, max frame count, mean/median aggregation).
   * 3 pre-configured demo presets (Authentic Camera, AI Generated, Borderline probe) for instant testing.

2. **Refined Multi-Stage Loading State**
   * Step-by-step progress tracking:
     1. Video stream validation & metadata extraction
     2. Uniform temporal frame sampling (1 fps, 224x224 aspect letterbox)
     3. ResNet-50 feature extraction pass
     4. Mean softmax pooling & 0.6288 decision threshold evaluation

3. **Prominent Result Display**
   * Clear classification badge (`REAL` vs. `AI_GENERATED`).
   * Visual gauge meter with pinned 0.6288 decision threshold indicator.
   * Frame inspection drawer showing individual frame scores and temporal timestamps.
   * Scientific disclaimer clarifying that confidence scores are statistical estimates, not forensic proof.
   * JSON analysis report export.

4. **Persistent History Log**
   * Stores past analyses in `localStorage`.
   * Filter by status (`All`, `Real`, `AI-Generated`) and search by filename.
   * Re-inspect any previous analysis in the primary result view.

5. **"How It Works" & Privacy Guarantee**
   * 3-step explanation of frame sampling, transfer learning, and threshold calibration.
   * Privacy note confirming local processing with zero external cloud transmission.

6. **Dual Mode Architecture (Simulator & Live Python API)**
   * **Simulator Mode:** High-fidelity simulation matching the model's empirical distribution.
   * **Live Mode:** Real-time HTTP connection to `server.py` invoking `src.predict_video.predict`.

---

## Quick Start

### Option 1: Full-Stack Server (Frontend + Live Model on Port 8000)
```powershell
# From the repository root
py -3.11 server.py
```
Open [http://localhost:8000](http://localhost:8000) in your web browser.

### Option 2: Frontend Vite Development Server (Port 5173)
```powershell
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) with hot-module reloading.

---

## REST API Contract (`POST /api/predict`)

### Request
* **Method:** `POST`
* **Content-Type:** `multipart/form-data`
* **Fields:**
  * `file`: Binary video file (`.mp4`, `.mov`, `.mpeg`, etc.)
  * `interval`: Float (default `1.0`)
  * `max_frames`: Integer (default `12`)
  * `aggregation`: String (`"mean"` or `"median"`)

### Response
```json
{
  "label": "AI_GENERATED",
  "ai_generated_score": 0.8842,
  "decision_threshold": 0.628847,
  "frames_analyzed": 12,
  "aggregation": "mean",
  "confidence_margin": 0.2554,
  "is_close_to_threshold": false,
  "model_architecture": "ResNet-50",
  "filename": "sample_video.mp4",
  "frame_scores": [
    { "frameIndex": 1, "timestamp": "0.0s", "score": 0.842 },
    { "frameIndex": 2, "timestamp": "1.0s", "score": 0.891 }
  ]
}
```
