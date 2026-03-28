/**
 * ================================================================
 * THE NEWSBIE — server.js  (Railway-production-ready)
 * ================================================================
 *
 * ROOT CAUSES FIXED IN THIS VERSION
 * ──────────────────────────────────
 * FIX 1 — HEALTHCHECK FAILURE (PRIMARY):
 *   Old code put app.listen() INSIDE mongoose.connect().then().
 *   If MongoDB Atlas takes >30s to respond (Railway's default probe
 *   timeout), the port is never opened → healthcheck fails → deploy
 *   is marked failed even though the code itself is fine.
 *   Solution: call app.listen() FIRST so the port is open immediately,
 *   then connect MongoDB in the background with retry logic.
 *
 * FIX 2 — LOGIN ALWAYS 500 (TypeError crash):
 *   userSchema.pre('save', async function(next) { ... next(); })
 *   In Mongoose 6+ async hooks do NOT receive a `next` parameter.
 *   `next` is undefined, so `next()` throws TypeError: next is not
 *   a function on every User.save() / User.create() call.
 *   Solution: models are now in ./models/*.js which use the correct
 *   async function() { } signature (no next param).
 *
 * FIX 3 — NO HEALTH ENDPOINT:
 *   GET /api/health returns 200 immediately so Railway's probe works.
 *
 * FIX 4 — MODEL CONFLICT:
 *   server.js was inlining all Mongoose schemas AND seed.js was also
 *   importing ./models/*.js, causing "Cannot overwrite model once
 *   compiled" errors. All schemas are now exclusively in ./models/.
 *
 * FIX 5 — MISSING config/db.js:
 *   seed.js required ./config/db which didn't exist.
 *   Created with retry logic in config/db.js.
 * ================================================================
 */

'use strict';
require('dotenv').config();

const express    = require('express');
const mongoose   = require('mongoose');
const jwt        = require('jsonwebtoken');
const cors       = require('cors');
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const connectDB  = require('./config/db');

// ── Models (all schemas live here — never inline in server.js) ────────────────
const User       = require('./models/User');
const Article    = require('./models/Article');
const Editorial  = require('./models/Editorial');
const Highlight  = require('./models/Highlight');
const Author     = require('./models/Author');
const Subscriber = require('./models/Subscriber');

/* ──────────────────────────────────────────────────────────────
   CONFIGURATION
────────────────────────────────────────────────────────────── */
const app = express();

// FIX 1a: Read PORT from environment FIRST — Railway injects this.
// Default to 5000 for local dev (3000 often conflicts with React dev server).
const PORT = process.env.PORT || 5000;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET is not set — using an insecure default. Set it in Railway → Variables.');
}
const SECRET = JWT_SECRET || 'newsbie-insecure-fallback-change-this';

/* ──────────────────────────────────────────────────────────────
   UPLOADS DIRECTORY — create before multer is configured
────────────────────────────────────────────────────────────── */
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/* ──────────────────────────────────────────────────────────────
   MIDDLEWARE
────────────────────────────────────────────────────────────── */
app.use(cors({
  origin: '*',          // tighten to your Railway domain in production
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static files — index.html, admin.html, script.js, style.css live in /public
app.use(express.static(path.join(__dirname, 'public')));
// Uploaded images
app.use('/uploads', express.static(uploadsDir));

/* ──────────────────────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────────────────────── */
function todayStr() {
  return new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
}

function calcReadTime(content) {
  const words = (content || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200)) + ' min read';
}

function makeToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role, name: user.name },
    SECRET,
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
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalid or expired. Please sign in again.' });
  }
}

// softAuth — attaches req.user if a valid token is present, never blocks
function softAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try { req.user = jwt.verify(token, SECRET); } catch {}
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

/* ══════════════════════════════════════════════════════════════
   API ROUTES
   IMPORTANT: all /api/* routes MUST come before the catch-all
   app.get('*') that serves index.html.
══════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────────
   FIX 3: HEALTH CHECK — Railway probes this endpoint.
   Returns 200 immediately; also reports DB connection state.
────────────────────────────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.status(200).json({
    status:   'ok',
    db:       dbState[mongoose.connection.readyState] || 'unknown',
    uptime:   Math.round(process.uptime()),
    time:     new Date().toISOString(),
  });
});

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

    // matchPassword is defined correctly in ./models/User.js
    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid username or password' });

    res.json({
      token: makeToken(user),
      user:  { id: user._id, username: user.username, role: user.role, name: user.name },
    });
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ──────────────────────────────────────────────────────────────
   ARTICLE ROUTES
────────────────────────────────────────────────────────────── */

// GET /api/articles
// Public  → published only
// Admin/Editor with token → all statuses (?status=all or no param)
// Contributor with token  → published + their own articles
app.get('/api/articles', softAuth, async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      if (status !== 'published' && !isPrivileged(req))
        return res.status(403).json({ error: 'Insufficient permissions' });
      filter.status = status;
    } else if (!isPrivileged(req)) {
      if (req.user?.role === 'contributor') {
        filter.$or = [{ status: 'published' }, { author: req.user.name }];
      } else {
        filter.status = 'published';
      }
    }
    // Admins/Editors: no status filter → all documents returned

    if (category) filter.category = category;

    const articles = await Article.find(filter).sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error('[GET /api/articles]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/articles/:id
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
    const { role } = req.user;
    if (!['admin', 'editor', 'contributor'].includes(role))
      return res.status(403).json({ error: 'Insufficient permissions' });

    const status = ['admin', 'editor'].includes(role)
      ? (req.body.status || 'published')
      : 'pending';

    const article = await Article.create({
      ...req.body,
      status,
      readTime:  calcReadTime(req.body.content),
      date:      todayStr(),
      createdBy: req.user.name,
    });
    res.status(201).json(article);
  } catch (err) {
    console.error('[POST /api/articles]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/articles/:id — safe partial update (only merges provided fields)
app.put('/api/articles/:id', authenticate, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const { role, name } = req.user;
    if (!['admin', 'editor'].includes(role) && article.author !== name)
      return res.status(403).json({ error: 'Insufficient permissions' });

    const allowed = ['title','subtitle','author','authorId','category','content',
                     'excerpt','tags','img','featured','status','readTime','date'];
    const updates = {};
    allowed.forEach(k => { if (k in req.body) updates[k] = req.body[k]; });
    if (updates.content) updates.readTime = calcReadTime(updates.content);
    if ('status' in updates && !['admin','editor'].includes(role)) delete updates.status;
    updates.lastEdited   = todayStr();
    updates.lastEditedBy = name;

    const updated = await Article.findByIdAndUpdate(
      req.params.id, { $set: updates }, { new: true, runValidators: true }
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

// PATCH /api/articles/:id/approve
app.patch('/api/articles/:id/approve', authenticate, requireRole('admin','editor'), async (req, res) => {
  try {
    const updated = await Article.findByIdAndUpdate(
      req.params.id, { $set: { status: 'published' } }, { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Article not found' });
    res.json(updated);
  } catch (err) {
    console.error('[PATCH /api/articles/:id/approve]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/articles/:id/feature — toggle featured, auto-unfeature others
app.patch('/api/articles/:id/feature', authenticate, requireRole('admin','editor'), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    if (!article.featured) {
      await Article.updateMany({ _id: { $ne: article._id } }, { $set: { featured: false } });
    }
    const updated = await Article.findByIdAndUpdate(
      req.params.id, { $set: { featured: !article.featured } }, { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('[PATCH /api/articles/:id/feature]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/articles/:id/comments — public
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

app.get('/api/editorials', async (req, res) => {
  try {
    res.json(await Editorial.find().sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/editorials/:id', async (req, res) => {
  try {
    const ed = await Editorial.findById(req.params.id);
    if (!ed) return res.status(404).json({ error: 'Editorial not found' });
    res.json(ed);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/editorials', authenticate, requireRole('admin','editor'), async (req, res) => {
  try {
    const ed = await Editorial.create({
      ...req.body,
      readTime: calcReadTime(req.body.content),
      date:     todayStr(),
    });
    res.status(201).json(ed);
  } catch (err) {
    console.error('[POST /api/editorials]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/editorials/:id', authenticate, requireRole('admin','editor'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.content) updates.readTime = calcReadTime(updates.content);
    const updated = await Editorial.findByIdAndUpdate(
      req.params.id, { $set: updates }, { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Editorial not found' });
    res.json(updated);
  } catch (err) {
    console.error('[PUT /api/editorials/:id]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/editorials/:id', authenticate, requireRole('admin','editor'), async (req, res) => {
  try {
    await Editorial.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

/* ──────────────────────────────────────────────────────────────
   HIGHLIGHT ROUTES
────────────────────────────────────────────────────────────── */

app.get('/api/highlights', async (req, res) => {
  try {
    res.json(await Highlight.find().sort({ order: 1, createdAt: -1 }));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/highlights', authenticate, requireRole('admin','editor'), async (req, res) => {
  try {
    const count = await Highlight.countDocuments();
    res.status(201).json(await Highlight.create({ ...req.body, order: count }));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/highlights/:id', authenticate, requireRole('admin','editor'), async (req, res) => {
  try {
    const allowed = ['text','enabled','order','type'];
    const updates = {};
    allowed.forEach(k => { if (k in req.body) updates[k] = req.body[k]; });
    const updated = await Highlight.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Highlight not found' });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/highlights/:id', authenticate, requireRole('admin','editor'), async (req, res) => {
  try {
    await Highlight.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

/* ──────────────────────────────────────────────────────────────
   AUTHOR ROUTES
────────────────────────────────────────────────────────────── */

app.get('/api/authors', async (req, res) => {
  try { res.json(await Author.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/authors/:id', async (req, res) => {
  try {
    const a = await Author.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Author not found' });
    res.json(a);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/authors', authenticate, requireRole('admin','editor'), async (req, res) => {
  try { res.status(201).json(await Author.create(req.body)); }
  catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/authors/:id', authenticate, requireRole('admin','editor'), async (req, res) => {
  try {
    const updated = await Author.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Author not found' });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/authors/:id', authenticate, requireRole('admin','editor'), async (req, res) => {
  try {
    await Author.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

/* ──────────────────────────────────────────────────────────────
   SUBSCRIBER ROUTES
────────────────────────────────────────────────────────────── */

app.get('/api/subscribers', authenticate, requireRole('admin','editor'), async (req, res) => {
  try { res.json(await Subscriber.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/subscribers — public newsletter signup (idempotent)
app.post('/api/subscribers', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@'))
      return res.status(400).json({ error: 'Valid email is required' });
    await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { email: email.toLowerCase().trim(), date: todayStr() },
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('[POST /api/subscribers]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/subscribers/:id', authenticate, requireRole('admin','editor'), async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

/* ──────────────────────────────────────────────────────────────
   USER MANAGEMENT ROUTES
────────────────────────────────────────────────────────────── */

app.get('/api/users', authenticate, requireRole('admin'), async (req, res) => {
  try {
    res.json(await User.find({}, '-password').sort({ createdAt: 1 }));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/users', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    if (!name || !username || !password)
      return res.status(400).json({ error: 'name, username, and password are required' });
    if (await User.findOne({ username: username.toLowerCase().trim() }))
      return res.status(409).json({ error: 'Username already exists' });
    // User.create() with a single object triggers pre-save → password is hashed
    const user = await User.create({ name, username, password, role: role || 'viewer' });
    res.status(201).json({ _id: user._id, name: user.name, username: user.username, role: user.role });
  } catch (err) {
    console.error('[POST /api/users]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/users/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin','editor','contributor','viewer'].includes(role))
      return res.status(400).json({ error: 'Invalid role' });
    if (req.params.id === String(req.user.id) && role !== 'admin')
      return res.status(400).json({ error: 'You cannot change your own role' });
    const user = await User.findByIdAndUpdate(
      req.params.id, { $set: { role } }, { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/users/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    if (req.params.id === String(req.user.id))
      return res.status(400).json({ error: 'You cannot delete your own account' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

/* ──────────────────────────────────────────────────────────────
   IMAGE UPLOAD
────────────────────────────────────────────────────────────── */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits:     { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only')),
});

app.post('/api/upload', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: '/uploads/' + req.file.filename });
});

/* ──────────────────────────────────────────────────────────────
   CATCH-ALL — serves index.html for any non-API route.
   MUST stay AFTER all /api/* routes.
────────────────────────────────────────────────────────────── */
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Graceful degradation: if frontend files aren't deployed yet, return JSON
    res.status(200).json({
      message: 'The Newsbie API is running.',
      note:    'Place your frontend files in the /public folder.',
      health:  '/api/health',
    });
  }
});

/* ──────────────────────────────────────────────────────────────
   GLOBAL ERROR HANDLER
────────────────────────────────────────────────────────────── */
app.use((err, req, res, _next) => {
  console.error('[Unhandled error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

/* ──────────────────────────────────────────────────────────────
   SERVER START — FIX 1 (PRIMARY HEALTHCHECK FIX)
   Listen on PORT FIRST so Railway's healthcheck probe gets a
   200 response immediately. Then connect MongoDB in the background.
   If MongoDB fails on first try, retry with exponential back-off
   without ever crashing the process.
────────────────────────────────────────────────────────────── */
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🗞  The Newsbie server listening on port ${PORT}`);
  console.log(`🔍 Health check: GET /api/health`);
});

// Connect MongoDB after the port is open
connectDB()
  .then(() => {
    console.log('🚀 Database ready — all systems go.');
  })
  .catch(err => {
    // Log the error but DO NOT exit — the server stays up so Railway's
    // healthcheck keeps passing. API calls that need the DB will return 500.
    console.error('❌ MongoDB connection failed after all retries:', err.message);
    console.error('   Check MONGODB_URI in Railway → Variables.');
  });

/* ──────────────────────────────────────────────────────────────
   GRACEFUL SHUTDOWN
────────────────────────────────────────────────────────────── */
async function shutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully…`);
  server.close(async () => {
    await require('./config/db').disconnectDB();
    console.log('Goodbye.');
    process.exit(0);
  });
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
