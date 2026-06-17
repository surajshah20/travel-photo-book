// client/src/pages/Login.jsx
// BlushBook — Login Page aligned to Landing Page design system

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Star } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Logo from "../design-system/Logo";
import { C, S, authPageStyles } from "../design-system/index";
import TravelPhoto from "../assets/Travelbook.jpg";

// ─── Input Field ──────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div style={{ marginBottom: 18 }}>
    <label className="bb-label">{label}</label>
    {children}
    {error && (
      <p className="bb-field-error">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5.5" stroke="#DC2626" />
          <path d="M6 3.5v3M6 8v.5" stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

// ─── Google SVG ───────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// ─── Stars ────────────────────────────────────────────────
const Stars = ({ size = 13 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={size} fill="#FCD34D" color="#FCD34D" />
    ))}
  </div>
);

// ══════════════════════════════════════════════════════════
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();

  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirect") || "/dashboard";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Dynamic Google Login Handler for Production
  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    // Strip trailing /api to prevent /api/api/auth/google
    const baseUrl = apiUrl.replace(/\/api$/, "");
    window.location.href = `${baseUrl}/api/auth/google`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const errs = {};
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!re.test(formData.email)) errs.email = "Please enter a valid email";
    if (!formData.password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      });
      loginUser(res.data.user, res.data.token);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{authPageStyles}</style>

      <div className="bb-page">

        {/* ── LEFT — Image panel ─────────────────────── */}
        <div
          className="bb-panel-image"
          style={{
            position: "relative", overflow: "hidden",
            background: "#0A0A0A",
          }}
        >
          <img
            src={TravelPhoto}
            alt="BlushBook photo book"
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }}
          />
          {/* Rose gradient overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(15,15,15,0.75) 0%, rgba(200,52,90,0.35) 100%)",
          }} />

          {/* Content */}
          <div style={{
            position: "absolute", inset: 0,
            padding: "44px 48px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            {/* Logo top */}
            <Logo size={22} dark clickable />

            {/* Bottom content */}
            <div>
              {/* Quote */}
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(22px,2.5vw,30px)",
                fontWeight: 800, color: "#fff",
                lineHeight: 1.18, letterSpacing: "-0.03em",
                marginBottom: 14,
              }}>
                "Every journey deserves<br />
                to be <em style={{ fontStyle: "italic", color: C.roseMid }}>remembered beautifully.</em>"
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 28, fontWeight: 400 }}>
                Nepal's first AI-powered photo book platform
              </p>

              {/* Testimonial */}
              <div style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                borderRadius: 18,
                padding: "20px 22px",
                border: "1px solid rgba(255,255,255,0.12)",
              }}>
                <Stars size={12} />
                <p style={{
                  fontSize: 14, color: "rgba(255,255,255,0.82)",
                  fontStyle: "italic", lineHeight: 1.7,
                  margin: "12px 0 16px", fontWeight: 400,
                }}>
                  "My Pokhara travel book turned out absolutely stunning.
                  The AI captions were surprisingly personal and accurate!"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 34, height: 34,
                    background: C.rose,
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: 12 }}>SS</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)", margin: 0 }}>
                      Suraj S.
                    </p>
                    <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                      Kathmandu, Nepal
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT — Form panel ─────────────────────── */}
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center",
          padding: "48px 40px",
          background: C.bg,
          overflowY: "auto",
        }}>
          {/* Mobile logo */}
          <div style={{ marginBottom: 36, width: "100%", maxWidth: 380 }}>
            <Logo size={22} clickable />
          </div>

          <div className="bb-fade-up" style={{ width: "100%", maxWidth: 380 }}>

            {/* Heading */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 28, fontWeight: 800,
                color: C.ink, margin: "0 0 6px",
                letterSpacing: "-0.03em", lineHeight: 1.1,
              }}>
                Welcome back
              </h1>
              <p style={{ fontSize: 14, color: C.muted, margin: 0, fontWeight: 400 }}>
                Sign in to continue creating beautiful memories
              </p>
            </div>

            {/* Server error */}
            {serverError && (
              <div className="bb-server-error bb-fade-up">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="7" cy="7" r="6.5" stroke="#DC2626" />
                  <path d="M7 4v3.5M7 9v.5" stroke="#DC2626" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                {serverError}
              </div>
            )}

            {/* Google button */}
            <div className="bb-fade-up bb-fade-up-1" style={{ marginBottom: 20 }}>
              <button
                className="bb-btn-google"
                onClick={handleGoogleLogin}
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="bb-divider bb-fade-up bb-fade-up-2">
              <span>or sign in with email</span>
            </div>

            {/* Email */}
            <div className="bb-fade-up bb-fade-up-2">
              <Field label="Email address" error={errors.email}>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={15}
                    color={errors.email ? C.error : C.subtle}
                    style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`bb-input ${errors.email ? "error" : ""}`}
                    autoComplete="email"
                  />
                </div>
              </Field>
            </div>

            {/* Password */}
            <div className="bb-fade-up bb-fade-up-3">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label className="bb-label" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  className="bb-btn-ghost"
                  style={{ fontSize: 12, color: C.rose }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: "relative", marginBottom: errors.password ? 0 : 18 }}>
                <Lock
                  size={15}
                  color={errors.password ? C.error : C.subtle}
                  style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className={`bb-input ${errors.password ? "error" : ""}`}
                  style={{ paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 14, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: C.subtle, display: "flex", alignItems: "center",
                    transition: `color ${S.fast}`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = C.ink}
                  onMouseLeave={e => e.currentTarget.style.color = C.subtle}
                >
                  {showPassword
                    ? <EyeOff size={16} />
                    : <Eye size={16} />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="bb-field-error" style={{ marginBottom: 18 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5.5" stroke="#DC2626" />
                    <path d="M6 3.5v3M6 8v.5" stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="bb-fade-up bb-fade-up-3" style={{ marginBottom: 22 }}>
              <label className="bb-checkbox">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            {/* Submit */}
            <div className="bb-fade-up bb-fade-up-4" style={{ marginBottom: 20 }}>
              <button
                type="button"
                className="bb-btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{ borderRadius: 14, padding: "15px" }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 16, height: 16,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                      display: "inline-block",
                    }} />
                    Signing in...
                  </>
                ) : (
                  <>Sign In <ArrowRight size={15} /></>
                )}
              </button>
            </div>

            {/* Footer links */}
            <div className="bb-fade-up bb-fade-up-5" style={{ textAlign: "center" }}>
              <p style={{ fontSize: 13.5, color: C.muted, margin: "0 0 10px" }}>
                Don't have an account?{" "}
                <Link
                  to="/register"
                  style={{ color: C.rose, fontWeight: 700, textDecoration: "none" }}
                  onMouseEnter={e => e.target.style.textDecoration = "underline"}
                  onMouseLeave={e => e.target.style.textDecoration = "none"}
                >
                  Create one free
                </Link>
              </p>
              <button
                className="bb-btn-ghost"
                onClick={() => navigate("/")}
                style={{ fontSize: 12, color: C.subtle }}
              >
                ← Back to homepage
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default Login;