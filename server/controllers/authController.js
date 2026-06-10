// server/controllers/authController.js
// Production-ready auth with proper validation

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

// ─── REGISTER ─────────────────────────────────────────────
const register = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // ── Validation ──────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Normalize email
    email = email.toLowerCase().trim();
    name = name.trim();

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    // Password strength
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: "Password must contain at least one uppercase letter" });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ error: "Password must contain at least one lowercase letter" });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: "Password must contain at least one number" });
    }

    // Check duplicate email
    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
      [name, email, hashedPassword]
    );

    const user = result.rows[0];

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });

  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Server error. Please try again." });
  }
};

// ─── LOGIN ────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    let { email, password, rememberMe } = req.body;

    // ── Validation ──────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    email = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    // Find user
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    // Use same error for both wrong email and wrong password
    // (prevents email enumeration attacks)
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Token expiry — 30 days if remember me, 7 days otherwise
    const expiresIn = rememberMe ? "30d" : "7d";

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error. Please try again." });
  }
};

// ─── VERIFY TOKEN ─────────────────────────────────────────
// Frontend calls this to verify token is still valid
const verifyToken = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const result = await db.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Verify error:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { register, login, verifyToken };

// server/config/passport.js
// Add this to the bottom of authController.js
// ─── GOOGLE OAUTH CALLBACK ────────────────────────────────
// Called after Google redirects back to our server
const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=oauth_failed`
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Redirect to frontend with token in URL
    // Frontend will extract it and save to localStorage
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&id=${user.id}`
    );

  } catch (err) {
    console.error("Google callback error:", err);
    res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
  }
};

module.exports = { register, login, verifyToken, googleCallback };