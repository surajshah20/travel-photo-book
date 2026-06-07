// server/middleware/authMiddleware.js
// This protects routes — only logged in users can access them

const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  // Frontend sends token in the header like: "Bearer eyJhbG..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token, access denied" });
  }

  // Extract just the token part after "Bearer "
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request so next function can use it
    req.user = decoded;

    next(); // Move to the actual route handler
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = protect;