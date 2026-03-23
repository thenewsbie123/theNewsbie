// routes/users.js
// Handles team member management (admin only).

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

// GET /api/users — Get all users (requires login)
router.get("/", protect, async (req, res) => {
  try {
    // Never return passwords — use .select("-password")
    const users = await User.find().select("-password").sort({ createdAt: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/users — Add a new team member (requires login)
router.post("/", protect, async (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ message: "Name, username and password are required" });
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const user = await User.create({ name, username, password, role: role || "viewer" });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    res.status(400).json({ message: "Validation error", error: error.message });
  }
});

// PATCH /api/users/:id/role — Change a user's role (requires login)
// Body: { role: "editor" }
router.patch("/:id/role", protect, async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["admin", "editor", "contributor", "viewer"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/users/:id — Remove a user (requires login)
router.delete("/:id", protect, async (req, res) => {
  try {
    // Prevent a user from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
