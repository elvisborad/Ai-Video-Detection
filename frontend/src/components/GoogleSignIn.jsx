import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

const BUILD_GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export function GoogleSignIn({ onAuthenticated }) {
  const buttonRef = useRef(null);
  const onAuthenticatedRef = useRef(onAuthenticated);
  onAuthenticatedRef.current = onAuthenticated;
  const [googleClientId, setGoogleClientId] = useState(BUILD_GOOGLE_CLIENT_ID);
  const [configLoaded, setConfigLoaded] = useState(Boolean(BUILD_GOOGLE_CLIENT_ID));
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (BUILD_GOOGLE_CLIENT_ID) return undefined;
    let cancelled = false;
    fetch("/api/config")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Config unavailable")))
      .then((config) => { if (!cancelled) setGoogleClientId(config.google_client_id || ""); })
      .catch(() => { if (!cancelled) setGoogleClientId(""); })
      .finally(() => { if (!cancelled) setConfigLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!googleClientId || !buttonRef.current) return undefined;
    let cancelled = false;

    const initialize = () => {
      if (cancelled || !window.google?.accounts?.id || !buttonRef.current) return;
      window.__signalLabCredentialHandler = async ({ credential }) => {
          setError("");
          setIsVerifying(true);
          try {
            const response = await fetch("/api/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Google sign-in could not be verified.");
            onAuthenticatedRef.current({ token: credential, user: result.user });
          } catch (authError) {
            setError(authError.message || "Google sign-in failed. Please try again.");
          } finally {
            setIsVerifying(false);
          }
      };
      if (window.__signalLabGoogleClientId !== googleClientId) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => window.__signalLabCredentialHandler?.(response),
        });
        window.__signalLabGoogleClientId = googleClientId;
      }
      buttonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard", theme: "filled_black", size: "large", shape: "pill",
        text: "signin_with", logo_alignment: "left", width: 300,
      });
    };

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (window.google?.accounts?.id) initialize();
    else if (existingScript) existingScript.addEventListener("load", initialize, { once: true });
    else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initialize;
      script.onerror = () => setError("Could not load Google sign-in. Check your connection and try again.");
      document.head.appendChild(script);
    }

    return () => { cancelled = true; };
  }, [onAuthenticated, googleClientId]);

  return (
    <section id="account" className="auth-gate" aria-labelledby="auth-title">
      <div className="auth-gate-copy">
        <div className="auth-step-tag"><span>01</span> SECURE ACCESS <i /></div>
        <h2 id="auth-title">Enter the<br /><em>Signal Lab.</em></h2>
        <p>One Google sign-in opens your private video analysis workspace. New here? Continue with Google to create your account.</p>
        <div className="google-signin-wrap">
          <div className="google-signin-label"><ShieldCheck size={14} /> VERIFIED WITH GOOGLE</div>
          <div className="google-button-slot" ref={buttonRef} />
          {configLoaded && !googleClientId && <p className="auth-config-note">Google sign-in needs a Web OAuth client ID. Set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>frontend/.env.local</code> or <code>GOOGLE_CLIENT_ID</code> in the backend environment.</p>}
        </div>
        {isVerifying && <p className="auth-feedback" role="status">Verifying your Google account…</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <div className="auth-assurance"><span><i /> ID token verified</span><span><i /> Private workspace</span><span><i /> No password stored here</span></div>
      </div>
      <div className="auth-gate-side" aria-hidden="true">
        <div className="auth-visual-grid" />
        <div className="auth-visual-top"><span>AUTHENTICATION</span><b>01 / 01</b></div>
        <div className="auth-access-card">
          <div className="auth-orb"><ShieldCheck size={34} /></div>
          <div><strong>Identity secured</strong><small>Google account verification</small></div>
          <span className="auth-check">✓</span>
        </div>
        <div className="auth-frame-stack"><i /><i /><i /><div><span>FRAME ACCESS</span><b>READY</b></div></div>
        <div className="auth-visual-bottom"><span><i /> ENCRYPTED TOKEN</span><ArrowRight size={16} /><span>WORKSPACE</span></div>
      </div>
    </section>
  );
}
