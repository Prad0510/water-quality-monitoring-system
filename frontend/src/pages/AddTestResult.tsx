import { useState } from "react";
import API from "../api/api";

const AddTestResult = ({ onAdd }: { onAdd: () => void }) => {
  const [form, setForm] = useState({
    sample_id: "",
    parameter_id: "",
    value: "",
    status: "Safe",
    test_date: ""
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    API.post("/testresults", {
      sample_id: Number(form.sample_id),
      parameter_id: Number(form.parameter_id),
      value: Number(form.value),
      status: form.status,
      test_date: form.test_date
    })
      .then(() => {
        alert("Inserted successfully!");
        onAdd(); // refresh table

        // ✅ reset form
        setForm({
          sample_id: "",
          parameter_id: "",
          value: "",
          status: "Safe",
          test_date: ""
        });
      })
      .catch(err => console.log(err));
  };

  return (
    <div>
      <h2>Add Test Result</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          name="sample_id"
          placeholder="Sample ID"
          value={form.sample_id}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="parameter_id"
          placeholder="Parameter ID"
          value={form.parameter_id}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="value"
          placeholder="Value"
          value={form.value}
          onChange={handleChange}
          required
        />

        {/* ✅ Status dropdown */}
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="Safe">Safe</option>
          <option value="Unsafe">Unsafe</option>
        </select>

        <input
          type="date"
          name="test_date"
          value={form.test_date}
          onChange={handleChange}
          required
        />

        <button type="submit">Add</button>
      </form>
    </div>
  );
};

export default AddTestResult;