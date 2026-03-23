// routes/highlights.js
// Handles CRUD operations for the Breaking News Ticker highlights.

const express = require("express");
const router = express.Router();
const Highlight = require("../models/Highlight");
const protect = require("../middleware/authMiddleware");

// GET /api/highlights — Get all highlights, ordered by .order field (public)
router.get("/", async (req, res) => {
  try {
    const highlights = await Highlight.find().sort({ order: 1, createdAt: 1 });
    res.json(highlights);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/highlights — Create a new highlight (requires login)
router.post("/", protect, async (req, res) => {
  try {
    const count = await Highlight.countDocuments();
    const highlight = await Highlight.create({ ...req.body, order: count + 1 });
    res.status(201).json(highlight);
  } catch (error) {
    res.status(400).json({ message: "Validation error", error: error.message });
  }
});

// ⚠️  BUG FIX: These two specific routes MUST come BEFORE PUT /:id and DELETE /:id
// Otherwise Express reads "reorder" and "all" as an :id value and these are never reached.

// PUT /api/highlights/reorder/save — Save drag-and-drop order (requires login)
// Body: { orderedIds: ["id1", "id2", "id3", ...] }
router.put("/reorder/save", protect, async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "orderedIds must be an array" });
    }

    const updates = orderedIds.map((id, index) =>
      Highlight.findByIdAndUpdate(id, { order: index + 1 })
    );
    await Promise.all(updates);

    const highlights = await Highlight.find().sort({ order: 1 });
    res.json(highlights);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/highlights/all/clear — Clear all highlights (requires login)
router.delete("/all/clear", protect, async (req, res) => {
  try {
    await Highlight.deleteMany({});
    res.json({ message: "All highlights cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT /api/highlights/:id — Update a highlight (requires login)
router.put("/:id", protect, async (req, res) => {
  try {
    const highlight = await Highlight.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!highlight) return res.status(404).json({ message: "Highlight not found" });
    res.json(highlight);
  } catch (error) {
    res.status(400).json({ message: "Update error", error: error.message });
  }
});

// DELETE /api/highlights/:id — Delete a highlight (requires login)
router.delete("/:id", protect, async (req, res) => {
  try {
    const highlight = await Highlight.findByIdAndDelete(req.params.id);
    if (!highlight) return res.status(404).json({ message: "Highlight not found" });
    res.json({ message: "Highlight deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PATCH /api/highlights/:id/toggle — Enable or disable a highlight (requires login)
router.patch("/:id/toggle", protect, async (req, res) => {
  try {
    const highlight = await Highlight.findById(req.params.id);
    if (!highlight) return res.status(404).json({ message: "Highlight not found" });

    highlight.enabled = !highlight.enabled;
    await highlight.save();
    res.json(highlight);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
