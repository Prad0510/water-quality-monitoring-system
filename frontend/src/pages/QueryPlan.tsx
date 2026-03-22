import { useEffect, useState } from "react";
import API from "../api/api";

const QueryPlan = () => {
  const [plan, setPlan] = useState<string[]>([]);

  useEffect(() => {
    API.get("/query-plan")
      .then(res => setPlan(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h2>Query Optimization</h2>
      <div className="query-box">
  {plan.map((line, i) => (
    <div key={i}>{line}</div>
  ))}
</div>
    </div>
  );
};

export default QueryPlan;
