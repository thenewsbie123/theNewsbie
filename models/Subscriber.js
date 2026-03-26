// models/Subscriber.js
const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    date:  { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscriber", subscriberSchema);
