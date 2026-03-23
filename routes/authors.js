// routes/authors.js
// Handles CRUD operations for Author profiles.

const express = require("express");
const router = express.Router();
const Author = require("../models/Author");
const protect = require("../middleware/authMiddleware");

// GET /api/authors — Get all authors (public)
router.get("/", async (req, res) => {
  try {
    const authors = await Author.find().sort({ createdAt: -1 });
    res.json(authors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/authors/:id — Get a single author (public)
router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ message: "Author not found" });
    res.json(author);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/authors — Create a new author (requires login)
router.post("/", protect, async (req, res) => {
  try {
    const author = await Author.create(req.body);
    res.status(201).json(author);
  } catch (error) {
    res.status(400).json({ message: "Validation error", error: error.message });
  }
});

// PUT /api/authors/:id — Update an author (requires login)
router.put("/:id", protect, async (req, res) => {
  try {
    const author = await Author.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!author) return res.status(404).json({ message: "Author not found" });
    res.json(author);
  } catch (error) {
    res.status(400).json({ message: "Update error", error: error.message });
  }
});

// DELETE /api/authors/:id — Delete an author (requires login)
router.delete("/:id", protect, async (req, res) => {
  try {
    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) return res.status(404).json({ message: "Author not found" });
    res.json({ message: "Author deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
