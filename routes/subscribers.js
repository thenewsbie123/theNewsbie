// routes/subscribers.js
// Handles newsletter subscriber management.

const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");
const protect = require("../middleware/authMiddleware");

// POST /api/subscribers — Subscribe with an email (public — anyone can subscribe)
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "This email is already subscribed" });
    }

    const subscriber = await Subscriber.create({
      email,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      }),
    });

    res.status(201).json({ message: "Subscribed successfully!", subscriber });
  } catch (error) {
    res.status(400).json({ message: "Validation error", error: error.message });
  }
});

// GET /api/subscribers — Get all subscribers (requires login)
router.get("/", protect, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ⚠️  BUG FIX: /all/clear MUST come BEFORE /:id
// Otherwise Express reads "all" as an :id and this route is never reached.

// DELETE /api/subscribers/all/clear — Remove ALL subscribers (requires login)
router.delete("/all/clear", protect, async (req, res) => {
  try {
    await Subscriber.deleteMany({});
    res.json({ message: "All subscribers cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/subscribers/:id — Remove a single subscriber by ID (requires login)
router.delete("/:id", protect, async (req, res) => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) return res.status(404).json({ message: "Subscriber not found" });
    res.json({ message: "Subscriber removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
