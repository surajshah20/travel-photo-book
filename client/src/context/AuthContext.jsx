// client/src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Verify auth automatically using the secure cookie
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await api.get("/auth/verify");
        setUser(res.data.user);
      } catch (err) {
        // Cookie is missing or invalid
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // ✅ Login now only saves the user object
  const loginUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  // ✅ Logout clears the cookie on the server
  const logoutUser = useCallback(async () => {
    try {
      await api.post("/auth/logout"); 
    } catch (e) {
      console.error("Logout error", e);
    }
    setUser(null);
    localStorage.removeItem("user");
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, loginUser, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);