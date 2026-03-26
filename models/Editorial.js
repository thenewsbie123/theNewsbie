// models/Editorial.js
const mongoose = require("mongoose");

const editorialSchema = new mongoose.Schema(
  {
    type:        { type: String, enum: ["Editorial", "Opinion"], default: "Editorial" },
    title:       { type: String, required: true, trim: true },
    subtitle:    { type: String, default: "" },
    author:      { type: String, required: true },
    authorTitle: { type: String, default: "" },
    authorBio:   { type: String, default: "" },
    content:     { type: String, required: true },
    img:         { type: String, default: "" },
    tags:        { type: [String], default: [] },
    date:        { type: String, default: "" },
    readTime:    { type: String, default: "" },
    relatedId:   { type: String, default: null },   // _id of a related Article
    isPick:      { type: Boolean, default: false },
    visible:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Editorial", editorialSchema);
