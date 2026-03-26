// seed.js
// Run this ONCE to populate your database with default data.
// Usage:  node seed.js
//
// What it seeds:
//   • 4 users  (admin, editor, contributor, viewer)
//   • 5 authors
//   • 7 articles
//   • 2 editorials
//   • 4 highlights
//
// Passwords are automatically hashed by the User model's pre-save hook.

require("dotenv").config();
const mongoose   = require("mongoose");
const connectDB  = require("./config/db");

// ── Models ────────────────────────────────────────────────────────────────────
const User       = require("./models/User");
const Article    = require("./models/Article");
const Author     = require("./models/Author");
const Highlight  = require("./models/Highlight");
const Editorial  = require("./models/Editorial");
const Subscriber = require("./models/Subscriber");

// ── Default Data ──────────────────────────────────────────────────────────────

const DEFAULT_USERS = [
  { name: "Naman",          username: "naman2170",   password: "Naman123",   role: "admin"       },
  { name: "Sarah Mitchell", username: "editor",      password: "editor123",  role: "editor"      },
  { name: "James Okafor",   username: "contributor", password: "contrib123", role: "contributor" },
  { name: "Guest Reviewer", username: "viewer",      password: "view123",    role: "viewer"      },
];

const DEFAULT_AUTHORS = [
  {
    name:   "Alexandra Reinholt",
    role:   "Senior Foreign Affairs Correspondent",
    bio:    "Alexandra covers geopolitics, energy markets, and security affairs for The Newsbie. She has reported from 40+ countries.",
    avatar: "",
    social: { tw: "alexreinholt", li: "", ig: "", fb: "", web: "" },
  },
  {
    name:   "Marcus Chen",
    role:   "Technology & Democracy Correspondent",
    bio:    "Marcus writes on the intersection of technology, society, and political systems. Former researcher at Stanford Internet Observatory.",
    avatar: "",
    social: { tw: "marcuschen", li: "marcuschen", ig: "", fb: "", web: "" },
  },
  {
    name:   "Dr. Elena Vasquez",
    role:   "Science & Environment Editor",
    bio:    "Dr. Vasquez holds a PhD in Climate Science from MIT. She leads The Newsbie's environmental coverage.",
    avatar: "",
    social: { tw: "", li: "", ig: "", fb: "", web: "https://elenavasquez.com" },
  },
  {
    name:   "Thomas Bergmann",
    role:   "Economics & Policy Correspondent",
    bio:    "Thomas covers macroeconomics, trade policy, and industrial strategy for The Newsbie.",
    avatar: "",
    social: { tw: "", li: "", ig: "", fb: "", web: "" },
  },
  {
    name:   "Isabelle Fontaine",
    role:   "Culture & Society Reporter",
    bio:    "Isabelle reports on the intersection of digital life, urban change, and cultural identity.",
    avatar: "",
    social: { tw: "", li: "", ig: "", fb: "", web: "" },
  },
];

const DEFAULT_HIGHLIGHTS = [
  { text: "BREAKING: Global oil prices surge past $82/barrel amid Hormuz tension escalation", enabled: true, type: "custom", order: 1 },
  { text: "LATEST: OPEC+ emergency meeting called — production cut extension on agenda",        enabled: true, type: "custom", order: 2 },
  { text: "UPDATE: EU passes landmark AI transparency legislation",                             enabled: true, type: "custom", order: 3 },
  { text: "DEVELOPING: Arctic permafrost thaw accelerating beyond 2025 climate projections",   enabled: true, type: "custom", order: 4 },
];

const DEFAULT_ARTICLES = [
  {
    title:    "The Strait That Rules the World: How 33 Kilometers of Water Shapes Global Oil Markets",
    subtitle: "A geographic chokepoint controls one-fifth of the world's petroleum supply — and the nations that depend on it know it.",
    author:   "Alexandra Reinholt",
    category: "World",
    date:     "March 20, 2026",
    readTime: "8 min read",
    excerpt:  "Every morning, 17 oil tankers navigate a passage barely 33 kilometers wide. What happens there determines fuel prices from Tokyo to São Paulo.",
    tags:     ["Geopolitics", "Oil", "Iran", "Energy"],
    img:      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=80",
    featured: true,
    status:   "published",
    content:  "The sun rises over the Strait of Hormuz at 5:47 a.m., illuminating a procession of tankers.\n\n## A Passage No Nation Can Ignore\n\nThe Strait of Hormuz is the world's most strategically critical maritime chokepoint. At its narrowest point, the usable shipping lane is barely 3.2 kilometers wide in each direction.\n\n> \"If Hormuz closes, the global economy doesn't just feel it. It collapses.\" — Dr. Margaret Calloway, Johns Hopkins University\n\nIran controls the northern shore. The Persian Gulf states — Saudi Arabia, the UAE, Kuwait, Qatar — depend on it for virtually all their exports.\n\n## Oil Prices as a Thermometer\n\nWatch oil prices on any given day and you can read the temperature of Hormuz tensions. When IRGC naval exercises intensify, prices spike.\n\n## Iran's Geographic Leverage\n\nIran has never needed to actually close the strait. The threat alone provides extraordinary leverage.",
    comments: [
      { name: "James Whitfield", date: "March 20, 2026", text: "Brilliant analysis. The point about deterrence through geography is particularly astute." },
      { name: "Priya Nair",      date: "March 20, 2026", text: "The statistic about 3.2km usable lanes is astonishing." },
    ],
  },
  {
    title:    "AI's Democratic Reckoning: Machine Learning Is Reshaping Political Discourse",
    subtitle: "From deepfakes to algorithmic recommendation engines, AI is rewriting the rules of democratic participation.",
    author:   "Marcus Chen",
    category: "Technology",
    date:     "March 19, 2026",
    readTime: "6 min read",
    excerpt:  "As AI-generated content floods digital platforms, regulators scramble to define authenticity in a world where seeing is no longer believing.",
    tags:     ["AI", "Democracy", "Technology", "Politics"],
    img:      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&q=80",
    featured: false,
    status:   "published",
    content:  "The footage appeared authentic. A senior official, speaking clearly, announcing a policy reversal that sent markets tumbling. Within 90 minutes, it was confirmed as fabricated.\n\n## The New Disinformation Landscape\n\nThis incident represents a new category of democratic threat — technically perfect synthetic reality.\n\n> \"The question isn't whether AI will change democracy. It already has.\" — Dr. Sofia Andersson, Oxford Internet Institute\n\n## Regulatory Responses\n\nThe European Union's AI Authenticity Act, passed in December 2025, requires watermarking of AI-generated political content.",
    comments: [
      { name: "Lena Brauer", date: "March 19, 2026", text: "The EU approach seems the most measured. Watermarking feels like the right compromise." },
    ],
  },
  {
    title:    "The Last Arctic Frontier: Climate Scientists Warn of Irreversible Permafrost Thaw",
    subtitle: "A new study suggests that carbon locked in permafrost for millennia could be released faster than climate models predict.",
    author:   "Dr. Elena Vasquez",
    category: "Science",
    date:     "March 18, 2026",
    readTime: "7 min read",
    excerpt:  "Across Siberia, Alaska, and Canada, the ground is thawing at unprecedented rates, releasing ancient carbon stores.",
    tags:     ["Climate", "Arctic", "Science", "Environment"],
    img:      "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=900&q=80",
    featured: false,
    status:   "published",
    content:  "Standing on what should be solid ground in Siberia's Yakutia region, Dr. Elena Vasquez watches the earth move. A ground frozen for 10,000 years is shifting.\n\n## The Feedback Nobody Modeled\n\nPermafrost contains an estimated 1.5 trillion tonnes of organic carbon — roughly double what is currently in the atmosphere.\n\n> \"We may have already crossed a threshold that no policy can reverse.\" — Dr. Elena Vasquez",
    comments: [],
  },
  {
    title:    "The Return of Industrial Policy: Western Governments Are Rebuilding Strategic Manufacturing",
    subtitle: "After decades of offshoring, the US and EU are betting trillions on reshoring critical industries.",
    author:   "Thomas Bergmann",
    category: "Politics",
    date:     "March 17, 2026",
    readTime: "9 min read",
    excerpt:  "Supply chain vulnerabilities exposed during the pandemic and the Ukraine war have prompted a dramatic reversal of free-market orthodoxy.",
    tags:     ["Economics", "Manufacturing", "Politics", "Trade"],
    img:      "https://images.unsplash.com/photo-1565793979368-b8de75fbcb81?w=900&q=80",
    featured: false,
    status:   "published",
    content:  "The factory floor stretches a kilometer in each direction. Three years ago, this land in Ohio was farmland. Today, it produces advanced semiconductors.\n\n## The Death of Washington Consensus\n\nFor thirty years, the prevailing wisdom was clear: let markets decide. Ukraine shattered that consensus.\n\n> \"We discovered that efficiency without resilience is just fragility in disguise.\" — Christine Lagarde, ECB",
    comments: [],
  },
  {
    title:    "The Digital Nomad's Dilemma: Remote Work Is Reshaping Cities",
    subtitle: "As tech workers relocate, locals face rising rents, cultural displacement, and an economy optimized for outsiders.",
    author:   "Isabelle Fontaine",
    category: "Culture",
    date:     "March 16, 2026",
    readTime: "5 min read",
    excerpt:  "In Tbilisi, Lisbon, Medellín and dozens of other cities, the arrival of remote workers has created a complicated social ledger.",
    tags:     ["Remote Work", "Culture", "Cities", "Economy"],
    img:      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80",
    featured: false,
    status:   "published",
    content:  "The café opens at 9 a.m. By 9:15, every laptop seat is taken. The clientele is international — paying with cards linked to accounts in countries far away.\n\n## A New Kind of Tourism\n\nDigital nomadism has created a new economic category that cities have struggled to classify, tax, and accommodate.",
    comments: [],
  },
  {
    title:    "Pakistan's Water Crisis: A Nation at the Intersection of Climate and Geopolitics",
    subtitle: "As glaciers shrink and population grows, Pakistan faces a water emergency that threatens regional stability.",
    author:   "Alexandra Reinholt",
    category: "World",
    date:     "March 15, 2026",
    readTime: "8 min read",
    excerpt:  "Pakistan has the world's largest glacier outside the polar regions, yet water scarcity affects 80% of its population.",
    tags:     ["Pakistan", "Water", "Climate", "Asia"],
    img:      "https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=900&q=80",
    featured: false,
    status:   "published",
    content:  "The Indus River has sustained civilization for 5,000 years. Today, its future is uncertain in ways its ancient inhabitants could not have imagined.\n\n## Glaciers, Monsoons, and Math\n\nPakistan sits at a difficult hydrological intersection. Its northern territories contain the Karakoram and Hindu Kush ranges, home to more glacial ice than anywhere outside the polar regions.",
    comments: [],
  },
  {
    title:    "Rethinking Leadership: Management Philosophies Transforming Modern Organizations",
    subtitle: "A new generation of executives is rejecting hierarchy in favor of psychological safety and radical transparency.",
    author:   "Marcus Chen",
    category: "Opinion",
    date:     "March 14, 2026",
    readTime: "4 min read",
    excerpt:  "Research from Google, Microsoft, and hundreds of startups confirms: the way we managed organizations in the 20th century was fundamentally broken.",
    tags:     ["Leadership", "Business", "Opinion", "Culture"],
    img:      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80",
    featured: false,
    status:   "published",
    content:  "The annual performance review is dying. The open-plan office is under siege. The 9-to-5 schedule is a relic.\n\n## What the Research Actually Shows\n\nGoogle's Project Aristotle found that psychological safety was the single most important factor in team effectiveness.\n\n> \"The best ideas rarely come from the top. The best leaders create conditions where ideas can come from anywhere.\" — Dr. Amy Edmondson, Harvard",
    comments: [],
  },
];

const DEFAULT_EDITORIALS = [
  {
    type:        "Editorial",
    title:       "The Strait Cannot Be Ignored Any Longer",
    subtitle:    "Western energy policy has sleepwalked into dependence on the world's most fragile chokepoint.",
    author:      "The Newsbie Editorial Board",
    authorTitle: "Editorial Board",
    authorBio:   "The Newsbie Editorial Board represents the institutional voice of the publication on matters of global significance.",
    date:        "March 20, 2026",
    tags:        ["Oil", "Geopolitics", "Policy"],
    img:         "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=80",
    isPick:      true,
    visible:     true,
    content:     "For three decades, Western governments have understood the mathematics of Hormuz and done very little about it.\n\n## The Failure of Diversification Policy\n\nEvery major energy summit since the 1990s has produced declarations of intent to reduce dependence on Gulf oil. Every one has fallen short.\n\n> \"We have known about this vulnerability for thirty years. We have treated it as someone else's problem. It is now everyone's problem.\" — The Newsbie Editorial Board\n\n## What Must Change\n\nThe answer is accelerated investment in alternative supply routes, genuine renewable transition timelines, and strategic reserve policies.",
  },
  {
    type:        "Opinion",
    title:       "Artificial Intelligence Is Not Destroying Democracy — But It Is Testing It",
    subtitle:    "The real threat is not the technology. It is the political culture that will decide how to govern it.",
    author:      "Marcus Chen",
    authorTitle: "Technology Correspondent",
    authorBio:   "Marcus Chen covers technology and democratic governance for The Newsbie.",
    date:        "March 19, 2026",
    tags:        ["AI", "Democracy", "Opinion"],
    img:         "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&q=80",
    isPick:      false,
    visible:     true,
    content:     "The handwringers are not entirely wrong. But they are asking the wrong question.\n\n## The Tool Is Not the Threat\n\nEvery communications technology in history has been greeted with similar alarm about its destabilising effect on democratic discourse.\n\n> \"Democracies were not built for the speed of social media. They were certainly not built for the speed of generative AI.\" — Marcus Chen",
  },
];

// ── Seed Function ─────────────────────────────────────────────────────────────

const seedDatabase = require("./seed"); {
  try {
    await connectDB();

    console.log("🗑  Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Author.deleteMany({}),
      Article.deleteMany({}),
      Highlight.deleteMany({}),
      Editorial.deleteMany({}),
      Subscriber.deleteMany({}),
    ]);

    console.log("👤 Seeding users...");
    // User.create() triggers the pre('save') hook which hashes each password
    await User.create(DEFAULT_USERS);

    console.log("✍️  Seeding authors...");
    await Author.create(DEFAULT_AUTHORS);

    console.log("📰 Seeding articles...");
    await Article.create(DEFAULT_ARTICLES);

    console.log("📝 Seeding editorials...");
    await Editorial.create(DEFAULT_EDITORIALS);

    console.log("🔴 Seeding highlights...");
    await Highlight.create(DEFAULT_HIGHLIGHTS);

    console.log("\n✅ Database seeded successfully!");
    console.log("\n📋 Login credentials:");
    console.log("   admin:       naman2170   / Naman123");
    console.log("   editor:      editor      / editor123");
    console.log("   contributor: contributor / contrib123");
    console.log("   viewer:      viewer      / view123");
    console.log("\n📊 Seeded:");
    console.log(`   • ${DEFAULT_USERS.length} users`);
    console.log(`   • ${DEFAULT_AUTHORS.length} authors`);
    console.log(`   • ${DEFAULT_ARTICLES.length} articles`);
    console.log(`   • ${DEFAULT_EDITORIALS.length} editorials`);
    console.log(`   • ${DEFAULT_HIGHLIGHTS.length} highlights`);

  } catch (error) {
    console.error("\n❌ Seeding failed:", error.message);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }

  // Cleanly disconnect so the process exits without hanging
  await mongoose.disconnect();
  console.log("\n🔌 Disconnected from MongoDB. Done.");
  process.exit(0);
};

module.exports=seedDatabase;
