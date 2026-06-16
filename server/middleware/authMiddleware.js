const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // 1. Look for the token in the cookies FIRST, then fallback to headers
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attaches { id, email } to req.user
    next();
  } catch (err) {
    // If the cookie is expired or invalid, clear it
    res.clearCookie("token");
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;