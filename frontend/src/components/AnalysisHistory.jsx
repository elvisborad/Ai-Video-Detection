import React, { useState } from "react";
import {
  History,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  FileVideo,
} from "lucide-react";

export function AnalysisHistory({ history, onSelectHistoryItem, onClearHistory }) {
  const [filter, setFilter] = useState("all"); // 'all' | 'REAL' | 'AI_GENERATED'
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = history.filter((item) => {
    const matchesFilter = filter === "all" || item.result === filter;
    const matchesSearch =
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <section className="history-section" aria-labelledby="history-heading">
      <div className="card-header">
        <div className="card-title-group">
          <h2 id="history-heading" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <History size={20} color="var(--color-navy)" />
            <span>Recent Analysis History</span>
          </h2>
          <p>Logged video evaluations with frame-level scores and classification results</p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClearHistory}
            style={{ color: "var(--color-gray-500)" }}
            title="Clear all stored history records"
          >
            <Trash2 size={14} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilter("all")}
          >
            All ({history.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filter === "REAL" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilter("REAL")}
          >
            Real ({history.filter((h) => h.result === "REAL").length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filter === "AI_GENERATED" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilter("AI_GENERATED")}
          >
            AI Generated ({history.filter((h) => h.result === "AI_GENERATED").length})
          </button>
        </div>

        <div style={{ position: "relative", minWidth: "240px" }}>
          <Search
            size={15}
            color="var(--color-gray-400)"
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 12px 6px 32px",
              fontSize: "0.82rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-gray-300)",
              backgroundColor: "var(--color-white)",
            }}
          />
        </div>
      </div>

      {/* History Table */}
      {filteredHistory.length > 0 ? (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Video File</th>
                <th>Analyzed Date</th>
                <th>Classification</th>
                <th>Confidence Score</th>
                <th>Frames</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => {
                const score = Number(item.aiGeneratedScore ?? item.ai_generated_score ?? 0);
                const isAI = item.result === "AI_GENERATED";
                const percentage = (score * 100).toFixed(1);

                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <FileVideo size={16} color="var(--color-gray-500)" />
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--color-navy)" }}>
                            {item.filename}
                          </div>
                          {item.fileSize && (
                            <div style={{ fontSize: "0.72rem", color: "var(--color-gray-400)" }}>
                              {item.fileSize} {item.duration ? `• ${item.duration}` : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ color: "var(--color-gray-600)", whiteSpace: "nowrap" }}>
                      {item.analyzedAt}
                    </td>

                    <td>
                      <span className={`badge-sm ${isAI ? "ai" : "real"}`}>
                        {item.result}
                      </span>
                    </td>

                    <td>
                      <div>
                        <strong>{percentage}%</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginLeft: "4px" }}>
                          ({score.toFixed(4)})
                        </span>
                      </div>
                    </td>

                    <td>
                      <span style={{ color: "var(--color-gray-600)" }}>
                        {item.framesAnalyzed || 12}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => onSelectHistoryItem(item)}
                        title="View complete evaluation card"
                      >
                        <ExternalLink size={13} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "40px 20px",
            backgroundColor: "var(--color-white)",
            borderColor: "var(--color-gray-200)",
          }}
        >
          <FileVideo size={36} color="var(--color-gray-300)" style={{ margin: "0 auto 12px auto" }} />
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-navy)", marginBottom: "4px" }}>
            No analysis records found
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--color-gray-500)", maxWidth: "380px", margin: "0 auto" }}>
            {searchQuery || filter !== "all"
              ? "No records matched your search query or filter selection."
              : "Upload a video file or test one of the sample clips above to log results here."}
          </p>
        </div>
      )}
    </section>
  );
}
