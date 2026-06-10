import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ ONE clean auth verification on app load
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data.user);
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // ✅ FIX: stable function (prevents re-render issues)
  const loginUser = useCallback((userData, token) => {
    setUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  // ✅ logout stable too
  const logoutUser = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
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