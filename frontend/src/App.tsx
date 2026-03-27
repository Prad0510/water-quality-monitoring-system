import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import RoleSelector from "./pages/RoleSelector";
import AuthPage from "./pages/AuthPage";

function App() {
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);

  // Step 1: Select Role
  if (!role) {
    return <RoleSelector setRole={setRole} />;
  }

  // Step 2: Login / Signup
  if (!user) {
    return (
      <Dashboard
        role={role}
        user="Guest"
        logout={() => setRole(null)}
        goBack={() => setRole(null)}
      />
    );
  }

  // Step 3: Dashboard
  if(!user){
    return (
    <Dashboard
      role={role}
      user={user}
      logout={() => setUser(null)}
      goBack={() => setRole(null)}
    />
  );
}
  return(
    <Dashboard
      role={role}
      user={user}
      logout={() => setUser(null)}
      goBack={() => setRole(null)}
    />
  )
}

export default App;