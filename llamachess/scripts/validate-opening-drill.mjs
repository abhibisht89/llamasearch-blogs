/**
 * Validate all Line Kitchen openings for drill mode:
 * - every move step has actor (user/opponent)
 * - moves replay legally with chess.js
 * - actor matches lesson orientation
 *
 * Run: node scripts/validate-opening-drill.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Chess } from "../vendor/chess.js/dist/esm/chess.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/repertoire-manifest.json"), "utf8")
);

function fenBefore(steps, index) {
  for (let j = index - 1; j >= 0; j--) {
    if (steps[j].fen) return steps[j].fen;
  }
  return START_FEN;
}

function expectedActor(step, playerSide) {
  if (step.actor === "user" || step.actor === "opponent") return step.actor;
  const mover = step.turn === "w" ? "b" : "w";
  return mover === playerSide ? "user" : "opponent";
}

function validateOpening(key) {
  const filePath = path.join(ROOT, `data/openings-${key}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const errors = [];

  for (const lesson of data.lessons) {
    const playerSide = lesson.orientation === "black" ? "b" : "w";
    const start = lesson.steps[0]?.type === "intro" ? 1 : 0;
    const chess = new Chess(fenBefore(lesson.steps, start));

    for (let i = start; i < lesson.steps.length; i++) {
      const step = lesson.steps[i];
      if (step.type !== "move") continue;

      if (!step.actor) {
        errors.push({ lessonId: lesson.id, step: i, msg: "missing actor" });
        break;
      }

      const actor = expectedActor(step, playerSide);
      if (step.actor !== actor) {
        errors.push({
          lessonId: lesson.id,
          step: i,
          msg: `actor mismatch: ${step.actor} vs ${actor} (${step.san})`,
        });
      }

      try {
        chess.move(step.san);
      } catch (err) {
        errors.push({
          lessonId: lesson.id,
          step: i,
          msg: `illegal ${step.san}: ${err.message}`,
        });
        break;
      }
    }
  }

  return { key, lessons: data.lessons.length, errors };
}

let failed = 0;
for (const opening of manifest.openings) {
  const result = validateOpening(opening.key);
  if (result.errors.length) {
    failed += 1;
    console.error(`FAIL ${result.key}:`, result.errors.slice(0, 3));
  } else {
    console.log(`OK   ${result.key} (${result.lessons} lines)`);
  }
}

if (failed) {
  console.error(`\n${failed} opening(s) failed drill validation`);
  process.exit(1);
}

console.log(`\nAll ${manifest.openings.length} openings pass drill validation`);
