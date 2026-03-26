// models/User.js
// Defines the structure of a "User" in your database.
// Based on your DEFAULT_USERS in script.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,  // No two users can have the same username
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "editor", "contributor", "viewer"], // Only these 4 roles allowed
      default: "viewer",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Before saving a user, hash (encrypt) their password
userSchema.pre("save", async function () {
  // Only hash if the password was changed (not on every save)
  if (!this.isModified("password")) 
    return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
});

// Method to check if a typed password matches the stored hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
