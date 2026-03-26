// server.js
// The main entry point for your backend server.

require("dotenv").config(); // Load .env variables FIRST
const path    = require("path");
const fs      = require("fs");
const express = require("express");
const connectDB = require("./config/db");

const app  = express();
const PORT = process.env.PORT || 8080;

// ── Ensure uploads folder exists (Railway filesystem is ephemeral but this
//    at least prevents a crash if the folder is missing at cold start) ─────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Connect to MongoDB ──────────────────────────────────────────────────────
connectDB();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));        // Parse JSON bodies (10 mb for base64 images)
app.use(express.urlencoded({ extended: true })); // Parse form data

// Serve uploaded images at /uploads/<filename>
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve the frontend (HTML / CSS / JS) from the thenewsbie folder
app.use(express.static(path.join(__dirname, "thenewsbie")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "thenewsbie", "index.html"));
});

// ── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth",        require("./routes/auth"));
app.use("/api/articles",    require("./routes/articles"));
app.use("/api/authors",     require("./routes/authors"));
app.use("/api/editorials",  require("./routes/editorials"));
app.use("/api/highlights",  require("./routes/highlights"));
app.use("/api/subscribers", require("./routes/subscribers"));
app.use("/api/users",       require("./routes/users"));

// ── Health Check ────────────────────────────────────────────────────────────
app.get("/api", (req, res) => {
  res.json({ message: "✅ Newsbie API is running", status: "ok" });
});

// ── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});