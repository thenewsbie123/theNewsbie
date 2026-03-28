// config/db.js
// ─────────────────────────────────────────────────────────────────────────────
// MongoDB connection module with automatic retry.
//
// WHY THIS FILE EXISTS:
//   seed.js imports `require('./config/db')` but this file was missing,
//   causing seed.js to crash on line 16 before seeding any data at all.
//
// USAGE:
//   const connectDB = require('./config/db');
//   await connectDB();           // one-shot (seed.js)
//   connectDB();                 // fire-and-forget with retry (server.js)
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const MONGOOSE_OPTS = {
  serverSelectionTimeoutMS: 10000,  // fail fast if Atlas is unreachable
  socketTimeoutMS:          45000,
  maxPoolSize:              10,
};

// Exponential back-off retry — used when server.js is running long-lived.
// seed.js calls this once and awaits it; if it throws, seed.js exits.
async function connectDB(retries = 5, delayMs = 2000) {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set. Add it to Railway → Variables or your .env file.');
    process.exit(1);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(MONGODB_URI, MONGOOSE_OPTS);
      const safeUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//<user>:<password>@');
      console.log(`✅ MongoDB connected (attempt ${attempt}): ${safeUri}`);
      return;
    } catch (err) {
      console.error(`⚠️  MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) throw err;
      const wait = delayMs * attempt;
      console.log(`⏳ Retrying in ${wait / 1000}s…`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
}

// Graceful shutdown helpers — called by server.js process signal handlers
function disconnectDB() {
  return mongoose.disconnect();
}

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
