import { useState, useEffect } from "react";
import AppLayout from "./components/AppLayout";
import AuthPage from "./pages/AuthPage";

function App() {
  // Initialize state from localStorage to keep user logged in on refresh
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));
  const [user, setUser] = useState<string | null>(localStorage.getItem("user"));

  // Handle Logout
  const logout = () => {
    localStorage.clear(); // Clears role and user from browser memory
    setRole(null);
    setUser(null);
  };

  // ---------------------------------------------------------
  // Staff Authentication
  // If a role (Admin/Lab Tech) is selected but no user is logged in.
  // ---------------------------------------------------------
  if (role && !user) {
    return (
      <AuthPage
        role={role}
        setUser={(username) => {
          localStorage.setItem("user", username);
          setUser(username);
        }}
        goBack={() => {
          localStorage.removeItem("role");
          setRole(null);
        }}
      />
    );
  }

  // ---------------------------------------------------------
  // Global Enterprise AppLayout View
  // Handles Public and Authenticated Layouts structurally
  // ---------------------------------------------------------
  return (
    <AppLayout
      role={role}
      setRole={setRole}
      user={user}
      logout={logout}
    />
  );
}

export default App;