/**
 * Sync data/repertoire-catalog.json from repertoire-manifest + course JSON files.
 * Run: node scripts/sync-repertoire-catalog.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const API_CACHE = path.join(ROOT, "data/repertoire-api-descriptions.json");
const MANIFEST_PATH = path.join(ROOT, "data/repertoire-manifest.json");
const CATALOG_PATH = path.join(ROOT, "data/repertoire-catalog.json");
const TAGS = {
  london: ["1.d4", "System"],
  italian: ["1.e4", "Giuoco Piano"],
  sicilian: ["1.e4", "c5"],
  "caro-kann": ["1.e4", "c6"],
  kid: ["1.d4", "KID"],
  scotch: ["1.e4", "Scotch"],
  "ruy-lopez": ["1.e4", "Ruy Lopez"],
  english: ["1.c4", "English"],
  jobava: ["1.d4", "Jobava"],
  "fried-liver": ["1.e4", "Tactics"],
  alapin: ["1.e4", "Anti-Sicilian"],
  alekhine: ["1.e4", "Alekhine"],
  modern: ["1.e4", "Modern"],
  halloween: ["1.e4", "Gambit"],
  "smith-morra": ["1.e4", "Anti-Sicilian"],
  greco: ["1.e4", "Gambit"],
  "closed-sicilian": ["1.e4", "Anti-Sicilian"],
  "pirc-kid": ["1...Nf6", "Unified"],
  halosar: ["1.d4", "Trap"],
  trompowsky: ["1.d4", "Anti-Tromp"],
  "scholars-punish": ["1.e4", "Anti-Tricks"],
  "anti-london": ["1.d4", "Anti-London"],
  "nimzo-indian": ["1.d4", "Nimzo-Indian"],
  "grand-prix": ["1.e4", "Anti-Sicilian"],
  "alien-gambit": ["1.e4", "Gambit"],
  "bd-budapest": ["1.d4", "Gambit"],
  "evans-scotch-gambit": ["1.e4", "Gambit"],
  "blumenfeld-scotch": ["1.e4", "Scotch"],
  "accel-dragon": ["1.e4", "Sicilian"],
  "najdorf-starter": ["1.e4", "Najdorf"],
  "dutch-defense": ["1.d4", "Dutch"],
  "slav-semi-slav": ["1.d4", "Slav"],
  "benoni-benko": ["1.d4", "Benoni"],
  "anti-jobava": ["1.d4", "Anti-Jobava"],
  "black-tournament-rep": ["Black", "Mega rep"],
};

/** @param {object} data */
function courseDepth(data) {
  const lessons = data.lessons || [];
  if (!lessons.length) return { avgPlies: 0, depth: "Quick" };

  let totalMoves = 0;
  for (const lesson of lessons) {
    totalMoves += (lesson.steps || []).filter((s) => s.type === "move").length;
  }
  const avgPlies = Math.round(totalMoves / lessons.length);
  let depth = "Standard";
  if (avgPlies < 10 || lessons.length < 12) depth = "Quick";
  else if (avgPlies >= 15 || lessons.length >= 22) depth = "Deep";

  return { avgPlies, depth };
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const manifestUpdatedAt = manifest.updatedAt || new Date().toISOString().slice(0, 10);
let apiDescriptions = {};
if (fs.existsSync(API_CACHE)) {
  const api = JSON.parse(fs.readFileSync(API_CACHE, "utf8"));
  for (const r of api.results || []) {
    const key = manifest.openings.find((o) => o.slug === r.slug)?.key;
    if (key) apiDescriptions[key] = r.description;
  }
}

function courseEntry(o) {
  const jsonPath = path.join(ROOT, `data/openings-${o.key}.json`);
  let lineCount = o.lines;
  let description = apiDescriptions[o.key] || `${o.name} — ${lineCount} interactive lines.`;
  let avgPlies = 0;
  let depth = "Standard";

  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    lineCount = data.lessons?.length || lineCount;
    if (data.description) description = data.description;
    const depthInfo = courseDepth(data);
    avgPlies = depthInfo.avgPlies;
    depth = depthInfo.depth;
  }

  return {
    id: o.key,
    collectionKey: o.key,
    title: o.name,
    href: `course.html?key=${o.key}`,
    color: o.color,
    lineCount,
    avgPlies,
    depth,
    description,
    tags: TAGS[o.key] || [o.color === "black" ? "Black" : "White"],
    category: o.category || "official",
    author: o.author || "LlamaChess",
    updatedAt: o.updatedAt || manifestUpdatedAt,
  };
}

const courses = manifest.openings.map(courseEntry);
const official = courses.filter((c) => c.category === "official");
const potluck = courses.filter((c) => c.category === "potluck");

const catalog = {
  hubId: "line_kitchen",
  title: "Line Kitchen",
  tagline: "Walk the lines. Cook your opponents.",
  description: `${official.length} house menu · ${potluck.length} potluck — interactive opening lines with casual notes.`,
  courses,
  sections: [
    { id: "official", title: "The House Menu", courseIds: official.map((c) => c.id) },
    { id: "potluck", title: "Potluck Lines", courseIds: potluck.map((c) => c.id) },
  ],
};

fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + "\n");

const updated = {
  ...manifest,
  updatedAt: new Date().toISOString().slice(0, 10),
  openings: manifest.openings.map((o) => ({
    ...o,
    status: fs.existsSync(path.join(ROOT, `data/openings-${o.key}.json`)) ? "done" : o.status,
  })),
};
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(updated, null, 2) + "\n");

console.log(`Synced ${courses.length} courses → ${CATALOG_PATH}`);
console.log(`  Official: ${official.length} · Potluck: ${potluck.length}`);
console.log(`Total lines: ${courses.reduce((s, c) => s + c.lineCount, 0)}`);
