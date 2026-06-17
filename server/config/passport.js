// server/config/passport.js
// Google OAuth strategy configuration

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../db");

// ✅ Bulletproof Callback URL routing
const isProd = process.env.NODE_ENV === "production";
const CALLBACK_URL = isProd 
  ? "https://blushbook-api.onrender.com/api/auth/google/callback" 
  : "http://localhost:5000/api/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL, // ✅ Uses the bulletproof URL
      proxy: true // ✅ CRITICAL: Tells Passport to trust the Render/Cloudflare proxy for HTTPS
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase();
        const googleId = profile.id;
        const name = profile.displayName;
        const avatarUrl = profile.photos?.[0]?.value;

        // Check if user exists with this Google ID
        const existingByGoogle = await db.query(
          "SELECT * FROM users WHERE google_id = $1",
          [googleId]
        );

        if (existingByGoogle.rows.length > 0) {
          // Existing Google user — update avatar and return
          const user = existingByGoogle.rows[0];
          await db.query(
            "UPDATE users SET avatar_url = $1 WHERE id = $2",
            [avatarUrl, user.id]
          );
          return done(null, user);
        }

        // Check if email already exists (email/password account)
        const existingByEmail = await db.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );

        if (existingByEmail.rows.length > 0) {
          // Link Google to existing email account
          const user = existingByEmail.rows[0];
          await db.query(
            "UPDATE users SET google_id = $1, avatar_url = $2, auth_provider = $3 WHERE id = $4",
            [googleId, avatarUrl, "google", user.id]
          );
          return done(null, { ...user, google_id: googleId, avatar_url: avatarUrl });
        }

        // New user — create account
        const result = await db.query(
          `INSERT INTO users (name, email, google_id, avatar_url, auth_provider)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, name, email, google_id, avatar_url, auth_provider`,
          [name, email, googleId, avatarUrl, "google"]
        );

        return done(null, result.rows[0]);

      } catch (err) {
        console.error("Google OAuth error:", err);
        return done(err, null);
      }
    }
  )
);

// Serialize/deserialize (required by passport even if not using sessions)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;