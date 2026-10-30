import React from "react";
import { Activity, AlertTriangle, Cpu, Database, ScanLine } from "lucide-react";

const TEST_METRICS = [
  { value: "95.7%", label: "Test accuracy", detail: "461 held-out videos" },
  { value: "97.8%", label: "Balanced accuracy", detail: "Accounts for class imbalance" },
  { value: "0.751", label: "Macro F1", detail: "Both classes weighted equally" },
  { value: "0.997", label: "ROC-AUC", detail: "Only 11 REAL test videos" },
];

export function ModelOverview() {
  return (
    <section className="model-overview" aria-labelledby="model-overview-title">
      <div className="overview-heading">
        <div>
          <p className="overview-kicker"><Activity size={14} /> RESEARCH SNAPSHOT</p>
          <h2 id="model-overview-title">Inside the detector</h2>
          <p className="overview-intro">A frame-based pilot model. These numbers describe one small held-out evaluation, not guaranteed performance on new generators or cameras.</p>
        </div>
        <div className="overview-model-badge"><Cpu size={17} /><span>ResNet-50<br /><small>ImageNet transfer learning</small></span></div>
      </div>

      <div className="metric-grid">
        {TEST_METRICS.map((metric, index) => (
          <article key={metric.label} className={`metric-card metric-card-${index + 1}`}>
            <span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.detail}</small>
          </article>
        ))}
      </div>

      <div className="research-context-grid">
        <article className="context-card dataset-card">
          <div className="context-heading"><Database size={18} /><h3>Dataset at a glance</h3></div>
          <div className="dataset-counts">
            <div><strong>3,000</strong><span>AI-video candidates</span></div>
            <div><strong>59</strong><span>usable REAL videos</span></div>
            <div><strong>15</strong><span>REAL source groups</span></div>
          </div>
          <p>Generated clips are organized under Moonvalley, NeverEnds, and Pika folders. Related REAL clips are kept together during splitting to reduce source leakage.</p>
        </article>
        <article className="context-card pipeline-card">
          <div className="context-heading"><ScanLine size={18} /><h3>How a clip is scored</h3></div>
          <ol className="pipeline-list">
            <li><span>01</span><div><b>Sample frames</b><small>Up to 12 frames, about one per second</small></div></li>
            <li><span>02</span><div><b>Inspect visual features</b><small>224 × 224 inputs through ResNet-50</small></div></li>
            <li><span>03</span><div><b>Aggregate scores</b><small>Mean score compared with 0.6288 cutoff</small></div></li>
          </ol>
        </article>
      </div>

      <div className="research-caveat" role="note">
        <AlertTriangle size={18} />
        <p><strong>Read the results carefully.</strong> The test set has only 11 REAL videos from 3 source groups; REAL precision was 35.5%, so many camera videos may be flagged as AI. The AI label mapping still needs confirmation from the original dataset documentation.</p>
      </div>
    </section>
  );
}
