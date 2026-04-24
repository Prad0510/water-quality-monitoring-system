import { useState } from "react";
import WaterCharts from "../pages/WaterCharts";
import TestResults from "../pages/TestResults";
import ImageScanner from "../pages/ImageScanner";
import AddTestResult from "../pages/AddTestResult";
import QueryPlan from "../pages/QueryPlan";
import PendingUsers from "../pages/PendingUsers";

const AppLayout = ({ role, setRole, user, logout }: any) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Default parameters for Overview
  const [filterStatus] = useState("all");
  const [sortBy] = useState("test_date");
  const assignedRegion = localStorage.getItem("assigned_region") || "central";
  const [region, setRegion] = useState(role === "lab_technician" ? assignedRegion : "national");

  // Determine allowed tabs based on role
  const tabs = [
    { id: "overview", icon: "📊", label: "Operations Hub" },
    ...(role === "admin" || role === "lab_technician" ? [{ id: "entry", icon: "🧪", label: "Laboratory Entry" }] : []),
    { id: "vision", icon: "👁️", label: "Visual AI Pipeline" },
    ...(role === "admin" ? [{ id: "system", icon: "⚙️", label: "System Admin" }] : [])
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div style={layoutStyle}>
      {/* --- SIDEBAR --- */}
      <aside style={sidebarStyle}>
        <div>
          <div style={brandStyle}>
            <h2>🌊 Aqualytics</h2>
            <span>Enterprise Water OS</span>
          </div>

          <nav style={navStyle}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  ...navButtonStyle,
                  backgroundColor: activeTab === tab.id ? "#1e293b" : "transparent",
                  color: activeTab === tab.id ? "#ffffff" : "#cbd5e1"
                }}
              >
                <span style={{ marginRight: "12px", fontSize: "1.2rem" }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Sidebar - Authentication Controls */}
        <div style={authSectionStyle}>
          {!role ? (
            <>
              <div style={authLabelStyle}>Staff Access</div>
              <button onClick={() => setRole("lab_technician")} style={sidebarActionButton}>Technician Login</button>
              <button onClick={() => setRole("admin")} style={{ ...sidebarActionButton, marginTop: '8px' }}>Admin Login</button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={avatarStyle}>{user?.charAt(0).toUpperCase() || "A"}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>{role.replace('_', ' ')}</div>
              </div>
              <button onClick={logout} style={logoutIconStyle}>🚪</button>
            </div>
          )}
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main style={mainAreaStyle}>
        {/* App Bar (Header) */}
        <header style={appBarStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#0f172a" }}>
              {tabs.find(t => t.id === activeTab)?.label || "Dashboard"}
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Region selector if overview is active and user is not just looking strictly at their assigned region without ability to change */}
            {activeTab === "overview" && role !== "lab_technician" && (
              <select value={region} onChange={(e) => setRegion(e.target.value)} style={selectStyle}>
                <option value="national">National Overview</option>
                <option value="govelli">Lab Govelli</option>
                <option value="thane">Lab Thane</option>
                <option value="vasai">Lab Vasai</option>
              </select>
            )}
            
            {!role && (
              <span style={{ fontSize: "0.85rem", fontWeight: 600, backgroundColor: "#f1f5f9", padding: "6px 12px", borderRadius: "12px", color: "#64748b" }}>
                Public / Read-Only View
              </span>
            )}
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <div style={workspaceStyle}>
          
          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="card">
                <WaterCharts role={role || "public"} filter={filterStatus} sortBy={sortBy} region={region} />
              </div>
              <div className="card" style={{ padding: "0px", overflow: "hidden" }}>
                <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9" }}>
                  <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>📋 Verified Field Readings</h4>
                </div>
                <div style={{ maxHeight: "calc(100vh - 550px)", overflowY: "auto", minHeight: "350px", padding: '0 10px 10px 10px' }}>
                  <TestResults role={role || "public"} filter={filterStatus} sortBy={sortBy} region={region} />
                </div>
              </div>
            </div>
          )}

          {/* TAB: LABORATORY ENTRY */}
          {activeTab === "entry" && (role === "admin" || role === "lab_technician") && (
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
              <AddTestResult onAdd={() => { alert("Result added successfully. Switch to Overview to view it."); }} />
            </div>
          )}

          {/* TAB: CV VISION SCANNER */}
          {activeTab === "vision" && (
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
               <div className="card">
                 <ImageScanner />
               </div>
            </div>
          )}

          {/* TAB: SYSTEM ADMIN */}
          {activeTab === "system" && role === "admin" && (
            <div style={{ display: "flex", gap: "24px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="card">
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "1.15rem", fontWeight: 700 }}>🛡️ Active Query Execution Plan</h3>
                  <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "#64748b" }}>Live monitoring of system indexing efficiency</p>
                  <QueryPlan />
                </div>
              </div>
              <div style={{ flex: "0 0 400px" }}>
                <div className="card" style={{ borderTop: "4px solid #f59e0b" }}>
                  <h4 style={{ margin: "0 0 16px 0", fontSize: "1rem", fontWeight: 700 }}>Security Approvals</h4>
                  <PendingUsers />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

// --- STYLES ---
const layoutStyle: React.CSSProperties = { display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", width: "100vw", overflow: "hidden" };

const sidebarStyle: React.CSSProperties = {
  flex: "0 0 280px", backgroundColor: "#0f172a", color: "#ffffff",
  display: "flex", flexDirection: "column", justifyContent: "space-between",
  borderRight: "1px solid #1e293b", padding: "24px 20px"
};

const mainAreaStyle: React.CSSProperties = {
  flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden"
};

const appBarStyle: React.CSSProperties = {
  backgroundColor: "#ffffff", padding: "20px 32px", display: "flex",
  justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0",
  boxShadow: "0 1px 2px rgba(0,0,0,0.02)", zIndex: 10
};

const workspaceStyle: React.CSSProperties = {
  flex: 1, padding: "32px", overflowY: "auto"
};

const brandStyle = { marginBottom: "40px", padding: "0 12px" };
const navStyle = { display: "flex", flexDirection: "column", gap: "8px" };

const navButtonStyle = {
  display: "flex", alignItems: "center", padding: "12px 16px", borderRadius: "8px",
  border: "none", cursor: "pointer", fontSize: "1rem", fontWeight: 600,
  transition: "all 0.2s", textAlign: "left" as const, width: "100%"
};

const authSectionStyle = {
  borderTop: "1px solid #1e293b", paddingTop: "20px", marginTop: "20px"
};

const authLabelStyle = { fontSize: "0.75rem", textTransform: "uppercase" as const, color: "#64748b", marginBottom: "12px", letterSpacing: "1px", fontWeight: 700 };

const sidebarActionButton = {
  width: "100%", padding: "10px", backgroundColor: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", borderRadius: "8px",
  cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, display: "block"
};

const avatarStyle = {
  width: "36px", height: "36px", backgroundColor: "#3b82f6", color: "white",
  borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold"
};

const logoutIconStyle = {
  background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem", padding: "4px"
};

const selectStyle = {
  padding: "8px 14px", borderRadius: "8px", border: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600
};

export default AppLayout;
