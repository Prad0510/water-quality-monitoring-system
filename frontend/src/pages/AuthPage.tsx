import { useState } from "react";
import API from "../api/api";

const AuthPage = ({
  role,
  setUser,
  goBack
}: {
  role: string;
  setUser: (user: string) => void;
  goBack: () => void;
}) => {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [assignedRegion, setAssignedRegion] = useState("govelli");

  const handleSubmit = () => {
    // 📝 SIGNUP (Now supports both Admin and Technician registration if needed)
    if (isSignup && role === "lab_technician") {
      API.post("/signup", {
        username,
        password,
        role,
        assigned_region: role === 'lab_technician' ? assignedRegion : undefined
      })
        .then(() => {
          alert("Signup successful! Pending approval if you are a technician.");
          setIsSignup(false);
        })
        .catch((err) => {
          console.error(err);
          alert("Signup failed: " + (err.response?.data?.error || "Unknown error"));
        });
    }

    // 🔑 LOGIN (Standardized for ALL roles - Admin & Technician)
    else {
      API.post("/login", {
        username,
        password,
        role
      })
        .then((res) => {
          // Store in LocalStorage for page refreshes and RBAC headers
          localStorage.setItem("role", role);
          localStorage.setItem("user", username);
          if (res.data.assigned_region) {
            localStorage.setItem("assigned_region", res.data.assigned_region);
          }

          // Update App state to trigger Dashboard view
          setUser(username);
        })
        .catch((err) => {
          console.error(err);
          alert("Login Failed: " + (err.response?.data?.error || "Invalid credentials"));
        });
    }
  };

  return (
    <div className="container" style={{ textAlign: "center", marginTop: "50px" }}>
      <button onClick={goBack} style={{ marginBottom: "20px" }}>⬅ Back to Public View</button>

      <div style={{ padding: "30px", border: "1px solid #ddd", borderRadius: "12px", display: "inline-block", backgroundColor: "#fff" }}>
        <h2>{isSignup ? "Create Staff Account" : "Staff Login"}</h2>
        <p style={{ color: "#666" }}>Role: <span style={{ fontWeight: "bold", color: "#3182ce" }}>{role.toUpperCase()}</span></p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "250px", margin: "0 auto" }}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: "10px" }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "10px" }}
          />

          {isSignup && role === "lab_technician" && (
            <select
              value={assignedRegion}
              onChange={(e) => setAssignedRegion(e.target.value)}
              style={{ padding: "10px" }}
            >
              <option value="govelli">Lab Govelli</option>
              <option value="thane">Lab Thane</option>
              <option value="vasai">Lab Vasai</option>
            </select>
          )}

          <button onClick={handleSubmit} style={{ padding: "10px", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </div>

        {/* Toggled Signup: You can allow signup for both roles, 
          or restrict it if you prefer admins to be manually added to the DB.
        */}
        <p style={{ marginTop: "20px", fontSize: "14px" }}>
          {isSignup ? "Already have an account?" : "New staff member?"}
          <button
            onClick={() => setIsSignup(!isSignup)}
            style={{ background: "none", border: "none", color: "blue", cursor: "pointer", textDecoration: "underline", marginLeft: "5px" }}
          >
            {isSignup ? "Login" : "Signup"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;