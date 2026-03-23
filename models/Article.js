// models/Article.js
// Defines the structure of an "Article" in your database.
// Based on DEFAULT_ARTICLES in script.js

const mongoose = require("mongoose");

// Sub-schema for comments (articles can have many comments)
const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: String },
});

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author", // Links to the Author collection
      default: null,
    },
    category: {
      type: String,
      enum: ["World", "Politics", "Technology", "Culture", "Science", "Opinion", "Business", "Editorial"],
      default: "World",
    },
    date: {
      type: String, // Stored as a readable string e.g. "March 20, 2026"
    },
    readTime: {
      type: String,
      default: "1 min read",
    },
    excerpt: {
      type: String,
      default: "",
    },
    tags: {
      type: [String], // Array of strings e.g. ["Oil", "Geopolitics"]
      default: [],
    },
    img: {
      type: String, // URL or base64 image data
      default: "",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["published", "pending", "draft"],
      default: "published",
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    createdBy: {
      type: String, // Username of who created it
      default: "",
    },
    lastEdited: {
      type: String,
    },
    lastEditedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Article = mongoose.model("Article", articleSchema);
module.exports = Article;
