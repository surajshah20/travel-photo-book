// client/src/pages/Login.jsx
// Blushbook — Production Login Page

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Eye, EyeOff, Mail, Lock } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();

  // Get redirect destination from URL params
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    // Clear field error on change
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // ─── Client-side validation ───────────────────────────
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    // Validate before sending
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
      setServerError(
        err.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* ─── Left — Image Panel ──────────────────────── */}
      <div className="hidden md:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=900&q=90"
          alt="Photo book"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 to-rose-900/50" />

        <div className="absolute inset-0 flex flex-col justify-between p-10">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow">
              <BookOpen className="w-4 h-4 text-rose-500" />
            </div>
            <span
              className="text-white text-xl font-bold"
              style={{ fontFamily: "Georgia, serif" }}
            >
              blush<span className="text-rose-300">book</span>
            </span>
          </div>

          {/* Bottom content */}
          <div>
            <blockquote
              className="text-white text-3xl font-bold leading-tight mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              "Every journey deserves to be remembered beautifully."
            </blockquote>
            <p className="text-white/60 text-sm mb-8">
              Nepal's first AI-powered photo book platform
            </p>

            {/* Testimonial card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-white/85 text-sm italic leading-relaxed">
                "My Pokhara travel book turned out absolutely stunning. The AI
                captions were surprisingly personal and accurate!"
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-7 h-7 bg-rose-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">SS</span>
                </div>
                <p className="text-white/50 text-xs">Suraj S. — Kathmandu, Nepal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right — Form Panel ──────────────────────── */}
      <div className="flex flex-col justify-center px-8 md:px-14 py-12 bg-white">

        {/* Mobile logo */}
        <div
          className="flex items-center gap-2 mb-10 md:hidden cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
            blush<span className="text-rose-500">book</span>
          </span>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <h1
            className="text-3xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Welcome back
          </h1>
          <p className="text-gray-400 mb-8 text-sm">
            Sign in to continue creating beautiful memories
          </p>

          {/* Server error */}
          {serverError && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0">⚠️</span>
              {serverError}
            </div>
          )}

          {/* ── Google OAuth Placeholder ── */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition mb-5 shadow-sm"
            onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-gray-300 text-xs font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Form */}
          <div className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition
                    ${errors.email ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-rose-500 hover:text-rose-600 hover:underline transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className={`w-full border rounded-xl pl-11 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition
                    ${errors.password ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errors.password}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-gray-500 cursor-pointer select-none"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-rose-500 transition disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          {/* Register link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-rose-500 font-bold hover:underline">
              Create one free
            </Link>
          </p>

          <p className="text-center mt-3">
            <span
              onClick={() => navigate("/")}
              className="text-gray-300 text-xs hover:text-gray-500 cursor-pointer transition"
            >
              Back to homepage
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;