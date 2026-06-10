// client/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadPhotos from "./pages/UploadPhotos";
import CreateBook from "./pages/CreateBook";
import BookEditor from "./pages/BookEditor";
import BookPreview from "./pages/BookPreview";
import OrderPage from "./pages/OrderPage";
import OrdersPage from "./pages/OrdersPage";
import AdminPanel from "./pages/AdminPanel";
import AuthCallback from "./pages/AuthCallback"; // add this


// ─── Loading Screen ───────────────────────────────────────
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

// ─── Private Route ────────────────────────────────────────
// Redirects to login and preserves the intended destination
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    // Save where user wanted to go
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  return children;
};

// ─── Public Route ─────────────────────────────────────────
// Redirects logged in users away from login/register
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (user) {
    // If there's a redirect param, go there
    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect") || "/dashboard";
    return <Navigate to={redirect} replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public pages — no auth needed ── */}
          <Route path="/" element={<LandingPage />} />

          {/* ── Auth pages — redirect if already logged in ── */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* ── Protected pages — must be logged in ── */}
          <Route path="/dashboard" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/create" element={<PrivateRoute><CreateBook /></PrivateRoute>} />
          <Route path="/upload/:bookId" element={<PrivateRoute><UploadPhotos /></PrivateRoute>} />
          <Route path="/editor/:bookId" element={<PrivateRoute><BookEditor /></PrivateRoute>} />
          <Route path="/preview/:bookId" element={<PrivateRoute><BookPreview /></PrivateRoute>} />
          <Route path="/order/:bookId" element={<PrivateRoute><OrderPage /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />

          {/* ── Catch all ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;