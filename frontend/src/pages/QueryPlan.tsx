import { useEffect, useState } from "react";
import axios from "axios";

const QueryPlan = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get("http://localhost:5000/query-metrics", {
          headers: { role: role }
        });
        setMetrics(res.data);
      } catch (err) {
        console.error("Could not fetch metrics", err);
      }
    };
    fetchMetrics();
  }, [role]);

  if (!metrics) return <p>Loading performance metrics...</p>;

  // Logic to determine if the current scan is efficient
  const isOptimized = metrics.scan_type.toLowerCase().includes("index");

  return (
    <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <h4 style={{ color: '#1a202c', marginBottom: '15px' }}>⚡ Database Performance Proof</h4>
      
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div style={{ flex: 1, padding: '15px', background: '#f7fafc', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Execution Time</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2b6cb0' }}>
            {metrics.execution_time_ms.toFixed(3)} <span style={{ fontSize: '14px' }}>ms</span>
          </div>
        </div>

        <div style={{ flex: 1, padding: '15px', background: isOptimized ? '#f0fff4' : '#fff5f5', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access Method</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: isOptimized ? '#2f855a' : '#c53030' }}>
            {metrics.scan_type}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#4a5568', padding: '10px', borderLeft: `4px solid ${isOptimized ? '#48bb78' : '#f56565'}`, background: '#f8fafc' }}>
        {isOptimized ? (
          <span><strong>Optimization Active:</strong> The database is using a <strong>B-Tree Index</strong> to bypass unnecessary rows, resulting in high-speed retrieval.</span>
        ) : (
          <span><strong>Optimization Needed:</strong> The database is performing a <strong>Sequential Scan</strong>. Adding an index on <code>test_date</code> would improve performance.</span>
        )}
      </div>
    </div>
  );
};

export default QueryPlan;