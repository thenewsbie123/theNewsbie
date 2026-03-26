// models/Article.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: String },
  },
  { _id: true }
);

const articleSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    subtitle:    { type: String, default: "" },
    author:      { type: String, required: true },
    authorId:    { type: String, default: null },   // reference to Author._id (stored as string for flexibility)
    category:    { type: String, required: true, enum: ["World", "Politics", "Technology", "Science", "Culture", "Opinion", "Editorial", "Business"] },
    content:     { type: String, required: true },
    excerpt:     { type: String, default: "" },
    img:         { type: String, default: "" },
    tags:        { type: [String], default: [] },
    featured:    { type: Boolean, default: false },
    status:      { type: String, enum: ["published", "pending", "draft"], default: "published" },
    readTime:    { type: String, default: "" },
    date:        { type: String, default: "" },       // human-readable date set by the route
    lastEdited:  { type: String, default: "" },
    lastEditedBy:{ type: String, default: "" },
    createdBy:   { type: String, default: "" },
    comments:    { type: [commentSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);
