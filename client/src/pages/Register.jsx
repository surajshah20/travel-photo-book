// client/src/pages/Register.jsx
// BlushBook — Register Page aligned to Landing Page design system

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Check, X, ArrowRight, Star } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Logo from "../design-system/Logo";
import { C, S, authPageStyles } from "../design-system/index";
import PhotoBook from "../assets/hero.jpg"; 

// ─── Reused from Login ────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const Stars = ({ size = 13 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={size} fill="#FCD34D" color="#FCD34D" />
    ))}
  </div>
);

// ─── Password Rule ────────────────────────────────────────
const PwRule = ({ met, text }) => (
  <div className="pw-rule" style={{ color: met ? C.success : C.subtle }}>
    <div
      className="pw-rule-dot"
      style={{ background: met ? "#DCFCE7" : "#F3F4F6" }}
    >
      {met
        ? <Check size={9} color={C.success} strokeWidth={3} />
        : <X size={9} color={C.subtle} strokeWidth={2} />
      }
    </div>
    {text}
  </div>
);

// ── Strength color map ─────────────────────────────────────
const strengthColor = ["#F87171", "#FB923C", "#FBBF24", "#4ADE80"];
const strengthLabel = ["Weak", "Fair", "Good", "Strong"];

// ══════════════════════════════════════════════════════════
const Register = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  const rules = [
    { met: formData.password.length >= 8, text: "Minimum 8 characters" },
    { met: /[A-Z]/.test(formData.password), text: "One uppercase letter" },
    { met: /[a-z]/.test(formData.password), text: "One lowercase letter" },
    { met: /[0-9]/.test(formData.password), text: "One number" },
  ];
  const strength = rules.filter((r) => r.met).length;

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const errs = {};
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name.trim() || formData.name.trim().length < 2)
      errs.name = "Please enter your full name";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!re.test(formData.email)) errs.email = "Please enter a valid email";
    if (!formData.password) errs.password = "Password is required";
    else if (strength < 4) errs.password = "Please meet all password requirements";
    if (!formData.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });
      loginUser(res.data.user, res.data.token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pwMatch = formData.confirmPassword && formData.password === formData.confirmPassword;

  return (
    <>
      <style>{authPageStyles}</style>

      <div className="bb-page">

        {/* ── LEFT — Form panel ──────────────────────── */}
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center",
          padding: "48px 40px",
          background: C.bg, overflowY: "auto",
        }}>
          {/* Mobile logo */}
          <div style={{ marginBottom: 32, width: "100%", maxWidth: 380 }}>
            <Logo size={22} clickable />
          </div>

          <div className="bb-fade-up" style={{ width: "100%", maxWidth: 380 }}>

            {/* Heading */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 28, fontWeight: 800,
                color: C.ink, margin: "0 0 6px",
                letterSpacing: "-0.03em", lineHeight: 1.1,
              }}>
                Create your account
              </h1>
              <p style={{ fontSize: 14, color: C.muted, margin: 0, fontWeight: 400 }}>
                Free to start — pay only when you order a printed book
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

            {/* Google */}
            <div className="bb-fade-up bb-fade-up-1" style={{ marginBottom: 20 }}>
              <button
                className="bb-btn-google"
                onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="bb-divider bb-fade-up bb-fade-up-1">
              <span>or create with email</span>
            </div>

            {/* Name */}
            <div className="bb-fade-up bb-fade-up-2">
              <label className="bb-label">Full Name</label>
              <div style={{ position: "relative", marginBottom: errors.name ? 0 : 18 }}>
                <User
                  size={15} color={errors.name ? C.error : C.subtle}
                  style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                />
                <input
                  type="text" name="name"
                  value={formData.name} onChange={handleChange}
                  placeholder="Your full name"
                  className={`bb-input ${errors.name ? "error" : ""}`}
                  autoComplete="name"
                />
              </div>
              {errors.name && (
                <p className="bb-field-error" style={{ marginBottom: 18 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5.5" stroke="#DC2626" />
                    <path d="M6 3.5v3M6 8v.5" stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="bb-fade-up bb-fade-up-2">
              <label className="bb-label">Email address</label>
              <div style={{ position: "relative", marginBottom: errors.email ? 0 : 18 }}>
                <Mail
                  size={15} color={errors.email ? C.error : C.subtle}
                  style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                />
                <input
                  type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  placeholder="you@example.com"
                  className={`bb-input ${errors.email ? "error" : ""}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="bb-field-error" style={{ marginBottom: 18 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5.5" stroke="#DC2626" />
                    <path d="M6 3.5v3M6 8v.5" stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="bb-fade-up bb-fade-up-3">
              <label className="bb-label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={15} color={errors.password ? C.error : C.subtle}
                  style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                />
                <input
                  type={showPw ? "text" : "password"} name="password"
                  value={formData.password} onChange={handleChange}
                  onFocus={() => setPwFocused(true)}
                  onBlur={() => setPwFocused(false)}
                  placeholder="Create a strong password"
                  className={`bb-input ${errors.password ? "error" : ""}`}
                  style={{ paddingRight: 44 }}
                  autoComplete="new-password"
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute", right: 14, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: C.subtle, display: "flex", alignItems: "center",
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength bar */}
              {formData.password && (
                <div style={{ marginTop: 8, marginBottom: 4 }}>
                  <div className="strength-bar">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="strength-segment"
                        style={{ background: i < strength ? strengthColor[strength - 1] : C.line }}
                      />
                    ))}
                  </div>
                  <p style={{
                    fontSize: 11.5, marginTop: 5,
                    color: strength >= 3 ? C.success : C.muted,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 500,
                  }}>
                    {strength > 0 ? `Password strength: ${strengthLabel[strength - 1]}` : ""}
                  </p>
                </div>
              )}

              {/* Rules */}
              {(pwFocused || formData.password) && (
                <div style={{
                  background: C.bgSoft, borderRadius: 12,
                  padding: "12px 14px", marginTop: 8,
                  display: "flex", flexDirection: "column", gap: 7,
                  border: `1px solid ${C.line}`,
                }}>
                  {rules.map((r) => <PwRule key={r.text} met={r.met} text={r.text} />)}
                </div>
              )}

              {errors.password && (
                <p className="bb-field-error" style={{ marginTop: 6, marginBottom: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5.5" stroke="#DC2626" />
                    <path d="M6 3.5v3M6 8v.5" stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  {errors.password}
                </p>
              )}
              <div style={{ marginBottom: 18 }} />
            </div>

            {/* Confirm Password */}
            <div className="bb-fade-up bb-fade-up-3">
              <label className="bb-label">Confirm Password</label>
              <div style={{ position: "relative", marginBottom: errors.confirmPassword ? 0 : 22 }}>
                <Lock
                  size={15}
                  color={errors.confirmPassword ? C.error : pwMatch ? C.success : C.subtle}
                  style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                />
                <input
                  type={showConfirm ? "text" : "password"} name="confirmPassword"
                  value={formData.confirmPassword} onChange={handleChange}
                  placeholder="Repeat your password"
                  className={`bb-input ${errors.confirmPassword ? "error" : pwMatch ? "success" : ""}`}
                  style={{ paddingRight: 72 }}
                  autoComplete="new-password"
                />
                {/* Match checkmark */}
                {pwMatch && (
                  <div style={{
                    position: "absolute", right: 40, top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex", alignItems: "center",
                  }}>
                    <Check size={15} color={C.success} />
                  </div>
                )}
                <button
                  type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute", right: 14, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: C.subtle, display: "flex", alignItems: "center",
                  }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="bb-field-error" style={{ marginBottom: 22 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5.5" stroke="#DC2626" />
                    <path d="M6 3.5v3M6 8v.5" stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="bb-fade-up bb-fade-up-4" style={{ marginBottom: 14 }}>
              <button
                type="button" className="bb-btn-primary"
                onClick={handleSubmit} disabled={loading}
                style={{ borderRadius: 14, padding: "15px" }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 16, height: 16,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff", borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                      display: "inline-block",
                    }} />
                    Creating account...
                  </>
                ) : (
                  <>Create Free Account <ArrowRight size={15} /></>
                )}
              </button>
            </div>

            {/* Terms */}
            <div className="bb-fade-up bb-fade-up-4" style={{ textAlign: "center", marginBottom: 20 }}>
              <p style={{ fontSize: 11.5, color: C.subtle, lineHeight: 1.6, margin: 0 }}>
                By creating an account you agree to our{" "}
                <span style={{ color: C.rose, cursor: "pointer", fontWeight: 600 }}>Terms</span>{" "}
                and{" "}
                <span style={{ color: C.rose, cursor: "pointer", fontWeight: 600 }}>Privacy Policy</span>
              </p>
            </div>

            {/* Footer links */}
            <div className="bb-fade-up bb-fade-up-5" style={{ textAlign: "center" }}>
              <p style={{ fontSize: 13.5, color: C.muted, margin: "0 0 10px" }}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{ color: C.rose, fontWeight: 700, textDecoration: "none" }}
                  onMouseEnter={e => e.target.style.textDecoration = "underline"}
                  onMouseLeave={e => e.target.style.textDecoration = "none"}
                >
                  Sign in
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

        {/* ── RIGHT — Image panel ────────────────────── */}
        <div
          className="bb-panel-image"
          style={{ position: "relative", overflow: "hidden", background: "#0A0A0A" }}
        >
          <img
            src={PhotoBook}
            alt="BlushBook photo book"
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(225deg, rgba(15,15,15,0.75) 0%, rgba(200,52,90,0.35) 100%)",
          }} />

          <div style={{
            position: "absolute", inset: 0,
            padding: "44px 48px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <Logo size={22} dark clickable />

            <div>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(22px,2.5vw,30px)",
                fontWeight: 800, color: "#fff",
                lineHeight: 1.18, letterSpacing: "-0.03em",
                marginBottom: 28,
              }}>
                Start creating your<br />
                <em style={{ fontStyle: "italic", color: C.roseMid }}>photo book today</em>
              </h2>

              {/* Benefits */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {[
                  "Free to design — no credit card needed",
                  "AI automatically organises your photos",
                  "50+ professional templates",
                  "Download as PDF or order printed copy",
                  "eSewa & Khalti payments supported",
                ].map((b) => (
                  <div key={b} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 20, height: 20,
                      background: C.rose,
                      borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Check size={11} color="#fff" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.78)", fontWeight: 400 }}>
                      {b}
                    </span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  { v: "500+", l: "Books" },
                  { v: "4.9★", l: "Rating" },
                  { v: "Nepal", l: "Based" },
                ].map((s) => (
                  <div key={s.l} style={{
                    background: "rgba(255,255,255,0.07)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 14, padding: "14px 12px",
                    textAlign: "center",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}>
                    <p style={{ fontWeight: 800, color: "#fff", fontSize: 16, margin: "0 0 2px", letterSpacing: "-0.02em" }}>
                      {s.v}
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                      {s.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default Register;