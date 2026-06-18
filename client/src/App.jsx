// client/src/App.jsx
// FIXES: C1 (code splitting), H7 (error boundaries), H5 (auth race condition)

import { lazy, Suspense, Component } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ─────────────────────────────────────────────
// CRITICAL FIX C1: Lazy-load all routes
// Before: All 15 pages in one bundle (~480KB JS)
// After:  Each page loads only when visited (~40KB initial)
// ─────────────────────────────────────────────
const LandingPage   = lazy(() => import("./pages/LandingPage"));
const Home          = lazy(() => import("./pages/Home"));
const Login         = lazy(() => import("./pages/Login"));
const Register      = lazy(() => import("./pages/Register"));
const UploadPhotos  = lazy(() => import("./pages/UploadPhotos"));
const CreateBook    = lazy(() => import("./pages/CreateBook"));
const BookEditor    = lazy(() => import("./pages/BookEditor"));
const BookPreview   = lazy(() => import("./pages/BookPreview"));
const OrderPage     = lazy(() => import("./pages/OrderPage"));
const OrdersPage    = lazy(() => import("./pages/OrdersPage"));
const AdminPanel    = lazy(() => import("./pages/AdminPanel"));
const AuthCallback  = lazy(() => import("./pages/AuthCallback"));
const NotFound      = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService= lazy(() => import("./pages/TermsOfService"));

// ─────────────────────────────────────────────
// Loading Screen — used by Suspense fallback
// ─────────────────────────────────────────────
const LoadingScreen = ({ message = "Loading..." }) => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#fff",
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
    }}
    role="status"
    aria-live="polite"
    aria-label={message}
  >
    <div
      style={{
        width: 36,
        height: 36,
        border: "3px solid #EBEBEB",
        borderTopColor: "#C8345A",
        borderRadius: "50%",
        animation: "bb-spin 0.75s linear infinite",
        marginBottom: 14,
      }}
    />
    <p style={{ fontSize: 13, color: "#9A9A9A", margin: 0, fontWeight: 500 }}>
      {message}
    </p>
    <style>{`@keyframes bb-spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ─────────────────────────────────────────────
// FIX H7: Error Boundary — prevents white screens
// ─────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[BlushBook Error Boundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            textAlign: "center",
            fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
            background: "#FAFAFA",
          }}
        >
          <div
            style={{
              fontSize: 48,
              marginBottom: 16,
              lineHeight: 1,
            }}
          >
            📖
          </div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#0F0F0F",
              margin: "0 0 8px",
              letterSpacing: "-0.02em",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#6B6B6B",
              margin: "0 0 28px",
              maxWidth: 320,
              lineHeight: 1.6,
            }}
          >
            We hit an unexpected error. Refreshing usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#0F0F0F",
              color: "#fff",
              border: "none",
              borderRadius: 100,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              marginBottom: 12,
            }}
          >
            Refresh page
          </button>
          <button
            onClick={() => { window.location.href = "/"; }}
            style={{
              background: "none",
              color: "#9A9A9A",
              border: "none",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            ← Back to homepage
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────
// Route Guards
// ─────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen message="Checking your session..." />;

  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen message="Verifying access..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_admin) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (user) {
    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect") || "/dashboard";
    return <Navigate to={decodeURIComponent(redirect)} replace />;
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
        <ErrorBoundary>
          {/*
            Suspense wraps ALL lazy routes.
            Each chunk loads independently — only the visited page's JS is fetched.
          */}
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />

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
              <Route path="/auth/callback" element={<AuthCallback />} />

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

              {/* Admin */}
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
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;