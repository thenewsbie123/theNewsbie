/* ===============================
   API CONFIG
================================ */

const API_BASE = "http://localhost:3000/api";

let token = localStorage.getItem("token") || null;

async function apiRequest(url, method = "GET", body = null) {

  const options = {
    method,
    headers: {
      "Content-Type": "application/json"
    }
  };

  if (token) {
    options.headers["Authorization"] = "Bearer " + token;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(API_BASE + url, options);

  if (!res.ok) {
    throw new Error("API request failed");
  }

  return await res.json();
}


/* ================================================================
   THE NEWSBIE — script.js
   All JavaScript for the site.
   Loaded at bottom of <body> in index.html.

   TABLE OF CONTENTS
   -----------------
    1.  Default Data  (articles, highlights, editorials, users, authors)
    2.  State & Variables
    3.  Permissions
    4.  Utilities  (clock, toast, readTime, images, save)
    5.  Dark Mode
    6.  Render Homepage
    7.  Article Reading Overlay
    8.  Reading Toolbar
    9.  Filter & Search
   10.  Social Sharing
   11.  Comments
   12.  Image Upload (drag-drop + URL)
   13.  Login / Logout / Session  (mobile-fixed)
   14.  Admin Tabs
   15.  Write / Edit Article
   16.  Manage Tab
   17.  Sections Tab
   18.  Highlights Tab
   19.  Editorial Tab
   20.  Subscribers Tab
   21.  Newsletter Subscription
   22.  Users
   23.  Scroll Progress Bar
   24.  Global Close
   25.  Author Profile Helpers
   26.  Authors Tab
   27.  Editorial Visibility & Limit
   28.  Export Subscribers
   29.  Section Page System
   30.  Mobile FAB + Bottom Nav
   31.  iOS Override (showAdminPanel / closeAdmin)
   32.  Init
================================================================ */
'use strict';

/* ══════════════════════════════════════════════════
   DATA — DEFAULT ARTICLES
══════════════════════════════════════════════════ */
const DEFAULT_ARTICLES = [
  {
    id: 1, title: "The Strait That Rules the World: How 33 Kilometers of Water Shapes Global Oil Markets", subtitle: "A geographic chokepoint controls one-fifth of the world's petroleum supply — and the nations that depend on it know it.", author: "Alexandra Reinholt", category: "World", date: "March 20, 2026", readTime: "8 min read", excerpt: "Every morning, 17 oil tankers navigate a passage barely 33 kilometers wide. What happens there determines fuel prices from Tokyo to São Paulo.", tags: ["Geopolitics", "Oil", "Iran", "Energy"], img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=80", featured: true, status: "published", content: `The sun rises over the Strait of Hormuz at 5:47 a.m., illuminating a procession of tankers that have been moving through these waters since before dawn. These vessels — some longer than the Empire State Building is tall — carry approximately 21 million barrels of crude oil per day.

## A Passage No Nation Can Ignore

The Strait of Hormuz, separating the Persian Gulf from the Gulf of Oman, is the world's most strategically critical maritime chokepoint. At its narrowest point, the usable shipping lane is barely 3.2 kilometers wide in each direction.

> "If Hormuz closes, the global economy doesn't just feel it. It collapses." — Dr. Margaret Calloway, Johns Hopkins University

Iran controls the northern shore of the strait. The Persian Gulf states — Saudi Arabia, the UAE, Kuwait, Qatar — depend on it for virtually all their exports.

## Oil Prices as a Thermometer

Watch oil prices on any given day and you can read the temperature of Hormuz tensions. When IRGC naval exercises intensify, prices spike. The market is essentially pricing the probability that 33 kilometers of water remain navigable.

## Iran's Geographic Leverage

Iran has never needed to actually close the strait. The threat alone provides extraordinary leverage — using physical reality as a strategic asset.`, comments: [{ name: "James Whitfield", date: "March 20, 2026", text: "Brilliant analysis. The point about deterrence through geography is particularly astute." }, { name: "Priya Nair", date: "March 20, 2026", text: "The statistic about 3.2km usable lanes is astonishing." }]
  },
  {
    id: 2, title: "AI's Democratic Reckoning: Machine Learning Is Reshaping Political Discourse", subtitle: "From deepfakes to algorithmic recommendation engines, AI is rewriting the rules of democratic participation.", author: "Marcus Chen", category: "Technology", date: "March 19, 2026", readTime: "6 min read", excerpt: "As AI-generated content floods digital platforms, regulators scramble to define authenticity in a world where seeing is no longer believing.", tags: ["AI", "Democracy", "Technology", "Politics"], img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&q=80", featured: false, status: "published", content: `The footage appeared authentic. A senior official, speaking clearly, announcing a policy reversal that sent markets tumbling. Within 90 minutes, it was confirmed as fabricated.

## The New Disinformation Landscape

This incident represents a new category of democratic threat — technically perfect synthetic reality.

> "The question isn't whether AI will change democracy. It already has." — Dr. Sofia Andersson, Oxford Internet Institute

## Regulatory Responses

The European Union's AI Authenticity Act, passed in December 2025, requires watermarking of AI-generated political content.`, comments: [{ name: "Lena Brauer", date: "March 19, 2026", text: "The EU approach seems the most measured. Watermarking feels like the right compromise." }]
  },
  {
    id: 3, title: "The Last Arctic Frontier: Climate Scientists Warn of Irreversible Permafrost Thaw", subtitle: "A new study suggests that carbon locked in permafrost for millennia could be released faster than climate models predict.", author: "Dr. Elena Vasquez", category: "Science", date: "March 18, 2026", readTime: "7 min read", excerpt: "Across Siberia, Alaska, and Canada, the ground is thawing at unprecedented rates, releasing ancient carbon stores.", tags: ["Climate", "Arctic", "Science", "Environment"], img: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=900&q=80", featured: false, status: "published", content: `Standing on what should be solid ground in Siberia's Yakutia region, Dr. Elena Vasquez watches the earth move. A ground that has been frozen for 10,000 years is shifting.

## The Feedback Nobody Modeled

Permafrost contains an estimated 1.5 trillion tonnes of organic carbon — roughly double what is currently in the atmosphere.

> "We may have already crossed a threshold that no policy can reverse." — Dr. Elena Vasquez`, comments: []
  },
  {
    id: 4, title: "The Return of Industrial Policy: Western Governments Are Rebuilding Strategic Manufacturing", subtitle: "After decades of offshoring, the US and EU are betting trillions on reshoring critical industries.", author: "Thomas Bergmann", category: "Politics", date: "March 17, 2026", readTime: "9 min read", excerpt: "Supply chain vulnerabilities exposed during the pandemic and the Ukraine war have prompted a dramatic reversal of free-market orthodoxy.", tags: ["Economics", "Manufacturing", "Politics", "Trade"], img: "https://images.unsplash.com/photo-1565793979368-b8de75fbcb81?w=900&q=80", featured: false, status: "published", content: `The factory floor stretches a kilometer in each direction. Three years ago, this land in Ohio was farmland. Today, it produces advanced semiconductors.

## The Death of Washington Consensus

For thirty years, the prevailing wisdom was clear: let markets decide. Ukraine shattered that consensus.

> "We discovered that efficiency without resilience is just fragility in disguise." — Christine Lagarde, ECB`, comments: []
  },
  {
    id: 5, title: "The Digital Nomad's Dilemma: Remote Work Is Reshaping Cities", subtitle: "As tech workers relocate, locals face rising rents, cultural displacement, and an economy optimized for outsiders.", author: "Isabelle Fontaine", category: "Culture", date: "March 16, 2026", readTime: "5 min read", excerpt: "In Tbilisi, Lisbon, Medellín and dozens of other cities, the arrival of remote workers has created a complicated social ledger.", tags: ["Remote Work", "Culture", "Cities", "Economy"], img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80", featured: false, status: "published", content: `The café opens at 9 a.m. By 9:15, every laptop seat is taken. The clientele is international — all paying for coffee with cards linked to accounts in countries far away.

## A New Kind of Tourism

Digital nomadism has created a new economic category that cities have struggled to classify, tax, and accommodate.`, comments: []
  },
  {
    id: 6, title: "Pakistan's Water Crisis: A Nation at the Intersection of Climate and Geopolitics", subtitle: "As glaciers shrink and population grows, Pakistan faces a water emergency that threatens regional stability.", author: "Amir Hassan", category: "World", date: "March 15, 2026", readTime: "8 min read", excerpt: "Pakistan has the world's largest glacier outside the polar regions, yet water scarcity affects 80% of its population.", tags: ["Pakistan", "Water", "Climate", "Asia"], img: "https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=900&q=80", featured: false, status: "published", content: `The Indus River has sustained civilization for 5,000 years. Today, the river's future is uncertain in ways its ancient inhabitants could not have imagined.

## Glaciers, Monsoons, and Math

Pakistan sits at a difficult hydrological intersection. Its northern territories contain the Karakoram and Hindu Kush ranges, home to more glacial ice than anywhere outside the polar regions.`, comments: []
  },
  {
    id: 7, title: "Rethinking Leadership: Management Philosophies Transforming Modern Organizations", subtitle: "A new generation of executives is rejecting hierarchy in favor of psychological safety and radical transparency.", author: "Dr. Julia Nakamura", category: "Opinion", date: "March 14, 2026", readTime: "4 min read", excerpt: "Research from Google, Microsoft, and hundreds of startups confirms: the way we managed organizations in the 20th century was fundamentally broken.", tags: ["Leadership", "Business", "Opinion", "Culture"], img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80", featured: false, status: "published", content: `The annual performance review is dying. The open-plan office is under siege. The 9-to-5 schedule is a relic.

## What the Research Actually Shows

Google's Project Aristotle found that psychological safety was the single most important factor in team effectiveness.

> "The best ideas rarely come from the top. The best leaders create conditions where ideas can come from anywhere." — Dr. Amy Edmondson, Harvard`, comments: []
  },
];

const DEFAULT_HIGHLIGHTS = [
  { id: 1, text: "BREAKING: Global oil prices surge past $82/barrel amid Hormuz tension escalation", enabled: true, type: "custom" },
  { id: 2, text: "LATEST: OPEC+ emergency meeting called — production cut extension on agenda", enabled: true, type: "custom" },
  { id: 3, text: "UPDATE: EU passes landmark AI transparency legislation", enabled: true, type: "custom" },
  { id: 4, text: "DEVELOPING: Arctic permafrost thaw accelerating beyond 2025 climate projections", enabled: true, type: "custom" },
];

const DEFAULT_EDITORIALS = [
  {
    id: 201, type: "Editorial", title: "The Strait Cannot Be Ignored Any Longer", subtitle: "Western energy policy has sleepwalked into dependence on the world's most fragile chokepoint.", author: "The Newsbie Editorial Board", authorTitle: "Editorial Board", authorBio: "The Newsbie Editorial Board represents the institutional voice of the publication on matters of global significance.", date: "March 20, 2026", tags: ["Oil", "Geopolitics", "Policy"], img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=80", relatedId: 1, isPick: true, content: `For three decades, Western governments have understood the mathematics of Hormuz and done very little about it. Today the arithmetic is starker than ever.

## The Failure of Diversification Policy

Every major energy summit since the 1990s has produced declarations of intent to reduce dependence on Gulf oil. Every one has fallen short.

> "We have known about this vulnerability for thirty years. We have treated it as someone else's problem. It is now everyone's problem." — The Newsbie Editorial Board

## What Must Change

The answer is not another declaration. It is accelerated investment in alternative supply routes, genuine renewable transition timelines, and strategic reserve policies.`},
  {
    id: 202, type: "Opinion", title: "Artificial Intelligence Is Not Destroying Democracy — But It Is Testing It", subtitle: "The real threat is not the technology. It is the political culture that will decide how to govern it.", author: "Dr. Marcus Chen", authorTitle: "Technology Correspondent", authorBio: "Dr. Marcus Chen covers technology and democratic governance for The Newsbie.", date: "March 19, 2026", tags: ["AI", "Democracy", "Opinion"], img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&q=80", relatedId: 2, isPick: false, content: `The handwringers are not entirely wrong. But they are asking the wrong question.

## The Tool Is Not the Threat

Every communications technology in history has been greeted with similar alarm about its destabilising effect on democratic discourse.

> "Democracies were not built for the speed of social media. They were certainly not built for the speed of generative AI." — Dr. Marcus Chen`},
];

const DEFAULT_USERS = [
  { id: 1, username: "naman2170", password: "Naman123", role: "admin", name: "Naman" },
  { id: 2, username: "editor", password: "editor123", role: "editor", name: "Sarah Mitchell" },
  { id: 3, username: "contributor", password: "contrib123", role: "contributor", name: "James Okafor" },
  { id: 4, username: "viewer", password: "view123", role: "viewer", name: "Guest Reviewer" },
];

/* ══════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════ */
const DEFAULT_AUTHORS = [
  { id: 1, name: "Alexandra Reinholt", role: "Senior Foreign Affairs Correspondent", bio: "Alexandra covers geopolitics, energy markets, and security affairs for The Newsbie. She has reported from 40+ countries.", avatar: "", social: { tw: "alexreinholt", li: "", ig: "", fb: "", web: "" } },
  { id: 2, name: "Marcus Chen", role: "Technology & Democracy Correspondent", bio: "Marcus writes on the intersection of technology, society, and political systems. Former researcher at Stanford Internet Observatory.", avatar: "", social: { tw: "marcuschen", li: "marcuschen", ig: "", fb: "", web: "" } },
  { id: 3, name: "Dr. Elena Vasquez", role: "Science & Environment Editor", bio: "Dr. Vasquez holds a PhD in Climate Science from MIT. She leads The Newsbie's environmental coverage.", avatar: "", social: { tw: "", li: "", ig: "", fb: "", web: "https://elenavasquez.com" } },
];
let authors = JSON.parse(localStorage.getItem('nb_authors') || 'null') || DEFAULT_AUTHORS;
let articles = [];

async function loadArticles() {
  const res = await fetch("/api/articles");
  const data = await res.json();

  articles = data;

  renderHome();
}

loadArticles();
let highlights = JSON.parse(localStorage.getItem('nb_highlights') || 'null') || DEFAULT_HIGHLIGHTS;
let editorials = JSON.parse(localStorage.getItem('nb_editorials') || 'null') || DEFAULT_EDITORIALS;
let users = JSON.parse(localStorage.getItem('nb_users') || 'null') || DEFAULT_USERS;
let sectionCfg = JSON.parse(localStorage.getItem('nb_sections') || 'null') || { latest: [], editors: [], trending: [] };
let editorialCfg = JSON.parse(localStorage.getItem('nb_editorial_cfg') || 'null') || { limit: 3 };
let currentUser = JSON.parse(sessionStorage.getItem('nb_session') || 'null');
// Restore from localStorage if sessionStorage is empty (mobile browser may clear sessionStorage)
if (!currentUser) {
  try { currentUser = JSON.parse(localStorage.getItem('nb_session_persist') || 'null'); } catch(e) {}
  // Re-sync to sessionStorage
  if (currentUser) {
    try { sessionStorage.setItem('nb_session', JSON.stringify(currentUser)); } catch(e) {}
  }
}
let ejsCfg = JSON.parse(localStorage.getItem('nb_ejs') || '{}');

let currentFilter = 'all', manageFilter = 'all', currentArticleIdx = 0;
let autoScrolling = false, autoScrollInterval = null, scrollSpeed = 3, articleFontSize = 18, focusMode = false;
let uploadedImgData = null;
let hlDragIdx = null, edDragIdx = null;

const save = () => {
  console.log("Local storage disabled — using MongoDB backend");
};

/* ══════════════════════════════════════════════════
   PERMISSIONS
══════════════════════════════════════════════════ */
const PERMS = {
  admin: { write: true, editAny: true, publish: true, approve: true, feature: true, delete: true, users: true },
  editor: { write: true, editAny: true, publish: true, approve: true, feature: true, delete: false, users: false },
  contributor: { write: true, editAny: false, publish: false, approve: false, feature: false, delete: false, users: false },
  viewer: { write: false, editAny: false, publish: false, approve: false, feature: false, delete: false, users: false },
};
const perm = k => currentUser ? PERMS[currentUser.role]?.[k] || false : false;
const canEdit = a => perm('editAny') || (currentUser && a.author === currentUser.name);

/* ══════════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════════ */
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function initClock() {
  const n = new Date();
  document.getElementById('tl-date').textContent = `${DAY[n.getDay()]}, ${MO[n.getMonth()]} ${n.getDate()}, ${n.getFullYear()}`;
}
initClock();

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3200);
}

function calcReadTime(c) { if (!c) return '1 min read'; return Math.ceil(c.trim().split(/\s+/).length / 200) + ' min read' }

const PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=70',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=70',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=70',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=70',
  'https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?w=800&q=70',
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=70',
];
function getImg(a) { return a.img || PLACEHOLDERS[a.id % PLACEHOLDERS.length] }
function getEdImg(e, i) { return e.img || PLACEHOLDERS[i % PLACEHOLDERS.length] }

function dateStr() { return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }

function parseContent(c) {
  if (!c) return '<p>Article content coming soon.</p>';
  return c.split('\n\n').map(p => {
    p = p.trim(); if (!p) return '';
    if (p.startsWith('## ')) return `<h2>${p.slice(3)}</h2>`;
    if (p.startsWith('### ')) return `<h3>${p.slice(4)}</h3>`;
    if (p.startsWith('> ')) return `<div class="art-pullquote"><blockquote>${p.slice(2)}</blockquote></div>`;
    if (p.startsWith('![')) return (m => m ? `<img src="${m[2]}" alt="${m[1]}" style="width:100%;margin:1em 0">` : '')(p.match(/!\[(.+?)\]\((.+?)\)/));
    p = p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
    return `<p>${p}</p>`;
  }).join('');
}

function scrollToSection(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

/* ══════════════════════════════════════════════════
   DARK MODE
══════════════════════════════════════════════════ */
function toggleDark() {
  const d = document.documentElement.hasAttribute('data-dark');
  d ? document.documentElement.removeAttribute('data-dark') : document.documentElement.setAttribute('data-dark', '');
  localStorage.setItem('nb_dark', d ? '0' : '1');
  syncDarkIcon();
}
function syncDarkIcon() {
  const d = document.documentElement.hasAttribute('data-dark');
  document.getElementById('dark-icon-sun').classList.toggle('js-hidden', !d);
  document.getElementById('dark-icon-moon').classList.toggle('js-hidden', d);
}
if (localStorage.getItem('nb_dark') === '1') { document.documentElement.setAttribute('data-dark', ''); }
syncDarkIcon();

/* ══════════════════════════════════════════════════
   RENDER HOME
══════════════════════════════════════════════════ */
function renderHome() {
  const pub = articles.filter(a => (a.status || 'published') === 'published');
  const filt = currentFilter === 'all' ? pub : pub.filter(a => a.category === currentFilter);

  // HERO
  const feat = filt.find(a => a.featured) || filt[0];
  const rest = filt.filter(a => a.id !== feat?.id);
  if (feat) {
    document.getElementById('hero-img').src = getImg(feat);
    document.getElementById('hero-img').alt = feat.title;
    document.getElementById('hero-img-wrap').onclick = () => openArticle(articles.indexOf(feat));
    document.getElementById('hero-cat').textContent = feat.category;
    document.getElementById('hero-title').textContent = feat.title;
    document.getElementById('hero-title').onclick = () => openArticle(articles.indexOf(feat));
    document.getElementById('hero-subtitle').textContent = feat.subtitle || '';
    document.getElementById('hero-author').textContent = 'By ' + feat.author;
    document.getElementById('hero-date').textContent = feat.date;
    document.getElementById('hero-rt').textContent = feat.readTime || calcReadTime(feat.content);
  }

  // HERO SIDE — use sectionCfg.editors if set
  let sideArts;
  if (sectionCfg.editors?.length) {
    sideArts = sectionCfg.editors.map(id => articles.find(a => a.id === id)).filter(a => a && (a.status || 'published') === 'published' && a.id !== feat?.id).slice(0, 3);
  }
  if (!sideArts || !sideArts.length) sideArts = rest.slice(0, 3);
  document.getElementById('hero-side').innerHTML =
    '<div class="sec-label">Editor\'s Selection</div><hr class="sec-divider">' +
    sideArts.map(a => `
  <div class="side-story" onclick="openArticle(${articles.indexOf(a)})">
    <img class="side-img" src="${getImg(a)}" alt="${a.title}">
    <div class="hero-cat">${a.category}</div>
    <div class="side-title">${a.title}</div>
    <div class="side-meta">By ${a.author} · ${a.readTime || calcReadTime(a.content)}</div>
  </div>`).join('');

  // EDITORIAL STRIP — merge editorials + opinion articles
  renderEditorialStrip();

  // ARTICLES GRID — use sectionCfg.latest if set
  let gridArts;
  if (sectionCfg.latest?.length) {
    gridArts = sectionCfg.latest.map(id => articles.find(a => a.id === id)).filter(a => a && (a.status || 'published') === 'published');
  }
  if (!gridArts || !gridArts.length) gridArts = rest.slice(3);
  const grid = document.getElementById('articles-grid');
  grid.innerHTML = gridArts.length === 0
    ? `<div style="padding:32px;color:var(--ink4);font-family:var(--fs);font-size:13px;grid-column:1/-1;text-align:center">No articles in this section.</div>`
    : gridArts.map(a => `
  <div class="art-card" onclick="openArticle(${articles.indexOf(a)})">
    <img class="art-card-img" src="${getImg(a)}" alt="${a.title}">
    <div class="art-card-cat">${a.category}</div>
    <div class="art-card-title">${a.title}</div>
    <div class="art-card-excerpt">${a.excerpt || a.subtitle || ''}</div>
    <div class="art-card-meta"><span class="author">By ${a.author}</span><span>${a.readTime || calcReadTime(a.content)}</span></div>
  </div>`).join('');

  // TRENDING — use sectionCfg.trending if set
  let trendArts;
  if (sectionCfg.trending?.length) {
    trendArts = sectionCfg.trending.map(id => articles.find(a => a.id === id)).filter(a => a && (a.status || 'published') === 'published').slice(0, 5);
  }
  if (!trendArts || !trendArts.length) trendArts = pub.slice(0, 5);
  document.getElementById('trending-list').innerHTML = trendArts.map((a, i) => `
<div class="trending-item" onclick="openArticle(${articles.indexOf(a)})">
  <div class="trending-num">${String(i + 1).padStart(2, '0')}</div>
  <div>
    <div class="trending-title">${a.title}</div>
    <div class="trending-meta">${a.category} · ${a.readTime || calcReadTime(a.content)}</div>
  </div>
</div>`).join('');

  // EDITOR'S PICKS sidebar
  document.getElementById('editors-picks').innerHTML = pub.slice(1, 5).map(a => `
<div class="ep-item" onclick="openArticle(${articles.indexOf(a)})">
  <img class="ep-img" src="${getImg(a)}" alt="">
  <div>
    <div class="ep-cat">${a.category}</div>
    <div class="ep-title">${a.title}</div>
  </div>
</div>`).join('');

  // TOPICS
  const tags = [...new Set(articles.flatMap(a => a.tags || []))];
  const tc = document.getElementById('topics-cloud');
  if (tc) tc.innerHTML = tags.map(t => `<div class="tag-pill" onclick="searchByTag('${t}')">${t}</div>`).join('');

  // TICKER
  renderTicker();
  updatePendingBadge();
}

function renderEditorialStrip() {
  // Collect visible dedicated editorials (not hidden)
  const visEditorials = editorials.filter(e => e.visible !== false);
  // Collect Opinion/Editorial category articles
  const opArts = articles
    .filter(a => (a.status || 'published') === 'published' && (a.category === 'Opinion' || a.category === 'Editorial'))
    .map(a => ({
      id: 'art_' + a.id, type: a.category, title: a.title,
      subtitle: a.subtitle, author: a.author, date: a.date,
      isPick: false, visible: true,
      _artIdx: articles.indexOf(a)
    }));
  // Merge: visible editorials first (in priority order), then opinion articles
  const all = [...visEditorials, ...opArts];
  // Apply limit
  const limit = editorialCfg.limit > 0 ? editorialCfg.limit : all.length;
  const shown = all.slice(0, limit);

  const grid = document.getElementById('editorial-grid');
  if (!shown.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;padding:20px;text-align:center;font-family:var(--fs);font-size:13px;color:var(--ink4)">No editorials published yet. Add one in <strong>Newsbie Studio → Editorial</strong>.</div>`;
    return;
  }
  grid.innerHTML = shown.map((e, i) => {
    const edIdx = editorials.indexOf(e);
    const onclick = e._artIdx !== undefined
      ? `openArticle(${e._artIdx})`
      : `openEditorial(${edIdx})`;
    return `<div class="ed-card" onclick="${onclick}">
  ${e.isPick ? '<div class="ed-pick-badge">★ Editor\'s Pick</div>' : ''}
  <div class="ed-type-lbl">${e.type}</div>
  <div class="ed-card-title">${e.title}</div>
  <div class="ed-card-sub">${e.subtitle || ''}</div>
  <div class="ed-card-byline"><strong>${e.author}</strong> · ${e.date}</div>
</div>`;
  }).join('');
}

function renderTicker() {
  const active = highlights.filter(h => h.enabled);
  const items = active.length > 0 ? active : articles.slice(0, 6).map(a => ({ text: a.title }));
  const doubled = [...items, ...items];
  document.getElementById('ticker-track').innerHTML = doubled.map(h => `<div class="ticker-item"><span class="ti-sep">●</span>${h.text}</div>`).join('');
}

function updatePendingBadge() {
  const count = articles.filter(a => (a.status || 'published') === 'pending').length;
  const b = document.getElementById('pending-badge');
  b.textContent = count; count > 0 ? b.classList.remove('js-hidden') : b.classList.add('js-hidden');
}

/* ══════════════════════════════════════════════════
   ARTICLE OVERLAY
══════════════════════════════════════════════════ */
function openArticle(idx) {
  currentArticleIdx = idx;
  const a = articles[idx]; if (!a) return;
  const related = articles.filter((r, i) => i !== idx && (r.category === a.category || (r.tags || []).some(t => (a.tags || []).includes(t)))).slice(0, 3);
  const comments = a.comments || [];
  // Author profile card
  const authorObj = a.authorId ? authors.find(au => au.id === a.authorId) : null;
  const authorCardHtml = authorObj ? buildAuthorCard(authorObj) : '';

  document.getElementById('art-inner').innerHTML = `
<div class="art-cat-label">${a.category}</div>
<h1 class="art-headline">${a.title}</h1>
<p class="art-subtitle">${a.subtitle || ''}</p>
<div class="art-byline">
  <div class="art-avatar">${buildAvatarHtml(authorObj, a.author)}</div>
  <div class="art-byline-info">
    <div class="art-author">By ${a.author}</div>
    <div class="art-meta">${a.date} · ${a.readTime || calcReadTime(a.content)}</div>
  </div>
  <div class="art-share">
    <button class="share-btn" onclick="shareSocial('twitter')" title="Share on X">𝕏</button>
    <button class="share-btn" onclick="shareSocial('linkedin')" title="LinkedIn">in</button>
    <button class="share-btn" onclick="shareSocial('copy')" title="Copy link">🔗</button>
  </div>
</div>
<img class="art-hero-img" src="${getImg(a)}" alt="${a.title}">
<p class="art-caption">${a.title} — Photo: The Newsbie</p>
<div class="art-body" id="art-body">${parseContent(a.content)}</div>
${authorCardHtml}
<div class="art-tags">${(a.tags || []).map(t => `<div class="tag-pill" onclick="searchByTag('${t}')">${t}</div>`).join('')}</div>
${related.length ? `<div class="related-section"><h3>Continue Reading</h3><div class="related-grid">${related.map(r => `<div class="related-card" onclick="openArticle(${articles.indexOf(r)})"><img src="${getImg(r)}" alt="${r.title}"><div class="art-card-cat">${r.category}</div><div class="related-card-title">${r.title}</div></div>`).join('')}</div></div>` : ''}
<div class="comments-section">
  <h3>Reader Discussion (${comments.length})</h3>
  <div class="cmt-form">
    <input type="text" id="cmt-name" placeholder="Your name">
    <textarea id="cmt-text" placeholder="Share your thoughts…"></textarea>
    <button onclick="postComment(${idx})">Post Comment</button>
  </div>
  <div id="cmt-list">${comments.map(c => `
    <div class="cmt-item">
      <div class="cmt-header"><div class="cmt-avatar">${c.name[0]}</div><span class="cmt-author">${c.name}</span><span class="cmt-date">${c.date}</span></div>
      <div class="cmt-body">${c.text}</div>
    </div>`).join('')}</div>
</div>
  `;
  const ov = document.getElementById('article-overlay');
  ov.classList.add('open'); ov.scrollTop = 0;
  document.getElementById('reading-toolbar').classList.add('visible');
  document.body.classList.add('panel-open');
    document.body.style.top = `-${window.scrollY}px`;
  ov.addEventListener('scroll', trackArtScroll);
}

function openEditorial(idx) {
  const e = editorials[idx]; if (!e) return;
  const rel = e.relatedId ? articles.find(a => a.id === e.relatedId) : null;
  document.getElementById('art-inner').innerHTML = `
<div class="art-editorial-banner">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
  <span class="aeb-label">${e.type} — The Newsbie</span>
</div>
<div class="art-cat-label" style="color:var(--gold)">${e.type.toUpperCase()}</div>
<h1 class="art-headline">${e.title}</h1>
<p class="art-subtitle">${e.subtitle || ''}</p>
<div class="art-byline">
  <div class="art-avatar" style="background:var(--gold2);color:var(--gold)">${(e.author || 'E')[0]}</div>
  <div class="art-byline-info">
    <div class="art-author">By ${e.author}</div>
    <div class="art-meta">${e.date} · ${e.readTime || calcReadTime(e.content)} · ${e.authorTitle || e.type}</div>
  </div>
  <div class="art-share">
    <button class="share-btn" onclick="shareSocial('copy')">🔗</button>
  </div>
</div>
${e.img ? `<img class="art-hero-img" src="${e.img}" alt="${e.title}"><p class="art-caption">${e.title} — The Newsbie ${e.type}</p>` : ''}
<div class="art-body" id="art-body">${parseContent(e.content)}</div>
${e.authorBio ? `<div class="art-author-bio"><div class="aab-avatar">${(e.author || 'E')[0]}</div><div><div class="aab-name">${e.author}</div><div class="aab-role">${e.authorTitle || e.type}</div><div class="aab-bio">${e.authorBio}</div></div></div>` : ''}
<div class="art-tags">${(e.tags || []).map(t => `<div class="tag-pill">${t}</div>`).join('')}</div>
${rel ? `<div class="related-section"><h3>Related News</h3><div class="related-grid"><div class="related-card" onclick="closeArticle();openArticle(${articles.indexOf(rel)})"><img src="${getImg(rel)}" alt="${rel.title}"><div class="art-card-cat">${rel.category}</div><div class="related-card-title">${rel.title}</div></div></div></div>` : ''}
  `;
  const ov = document.getElementById('article-overlay');
  ov.classList.add('open'); ov.scrollTop = 0;
  document.getElementById('reading-toolbar').classList.add('visible');
  const scrollY = window.scrollY || window.pageYOffset;
  document.body.classList.add('panel-open');
  document.body.style.top = `-${scrollY}px`;
  ov.addEventListener('scroll', trackArtScroll);
}

function openEditorialPage() {
  if (editorials.length > 0) { openEditorial(0); return; }
  const op = articles.findIndex(a => a.category === 'Opinion' || a.category === 'Editorial');
  if (op >= 0) openArticle(op);
}

function closeArticle() {
  document.getElementById('article-overlay').classList.remove('open');
  document.getElementById('reading-toolbar').classList.remove('visible');
  const scrollY = parseInt(document.body.style.top || '0') * -1;
  document.body.classList.remove('panel-open');
  document.body.style.top = '';
  window.scrollTo(0, scrollY);
  stopAutoScroll();
  document.getElementById('article-overlay').removeEventListener('scroll', trackArtScroll);
  document.getElementById('art-progress').style.width = '0';
}

function trackArtScroll() {
  const ov = document.getElementById('article-overlay');
  const pct = (ov.scrollTop / (ov.scrollHeight - ov.clientHeight)) * 100;
  document.getElementById('art-progress').style.width = Math.min(100, pct) + '%';
  document.getElementById('rt-pct').textContent = Math.round(pct) + '% read';
}

/* ══════════════════════════════════════════════════
   READING TOOLBAR
══════════════════════════════════════════════════ */
function toggleAutoScroll() { autoScrolling ? stopAutoScroll() : startAutoScroll() }
function startAutoScroll() {
  autoScrolling = true;
  const btn = document.getElementById('autoscroll-btn');
  btn.classList.add('active'); btn.textContent = '⏸ Pause';
  const ov = document.getElementById('article-overlay');
  autoScrollInterval = setInterval(() => {
    ov.scrollTop += scrollSpeed * .8;
    if (ov.scrollTop >= ov.scrollHeight - ov.clientHeight) stopAutoScroll();
  }, 50);
}
function stopAutoScroll() {
  autoScrolling = false; clearInterval(autoScrollInterval);
  const btn = document.getElementById('autoscroll-btn');
  btn.classList.remove('active'); btn.textContent = '▶ Auto-scroll';
}
function toggleFocusMode() {
  focusMode = !focusMode;
  document.getElementById('article-overlay').classList.toggle('focus-mode', focusMode);
  const b = document.getElementById('focus-btn');
  b.classList.toggle('active', focusMode); b.textContent = focusMode ? '✓ Focus Mode' : 'Focus Mode';
}
function changeFontSize(d) {
  articleFontSize = Math.max(14, Math.min(26, articleFontSize + d));
  const b = document.getElementById('art-body');
  if (b) b.style.fontSize = articleFontSize + 'px';
}

/* ══════════════════════════════════════════════════
   FILTER & SEARCH
══════════════════════════════════════════════════ */
function filterCat(cat) {
  currentFilter = cat;
  document.querySelectorAll('.nav-menu a').forEach(a => {
    a.classList.toggle('active', a.textContent.toLowerCase() === cat.toLowerCase() || (cat === 'all' && a.textContent === 'Home'));
  });
  closeArticle(); closeAdmin();
  renderHome(); window.scrollTo({ top: 0, behavior: 'smooth' });
}
function performSearch(q) {
  if (!q) { renderHome(); return }
  const ql = q.toLowerCase();
  const res = articles.filter(a =>
    a.title?.toLowerCase().includes(ql) || a.author?.toLowerCase().includes(ql) ||
    a.category?.toLowerCase().includes(ql) || (a.tags || []).some(t => t.toLowerCase().includes(ql))
  );
  const grid = document.getElementById('articles-grid');
  document.getElementById('articles-section-label').textContent = `Search: "${q}"`;
  grid.innerHTML = res.length === 0
    ? `<div style="padding:32px;color:var(--ink4);font-family:var(--fs);font-size:13px;grid-column:1/-1;text-align:center">No results for "${q}"</div>`
    : res.map(a => `<div class="art-card" onclick="openArticle(${articles.indexOf(a)})"><img class="art-card-img" src="${getImg(a)}" alt=""><div class="art-card-cat">${a.category}</div><div class="art-card-title">${a.title}</div><div class="art-card-excerpt">${a.excerpt || a.subtitle || ''}</div><div class="art-card-meta"><span class="author">By ${a.author}</span><span>${a.readTime || calcReadTime(a.content)}</span></div></div>`).join('');
}
function clearSearch() {
  document.getElementById('nav-search-input').value = '';
  document.getElementById('articles-section-label').textContent = 'Latest Stories';
  renderHome();
}
function searchByTag(tag) {
  closeArticle();
  document.getElementById('nav-search-input').value = tag;
  performSearch(tag);
  document.querySelector('#main-grid').scrollIntoView({ behavior: 'smooth' });
}

/* ══════════════════════════════════════════════════
   SOCIAL SHARING
══════════════════════════════════════════════════ */
function shareSocial(p) {
  const a = articles[currentArticleIdx];
  const url = encodeURIComponent(window.location.href);
  const t = encodeURIComponent(a?.title || '');
  if (p === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${t}&url=${url}`, '_blank');
  else if (p === 'linkedin') window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  else { navigator.clipboard?.writeText(window.location.href); showToast('Link copied!'); }
}

/* ══════════════════════════════════════════════════
   COMMENTS
══════════════════════════════════════════════════ */
function postComment(idx) {
  const name = document.getElementById('cmt-name').value.trim();
  const text = document.getElementById('cmt-text').value.trim();
  if (!name || !text) { showToast('Please enter your name and comment.'); return }
  if (!articles[idx].comments) articles[idx].comments = [];
  articles[idx].comments.push({ name, text, date: dateStr() });
  save();
  document.getElementById('cmt-name').value = '';
  document.getElementById('cmt-text').value = '';
  const last = articles[idx].comments.at(-1);
  document.getElementById('cmt-list').insertAdjacentHTML('beforeend', `
<div class="cmt-item fade-in">
  <div class="cmt-header"><div class="cmt-avatar">${last.name[0]}</div><span class="cmt-author">${last.name}</span><span class="cmt-date">${last.date}</span></div>
  <div class="cmt-body">${last.text}</div>
</div>`);
  showToast('Comment posted. Thank you!');
}

/* ══════════════════════════════════════════════════
   IMAGE UPLOAD
══════════════════════════════════════════════════ */
function imgFileChange(input) {
  const f = input.files[0]; if (!f) return;
  if (f.size > 5 * 1024 * 1024) { showToast('File too large. Max 5 MB.'); return }
  const r = new FileReader();
  r.onload = e => {
    uploadedImgData = e.target.result;
    document.getElementById('img-preview-img').src = uploadedImgData;
    document.getElementById('img-preview').classList.add('show');
    document.getElementById('img-zone').style.display = 'none';
    document.getElementById('a-img-url').value = '';
    document.getElementById('a-img-url').disabled = true;
  };
  r.readAsDataURL(f);
}
function imgDragOver(e) { e.preventDefault(); e.stopPropagation(); document.getElementById('img-zone').classList.add('drag-over') }
function imgDragLeave(e) { document.getElementById('img-zone').classList.remove('drag-over') }
function imgDrop(e) {
  e.preventDefault(); e.stopPropagation();
  document.getElementById('img-zone').classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith('image/')) {
    const r = new FileReader();
    r.onload = ev => {
      uploadedImgData = ev.target.result;
      document.getElementById('img-preview-img').src = uploadedImgData;
      document.getElementById('img-preview').classList.add('show');
      document.getElementById('img-zone').style.display = 'none';
      document.getElementById('a-img-url').disabled = true;
    };
    r.readAsDataURL(f);
  }
}
function imgUrlInput(v) {
  if (v) {
    uploadedImgData = null;
    document.getElementById('img-preview-img').src = v;
    document.getElementById('img-preview').classList.toggle('show', v.length > 8);
    document.getElementById('img-zone').style.display = 'none';
  } else imgClear();
}
function imgClear() {
  uploadedImgData = null;
  document.getElementById('img-preview-img').src = '';
  document.getElementById('img-preview').classList.remove('show');
  document.getElementById('img-zone').style.display = 'block';
  document.getElementById('img-zone').classList.remove('drag-over');
  document.getElementById('a-img-url').value = '';
  document.getElementById('a-img-url').disabled = false;
  const fi = document.getElementById('img-file'); if (fi) fi.value = '';
}

/* ══════════════════════════════════════════════════
   LOGIN / LOGOUT — Mobile-fixed
══════════════════════════════════════════════════ */
function openAdmin() {
  if (!currentUser) {
    document.getElementById('login-modal').classList.add('open');
    // Defer focus to avoid iOS keyboard issues
    setTimeout(() => {
      const u = document.getElementById('lc-user');
      // Only auto-focus on non-touch devices to avoid scroll jump
      if (!('ontouchstart' in window)) u.focus();
    }, 350);
  } else showAdminPanel();
}
function closeLogin() {
  document.getElementById('login-modal').classList.remove('open');
  document.getElementById('lc-user').value = '';
  document.getElementById('lc-pass').value = '';
  document.getElementById('lc-error').textContent = '';
}
document.getElementById('login-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeLogin(); });


 async function doLogin(){

const username = document.getElementById("lc-user").value;
const password = document.getElementById("lc-pass").value;

const res = await apiRequest("/auth/login","POST",{
  username,
  password
});

if(!res.token){
  showToast("Login failed");
  return;
}

token = res.token;
localStorage.setItem("token", token);

currentUser = { username };

closeLogin();
showAdminPanel();

showToast("Login successful");

}


  // Persist in BOTH sessionStorage AND localStorage so mobile doesn't lose session
  try {
    sessionStorage.setItem('nb_session', JSON.stringify(currentUser));
    localStorage.setItem('nb_session_persist', JSON.stringify(currentUser));
  } catch(e) {}

  closeLogin();
  showAdminPanel();
  updateFabState();
  updateMobileBottomNav();
  showToast(`✓ Signed in as ${currentUser.name}`);
}

function doLogout() {
  currentUser = null;
  try {
    sessionStorage.removeItem('nb_session');
    localStorage.removeItem('nb_session_persist');
  } catch(e) {}
  closeAdmin();
  updateFabState();
  updateMobileBottomNav();
  showToast('Signed out of Newsbie Studio.');
}

function showAdminPanel() {
  applyRoleUI();
  const panel = document.getElementById('admin-panel');
  panel.classList.add('open');
  // On iOS, setting overflow:hidden can cause scroll issues — use a safer approach
  document.body.classList.add('panel-open');
  // Default tab based on role
  if (perm('write')) switchTab('write', document.getElementById('tab-write'));
  else switchTab('manage', document.getElementById('tab-manage'));
  // Scroll panel to top
  panel.scrollTop = 0;
}

function closeAdmin() {
  document.getElementById('admin-panel').classList.remove('open');
  document.body.classList.remove('panel-open');
  cancelWriteEdit();
}

function applyRoleUI() {
  if (!currentUser) return;
  const r = currentUser.role;
  document.getElementById('admin-user-bar').innerHTML = `
<span class="aub-name">${currentUser.name}</span>
<span class="role-badge role-${r}">${r}</span>
<button class="aub-logout" onclick="doLogout()">Sign Out</button>
  `;
  document.getElementById('tab-write').classList.toggle('js-hidden', !perm('write'));
  document.getElementById('tab-users').classList.toggle('js-hidden', !perm('users'));
  document.getElementById('tab-authors').classList.toggle('js-hidden', !(perm('write') || perm('editAny')));
  document.getElementById('featured-group').classList.toggle('js-hidden', !perm('feature'));
  document.getElementById('pending-notice').classList.toggle('js-hidden', r !== 'contributor');
  const pb = document.getElementById('write-pub-btn');
  if (pb) pb.textContent = r === 'contributor' ? '📤 Submit for Review' : '📰 Publish Article';
}

/* ══════════════════════════════════════════════════
   ADMIN TABS
══════════════════════════════════════════════════ */
function switchTab(tab, el) {
  document.querySelectorAll('.atab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  const pane = document.getElementById('pane-' + tab);
  if (pane) pane.classList.add('active');
  if (tab === 'write') populateAuthorSelect();
  if (tab === 'manage') renderManage();
  if (tab === 'sections') renderSections();
  if (tab === 'highlights') renderHighlights();
  if (tab === 'editorial') { renderEditorialAdmin(); syncEditorialLimitUI(); }
  if (tab === 'subscribers') renderSubscribers();
  if (tab === 'users') renderUsers();
  if (tab === 'authors') { renderAuthorsList(); populateAuthorSelect(); }
}

/* ══════════════════════════════════════════════════
   WRITE / EDIT ARTICLE
══════════════════════════════════════════════════ */
async function publishOrSave() {
  if (!perm('write') && !perm('editAny')) { showToast('Permission denied.'); return }
  const title = document.getElementById('a-title').value.trim();
  const authorIdVal = document.getElementById('a-author-id').value;
  const authorManual = (document.getElementById('a-author').value.trim()
    || document.getElementById('a-author-manual').value.trim());
  const authorObj = authorIdVal ? authors.find(au => au.id === parseInt(authorIdVal)) : null;
  const author = authorObj ? authorObj.name : (authorManual || 'The Newsbie');
  const content = document.getElementById('a-content').value.trim();
  const cat = document.getElementById('a-cat').value;
  if (!title || !author || !content) { showToast('Please fill Title, Author, and Content.'); return }
  const img = uploadedImgData || document.getElementById('a-img-url').value.trim();
  const subtitle = document.getElementById('a-subtitle').value.trim();
  const excerpt = document.getElementById('a-excerpt').value.trim();
  const tagsRaw = document.getElementById('a-tags').value.trim();
  const featured = perm('feature') && document.getElementById('a-featured').value === '1';
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
  const now = dateStr();
  }
 async function cancelWriteEdit(){

if(editingArticleId !== null){

const title = document.getElementById("a-title").value;
const subtitle = document.getElementById("a-subtitle").value;
const author = document.getElementById("a-author").value;
const cat = document.getElementById("a-cat").value;
const content = document.getElementById("a-content").value;

await apiRequest("/articles/" + editingArticleId,"PUT",{
  title,
  subtitle,
  author,
  category: cat,
  content
});

await loadArticles();

}

clearWriteForm();

}
  document.getElementById('write-edit-banner').classList.add('js-hidden');
  const pb = document.getElementById('write-pub-btn');
  if (pb) pb.textContent = currentUser?.role === 'contributor' ? '📤 Submit for Review' : '📰 Publish Article';
  clearWriteForm();
}
function clearWriteForm() {
  ['a-title', 'a-subtitle', 'a-author', 'a-author-manual', 'a-content', 'a-excerpt', 'a-tags', 'a-img-url'].forEach(id => { const el = document.getElementById(id); if (el) el.value = '' });
  const af = document.getElementById('a-featured'); if (af) af.value = '0';
  const asel = document.getElementById('a-author-id'); if (asel) asel.value = '';
  document.getElementById('author-preview-card').classList.remove('show');
  imgClear();
}
function editArticle(idx) {
  const a = articles[idx];
  if (!canEdit(a)) { showToast('Permission denied.'); return }
  editingArticleId = a.id;
  document.getElementById('a-title').value = a.title || '';
  document.getElementById('a-cat').value = a.category || 'World';
  document.getElementById('a-subtitle').value = a.subtitle || '';
  document.getElementById('a-author-manual').value = a.author || '';
  document.getElementById('a-tags').value = (a.tags || []).join(', ');
  document.getElementById('a-content').value = a.content || '';
  document.getElementById('a-excerpt').value = a.excerpt || '';
  if (perm('feature')) document.getElementById('a-featured').value = a.featured ? '1' : '0';
  // Author selector
  populateAuthorSelect();
  const asel = document.getElementById('a-author-id');
  if (a.authorId && asel) { asel.value = a.authorId; onAuthorSelect(a.authorId); }
  else { document.getElementById('a-author').value = a.author || ''; document.getElementById('a-author-manual').value = a.author || ''; }
  // Image
  imgClear();
  if (a.img) {
    if (a.img.startsWith('data:')) { uploadedImgData = a.img; document.getElementById('img-preview-img').src = a.img; document.getElementById('img-preview').classList.add('show'); document.getElementById('img-zone').style.display = 'none'; document.getElementById('a-img-url').disabled = true; }
    else { document.getElementById('a-img-url').value = a.img; imgUrlInput(a.img); }
  }
  const banner = document.getElementById('write-edit-banner');
  banner.classList.remove('js-hidden');
  document.getElementById('write-edit-name').textContent = a.title.length > 50 ? a.title.slice(0, 50) + '…' : a.title;
  const pb = document.getElementById('write-pub-btn');
  pb.textContent = '💾 Save Changes';
  switchTab('write', document.getElementById('tab-write'));
  document.getElementById('admin-panel').scrollTop = 0;
}

function ins(type) {
  const ta = document.getElementById('a-content');
  const s = ta.selectionStart, e = ta.selectionEnd;
  const sel = ta.value.substring(s, e);
  const map = { h2: `\n\n## ${sel || 'Section Heading'}\n`, h3: `\n\n### ${sel || 'Subheading'}\n`, bold: `**${sel || 'bold text'}**`, italic: `*${sel || 'italic text'}*`, quote: `\n\n> ${sel || 'Pull quote here'}\n`, para: `\n\n${sel || 'New paragraph…'}\n`, img: `\n\n![Description](https://url)\n`, link: `[${sel || 'link text'}](https://url)` };
  const ins2 = map[type] || sel;
  ta.value = ta.value.substring(0, s) + ins2 + ta.value.substring(e);
  ta.focus(); ta.selectionStart = ta.selectionEnd = s + ins2.length;
}

/* ══════════════════════════════════════════════════
   MANAGE TAB
══════════════════════════════════════════════════ */
function setFilter(f, btn) {
  manageFilter = f;
  document.querySelectorAll('.mf-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderManage();
}
function renderManage() {
  if (!currentUser) return;
  let list = currentUser.role === 'contributor' ? articles.filter(a => a.author === currentUser.name) : articles;
  if (manageFilter !== 'all') list = list.filter(a => (a.status || 'published') === manageFilter);
  document.getElementById('manage-count').textContent = list.length + ' article' + (list.length !== 1 ? 's' : '');
  const el = document.getElementById('manage-list');
  if (!list.length) { el.innerHTML = `<div style="padding:32px;text-align:center;font-family:var(--fs);font-size:13px;color:var(--ink4)">No articles in this view.</div>`; return }
  el.innerHTML = list.map(a => {
    const idx = articles.indexOf(a);
    const st = a.status || 'published';
    const stHtml = `<span class="status-badge status-${st}"><span class="sd"></span><span class="st">${st}</span></span>`;
    const ce = canEdit(a);
    const cd = perm('delete');
    const cf = perm('feature');
    const ca = perm('approve') && st === 'pending';
    return `<div class="art-row">
  <img class="art-row-img" src="${getImg(a)}" alt="">
  <div class="art-row-info">
    <div class="art-row-title">${a.title}</div>
    <div class="art-row-meta">${stHtml}<span>${a.category}</span><span>By ${a.author}</span><span>${a.date}</span>${a.featured ? '<span style="color:var(--gold)">⭐ Featured</span>' : ''}</div>
  </div>
  <div class="art-row-actions">
    ${ca ? `<button class="aar-btn approve" onclick="approveArticle(${idx})">✓ Approve</button>` : ''}
    ${ce ? `<button class="aar-btn edit" onclick="editArticle(${idx})">✏️ Edit</button>` : ''}
    ${cf ? `<button class="aar-btn" onclick="toggleFeatured(${idx})">${a.featured ? 'Unfeature' : 'Feature'}</button>` : ''}
    ${cd ? `<button class="aar-btn" onclick="deleteArticle(${idx})" style="color:var(--accent)">Delete</button>` : ''}
    ${!ce && !cd && !cf && !ca ? '<span style="font-family:var(--fs);font-size:10px;color:var(--ink4)">View only</span>' : ''}
  </div>
</div>`;
  }).join('');
}
function approveArticle(idx) { if (!perm('approve')) return; articles[idx].status = 'published'; save(); renderManage(); renderHome(); showToast('✓ Article approved and published!') }
function toggleFeatured(idx) { if (!perm('feature')) return; articles.forEach(a => a.featured = false); articles[idx].featured = true; save(); renderManage(); renderHome(); showToast('Featured story updated!') }
async function deleteArticle(idx){

const article = articles[idx];

await apiRequest("/articles/"+article._id,"DELETE");

await loadArticles();

} 

/* ══════════════════════════════════════════════════
   SECTIONS TAB
══════════════════════════════════════════════════ */
const SM = { latest: { max: null }, editors: { max: 3 }, trending: { max: 5 } };
function renderSections() {
  const pub = articles.filter(a => (a.status || 'published') === 'published');
  ['latest', 'editors', 'trending'].forEach(key => {
    const el = document.getElementById(`sm-${key}-list`);
    if (!el) return;
    const sel = sectionCfg[key] || [];
    el.innerHTML = pub.length === 0 ? `<div style="padding:14px;font-family:var(--fs);font-size:12px;color:var(--ink4)">No published articles.</div>` :
      pub.map(a => {
        const isSel = sel.includes(a.id);
        return `<div class="sm-art-row ${isSel ? 'selected' : ''}" id="sm-${key}-${a.id}" onclick="toggleSM('${key}',${a.id})">
      <div class="sm-check"></div>
      <img class="sm-thumb" src="${getImg(a)}" alt="">
      <div class="sm-art-title">${a.title}</div>
      <span class="sm-art-cat">${a.category}</span>
    </div>`;
      }).join('');
    updateSMCount(key);
  });
}
function toggleSM(key, id) {
  if (!sectionCfg[key]) sectionCfg[key] = [];
  const arr = sectionCfg[key];
  const idx = arr.indexOf(id);
  const max = SM[key].max;
  if (idx < 0) {
    if (max && arr.length >= max) { showToast(`Max ${max} articles for this section.`); return }
    arr.push(id);
    document.getElementById(`sm-${key}-${id}`)?.classList.add('selected');
  } else {
    arr.splice(idx, 1);
    document.getElementById(`sm-${key}-${id}`)?.classList.remove('selected');
  }
  updateSMCount(key);
}
function updateSMCount(key) {
  const n = (sectionCfg[key] || []).length;
  const max = SM[key].max;
  const el = document.getElementById(`sm-${key}-count`);
  if (el) { el.textContent = n === 0 ? 'Auto' : `${n}${max ? '/' + max : ''} selected`; el.style.background = n > 0 ? 'rgba(181,32,46,.09)' : 'rgba(100,100,100,.1)'; el.style.color = n > 0 ? 'var(--accent)' : 'var(--ink4)'; }
}
function saveSection(key) { save(); renderHome(); showToast(`✓ ${key.charAt(0).toUpperCase() + key.slice(1)} section updated!`) }
function resetAllSections() { sectionCfg = { latest: [], editors: [], trending: [] }; save(); renderSections(); renderHome(); showToast('✓ All sections reset to automatic ordering.') }

/* ══════════════════════════════════════════════════
   HIGHLIGHTS TAB
══════════════════════════════════════════════════ */
function renderHighlights() {
  // Disable All button state
  const disableBtn = document.getElementById('hl-disable-all-btn');
  const anyEnabled = highlights.some(h => h.enabled);
  disableBtn.disabled = !anyEnabled;
  disableBtn.style.opacity = anyEnabled ? '1' : '0.3';
  disableBtn.style.cursor = anyEnabled ? 'pointer' : 'not-allowed';

  const rows = document.getElementById('hl-rows');
  if (!highlights.length) {
    rows.innerHTML = `<div class="hl-empty">No highlights yet. Add a custom item or pull from a published article.</div>`;
    document.getElementById('hl-preview-box').classList.add('js-hidden');
    return;
  }
  rows.innerHTML = highlights.map((h, i) => {
    const dis = !h.enabled;
    return `<div class="hl-row ${dis ? 'disabled-row' : ''}" id="hlr-${h.id}" data-idx="${i}"
    draggable="${h.enabled}"
    ondragstart="${h.enabled ? `hlDragStart(event,${i})` : 'false'}"
    ondragover="hlDragOver(event,${i})"
    ondragleave="hlDragLeave(event)"
    ondrop="hlDrop(event,${i})"
    ondragend="hlDragEnd()">
  <div class="hl-drag ${dis ? 'disabled' : (h.enabled ? '' : 'disabled')}" title="${h.enabled ? 'Drag to reorder' : 'Enable to drag'}">⠿</div>
  <button class="hl-toggle ${h.enabled ? 'on' : ''}" onclick="hlToggle(${i})" title="${h.enabled ? 'Disable' : 'Enable'}"></button>
  <div class="hl-text-wrap">
    <div class="hl-row-text">${h.text}</div>
  </div>
  <span class="hl-type-badge ${h.type === 'article' ? 'article' : 'custom'}">${h.type === 'article' ? 'Article' : 'Custom'}</span>
  <button class="hl-btn ${dis ? 'disabled' : ''}" onclick="${dis ? '' : 'hlEdit(' + i + ')'}" title="Edit"  ${dis ? 'disabled' : ''}>✏</button>
  <button class="hl-btn ${dis ? 'disabled' : ''}" onclick="${dis ? '' : 'hlDelete(' + i + ')'}" title="Delete" ${dis ? 'disabled' : ''}>✕</button>
</div>`;
  }).join('');

  // Preview
  const active = highlights.filter(h => h.enabled);
  const prev = document.getElementById('hl-preview-box');
  if (active.length) {
    prev.classList.remove('js-hidden');
    document.getElementById('hl-preview-text').textContent = active.map(h => '● ' + h.text).join('  ·  ');
  } else prev.classList.add('js-hidden');
}
// Drag-and-drop for highlights (only enabled rows)
function hlDragStart(e, idx) { if (!highlights[idx].enabled) return false; hlDragIdx = idx; e.currentTarget.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move' }
function hlDragOver(e, idx) { e.preventDefault(); if (hlDragIdx === null || idx === hlDragIdx) return; document.querySelectorAll('.hl-row').forEach(r => r.classList.remove('drop-before', 'drop-after')); e.currentTarget.classList.add(idx < hlDragIdx ? 'drop-before' : 'drop-after') }
function hlDragLeave(e) { e.currentTarget.classList.remove('drop-before', 'drop-after') }
function hlDrop(e, targetIdx) {
  e.preventDefault();
  document.querySelectorAll('.hl-row').forEach(r => r.classList.remove('drop-before', 'drop-after', 'dragging'));
  if (hlDragIdx === null || hlDragIdx === targetIdx) return;
  const moved = highlights.splice(hlDragIdx, 1)[0];
  highlights.splice(targetIdx, 0, moved);
  hlDragIdx = null;
  save(); renderHighlights(); renderTicker();
}
function hlDragEnd() { document.querySelectorAll('.hl-row').forEach(r => r.classList.remove('dragging', 'drop-before', 'drop-after')); hlDragIdx = null }
function hlToggle(idx) { highlights[idx].enabled = !highlights[idx].enabled; save(); renderHighlights(); renderTicker() }
function hlAdd() {
  const inp = document.getElementById('hl-new-text');
  const text = inp.value.trim(); if (!text) return;
  highlights.push({ id: Date.now(), text, enabled: true, type: 'custom' });
  save(); inp.value = ''; renderHighlights(); renderTicker();
  showToast('✓ Highlight added!');
}
function hlEdit(idx) {
  const h = highlights[idx];
  const newText = prompt('Edit highlight text:', h.text);
  if (newText && newText.trim()) { highlights[idx].text = newText.trim(); save(); renderHighlights(); renderTicker(); }
}
function hlDelete(idx) { highlights.splice(idx, 1); save(); renderHighlights(); renderTicker(); showToast('Highlight removed.') }
function hlEnableAll() { highlights.forEach(h => h.enabled = true); save(); renderHighlights(); renderTicker() }
function hlDisableAll() { if (!highlights.some(h => h.enabled)) return; highlights.forEach(h => h.enabled = false); save(); renderHighlights(); renderTicker() }
function hlClearAll() { if (!confirm('Remove all highlights?')) return; highlights = []; save(); renderHighlights(); renderTicker(); showToast('All highlights cleared.') }
function hlShowArticlePicker() {
  const p = document.getElementById('hl-picker');
  p.style.display = 'block';
  const pub = articles.filter(a => (a.status || 'published') === 'published');
  document.getElementById('hap-list').innerHTML = pub.map(a => `
<div class="hap-item" onclick="hlAddFromArticle('${a.title.replace(/'/g, "\\'").replace(/"/g, '&quot;')}')">
  <div class="hap-cat">${a.category}</div>${a.title}
</div>`).join('');
}
function hlHidePicker() { document.getElementById('hl-picker').style.display = 'none' }
function hlAddFromArticle(title) {
  highlights.push({ id: Date.now(), text: 'LATEST: ' + title, enabled: true, type: 'article' });
  save(); hlHidePicker(); renderHighlights(); renderTicker();
  showToast('✓ Article headline added to ticker!');
}

/* ══════════════════════════════════════════════════
   EDITORIAL TAB
══════════════════════════════════════════════════ */
function renderEditorialAdmin() {
  renderEditorialOrderList();
}
function renderEditorialOrderList() {
  const el = document.getElementById('ed-order-list');
  if (!editorials.length) { el.innerHTML = `<div class="hl-empty">No editorials yet. Use the form above to create one.</div>`; return }
  const limit = editorialCfg.limit > 0 ? editorialCfg.limit : editorials.length;
  el.innerHTML = editorials.map((e, i) => {
    const isHidden = (e.visible === false);
    const onHomepage = !isHidden && i < limit;
    return `<div class="ed-order-row ${isHidden ? 'ed-row-hidden' : ''}" id="edrow-${e.id}" data-idx="${i}"
    draggable="true"
    ondragstart="edDragStart(event,${i})"
    ondragover="edDragOver(event,${i})"
    ondragleave="edDragLeave(event)"
    ondrop="edDrop(event,${i})"
    ondragend="edDragEnd()">
  <div class="ed-drag" title="Drag to set priority">⠿</div>
  <div class="ed-pos-num">${String(i + 1).padStart(2, '0')}</div>
  <img class="ed-thumb" src="${getEdImg(e, i)}" alt="">
  <div class="ed-info">
    <div class="ed-info-title">${e.title}</div>
    <div class="ed-info-meta">
      <span class="role-badge role-editor" style="font-size:8px;padding:1px 5px">${e.type}</span>
      <span>${e.author}</span>
      <span>· ${e.date}</span>
      ${onHomepage ? '<span class="ed-homepage-badge">★ Homepage</span>' : ''}
      ${isHidden ? '<span style="font-family:var(--fs);font-size:8.5px;color:var(--ink4);border:1px solid var(--rule);padding:1px 6px">Hidden</span>' : ''}
    </div>
  </div>
  <button class="ed-vis-btn ${isHidden ? 'hid' : 'vis'}" onclick="edToggleVisibility(${i})">${isHidden ? '👁 Show' : '👁 Hide'}</button>
  <button class="ed-pick-toggle ${e.isPick ? 'on' : ''}" onclick="edTogglePick(${i})">${e.isPick ? '★ Pick' : 'Mark Pick'}</button>
  <div class="art-row-actions">
    <button class="aar-btn edit" onclick="editEditorial(${i})">✏️ Edit</button>
    <button class="aar-btn" onclick="openEditorial(${i})">Read</button>
    <button class="aar-btn" onclick="deleteEditorial(${i})" style="color:var(--accent)">Delete</button>
  </div>
</div>`;
  }).join('');
}
function edDragStart(e, idx) { edDragIdx = idx; e.currentTarget.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move' }
function edDragOver(e, idx) { e.preventDefault(); if (edDragIdx === null || idx === edDragIdx) return; document.querySelectorAll('.ed-order-row').forEach(r => r.classList.remove('drop-before', 'drop-after')); e.currentTarget.classList.add(idx < edDragIdx ? 'drop-before' : 'drop-after') }
function edDragLeave(e) { e.currentTarget.classList.remove('drop-before', 'drop-after') }
function edDrop(e, targetIdx) {
  e.preventDefault();
  document.querySelectorAll('.ed-order-row').forEach(r => r.classList.remove('drop-before', 'drop-after', 'dragging'));
  if (edDragIdx === null || edDragIdx === targetIdx) return;
  const moved = editorials.splice(edDragIdx, 1)[0];
  editorials.splice(targetIdx, 0, moved);
  edDragIdx = null;
  save(); renderEditorialOrderList(); renderEditorialStrip();
  showToast('✓ Editorial order updated!');
}
function edDragEnd() { document.querySelectorAll('.ed-order-row').forEach(r => r.classList.remove('dragging', 'drop-before', 'drop-after')); edDragIdx = null }
function edTogglePick(idx) {
  editorials.forEach(e => e.isPick = false);
  editorials[idx].isPick = !editorials[idx].isPick;
  save(); renderEditorialOrderList(); renderEditorialStrip();
  showToast(editorials[idx].isPick ? '★ Marked as Editor\'s Pick!' : 'Pick removed.');
}
function editEditorial(idx) {
  const e = editorials[idx];
  editingEditorialId = e.id;
  document.getElementById('ed-title').value = e.title || '';
  document.getElementById('ed-type').value = e.type || 'Editorial';
  document.getElementById('ed-subtitle').value = e.subtitle || '';
  document.getElementById('ed-author').value = e.author || '';
  document.getElementById('ed-author-title').value = e.authorTitle || '';
  document.getElementById('ed-author-bio').value = e.authorBio || '';
  document.getElementById('ed-img').value = e.img || '';
  document.getElementById('ed-tags').value = (e.tags || []).join(', ');
  document.getElementById('ed-content').value = e.content || '';
  if (e.relatedId) { const ra = articles.find(a => a.id === e.relatedId); if (ra) document.getElementById('ed-related').value = ra.title; }
  const banner = document.getElementById('ed-edit-banner');
  banner.classList.remove('js-hidden');
  document.getElementById('ed-edit-name').textContent = e.title.length > 50 ? e.title.slice(0, 50) + '…' : e.title;
  const pb = document.getElementById('ed-pub-btn');
  pb.textContent = '💾 Save Editorial';
  pb.style.background = 'linear-gradient(135deg,#1a4a6b,#2878a8)';
  document.getElementById('admin-panel').scrollTop = 0;
}
function cancelEdEdit() {
  editingEditorialId = null;
  document.getElementById('ed-edit-banner').classList.add('js-hidden');
  const pb = document.getElementById('ed-pub-btn');
  pb.textContent = '📰 Publish Editorial';
  pb.style.background = '';
  clearEdForm();
}
function clearEdForm() {
  ['ed-title', 'ed-subtitle', 'ed-author', 'ed-author-title', 'ed-author-bio', 'ed-img', 'ed-tags', 'ed-content', 'ed-related'].forEach(id => { const el = document.getElementById(id); if (el) el.value = '' });
  document.getElementById('ed-type').value = 'Editorial';
  document.getElementById('ed-related-suggestions').innerHTML = '';
}
function publishOrSaveEditorial() {
  const title = document.getElementById('ed-title').value.trim();
  const author = document.getElementById('ed-author').value.trim();
  const content = document.getElementById('ed-content').value.trim();
  if (!title || !author || !content) { showToast('Please fill Title, Author, and Content.'); return }
  const type = document.getElementById('ed-type').value;
  const subtitle = document.getElementById('ed-subtitle').value.trim();
  const authorTitle = document.getElementById('ed-author-title').value.trim();
  const authorBio = document.getElementById('ed-author-bio').value.trim();
  const img = document.getElementById('ed-img').value.trim();
  const tagsRaw = document.getElementById('ed-tags').value.trim();
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
  const relTitle = document.getElementById('ed-related').value.trim();
  const rel = relTitle ? articles.find(a => a.title.toLowerCase().includes(relTitle.toLowerCase())) : null;
  const now = dateStr();

  if (editingEditorialId !== null) {
    const idx = editorials.findIndex(e => e.id === editingEditorialId);
    if (idx < 0) { showToast('Editorial not found.'); return }
    Object.assign(editorials[idx], { type, title, subtitle, author, authorTitle, authorBio, img, tags, content, relatedId: rel ? rel.id : null, readTime: calcReadTime(content) });
    save(); renderEditorialOrderList(); renderEditorialStrip();
    cancelEdEdit();
    showToast('✓ Editorial updated!');
  } else {
    editorials.unshift({ id: Date.now(), type, title, subtitle, author, authorTitle, authorBio, img, tags, content, date: now, relatedId: rel ? rel.id : null, readTime: calcReadTime(content), isPick: false });
    save(); renderEditorialOrderList(); renderEditorialStrip();
    clearEdForm();
    notifySubscribers(title, type);
    showToast('📰 Editorial published!');
  }
}
function deleteEditorial(idx) { if (!confirm('Delete this editorial?')) return; editorials.splice(idx, 1); save(); renderEditorialOrderList(); renderEditorialStrip(); showToast('Editorial deleted.') }
function edSuggestRelated(q) {
  const box = document.getElementById('ed-related-suggestions');
  if (!q || q.length < 3) { box.innerHTML = ''; return }
  const matches = articles.filter(a => a.title.toLowerCase().includes(q.toLowerCase())).slice(0, 4);
  box.style.cssText = 'background:var(--paper);border:1px solid var(--rule);margin-top:4px';
  box.innerHTML = matches.map(a => `<div style="padding:7px 11px;cursor:pointer;font-family:var(--fs);font-size:12px;border-bottom:1px solid var(--rule2)" onmouseover="this.style.background='var(--paper2)'" onmouseout="this.style.background=''" onclick="document.getElementById('ed-related').value='${a.title.replace(/'/g, "\\'").replace(/"/g, '&quot;')}';document.getElementById('ed-related-suggestions').innerHTML=''">${a.title}</div>`).join('');
}
function edIns(type) {
  const ta = document.getElementById('ed-content');
  const s = ta.selectionStart, e = ta.selectionEnd;
  const sel = ta.value.substring(s, e);
  const map = { h2: `\n\n## ${sel || 'Section Heading'}\n`, h3: `\n\n### ${sel || 'Subheading'}\n`, bold: `**${sel || 'bold text'}**`, italic: `*${sel || 'italic text'}*`, quote: `\n\n> ${sel || 'Pull quote here'}\n`, para: `\n\n${sel || 'New paragraph…'}\n` };
  const ins2 = map[type] || sel;
  ta.value = ta.value.substring(0, s) + ins2 + ta.value.substring(e);
  ta.focus(); ta.selectionStart = ta.selectionEnd = s + ins2.length;
}

/* ══════════════════════════════════════════════════
   SUBSCRIBERS TAB
══════════════════════════════════════════════════ */
let ejsInitialized = false;
function initEjs() {
  if (ejsCfg.key && !ejsInitialized) { try { emailjs.init({ publicKey: ejsCfg.key }); ejsInitialized = true } catch (e) { } }
}
function saveEjsConfig() {
  ejsCfg = { key: document.getElementById('ejs-key').value.trim(), svc: document.getElementById('ejs-svc').value.trim(), tmpl: document.getElementById('ejs-tmpl').value.trim() };
  localStorage.setItem('nb_ejs', JSON.stringify(ejsCfg));
  ejsInitialized = false; initEjs();
  showToast('✓ Email config saved!');
}
function getSubs() { return JSON.parse(localStorage.getItem('nb_subs') || '[]') }
function saveSubs(s) { localStorage.setItem('nb_subs', JSON.stringify(s)) }
function renderSubscribers() {
  const subs = getSubs();
  if (ejsCfg.key) document.getElementById('ejs-key').value = ejsCfg.key || '';
  if (ejsCfg.svc) document.getElementById('ejs-svc').value = ejsCfg.svc || '';
  if (ejsCfg.tmpl) document.getElementById('ejs-tmpl').value = ejsCfg.tmpl || '';
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  document.getElementById('sub-stats').innerHTML = `
<div class="sub-stat"><div class="sub-stat-num">${subs.length}</div><div class="sub-stat-lbl">Total Subscribers</div></div>
<div class="sub-stat"><div class="sub-stat-num">${subs.filter(s => new Date(s.date).getTime() > weekAgo).length}</div><div class="sub-stat-lbl">New This Week</div></div>
<div class="sub-stat"><div class="sub-stat-num">${ejsCfg.key ? '✓' : '—'}</div><div class="sub-stat-lbl">Email Service</div></div>
  `;
  const listEl = document.getElementById('sub-list');
  listEl.innerHTML = subs.length === 0
    ? `<div class="sub-row" style="justify-content:center;color:var(--ink4);font-style:italic">No subscribers yet.</div>`
    : [...subs].reverse().map(s => `<div class="sub-row"><div class="sub-avatar">${(s.email || '?')[0].toUpperCase()}</div><div class="sub-email">${s.email}</div><div class="sub-date">${s.date || '—'}</div><button class="sub-del" onclick="removeSubscriber('${s.email}')">✕</button></div>`).join('');
}
function removeSubscriber(email) { if (!confirm(`Remove ${email}?`)) return; saveSubs(getSubs().filter(s => s.email !== email)); renderSubscribers(); showToast('Subscriber removed.') }
function clearAllSubs() { if (!confirm('Remove ALL subscribers?')) return; saveSubs([]); renderSubscribers(); showToast('All subscribers cleared.') }
function sendBroadcast() {
  const subject = document.getElementById('bc-subject').value.trim();
  const body = document.getElementById('bc-body').value.trim();
  if (!subject || !body) { showToast('Please fill subject and message.'); return }
  const subs = getSubs();
  if (!subs.length) { showToast('No subscribers.'); return }
  initEjs();
  if (ejsCfg.key && ejsCfg.svc && ejsCfg.tmpl) {
    let sent = 0;
    Promise.all(subs.map(s => emailjs.send(ejsCfg.svc, ejsCfg.tmpl, { to_email: s.email, to_name: s.email.split('@')[0], subject, message: body + '\n\n— The Newsbie Editorial Team' }).then(() => sent++).catch(() => { }))).then(() => {
      showToast(`✓ Broadcast sent to ${sent} subscriber${sent !== 1 ? 's' : ''}!`);
      document.getElementById('bc-subject').value = ''; document.getElementById('bc-body').value = '';
    });
  } else {
    const all = subs.map(s => s.email).join(',');
    window.location.href = `mailto:${all}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + '\n\n— The Newsbie Editorial Team')}`;
    showToast(`✓ Opening mail client for ${subs.length} recipients.`);
  }
}
function notifySubscribers(title, type) {
  const subs = getSubs();
  if (!subs.length || !ejsCfg.key || !ejsCfg.svc || !ejsCfg.tmpl) return;
  initEjs();
  subs.forEach(s => {
    emailjs.send(ejsCfg.svc, ejsCfg.tmpl, { to_email: s.email, to_name: s.email.split('@')[0], subject: `New ${type}: ${title}`, message: `A new ${type.toLowerCase()} has been published on The Newsbie:\n\n"${title}"\n\n— The Newsbie Editorial Team` }).catch(() => { });
  });
}

/* ══════════════════════════════════════════════════
   NEWSLETTER SUBSCRIPTION
══════════════════════════════════════════════════ */
function subscribeNewsletter() {
  const email = document.getElementById('nl-email').value.trim();
  if (!email || !email.includes('@')) { showToast('Please enter a valid email address.'); return }
  const subs = getSubs();
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  if (!subs.find(s => s.email === email)) { subs.push({ email, date: now }); saveSubs(subs); }
  initEjs();
  const welcomeMsg = `Hi ${email.split('@')[0]},\n\nWelcome to The Daily Newsbie! You'll now receive breaking news, editorial insights, and in-depth analysis directly in your inbox.\n\n— The Newsbie Editorial Team`;
  const doWelcome = () => {
    if (ejsCfg.key && ejsCfg.svc && ejsCfg.tmpl) {
      return emailjs.send(ejsCfg.svc, ejsCfg.tmpl, { to_email: email, to_name: email.split('@')[0], subject: 'Welcome to The Daily Newsbie!', message: welcomeMsg });
    }
    window.location.href = `mailto:${email}?subject=${encodeURIComponent('Welcome to The Daily Newsbie!')}&body=${encodeURIComponent(welcomeMsg)}`;
    return Promise.resolve();
  };
  doWelcome().finally(() => {
    document.getElementById('nl-form-wrap').style.display = 'none';
    document.getElementById('nl-success').style.display = 'block';
    showToast('✓ Subscribed! Welcome to The Daily Newsbie.');
  });
}

/* ══════════════════════════════════════════════════
   USERS
══════════════════════════════════════════════════ */
const RPERM = { admin: 'Write · Edit all · Publish · Delete · Users', editor: 'Write · Edit all · Publish · Approve', contributor: 'Write · Edit own · Submit for review', viewer: 'View list only' };
function renderUsers() {
  const tbody = document.getElementById('users-tbody');
  tbody.innerHTML = users.map((u, i) => `
<tr>
  <td><strong>${u.name}</strong>${u.id === currentUser?.id ? ' <span style="font-size:10px;color:var(--gold)">(you)</span>' : ''}</td>
  <td style="font-family:var(--fs);font-size:12px;color:var(--ink3)">${u.username}</td>
  <td>${u.id === currentUser?.id ? `<span class="role-badge role-${u.role}">${u.role}</span>` : `<select class="role-select" onchange="changeRole(${i},this.value)">${['admin', 'editor', 'contributor', 'viewer'].map(r => `<option value="${r}"${u.role === r ? ' selected' : ''}>${r}</option>`).join('')}</select>`}</td>
  <td style="font-family:var(--fs);font-size:11px;color:var(--ink3)">${RPERM[u.role]}</td>
  <td>${u.id !== currentUser?.id ? `<button class="aar-btn" onclick="removeUser(${i})" style="color:var(--accent)">Remove</button>` : '<span style="font-size:10px;color:var(--ink4)">Active session</span>'}</td>
</tr>`).join('');
}
function changeRole(idx, role) { if (!perm('users')) return; users[idx].role = role; save(); renderUsers(); showToast(`Role updated to ${role}`) }
function removeUser(idx) { if (!perm('users')) return; if (!confirm(`Remove ${users[idx].name}?`)) return; users.splice(idx, 1); save(); renderUsers(); showToast('User removed.') }
function toggleAddUser() {
  const form = document.getElementById('add-user-form');
  const isShowing = form.classList.contains('js-hidden');
  form.classList.toggle('js-hidden');
  if (isShowing) {
    ['nu-name', 'nu-user', 'nu-pass'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    const roleEl = document.getElementById('nu-role');
    if (roleEl) roleEl.value = 'viewer';
    setTimeout(() => form.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }
}
function addUser() {
  const name = document.getElementById('nu-name').value.trim();
  const username = document.getElementById('nu-user').value.trim();
  const password = document.getElementById('nu-pass').value.trim();
  const role = document.getElementById('nu-role').value;
  const errEl = document.getElementById('user-form-error');
  const clearErr = () => { if(errEl) errEl.textContent = ''; };
  const showErr = (msg) => { if(errEl) { errEl.textContent = msg; errEl.scrollIntoView({behavior:'smooth',block:'nearest'}); } showToast(msg); };
  clearErr();
  if (!name) { showErr('⚠ Full name is required.'); document.getElementById('nu-name')?.focus(); return; }
  if (!username) { showErr('⚠ Username is required.'); document.getElementById('nu-user')?.focus(); return; }
  if (!password) { showErr('⚠ Password is required.'); document.getElementById('nu-pass')?.focus(); return; }
  if (users.find(u => u.username === username)) { showErr('⚠ Username already exists. Choose another.'); document.getElementById('nu-user')?.focus(); return; }
  users.push({ id: Date.now(), name, username, password, role });
  const userErrEl = document.getElementById('user-form-error'); if(userErrEl) userErrEl.textContent = '';
  save(); toggleAddUser();
  ['nu-name', 'nu-user', 'nu-pass'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const roleReset = document.getElementById('nu-role'); if (roleReset) roleReset.value = 'viewer';
  renderUsers(); showToast(`✓ ${name} added as ${role}`);
}

/* ══════════════════════════════════════════════════
   SCROLL PROGRESS
══════════════════════════════════════════════════ */
// Scroll progress listener registered below with null-check

/* ══════════════════════════════════════════════════
   GLOBAL CLOSE
══════════════════════════════════════════════════ */
// closeAll() is defined at the bottom of this file with the complete implementation

// Escape key listener is registered once at the bottom of this file

/* ══════════════════════════════════════════════════
   AUTHOR PROFILE HELPERS
══════════════════════════════════════════════════ */
function buildAvatarHtml(authorObj, fallbackName) {
  if (authorObj && authorObj.avatar) {
    return `<img src="${authorObj.avatar}" alt="${authorObj.name}" style="width:42px;height:42px;border-radius:50%;object-fit:cover">`;
  }
  return (fallbackName || 'A')[0].toUpperCase();
}

function buildAuthorCard(au) {
  if (!au) return '';
  const soc = au.social || {};
  const socLinks = [
    soc.tw ? `<a class="ap-social-link tw" href="https://twitter.com/${soc.tw}" target="_blank" rel="noopener">
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L2.25 2.25h6.773l4.254 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  X / Twitter</a>`: ''
    , soc.li ? `<a class="ap-social-link li" href="https://linkedin.com/in/${soc.li}" target="_blank" rel="noopener">
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  LinkedIn</a>`: ''
    , soc.ig ? `<a class="ap-social-link ig" href="https://instagram.com/${soc.ig}" target="_blank" rel="noopener">
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
  Instagram</a>`: ''
    , soc.fb ? `<a class="ap-social-link fb" href="https://facebook.com/${soc.fb}" target="_blank" rel="noopener">
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  Facebook</a>`: ''
    , soc.web ? `<a class="ap-social-link web" href="${soc.web}" target="_blank" rel="noopener">
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  Website</a>`: ''
  ].filter(Boolean);

  const avatarHtml = au.avatar
    ? `<div class="ap-avatar"><img src="${au.avatar}" alt="${au.name}" onerror="this.parentElement.textContent='${au.name[0]}'"></div>`
    : `<div class="ap-avatar">${au.name[0]}</div>`;

  return `<div class="author-profile-card">
${avatarHtml}
<div class="ap-info">
  <div class="ap-label">About the Author</div>
  <div class="ap-name">${au.name}</div>
  <div class="ap-role">${au.role || ''}</div>
  ${au.bio ? `<div class="ap-bio">${au.bio}</div>` : ''}
  ${socLinks.length ? `<div class="ap-socials">${socLinks.join('')}</div>` : ''}
</div>
  </div>`;
}

/* ══════════════════════════════════════════════════
   AUTHORS TAB
══════════════════════════════════════════════════ */
let editingAuthorId = null;

function populateAuthorSelect() {
  const sel = document.getElementById('a-author-id');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Select author —</option>' +
    authors.map(au => `<option value="${au.id}">${au.name}${au.role ? ' — ' + au.role : ''}</option>`).join('');
}

function onAuthorSelect(val) {
  const card = document.getElementById('author-preview-card');
  const manualInput = document.getElementById('a-author-manual');
  if (!val) { card.classList.remove('show'); manualInput.value = ''; return; }
  const au = authors.find(a => a.id === parseInt(val));
  if (!au) { card.classList.remove('show'); return; }
  // Fill avatar
  const avEl = document.getElementById('apc-avatar');
  if (au.avatar) { avEl.innerHTML = `<img src="${au.avatar}" alt="${au.name}" onerror="this.parentElement.textContent='${au.name[0]}'">`; } else { avEl.textContent = au.name[0]; }
  document.getElementById('apc-name').textContent = au.name;
  document.getElementById('apc-role').textContent = au.role || '';
  card.classList.add('show');
  manualInput.value = au.name; // keep in sync for save
  const primaryInput = document.getElementById('a-author');
  if (primaryInput) primaryInput.value = au.name;
}

function showAuthorForm(idx) {
  const box = document.getElementById('author-form-box');
  box.classList.remove('js-hidden');
  document.getElementById('cancel-author-form-btn').classList.remove('js-hidden');
  if (idx !== undefined) {
    // edit mode
    editingAuthorId = authors[idx].id;
    const au = authors[idx];
    document.getElementById('au-name').value = au.name || '';
    document.getElementById('au-role').value = au.role || '';
    document.getElementById('au-bio').value = au.bio || '';
    document.getElementById('au-avatar').value = au.avatar || '';
    previewAuthorAvatar(au.avatar || '');
    document.getElementById('au-tw').value = (au.social && au.social.tw) || '';
    document.getElementById('au-li').value = (au.social && au.social.li) || '';
    document.getElementById('au-ig').value = (au.social && au.social.ig) || '';
    document.getElementById('au-fb').value = (au.social && au.social.fb) || '';
    document.getElementById('au-web').value = (au.social && au.social.web) || '';
    document.getElementById('au-save-btn').textContent = '💾 Save Changes';
  } else {
    editingAuthorId = null;
    ['au-name','au-role','au-bio','au-avatar','au-tw','au-li','au-ig','au-fb','au-web'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    const prevImg = document.getElementById('au-avatar-preview'); if (prevImg) { prevImg.src=''; prevImg.style.display='none'; }
    const saveBtn = document.getElementById('au-save-btn'); if (saveBtn) saveBtn.textContent = '✓ Save Author';
    document.getElementById('au-avatar-preview').classList.remove('show');
    document.getElementById('au-save-btn').textContent = '✓ Save Author';
  }
  box.scrollIntoView({ behavior: 'smooth' });
}

function hideAuthorForm() {
  document.getElementById('author-form-box').classList.add('js-hidden');
  document.getElementById('cancel-author-form-btn').classList.add('js-hidden');
  editingAuthorId = null;
}

function previewAuthorAvatar(url) {
  const img = document.getElementById('au-avatar-preview');
  if (!img) return;
  if (url && url.startsWith('http')) { img.src = url; img.classList.add('show'); img.onerror = () => img.classList.remove('show'); }
  else { img.classList.remove('show'); }
}

function saveAuthor() {
  const name = document.getElementById('au-name').value.trim();
  const authErrEl = document.getElementById('author-form-error');
  const clearAuthErr = () => { if(authErrEl) authErrEl.textContent = ''; };
  const showAuthErr = (msg) => { if(authErrEl) { authErrEl.textContent = msg; authErrEl.scrollIntoView({behavior:'smooth',block:'nearest'}); } showToast(msg); };
  clearAuthErr();
  if (!name) { showAuthErr('⚠ Author name is required.'); document.getElementById('au-name')?.focus(); return; }
  const au = {
    id: editingAuthorId || Date.now(),
    name,
    role: document.getElementById('au-role').value.trim(),
    bio: document.getElementById('au-bio').value.trim(),
    avatar: document.getElementById('au-avatar').value.trim(),
    social: {
      tw: document.getElementById('au-tw').value.trim(),
      li: document.getElementById('au-li').value.trim(),
      ig: document.getElementById('au-ig').value.trim(),
      fb: document.getElementById('au-fb').value.trim(),
      web: document.getElementById('au-web').value.trim(),
    }
  };
  if (editingAuthorId) {
    const idx = authors.findIndex(a => a.id === editingAuthorId);
    if (idx >= 0) authors[idx] = au;
  } else {
    authors.push(au);
  }
  save();
  hideAuthorForm();
  renderAuthorsList();
  populateAuthorSelect();
  showToast(editingAuthorId ? '✓ Author updated!' : '✓ Author added!');
}

function deleteAuthor(idx) {
  if (!confirm(`Remove author "${authors[idx].name}"? Articles by this author will keep their name.`)) return;
  authors.splice(idx, 1);
  save();
  renderAuthorsList();
  populateAuthorSelect();
  showToast('Author removed.');
}

function renderAuthorsList() {
  const el = document.getElementById('authors-list');
  if (!el) return;
  if (!authors.length) {
    el.innerHTML = `<div class="hl-empty">No authors yet. Add your first author above.</div>`;
    return;
  }
  el.innerHTML = authors.map((au, i) => {
    const soc = au.social || {};
    const socPills = [
      soc.tw ? `<span class="aar-soc">X</span>` : '',
      soc.li ? `<span class="aar-soc">LinkedIn</span>` : '',
      soc.ig ? `<span class="aar-soc">Instagram</span>` : '',
      soc.fb ? `<span class="aar-soc">Facebook</span>` : '',
      soc.web ? `<span class="aar-soc">Website</span>` : '',
    ].filter(Boolean).join('');
    const avHtml = au.avatar
      ? `<img src="${au.avatar}" alt="${au.name}" onerror="this.style.display='none'">`
      : au.name[0];
    return `<div class="author-admin-row">
  <div class="aar-avt">${avHtml}</div>
  <div class="aar-info">
    <div class="aar-name">${au.name}</div>
    <div class="aar-role">${au.role || '—'}</div>
    ${au.bio ? `<div class="aar-bio">${au.bio}</div>` : ''}
    ${socPills ? `<div class="aar-socials">${socPills}</div>` : ''}
  </div>
  <div class="art-row-actions">
    <button class="aar-btn edit" onclick="showAuthorForm(${i})">✏️ Edit</button>
    <button class="aar-btn" onclick="deleteAuthor(${i})" style="color:var(--accent)">Remove</button>
  </div>
</div>`;
  }).join('');
}

/* ══════════════════════════════════════════════════
   EDITORIAL VISIBILITY & LIMIT
══════════════════════════════════════════════════ */
function edToggleVisibility(idx) {
  const wasHidden = editorials[idx].visible === false;
  editorials[idx].visible = wasHidden ? true : false;
  save();
  renderEditorialOrderList();
  renderEditorialStrip();
  showToast(wasHidden ? 'Editorial now showing on homepage.' : 'Editorial hidden from homepage.');
}

function saveEditorialLimit(val) {
  editorialCfg.limit = parseInt(val);
  save();
  syncEditorialLimitUI();
  renderEditorialStrip();
  renderEditorialOrderList();
  showToast(`✓ Homepage editorial limit set to ${val === '0' ? 'all' : val}.`);
}

function syncEditorialLimitUI() {
  const sel = document.getElementById('ed-limit-select');
  if (sel) sel.value = String(editorialCfg.limit);
  const disp = document.getElementById('ed-limit-display');
  if (disp) disp.textContent = editorialCfg.limit === 0 ? 'all' : editorialCfg.limit;
}

/* ══════════════════════════════════════════════════
   EXPORT SUBSCRIBERS
══════════════════════════════════════════════════ */
function exportSubscribers() {
  const subs = getSubs();
  if (!subs.length) { showToast('No subscribers to export.'); return; }
  const csv = 'Email,Date Subscribed\n' + subs.map(s => `"${s.email}","${s.date || ''}"`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'newsbie-subscribers.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast(`✓ Exported ${subs.length} subscribers as CSV.`);
}

/* ══════════════════════════════════════════════════
   SECTION PAGE SYSTEM
══════════════════════════════════════════════════ */

// Section metadata: display name, kicker class, tagline, accent color
const SECTIONS = {
  World:      { label: 'World',      klass: 'world',      tagline: 'International affairs, global conflicts, and the forces shaping our planet.',  icon: '🌍' },
  Politics:   { label: 'Politics',   klass: 'politics',   tagline: 'Power, policy, and the decisions that govern societies.',                        icon: '🏛️' },
  Technology: { label: 'Technology', klass: 'technology', tagline: 'Innovation, AI, digital policy, and the tech forces reshaping everyday life.',   icon: '💻' },
  Science:    { label: 'Science',    klass: 'science',    tagline: 'Discoveries, research, and breakthroughs advancing human knowledge.',            icon: '🔬' },
  Culture:    { label: 'Culture',    klass: 'culture',    tagline: 'Arts, society, identity, and the ideas that define our time.',                   icon: '🎭' },
  Opinion:    { label: 'Opinion',    klass: 'opinion',    tagline: 'Perspectives, commentary, and analysis from leading voices.',                    icon: '💬' },
  Business:   { label: 'Business',   klass: 'business',   tagline: 'Markets, economics, trade, and the forces driving global commerce.',             icon: '📈' },
  Editorial:  { label: 'Editorial',  klass: 'opinion',    tagline: 'In-depth editorial commentary and board positions.',                             icon: '📰' },
};

let currentSectionCat = null;
let _sectionScrollY = 0;

function openSection(cat) {
  currentSectionCat = cat;
  const meta = SECTIONS[cat] || { label: cat, klass: '', tagline: '', icon: '📰' };

  // Update URL hash for SEO-friendly routing
  const hash = '#' + cat.toLowerCase();
  history.pushState({ section: cat }, `${cat} — The Newsbie`, hash);
  document.title = `${cat} — The Newsbie`;

  // Update nav active state
  document.querySelectorAll('.nav-menu a').forEach(a => {
    a.classList.toggle('active', a.textContent.trim() === cat || (cat === 'all' && a.textContent.trim() === 'Home'));
  });

  // Build the section page content
  _sectionScrollY = window.scrollY || window.pageYOffset;
  renderSectionPage(cat, meta);

  // Show overlay
  const overlay = document.getElementById('section-overlay');
  overlay.classList.add('open');
  overlay.scrollTop = 0;
  document.body.classList.add('panel-open');
  document.body.style.top = `-${_sectionScrollY}px`;

  // Set back label
  document.getElementById('section-back-label').textContent = cat + ' Section';

  // Track scroll for progress bar
  overlay.addEventListener('scroll', trackSectionScroll);
}

function closeSection() {
  const overlay = document.getElementById('section-overlay');
  overlay.classList.remove('open');
  overlay.removeEventListener('scroll', trackSectionScroll);
  document.getElementById('section-progress').style.width = '0';

  document.body.classList.remove('panel-open');
  document.body.style.top = '';
  window.scrollTo(0, _sectionScrollY);

  currentSectionCat = null;

  // Restore URL and title
  history.pushState({}, 'The Newsbie', window.location.pathname);
  document.title = 'THE NEWSBIE — INSIGHTFUL. IMPACTFUL BLOG';

  // Reset nav active state to Home
  document.querySelectorAll('.nav-menu a').forEach(a => {
    a.classList.toggle('active', a.textContent.trim() === 'Home');
  });
}

function trackSectionScroll() {
  const ov = document.getElementById('section-overlay');
  const pct = (ov.scrollTop / (ov.scrollHeight - ov.clientHeight)) * 100;
  document.getElementById('section-progress').style.width = Math.min(100, pct) + '%';
}

function renderSectionPage(cat, meta) {
  const pub = articles.filter(a => (a.status || 'published') === 'published' && a.category === cat);
  const container = document.getElementById('section-inner');

  if (!pub.length) {
    container.innerHTML = `
      <div class="section-breadcrumb">
        <a onclick="closeSection()">🏠 Home</a>
        <span class="bc-sep">›</span>
        <span>${meta.label}</span>
      </div>
      <div class="section-masthead">
        <div class="section-kicker ${meta.klass}">${meta.icon} ${meta.label}</div>
        <div class="section-masthead-title">${meta.label}</div>
        <div class="section-masthead-sub">${meta.tagline}</div>
      </div>
      <div class="section-empty">
        <div class="section-empty-icon">${meta.icon}</div>
        <div class="section-empty-title">No ${meta.label} stories yet</div>
        <div class="section-empty-sub">
          We haven't published any ${meta.label.toLowerCase()} articles yet. 
          Check back soon, or browse our other sections for the latest coverage.
        </div>
        <button class="section-empty-btn" onclick="closeSection()">← Browse All Stories</button>
      </div>`;
    return;
  }

  // Hero = most recent featured or just most recent
  const hero = pub.find(a => a.featured) || pub[0];
  const rest = pub.filter(a => a.id !== hero.id);
  const secondary = rest.slice(0, 2);
  const gridArts = rest.slice(2);

  // All pub articles for sidebar trending
  const allPub = articles.filter(a => (a.status || 'published') === 'published');
  const trending = allPub.slice(0, 6);

  // All tags from this section
  const sectionTags = [...new Set(pub.flatMap(a => a.tags || []))];

  // Related sections (other categories that have articles)
  const otherCats = [...new Set(allPub.map(a => a.category))].filter(c => c !== cat).slice(0, 5);

  container.innerHTML = `
    <div class="section-breadcrumb">
      <a onclick="closeSection()">🏠 Home</a>
      <span class="bc-sep">›</span>
      <span>${meta.label}</span>
    </div>

    <div class="section-masthead">
      <div class="section-kicker ${meta.klass}">${meta.icon} ${meta.label}</div>
      <div class="section-masthead-title">${meta.label}</div>
      <div class="section-masthead-sub">${meta.tagline}</div>
      <div class="section-stats">
        <div class="section-stat"><strong>${pub.length}</strong> article${pub.length !== 1 ? 's' : ''}</div>
        <div class="section-stat"><strong>${[...new Set(pub.map(a=>a.author))].length}</strong> contributor${[...new Set(pub.map(a=>a.author))].length !== 1 ? 's' : ''}</div>
        ${sectionTags.length ? `<div class="section-stat"><strong>${sectionTags.length}</strong> topic${sectionTags.length !== 1 ? 's' : ''}</div>` : ''}
      </div>
    </div>

    <div class="section-layout">
      <div class="section-main">
        <!-- HERO -->
        <div class="section-hero">
          <img class="section-hero-img" src="${getImg(hero)}" alt="${hero.title}" onclick="openArticle(${articles.indexOf(hero)})">
          <div class="section-hero-cat">${hero.category}</div>
          <div class="section-hero-title" onclick="openArticle(${articles.indexOf(hero)})">${hero.title}</div>
          ${hero.subtitle ? `<div class="section-hero-sub">${hero.subtitle}</div>` : ''}
          <div class="section-hero-meta">
            <span class="author">By ${hero.author}</span>
            <div class="meta-dot"></div>
            <span>${hero.date}</span>
            <div class="meta-dot"></div>
            <span>${hero.readTime || calcReadTime(hero.content)}</span>
          </div>
        </div>

        ${secondary.length ? `
        <!-- SECONDARY STORIES -->
        <div class="section-secondary">
          ${secondary.map(a => `
          <div class="sec-story" onclick="openArticle(${articles.indexOf(a)})">
            <img class="sec-story-img" src="${getImg(a)}" alt="${a.title}">
            <div class="section-hero-cat">${a.category}</div>
            <div class="sec-story-title">${a.title}</div>
            ${a.subtitle ? `<div style="font-family:var(--fs);font-size:12.5px;color:var(--ink3);line-height:1.55;margin-bottom:7px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${a.subtitle}</div>` : ''}
            <div class="sec-story-meta">By ${a.author} · ${a.readTime || calcReadTime(a.content)}</div>
          </div>`).join('')}
        </div>` : ''}

        ${gridArts.length ? `
        <!-- ARTICLE GRID -->
        <div class="section-grid-label">More ${meta.label} Stories</div>
        <div class="section-art-grid">
          ${gridArts.map(a => `
          <div class="art-card" onclick="openArticle(${articles.indexOf(a)})">
            <img class="art-card-img" src="${getImg(a)}" alt="${a.title}">
            <div class="art-card-cat">${a.category}</div>
            <div class="art-card-title">${a.title}</div>
            <div class="art-card-excerpt">${a.excerpt || a.subtitle || ''}</div>
            <div class="art-card-meta"><span class="author">By ${a.author}</span><span>${a.readTime || calcReadTime(a.content)}</span></div>
          </div>`).join('')}
        </div>` : ''}
      </div>

      <!-- SIDEBAR -->
      <aside class="section-aside">
        <div class="section-aside-block">
          <div class="section-aside-title">Most Read</div>
          ${trending.map((a, i) => `
          <div class="section-aside-item" onclick="openArticle(${articles.indexOf(a)})">
            <div class="sai-num">${String(i+1).padStart(2,'0')}</div>
            <div>
              <div class="sai-title">${a.title}</div>
              <div class="sai-meta">${a.category} · ${a.readTime || calcReadTime(a.content)}</div>
            </div>
          </div>`).join('')}
        </div>

        ${sectionTags.length ? `
        <div class="thin-rule"></div>
        <div class="section-aside-block">
          <div class="section-aside-title">${meta.label} Topics</div>
          <div class="section-tag-cloud">
            ${sectionTags.map(t => `<div class="tag-pill" onclick="searchByTag('${t}')">${t}</div>`).join('')}
          </div>
        </div>` : ''}

        ${otherCats.length ? `
        <div class="thin-rule"></div>
        <div class="section-aside-block">
          <div class="section-aside-title">Other Sections</div>
          ${otherCats.map(c => {
            const sm = SECTIONS[c] || { icon: '📰', label: c };
            return `<div class="section-aside-item" onclick="openSection('${c}')">
              <div style="font-size:22px;flex-shrink:0;width:28px;text-align:center;line-height:1.2">${sm.icon}</div>
              <div>
                <div class="sai-title">${c}</div>
                <div class="sai-meta">${articles.filter(a=>(a.status||'published')==='published'&&a.category===c).length} stories</div>
              </div>
            </div>`;
          }).join('')}
        </div>` : ''}
      </aside>
    </div>`;
}

// Handle browser back/forward navigation
window.addEventListener('popstate', e => {
  const hash = window.location.hash;
  if (!hash || hash === '#') {
    if (currentSectionCat) closeSection();
  } else {
    const cat = hash.slice(1); // remove #
    const matchedCat = Object.keys(SECTIONS).find(k => k.toLowerCase() === cat.toLowerCase());
    if (matchedCat && matchedCat !== 'Editorial') {
      if (currentSectionCat !== matchedCat) openSection(matchedCat);
    } else if (cat === 'editorial') {
      openEditorialPage();
    } else {
      if (currentSectionCat) closeSection();
    }
  }
});

// Handle initial page load with hash in URL
(function handleInitialHash() {
  const hash = window.location.hash;
  if (hash && hash !== '#') {
    const cat = hash.slice(1);
    const matchedCat = Object.keys(SECTIONS).find(k => k.toLowerCase() === cat.toLowerCase());
    if (matchedCat && matchedCat !== 'Editorial') {
      setTimeout(() => openSection(matchedCat), 100);
    } else if (cat === 'editorial') {
      setTimeout(() => openEditorialPage(), 100);
    }
  }
})();

/* ══════════════════════════════════════════════════
   MOBILE FAB + BOTTOM NAV
══════════════════════════════════════════════════ */
let fabOpen = false;
let _scrollY = 0;

function toggleFabMenu() {
  fabOpen = !fabOpen;
  document.getElementById('fab-menu').classList.toggle('open', fabOpen);
  const btn = document.getElementById('fab-main-btn');
  btn.textContent = fabOpen ? '✕' : '+';
  btn.style.transform = fabOpen ? 'rotate(45deg)' : '';
  btn.style.background = fabOpen ? 'var(--ink)' : 'var(--accent)';
}

function fabAction(action) {
  // Close menu first
  fabOpen = false;
  const menu = document.getElementById('fab-menu');
  const btn = document.getElementById('fab-main-btn');
  if (menu) menu.classList.remove('open');
  if (btn) { btn.textContent = '+'; btn.style.transform = ''; btn.style.background = 'var(--accent)'; }

  setTimeout(() => {
    if (action === 'home') {
      closeSection(); closeArticle(); closeAdmin(); currentFilter = 'all'; renderHome();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'sections') {
      showMobileSectionsDrawer();
    } else if (action === 'search') {
      closeSection();
      const inp = document.getElementById('nav-search-input');
      inp?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inp?.focus(), 400);
    } else if (action === 'write') {
      if (currentUser) { showAdminPanel(); setTimeout(() => switchTab('write', document.getElementById('tab-write')), 150); }
      else openAdmin();
    } else if (action === 'manage') {
      if (currentUser) { showAdminPanel(); setTimeout(() => switchTab('manage', document.getElementById('tab-manage')), 150); }
      else openAdmin();
    } else if (action === 'admin') {
      currentUser ? showAdminPanel() : openAdmin();
    } else if (action === 'login') {
      openAdmin();
    } else if (action === 'logout') {
      doLogout();
    }
  }, 180);
}

function updateFabState() {
  const loginItem  = document.getElementById('fab-login-item');
  const logoutItem = document.getElementById('fab-logout-item');
  const writeItem  = document.getElementById('fab-edit-item');
  const manageItem = document.getElementById('fab-manage-item');
  const adminItem  = document.getElementById('fab-admin-item');
  if (!loginItem) return;
  if (currentUser) {
    loginItem.classList.add('js-hidden');
    logoutItem.classList.remove('js-hidden');
    adminItem.classList.remove('js-hidden');
    // fab items use flex display when visible — restore it
    logoutItem.style.display = 'flex';
    adminItem.style.display  = 'flex';
    if (perm('write')) { writeItem.classList.remove('js-hidden'); writeItem.style.display = 'flex'; }
    else writeItem.classList.add('js-hidden');
    if (perm('write') || perm('editAny')) { manageItem.classList.remove('js-hidden'); manageItem.style.display = 'flex'; }
    else manageItem.classList.add('js-hidden');
  } else {
    loginItem.classList.remove('js-hidden');
    logoutItem.classList.add('js-hidden');
    adminItem.classList.add('js-hidden');
    writeItem.classList.add('js-hidden');
    manageItem.classList.add('js-hidden');
  }
}

function mbnNav(tab) {
  document.querySelectorAll('.mbn-item').forEach(b => b.classList.remove('active'));
  const activeId = { home:'mbn-home', sections:'mbn-sections', search:'mbn-search', publish:'mbn-publish' }[tab];
  if (activeId) document.getElementById(activeId)?.classList.add('active');

  if (tab === 'home') {
    closeSection(); closeArticle(); closeAdmin(); currentFilter = 'all'; renderHome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (tab === 'sections') {
    // Show a quick sections picker
    showMobileSectionsDrawer();
  } else if (tab === 'search') {
    closeSection();
    const inp = document.getElementById('nav-search-input');
    inp?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => inp?.focus(), 350);
  } else if (tab === 'publish') {
    currentUser ? showAdminPanel() : openAdmin();
  }
}

function showMobileSectionsDrawer() {
  // Build a quick modal sections list
  const existing = document.getElementById('mobile-sections-drawer');
  if (existing) { existing.remove(); return; }

  const drawer = document.createElement('div');
  drawer.id = 'mobile-sections-drawer';
  drawer.style.cssText = `position:fixed;bottom:68px;left:0;right:0;z-index:4400;background:var(--paper);border-top:2px solid var(--ink);box-shadow:0 -8px 32px var(--shadow2);max-height:70vh;overflow-y:auto;animation:fadeIn .25s ease`;
  const sectItems = [
    { cat: 'World',      icon: '🌍' },
    { cat: 'Politics',   icon: '🏛️' },
    { cat: 'Technology', icon: '💻' },
    { cat: 'Science',    icon: '🔬' },
    { cat: 'Culture',    icon: '🎭' },
    { cat: 'Opinion',    icon: '💬' },
    { cat: 'Business',   icon: '📈' },
    { cat: 'Editorial',  icon: '📰' },
  ];
  const pub = articles.filter(a => (a.status||'published') === 'published');
  drawer.innerHTML = `
    <div style="padding:14px 16px 8px;font-family:var(--fs);font-size:9.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--ink3);border-bottom:1px solid var(--rule2)">Browse Sections</div>
    ${sectItems.map(s => {
      const count = pub.filter(a => a.category === s.cat).length;
      return `<div onclick="document.getElementById('mobile-sections-drawer').remove();document.querySelectorAll('.mbn-item').forEach(b=>b.classList.remove('active'));${s.cat === 'Editorial' ? 'openEditorialPage()' : `openSection('${s.cat}')`}" style="display:flex;align-items:center;gap:14px;padding:14px 16px;border-bottom:1px solid var(--rule2);cursor:pointer;-webkit-tap-highlight-color:transparent">
        <span style="font-size:22px;width:28px;text-align:center">${s.icon}</span>
        <div style="flex:1">
          <div style="font-family:var(--fd);font-size:15px;font-weight:700;color:var(--ink)">${s.cat}</div>
          <div style="font-family:var(--fs);font-size:11px;color:var(--ink4);margin-top:2px">${count} stor${count !== 1 ? 'ies' : 'y'}</div>
        </div>
        <span style="font-size:14px;color:var(--ink4)">›</span>
      </div>`;
    }).join('')}
    <div style="padding:12px 16px">
      <button onclick="document.getElementById('mobile-sections-drawer').remove()" style="width:100%;padding:11px;border:1px solid var(--rule);background:transparent;font-family:var(--fs);font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);cursor:pointer">Close</button>
    </div>`;
  document.body.appendChild(drawer);
  // Auto-close when tapping outside
  setTimeout(() => {
    document.addEventListener('click', function closeDrw(e) {
      if (!e.target.closest('#mobile-sections-drawer') && !e.target.closest('#mbn-sections')) {
        drawer.remove(); document.removeEventListener('click', closeDrw);
      }
    });
  }, 100);
}

function updateMobileBottomNav() {
  const publishBtn = document.getElementById('mbn-publish');
  if (!publishBtn) return;
  if (currentUser) {
    publishBtn.querySelector('.mbn-icon').textContent = '⚙️';
    publishBtn.querySelector('.mbn-label').textContent = 'Studio';
  } else {
    publishBtn.querySelector('.mbn-icon').textContent = '✏️';
    publishBtn.querySelector('.mbn-label').textContent = 'Publish';
  }
}

// Close FAB menu when tapping outside
document.addEventListener('click', e => {
  if (fabOpen && !e.target.closest('#mobile-fab')) {
    fabOpen = false;
    const menu = document.getElementById('fab-menu');
    const btn  = document.getElementById('fab-main-btn');
    if (menu) menu.classList.remove('open');
    if (btn) { btn.textContent = '+'; btn.style.transform = ''; btn.style.background = 'var(--accent)'; }
  }
});

/* ══════════════════════════════════════════════════
   OVERRIDE showAdminPanel / closeAdmin for iOS scroll-position fix
══════════════════════════════════════════════════ */
// Re-declare to override the earlier versions with iOS-safe implementations
showAdminPanel = function() {
  _scrollY = window.scrollY || window.pageYOffset;
  applyRoleUI();
  const panel = document.getElementById('admin-panel');
  panel.classList.add('open');
  // iOS-safe: use fixed + top offset instead of overflow:hidden
  document.body.classList.add('panel-open');
  document.body.style.top = `-${_scrollY}px`;
  if (perm('write')) switchTab('write', document.getElementById('tab-write'));
  else switchTab('manage', document.getElementById('tab-manage'));
  panel.scrollTop = 0;
};

closeAdmin = function() {
  document.getElementById('admin-panel').classList.remove('open');
  document.body.classList.remove('panel-open');
  document.body.style.top = '';
  window.scrollTo(0, _scrollY);
  cancelWriteEdit();
};

/* ══════════════════════════════════════════════════
   SCROLL PROGRESS (homepage)
══════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  const p = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  const bar = document.getElementById('reading-bar');
  if (bar) bar.style.width = Math.min(100, p) + '%';
}, { passive: true });

/* ══════════════════════════════════════════════════
   GLOBAL CLOSE / ESC KEY
══════════════════════════════════════════════════ */
function closeAll() {
  closeSection(); closeArticle(); closeAdmin(); currentFilter = 'all'; renderHome();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('login-modal').classList.contains('open')) closeLogin();
    else if (document.getElementById('admin-panel').classList.contains('open')) closeAdmin();
    else if (document.getElementById('article-overlay').classList.contains('open')) closeArticle();
  }
});

/* ══════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════ */
initEjs();
populateAuthorSelect();
syncEditorialLimitUI();
renderHome();
// Run FAB & bottom nav state after a tick so DOM is settled
setTimeout(() => {
  updateFabState();
  updateMobileBottomNav();
}, 0);
