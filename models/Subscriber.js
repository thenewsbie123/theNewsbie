// models/Subscriber.js
// Defines the structure of a newsletter "Subscriber" in your database.

const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // No duplicate emails
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    date: {
      type: String, // Readable date string e.g. "March 20, 2026"
    },
  },
  {
    timestamps: true,
  }
);

const Subscriber = mongoose.model("Subscriber", subscriberSchema);
module.exports = Subscriber;
