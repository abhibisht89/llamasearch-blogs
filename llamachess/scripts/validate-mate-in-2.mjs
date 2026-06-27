/**
 * Validate mate-in-2 puzzles (optionally a book-id batch).
 *
 * Run:
 *   node scripts/validate-mate-in-2.mjs
 *   node scripts/validate-mate-in-2.mjs 307 406
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateMateInTwoPuzzle } from "./mate-in-2-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data/sections/mate_in_2.json");

const [fromBookId, toBookId] = process.argv.slice(2).map(Number);
const section = JSON.parse(fs.readFileSync(DATA, "utf8"));

const puzzles = section.puzzles.filter((puzzle) => {
  if (!fromBookId) return true;
  if (toBookId) return puzzle.bookId >= fromBookId && puzzle.bookId <= toBookId;
  return puzzle.bookId === fromBookId;
});

let failed = 0;
for (const puzzle of puzzles) {
  const result = validateMateInTwoPuzzle(puzzle);
  if (result.status === "ok") {
    console.log(`OK   #${puzzle.id} book ${puzzle.bookId}  ${result.line.join(" ")}`);
  } else {
    failed += 1;
    console.log(
      `FAIL #${puzzle.id} book ${puzzle.bookId}  ${result.status}/${result.reason}  raw=${puzzle.solutionRaw}`
    );
  }
}

console.log(`\n${puzzles.length - failed}/${puzzles.length} passed in selection`);
if (failed) process.exit(1);
