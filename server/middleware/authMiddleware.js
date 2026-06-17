// server/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const db = require("../db");

const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Fetch the current user from the DB instead of trusting stale JWT fields
    const result = await db.query(
      "SELECT id, name, email, is_admin FROM users WHERE id = $1",
      [decoded.id]
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: "User no longer exists." });
    }

    req.user = result.rows[0]; // Now includes is_admin, always fresh
    next();
  } catch (err) {
    res.clearCookie("token");
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;