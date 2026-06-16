// client/src/App.jsx

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

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
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

// ─────────────────────────────────────────────
// Loading Screen
// ─────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Private Route
// ─────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${location.pathname}`}
        replace
      />
    );
  }

  return children;
};

// ─────────────────────────────────────────────
// Admin Route
// ─────────────────────────────────────────────
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only admins allowed
  if (!user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ─────────────────────────────────────────────
// Public Route
// ─────────────────────────────────────────────
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (user) {
    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect") || "/dashboard";

    return <Navigate to={redirect} replace />;
  }

  return children;
};

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/auth/callback"
            element={<AuthCallback />}
          />

          {/* User Protected */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />

          <Route
            path="/create"
            element={
              <PrivateRoute>
                <CreateBook />
              </PrivateRoute>
            }
          />

          <Route
            path="/upload/:bookId"
            element={
              <PrivateRoute>
                <UploadPhotos />
              </PrivateRoute>
            }
          />

          <Route
            path="/editor/:bookId"
            element={
              <PrivateRoute>
                <BookEditor />
              </PrivateRoute>
            }
          />

          <Route
            path="/preview/:bookId"
            element={
              <PrivateRoute>
                <BookPreview />
              </PrivateRoute>
            }
          />

          <Route
            path="/order/:bookId"
            element={
              <PrivateRoute>
                <OrderPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <OrdersPage />
              </PrivateRoute>
            }
          />

          {/* Admin Only */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;