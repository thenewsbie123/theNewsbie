// models/Author.js
const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true },
    role:   { type: String, default: "" },
    bio:    { type: String, default: "" },
    avatar: { type: String, default: "" },
    social: {
      tw:  { type: String, default: "" },
      li:  { type: String, default: "" },
      ig:  { type: String, default: "" },
      fb:  { type: String, default: "" },
      web: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Author", authorSchema);
