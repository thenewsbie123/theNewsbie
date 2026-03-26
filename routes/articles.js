// routes/articles.js
// Handles CRUD operations for articles.
const upload = require("../middleware/upload");
const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const protect = require("../middleware/authMiddleware");

// GET /api/articles — Get all published articles (public)
router.get("/", async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    else filter.status = "published"; // Default: only published

    const articles = await Article.find(filter).sort({ createdAt: -1 }); // Newest first
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    imageUrl: "/uploads/" + req.file.filename
  });
});

// GET /api/articles/:id — Get a single article by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/articles — Create a new article (requires login)
router.post("/", protect, async (req, res) => {
  try {
    const article = await Article.create({
      ...req.body,
      createdBy: req.user.username,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    });
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: "Validation error", error: error.message });
  }
});

// PUT /api/articles/:id — Update an article (requires login)
router.put("/:id", protect, async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastEdited: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), lastEditedBy: req.user.username },
      { new: true, runValidators: true }
    );
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (error) {
    res.status(400).json({ message: "Update error", error: error.message });
  }
});

// DELETE /api/articles/:id — Delete an article (requires login)
router.delete("/:id", protect, async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/articles/:id/comments — Add a comment (public)
router.post("/:id/comments", async (req, res) => {
  try {
    const { name, text } = req.body;
    if (!name || !text) return res.status(400).json({ message: "Name and text are required" });

    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    article.comments.push({
      name,
      text,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    });
    await article.save();
    res.status(201).json(article.comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
