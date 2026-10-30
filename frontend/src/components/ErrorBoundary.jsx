import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Dashboard error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem("ai_video_analysis_history");
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "var(--color-ivory, #F7F5F0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "520px",
              width: "100%",
              padding: "32px",
              textAlign: "center",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              boxShadow: "0 10px 25px rgba(20, 33, 61, 0.08)",
              border: "1px solid #E2E8F0",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#FDF3EC",
                color: "#963E1B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
              }}
            >
              <AlertCircle size={26} />
            </div>

            <h2 style={{ fontSize: "1.25rem", color: "#14213D", marginBottom: "8px" }}>
              Dashboard View Recovered
            </h2>
            <p style={{ fontSize: "0.88rem", color: "#64748B", marginBottom: "20px", lineHeight: "1.5" }}>
              An unexpected render issue was safely intercepted:
              <br />
              <code
                style={{
                  display: "inline-block",
                  marginTop: "6px",
                  fontSize: "0.78rem",
                  padding: "4px 8px",
                  backgroundColor: "#F1F5F9",
                  borderRadius: "4px",
                  color: "#1E293B",
                }}
              >
                {this.state.error?.message || "Render error"}
              </code>
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={this.handleReset}
              style={{
                backgroundColor: "#0F8B8D",
                color: "#FFFFFF",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <RotateCcw size={16} />
              <span>Reload Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
