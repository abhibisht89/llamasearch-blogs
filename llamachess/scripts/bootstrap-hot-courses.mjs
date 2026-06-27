/**
 * Bootstrap potluck courses from donor templates.
 * Run: node scripts/bootstrap-hot-courses.mjs
 * Then: node scripts/build-repertoire-course.mjs --all && node scripts/sync-repertoire-catalog.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Chess } from "../vendor/chess.js/dist/esm/chess.js";
import { fitLineCount, lineFromMoves } from "./repertoire-line-factory.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LINES_DIR = path.join(__dirname, "repertoire-lines");
const MANIFEST_PATH = path.join(ROOT, "data/repertoire-manifest.json");

/** @param {string[]} moves */
function validateMoves(moves, label) {
  const chess = new Chess();
  for (let i = 0; i < moves.length; i++) {
    try {
      chess.move(moves[i]);
    } catch (err) {
      throw new Error(`${label}: illegal ${moves[i]} at ply ${i + 1} — ${err.message}`);
    }
  }
  return moves;
}

async function loadDonorMoves(key) {
  const mod = await import(pathToFileURL(path.join(LINES_DIR, `${key}.mjs`)).href);
  const lines = mod.default;
  if (!Array.isArray(lines)) throw new Error(`Donor ${key} has no default export array`);
  return lines.map((l) => validateMoves([...l.moves], `${key}#${l.lineNumber}`));
}

function buildLinesFromPool(key, name, count, pool, introPrefix) {
  const unique = [];
  const seen = new Set();
  for (const moves of pool) {
    const sig = moves.join(" ");
    if (seen.has(sig)) continue;
    seen.add(sig);
    unique.push(moves);
  }
  const base = unique.map((moves, i) =>
    lineFromMoves(i + 1, key, `${name} — Line ${i + 1}`, moves, `${introPrefix} Line ${i + 1}.`, [name])
  );
  return fitLineCount(base, count, key, (n, line) => ({
    ...line,
    title: `${name} — Variation ${n}`,
    intro: `${introPrefix} Alternate line ${n}.`,
  }));
}

/** @type {Array<{key:string,slug:string,name:string,lines:number,color:'white'|'black',description:string,donors?:string[],extra?:string[][]}>} */
const HOT_COURSES = [
  {
    key: "anti-london",
    slug: "anti-london-system",
    name: "Anti-London System",
    lines: 18,
    color: "black",
    description:
      "Fight the London and Jobava — ...c5, ...Bd6, and ...Qb6 setups that take White out of comfort.",
    donors: ["qgd", "french", "caro-kann"],
    extra: [
      ["d4", "d5", "Nf3", "Nf6", "e3", "e6", "Bd3", "Bd6", "c3", "O-O", "O-O", "c5"],
      ["d4", "d5", "Bf4", "c5", "e3", "Nc6", "c3", "Nf6", "Nd2", "Qb6", "Nb3", "a5"],
      ["d4", "d5", "Bf4", "Nf6", "e3", "e6", "Nf3", "Bd6", "c3", "O-O", "Bd3", "Re8"],
      ["d4", "d5", "Bf4", "c6", "e3", "Nf6", "Nf3", "Qb6", "Qd2", "Nbd7", "c3", "e6"],
      ["d4", "d5", "Bf4", "Nf6", "e3", "g6", "Nf3", "Bf5", "c3", "e6", "Bd3", "Bxd3", "Qxd3", "c5"],
      ["d4", "d5", "Nc3", "Nf6", "Bf4", "c5", "e3", "Nc6", "Nf3", "Qb6", "a3", "e6"],
    ],
  },
  {
    key: "nimzo-indian",
    slug: "nimzo-indian-defense",
    name: "Nimzo-Indian Defense",
    lines: 20,
    color: "black",
    description:
      "Core Nimzo-Indian — 4...Bb4, ...O-O, and ...c5 plans against every white setup.",
    donors: ["qgd", "kid", "english"],
    extra: [
      ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4", "e3", "O-O", "Bd3", "d5", "Nge2", "c5"],
      ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4", "Qc2", "O-O", "a3", "Bxc3+", "Qxc3", "d5"],
      ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4", "Bd2", "O-O", "a3", "Be7", "Nf3", "d5"],
      ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4", "Nf3", "O-O", "Bg5", "h6", "Bxf6", "Qxf6"],
      ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4", "f3", "c5", "a3", "Bxc3+", "bxc3", "d5"],
      ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4", "g3", "c5", "Bg2", "O-O", "Nf3", "d5"],
    ],
  },
  {
    key: "grand-prix",
    slug: "grand-prix-attack",
    name: "Grand Prix Attack",
    lines: 15,
    color: "white",
    description: "Anti-Sicilian kingside storm — f4, Bc4, and Ng5 against ...d6 and ...Nc6.",
    donors: ["alapin", "closed-sicilian", "rossolimo"],
    extra: [
      ["e4", "c5", "Nc3", "Nc6", "f4", "d6", "Nf3", "Nf6", "Bb5", "Bd7", "O-O", "g6", "d3", "Bg7"],
      ["e4", "c5", "Nc3", "d6", "f4", "Nf6", "Nf3", "g6", "Bc4", "Bg7", "O-O", "O-O", "d3", "Nc6"],
      ["e4", "c5", "Nc3", "e6", "f4", "d5", "Nf3", "Nf6", "Bb5+", "Bd7", "e5", "Ne4", "O-O", "Nc6"],
    ],
  },
  {
    key: "alien-gambit",
    slug: "alien-gambit",
    name: "Alien Gambit",
    lines: 12,
    color: "white",
    description: "Sac a piece early vs the Caro-Kann — crush players who only know ...c6 ...d5.",
    donors: ["pressure-caro", "caro-kann"],
    extra: [
      ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Nf6", "Nxf6+", "exf6", "Bc4", "Be7", "Qh5", "g6", "Qe2"],
      ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5", "Ng3", "Bg6", "h4", "h6", "Nf3", "Nd7", "Bd3"],
    ],
  },
];

function writeLineFile(course, lines) {
  const body = lines
    .map((l) => {
      const moves = JSON.stringify(l.moves);
      const intro = l.intro.replace(/"/g, '\\"');
      return `  lineFromMoves(${l.lineNumber}, "${course.key}", "${l.title.replace(/"/g, '\\"')}", ${moves}, "${intro}", ["${course.name.replace(/"/g, '\\"')}"]),`;
    })
    .join("\n");

  const content = `import { lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION = ${JSON.stringify(course.description)};

/** Hot tier course — newest Line Kitchen additions. */
export default [
${body}
];
`;
  fs.writeFileSync(path.join(LINES_DIR, `${course.key}.mjs`), content);
}

async function buildPool(course) {
  const pool = [];
  if (course.extra) {
    for (const moves of course.extra) {
      pool.push(validateMoves(moves, `${course.key} extra`));
    }
  }
  if (course.donors) {
    for (const donor of course.donors) {
      const filePath = path.join(LINES_DIR, `${donor}.mjs`);
      if (!fs.existsSync(filePath)) {
        console.warn(`WARN: missing donor ${donor} for ${course.key}`);
        continue;
      }
      pool.push(...(await loadDonorMoves(donor)));
    }
  }
  return pool;
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const existingKeys = new Set(manifest.openings.map((o) => o.key));
  let added = 0;

  for (const course of HOT_COURSES) {
    if (existingKeys.has(course.key)) {
      console.log(`SKIP ${course.key} (already in manifest)`);
      continue;
    }
    const pool = await buildPool(course);
    if (!pool.length) {
      console.error(`FAIL ${course.key}: no move pool`);
      process.exitCode = 1;
      continue;
    }
    const lines = buildLinesFromPool(course.key, course.name, course.lines, pool, course.description);
    for (const line of lines) {
      validateMoves(line.moves, `${course.key}#${line.lineNumber}`);
    }
    writeLineFile(course, lines);
    manifest.openings.push({
      slug: course.slug,
      key: course.key,
      name: course.name,
      lines: course.lines,
      color: course.color,
      category: "potluck",
      author: "LlamaChess",
      status: "pending",
    });
    existingKeys.add(course.key);
    added += 1;
    console.log(`OK ${course.key}: ${lines.length} lines`);
  }

  manifest.updatedAt = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\nAdded ${added} potluck courses to manifest.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
