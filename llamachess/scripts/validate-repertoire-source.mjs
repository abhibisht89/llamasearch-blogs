/**
 * Validate all scripts/repertoire-lines/*.mjs move arrays with chess.js.
 * Run: node scripts/validate-repertoire-source.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Chess } from "../vendor/chess.js/dist/esm/chess.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LINES_DIR = path.join(__dirname, "repertoire-lines");
const MANIFEST = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/repertoire-manifest.json"), "utf8")
);

function validateMoves(moves, label) {
  const chess = new Chess();
  for (let i = 0; i < moves.length; i++) {
    try {
      chess.move(moves[i]);
    } catch (err) {
      throw new Error(`${label} illegal at ply ${i + 1} (${moves[i]}): ${err.message}`);
    }
  }
  return moves.length;
}

const expected = Object.fromEntries(MANIFEST.openings.map((o) => [o.key, o.lines]));
const files = fs.readdirSync(LINES_DIR).filter((f) => f.endsWith(".mjs")).sort();
let failed = 0;

for (const file of files) {
  const key = file.replace(/\.mjs$/, "");
  const mod = await import(pathToFileURL(path.join(LINES_DIR, file)).href);
  const lines = mod.default;
  if (!Array.isArray(lines)) {
    console.error(`FAIL ${file}: default export is not an array`);
    failed += 1;
    continue;
  }

  const want = expected[key];
  if (want != null && lines.length !== want) {
    console.error(`FAIL ${file}: ${lines.length} lines, expected ${want}`);
    failed += 1;
  }

  for (const line of lines) {
    try {
      validateMoves(line.moves, `${file} #${line.lineNumber} ${line.title}`);
    } catch (err) {
      console.error(`FAIL ${err.message}`);
      failed += 1;
    }
  }

  if (want == null || lines.length === want) {
    console.log(`OK ${file}: ${lines.length} lines`);
  }
}

process.exit(failed ? 1 : 0);
