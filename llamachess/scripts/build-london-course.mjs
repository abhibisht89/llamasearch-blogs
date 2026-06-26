/**
 * Build data/openings-london.json and data/london-toc.json from source lines.
 * Run: node scripts/build-london-course.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LONDON_LINES } from "./london-lines-source.mjs";
import { lineToLesson, summarizeLine } from "./opening-line-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const lessons = LONDON_LINES.map((line, index) => lineToLesson(line, index + 1));

const course = {
  version: 1,
  collectionId: "london",
  title: "London System",
  author: "LlamaChess Repertoire",
  description:
    "The London System (1.d4 and 2.Bf4) — 28 interactive lines against every major Black setup, with casual move-by-move notes.",
  source: "LlamaChess Line Kitchen; original commentary.",
  tocRef: "data/london-toc.json",
  lessons,
  meta: {
    lessonCount: lessons.length,
    liveCount: lessons.length,
    comingSoonCount: 0,
    color: "white",
    slug: "london",
    generatedBy: "scripts/build-london-course.mjs",
  },
};

const toc = {
  title: "London System",
  author: "LlamaChess Repertoire",
  color: "white",
  description:
    "If you click this, you're gonna make a lot of enemies. People hate London players because the opening is so solid and Black can do pretty much nothing to counter.",
  parts: [
    {
      id: "london_lines",
      title: "28 Lines",
      chapters: [
        {
          number: 1,
          id: "london_all",
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

const coursePath = path.join(ROOT, "data/openings-london.json");
const tocPath = path.join(ROOT, "data/london-toc.json");

fs.writeFileSync(coursePath, JSON.stringify(course, null, 2) + "\n");
fs.writeFileSync(tocPath, JSON.stringify(toc, null, 2) + "\n");

console.log(`Wrote ${lessons.length} lessons → ${coursePath}`);
for (const line of LONDON_LINES) {
  console.log(`  #${line.lineNumber} ${line.title} (${line.moves.length} moves)`);
  console.log(`      ${summarizeLine(line.moves)}`);
}
