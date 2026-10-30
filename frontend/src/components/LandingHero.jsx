import React from "react";
import { Activity, ArrowDown, ArrowRight, ScanLine, ShieldCheck, Sparkles } from "lucide-react";

export function LandingHero({ isLiveOnline, isAuthenticated }) {
  const goToAnalyzer = () => document.getElementById(isAuthenticated ? "analyzer" : "account")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="landing-hero" aria-labelledby="landing-title">
      <div className="landing-grid-glow" aria-hidden="true" />
      <div className="landing-copy">
        <div className="landing-eyebrow"><span className="eyebrow-pulse" /> VIDEO FORENSICS, REIMAGINED</div>
        <h2 id="landing-title">See beyond<br />the <span>frame.</span></h2>
        <p className="landing-lede">A smarter first look at video authenticity. Scan visual frames for patterns associated with camera footage and AI-generated video.</p>
        <div className="landing-actions">
          <button type="button" className="landing-cta" onClick={goToAnalyzer}><ScanLine size={18} /> {isAuthenticated ? "Analyze a video" : "Sign in to analyze"} <ArrowRight size={17} /></button>
          <a className="landing-secondary" href="#methodology">How it works <ArrowDown size={15} /></a>
        </div>
        <div className="landing-proof-row">
          <span><ShieldCheck size={16} /> Frame-by-frame analysis</span>
          <span><Activity size={16} /> Live model status <i className={isLiveOnline ? "online" : "offline"} /></span>
        </div>
        <p className="landing-caveat">Research model · results are estimates, not forensic proof</p>
      </div>

      <div className="landing-visual" aria-label="Illustration of video frames being scanned by an AI model">
        <div className="visual-orbit orbit-a" /><div className="visual-orbit orbit-b" />
        <div className="visual-label visual-label-top"><Sparkles size={13} /> SIGNAL ANALYSIS <span>LIVE</span></div>
        <div className="visual-screen">
          <div className="screen-topline"><span>FRAME SEQUENCE</span><span>00:04.28 <b>●</b></span></div>
          <div className="abstract-scene">
            <div className="scene-sun" /><div className="scene-horizon" /><div className="scene-mountain mountain-back" /><div className="scene-mountain mountain-front" />
            <div className="scene-scanline" /><div className="scene-crosshair crosshair-one" /><div className="scene-crosshair crosshair-two" />
            <div className="scene-corner corner-tl" /><div className="scene-corner corner-tr" /><div className="scene-corner corner-bl" /><div className="scene-corner corner-br" />
          </div>
          <div className="visual-timeline"><span className="timeline-play">▶</span><div className="timeline-track">{Array.from({ length: 26 }, (_, i) => <i key={i} style={{ "--height": `${8 + ((i * 13) % 22)}px`, "--delay": `${i * -0.08}s` }} />)}</div><span>04:28</span></div>
          <div className="visual-readout"><div><small>FRAMES SAMPLED</small><strong>12 <em>frames</em></strong></div><div><small>MODEL</small><strong>ResNet<span>50</span></strong></div><div><small>STATUS</small><strong className={isLiveOnline ? "status-online" : "status-offline"}>{isLiveOnline ? "READY" : "OFFLINE"}</strong></div></div>
        </div>
        <div className="visual-label visual-label-bottom"><span className="readout-dot" /> VISUAL SIGNAL DETECTED <b>0.84</b></div>
        <div className="visual-side-note">AI VIDEO DETECTION<br /><span>FRAME 08 / 12</span></div>
      </div>
      <div className="landing-scroll-hint" aria-hidden="true"><span /> SCROLL TO BEGIN</div>
    </section>
  );
}
