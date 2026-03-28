import TestResults from "./TestResults";
import Alerts from "./Alerts";
import QueryPlan from "./QueryPlan";
import AddTestResult from "./AddTestResult";


const Dashboard = ({
  role,
  user,
  logout,
}: {
  role: string;
  user: string;
  logout: () => void;
}) => {
  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={logout}>Logout</button>
      </div>

      <h1>Welcome {user} ({role})</h1>

      {/* Role-based rendering */}
      <TestResults />

      {(role === "admin" || role === "lab_technician") && (
        <AddTestResult onAdd={() => window.location.reload()} />
      )}

      {role === "admin" && <Alerts />}
      {role === "admin" && <QueryPlan />}
    </div>
  );
};

export default Dashboard;

      