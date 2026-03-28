// models/Highlight.js
'use strict';

const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema(
  {
    text:    { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true },
    type:    { type: String, enum: ['custom', 'article'], default: 'custom' },
    order:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Highlight', highlightSchema);
