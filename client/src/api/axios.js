// client/src/api/axios.js

import axios from "axios";

// 1. Get the URL from environment variables
let rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// 2. BULLETPROOF FIX: If the environment variable is missing "/api", add it automatically.
// This prevents 404 errors across the entire application!
if (!rawBaseUrl.endsWith('/api')) {
  rawBaseUrl = `${rawBaseUrl}/api`;
}

const api = axios.create({
  baseURL: rawBaseUrl,
  timeout: 30000, // We will remove this global timeout later for the AI generation
  withCredentials: true, // ✅ CRITICAL: Allows browser to send secure cross-domain cookies
});

// Handle expired/invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear local user data
      localStorage.removeItem("user");

      // Only redirect if not already on an auth page
      const onAuthPage = ["/login", "/register", "/"].includes(
        window.location.pathname
      );
      if (!onAuthPage) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;