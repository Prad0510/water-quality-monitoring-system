import { useState } from "react";
import API from "../api/api";
import SuccessModal from "./SuccessModal";

interface AddTestResultProps {
  onAdd: () => void;
}

const AddTestResult: React.FC<AddTestResultProps> = ({ onAdd }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newResultId, setNewResultId] = useState<number | null>(null);
  const [pollutionLogId, setPollutionLogId] = useState("");
  
  // AI State
  const [aiResult, setAiResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Kaggle Dataset variables
  const [sampleId, setSampleId] = useState("");
  const [ph, setPh] = useState("");
  const [hardness, setHardness] = useState("");
  const [solids, setSolids] = useState("");
  const [chloramines, setChloramines] = useState("");
  const [sulfate, setSulfate] = useState("");
  const [conductivity, setConductivity] = useState("");
  const [organicCarbon, setOrganicCarbon] = useState("");
  const [trihalomethanes, setTrihalomethanes] = useState("");
  const [turbidity, setTurbidity] = useState("");

  const [testDate, setTestDate] = useState("");
  const role = localStorage.getItem("role");
  const assignedRegion = localStorage.getItem("assigned_region") || "central";
  const [insertRegion, setInsertRegion] = useState(role === "lab_technician" ? assignedRegion : "central");

  const getFormData = () => {
    const data: any = {
      ph: ph ? parseFloat(ph) : null,
      Hardness: hardness ? parseFloat(hardness) : null,
      Solids: solids ? parseFloat(solids) : null,
      Chloramines: chloramines ? parseFloat(chloramines) : null,
      Sulfate: sulfate ? parseFloat(sulfate) : null,
      Conductivity: conductivity ? parseFloat(conductivity) : null,
      Organic_carbon: organicCarbon ? parseFloat(organicCarbon) : null,
      Trihalomethanes: trihalomethanes ? parseFloat(trihalomethanes) : null,
      Turbidity: turbidity ? parseFloat(turbidity) : null,
    };
    if (pollutionLogId) {
      data.pollution_log_id = parseInt(pollutionLogId);
    }
    return data;
  };

  const handleAIScan = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:5000/api/predict_potability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: getFormData() })
      });
      const result = await response.json();
      setAiResult(result); 
    } catch (error) {
      console.error("AI Prediction Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First, get the AI prediction to save along with the record
    await handleAIScan();

    const payload = {
      sample_id: sampleId,
      ...getFormData(),
      pollution_log_id: pollutionLogId ? parseInt(pollutionLogId) : null,
      test_date: testDate || null
    };

    try {
      const response = await API.post(`/testresults?region=${insertRegion}`, payload, {
        headers: {
          role: role || "",
          "assigned-region": assignedRegion
        }
      });

      if (response.status === 201) {
        setNewResultId(response.data.result_id);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Insert Error:", error);
      alert("Failed to create record.");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    onAdd();
    setSampleId(""); setPh(""); setHardness(""); setSolids(""); setChloramines("");
    setSulfate(""); setConductivity(""); setOrganicCarbon(""); setTrihalomethanes(""); setTurbidity("");
    setTestDate(""); setInsertRegion("central"); setPollutionLogId("");
    setAiResult(null);
  };

  return (
    <div className="card" style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
      <h4 style={{ marginBottom: '8px', fontSize: '1.2rem', color: '#1e293b' }}>Lab Analysis & AI Potability Predictor</h4>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
        Input chemical parameters. Our <strong>Recall-Optimized XGBoost Model</strong> will evaluate human potability safety.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={formGridStyle}>
          <input style={inputStyle} type="text" placeholder="Sample ID (Required)" value={sampleId} onChange={(e) => setSampleId(e.target.value)} required />
          <input style={inputStyle} type="datetime-local" value={testDate} onChange={(e) => setTestDate(e.target.value)} />

          <input style={inputStyle} type="number" placeholder="pH Level" value={ph} onChange={(e) => setPh(e.target.value)} step="0.01" />
          <input style={inputStyle} type="number" placeholder="Hardness (mg/L)" value={hardness} onChange={(e) => setHardness(e.target.value)} step="0.01" />
          <input style={inputStyle} type="number" placeholder="Solids (ppm)" value={solids} onChange={(e) => setSolids(e.target.value)} step="0.01" />
          <input style={inputStyle} type="number" placeholder="Chloramines (ppm)" value={chloramines} onChange={(e) => setChloramines(e.target.value)} step="0.01" />
          <input style={inputStyle} type="number" placeholder="Sulfate (mg/L)" value={sulfate} onChange={(e) => setSulfate(e.target.value)} step="0.01" />
          <input style={inputStyle} type="number" placeholder="Conductivity (μS/cm)" value={conductivity} onChange={(e) => setConductivity(e.target.value)} step="0.01" />
          <input style={inputStyle} type="number" placeholder="Organic Carbon (ppm)" value={organicCarbon} onChange={(e) => setOrganicCarbon(e.target.value)} step="0.01" />
          <input style={inputStyle} type="number" placeholder="Trihalomethanes (μg/L)" value={trihalomethanes} onChange={(e) => setTrihalomethanes(e.target.value)} step="0.01" />
          <input style={inputStyle} type="number" placeholder="Turbidity (NTU)" value={turbidity} onChange={(e) => setTurbidity(e.target.value)} step="0.01" />
          <input style={{...inputStyle, border: '2px solid #94a3b8', backgroundColor: '#f8fafc'}} type="number" placeholder="AI Image Scan ID (Optional)" value={pollutionLogId} onChange={(e) => setPollutionLogId(e.target.value)} />

          {role === "lab_technician" ? (
            <select value={insertRegion} disabled style={{ ...inputStyle, backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}>
              <option value={assignedRegion}>Locked to Lab {assignedRegion}</option>
            </select>
          ) : (
            <select value={insertRegion} onChange={(e) => setInsertRegion(e.target.value)} style={inputStyle}>
              <option value="central">Central Data Center</option>
              <option value="govelli">Lab Govelli</option>
              <option value="thane">Lab Thane</option>
              <option value="vasai">Lab Vasai</option>
            </select>
          )}
        </div>

        {/* --- AI PREDICTION PREVIEW --- */}
        {aiResult && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: aiResult.potable === 1 ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${aiResult.potable === 1 ? '#bbf7d0' : '#fecaca'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ margin: 0, color: aiResult.potable === 1 ? '#166534' : '#991b1b' }}>
                {aiResult.potable === 1 ? '✅ Safe / Potable' : '⚠️ Non-Potable'}
              </h5>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                AI Confidence: {aiResult.confidence}%
              </span>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#475569' }}>
              <strong>Insight:</strong> {aiResult.insight}
            </p>

            {aiResult.explainability && aiResult.explainability.length > 0 && (
              <div style={{ marginTop: '12px', borderTop: '1px solid #cbd5e1', paddingTop: '12px' }}>
                <strong style={{ fontSize: '13px', color: '#334155' }}>Key AI Drivers (SHAP):</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                  {aiResult.explainability.map((item: any, idx: number) => {
                    // Positive impact -> pushes towards 1 (Potable)
                    const isPositive = item.impact > 0;
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                        <span>
                          <span style={{ fontWeight: 600 }}>{item.feature.replace('_', ' ')}</span>
                        </span>
                        <span style={{ 
                          color: isPositive ? '#166534' : '#991b1b', 
                          backgroundColor: isPositive ? '#dcfce7' : '#fee2e2',
                          padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold'
                        }}>
                          {isPositive ? '↑ Safe' : '↓ Unsafe'} ({item.impact > 0 ? '+' : ''}{item.impact.toFixed(3)})
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button 
            type="button" 
            onClick={handleAIScan} 
            disabled={isAnalyzing}
            style={aiButtonStyle}
          >
            {isAnalyzing ? "Analyzing..." : "✨ Run AI Audit"}
          </button>
          
          <button type="submit" style={submitButtonStyle}>
            Save Record to Database
          </button>
        </div>
      </form>

      <SuccessModal isOpen={isModalOpen} onClose={handleModalClose} resultId={newResultId} />
    </div>
  );
};

// --- Styles ---
const formGridStyle: React.CSSProperties = { 
  display: "grid", 
  gridTemplateColumns: "1fr 1fr", 
  gap: "16px" 
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  outline: "none"
};

const submitButtonStyle: React.CSSProperties = { 
  flex: 1, 
  padding: "12px", 
  backgroundColor: "#1e293b", 
  color: "#fff", 
  border: "none", 
  borderRadius: "8px", 
  fontWeight: "bold", 
  cursor: "pointer" 
};

const aiButtonStyle: React.CSSProperties = { 
  flex: 1, 
  padding: "12px", 
  backgroundColor: "#fff", 
  color: "#4f46e5", 
  border: "2px solid #4f46e5", 
  borderRadius: "8px", 
  fontWeight: "bold", 
  cursor: "pointer" 
};

export default AddTestResult;