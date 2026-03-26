// models/User.js
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ["admin", "editor", "contributor", "viewer"], default: "viewer" },
  },
  { timestamps: true }
);

// Hash the password before saving — runs on User.create() and user.save()
userSchema.pre("save", async function (next) {
  // Only hash if the password field was actually changed (avoids double-hashing)
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare a plain-text password against the stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
