/**
 * Validate opening lesson JSON — checks every move step against chess.js.
 * Run: node scripts/validate-opening-lines.mjs [path-to-json]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Chess } from "../vendor/chess.js/dist/esm/chess.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const defaultPath = path.join(ROOT, "data/openings-london.json");
const targetPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultPath;

function validateLesson(lesson) {
  const issues = [];
  let chess = new Chess();
  let moveIdx = 0;

  for (let i = 0; i < lesson.steps.length; i++) {
    const step = lesson.steps[i];
    if (step.type === "intro") {
      if (step.fen !== chess.fen()) {
        issues.push({
          step: i + 1,
          kind: "intro_fen_mismatch",
          expected: chess.fen(),
          got: step.fen,
        });
      }
      continue;
    }

    if (step.type !== "move") continue;
    moveIdx += 1;

    let move;
    try {
      move = chess.move(step.san);
    } catch (error) {
      issues.push({
        step: i + 1,
        kind: "illegal_move",
        san: step.san,
        error: error.message,
      });
      break;
    }

    if (chess.fen() !== step.fen) {
      issues.push({
        step: i + 1,
        kind: "fen_mismatch",
        san: step.san,
        expected: chess.fen(),
        got: step.fen,
      });
    }

    if (move.from !== step.from || move.to !== step.to) {
      issues.push({
        step: i + 1,
        kind: "square_mismatch",
        san: step.san,
        expected: { from: move.from, to: move.to },
        got: { from: step.from, to: step.to },
      });
    }
  }

  return { ok: issues.length === 0, issues, moveCount: moveIdx };
}

const data = JSON.parse(fs.readFileSync(targetPath, "utf8"));
const results = data.lessons.map((lesson) => ({
  id: lesson.id,
  title: lesson.title,
  ...validateLesson(lesson),
}));

const failed = results.filter((r) => !r.ok);
const report = {
  file: targetPath,
  generatedAt: new Date().toISOString(),
  lessonCount: results.length,
  passCount: results.length - failed.length,
  failCount: failed.length,
  results,
};

const reportPath = targetPath.replace(/\.json$/, "_validation_report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");

console.log(`${report.passCount}/${report.lessonCount} lessons passed`);
if (failed.length) {
  for (const f of failed) {
    console.error(`FAIL #${f.id} ${f.title}`);
    for (const issue of f.issues) console.error(" ", issue);
  }
  process.exit(1);
}
