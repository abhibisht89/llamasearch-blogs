/**
 * Audit all mate-in-2 puzzles and write status + verified ids.
 *
 * Run: node scripts/audit-mate-in-2.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateMateInTwoPuzzle } from "./mate-in-2-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data/sections/mate_in_2.json");
const AUDIT_OUT = path.join(ROOT, "data/sections/mate_in_2_audit.json");
const STATUS_OUT = path.join(ROOT, "data/sections/mate_in_2_repair_status.json");
const VERIFIED_OUT = path.join(ROOT, "data/sections/mate_in_2_verified_ids.json");

const section = JSON.parse(fs.readFileSync(DATA, "utf8"));
const results = section.puzzles.map((puzzle) => validateMateInTwoPuzzle(puzzle));

const summary = {};
for (const result of results) {
  summary[result.status] = (summary[result.status] || 0) + 1;
}

const byBookId = {};
for (const result of results) {
  byBookId[String(result.bookId)] = {
    id: result.id,
    status: result.status,
    reason: result.reason,
  };
}

const okIds = results.filter((r) => r.status === "ok").map((r) => r.id).sort((a, b) => a - b);

fs.writeFileSync(
  AUDIT_OUT,
  JSON.stringify(
    {
      sectionId: "mate_in_2",
      generatedAt: new Date().toISOString(),
      total: results.length,
      summary,
      puzzles: results,
    },
    null,
    2
  ) + "\n"
);

fs.writeFileSync(
  STATUS_OUT,
  JSON.stringify(
    {
      sectionId: "mate_in_2",
      description: "Per-bookId repair status for mate-in-2 validation pipeline.",
      generatedAt: new Date().toISOString(),
      summary,
      byBookId,
    },
    null,
    2
  ) + "\n"
);

fs.writeFileSync(
  VERIFIED_OUT,
  JSON.stringify(
    {
      sectionId: "mate_in_2",
      description: "Puzzle IDs validated by scripts/audit-mate-in-2.mjs — full book line + board continuation.",
      generatedAt: new Date().toISOString(),
      ids: okIds,
    },
    null,
    2
  ) + "\n"
);

console.log("Mate-in-2 audit");
console.log("  total:", results.length);
for (const [status, count] of Object.entries(summary).sort()) {
  console.log(`  ${status}: ${count}`);
}
console.log(`\nWrote ${path.relative(ROOT, AUDIT_OUT)}`);
console.log(`Wrote ${path.relative(ROOT, STATUS_OUT)}`);
console.log(`Wrote ${path.relative(ROOT, VERIFIED_OUT)} (${okIds.length} verified)`);

if (!okIds.length) {
  process.exit(1);
}
