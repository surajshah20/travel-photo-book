// server/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const { register, login, verifyToken, googleCallback } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

// ── Email/Password Auth ──────────────────────────────────
router.post("/register", register);
router.post("/login", login);
router.get("/verify", protect, verifyToken);

// ── Google OAuth ─────────────────────────────────────────
// Step 1 — Redirect user to Google
router.get("/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Step 2 — Google redirects back here
router.get("/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  googleCallback
);

module.exports = router;