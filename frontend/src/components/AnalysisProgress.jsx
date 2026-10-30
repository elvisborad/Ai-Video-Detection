import React from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

export function AnalysisProgress({ progress, stageText }) {
  const steps = [
    { label: "Stream Validation", threshold: 20 },
    { label: "Temporal Sampling", threshold: 45 },
    { label: "ResNet-50 Forward", threshold: 75 },
    { label: "Threshold Pooling", threshold: 95 },
  ];

  return (
    <div className="card progress-card" style={{ marginBottom: "32px" }}>
      <div className="progress-spinner" aria-hidden="true" />
      <div className="scan-visual" aria-hidden="true">
        <div className="scan-frame-grid">{Array.from({ length: 8 }, (_, i) => <span key={i} className={progress >= (i + 1) * 12 ? "scanned" : ""}><i /></span>)}</div>
        <div className="scan-beam" />
      </div>
      <h3 className="progress-title">Analyzing Video Authenticity</h3>
      <p className="progress-stage-text">{stageText || "Initializing transfer learning pipeline..."}</p>

      {/* Progress Track */}
      <div className="progress-bar-track" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", fontWeight: 600 }}>
        {progress}% completed
      </div>

      {/* Step Indicators */}
      <div className="progress-steps-list">
        {steps.map((step, idx) => {
          const isDone = progress >= step.threshold;
          const isCurrent = progress < step.threshold && (idx === 0 || progress >= steps[idx - 1].threshold);

          return (
            <div
              key={step.label}
              className={`step-item ${isCurrent || isDone ? "active" : ""}`}
            >
              {isDone ? (
                <CheckCircle2 size={14} color="var(--color-teal)" />
              ) : (
                <div
                  className="step-indicator-dot"
                  style={{
                    backgroundColor: isCurrent ? "var(--color-teal)" : undefined,
                  }}
                />
              )}
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
