// routes/editorials.js
// Handles CRUD operations for Editorial & Opinion pieces.

const express = require("express");
const router = express.Router();
const Editorial = require("../models/Editorial");
const protect = require("../middleware/authMiddleware");

// GET /api/editorials — Get all editorials (public)
router.get("/", async (req, res) => {
  try {
    const editorials = await Editorial.find().sort({ createdAt: -1 });
    res.json(editorials);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/editorials/:id — Get a single editorial (public)
router.get("/:id", async (req, res) => {
  try {
    const editorial = await Editorial.findById(req.params.id);
    if (!editorial) return res.status(404).json({ message: "Editorial not found" });
    res.json(editorial);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/editorials — Create a new editorial (requires login)
router.post("/", protect, async (req, res) => {
  try {
    const editorial = await Editorial.create({
      ...req.body,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      }),
    });
    res.status(201).json(editorial);
  } catch (error) {
    res.status(400).json({ message: "Validation error", error: error.message });
  }
});

// PUT /api/editorials/:id — Update an editorial (requires login)
router.put("/:id", protect, async (req, res) => {
  try {
    const editorial = await Editorial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!editorial) return res.status(404).json({ message: "Editorial not found" });
    res.json(editorial);
  } catch (error) {
    res.status(400).json({ message: "Update error", error: error.message });
  }
});

// DELETE /api/editorials/:id — Delete an editorial (requires login)
router.delete("/:id", protect, async (req, res) => {
  try {
    const editorial = await Editorial.findByIdAndDelete(req.params.id);
    if (!editorial) return res.status(404).json({ message: "Editorial not found" });
    res.json({ message: "Editorial deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PATCH /api/editorials/:id/visibility — Toggle visibility (requires login)
router.patch("/:id/visibility", protect, async (req, res) => {
  try {
    const editorial = await Editorial.findById(req.params.id);
    if (!editorial) return res.status(404).json({ message: "Editorial not found" });

    editorial.visible = !editorial.visible;
    await editorial.save();
    res.json(editorial);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PATCH /api/editorials/:id/pick — Toggle Editor's Pick (requires login)
router.patch("/:id/pick", protect, async (req, res) => {
  try {
    // Remove pick from all others first
    await Editorial.updateMany({}, { isPick: false });

    const editorial = await Editorial.findById(req.params.id);
    if (!editorial) return res.status(404).json({ message: "Editorial not found" });

    editorial.isPick = !editorial.isPick;
    await editorial.save();
    res.json(editorial);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
