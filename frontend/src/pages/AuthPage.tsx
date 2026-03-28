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

  const ADMIN_USER = "admin";
  const ADMIN_PASS = "admin123";

  const handleSubmit = () => {
    // 🔐 Admin (hardcoded)
    if (role === "admin") {
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        localStorage.setItem("role", role);
        localStorage.setItem("user", username);
        setUser(username);
      } else {
        alert("Invalid Admin credentials");
      }
      return;
    }

    // 📝 SIGNUP (store in DB)
    if (isSignup) {
      API.post("/signup", {
        username,
        password,
        role
      })
        .then(() => {
          alert("Signup successful");
          setIsSignup(false);
        })
        .catch((err) => {
          console.log(err);
          alert("Signup failed");
        });
    }

    // 🔑 LOGIN (check from DB)
    else {
      API.post("/login", {
        username,
        password,
        role
      })
        .then(() => {
          localStorage.setItem("role", role);
          localStorage.setItem("user", username);
          setUser(username);
        })
        .catch(() => {
          alert("Invalid credentials");
        });
    }
  };

  return (
    <div className="container">
      <button onClick={goBack}>⬅ Back</button>

      <h2>{isSignup ? "Signup" : "Login"} ({role})</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleSubmit}>
        {isSignup ? "Signup" : "Login"}
      </button>

      {/* Toggle only for technician (admin fixed) */}
      {role !== "admin" && (
        <p>
          {isSignup ? "Already have an account?" : "New user?"}
          <button onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Login" : "Signup"}
          </button>
        </p>
      )}
    </div>
  );
};

export default AuthPage;