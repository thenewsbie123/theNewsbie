// seed.js
// Run this ONCE to populate your database with default data from script.js.
// Usage: node seed.js

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const User       = require("./models/User");
const Article    = require("./models/Article");
const Author     = require("./models/Author");
const Highlight  = require("./models/Highlight");
const Editorial  = require("./models/Editorial");
const Subscriber = require("./models/Subscriber");

// ── Default Data (copied from your script.js) ────────────────────────────────

const DEFAULT_USERS = [
  { name: "Naman",         username: "naman2170",   password: "Naman123",   role: "admin" },
  { name: "Sarah Mitchell",username: "editor",      password: "editor123",  role: "editor" },
  { name: "James Okafor", username: "contributor",  password: "contrib123", role: "contributor" },
  { name: "Guest Reviewer",username: "viewer",      password: "view123",    role: "viewer" },
];

const DEFAULT_AUTHORS = [
  {
    name: "Alexandra Reinholt",
    role: "Senior Foreign Affairs Correspondent",
    bio: "Alexandra covers geopolitics, energy markets, and security affairs for The Newsbie. She has reported from 40+ countries.",
    avatar: "",
    social: { tw: "alexreinholt", li: "", ig: "", fb: "", web: "" },
  },
  {
    name: "Marcus Chen",
    role: "Technology & Democracy Correspondent",
    bio: "Marcus writes on the intersection of technology, society, and political systems. Former researcher at Stanford Internet Observatory.",
    avatar: "",
    social: { tw: "marcuschen", li: "marcuschen", ig: "", fb: "", web: "" },
  },
  {
    name: "Dr. Elena Vasquez",
    role: "Science & Environment Editor",
    bio: "Dr. Vasquez holds a PhD in Climate Science from MIT. She leads The Newsbie's environmental coverage.",
    avatar: "",
    social: { tw: "", li: "", ig: "", fb: "", web: "https://elenavasquez.com" },
  },
];

const DEFAULT_HIGHLIGHTS = [
  { text: "BREAKING: Global oil prices surge past $82/barrel amid Hormuz tension escalation", enabled: true, type: "custom", order: 1 },
  { text: "LATEST: OPEC+ emergency meeting called — production cut extension on agenda",         enabled: true, type: "custom", order: 2 },
  { text: "UPDATE: EU passes landmark AI transparency legislation",                              enabled: true, type: "custom", order: 3 },
  { text: "DEVELOPING: Arctic permafrost thaw accelerating beyond 2025 climate projections",    enabled: true, type: "custom", order: 4 },
];

// ── Seed Function ─────────────────────────────────────────────────────────────

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("🗑  Clearing existing data...");
    await User.deleteMany({});
    await Author.deleteMany({});
    await Article.deleteMany({});
    await Highlight.deleteMany({});
    await Editorial.deleteMany({});
    await Subscriber.deleteMany({});

    console.log("👤 Seeding users...");
    await User.create(DEFAULT_USERS);

    console.log("✍️  Seeding authors...");
    await Author.create(DEFAULT_AUTHORS);

    console.log("🔴 Seeding highlights...");
    await Highlight.create(DEFAULT_HIGHLIGHTS);

    console.log("✅ Database seeded successfully!");
    console.log("\n📋 Login credentials:");
    console.log("   admin:       naman2170  / Naman123");
    console.log("   editor:      editor     / editor123");
    console.log("   contributor: contributor/ contrib123");
    console.log("   viewer:      viewer     / view123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();
