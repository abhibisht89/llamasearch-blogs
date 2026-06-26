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
};

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
let apiDescriptions = {};
if (fs.existsSync(API_CACHE)) {
  const api = JSON.parse(fs.readFileSync(API_CACHE, "utf8"));
  for (const r of api.results || []) {
    const key = manifest.openings.find((o) => o.slug === r.slug)?.key;
    if (key) apiDescriptions[key] = r.description;
  }
}

const courses = manifest.openings.map((o) => {
  const jsonPath = path.join(ROOT, `data/openings-${o.key}.json`);
  let lineCount = o.lines;
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    lineCount = data.lessons?.length || lineCount;
  }
  return {
    id: o.key,
    collectionKey: o.key,
    title: o.name,
    href: `course.html?key=${o.key}`,
    color: o.color,
    lineCount,
    description: apiDescriptions[o.key] || `${o.name} — ${lineCount} interactive lines.`,
    tags: TAGS[o.key] || [o.color === "black" ? "Black" : "White"],
  };
});

const catalog = {
  hubId: "line_kitchen",
  title: "Line Kitchen",
  tagline: "Walk the lines. Cook your opponents.",
  description:
    "All 28 opening courses — London, Italian, Sicilian, Ruy Lopez, and every line on the menu.",
  courses,
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
console.log(`Total lines: ${courses.reduce((s, c) => s + c.lineCount, 0)}`);
