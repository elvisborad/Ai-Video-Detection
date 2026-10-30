import React from "react";
import {
  CheckCircle,
  AlertTriangle,
  Download,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Cpu,
} from "lucide-react";
import { FrameInspector } from "./FrameInspector";

export function ResultCard({ result, onReset }) {
  if (!result) return null;

  const score = Number(result.aiGeneratedScore ?? result.ai_generated_score ?? 0);
  const threshold = Number(result.decisionThreshold ?? result.decision_threshold ?? 0.628847);
  const framesCount = Number(result.framesAnalyzed ?? result.frames_analyzed ?? (result.frameScores?.length || 0));

  const isAI = (result.label || (score >= threshold ? "AI_GENERATED" : "REAL")) === "AI_GENERATED";
  const percentage = (score * 100).toFixed(1);
  const thresholdPercentage = (threshold * 100).toFixed(1);

  // Meter position: clamp between 2% and 98% for clean UI pin placement
  const meterLeftPercent = Math.max(2, Math.min(98, score * 100));
  const thresholdLeftPercent = Math.max(2, Math.min(98, threshold * 100));

  const handleDownloadReport = () => {
    const reportData = {
      title: "AI Video Authenticity Analysis Report",
      timestamp: result.analyzedAt || new Date().toISOString(),
      filename: result.filename,
      classification: result.label,
      confidence_score: result.aiGeneratedScore,
      decision_threshold: result.decisionThreshold,
      frames_analyzed: result.framesAnalyzed,
      aggregation_method: result.aggregation || "mean",
      model: result.modelArchitecture || "ResNet-50 Binary Classifier",
      disclaimer:
        "This evaluation is a transfer learning estimate based on visual artifact extraction. It does not provide forensic guarantee.",
      frame_breakdown: result.frameScores || [],
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `authenticity_report_${result.filename.replace(/\.[^/.]+$/, "")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="result-card" role="region" aria-label="Authenticity Analysis Result">
      {/* Top Banner: Label & Primary Score */}
      <div className="result-top-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className={`result-badge-large ${isAI ? "ai" : "real"}`}>
            {isAI ? (
              <>
                <ShieldAlert size={24} />
                <span>AI_GENERATED</span>
              </>
            ) : (
              <>
                <ShieldCheck size={24} />
                <span>REAL (AUTHENTIC)</span>
              </>
            )}
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-navy)" }}>
              {isAI
                ? "High likelihood of generative synthesis"
                : "Consistent with camera sensor recordings"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-gray-500)" }}>
              Evaluated on {result.filename}
            </div>
          </div>
        </div>

        <div className="score-display-group">
          <div className="score-number score-reveal">{percentage}%</div>
          <div className="score-label">
            AI-Generated Confidence ({result.aiGeneratedScore.toFixed(4)})
          </div>
        </div>
      </div>

      {/* Visual Meter / Gauge with Threshold Marker */}
      <div className="meter-wrapper">
        <div className="meter-header">
          <span>REAL CAMERA ZONE (&lt; 62.9%)</span>
          <span>AI GENERATED ZONE (&ge; 62.9%)</span>
        </div>

        <div className="meter-track">
          {/* Real zone shading */}
          <div className="meter-fill-real" />
          {/* AI zone shading */}
          <div className="meter-fill-ai" />

          {/* Decision threshold pin */}
          <div
            className="meter-threshold-pin"
            style={{ left: `${thresholdLeftPercent}%` }}
          >
            <div className="meter-threshold-label">Cutoff: {thresholdPercentage}%</div>
          </div>

          {/* Current Score pin */}
          <div
            className="meter-current-pin"
            style={{
              left: `${meterLeftPercent}%`,
              backgroundColor: isAI ? "var(--result-ai-text)" : "var(--color-teal)",
            }}
            title={`Analyzed score: ${percentage}%`}
          />
        </div>

        <div className="meter-labels-bottom">
          <span>0.0 (Definite Authentic)</span>
          <span>Decision Threshold: {threshold.toFixed(4)}</span>
          <span>1.0 (Definite Synthetic)</span>
        </div>
      </div>

      {/* Close-to-threshold warning if borderline */}
      {result.isCloseToThreshold && (
        <div
          className="disclaimer-box"
          style={{
            borderColor: "var(--color-gray-300)",
            backgroundColor: "var(--color-ivory)",
            marginBottom: "16px",
          }}
        >
          <AlertTriangle size={18} color="#D97706" />
          <p style={{ color: "var(--color-navy)" }}>
            <strong>Borderline Classification Warning:</strong> The aggregated confidence score (
            {score.toFixed(4)}) is within 0.05 of the calibrated decision
            threshold ({threshold.toFixed(4)}). We recommend manual review or testing
            additional frames.
          </p>
        </div>
      )}

      {/* Diagnostic Metrics Grid */}
      <div className="diagnostics-grid">
        <div className="diagnostic-item">
          <span className="diagnostic-label">Decision Threshold</span>
          <span className="diagnostic-value">{threshold.toFixed(4)}</span>
          <span style={{ fontSize: "0.7rem", color: "var(--color-gray-500)", marginTop: "2px" }}>
            Validation macro F1 calibrated
          </span>
        </div>

        <div className="diagnostic-item">
          <span className="diagnostic-label">Frames Analyzed</span>
          <span className="diagnostic-value">{framesCount} frames</span>
          <span style={{ fontSize: "0.7rem", color: "var(--color-gray-500)", marginTop: "2px" }}>
            Sampled ~1.0s interval
          </span>
        </div>

        <div className="diagnostic-item">
          <span className="diagnostic-label">Pooling Method</span>
          <span className="diagnostic-value">
            {result.aggregation ? result.aggregation.toUpperCase() : "MEAN"} SOFTMAX
          </span>
          <span style={{ fontSize: "0.7rem", color: "var(--color-gray-500)", marginTop: "2px" }}>
            Multi-frame aggregation
          </span>
        </div>

        <div className="diagnostic-item">
          <span className="diagnostic-label">Model Architecture</span>
          <span className="diagnostic-value">ResNet-50</span>
          <span style={{ fontSize: "0.7rem", color: "var(--color-gray-500)", marginTop: "2px" }}>
            Transfer Learning (FC Head)
          </span>
        </div>
      </div>

      {/* Frame Breakdown Drawer */}
      <FrameInspector
        frameScores={result.frameScores}
        threshold={threshold}
      />

      {/* Model Disclaimer */}
      <div className="disclaimer-box">
        <Info size={18} color="var(--color-teal)" style={{ flexShrink: 0 }} />
        <p>
          <strong>Scientific Methodology & Limitations Note:</strong> The output score represents a
          probabilistic estimate generated by a transfer-learning visual classifier (ResNet-50 with
          frozen backbone). It is <em>not forensic proof of authenticity</em>. The model analyzes
          per-frame visual artifacts and can produce false positives on heavily compressed videos
          (e.g., messaging apps) or false negatives on generators beyond its training distribution.
        </p>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: "1px solid var(--color-gray-200)",
        }}
      >
        <button type="button" className="btn btn-outline" onClick={handleDownloadReport}>
          <Download size={15} />
          <span>Export Analysis Report (JSON)</span>
        </button>

        <button type="button" className="btn btn-primary" onClick={onReset}>
          <span>Analyze Another Video</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
