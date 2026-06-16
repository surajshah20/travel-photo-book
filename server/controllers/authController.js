// server/controllers/authController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

// ─── Safe user fields — NEVER include password ────────────
const SAFE_USER_FIELDS = `
  id, name, email, avatar_url, auth_provider, is_admin, created_at
`;

const signToken = (user) =>
  jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      is_admin: user.is_admin // ✅ Added admin flag to the secure payload
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// ✅ Helper to attach secure cookie
const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true, // Blocks JavaScript from reading the cookie (prevents XSS)
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// ─── Register ─────────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (name.trim().length < 2) {
    return res.status(400).json({ error: "Name must be at least 2 characters" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const hash = await bcrypt.hash(password, 12);

    const result = await db.query(
      `INSERT INTO users (name, email, password, auth_provider)
       VALUES ($1, $2, $3, 'email')
       RETURNING ${SAFE_USER_FIELDS}`,
      [name.trim(), email.toLowerCase().trim(), hash]
    );

    const user = result.rows[0];
    const token = signToken(user);
    
    setAuthCookie(res, token); // ✅ Issue Cookie
    res.status(201).json({ user }); // ✅ Removed token from payload
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};

// ─── Login ────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await db.query(
      `SELECT id, name, email, password, avatar_url, auth_provider, is_admin
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];

    // Constant-time comparison to prevent timing attacks
    const passwordToCheck = password;
    const hashToCompare = user?.password || "$2b$12$invalidhashfortimingatack";
    const match = await bcrypt.compare(passwordToCheck, hashToCompare);

    if (!user || !match) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    if (user.auth_provider === "google" && !user.password) {
      return res.status(401).json({
        error: "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    const { password: _pw, ...safeUser } = user;
    const token = signToken(safeUser);
    
    setAuthCookie(res, token); // ✅ Issue Cookie
    res.json({ user: safeUser }); // ✅ Removed token from payload
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
};

// ─── Logout ───────────────────────────────────────────────
const logout = (req, res) => {
  // ✅ Tell the browser to delete the cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ message: "Logged out successfully" });
};

// ─── Verify Token ─────────────────────────────────────────
const verifyToken = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT ${SAFE_USER_FIELDS} FROM users WHERE id = $1`,
      [req.user.id] // req.user comes from your authMiddleware verifying the cookie
    );
    if (!result.rows.length) {
      return res.status(401).json({ error: "User not found" });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
};

// ─── Google OAuth Callback ────────────────────────────────
const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    const token = signToken(user);
    setAuthCookie(res, token); // ✅ Securely issue cookie

    // ✅ Clean redirect URL without exposing the token
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback` +
      `?name=${encodeURIComponent(user.name)}` +
      `&email=${encodeURIComponent(user.email)}` +
      `&id=${user.id}`
    );
  } catch (err) {
    console.error("Google callback error:", err);
    res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
  }
};

// Export logout as well
module.exports = { register, login, logout, verifyToken, googleCallback };