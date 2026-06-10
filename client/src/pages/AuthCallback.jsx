// client/src/pages/AuthCallback.jsx

import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginUser } = useAuth();

  const [status, setStatus] = useState("processing");

  // ✅ Prevent double execution (fixes infinite loop)
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const id = searchParams.get("id");
    const error = searchParams.get("error");

    // ❌ OAuth error from backend
    if (error) {
      setStatus("error");
      setTimeout(() => navigate("/login?error=oauth_failed", { replace: true }), 2000);
      return;
    }

    // ❌ Missing required data
    if (!token || !email) {
      setStatus("error");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
      return;
    }

    // ✅ Create user object safely
    const user = {
      id: id ? parseInt(id) : null,
      name: name ? decodeURIComponent(name) : "",
      email: decodeURIComponent(email),
    };

    try {
      // ✅ Save auth state
      loginUser(user, token);
      setStatus("success");

      // ✅ Redirect after short delay
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);
    } catch (err) {
      console.error("Login callback error:", err);
      setStatus("error");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    }
  }, [searchParams, navigate, loginUser]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            blush<span className="text-rose-500">book</span>
          </span>
        </div>

        {/* Processing */}
        {status === "processing" && (
          <>
            <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              Signing you in with Google...
            </p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold mb-1">
              Signed in successfully!
            </p>
            <p className="text-gray-400 text-sm">
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold mb-1">
              Sign in failed
            </p>
            <p className="text-gray-400 text-sm">
              Redirecting back to login...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;