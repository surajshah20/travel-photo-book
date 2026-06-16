// client/src/pages/AuthCallback.jsx
// BlushBook — Secure OAuth Callback Handler

import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../design-system/Logo";
import { C } from "../design-system/index";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginUser } = useAuth();

  const [status, setStatus] = useState("processing");

  // Prevent double execution in React Strict Mode
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // Notice: We NO LONGER extract a token here. The secure httpOnly cookie handles it!
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
    if (!email || !id) {
      setStatus("error");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
      return;
    }

    // ✅ Create user object safely
    const user = {
      id: parseInt(id),
      name: name ? decodeURIComponent(name) : "",
      email: decodeURIComponent(email),
    };

    try {
      // ✅ Save auth state (no token needed, cookie is already set by backend)
      loginUser(user);
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
    <div style={{
      minHeight: "100vh", background: C.bgSoft,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{
        background: "#fff", border: `1px solid ${C.line}`,
        borderRadius: 24, padding: "48px 40px",
        textAlign: "center", boxShadow: "0 12px 40px rgba(0,0,0,0.04)",
        width: "100%", maxWidth: 400
      }}>
        
        {/* Logo */}
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "center" }}>
          <Logo size={24} clickable={false} />
        </div>

        {/* Processing State */}
        {status === "processing" && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div style={{
              width: 48, height: 48, border: `4px solid ${C.roseSoft}`,
              borderTopColor: C.rose, borderRadius: "50%",
              animation: "spin 0.8s linear infinite", margin: "0 auto 20px"
            }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: "0 0 6px" }}>
              Securely signing you in...
            </h2>
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
              Please wait while we set up your session.
            </p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div style={{
              width: 56, height: 56, background: "#DCFCE7",
              borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 20px"
            }}>
              <CheckCircle size={28} color="#16A34A" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: "0 0 6px" }}>
              Welcome back!
            </h2>
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
              Redirecting to your workspace...
            </p>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div style={{
              width: 56, height: 56, background: "#FEE2E2",
              borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 20px"
            }}>
              <AlertCircle size={28} color="#DC2626" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: "0 0 6px" }}>
              Authentication Failed
            </h2>
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
              Redirecting back to login...
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AuthCallback;