import { useEffect, useState } from "react";
import API from "../api/api";
import type { Alert } from "../types/types";

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    API.get("/alerts")
      .then(res => setAlerts(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
  <h2>Alerts</h2>
  <ul>
    {alerts.map((a) => (
      <li key={a.alert_id} className="unsafe">
        ⚠ {a.alert_message}
      </li>
    ))}
  </ul>
</div>
  );
};

export default Alerts;