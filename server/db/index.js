// server/db/index.js
// This file connects our Express app to PostgreSQL

const { Pool } = require("pg");

// Pool manages multiple database connections efficiently
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test the connection when server starts
pool.connect()
  .then(() => console.log("PostgreSQL connected ✅"))
  .catch((err) => console.error("DB connection error:", err.message));

// We export query so any file can talk to the database
module.exports = {
  query: (text, params) => pool.query(text, params),
};