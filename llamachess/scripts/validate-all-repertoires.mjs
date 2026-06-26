/**
 * Validate every Line Kitchen repertoire JSON file.
 * Run: node scripts/validate-all-repertoires.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MANIFEST = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/repertoire-manifest.json"), "utf8")
);

let failed = 0;
for (const opening of MANIFEST.openings) {
  const file = path.join(ROOT, `data/openings-${opening.key}.json`);
  if (!fs.existsSync(file)) {
    console.error(`MISSING ${opening.key}: ${file}`);
    failed += 1;
    continue;
  }
  const result = spawnSync(
    process.execPath,
    ["scripts/validate-opening-lines.mjs", file],
    { cwd: ROOT, encoding: "utf8" }
  );
  if (result.status !== 0) {
    console.error(`FAIL ${opening.key}`);
    console.error(result.stdout);
    console.error(result.stderr);
    failed += 1;
  } else {
    const match = result.stdout.match(/(\d+)\/(\d+)/);
    console.log(`OK ${opening.key}: ${match ? match[0] : "validated"}`);
  }
}

process.exit(failed ? 1 : 0);
