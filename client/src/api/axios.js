// client/src/api/axios.js
// One central place to configure all API calls
// Instead of typing the full URL every time, we just use api.post("/auth/login")

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// This runs before every request automatically
// It grabs the token from localStorage and adds it to the header
// So protected routes know we're logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;