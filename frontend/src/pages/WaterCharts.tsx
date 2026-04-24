import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface WaterChartsProps {
  role: string;
  filter: string;
  sortBy: string;
  region?: string;
}

const WaterCharts: React.FC<WaterChartsProps> = ({ role, region = "national" }) => {
  const [data, setData] = useState<any[]>([]);
  const [metric, setMetric] = useState("ph");
  const [interval, setIntervalTime] = useState("day");
  const [forecastData, setForecastData] = useState<any[]>([]);

  const fetchChartData = async () => {
    try {
      // Query our new analytical time-series endpoint
      const response = await axios.get(`http://localhost:5000/testresults/timeseries`, {
        params: { metric: metric, interval: interval, region: region },
        headers: { role: role }
      });
      if (Array.isArray(response.data)) {
        setData(response.data);
      } else {
        console.error("API did not return an array:", response.data);
        setData([]);
      }

      // Query Markov Forecast
      const f_res = await axios.get(`http://localhost:5000/testresults/markov_forecast`, {
        params: { region: region, steps: 7 }
      });
      if (f_res.data && f_res.data.forecast) {
        setForecastData(f_res.data.forecast);
      }
    } catch (error) {
      console.error("Error fetching timeseries data:", error);
      setData([]);
    }
  };

  useEffect(() => {
    fetchChartData();

    // Polling logic for real-time visualization
    let pollTime = 60000; // 1 min by default
    if (interval === 'second') pollTime = 2000;
    else if (interval === 'minute') pollTime = 5000;
    else if (interval === 'hour') pollTime = 60000;

    const timerId = setInterval(() => {
      fetchChartData();
    }, pollTime);

    return () => clearInterval(timerId);
  }, [role, metric, interval, region]);

  return (
    <div className="card" style={{ marginTop: '30px', marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ margin: 0 }}>Time Series Analytics</h3>
          {(interval === 'second' || interval === 'minute') && (
            <span style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '11px', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: 'white', borderRadius: '50%' }}></span>
              LIVE
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <select value={interval} onChange={(e) => setIntervalTime(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', width: 'auto' }}>
            <option value="day">Daily Aggregation</option>
            <option value="week">Weekly Aggregation</option>
            <option value="month">Monthly Aggregation</option>
          </select>
          <select value={metric} onChange={(e) => setMetric(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', width: 'auto', backgroundColor: '#f0f9ff' }}>
            <option value="ph">pH Level</option>
            <option value="hardness">Hardness</option>
            <option value="solids">Solids (TDS)</option>
            <option value="chloramines">Chloramines</option>
            <option value="sulfate">Sulfate</option>
            <option value="conductivity">Conductivity</option>
            <option value="organic_carbon">Organic Carbon</option>
            <option value="trihalomethanes">Trihalomethanes</option>
            <option value="turbidity">Turbidity</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* SECTION 1: Aggregate Trend Line */}
        <div style={{ height: '300px', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <p style={{ textAlign: 'center', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '10px', flexShrink: 0 }}>
            Average {metric.toUpperCase()} per {interval.charAt(0).toUpperCase() + interval.slice(1)}
          </p>
          <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time_bucket" fontSize={10} tickMargin={10} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Line
                  type="monotone"
                  dataKey="avg_value"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }}
                  activeDot={{ r: 6, fill: '#3b82f6' }}
                  animationDuration={1000}
                  name="Average Val"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECTION 2: Sample Volume Bar Chart */}
        <div style={{ height: '300px', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <p style={{ textAlign: 'center', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '10px', flexShrink: 0 }}>Test Volume Density</p>
          <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time_bucket" fontSize={10} tickMargin={10} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" />
                <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="sample_count" fill="#8b5cf6" animationDuration={1000} radius={[4, 4, 0, 0]} name="Samples Tested" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SECTION 3: Markov Forecast Area Chart */}
      <div style={{ marginTop: '20px', height: '300px', background: '#f0fdf4', padding: '15px', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px', flexShrink: 0 }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#166534', margin: '0' }}>Potability Forecaster (Markov ML)</p>
          <p style={{ fontSize: '11px', color: '#15803d', margin: '4px 0 0' }}>Projected 7-Day Likelihood of Safe Water</p>
        </div>
        <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#bbf7d0" />
              <XAxis dataKey="step" fontSize={10} tickMargin={10} stroke="#166534" />
              <YAxis fontSize={12} stroke="#166534" domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
              <Tooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: '8px', border: '1px solid #bbf7d0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Area
                type="monotone"
                dataKey="safe_probability"
                stroke="#22c55e"
                fill="#86efac"
                fillOpacity={0.6}
                animationDuration={1500}
                name="Safe Probability"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WaterCharts;