// models/Highlight.js
// Defines the structure of a "Highlight" (ticker item) in your database.
// Based on DEFAULT_HIGHLIGHTS in script.js

const mongoose = require("mongoose");

const highlightSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Highlight text is required"],
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: true, // Shows in the ticker by default
    },
    type: {
      type: String,
      enum: ["custom", "article"],
      default: "custom",
    },
    order: {
      type: Number,
      default: 0, // Used for drag-and-drop ordering
    },
  },
  {
    timestamps: true,
  }
);

const Highlight = mongoose.model("Highlight", highlightSchema);
module.exports = Highlight;
