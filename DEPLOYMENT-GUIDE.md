# The Newsbie — Complete Deployment & Security Guide

---

## ⚠️ URGENT: Rotate Your Credentials

Your `_env` file was uploaded with **real secrets inside it**. Those credentials
are now visible. Rotate them immediately:

1. **MongoDB Atlas password** — Atlas dashboard → Database Access → Edit user `newsbie` → Edit Password → Autogenerate
2. **JWT_SECRET** — generate a new one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. Update both values in Railway → Your Service → Variables
4. Add `.env` to your `.gitignore` (already done in the delivered files) and **never commit it again**

---

## 1. Correct Project Structure

Every file must be in exactly this location relative to your repository root:

```
your-repo/
├── server.js              ← entry point (do not rename)
├── seed.js                ← run once locally, never on Railway
├── package.json           ← "start": "node server.js" required
├── railway.json           ← healthcheck config — REQUIRED for Railway
├── .gitignore             ← keeps .env and node_modules out of git
├── .env.example           ← safe template (commit this, not .env)
│
├── config/
│   └── db.js              ← MongoDB connection with retry logic
│
├── models/
│   ├── User.js            ← fixed async pre-save hook
│   ├── Article.js
│   ├── Editorial.js
│   ├── Highlight.js
│   ├── Author.js
│   └── Subscriber.js
│
└── public/                ← ALL frontend files go here
    ├── index.html
    ├── admin.html
    ├── script.js
    ├── style.css
    └── uploads/           ← auto-created by server.js on startup
```

**The `public/` folder is critical.** If `index.html` is at the repo root
instead of inside `public/`, Express cannot find it and the catch-all
route returns a plain JSON message instead of your website.

---

## 2. MongoDB Atlas Setup

### 2a. Fix the MONGODB_URI (database name is missing)

Your current URI:
```
mongodb+srv://newsbie:<password>@cluster0.56qb65z.mongodb.net/?appName=Cluster0
```

This connects to the `test` database (MongoDB's default when no name is given).
Your seeded data goes into `test`, your app reads from `test`, but if you ever
inspect Atlas you'll wonder where your `newsbie` database is.

**Correct URI — add `/newsbie` before the `?`:**
```
mongodb+srv://newsbie:<newpassword>@cluster0.56qb65z.mongodb.net/newsbie?retryWrites=true&w=majority&appName=Cluster0
```

### 2b. Network access

In Atlas → Network Access, make sure you have `0.0.0.0/0` (Allow from anywhere)
or Railway's outbound IP range. Railway's IPs change on every deploy so
`0.0.0.0/0` is the practical choice for a hosted app.

### 2c. Database user permissions

Atlas → Database Access → your user (`newsbie`) → Built-in Role should be
`readWriteAnyDatabase` or at minimum `readWrite` on your `newsbie` database.

---

## 3. Railway Deployment — Step by Step

### Step 1 — Prepare your GitHub repository

```bash
# From your project root
git add .
git commit -m "fix: healthcheck, pre-save hook, config/db, seed"
git push origin main
```

Make sure these files are committed (check `git status`):
- `railway.json`  ← most important
- `config/db.js`
- `models/*.js`
- `public/index.html` (and all other frontend files)
- `.gitignore` (but NOT `.env`)

### Step 2 — Create a Railway service

1. Go to [railway.app](https://railway.app) → **New Project**
2. Choose **Deploy from GitHub repo**
3. Select your repository and branch (`main`)
4. Railway will detect `package.json` and use Nixpacks to build

### Step 3 — Set environment variables

In Railway → Your Service → **Variables**, add:

| Variable | Value |
|---|---|
| `MONGODB_URI` | `mongodb+srv://newsbie:<newpassword>@cluster0.56qb65z.mongodb.net/newsbie?retryWrites=true&w=majority&appName=Cluster0` |
| `JWT_SECRET` | Output of: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

**Do NOT set `PORT`** — Railway injects it automatically. Setting it manually
causes Railway's internal proxy to break.

### Step 4 — Configure the healthcheck (railway.json does this automatically)

The `railway.json` you received tells Railway:
```json
{
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 60
  }
}
```

Railway will call `GET /api/health` within the first 60 seconds.
The server now listens immediately on startup (before MongoDB connects),
so this probe always gets a 200 response.

### Step 5 — Deploy

Click **Deploy** (or push to GitHub — Railway auto-deploys on push).

Watch the Railway build logs. You should see:
```
🗞  The Newsbie server listening on port XXXX
✅ MongoDB connected: mongodb+srv://<user>:<password>@cluster0...
🚀 Database ready — all systems go.
```

If you see the first line but not the MongoDB line, your URI is wrong —
double-check Variables.

### Step 6 — Seed the database (run once, locally)

```bash
# From your local machine, with the production URI
MONGODB_URI="mongodb+srv://newsbie:<newpassword>@cluster0.56qb65z.mongodb.net/newsbie?retryWrites=true&w=majority" \
  node seed.js
```

Expected output:
```
✅ MongoDB connected
🗑  Clearing existing data…
👤 Seeding users (individually to trigger password hashing)…
   ✓ naman2170 (admin)
   ✓ editor (editor)
   ✓ contributor (contributor)
   ✓ viewer (viewer)
📰 Seeding articles…
✅ Database seeded successfully!
```

**Never run `node seed.js` on Railway itself** — it deletes all existing data.

### Step 7 — Generate your public URL

Railway → Your Service → **Settings** → **Domains** → Generate Domain.

Your site will be live at `https://your-app.up.railway.app`.

---

## 4. Testing with Postman

### Import the collection

1. Open Postman → **Import** → upload `newsbie-postman-collection.json`
2. Click the collection → **Variables** → set `baseUrl` to your Railway URL
3. Run **Login — Admin** first (token auto-saves to `authToken`)
4. All other requests pick up the token automatically

### Test sequence for verifying everything works

```
1. GET  /api/health              → { status: 'ok', db: 'connected' }
2. POST /api/auth/login          → { token: '...', user: { role: 'admin' } }
3. GET  /api/articles            → array of 7 seeded articles
4. POST /api/articles            → 201, new article _id saved
5. GET  /api/articles?status=all → shows pending + draft + published
6. PATCH /api/articles/:id/approve  → { status: 'published' }
7. PATCH /api/articles/:id/feature  → { featured: true }
```

### Common Postman errors and fixes

| Error | Cause | Fix |
|---|---|---|
| `ECONNREFUSED` | Railway URL wrong | Check baseUrl variable |
| `401 Authentication required` | Token missing or expired | Re-run Login request |
| `403 Insufficient permissions` | Using contributor token for admin action | Login as naman2170 |
| `500 Server error` | MongoDB not connected | Check Railway logs for URI error |
| `404 Article not found` | Wrong `articleId` variable | Re-run Get All Articles to refresh it |

---

## 5. Security Improvements

### 5a. Rate limiting (prevent brute-force login attacks)

Install: `npm install express-rate-limit`

Add to `server.js` after the middleware section:

```js
const rateLimit = require('express-rate-limit');

// Limit login attempts: 10 per 15 minutes per IP
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// General API rate limit: 200 requests per minute per IP
app.use('/api/', rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { error: 'Rate limit exceeded.' },
}));
```

### 5b. Helmet (security headers)

Install: `npm install helmet`

```js
const helmet = require('helmet');
// Add BEFORE all routes, AFTER cors()
app.use(helmet({
  contentSecurityPolicy: false,  // set to true and configure once you know your CDN domains
  crossOriginEmbedderPolicy: false,
}));
```

### 5c. Input sanitisation (prevent NoSQL injection)

Install: `npm install express-mongo-sanitize`

```js
const mongoSanitize = require('express-mongo-sanitize');
// Add after express.json()
app.use(mongoSanitize());
```

This strips `$` and `.` from request bodies, preventing queries like
`{ "username": { "$gt": "" } }` from bypassing authentication.

### 5d. CORS — lock down to your domain in production

Currently `cors({ origin: '*' })` allows any site to call your API.
Change this once you know your Railway URL:

```js
app.use(cors({
  origin: [
    'https://your-app.up.railway.app',
    'http://localhost:5000',  // local dev only
  ],
  methods: ['GET','POST','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 5e. JWT expiry and refresh

The current token lasts 7 days. For higher security, shorten it and add refresh:

```js
// Shorter-lived access token
function makeToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role, name: user.name },
    SECRET,
    { expiresIn: '24h' }  // was '7d'
  );
}
```

### 5f. Uploaded file security

Currently uploaded images land in `public/uploads/` which is served as static
files. This is fine for images, but add a strict MIME check and filename
sanitiser to prevent path-traversal attacks:

```js
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};
```

The current `multer` config already checks `mimetype.startsWith('image/')` which
is the minimum. The explicit allowlist above is stricter.

### 5g. Never expose stack traces in production

The global error handler currently logs and returns `err.message`. In production,
never return internal error details to clients. Add an environment check:

```js
app.use((err, req, res, _next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  console.error('[Error]', err.message, isDev ? err.stack : '');
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'An unexpected error occurred',
  });
});
```

Add `NODE_ENV=production` to your Railway Variables.

---

## 6. Debugging Checklist

If something still doesn't work after deploying, go through this list:

```
□ Railway logs show "server listening on port XXXX"?
  No → check package.json "start" script = "node server.js"

□ Railway logs show "MongoDB connected"?
  No → MONGODB_URI is wrong or Atlas Network Access blocks Railway

□ /api/health returns { db: 'connected' }?
  No → MongoDB URI bug — check /newsbie is in the path before ?

□ Login returns 401 for correct credentials?
  → seed.js used User.create([array]) — passwords not hashed.
    Re-run seed.js (the fixed version creates users individually).

□ Login returns 500?
  → async pre-save hook bug — old server.js inline schema had (next) param.
    Use the fixed models/User.js from the delivered files.

□ Articles not appearing on homepage?
  → artId() mismatch bug in script.js — use the fixed script.js.

□ Section Manager buttons do nothing?
  → toggleSM indexOf() type mismatch — use the fixed script.js.

□ New users can't log in after being created in admin panel?
  → addUser() only wrote to localStorage — use the fixed script.js
    which now calls POST /api/users to register in MongoDB.

□ index.html not found / ENOENT error?
  → HTML files are at repo root, not in /public.
    Move index.html, admin.html, script.js, style.css into /public/.
```

---

## 7. All Fixed Bugs — Complete Reference

| # | File | Bug | Symptom |
|---|---|---|---|
| 1 | `server.js` | `app.listen()` inside `mongoose.connect().then()` — port only opens after DB connects | **Railway healthcheck fails** |
| 2 | `server.js` (inline) / `models/User.js` | `async function(next)` pre-save hook — `next` is undefined in Mongoose 6+, calling it throws TypeError | **Login always 500** |
| 3 | `server.js` | No `/api/health` endpoint | Railway has no clean probe target |
| 4 | `seed.js` | `require('./config/db')` — file didn't exist | **Seed crashes immediately** |
| 5 | `seed.js` | `User.create([array])` calls `insertMany()` which bypasses pre-save hooks | **Passwords stored as plain text; all logins fail** |
| 6 | `_env` / `MONGODB_URI` | No database name in URI — data goes to `test` not `newsbie` | **Data appears saved but isn't visible** |
| 7 | `script.js` | `a.id` used instead of `a._id` for MongoDB documents | Homepage sections empty |
| 8 | `script.js` | `Array.indexOf()` type mismatch (string vs number IDs) | Section Manager buttons do nothing |
| 9 | `script.js` | `rest.slice(3)` as grid fallback | Latest Stories grid empty with ≤4 articles |
| 10 | `script.js` | `addUser()` only wrote to localStorage | New users can't log in |
| 11 | `admin.html` | `approveArticle()` used `PUT` (partial) instead of `PATCH /approve` | Approve button risks wiping article content |
| 12 | `admin.html` | `renderArticles()` sent no `?status=all` for manage view | Admin manage tab showed only published articles |
