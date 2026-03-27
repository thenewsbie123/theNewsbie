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

// ─────────────────────────────────────────────────────────────────────────────
// CORRECT async pre-save middleware — NO `next` parameter, NO next() calls.
//
// WHY: In Mongoose 6+, middleware can be written in two styles:
//
//   Style A — callback (old):   schema.pre('save', function(next) { ...; next(); })
//   Style B — async (modern):   schema.pre('save', async function() { ... })
//
// When Mongoose sees an `async` function it awaits the returned Promise to
// know when the hook is done. It does NOT pass `next` as a parameter.
// If you write `async function(next)`, that parameter slot receives `undefined`
// from Mongoose, and calling `next()` throws:
//   TypeError: next is not a function
//
// The fix is simple: remove `next` from the parameter list and replace
// `return next()` with plain `return`.
// ─────────────────────────────────────────────────────────────────────────────
userSchema.pre("save", async function () {
  // Skip hashing if the password field hasn't changed (prevents double-hashing
  // on unrelated updates like role changes).
  if (!this.isModified("password")) return;

  const salt    = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // No next() — Mongoose awaits this async function's Promise automatically.
});

// Compare a plain-text password against the stored hash (used in auth route)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
