
import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://ai-healthcare-appointment-management-spco.onrender.com"
).replace(/\/+$/, "");

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
