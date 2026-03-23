// models/Editorial.js
// Defines the structure of an "Editorial" in your database.
// Based on DEFAULT_EDITORIALS in script.js

const mongoose = require("mongoose");

const editorialSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Editorial", "Opinion", "Analysis", "Perspective"],
      default: "Editorial",
    },
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
    authorTitle: {
      type: String,
      default: "",
    },
    authorBio: {
      type: String,
      default: "",
    },
    date: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    img: {
      type: String,
      default: "",
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article", // Links to a related Article
      default: null,
    },
    isPick: {
      type: Boolean,
      default: false, // Editor's Pick flag
    },
    visible: {
      type: Boolean,
      default: true, // Whether it shows on homepage
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    readTime: {
      type: String,
      default: "1 min read",
    },
  },
  {
    timestamps: true,
  }
);

const Editorial = mongoose.model("Editorial", editorialSchema);
module.exports = Editorial;
