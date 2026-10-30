import React from "react";
import { InView } from "@/components/core/in-view";
import { Eye, Cpu, Scale, Lock, Sparkles } from "lucide-react";

export function HowItWorks() {
  return (
    <section id="methodology" style={{ marginTop: "48px", scrollMarginTop: "100px" }} aria-labelledby="how-it-works-heading">
      <div className="card-title-group" style={{ marginBottom: "20px" }}>
        <div className="hero-pill" style={{ marginBottom: "8px" }}>
          <Sparkles size={13} />
          <span>Pipeline Architecture</span>
        </div>
        <h2 id="how-it-works-heading" style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--color-navy)" }}>
          Technical Methodology & Pipeline Architecture
        </h2>
        <p style={{ fontSize: "0.88rem", color: "var(--color-gray-500)", marginTop: "4px" }}>
          How transfer learning analyzes visual frames to evaluate video authenticity
        </p>
      </div>

      {/* 3 Step Cards with InView scroll reveal */}
      <div className="how-it-works-grid">
        {/* Step 1 */}
        <InView
          variants={{
            hidden: { opacity: 0, y: 30, scale: 0.95, filter: "blur(4px)" },
            visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          viewOptions={{ once: false, margin: "0px 0px -40px 0px" }}
        >
          <div className="step-card" style={{ height: "100%" }}>
            <div className="step-card-num">1</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Eye size={18} color="var(--color-teal)" />
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-navy)" }}>
                Temporal Frame Sampling
              </h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", lineHeight: "1.5" }}>
              The video stream is parsed via OpenCV. Up to 12 unique visual frames are sampled
              approximately once per second. Each frame is resized to 224x224 maintaining native aspect
              ratio with letterbox border padding to preserve pixel relationships.
            </p>
          </div>
        </InView>

        {/* Step 2 */}
        <InView
          variants={{
            hidden: { opacity: 0, x: 40, filter: "blur(4px)" },
            visible: { opacity: 1, x: 0, filter: "blur(0px)" },
          }}
          transition={{ duration: 0.4, ease: "easeInOut", delay: 0.1 }}
          viewOptions={{ once: false, margin: "0px 0px -40px 0px" }}
        >
          <div className="step-card" style={{ height: "100%" }}>
            <div className="step-card-num">2</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Cpu size={18} color="var(--color-teal)" />
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-navy)" }}>
                ResNet-50 Feature Extraction
              </h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", lineHeight: "1.5" }}>
              Frames pass through an ImageNet-pretrained ResNet-50 backbone with frozen convolutional
              weights and locked BatchNorm running statistics. A specialized linear classifier evaluates
              high-frequency texture, gradient jitter, and generative diffusion artifacts.
            </p>
          </div>
        </InView>

        {/* Step 3 */}
        <InView
          variants={{
            hidden: { opacity: 0, scale: 1.15, filter: "blur(4px)" },
            visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
          }}
          transition={{ duration: 0.4, ease: "easeInOut", delay: 0.2 }}
          viewOptions={{ once: false, margin: "0px 0px -40px 0px" }}
        >
          <div className="step-card" style={{ height: "100%" }}>
            <div className="step-card-num">3</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Scale size={18} color="var(--color-teal)" />
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-navy)" }}>
                Calibrated Decision Threshold
              </h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", lineHeight: "1.5" }}>
              Individual frame softmax probabilities are pooled across the video duration using mean or
              median aggregation. The video is classified as AI_GENERATED if the score meets or exceeds
              the validation-calibrated cutoff of <strong>0.6288</strong> (maximizing macro F1).
            </p>
          </div>
        </InView>
      </div>

      {/* Privacy Guarantee Banner */}
      <InView
        variants={{
          hidden: { opacity: 0, y: 25, scale: 0.98 },
          visible: { opacity: 1, y: 0, scale: 1 },
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        viewOptions={{ once: false, margin: "0px 0px -40px 0px" }}
      >
        <div className="privacy-banner" role="region" aria-label="Privacy & Security Assurance">
          <div className="privacy-icon-box" aria-hidden="true">
            <Lock size={24} />
          </div>
          <div className="privacy-text">
            <h4>Privacy & Local Processing Guarantee</h4>
            <p>
              All video analysis is executed strictly on your local machine or designated private
              server. Video frames, temporary extraction caches, and metadata are never uploaded to
              commercial public clouds or used to train third-party AI models. Temporary frames are
              isolated in memory or safe local cache directories.
            </p>
          </div>
        </div>
      </InView>
    </section>
  );
}
export default HowItWorks;
