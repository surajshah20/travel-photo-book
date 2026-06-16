// client/src/pages/NotFound.jsx

import { useNavigate } from "react-router-dom";
import Logo from "../design-system/Logo";
import { C } from "../design-system/index";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: "100vh", background: C.bgSoft,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: "32px 24px", textAlign: "center",
    }}>
      <div style={{ marginBottom: 32 }}><Logo size={22} /></div>
      <p style={{ fontSize: 72, fontWeight: 800, color: C.roseMid, margin: "0 0 8px", lineHeight: 1 }}>
        404
      </p>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: C.ink, margin: "0 0 10px", letterSpacing: "-0.03em" }}>
        Page not found
      </h1>
      <p style={{ fontSize: 14, color: C.muted, margin: "0 0 28px", maxWidth: 300, lineHeight: 1.65 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          background: C.ink, color: "#fff",
          border: "none", borderRadius: 100,
          padding: "12px 26px", fontSize: 13, fontWeight: 700,
          cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
        onMouseEnter={e => e.currentTarget.style.background = C.rose}
        onMouseLeave={e => e.currentTarget.style.background = C.ink}
      >
        Back to homepage
      </button>
    </div>
  );
};

export default NotFound;