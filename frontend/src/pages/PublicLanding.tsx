import { useState } from "react";
import WaterCharts from "./WaterCharts";
import TestResults from "./TestResults";
import ImageScanner from "./ImageScanner";

const PublicLanding = ({ setRole }: { setRole: (role: string) => void }) => {
  const [sortBy] = useState("test_date");

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "24px", fontFamily: "'Inter', sans-serif" }}>

      {/* --- HERO HEADER --- */}
      <header style={{ textAlign: 'center', marginBottom: '48px', marginTop: '20px' }}>
        <h1 style={{ fontSize: "42px", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>
          🌊 City Water Quality Portal
        </h1>
      </header>

      {/* --- MAIN CONTENT LAYOUT --- */}
      <div style={{
        maxWidth: "1440px",
        margin: "0 auto",
        display: "flex",
        gap: "32px",
        alignItems: "flex-start"
      }}>

        {/* LEFT COLUMN: DATA & ANALYTICS (60%) */}
        <div style={{ flex: "0 0 60%", display: "flex", flexDirection: "column", gap: "32px", minWidth: 0 }}>

          {/* Analytics & Controls Card */}
          <section style={cardStyle}>
            <WaterCharts role="public" filter="Safe" sortBy={sortBy} />
          </section>

          {/* Verified Readings Feed */}
          <div style={{ ...cardStyle, padding: "0px", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>📋 Verified Safety Readings</h4>
            </div>
            <div style={{ maxHeight: "400px", overflowY: "auto", padding: "0 10px 10px" }}>
              <TestResults role="public" filter="Safe" sortBy={sortBy} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TOOLS & ACCESS (40%) */}
        <aside style={{ flex: "0 0 calc(40% - 32px)", display: "flex", flexDirection: "column", gap: "32px", minWidth: 0 }}>

          {/* AI Scanner Utility */}
          <div style={{ ...cardStyle, borderTop: "4px solid #3b82f6" }}>

            <ImageScanner />
          </div>

          {/* Staff Portal Quick Link */}
          <section style={{ ...cardStyle, textAlign: 'center', backgroundColor: '#304566ff', color: 'white' }}>
            <h3 style={{ marginTop: 0, color: '#f8fafc' }}>Staff Administration</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => setRole("admin")}
                style={{ ...buttonBase, backgroundColor: '#3b82f6', color: 'white' }}
              >
                Admin Login
              </button>
              <button
                onClick={() => setRole("lab_technician")}
                style={{ ...buttonBase, backgroundColor: '#3b82f6', color: 'white' }}
              >
                Technician Login
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

// --- STYLES ---

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "28px",
  borderRadius: "20px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
  border: "1px solid #e2e8f0",
  width: "100%",
  boxSizing: "border-box"
};

const selectStyle = {
  padding: "6px 10px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  backgroundColor: "white",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
  outline: "none"
};

const buttonBase = {
  padding: '12px 24px',
  fontSize: '14px',
  cursor: 'pointer',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 'bold' as const,
  transition: 'transform 0.2s ease'
};

export default PublicLanding;