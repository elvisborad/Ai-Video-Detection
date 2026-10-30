import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { VideoUploadCard } from "./components/VideoUploadCard";
import { AnalysisProgress } from "./components/AnalysisProgress";
import { ResultCard } from "./components/ResultCard";
import { HowItWorks } from "./components/HowItWorks";
import { Footer } from "./components/Footer";
import { LandingHero } from "./components/LandingHero";
import { ScrollReveal } from "./components/ScrollReveal";
import { GoogleSignIn } from "./components/GoogleSignIn";
import { ModelOverview } from "./components/ModelOverview";
import { WorkspaceHome } from "./components/WorkspaceHome";
import { apiService } from "./services/apiAdapter";
import { AlertCircle } from "lucide-react";

export function App() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [currentResult, setCurrentResult] = useState(null);
  const [mode, setMode] = useState("live"); // 'live' by default with fallback to 'mock'
  const [isLiveOnline, setIsLiveOnline] = useState(true);
  const [apiUrl, setApiUrl] = useState("http://localhost:8000");
  const [authSession, setAuthSession] = useState(null);

  const handleGoogleAuthenticated = useCallback(({ token, user }) => {
    apiService.setAuthToken(token);
    setAuthSession({ token, user });
  }, []);

  // Google sign-in sits near the end of the public page. The browser keeps its
  // scroll position when the authenticated workspace replaces that page.
  useEffect(() => {
    if (!authSession) return undefined;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [authSession]);

  const handleSignOut = () => {
    apiService.setAuthToken("");
    window.google?.accounts?.id?.disableAutoSelect?.();
    setAuthSession(null);
    handleClearVideo();
  };

  // Check backend health when mode is 'live'
  useEffect(() => {
    let isMounted = true;
    const checkLiveHealth = async () => {
      apiService.setMode(mode);
      apiService.setBaseUrl(apiUrl);
      if (mode === "live") {
        const health = await apiService.checkHealth();
        if (isMounted) setIsLiveOnline(health.online);
      } else {
        if (isMounted) setIsLiveOnline(true);
      }
    };
    checkLiveHealth();
    const interval = setInterval(checkLiveHealth, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [mode, apiUrl]);

  const handleToggleMode = () => {
    const nextMode = mode === "mock" ? "live" : "mock";
    setMode(nextMode);
    apiService.setMode(nextMode);
  };

  const handleSelectVideo = (videoObj) => {
    setSelectedVideo(videoObj);
    setCurrentResult(null);
    setAnalysisError("");
  };

  const handleClearVideo = () => {
    setSelectedVideo(null);
    setCurrentResult(null);
    setAnalysisError("");
    setProgress(0);
  };

  const handleAnalyze = async (videoItem, options) => {
    setIsAnalyzing(true);
    setProgress(5);
    setStageText("Initializing video evaluation...");
    setAnalysisError("");
    setCurrentResult(null);

    try {
      const result = await apiService.analyzeVideo(
        videoItem,
        options,
        (pct, stage) => {
          setProgress(pct);
          setStageText(stage);
        }
      );

      setCurrentResult(result);
    } catch (err) {
      setAnalysisError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app-container">
      <Header
        mode={mode}
        onToggleMode={handleToggleMode}
        isLiveOnline={isLiveOnline}
        user={authSession?.user}
        onSignOut={handleSignOut}
      />

      <main className="main-content">
        {!authSession ? (
          <>
            <LandingHero isLiveOnline={isLiveOnline} isAuthenticated={false} />
            <ScrollReveal delay={50}><ModelOverview /></ScrollReveal>
            <ScrollReveal delay={80}><HowItWorks /></ScrollReveal>
            <ScrollReveal><GoogleSignIn onAuthenticated={handleGoogleAuthenticated} /></ScrollReveal>
          </>
        ) : (
          <>
            <WorkspaceHome user={authSession.user} isLiveOnline={isLiveOnline} />

        {/* Global Error Banner */}
        {analysisError && (
          <div
            className="disclaimer-box"
            style={{
              borderColor: "var(--result-ai-border)",
              borderLeftColor: "var(--result-ai-text)",
              backgroundColor: "var(--result-ai-bg)",
              marginBottom: "24px",
            }}
            role="alert"
          >
            <AlertCircle size={20} color="var(--result-ai-text)" />
            <div>
              <strong style={{ color: "var(--result-ai-text)", display: "block", marginBottom: "2px" }}>
                Analysis Failed
              </strong>
              <p style={{ color: "var(--result-ai-text)" }}>{analysisError}</p>
            </div>
          </div>
        )}

        {/* Video Upload & Preview Component */}
        <ScrollReveal>
          <VideoUploadCard
            selectedVideo={selectedVideo}
            onSelectVideo={handleSelectVideo}
            onClearVideo={handleClearVideo}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </ScrollReveal>

        {/* Analysis Progress Loading State */}
        {isAnalyzing && (
          <ScrollReveal><AnalysisProgress progress={progress} stageText={stageText} /></ScrollReveal>
        )}

        {/* Result Card */}
        {currentResult && !isAnalyzing && (
          <ScrollReveal><ResultCard result={currentResult} onReset={handleClearVideo} /></ScrollReveal>
        )}
          </>
        )}
      </main>

      <Footer />

    </div>
  );
}
export default App;
