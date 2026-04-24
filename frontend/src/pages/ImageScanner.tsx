import React, { useState, useRef } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/analyze_image";

const ImageScanner = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const resetSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0, color: "#1e293b" }}>Surface Water Scanner</h2>
      </div>

      <p style={{ color: "#64748b", marginBottom: "20px" }}>
        Upload an image of a water body to detect visible plastic pollution.
      </p>

      {/* Main Single Column Workspace */}
      <div style={workspaceStyle}>
        
        {/* Section 1: Upload & Preview Area */}
        <div style={uploadAreaStyle}>
          {!preview ? (
            <div style={dropzoneStyle} onClick={() => fileInputRef.current?.click()}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>📸</div>
              <p style={{ margin: 0, fontWeight: "bold", color: "#3b82f6" }}>Click to upload image</p>
              <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>JPEG, PNG supported</p>
            </div>
          ) : (
            <div style={previewContainerStyle}>
              <img src={result ? result.annotated_image : preview} alt="Preview" style={imageStyle} />
              {isLoading && (
                <div style={loadingOverlayStyle}>
                  <div className="spinner" style={spinnerStyle}></div>
                  <p style={{color: 'white', marginTop: '10px'}}>AI is analyzing...</p>
                </div>
              )}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
        </div>

        {/* Section 2: Controls (Analysis Button) */}
        {!result && !isLoading && preview && (
          <div style={buttonGroupStyle}>
            <button onClick={handleAnalyze} style={analyzeBtnStyle}>
              ✨ Start AI Analysis
            </button>
            <button onClick={resetSelection} style={cancelBtnStyle}>
              Cancel
            </button>
          </div>
        )}

        {/* Section 3: Error Display */}
        {error && (
          <div style={errorStyle}>
            ⚠️ {error}
          </div>
        )}

        {/* Section 4: Analysis Results (Now appearing below image) */}
        {result && (
          <div style={resultsCardStyle}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: '15px'}}>
               <h3 style={{ margin: 0 }}>Analysis Results</h3>
               <button onClick={resetSelection} style={scanAnotherStyle}>Scan Another</button>
            </div>

            <div style={gridStatsStyle}>
              <div style={statBoxStyle}>
                <span style={statLabelStyle}>Pollution Level</span>
                <span style={{
                  ...statValueStyle,
                  color: result.pollution_level === "Safe" ? "#10b981" :
                         result.pollution_level === "Moderate" ? "#f59e0b" : "#ef4444"
                }}>
                  {result.pollution_level}
                </span>
              </div>

              <div style={statBoxStyle}>
                <span style={statLabelStyle}>Plastics Detected</span>
                <span style={statValueStyle}>{result.plastic_count}</span>
              </div>

              <div style={statBoxStyle}>
                <span style={statLabelStyle}>Severity Score</span>
                <span style={statValueStyle}>{result.severity_score}/100</span>
              </div>
            </div>

            {result.log_id && (
              <div style={successLogStyle}>
                <span style={{ fontSize: "20px" }}>✅</span>
                <div>
                  <h4 style={{ margin: 0, color: "#166534", fontSize: "14px" }}>Logged to Central Database</h4>
                  <p style={{ margin: 0, color: "#15803d", fontSize: "12px" }}>AI Pollution Scan ID: #{result.log_id}</p>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

// --- Updated Styles for Vertical Alignment ---
const containerStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  border: "1px solid #e2e8f0",
};

const headerStyle: React.CSSProperties = {
  marginBottom: "10px",
};

const workspaceStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const uploadAreaStyle: React.CSSProperties = {
  width: "100%",
};

const dropzoneStyle: React.CSSProperties = {
  border: "2px dashed #cbd5e1",
  borderRadius: "12px",
  padding: "40px 20px",
  textAlign: "center",
  cursor: "pointer",
  backgroundColor: "#f8fafc",
};

const previewContainerStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  borderRadius: "12px",
  overflow: "hidden",
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const imageStyle: React.CSSProperties = {
  width: "100%",
  height: "auto",
  maxHeight: "400px",
  objectFit: "contain",
  display: "block",
};

const loadingOverlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(15, 23, 42, 0.7)",
  display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
  backdropFilter: "blur(4px)"
};

const buttonGroupStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
};

const analyzeBtnStyle: React.CSSProperties = {
  flex: 2,
  padding: "12px",
  backgroundColor: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
};

const cancelBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: "12px",
  backgroundColor: "#f1f5f9",
  color: "#64748b",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const resultsCardStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "20px",
};

const gridStatsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "15px",
  marginBottom: "15px",
};

const statBoxStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  textAlign: "center",
};

const statLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  color: "#64748b",
  marginBottom: "4px",
};

const statValueStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
};

const successLogStyle: React.CSSProperties = {
  backgroundColor: "#dcfce7",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #bbf7d0",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const datasetInfoStyle: React.CSSProperties = {
  marginTop: "15px",
  fontSize: "12px",
  color: "#64748b",
};

const scanAnotherStyle: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: "12px",
  backgroundColor: "#e2e8f0",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  backgroundColor: "#fee2e2",
  color: "#b91c1c",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #fecaca",
};

const spinnerStyle: React.CSSProperties = {
  width: "30px", height: "30px",
  border: "3px solid rgba(255,255,255,0.3)",
  borderTop: "3px solid #fff",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
};

export default ImageScanner;