// models/Author.js
// Defines the structure of an "Author" profile in your database.
// Based on DEFAULT_AUTHORS in script.js

const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    role: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    avatar: {
      type: String, // URL or base64 image
      default: "",
    },
    social: {
      tw:  { type: String, default: "" }, // Twitter/X username
      li:  { type: String, default: "" }, // LinkedIn username
      ig:  { type: String, default: "" }, // Instagram username
      fb:  { type: String, default: "" }, // Facebook username
      web: { type: String, default: "" }, // Personal website URL
    },
  },
  {
    timestamps: true,
  }
);

const Author = mongoose.model("Author", authorSchema);
module.exports = Author;
