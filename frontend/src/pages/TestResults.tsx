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
            {data.length > 0 &&
              Object.keys(data[0]).map((key) => (
                <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row,i) => (
            <tr key={i}>
              {Object.values(row).map((value,j) =>(
                <td key={j}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TestResults;