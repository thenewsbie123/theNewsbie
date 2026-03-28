// models/User.js
// ─────────────────────────────────────────────────────────────────────────────
// BUG FIXED: The pre('save') hook was written as:
//
//   userSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();   // ← next is undefined
//     this.password = await bcrypt.hash(this.password, 12);
//     next();   // ← TypeError: next is not a function
//   });
//
// In Mongoose 6+ async middleware does NOT receive a `next` callback.
// Mongoose awaits the Promise returned by the async function automatically.
// Calling next() throws TypeError and crashes every User.save() call.
//
// FIX: Remove `next` from the parameter list entirely.
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role:     {
      type:    String,
      enum:    ['admin', 'editor', 'contributor', 'viewer'],
      default: 'viewer',
    },
  },
  { timestamps: true }
);

// ── Pre-save hook (CORRECT async style — no next parameter) ──────────────────
userSchema.pre('save', async function () {
  // Only hash when the password field has actually changed.
  // This prevents double-hashing on unrelated updates (e.g. role changes).
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  // No next() call — Mongoose awaits the returned Promise automatically.
});

// ── Instance method: compare a plain-text password against the stored hash ──
userSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Alias — server.js uses checkPassword(), seed uses matchPassword()
userSchema.methods.checkPassword = userSchema.methods.matchPassword;

module.exports = mongoose.model('User', userSchema);
