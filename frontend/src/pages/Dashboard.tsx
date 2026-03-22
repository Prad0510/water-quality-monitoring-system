import TestResults from "./TestResults";
import Alerts from "./Alerts";
import QueryPlan from "./QueryPlan";
import AddTestResult from "./AddTestResult";

const Dashboard = () => {
  return (
    <div className="container">
      <h1>Water Quality Monitoring Dashboard</h1>

      <div className="card">
        <TestResults />
      </div>

      <div className="card">
  <AddTestResult onAdd={function (): void {
                  throw new Error("Function not implemented.");
              } } />
</div>

      <div className="card">
        <Alerts />
      </div>

      <div className="card">
        <QueryPlan />
      </div>
    </div>
  );
};

export default Dashboard;