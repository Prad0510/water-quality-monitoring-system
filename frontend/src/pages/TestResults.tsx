import { useEffect, useState } from "react";
import API from "../api/api";
import type { TestResult } from "../types/types";

const TestResults = () => {
  const [data, setData] = useState<TestResult[]>([]);

  const fetchData = () => {
    API.get("/testresults", {
      headers: { role: "admin" }
    })
      .then(res => setData(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h2>Test Results</h2>

      <table border={1}>
        <thead>
          <tr>
            <th>Result ID</th>
            <th>Sample ID</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.result_id}>
              <td>{row.result_id}</td>
              <td>{row.sample_id}</td>
              <td className={row.status === "Safe" ? "safe" : "unsafe"}>
                {row.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TestResults;