const RoleSelector = ({ setRole }: { setRole: (role: string) => void }) => {
  return (
    <div className="container">
      <h1>Water Quality Monitoring System</h1>
      <h3>Select Role</h3>

      <button onClick={() => setRole("admin")}>Admin</button>
      <button onClick={() => setRole("lab_technician")}>Lab Technician</button>
      <button onClick={() => setRole("public")}>Public Viewer</button>
    </div>
  );
};

export default RoleSelector;