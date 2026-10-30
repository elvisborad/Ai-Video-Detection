import React, { useState } from "react";
import { ChevronDown, ChevronUp, Image, Layers } from "lucide-react";

export function FrameInspector({ frameScores, threshold = 0.6288 }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!frameScores || frameScores.length === 0) return null;

  return (
    <div className="frame-drawer">
      <button
        type="button"
        className="btn btn-ghost"
        style={{ width: "100%", justifyContent: "space-between", padding: "8px 0" }}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Layers size={16} color="var(--color-teal)" />
          <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--color-navy)" }}>
            Inspect Sampled Frame Breakdown ({frameScores.length} frames)
          </span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="frame-grid">
          {frameScores.map((frame) => {
            const isAI = frame.score >= threshold;
            return (
              <div key={frame.frameIndex} className="frame-card">
                <div className="frame-thumb-box">
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <Image size={18} />
                    <span>#{frame.frameIndex} ({frame.timestamp})</span>
                  </div>
                </div>

                <div className={`frame-score-tag ${isAI ? "ai" : "real"}`}>
                  {(frame.score * 100).toFixed(1)}% AI
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-gray-500)", marginTop: "2px" }}>
                  {isAI ? "AI Signature" : "Natural Pattern"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
