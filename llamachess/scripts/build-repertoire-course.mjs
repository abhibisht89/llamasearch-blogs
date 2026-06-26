/**
 * Generic builder for Line Kitchen repertoire courses.
 * Run: node scripts/build-repertoire-course.mjs <key>
 * Or:  node scripts/build-repertoire-course.mjs --all
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { lineToLesson } from "./opening-line-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "data/repertoire-manifest.json");

function loadManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
}

function findMeta(manifest, key) {
  const meta = manifest.openings.find((o) => o.key === key);
  if (!meta) throw new Error(`Unknown repertoire key: ${key}`);
  return meta;
}

async function loadLines(key) {
  const modPath = path.join(__dirname, "repertoire-lines", `${key}.mjs`);
  if (!fs.existsSync(modPath)) {
    throw new Error(`Missing line source: scripts/repertoire-lines/${key}.mjs`);
  }
  const mod = await import(pathToFileURL(modPath).href);
  return mod.default || mod.LINES || mod[`${key.toUpperCase().replace(/-/g, "_")}_LINES`];
}

export async function buildCourse(key, { lines, meta, description }) {
  const lineList = lines;
  if (!lineList?.length) throw new Error(`No lines for ${key}`);

  const lessons = lineList.map((line, index) =>
    lineToLesson(
      {
        ...line,
        partId: `${key}_lines`,
        orientation: meta.color === "black" ? "black" : "white",
        tags: line.tags || [meta.name],
      },
      index + 1
    )
  );

  const course = {
    version: 1,
    collectionId: key,
    title: meta.name,
    author: "LlamaChess Repertoire",
    description: description || `${meta.name} — ${lineList.length} interactive lines with casual move-by-move notes.`,
    source: `LlamaChess Line Kitchen; original commentary.`,
    tocRef: `data/${key}-toc.json`,
    lessons,
    meta: {
      lessonCount: lessons.length,
      liveCount: lessons.length,
      comingSoonCount: 0,
      color: meta.color,
      slug: meta.slug,
      generatedBy: "scripts/build-repertoire-course.mjs",
    },
  };

  const toc = {
    title: meta.name,
    author: "LlamaChess Repertoire",
    color: meta.color,
    description: description || "",
    parts: [
      {
        id: `${key}_lines`,
        title: `${lineList.length} Lines`,
        chapters: [
          {
            number: 1,
            id: `${key}_all`,
            title: "All Lines",
            bookPage: 1,
            topics: lessons.map((lesson) => ({
              id: lesson.topicId,
              title: lesson.title,
              bookPage: lesson.id,
              subtopics: [],
            })),
          },
        ],
      },
    ],
  };

  fs.writeFileSync(path.join(ROOT, `data/openings-${key}.json`), JSON.stringify(course, null, 2) + "\n");
  fs.writeFileSync(path.join(ROOT, `data/${key}-toc.json`), JSON.stringify(toc, null, 2) + "\n");

  return { key, lessonCount: lessons.length, expected: meta.lines };
}

async function buildOne(key) {
  const manifest = loadManifest();
  const meta = findMeta(manifest, key);
  const lines = await loadLines(key);
  const modPath = path.join(__dirname, "repertoire-lines", `${key}.mjs`);
  const mod = await import(pathToFileURL(modPath).href);
  const result = await buildCourse(key, {
    lines,
    meta,
    description: mod.COURSE_DESCRIPTION || mod.description,
  });

  if (result.lessonCount !== result.expected) {
    console.warn(
      `WARN ${key}: built ${result.lessonCount} lines, catalog expects ${result.expected}`
    );
  } else {
    console.log(`OK ${key}: ${result.lessonCount} lines`);
  }
  return result;
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Usage: node scripts/build-repertoire-course.mjs <key|--all>");
    process.exit(1);
  }

  if (arg === "--all") {
    const manifest = loadManifest();
    const keys = manifest.openings
      .filter((o) => o.status !== "skip")
      .map((o) => o.key);
    let failed = 0;
    for (const key of keys) {
      try {
        await buildOne(key);
      } catch (err) {
        console.error(`FAIL ${key}:`, err.message);
        failed += 1;
      }
    }
    process.exit(failed ? 1 : 0);
  }

  await buildOne(arg);
}

if (process.argv[1]?.endsWith("build-repertoire-course.mjs")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
