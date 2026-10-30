import React from "react";
import { ShieldCheck, BookOpen, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "var(--color-navy)", marginBottom: "4px" }}>
            <ShieldCheck size={18} color="var(--color-teal)" />
            <span>AI Video Authenticity Detection System</span>
          </div>
          <p style={{ maxWidth: "560px", lineHeight: "1.4" }}>
            Research project evaluating ResNet-50 visual transfer learning for distinguishing real
            camera recordings from AI-generated video models. Models yield probabilistic confidence estimates.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.8rem" }}>
          <div>
            <strong>Architecture:</strong> ResNet-50 (ImageNet Pretrained)
          </div>
          <div>
            <strong>Calibrated Decision Cutoff:</strong> 0.6288 (Macro F1)
          </div>
          <div style={{ color: "var(--color-gray-400)" }}>
            © 2026 Academic & Research Deployment
          </div>
        </div>
      </div>
    </footer>
  );
}
