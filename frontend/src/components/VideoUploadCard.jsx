import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileVideo,
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { DEMO_PRESETS } from "../services/mockData";

const ACCEPTED_EXTENSIONS = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".mpeg", ".mpg"];
const MAX_FILE_SIZE_BYTES = 250 * 1024 * 1024; // 250 MB

export function VideoUploadCard({
  selectedVideo,
  onSelectVideo,
  onClearVideo,
  onAnalyze,
  isAnalyzing,
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [options, setOptions] = useState({
    interval: 1.0,
    maxFrames: 12,
    aggregation: "mean",
  });
  const [showOptions, setShowOptions] = useState(false);

  const fileInputRef = useRef(null);

  // Validate and load a chosen file
  const handleProcessFile = (file) => {
    setErrorMessage("");
    if (!file) return;

    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setErrorMessage(
        `Unsupported video format "${ext}". Please upload an MP4, MOV, AVI, MKV, WEBM, or MPEG video file.`
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(
        `File size exceeds 250 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a shorter video clip.`
      );
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    onSelectVideo({
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      type: file.type || "video/" + ext.replace(".", ""),
      videoSrc: objectUrl,
      isPreset: false,
    });
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectPreset = (preset) => {
    setErrorMessage("");
    onSelectVideo({
      ...preset,
      isPreset: true,
    });
  };

  return (
    <div id="analyzer" className="card analyzer-card" style={{ marginBottom: "32px" }}>
      <div className="card-header">
        <div className="card-title-group">
          <h2>Video Frame Analysis</h2>
          <p>Upload a video clip or pick a sample to evaluate visual authenticity indicators</p>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div
          className="disclaimer-box"
          style={{
            borderColor: "var(--result-ai-border)",
            borderLeftColor: "var(--result-ai-text)",
            backgroundColor: "var(--result-ai-bg)",
            marginBottom: "20px",
            color: "var(--result-ai-text)",
          }}
          role="alert"
        >
          <AlertCircle size={18} />
          <p style={{ color: "var(--result-ai-text)", fontWeight: 500 }}>{errorMessage}</p>
        </div>
      )}

      {/* Upload Zone (when no video is selected) */}
      {!selectedVideo ? (
        <>
          <div
            className={`dropzone ${isDragActive ? "drag-active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload video by drag and drop or browsing"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleProcessFile(e.target.files[0])}
              accept=".mp4,.mov,.avi,.mkv,.webm,.mpeg,.mpg"
              style={{ display: "none" }}
            />
            <div className="dropzone-icon-box">
              <UploadCloud size={28} />
              <span className="upload-orbit upload-orbit-one" />
              <span className="upload-orbit upload-orbit-two" />
            </div>
            <div className="signal-readout" aria-hidden="true"><span /> SIGNAL READY <i>●</i></div>
            <h3 className="dropzone-title">Drop your video here, or browse files</h3>
            <p className="dropzone-text">
              Supports MP4, MOV, AVI, MKV, WEBM, and MPEG formats up to 250 MB.
              Temporal frames are sampled at 1.0s intervals for ResNet-50 feature analysis.
            </p>
            <div className="signal-wave" aria-hidden="true">{Array.from({ length: 32 }, (_, i) => <span key={i} style={{ "--bar": `${12 + ((i * 17) % 30)}px`, "--delay": `${(i % 8) * -0.13}s` }} />)}</div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <FileVideo size={16} />
              <span>Browse Video File</span>
            </button>
          </div>

          {/* Quick Sample Presets */}
          <div className="preset-container">
            <div className="preset-header">
              <span>Or test with a pre-configured sample clip:</span>
            </div>
            <div className="preset-grid">
              {DEMO_PRESETS.map((preset) => (
                <article key={preset.id} className="preset-card">
                  <video
                    className="preset-video"
                    src={preset.videoSrc}
                    controls
                    playsInline
                    preload="none"
                    aria-label={`Preview ${preset.name}`}
                  >
                    Your browser does not support the video preview.
                  </video>
                  <div className="preset-card-body">
                    <div className="preset-icon">
                      <Sparkles size={16} />
                    </div>
                    <div className="preset-info">
                      <h4>{preset.name}</h4>
                      <p>{preset.description}</p>
                      <div style={{ marginTop: "6px" }}>
                        <span className="tag-badge">{preset.filename}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary preset-use-button"
                    onClick={() => handleSelectPreset(preset)}
                  >
                    <Play size={15} />
                    <span>Use sample clip</span>
                  </button>
                </article>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Video Selected & Preview State */
        <div className="preview-grid">
          {/* Left: Video Player */}
          <div className="video-frame-box">
            <video
              className="video-player"
              src={selectedVideo.videoSrc}
              controls
              playsInline
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Right: Metadata & Controls */}
          <div className="file-meta-panel">
            <div>
              <div className="file-meta-header">
                <span className="tag-badge" style={{ marginBottom: "6px", display: "inline-block" }}>
                  {selectedVideo.isPreset ? "Demo Sample Preset" : "User Uploaded Video"}
                </span>
                <h3 className="file-name-text">{selectedVideo.name || selectedVideo.filename}</h3>
                <div className="file-tags">
                  {selectedVideo.size && <span className="tag-badge">Size: {selectedVideo.size}</span>}
                  {selectedVideo.duration && (
                    <span className="tag-badge">Duration: {selectedVideo.duration}</span>
                  )}
                  <span className="tag-badge">Format: {selectedVideo.type}</span>
                </div>
              </div>

              {/* Advanced Extraction Options Toggle */}
              <div style={{ marginTop: "14px" }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowOptions(!showOptions)}
                  style={{ padding: "4px 0", fontSize: "0.78rem" }}
                >
                  <Sliders size={14} />
                  <span>{showOptions ? "Hide Extraction Settings" : "Configure Frame Sampling"}</span>
                </button>

                {showOptions && (
                  <div className="options-group" style={{ marginTop: "8px" }}>
                    <div className="options-title">
                      <span>Inference Parameters</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--color-teal-text)" }}>
                        Config defaults
                      </span>
                    </div>
                    <div className="options-grid">
                      <div className="option-field">
                        <label htmlFor="sampling-interval">Interval (seconds)</label>
                        <select
                          id="sampling-interval"
                          value={options.interval}
                          onChange={(e) =>
                            setOptions({ ...options, interval: parseFloat(e.target.value) })
                          }
                        >
                          <option value="0.5">0.5s (High density)</option>
                          <option value="1.0">1.0s (Recommended)</option>
                          <option value="2.0">2.0s (Fast preview)</option>
                        </select>
                      </div>

                      <div className="option-field">
                        <label htmlFor="max-frames">Max Sampled Frames</label>
                        <select
                          id="max-frames"
                          value={options.maxFrames}
                          onChange={(e) =>
                            setOptions({ ...options, maxFrames: parseInt(e.target.value, 10) })
                          }
                        >
                          <option value="6">6 frames</option>
                          <option value="12">12 frames (Default)</option>
                          <option value="18">18 frames</option>
                        </select>
                      </div>

                      <div className="option-field" style={{ gridColumn: "span 2" }}>
                        <label htmlFor="aggregation-method">Score Aggregation Method</label>
                        <select
                          id="aggregation-method"
                          value={options.aggregation}
                          onChange={(e) =>
                            setOptions({ ...options, aggregation: e.target.value })
                          }
                        >
                          <option value="mean">Mean frame softmax (Default)</option>
                          <option value="median">Median frame softmax</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => onAnalyze(selectedVideo, options)}
                disabled={isAnalyzing}
              >
                <Sparkles size={16} />
                <span>{isAnalyzing ? "Analyzing Video..." : "Analyze Video"}</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClearVideo}
                disabled={isAnalyzing}
                title="Remove video and choose another"
              >
                <RotateCcw size={15} />
                <span>Change</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
