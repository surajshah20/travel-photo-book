// client/src/pages/Register.jsx
// Blushbook — Production Register Page

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff, Mail, Lock, User, Check, X } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

// ─── Password Rule Component ──────────────────────────────
const PasswordRule = ({ met, text }) => (
  <div className={`flex items-center gap-2 text-xs transition-colors ${met ? "text-green-600" : "text-gray-400"}`}>
    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${met ? "bg-green-100" : "bg-gray-100"}`}>
      {met
        ? <Check className="w-2.5 h-2.5" />
        : <X className="w-2.5 h-2.5" />
      }
    </div>
    {text}
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // ─── Password rules ───────────────────────────────────
  const passwordRules = [
    { met: formData.password.length >= 8, text: "Minimum 8 characters" },
    { met: /[A-Z]/.test(formData.password), text: "One uppercase letter" },
    { met: /[a-z]/.test(formData.password), text: "One lowercase letter" },
    { met: /[0-9]/.test(formData.password), text: "One number" },
  ];

  const passwordStrength = passwordRules.filter((r) => r.met).length;
  const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // ─── Validation ───────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Please enter your full name";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (passwordStrength < 4) {
      newErrors.password = "Please meet all password requirements";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      setServerError(
        err.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* ─── Left — Form Panel ───────────────────────── */}
      <div className="flex flex-col justify-center px-8 md:px-14 py-12 bg-white overflow-y-auto">

        {/* Mobile logo */}
        <div
          className="flex items-center gap-2 mb-8 md:hidden cursor-pointer"
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
            Create your account
          </h1>
          <p className="text-gray-400 mb-7 text-sm">
            Free to start — pay only when you order a printed book
          </p>

          {/* Server error */}
          {serverError && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0">⚠️</span>
              {serverError}
            </div>
          )}

          {/* Google OAuth */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition mb-5 shadow-sm"
            onClick={() => alert("Google OAuth coming soon!")}
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
            <span className="text-gray-300 text-xs font-medium">or create with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Form fields */}
          <div className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={`w-full border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition
                    ${errors.name ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1.5">⚠ {errors.name}</p>
              )}
            </div>

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
                <p className="text-red-500 text-xs mt-1.5">⚠ {errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="Create a strong password"
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

              {/* Password strength bar */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i < passwordStrength
                            ? strengthColors[passwordStrength - 1]
                            : "bg-gray-100"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength >= 3 ? "text-green-600" : "text-gray-400"}`}>
                    Password strength: {strengthLabels[passwordStrength - 1] || "Too weak"}
                  </p>
                </div>
              )}

              {/* Password rules */}
              {(passwordFocused || formData.password) && (
                <div className="mt-3 bg-gray-50 rounded-xl p-3 space-y-1.5">
                  {passwordRules.map((rule) => (
                    <PasswordRule key={rule.text} met={rule.met} text={rule.text} />
                  ))}
                </div>
              )}

              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5">⚠ {errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className={`w-full border rounded-xl pl-11 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition
                    ${errors.confirmPassword
                      ? "border-red-300 bg-red-50"
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {/* Match indicator */}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1.5">⚠ {errors.confirmPassword}</p>
              )}
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
                  Creating account...
                </span>
              ) : (
                "Create Free Account"
              )}
            </button>

            <p className="text-center text-gray-300 text-xs leading-relaxed">
              By creating an account you agree to our{" "}
              <span className="text-rose-400 cursor-pointer hover:underline">Terms of Service</span>{" "}
              and{" "}
              <span className="text-rose-400 cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </div>

          {/* Login link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-rose-500 font-bold hover:underline">
              Sign in
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

      {/* ─── Right — Image Panel ─────────────────────── */}
      <div className="hidden md:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?w=900&q=90"
          alt="Photo book"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-bl from-gray-900/70 to-rose-900/50" />

        <div className="absolute inset-0 flex flex-col justify-between p-10">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-white text-xl font-bold" style={{ fontFamily: "Georgia, serif" }}>
              blush<span className="text-rose-300">book</span>
            </span>
          </div>

          {/* Benefits */}
          <div>
            <h2
              className="text-3xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Start creating your photo book today
            </h2>
            <div className="space-y-3.5 mb-8">
              {[
                "Free to design — no credit card needed",
                "AI automatically organizes your photos",
                "50+ professional templates",
                "Download as PDF or order printed copy",
                "eSewa & Khalti payment supported",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white/80 text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "500+", label: "Books Created" },
                { value: "4.9★", label: "Rating" },
                { value: "Nepal", label: "Based" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20"
                >
                  <p className="text-white font-bold">{stat.value}</p>
                  <p className="text-white/50 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;