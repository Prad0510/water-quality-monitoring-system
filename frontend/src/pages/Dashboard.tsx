import { useState } from "react";
import TestResults from "./TestResults";
import QueryPlan from "./QueryPlan";
import AddTestResult from "./AddTestResult";
import WaterCharts from "./WaterCharts";
import ImageScanner from "./ImageScanner";
import PendingUsers from "./PendingUsers";

const Dashboard = ({
  role,
  user,
  logout,
}: {
  role: string;
  user: string;
  logout: () => void;
}) => {
  const [filterStatus] = useState("all");
  const [sortBy] = useState("test_date");
  const assignedRegion = localStorage.getItem("assigned_region") || "central";
  const [region, setRegion] = useState(role === "lab_technician" ? assignedRegion : "national");

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "24px" }}>
      <div style={{ maxWidth: "1600px", margin: "0 auto" }}>

        {/* --- CONSOLIDATED HEADER --- */}
        <header style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={avatarStyle}>{user.charAt(0).toUpperCase()}</div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#1e293b" }}>Welcome back, {user}</h1>
              <span style={badgeStyle(role)}>{role.replace('_', ' ').toUpperCase()} PORTAL</span>
            </div>
          </div>
          <button onClick={logout} style={logoutBtnStyle}>Logout</button>
        </header>

        {/* --- FLEXBOX WRAPPER (Replacing Grid) --- */}
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", width: "100%" }}>

          {/* LEFT COLUMN (60% Width) */}
          <div style={{ flex: "0 0 60%", display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>

            <section style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <div />
                {role !== "lab_technician" && (
                  <select value={region} onChange={(e) => setRegion(e.target.value)} style={selectStyle}>
                    <option value="national">National Overview</option>
                    <option value="govelli">Lab Govelli</option>
                    <option value="thane">Lab Thane</option>
                    <option value="vasai">Lab Vasai</option>
                  </select>
                )}
              </div>
              <WaterCharts role={role} filter={filterStatus} sortBy={sortBy} region={region} />
            </section>

            {(role === "admin" || role === "lab_technician") && (
              <section style={cardStyle}>
                <div style={{ marginTop: "10px" }}>
                  <AddTestResult onAdd={() => window.location.reload()} />
                </div>
              </section>
            )}

            {role === "admin" && (
              <section style={cardStyle}>
                <h3 style={titleStyle}>🛡️ Database Performance Proof</h3>
                <p style={subTitleStyle}>Query execution plans and indexing efficiency</p>
                <div style={{ marginTop: "15px" }}>
                  <QueryPlan />
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN (40% Width) */}
          <aside style={{ flex: "0 0 calc(40% - 24px)", display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>

            <div style={{ ...cardStyle, overflow: "hidden" }}>
              <ImageScanner />
            </div>

            <div style={{ ...cardStyle, padding: "0px", overflow: "hidden" }}>
              <div style={{ padding: "20px 20px 10px 20px" }}>
                <h4 style={sidebarTitleStyle}>Verified Readings Feed</h4>
              </div>
              <div style={scrollBoxStyle}>
                <TestResults role={role} filter={filterStatus} sortBy={sortBy} region={region} />
              </div>
            </div>

            {role === "admin" && (
              <div style={{ ...cardStyle, borderTop: "4px solid #f59e0b" }}>
                <h4 style={sidebarTitleStyle}>Security: Pending Approvals</h4>
                <PendingUsers />
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---

const headerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "20px 24px",
  borderRadius: "16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  border: "1px solid #e2e8f0"
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "24px",
  borderRadius: "16px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  border: "1px solid #e2e8f0",
  width: "100%",
  boxSizing: "border-box"
};

const avatarStyle = {
  width: "44px", height: "44px", backgroundColor: "#4f46e5", color: "white",
  borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
  fontWeight: "bold", fontSize: "1.2rem"
};

const badgeStyle = (role: string) => ({
  backgroundColor: role === 'admin' ? '#fee2e2' : '#dbeafe',
  color: role === 'admin' ? '#991b1b' : '#1e40af',
  padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, marginTop: '4px', display: 'inline-block'
});

const sectionHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" };
const titleStyle = { margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#1e293b" };
const subTitleStyle = { margin: "2px 0 0 0", fontSize: "0.85rem", color: "#64748b" };
const sidebarTitleStyle = { margin: "0 0 12px 0", fontSize: "1rem", fontWeight: 700, color: "#334155" };

const scrollBoxStyle = {
  maxHeight: "450px",
  overflowY: "auto" as const,
  padding: "0 20px 20px 20px"
};

const selectStyle = {
  padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600
};

const logoutBtnStyle = {
  backgroundColor: '#4f46e5', color: 'white', border: 'none',
  padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
};

export default Dashboard;