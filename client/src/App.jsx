// client/src/App.jsx
// React Router controls which page to show based on the URL

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// This protects routes — if not logged in, redirect to login
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    // BrowserRouter enables navigation between pages
    <BrowserRouter>
      {/* AuthProvider makes login state available everywhere */}
      <AuthProvider>
        <Routes>
          {/* Public routes — anyone can visit */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private route — only logged in users */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;