import { useEffect, useState } from "react";
import API from "../api/api";
import type { TestResult } from "../types/types";

const TestResults = ({ role, filter, sortBy, region = "national" }: { role: string; filter: string; sortBy: string; region?: string }) => {
  const [data, setData] = useState<TestResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Updated fetchData to send filter and sort to Flask
  const fetchData = () => {
    API.get("/testresults", {
      headers: { 
        role: role,
        "assigned-region": localStorage.getItem("assigned_region") || ""
      },
      params: { 
        filter: filter, 
        sort: sortBy,
        region: region,
        search: searchTerm
      } // This sends ?filter=Safe&sort=value&region=national&search=xxx to your backend
    })
      .then(res => {
        if (Array.isArray(res.data)) {
          setData(res.data);
        } else {
          console.error("Expected array but got:", res.data);
          setData([]);
        }
      })
      .catch(err => {
        console.log("Fetch Error:", err);
        setData([]);
      });
  };

  // ✅ Trigger fetchData whenever role, filter, or sortBy changes
  useEffect(() => {
    fetchData();
  }, [role, filter, sortBy, region, searchTerm]);
  // Explicitly order columns for better UX instead of relying on alphabetical JS key maps
  const HEADERS = [
    "sample_id", "test_date", "node_location", "potability", 
    "ph", "hardness", "solids", "chloramines", "sulfate", 
    "conductivity", "organic_carbon", "trihalomethanes", "turbidity", "result_id"
  ];

  return (
    <div className="card" style={{ marginTop: "20px", overflowX: "auto" }}>
      <div style={{ padding: "10px 15px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
          <h4 style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>Recent Records</h4>
          <input 
            type="text" 
            placeholder="🔍 Search Sample ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", width: "250px", outline: "none" }}
          />
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {HEADERS.map((key) => (
              <th key={key} style={{ padding: "10px" }}>{key.replace('_', ' ').toUpperCase()}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <tr key={i}>
                {HEADERS.map((key, j) => {
                  const value = (row as any)[key];
                  return (
                    <td key={j}>
                      {value === "Safe" ? (
                        <span className="badge safe">Safe</span>
                      ) : value === "Unsafe" ? (
                        <span className="badge unsafe">Unsafe</span>
                      ) : value === null || value === undefined || value === "" || value === "NaN" ? (
                        <span style={{ color: "#94a3b8" }}>-</span>
                      ) : (
                        value
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={10} style={{ padding: "20px", textAlign: "center" }}>
                No records found matching these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TestResults;