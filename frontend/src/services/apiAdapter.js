/**
 * API Service & Adapter Layer
 * Provides clean decoupling between UI and prediction backend.
 * Supports both Live REST backend and high-fidelity Mock Simulator.
 */

export const DECISION_THRESHOLD = 0.628847; // From trained ResNet-50 validation monitor calibration

export class ApiAdapter {
  constructor(mode = "live", baseUrl = "") {
    this.mode = mode; // 'live' | 'mock'
    this.baseUrl = baseUrl;
    this.activeEndpoint = "";
    this.authToken = "";
  }

  setMode(mode) {
    this.mode = mode;
  }

  setBaseUrl(url) {
    this.baseUrl = url.replace(/\/+$/, "");
  }

  setAuthToken(token) {
    this.authToken = token || "";
  }

  /**
   * Check connection to live backend with auto-fallback for Vite proxy, 127.0.0.1, and localhost
   */
  async checkHealth() {
    if (this.mode === "mock") {
      return { online: true, mode: "mock", model: "ResNet-50 (Transfer Learning)", threshold: DECISION_THRESHOLD };
    }

    // Candidate URL endpoints to check
    const candidateEndpoints = [];
    if (this.baseUrl) {
      candidateEndpoints.push(this.baseUrl);
    }
    // Also test relative /api (works seamlessly via Vite proxy or same-origin)
    candidateEndpoints.push("");
    // IPv4 loopback (avoids Windows IPv6 resolution issues)
    candidateEndpoints.push("http://127.0.0.1:8000");
    // Standard localhost
    candidateEndpoints.push("http://localhost:8000");

    for (const endpoint of candidateEndpoints) {
      try {
        const url = endpoint ? `${endpoint}/api/health` : "/api/health";
        const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const data = await res.json();
          this.activeEndpoint = endpoint;
          return { online: true, mode: "live", endpoint, ...data };
        }
      } catch {
        // Try next candidate
      }
    }

    return {
      online: false,
      mode: "live",
      error: "Cannot connect to Python backend at 127.0.0.1:8000 or localhost:8000. Start 'py -3.11 server.py'.",
    };
  }

  /**
   * Main analysis execution with progress stages
   * @param {File | Object} videoItem - File object or demo preset
   * @param {Object} options - { interval: 1.0, maxFrames: 12, aggregation: 'mean' }
   * @param {Function} onProgress - Callback for loading stage updates (0-100, stage text)
   */
  async analyzeVideo(videoItem, options = {}, onProgress = () => {}) {
    const { interval = 1.0, maxFrames = 12, aggregation = "mean" } = options;

    if (this.mode === "live") {
      return await this._analyzeLive(videoItem, { interval, maxFrames, aggregation }, onProgress);
    } else {
      return await this._analyzeMock(videoItem, { interval, maxFrames, aggregation }, onProgress);
    }
  }

  /**
   * Live backend invocation via POST /api/predict
   */
  async _analyzeLive(videoItem, { interval, maxFrames, aggregation }, onProgress) {
    onProgress(15, "Connecting to Python ResNet-50 service...");
    const formData = new FormData();

    if (videoItem instanceof File) {
      formData.append("file", videoItem);
    } else if (videoItem.file) {
      formData.append("file", videoItem.file);
    } else {
      throw new Error("Live mode requires a local video file upload.");
    }

    formData.append("interval", interval);
    formData.append("max_frames", maxFrames);
    formData.append("aggregation", aggregation);

    onProgress(35, "Uploading video payload to private server...");

    const targetUrl = this.activeEndpoint
      ? `${this.activeEndpoint}/api/predict`
      : "/api/predict";

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        body: formData,
        headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
      });

      onProgress(75, "Extracting frames and running ResNet-50 inference...");

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned status ${response.status}: ${errorText}`);
      }

      onProgress(95, "Aggregating frame softmax scores...");
      const raw = await response.json();
      onProgress(100, "Inference completed");

      const score = Number(raw.aiGeneratedScore ?? raw.ai_generated_score ?? 0);
      const threshold = Number(raw.decisionThreshold ?? raw.decision_threshold ?? DECISION_THRESHOLD);
      const count = Number(raw.framesAnalyzed ?? raw.frames_analyzed ?? (raw.frameScores?.length || raw.frame_scores?.length || 0));
      const margin = Number(raw.confidenceMargin ?? raw.confidence_margin ?? (score - threshold));
      const isClose = raw.isCloseToThreshold ?? raw.is_close_to_threshold ?? (Math.abs(margin) < 0.05);

      const frameScores = raw.frameScores || raw.frame_scores || [];

      return {
        label: raw.label || (score >= threshold ? "AI_GENERATED" : "REAL"),
        aiGeneratedScore: score,
        decisionThreshold: threshold,
        framesAnalyzed: count,
        aggregation: raw.aggregation || aggregation,
        confidenceMargin: margin,
        isCloseToThreshold: isClose,
        modelArchitecture: raw.modelArchitecture || raw.model_architecture || "ResNet-50",
        filename: raw.filename || (videoItem.name || "video.mp4"),
        analyzedAt: raw.analyzedAt || raw.analyzed_at || new Date().toISOString().replace("T", " ").substring(0, 16),
        frameScores: frameScores.map((f, i) => ({
          frameIndex: f.frameIndex ?? (i + 1),
          timestamp: f.timestamp ?? `${(i * interval).toFixed(1)}s`,
          score: Number(f.score ?? score),
        })),
        metadata: { sourceMode: "live_resnet50" },
      };
    } catch (err) {
      throw new Error(`Inference request failed: ${err.message}. Ensure backend is running ('py -3.11 server.py') or switch to Simulator Mode.`);
    }
  }

  /**
   * High-fidelity simulated inference matching exact experimental statistics
   */
  async _analyzeMock(videoItem, { interval, maxFrames, aggregation }, onProgress) {
    const filename = videoItem.name || videoItem.filename || "unknown_video.mp4";
    const lower = filename.toLowerCase();

    // Determine target probability based on filename clues or preset indicators
    let baseScore;
    if (videoItem.simulatedScore !== undefined) {
      baseScore = videoItem.simulatedScore;
    } else if (
      lower.includes("ai") ||
      lower.includes("synth") ||
      lower.includes("gen") ||
      lower.includes("pika") ||
      lower.includes("neverends") ||
      lower.includes("moonvalley") ||
      lower.includes("runway") ||
      lower.includes("sora") ||
      lower.includes("kling") ||
      lower.includes("luma")
    ) {
      baseScore = 0.88 + Math.random() * 0.09; // 0.88 - 0.97 (AI)
    } else if (
      lower.includes("real") ||
      lower.includes("camera") ||
      lower.includes("archive") ||
      lower.includes("scene") ||
      lower.includes("raw") ||
      lower.includes("whatsapp") ||
      lower.includes("vid_") ||
      lower.includes("img_") ||
      lower.includes("phone") ||
      lower.includes("outdoor")
    ) {
      baseScore = 0.12 + Math.random() * 0.18; // 0.12 - 0.30 (Real)
    } else {
      // Default to neutral authentic baseline
      baseScore = 0.22 + Math.random() * 0.15;
    }

    // Step 1: Upload & Stream Verification
    onProgress(18, "Validating video container & reading stream FPS...");
    await new Promise((r) => setTimeout(r, 450));

    // Step 2: Temporal Frame Sampling
    onProgress(42, `Sampling up to ${maxFrames} frames at ${interval}s interval with letterboxing...`);
    await new Promise((r) => setTimeout(r, 600));

    // Step 3: ResNet-50 Feature Extraction
    onProgress(70, "Running ResNet-50 forward pass (ImageNet backbone + custom head)...");
    await new Promise((r) => setTimeout(r, 700));

    // Step 4: Pooling & Threshold Comparison
    onProgress(90, `Aggregating frame scores via ${aggregation} softmax & applying 0.6288 threshold...`);
    await new Promise((r) => setTimeout(r, 350));

    // Generate realistic per-frame scores around baseScore with subtle variance
    const frameCount = Math.min(maxFrames, 12);
    const frameScores = [];
    for (let i = 1; i <= frameCount; i++) {
      const jitter = (Math.random() - 0.5) * 0.06;
      const score = Math.max(0.01, Math.min(0.99, Number((baseScore + jitter).toFixed(4))));
      frameScores.push({
        frameIndex: i,
        timestamp: `${((i - 1) * interval).toFixed(1)}s`,
        score: score,
        thumbnailPlaceholder: `frame_${String(i).padStart(4, "0")}.jpg`,
      });
    }

    // Compute aggregated score
    let aggregatedScore;
    if (aggregation === "median") {
      const sorted = [...frameScores].map((f) => f.score).sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      aggregatedScore = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      const sum = frameScores.reduce((acc, f) => acc + f.score, 0);
      aggregatedScore = sum / frameScores.length;
    }
    aggregatedScore = Number(aggregatedScore.toFixed(4));

    const threshold = DECISION_THRESHOLD;
    const label = aggregatedScore >= threshold ? "AI_GENERATED" : "REAL";
    const confidenceMargin = Number((aggregatedScore - threshold).toFixed(4));
    const isCloseToThreshold = Math.abs(confidenceMargin) < 0.05;

    onProgress(100, "Inference completed");

    return {
      label,
      aiGeneratedScore: aggregatedScore,
      decisionThreshold: threshold,
      framesAnalyzed: frameCount,
      aggregation,
      confidenceMargin,
      isCloseToThreshold,
      modelArchitecture: "ResNet-50 (ImageNet Transfer Learning)",
      analyzedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      filename,
      frameScores,
      metadata: {
        backboneFrozen: true,
        calibratedOn: "Validation Monitor (Macro F1)",
        sourceMode: "simulator",
      },
    };
  }
}

export const apiService = new ApiAdapter();
