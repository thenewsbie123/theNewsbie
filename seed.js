// seed.js
// ─────────────────────────────────────────────────────────────────────────────
// Run ONCE to populate your MongoDB database with default data.
// Usage:  node seed.js
//
// BUG FIXED: The original seed.js used:
//
//   await User.create(DEFAULT_USERS);   // ← array argument
//
// When Model.create() receives an ARRAY, Mongoose calls insertMany() under
// the hood. insertMany() bypasses pre-save middleware by default, so the
// password hashing hook never fires — passwords are stored as plain text
// and every login attempt fails (bcrypt.compare('Naman123', 'Naman123') === false).
//
// FIX: Create each user individually so the pre-save hook fires for each one.
// ─────────────────────────────────────────────────────────────────────────────

'use strict';
require('dotenv').config();

const connectDB  = require('./config/db');
const User       = require('./models/User');
const Article    = require('./models/Article');
const Author     = require('./models/Author');
const Highlight  = require('./models/Highlight');
const Editorial  = require('./models/Editorial');
const Subscriber = require('./models/Subscriber');
const mongoose   = require('mongoose');

/* ──────────────────────────────────────────────────────────────
   DEFAULT DATA
────────────────────────────────────────────────────────────── */
const DEFAULT_USERS = [
  { name: 'Naman',          username: 'naman2170',   password: 'Naman123',   role: 'admin'       },
  { name: 'Sarah Mitchell', username: 'editor',      password: 'editor123',  role: 'editor'      },
  { name: 'James Okafor',   username: 'contributor', password: 'contrib123', role: 'contributor' },
  { name: 'Guest Reviewer', username: 'viewer',      password: 'view123',    role: 'viewer'      },
];

const DEFAULT_AUTHORS = [
  {
    name:   'Alexandra Reinholt',
    role:   'Senior Foreign Affairs Correspondent',
    bio:    'Alexandra covers geopolitics, energy markets, and security affairs for The Newsbie. She has reported from 40+ countries.',
    avatar: '',
    social: { tw: 'alexreinholt', li: '', ig: '', fb: '', web: '' },
  },
  {
    name:   'Marcus Chen',
    role:   'Technology & Democracy Correspondent',
    bio:    'Marcus writes on the intersection of technology, society, and political systems. Former researcher at Stanford Internet Observatory.',
    avatar: '',
    social: { tw: 'marcuschen', li: 'marcuschen', ig: '', fb: '', web: '' },
  },
  {
    name:   'Dr. Elena Vasquez',
    role:   'Science & Environment Editor',
    bio:    "Dr. Vasquez holds a PhD in Climate Science from MIT. She leads The Newsbie's environmental coverage.",
    avatar: '',
    social: { tw: '', li: '', ig: '', fb: '', web: 'https://elenavasquez.com' },
  },
  {
    name:   'Thomas Bergmann',
    role:   'Economics & Policy Correspondent',
    bio:    'Thomas covers macroeconomics, trade policy, and industrial strategy for The Newsbie.',
    avatar: '',
    social: { tw: '', li: '', ig: '', fb: '', web: '' },
  },
  {
    name:   'Isabelle Fontaine',
    role:   'Culture & Society Reporter',
    bio:    'Isabelle reports on the intersection of digital life, urban change, and cultural identity.',
    avatar: '',
    social: { tw: '', li: '', ig: '', fb: '', web: '' },
  },
];

const DEFAULT_HIGHLIGHTS = [
  { text: 'BREAKING: Global oil prices surge past $82/barrel amid Hormuz tension escalation', enabled: true, type: 'custom', order: 1 },
  { text: 'LATEST: OPEC+ emergency meeting called — production cut extension on agenda',        enabled: true, type: 'custom', order: 2 },
  { text: 'UPDATE: EU passes landmark AI transparency legislation',                             enabled: true, type: 'custom', order: 3 },
  { text: 'DEVELOPING: Arctic permafrost thaw accelerating beyond 2025 climate projections',   enabled: true, type: 'custom', order: 4 },
];

const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const DEFAULT_ARTICLES = [
  {
    title:    'The Strait That Rules the World: How 33 Kilometers of Water Shapes Global Oil Markets',
    subtitle: "A geographic chokepoint controls one-fifth of the world's petroleum supply — and the nations that depend on it know it.",
    author:   'Alexandra Reinholt',
    category: 'World',
    date:     'March 20, 2026',
    readTime: '8 min read',
    excerpt:  'Every morning, 17 oil tankers navigate a passage barely 33 kilometers wide. What happens there determines fuel prices from Tokyo to São Paulo.',
    tags:     ['Geopolitics', 'Oil', 'Iran', 'Energy'],
    img:      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=80',
    featured: true,
    status:   'published',
    content:  "The sun rises over the Strait of Hormuz at 5:47 a.m., illuminating a procession of tankers.\n\n## A Passage No Nation Can Ignore\n\nThe Strait of Hormuz is the world's most strategically critical maritime chokepoint.\n\n> \"If Hormuz closes, the global economy doesn't just feel it. It collapses.\" — Dr. Margaret Calloway, Johns Hopkins University\n\n## Oil Prices as a Thermometer\n\nWatch oil prices on any given day and you can read the temperature of Hormuz tensions.",
    comments: [
      { name: 'James Whitfield', date: 'March 20, 2026', text: 'Brilliant analysis.' },
      { name: 'Priya Nair',      date: 'March 20, 2026', text: 'The 3.2km statistic is astonishing.' },
    ],
  },
  {
    title:    "AI's Democratic Reckoning: Machine Learning Is Reshaping Political Discourse",
    subtitle: 'From deepfakes to algorithmic recommendation engines, AI is rewriting the rules of democratic participation.',
    author:   'Marcus Chen',
    category: 'Technology',
    date:     'March 19, 2026',
    readTime: '6 min read',
    excerpt:  'As AI-generated content floods digital platforms, regulators scramble to define authenticity in a world where seeing is no longer believing.',
    tags:     ['AI', 'Democracy', 'Technology', 'Politics'],
    img:      'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&q=80',
    featured: false,
    status:   'published',
    content:  "The footage appeared authentic. Within 90 minutes, it was confirmed as fabricated.\n\n## The New Disinformation Landscape\n\nThis incident represents a new category of democratic threat — technically perfect synthetic reality.\n\n> \"The question isn't whether AI will change democracy. It already has.\" — Dr. Sofia Andersson, Oxford Internet Institute",
    comments: [{ name: 'Lena Brauer', date: 'March 19, 2026', text: 'The EU approach seems the most measured.' }],
  },
  {
    title:    'The Last Arctic Frontier: Climate Scientists Warn of Irreversible Permafrost Thaw',
    subtitle: 'A new study suggests that carbon locked in permafrost for millennia could be released faster than climate models predict.',
    author:   'Dr. Elena Vasquez',
    category: 'Science',
    date:     'March 18, 2026',
    readTime: '7 min read',
    excerpt:  'Across Siberia, Alaska, and Canada, the ground is thawing at unprecedented rates, releasing ancient carbon stores.',
    tags:     ['Climate', 'Arctic', 'Science', 'Environment'],
    img:      'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=900&q=80',
    featured: false,
    status:   'published',
    content:  "Standing on what should be solid ground in Siberia's Yakutia region, Dr. Elena Vasquez watches the earth move.\n\n## The Feedback Nobody Modeled\n\nPermafrost contains an estimated 1.5 trillion tonnes of organic carbon.\n\n> \"We may have already crossed a threshold that no policy can reverse.\" — Dr. Elena Vasquez",
    comments: [],
  },
  {
    title:    'The Return of Industrial Policy: Western Governments Are Rebuilding Strategic Manufacturing',
    subtitle: 'After decades of offshoring, the US and EU are betting trillions on reshoring critical industries.',
    author:   'Thomas Bergmann',
    category: 'Politics',
    date:     'March 17, 2026',
    readTime: '9 min read',
    excerpt:  'Supply chain vulnerabilities exposed during the pandemic and the Ukraine war have prompted a dramatic reversal of free-market orthodoxy.',
    tags:     ['Economics', 'Manufacturing', 'Politics', 'Trade'],
    img:      'https://images.unsplash.com/photo-1565793979368-b8de75fbcb81?w=900&q=80',
    featured: false,
    status:   'published',
    content:  "The factory floor stretches a kilometer in each direction. Three years ago, this land in Ohio was farmland.\n\n## The Death of Washington Consensus\n\nFor thirty years, the prevailing wisdom was clear: let markets decide. Ukraine shattered that consensus.\n\n> \"We discovered that efficiency without resilience is just fragility in disguise.\" — Christine Lagarde, ECB",
    comments: [],
  },
  {
    title:    "The Digital Nomad's Dilemma: Remote Work Is Reshaping Cities",
    subtitle: 'As tech workers relocate, locals face rising rents, cultural displacement, and an economy optimized for outsiders.',
    author:   'Isabelle Fontaine',
    category: 'Culture',
    date:     'March 16, 2026',
    readTime: '5 min read',
    excerpt:  'In Tbilisi, Lisbon, Medellín and dozens of other cities, the arrival of remote workers has created a complicated social ledger.',
    tags:     ['Remote Work', 'Culture', 'Cities', 'Economy'],
    img:      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80',
    featured: false,
    status:   'published',
    content:  "The café opens at 9 a.m. By 9:15, every laptop seat is taken.\n\n## A New Kind of Tourism\n\nDigital nomadism has created a new economic category that cities have struggled to classify, tax, and accommodate.",
    comments: [],
  },
  {
    title:    "Pakistan's Water Crisis: A Nation at the Intersection of Climate and Geopolitics",
    subtitle: 'As glaciers shrink and population grows, Pakistan faces a water emergency that threatens regional stability.',
    author:   'Alexandra Reinholt',
    category: 'World',
    date:     'March 15, 2026',
    readTime: '8 min read',
    excerpt:  "Pakistan has the world's largest glacier outside the polar regions, yet water scarcity affects 80% of its population.",
    tags:     ['Pakistan', 'Water', 'Climate', 'Asia'],
    img:      'https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=900&q=80',
    featured: false,
    status:   'published',
    content:  "The Indus River has sustained civilization for 5,000 years.\n\n## Glaciers, Monsoons, and Math\n\nPakistan sits at a difficult hydrological intersection.",
    comments: [],
  },
  {
    title:    'Rethinking Leadership: Management Philosophies Transforming Modern Organizations',
    subtitle: 'A new generation of executives is rejecting hierarchy in favor of psychological safety and radical transparency.',
    author:   'Marcus Chen',
    category: 'Opinion',
    date:     'March 14, 2026',
    readTime: '4 min read',
    excerpt:  "Research from Google, Microsoft, and hundreds of startups confirms: the way we managed organizations in the 20th century was fundamentally broken.",
    tags:     ['Leadership', 'Business', 'Opinion', 'Culture'],
    img:      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80',
    featured: false,
    status:   'published',
    content:  "The annual performance review is dying.\n\n## What the Research Actually Shows\n\nGoogle's Project Aristotle found that psychological safety was the single most important factor in team effectiveness.\n\n> \"The best ideas rarely come from the top.\" — Dr. Amy Edmondson, Harvard",
    comments: [],
  },
];

const DEFAULT_EDITORIALS = [
  {
    type:        'Editorial',
    title:       'The Strait Cannot Be Ignored Any Longer',
    subtitle:    "Western energy policy has sleepwalked into dependence on the world's most fragile chokepoint.",
    author:      'The Newsbie Editorial Board',
    authorTitle: 'Editorial Board',
    authorBio:   'The Newsbie Editorial Board represents the institutional voice of the publication on matters of global significance.',
    date:        'March 20, 2026',
    tags:        ['Oil', 'Geopolitics', 'Policy'],
    img:         'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=80',
    isPick:      true,
    visible:     true,
    content:     "For three decades, Western governments have understood the mathematics of Hormuz and done very little about it.\n\n## The Failure of Diversification Policy\n\nEvery major energy summit since the 1990s has produced declarations of intent. Every one has fallen short.\n\n> \"We have known about this vulnerability for thirty years.\" — The Newsbie Editorial Board",
  },
  {
    type:        'Opinion',
    title:       'Artificial Intelligence Is Not Destroying Democracy — But It Is Testing It',
    subtitle:    'The real threat is not the technology. It is the political culture that will decide how to govern it.',
    author:      'Marcus Chen',
    authorTitle: 'Technology Correspondent',
    authorBio:   'Marcus Chen covers technology and democratic governance for The Newsbie.',
    date:        'March 19, 2026',
    tags:        ['AI', 'Democracy', 'Opinion'],
    img:         'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&q=80',
    isPick:      false,
    visible:     true,
    content:     "The handwringers are not entirely wrong. But they are asking the wrong question.\n\n## The Tool Is Not the Threat\n\nEvery communications technology in history has been greeted with similar alarm.\n\n> \"Democracies were not built for the speed of generative AI.\" — Marcus Chen",
  },
];

/* ──────────────────────────────────────────────────────────────
   SEED FUNCTION
────────────────────────────────────────────────────────────── */
async function seedDatabase() {
  try {
    // connectDB() handles MONGODB_URI validation and retry logic
    await connectDB(3, 1000);

    console.log('\n🗑  Clearing existing data…');
    await Promise.all([
      User.deleteMany({}),
      Author.deleteMany({}),
      Article.deleteMany({}),
      Highlight.deleteMany({}),
      Editorial.deleteMany({}),
      Subscriber.deleteMany({}),
    ]);

    // ── Users ───────────────────────────────────────────────────────────────
    // BUG FIX: Must create users INDIVIDUALLY so the pre-save hook fires
    // for each one and hashes the password. Using User.create([array]) calls
    // insertMany() which bypasses middleware → plain-text passwords → login fails.
    console.log('👤 Seeding users (individually to trigger password hashing)…');
    for (const userData of DEFAULT_USERS) {
      await User.create(userData);
      console.log(`   ✓ ${userData.username} (${userData.role})`);
    }

    console.log('✍️  Seeding authors…');
    await Author.insertMany(DEFAULT_AUTHORS);

    console.log('📰 Seeding articles…');
    await Article.insertMany(DEFAULT_ARTICLES);

    console.log('📝 Seeding editorials…');
    await Editorial.insertMany(DEFAULT_EDITORIALS);

    console.log('🔴 Seeding highlights…');
    await Highlight.insertMany(DEFAULT_HIGHLIGHTS);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   admin:       naman2170   / Naman123');
    console.log('   editor:      editor      / editor123');
    console.log('   contributor: contributor / contrib123');
    console.log('   viewer:      viewer      / view123');
    console.log('\n📊 Seeded:');
    console.log(`   • ${DEFAULT_USERS.length} users`);
    console.log(`   • ${DEFAULT_AUTHORS.length} authors`);
    console.log(`   • ${DEFAULT_ARTICLES.length} articles`);
    console.log(`   • ${DEFAULT_EDITORIALS.length} editorials`);
    console.log(`   • ${DEFAULT_HIGHLIGHTS.length} highlights`);
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    console.error(err.stack);
    await mongoose.disconnect();
    process.exit(1);
  }

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected from MongoDB. Seeding complete.');
  process.exit(0);
}

seedDatabase();
