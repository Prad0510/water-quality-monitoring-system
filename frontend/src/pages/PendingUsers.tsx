import { useEffect, useState } from "react";
import API from "../api/api";

const PendingUsers = () => {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = () => {
    API.get("/admin/pending_users", {
        headers: { role: "admin" }
    })
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => console.error("Error fetching pending users", err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const approveUser = (username: string) => {
    API.post("/admin/approve_user", { username }, {
        headers: { role: "admin" }
    })
      .then(() => {
        alert(`${username} has been approved.`);
        fetchUsers();
      })
      .catch((err) => console.error("Error approving user", err));
  };

  return (
    <div className="card">
      <h4 style={{ marginBottom: "15px", color: "#b45309" }}>Pending Technician Approvals</h4>
      {users.length === 0 ? (
        <p style={{ fontSize: "14px", color: "#64748b" }}>No pending technicians.</p>
      ) : (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {users.map((u) => (
            <li key={u.username} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderBottom: "1px solid #e2e8f0" }}>
              <div>
                <strong>{u.username}</strong> 
                <span className="badge" style={{ backgroundColor: "#e2e8f0", color: "#475569", marginLeft: "10px" }}>Lab: {u.assigned_region}</span>
              </div>
              <button 
                onClick={() => approveUser(u.username)}
                style={{ padding: "6px 12px", backgroundColor: "#22c55e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Approve
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PendingUsers;
