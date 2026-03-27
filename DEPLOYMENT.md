# The Newsbie — Deployment & Bug Fix Guide

## Repository Structure (after applying fixes)

```
your-repo/
├── public/                ← move index.html, admin.html, script.js, style.css HERE
│   ├── index.html
│   ├── admin.html
│   ├── script.js          ← apply the fixes from script_fixes.js
│   └── style.css
├── uploads/               ← created automatically on first run (gitignored)
├── server.js              ← NEW — complete backend
├── package.json           ← NEW — dependencies
├── railway.toml           ← NEW — Railway config
├── .env.example           ← NEW — environment variable template
├── .gitignore
└── script_fixes.js        ← reference only — delete after applying fixes
```

---

## Step 1 — Apply the script.js Fixes

Open `public/script.js` and make these targeted replacements.
Search for the 🔴 text shown in `script_fixes.js` and swap it for the ✅ version.

| Fix | Line(s) | What to do |
|-----|---------|------------|
| 1   | ~5      | `API_BASE = "http://localhost:3000/api"` → `API_BASE = "/api"` |
| 2   | ~231    | Add `let editingArticleId = null;` with the other state vars |
| 3   | ~205–214 | Replace `loadArticles()` with the fixed version |
| 4   | ~756–795 | Replace the broken `doLogin()` block with the fixed function |
| 5   | ~867–915 | Replace `publishOrSave()` + `cancelWriteEdit()` with fixed versions |
| 6   | ~1005   | Replace `approveArticle()` and `toggleFeatured()` |
| 7   | ~1007   | Replace `deleteArticle()` |
| 8   | ~661    | Replace `postComment()` |

---

## Step 2 — Move frontend files to /public

Railway will serve `server.js` as Node.js. All static files must live in `/public`.

```bash
mkdir -p public
mv index.html admin.html script.js style.css public/
```

---

## Step 3 — Set up MongoDB Atlas (if you haven't already)

1. Go to https://cloud.mongodb.com
2. Create a free cluster (M0)
3. Create a database user with read/write permissions
4. Whitelist `0.0.0.0/0` in Network Access (Railway uses dynamic IPs)
5. Click **Connect → Drivers** and copy the connection string
6. Replace `<password>` in the string with your actual password

---

## Step 4 — Configure Environment Variables on Railway

In your Railway project → **Variables** tab, add:

```
MONGODB_URI = mongodb+srv://user:password@cluster.mongodb.net/newsbie?retryWrites=true&w=majority
JWT_SECRET  = (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

⚠️ Do NOT add `PORT` — Railway sets it automatically.

---

## Step 5 — Push to GitHub and Deploy

```bash
git add .
git commit -m "fix: complete backend + script.js bug fixes"
git push origin main
```

Railway will auto-detect the `package.json`, install dependencies, and run `node server.js`.

---

## Step 6 — Verify Everything Works

1. **Health check**: visit `https://your-app.railway.app/api/health`
   - Should return `{ "status": "ok", "db": "connected" }`

2. **Homepage**: visit `https://your-app.railway.app`
   - Should show articles (initially empty — that's correct)

3. **Publish an article**:
   - Click **+ Publish** → login with `naman2170` / `Naman123`
   - Fill in Title, Content, Category → click Publish Article
   - Refresh the homepage — the article should appear

4. **Image upload**:
   - When writing an article, drag an image onto the upload zone
   - The image will be uploaded to `/uploads/` on the server and served as a URL

5. **Categories**: Articles published under World, Politics, etc. automatically
   appear in those sections when you click the nav links.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `MongoDB connection error` | Wrong URI or IP not whitelisted | Check Atlas Network Access → allow 0.0.0.0/0 |
| Login fails | JWT_SECRET not set | Add JWT_SECRET in Railway Variables |
| `401 Unauthorized` on publish | Token expired or not sent | Logout and log back in |
| Images not loading | `/uploads` not served | Already fixed in server.js — make sure you're using the new server.js |
| `No articles in this section` | API returning empty or error | Check `/api/health` and Railway logs |
| Articles appear then disappear | Missing `editingArticleId` declaration | Apply Fix 2 from script_fixes.js |

---

## Credentials

| Username     | Password    | Role        |
|-------------|------------|-------------|
| naman2170   | Naman123   | Admin       |
| editor      | editor123  | Editor      |
| contributor | contrib123 | Contributor |
| viewer      | view123    | Viewer      |

⚠️ Change these passwords before going live! Edit the USERS array in server.js
or migrate to a MongoDB users collection.
