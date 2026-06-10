import React from "react";

const C = {
  rose: "#C8345A",
  ink: "#0F0F0F",
};

const Logo = ({ size = 22, dark = false, onClick }) => {
  return (
    <span
      onClick={onClick}
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: size,
        letterSpacing: "-0.03em",
        lineHeight: 1,
        userSelect: "none",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span style={{ fontWeight: 300, color: dark ? "#fff" : C.ink }}>
        blush
      </span>
      <span style={{ fontWeight: 800, color: dark ? "#fff" : C.ink }}>
        book
      </span>
      <span style={{ fontWeight: 800, color: C.rose, marginLeft: 2 }}>
        •
      </span>
    </span>
  );
};

export default Logo;