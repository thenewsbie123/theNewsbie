/**
 * THE NEWSBIE — server.js
 * Express + MongoDB + JWT + Multer backend
 * Deployable on Railway as-is.
 *
 * Environment Variables required on Railway:
 *   MONGODB_URI   — your MongoDB Atlas connection string
 *   JWT_SECRET    — any long random string  (e.g. openssl rand -hex 32)
 *   PORT          — set automatically by Railway; do NOT hardcode
 */

'use strict';

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const multer   = require('multer');
const path     = require('path');
const jwt      = require('jsonwebtoken');
const fs       = require('fs');

/* ─────────────────────────────────────────
   APP BOOTSTRAP
───────────────────────────────────────── */
const app  = express();
const PORT = process.env.PORT || 3000;

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET  = process.env.JWT_SECRET || 'newsbie_dev_secret_CHANGE_IN_PROD';

if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI environment variable is not set. Exiting.');
  process.exit(1);
}

/* ─────────────────────────────────────────
   MIDDLEWARE
───────────────────────────────────────── */
app.use(cors());
// Increase JSON/URL-encoded body limit to 50 MB so large base-64 images don't fail
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* ─────────────────────────────────────────
   STATIC FILES
   • /public  — index.html, script.js, style.css, admin.html
   • /uploads — user-uploaded images
───────────────────────────────────────── */
app.use(express.static(path.join(__dirname, 'public')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

/* ─────────────────────────────────────────
   MONGODB
───────────────────────────────────────── */
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅  MongoDB connected'))
  .catch(err => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });

/* ─────────────────────────────────────────
   MONGOOSE SCHEMAS & MODELS
───────────────────────────────────────── */

// Article
const articleSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    author:   { type: String, default: 'The Newsbie' },
    authorId: { type: Number, default: null },
    category: { type: String, default: 'World' },
    date:     { type: String, default: '' },       // human-readable, e.g. "March 27, 2026"
    readTime: { type: String, default: '' },        // e.g. "5 min read"
    excerpt:  { type: String, default: '' },
    tags:     [String],
    img:      { type: String, default: '' },        // URL or /uploads/filename.jpg
    featured: { type: Boolean, default: false },
    status:   { type: String, default: 'published', enum: ['published', 'draft', 'pending'] },
    content:  { type: String, default: '' },
    comments: [
      {
        name: String,
        date: String,
        text: String,
      },
    ],
  },
  { timestamps: true }
);

const Article = mongoose.model('Article', articleSchema);

/* ─────────────────────────────────────────
   IMAGE UPLOAD — MULTER
───────────────────────────────────────── */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpe?g|png|gif|webp/i;
    if (allowed.test(path.extname(file.originalname)) && allowed.test(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, PNG, GIF, or WebP images are allowed.'));
  },
});

/* ─────────────────────────────────────────
   USERS  (stored in code; swap for DB users if you prefer)
───────────────────────────────────────── */
const USERS = [
  { id: 1, username: 'naman2170',   password: 'Naman123',   role: 'admin',       name: 'Naman'         },
  { id: 2, username: 'editor',      password: 'editor123',  role: 'editor',      name: 'Sarah Mitchell' },
  { id: 3, username: 'contributor', password: 'contrib123', role: 'contributor', name: 'James Okafor'   },
  { id: 4, username: 'viewer',      password: 'view123',    role: 'viewer',      name: 'Guest Reviewer' },
];

/* ─────────────────────────────────────────
   JWT MIDDLEWARE
───────────────────────────────────────── */
function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'Authentication required.' });

  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function humanDate() {
  const now    = new Date();
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  return `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

function calcReadTime(content = '') {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200)) + ' min read';
}

/* ─────────────────────────────────────────
   AUTH ROUTES
───────────────────────────────────────── */

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const payload = { id: user.id, username: user.username, role: user.role, name: user.name };
  const token   = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, user: payload });
});

// GET /api/auth/me  (verify token, return user info)
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

/* ─────────────────────────────────────────
   ARTICLE ROUTES
───────────────────────────────────────── */

// GET /api/articles
// Public — returns published articles.
// Admins/editors can pass ?status=all (requires auth header) to see all statuses.
app.get('/api/articles', async (req, res) => {
  try {
    const filter = {};

    // If caller is authenticated AND requests all statuses, allow it
    const authHeader = req.headers['authorization'];
    let callerRole   = null;
    if (authHeader) {
      try {
        const decoded = jwt.verify(authHeader.replace('Bearer ', ''), JWT_SECRET);
        callerRole = decoded.role;
      } catch { /* ignore bad tokens on public route */ }
    }

    if (req.query.status === 'all' && ['admin', 'editor'].includes(callerRole)) {
      // no status filter
    } else {
      filter.status = 'published';
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const articles = await Article.find(filter).sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error('GET /api/articles error:', err);
    res.status(500).json({ error: 'Failed to fetch articles.' });
  }
});

// GET /api/articles/:id
app.get('/api/articles/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found.' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article.' });
  }
});

// POST /api/articles  — create (requires auth)
app.post('/api/articles', requireAuth, async (req, res) => {
  try {
    const {
      title, subtitle, author, authorId, category,
      content, excerpt, tags, img, featured, status,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'title and content are required.' });
    }

    // Determine final status — contributors always submit as pending
    let finalStatus = status || 'published';
    if (req.user.role === 'contributor') finalStatus = 'pending';

    const article = new Article({
      title:    title.trim(),
      subtitle: (subtitle || '').trim(),
      author:   (author   || req.user.name || 'The Newsbie').trim(),
      authorId: authorId  || null,
      category: category  || 'World',
      date:     humanDate(),
      readTime: calcReadTime(content),
      excerpt:  (excerpt  || '').trim(),
      tags:     Array.isArray(tags) ? tags : [],
      img:      (img      || '').trim(),
      featured: featured  || false,
      status:   finalStatus,
      content:  content.trim(),
      comments: [],
    });

    const saved = await article.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('POST /api/articles error:', err);
    res.status(500).json({ error: 'Failed to create article.' });
  }
});

// PUT /api/articles/:id  — update (requires auth)
app.put('/api/articles/:id', requireAuth, async (req, res) => {
  try {
    // Recalculate readTime if content changed
    const updates = { ...req.body };
    if (updates.content) {
      updates.readTime = calcReadTime(updates.content);
    }

    const article = await Article.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!article) return res.status(404).json({ error: 'Article not found.' });
    res.json(article);
  } catch (err) {
    console.error('PUT /api/articles error:', err);
    res.status(500).json({ error: 'Failed to update article.' });
  }
});

// DELETE /api/articles/:id  — delete (requires auth)
app.delete('/api/articles/:id', requireAuth, async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: 'Article deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete article.' });
  }
});

// PATCH /api/articles/:id/approve  — approve pending article
app.patch('/api/articles/:id/approve', requireAuth, async (req, res) => {
  const allowed = ['admin', 'editor'];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ error: 'Permission denied.' });
  }
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { status: 'published' },
      { new: true }
    );
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve article.' });
  }
});

// PATCH /api/articles/:id/feature  — toggle featured flag
app.patch('/api/articles/:id/feature', requireAuth, async (req, res) => {
  const allowed = ['admin', 'editor'];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ error: 'Permission denied.' });
  }
  try {
    // Un-feature all others first, then feature the target
    await Article.updateMany({}, { featured: false });
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { featured: true },
      { new: true }
    );
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to feature article.' });
  }
});

// POST /api/articles/:id/comments  — add reader comment
app.post('/api/articles/:id/comments', async (req, res) => {
  try {
    const { name, text } = req.body;
    if (!name || !text) return res.status(400).json({ error: 'name and text are required.' });

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { name, date: humanDate(), text } } },
      { new: true }
    );
    if (!article) return res.status(404).json({ error: 'Article not found.' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post comment.' });
  }
});

/* ─────────────────────────────────────────
   IMAGE UPLOAD
───────────────────────────────────────── */

// POST /api/upload  — upload image, returns { url: "/uploads/filename.jpg" }
app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file received.' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

/* ─────────────────────────────────────────
   HEALTH CHECK
───────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

/* ─────────────────────────────────────────
   SPA CATCH-ALL
   Serves index.html for any non-API route so the React-style
   frontend routing works.
───────────────────────────────────────── */
app.get('*', (req, res) => {
  // Avoid catching API requests that weren't matched
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found.' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ─────────────────────────────────────────
   GLOBAL ERROR HANDLER
───────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error.' });
});

/* ─────────────────────────────────────────
   START
───────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`🚀  The Newsbie server running on port ${PORT}`);
});
