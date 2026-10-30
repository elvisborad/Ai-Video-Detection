import React from "react";
import { ArrowDown, CheckCircle2, Cpu, ScanLine, ShieldCheck } from "lucide-react";

export function WorkspaceHome({ user, isLiveOnline }) {
  const goToAnalyzer = () => document.getElementById("analyzer")?.scrollIntoView({ behavior: "smooth" });
  return (
    <section className="workspace-hero" aria-labelledby="workspace-title">
      <div className="workspace-hero-grid" aria-hidden="true" />
      <div className="workspace-hero-main">
        <div className="workspace-eyebrow"><span /> SECURE ANALYSIS WORKSPACE</div>
        <p className="workspace-greeting">Welcome back, {user.name?.split(" ")[0] || "Researcher"}</p>
        <h2 id="workspace-title">Ready to inspect<br /><span>your next video?</span></h2>
        <p className="workspace-description">Upload a clip to sample frames and review its model score. Every result includes the threshold and a reminder of the detector’s research limitations.</p>
        <button className="workspace-cta" type="button" onClick={goToAnalyzer}><ScanLine size={17} /> Open video analyzer <ArrowDown size={16} /></button>
      </div>
      <div className="workspace-status-panel">
        <div className="workspace-status-heading"><ShieldCheck size={18} /><span>SESSION ACTIVE</span><CheckCircle2 size={17} /></div>
        <p className="workspace-user-email">{user.email}</p>
        <div className="workspace-divider" />
        <div className="workspace-system-row"><span><Cpu size={15} /> Detection model</span><b>ResNet-50</b></div>
        <div className="workspace-system-row"><span>Inference service</span><b className={isLiveOnline ? "service-online" : "service-offline"}><i />{isLiveOnline ? "Online" : "Offline"}</b></div>
        <div className="workspace-system-row"><span>Score threshold</span><b>0.6288</b></div>
        <small>Scores are model estimates, not forensic proof.</small>
      </div>
      <a className="workspace-about-link" href="#analyzer">Go to analyzer <ArrowDown size={14} /></a>
    </section>
  );
}
