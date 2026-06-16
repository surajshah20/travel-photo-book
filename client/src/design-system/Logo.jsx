// client/src/design-system/Logo.jsx
// BlushBook — single reusable Logo component

import { useNavigate } from "react-router-dom";
import { C } from "./index";

const Logo = ({ size = 22, dark = false, clickable = true }) => {
  const navigate = useNavigate();

  return (
    <span
      onClick={() => { if (clickable) navigate("/"); }}
      style={{
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        fontSize: size,
        letterSpacing: "-0.03em",
        lineHeight: 1,
        userSelect: "none",
        cursor: clickable ? "pointer" : "default",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <span style={{ fontWeight: 300, color: dark ? "#fff" : C.ink }}>blush</span>
      <span style={{ fontWeight: 800, color: dark ? "#fff" : C.ink }}>book</span>
      <span style={{ fontWeight: 800, color: C.rose, marginLeft: 1 }}>•</span>
    </span>
  );
};

export default Logo;