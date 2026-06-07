// client/src/context/AuthContext.jsx
// This manages login state for the entire app

import { createContext, useContext, useState, useEffect } from "react";

// Create the context
const AuthContext = createContext();

// This wraps the whole app and provides auth info to every page
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // When app loads, check if user was already logged in
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Called after successful login or register
  const loginUser = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    // Save to localStorage so it persists after page refresh
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Called when user clicks logout
  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — any component can just write: const { user } = useAuth()
export const useAuth = () => useContext(AuthContext);