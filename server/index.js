require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./db");

const authRoutes = require("./routes/authRoutes");
const photoRoutes = require("./routes/photoRoutes");
const bookRoutes = require("./routes/bookRoutes");
const templateRoutes = require("./routes/templateRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/templates", templateRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Travel Photo Book API is running ✅" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});