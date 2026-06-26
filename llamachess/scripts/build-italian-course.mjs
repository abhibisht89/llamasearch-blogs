/**
 * Build data/openings-italian.json and data/italian-toc.json from source lines.
 * Run: node scripts/build-italian-course.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ITALIAN_LINES } from "./italian-lines-source.mjs";
import { lineToLesson, summarizeLine } from "./opening-line-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const lessons = ITALIAN_LINES.map((line, index) => lineToLesson(line, index + 1));

const course = {
  version: 1,
  collectionId: "italian",
  title: "Italian Game",
  author: "LlamaChess Repertoire",
  description:
    "The Italian Game (1.e4 e5 2.Nf3 Nc6 3.Bc4) — 22 interactive lines with c3, d4 center attacks, and casual move-by-move notes.",
  source: "LlamaChess Line Kitchen; original commentary.",
  tocRef: "data/italian-toc.json",
  lessons,
  meta: {
    lessonCount: lessons.length,
    liveCount: lessons.length,
    comingSoonCount: 0,
    color: "white",
    slug: "italian-game",
    generatedBy: "scripts/build-italian-course.mjs",
  },
};

const toc = {
  title: "Italian Game",
  author: "LlamaChess Repertoire",
  color: "white",
  description:
    "This isa one-a spicy-a meatball-a! Mamma mia — the most played opening at the non-professional level.",
  parts: [
    {
      id: "italian_lines",
      title: "22 Lines",
      chapters: [
        {
          number: 1,
          id: "italian_all",
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

const coursePath = path.join(ROOT, "data/openings-italian.json");
const tocPath = path.join(ROOT, "data/italian-toc.json");

fs.writeFileSync(coursePath, JSON.stringify(course, null, 2) + "\n");
fs.writeFileSync(tocPath, JSON.stringify(toc, null, 2) + "\n");

console.log(`Wrote ${lessons.length} lessons → ${coursePath}`);
for (const line of ITALIAN_LINES) {
  console.log(`  #${line.lineNumber} ${line.title} (${line.moves.length} moves)`);
  console.log(`      ${summarizeLine(line.moves)}`);
}
