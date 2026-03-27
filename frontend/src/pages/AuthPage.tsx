import { useState } from "react";

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
    if (role === "admin") {
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        setUser(username);
      } else {
        alert("Invalid Admin credentials");
      }
    } else {
      if (isSignup) {
        localStorage.setItem(username, password);
        alert("Signup successful");
        setIsSignup(false);
      } else {
        const storedPass = localStorage.getItem(username);
        if (storedPass === password) {
          setUser(username);
        } else {
          alert("Invalid credentials");
        }
      }
    }
  };

  return (
    <div className="container">
      <button onClick={goBack}>⬅ Back</button>

      <h2>{isSignup ? "Signup" : "Login"} ({role})</h2>

      <input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleSubmit}>
        {isSignup ? "Signup" : "Login"}
      </button>

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