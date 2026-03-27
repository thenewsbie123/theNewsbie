/**
 * ================================================================
 * THE NEWSBIE — server.js
 * Node.js + Express + MongoDB (Mongoose) — Railway-ready
 * ================================================================
 *
 * SETUP:
 *   1. npm install express mongoose bcryptjs jsonwebtoken multer cors dotenv
 *   2. Create a .env file (see bottom of file for required variables)
 *   3. Run `node seed.js` ONCE to create your initial admin account
 *   4. Deploy to Railway — set env vars in the Railway dashboard
 *
 * DIRECTORY STRUCTURE expected:
 *   /server.js          ← this file
 *   /seed.js            ← generated below, run once
 *   /public/            ← serve index.html, admin.html, script.js, style.css from here
 *   /public/uploads/    ← image uploads land here (auto-created)
 *   /.env               ← local dev only, not committed
 * ================================================================
 */

'use strict';
require('dotenv').config();

const express   = require('express');
const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const cors      = require('cors');
const multer    = require('multer');
const path      = require('path');
const fs        = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/newsbie';

/* ──────────────────────────────────────────────────────────────
   MIDDLEWARE
────────────────────────────────────────────────────────────── */
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded images
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

/* ──────────────────────────────────────────────────────────────
   MONGOOSE SCHEMAS
────────────────────────────────────────────────────────────── */

// ── User ─────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin', 'editor', 'contributor', 'viewer'], default: 'viewer' },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.checkPassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

const User = mongoose.model('User', userSchema);

// ── Article ───────────────────────────────────────────────────
const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: String, default: () => todayStr() },
}, { _id: false });

const articleSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  subtitle: { type: String, default: '' },
  author:   { type: String, default: 'The Newsbie' },
  authorId: { type: Number, default: null },
  category: { type: String, default: 'World' },
  content:  { type: String, default: '' },
  excerpt:  { type: String, default: '' },
  tags:     { type: [String], default: [] },
  img:      { type: String, default: '' },
  featured: { type: Boolean, default: false },
  status:   { type: String, enum: ['published', 'pending', 'draft'], default: 'published' },
  readTime: { type: String, default: '1 min read' },
  date:     { type: String, default: () => todayStr() },
  comments: { type: [commentSchema], default: [] },
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema);

// ── Editorial ─────────────────────────────────────────────────
const editorialSchema = new mongoose.Schema({
  type:        { type: String, enum: ['Editorial', 'Opinion', 'Analysis', 'Perspective'], default: 'Editorial' },
  title:       { type: String, required: true, trim: true },
  subtitle:    { type: String, default: '' },
  author:      { type: String, default: 'The Newsbie Editorial Board' },
  authorTitle: { type: String, default: '' },
  authorBio:   { type: String, default: '' },
  content:     { type: String, default: '' },
  img:         { type: String, default: '' },
  tags:        { type: [String], default: [] },
  relatedId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Article', default: null },
  isPick:      { type: Boolean, default: false },
  visible:     { type: Boolean, default: true },
  date:        { type: String, default: () => todayStr() },
  readTime:    { type: String, default: '3 min read' },
}, { timestamps: true });

const Editorial = mongoose.model('Editorial', editorialSchema);

// ── Highlight ─────────────────────────────────────────────────
const highlightSchema = new mongoose.Schema({
  text:    { type: String, required: true },
  enabled: { type: Boolean, default: true },
  type:    { type: String, enum: ['custom', 'article'], default: 'custom' },
  order:   { type: Number, default: 0 },
}, { timestamps: true });

const Highlight = mongoose.model('Highlight', highlightSchema);

// ── Author ────────────────────────────────────────────────────
const authorSchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true },
  role:   { type: String, default: '' },
  bio:    { type: String, default: '' },
  avatar: { type: String, default: '' },
  social: {
    tw:  { type: String, default: '' },
    li:  { type: String, default: '' },
    ig:  { type: String, default: '' },
    fb:  { type: String, default: '' },
    web: { type: String, default: '' },
  },
}, { timestamps: true });

const Author = mongoose.model('Author', authorSchema);

// ── Subscriber ────────────────────────────────────────────────
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
}, { timestamps: true });

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

/* ──────────────────────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────────────────────── */
function todayStr() {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function calcReadTime(content) {
  const words = (content || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200)) + ' min read';
}

function makeToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/* ──────────────────────────────────────────────────────────────
   AUTH MIDDLEWARE
────────────────────────────────────────────────────────────── */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalid or expired. Please log in again.' });
  }
}

// Soft auth — attaches req.user if token present but never blocks the request
function softAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try { req.user = jwt.verify(token, JWT_SECRET); } catch {}
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ error: 'Insufficient permissions' });
    next();
  };
}

const isPrivileged = req => req.user && ['admin', 'editor'].includes(req.user.role);

/* ──────────────────────────────────────────────────────────────
   AUTH ROUTES
────────────────────────────────────────────────────────────── */

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required' });

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });

    const ok = await user.checkPassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid username or password' });

    const token = makeToken(user);
    res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role, name: user.name },
    });
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ──────────────────────────────────────────────────────────────
   ARTICLE ROUTES
   BUG FIX: GET /api/articles now correctly handles all filter
   combinations that both index.html (script.js) and admin.html use:
     • No status param + admin token  → return all statuses
     • No status param + public       → return published only
     • ?status=published/pending/draft → filter by that exact status
     • ?status=all + admin token      → return all (alias for admins)
     • ?category=World                → layer on category filter
────────────────────────────────────────────────────────────── */

// GET /api/articles
app.get('/api/articles', softAuth, async (req, res) => {
  try {
    const filter = {};

    // Status filtering
    const { status, category } = req.query;
    if (status && status !== 'all') {
      // Specific status filter — only privileged users can see non-published
      if (status !== 'published' && !isPrivileged(req))
        return res.status(403).json({ error: 'Insufficient permissions' });
      filter.status = status;
    } else if (status === 'all' && isPrivileged(req)) {
      // ?status=all from admin panel — no status filter
    } else if (!status && isPrivileged(req)) {
      // Admin/editor calling /articles without any status param → return all
      // (admin.html's artFilter==='all' case — needs all statuses for the manage table)
    } else {
      // Public or no token — published only
      filter.status = 'published';
    }

    // Contributors see their own articles regardless of status
    if (req.user?.role === 'contributor' && !isPrivileged(req)) {
      filter.$or = [{ status: 'published' }, { author: req.user.name }];
      delete filter.status;
    }

    // Optional category filter
    if (category) filter.category = category;

    const articles = await Article.find(filter).sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error('[GET /api/articles]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/articles/:id  — single article (needed by admin.html's openArticleEdit)
app.get('/api/articles/:id', softAuth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    if (article.status !== 'published' && !isPrivileged(req) &&
        !(req.user?.role === 'contributor' && article.author === req.user.name))
      return res.status(403).json({ error: 'Insufficient permissions' });
    res.json(article);
  } catch (err) {
    console.error('[GET /api/articles/:id]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/articles
app.post('/api/articles', authenticate, async (req, res) => {
  try {
    const role = req.user.role;
    if (!['admin', 'editor', 'contributor'].includes(role))
      return res.status(403).json({ error: 'Insufficient permissions' });

    // Contributors always submit as pending, regardless of what the body says
    const status = ['admin', 'editor'].includes(role)
      ? (req.body.status || 'published')
      : 'pending';

    const article = await Article.create({
      ...req.body,
      status,
      readTime: calcReadTime(req.body.content),
      date: todayStr(),
    });
    res.status(201).json(article);
  } catch (err) {
    console.error('[POST /api/articles]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/articles/:id  — full or partial update
// BUG FIX: admin.html sends partial updates (e.g. just { status, featured })
// via PUT; this handler merges only the provided fields so nothing is wiped.
app.put('/api/articles/:id', authenticate, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const { role, name } = req.user;
    const canEdit = ['admin', 'editor'].includes(role) || article.author === name;
    if (!canEdit) return res.status(403).json({ error: 'Insufficient permissions' });

    // Build safe update — only merge fields that are actually present in req.body
    // so admin.html's partial { featured: true } doesn't wipe title/content etc.
    const allowed = ['title','subtitle','author','authorId','category','content',
                     'excerpt','tags','img','featured','status','readTime','date'];
    const updates = {};
    allowed.forEach(k => { if (k in req.body) updates[k] = req.body[k]; });
    if (updates.content) updates.readTime = calcReadTime(updates.content);

    // Only admins/editors can change status; contributors can't self-publish
    if ('status' in updates && !['admin','editor'].includes(role)) {
      delete updates.status;
    }

    const updated = await Article.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('[PUT /api/articles/:id]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/articles/:id
app.delete('/api/articles/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const deleted = await Article.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Article not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/articles/:id]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/articles/:id/approve  — used by script.js
app.patch('/api/articles/:id/approve', authenticate, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const updated = await Article.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'published' } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Article not found' });
    res.json(updated);
  } catch (err) {
    console.error('[PATCH /api/articles/:id/approve]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/articles/:id/feature  — used by script.js
app.patch('/api/articles/:id/feature', authenticate, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    // Toggle: if currently featured, unfeature it; if not, feature it and unfeature all others
    if (!article.featured) {
      await Article.updateMany({}, { $set: { featured: false } });
    }
    const updated = await Article.findByIdAndUpdate(
      req.params.id,
      { $set: { featured: !article.featured } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('[PATCH /api/articles/:id/feature]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/articles/:id/comments  — public, no auth required
app.post('/api/articles/:id/comments', async (req, res) => {
  try {
    const { name, text } = req.body;
    if (!name || !text) return res.status(400).json({ error: 'name and text are required' });
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { name, text, date: todayStr() } } },
      { new: true }
    );
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    console.error('[POST /api/articles/:id/comments]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ──────────────────────────────────────────────────────────────
   EDITORIAL ROUTES
────────────────────────────────────────────────────────────── */

// GET /api/editorials
app.get('/api/editorials', async (req, res) => {
  try {
    const editorials = await Editorial.find().sort({ createdAt: -1 });
    res.json(editorials);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/editorials/:id
app.get('/api/editorials/:id', async (req, res) => {
  try {
    const ed = await Editorial.findById(req.params.id);
    if (!ed) return res.status(404).json({ error: 'Editorial not found' });
    res.json(ed);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/editorials
app.post('/api/editorials', authenticate, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const ed = await Editorial.create({
      ...req.body,
      readTime: calcReadTime(req.body.content),
      date: todayStr(),
    });
    res.status(201).json(ed);
  } catch (err) {
    console.error('[POST /api/editorials]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/editorials/:id
app.put('/api/editorials/:id', authenticate, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.content) updates.readTime = calcReadTime(updates.content);
    const updated = await Editorial.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Editorial not found' });
    res.json(updated);
  } catch (err) {
    console.error('[PUT /api/editorials/:id]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/editorials/:id
app.delete('/api/editorials/:id', authenticate, requireRole('admin', 'editor'), async (req, res) => {
  try {
    await Editorial.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* ──────────────────────────────────────────────────────────────
   HIGHLIGHT ROUTES
────────────────────────────────────────────────────────────── */

// GET /api/highlights — public (homepage ticker needs it)
app.get('/api/highlights', async (req, res) => {
  try {
    const highlights = await Highlight.find().sort({ order: 1, createdAt: -1 });
    res.json(highlights);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/highlights
app.post('/api/highlights', authenticate, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const count = await Highlight.countDocuments();
    const hl = await Highlight.create({ ...req.body, order: count });
    res.status(201).json(hl);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/highlights/:id — update text, enabled, order
app.put('/api/highlights/:id', authenticate, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const allowed = ['text', 'enabled', 'order', 'type'];
    const updates = {};
    allowed.forEach(k => { if (k in req.body) updates[k] = req.body[k]; });
    const updated = await Highlight.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Highlight not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/highlights/:id
app.delete('/api/highlights/:id', authenticate, requireRole('admin', 'editor'), async (req, res) => {
  try {
    await Highlight.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* ──────────────────────────────────────────────────────────────
   AUTHOR ROUTES
────────────────────────────────────────────────────────────── */

// GET /api/authors — public
app.get('/api/authors', async (req, res) => {
  try {
    res.json(await Author.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/authors/:id
app.get('/api/authors/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ error: 'Author not found' });
    res.json(author);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/authors
app.post('/api/authors', authenticate, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const author = await Author.create(req.body);
    res.status(201).json(author);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/authors/:id
app.put('/api/authors/:id', authenticate, requireRole('admin', 'editor'), async (req, res) => {
  try {
    const updated = await Author.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Author not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/authors/:id
app.delete('/api/authors/:id', authenticate, requireRole('admin', 'editor'), async (req, res) => {
  try {
    await Author.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* ──────────────────────────────────────────────────────────────
   SUBSCRIBER ROUTES
────────────────────────────────────────────────────────────── */

// GET /api/subscribers — admin only
app.get('/api/subscribers', authenticate, requireRole('admin', 'editor'), async (req, res) => {
  try {
    res.json(await Subscriber.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/subscribers — public (newsletter signup form)
app.post('/api/subscribers', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@'))
      return res.status(400).json({ error: 'Valid email required' });
    // Upsert — idempotent, subscribing twice is fine
    await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { email: email.toLowerCase().trim() },
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('[POST /api/subscribers]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/subscribers/:id
app.delete('/api/subscribers/:id', authenticate, requireRole('admin', 'editor'), async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* ──────────────────────────────────────────────────────────────
   USER MANAGEMENT ROUTES
   BUG FIX: Previously addUser() in the frontend only wrote to
   localStorage. Login checks MongoDB, so new users could never
   log in. These routes are what the fixed addUser() now calls.
────────────────────────────────────────────────────────────── */

// GET /api/users — admin only
app.get('/api/users', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users — create new team member
app.post('/api/users', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    if (!name || !username || !password)
      return res.status(400).json({ error: 'name, username, and password are required' });

    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'Username already exists' });

    const user = await User.create({ name, username, password, role: role || 'viewer' });
    // Never send password hash back
    res.status(201).json({ _id: user._id, name: user.name, username: user.username, role: user.role });
  } catch (err) {
    console.error('[POST /api/users]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/users/:id — change role
app.patch('/api/users/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'editor', 'contributor', 'viewer'].includes(role))
      return res.status(400).json({ error: 'Invalid role' });

    // Prevent an admin from demoting themselves
    if (req.params.id === String(req.user.id) && role !== 'admin')
      return res.status(400).json({ error: 'You cannot change your own role' });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/users/:id
app.delete('/api/users/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    if (req.params.id === String(req.user.id))
      return res.status(400).json({ error: 'You cannot delete your own account' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* ──────────────────────────────────────────────────────────────
   IMAGE UPLOAD
────────────────────────────────────────────────────────────── */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

app.post('/api/upload', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: '/uploads/' + req.file.filename });
});

/* ──────────────────────────────────────────────────────────────
   CATCH-ALL — serve index.html for frontend routing
────────────────────────────────────────────────────────────── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ──────────────────────────────────────────────────────────────
   ERROR HANDLER
────────────────────────────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error('[Unhandled error]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

/* ──────────────────────────────────────────────────────────────
   CONNECT + START
────────────────────────────────────────────────────────────── */
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected:', MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@'));
    app.listen(PORT, () => console.log(`🗞  The Newsbie running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });


/*
 * ================================================================
 * seed.js — COPY THIS TO A SEPARATE FILE, run once, then delete
 * ================================================================
 *
 * node seed.js
 *
 * ----------------------------------------------------------------
 * require('dotenv').config();
 * const mongoose = require('mongoose');
 * const bcrypt   = require('bcryptjs');
 *
 * const MONGODB_URI = process.env.MONGODB_URI;
 *
 * const userSchema = new mongoose.Schema({
 *   name:     String,
 *   username: { type: String, lowercase: true },
 *   password: String,
 *   role:     String,
 * });
 * userSchema.pre('save', async function(next) {
 *   if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
 *   next();
 * });
 * const User = mongoose.model('User', userSchema);
 *
 * mongoose.connect(MONGODB_URI).then(async () => {
 *   const existing = await User.findOne({ username: 'naman2170' });
 *   if (!existing) {
 *     await User.create({ name: 'Naman', username: 'naman2170', password: 'Naman123', role: 'admin' });
 *     console.log('✅ Admin user naman2170 created.');
 *   } else {
 *     console.log('ℹ️  Admin user already exists.');
 *   }
 *   await mongoose.disconnect();
 * }).catch(e => { console.error(e); process.exit(1); });
 * ----------------------------------------------------------------
 */

/*
 * ================================================================
 * .env (local development — DO NOT commit to git)
 * ================================================================
 *
 * MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/newsbie?retryWrites=true&w=majority
 * JWT_SECRET=replace-with-a-long-random-string-at-least-32-chars
 * PORT=3000
 *
 * ================================================================
 * package.json additions needed
 * ================================================================
 *
 * {
 *   "scripts": {
 *     "start": "node server.js",
 *     "dev": "nodemon server.js"
 *   },
 *   "dependencies": {
 *     "bcryptjs": "^2.4.3",
 *     "cors": "^2.8.5",
 *     "dotenv": "^16.0.0",
 *     "express": "^4.18.0",
 *     "jsonwebtoken": "^9.0.0",
 *     "mongoose": "^8.0.0",
 *     "multer": "^1.4.5"
 *   }
 * }
 *
 * ================================================================
 * Railway deployment checklist
 * ================================================================
 *
 * 1. Push your code to GitHub (with public/ folder containing your HTML/JS/CSS)
 * 2. In Railway: New Project → Deploy from GitHub repo
 * 3. Set environment variables in Railway dashboard:
 *      MONGODB_URI   → your MongoDB Atlas connection string
 *      JWT_SECRET    → any long random string (use: openssl rand -hex 32)
 * 4. Railway auto-detects PORT — no need to set it manually
 * 5. Run seed.js once locally (pointing at your production MONGODB_URI)
 *    to create the initial admin user
 */
