import React from "react";
import { ShieldCheck } from "lucide-react";

export function Header({ mode, onToggleMode, isLiveOnline, user, onSignOut }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand-wrapper">
          <div className="brand-icon-box" aria-hidden="true">
            <ShieldCheck size={22} strokeWidth={2.2} />
          </div>
          <div className="brand-title-group">
            <h1>
              AI Video Authenticity
              <span className="tag-badge" style={{ fontSize: "0.7rem", backgroundColor: "var(--color-ivory-dark)" }}>
                v1.0 ResNet-50
              </span>
            </h1>
            <p>Transfer learning classifier for real vs. AI-generated video detection</p>
          </div>
        </div>

        <div className="header-actions">
          {user ? <div className="signed-in-user"><span className="signed-in-avatar">{(user.name || user.email || "U").slice(0, 1).toUpperCase()}</span><span className="signed-in-email">{user.email}</span><button type="button" onClick={onSignOut}>Sign out</button></div> : <a className="header-signin" href="#account">Sign in <span>↗</span></a>}

          {/* Mode Switcher is available after sign-in */}
          {user && <button
            type="button"
            className="mode-badge"
            onClick={onToggleMode}
            title="Click to toggle between Mock Simulator and Live Python API"
            aria-label={`Current data source: ${mode === "live" ? "Live Backend" : "Simulator Mode"}. Click to switch.`}
          >
            <span
              className="mode-dot"
              style={{
                backgroundColor:
                  mode === "live"
                    ? isLiveOnline
                      ? "var(--color-teal)"
                      : "#E05A47"
                    : "var(--color-teal)",
              }}
            />
            <span>
              {mode === "live"
                ? isLiveOnline
                  ? "Live Backend (Connected)"
                  : "Live Backend (Offline)"
                : "Simulator Mode (Active)"}
            </span>
          </button>}
        </div>
      </div>
    </header>
  );
}
