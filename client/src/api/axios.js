// client/src/api/axios.js

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 30000,
  withCredentials: true, // ✅ CRITICAL: Allows browser to send secure cookies
});

// Handle expired/invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear local user data
      localStorage.removeItem("user");
      // Note: We don't need to remove the token here anymore, the browser handles it

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