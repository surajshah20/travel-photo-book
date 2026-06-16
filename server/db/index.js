// server/db/index.js

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
});

// Test connection on startup
pool.query("SELECT NOW()").then(() => {
  console.log("✅ Database connected");
}).catch(err => {
  console.error("❌ Database connection failed:", err.message);
  process.exit(1);
});

module.exports = pool;