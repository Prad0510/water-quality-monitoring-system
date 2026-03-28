const RoleSelector = ({ setRole }: { setRole: (role: string) => void }) => {

  const handleSelect = (role: string) => {
    localStorage.setItem("role", role);  // ✅ store role
    setRole(role);
  };

  return (
    <div className="container">
      <h1>Water Quality Monitoring System</h1>
      <h3>Select Role</h3>

      <button onClick={() => handleSelect("admin")}>Admin</button>
      <button onClick={() => handleSelect("lab_technician")}>Lab Technician</button>
      <button onClick={() => handleSelect("public")}>Public Viewer</button>
    </div>
  );
};

export default RoleSelector;