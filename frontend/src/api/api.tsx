import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000"
});

API.interceptors.request.use((config) => {
  const role = localStorage.getItem("role");

  if (role) {
    config.headers = config.headers || {};
    config.headers["role"] = role;
  }
  
  return config;
});

export default API;