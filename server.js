// server.js
// The main entry point for your backend server.

require("dotenv").config(); // Load .env variables FIRST
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const app = express();
const PORT = process.env.PORT || 10000;

// ── Connect to MongoDB ──────────────────────────
connectDB();

// ── Middleware ──────────────────────────────────
app.use(express.json({ limit: "10mb" }));        // Parse JSON request bodies (10mb for base64 images)
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.static(__dirname));              // Serve your HTML/CSS/JS files

// ── API Routes ──────────────────────────────────
app.use("/api/auth",        require("./routes/auth"));
app.use("/api/articles",    require("./routes/articles"));
app.use("/api/authors",     require("./routes/authors"));
app.use("/api/editorials",  require("./routes/editorials"));
app.use("/api/highlights",  require("./routes/highlights"));
app.use("/api/subscribers", require("./routes/subscribers"));
app.use("/api/users",       require("./routes/users"));

// ── Health Check ────────────────────────────────
app.get("/api", (req, res) => {
  res.json({ message: "✅ Newsbie API is running", status: "ok" });
});

// ── Start Server ────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

console.log("Deploying new version...");