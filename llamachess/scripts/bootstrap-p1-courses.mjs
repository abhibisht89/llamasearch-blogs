/**
 * Bootstrap P1 potluck courses — strong community-demand openings.
 * Run: node scripts/bootstrap-p1-courses.mjs
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
const P1_COURSES = [
  {
    key: "bd-budapest",
    slug: "blackmar-diemer-budapest",
    name: "Blackmar-Diemer & Budapest",
    lines: 18,
    color: "white",
    description:
      "Two classic community gambits — 1.d4 d5 2.e4 and 1.d4 Nf6 2.c4 e5 for chaos before move five.",
    donors: ["danish", "englund", "vienna-gambit", "kings-gambit"],
    extra: [
      ["d4", "d5", "e4", "dxe4", "Nc3", "Nf6", "f3", "exf3", "Qxf3", "e6", "Bd3", "Be7", "h3", "O-O"],
      ["d4", "d5", "e4", "dxe4", "Nc3", "Nf6", "Bg5", "Bf5", "f3", "exf3", "Nxf3", "e6", "Bxf6", "Qxf6", "Qd2"],
      ["d4", "Nf6", "c4", "e5", "dxe5", "Ng4", "Bf4", "Nc6", "Nf3", "Bb4+", "Nc3", "Qe7", "Qd2", "Bxc3+", "Qxc3"],
      ["d4", "Nf6", "c4", "e5", "dxe5", "Ng4", "e4", "Nxe5", "f4", "Ng6", "Nf3", "Bc5", "Nc3", "O-O", "Be2"],
      ["d4", "Nf6", "c4", "e5", "dxe5", "Ng4", "Nf3", "Bc5", "e3", "Nc6", "Nc3", "Qe7", "Be2", "Ngxe5"],
    ],
  },
  {
    key: "evans-scotch-gambit",
    slug: "evans-scotch-gambit",
    name: "Evans & Scotch Gambit",
    lines: 16,
    color: "white",
    description: "Italian Evans b4 and Scotch Gambit d4 — pair with your House Menu Italian and Scotch courses.",
    donors: ["italian", "scotch", "fried-liver"],
    extra: [
      ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4", "Bxb4", "c3", "Ba5", "d4", "exd4", "O-O", "dxc3", "Qb3"],
      ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4", "Bxb4", "c3", "Bc5", "O-O", "d6", "d4", "exd4", "cxd4", "Bb6"],
      ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4", "Nf6", "O-O", "Nxe4", "Re1", "d5", "Bxd5", "Qxd5", "Nc3"],
      ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4", "Nf6", "O-O", "Nxe4", "Re1", "d5", "Bxd5", "Qxd5", "Nc3"],
    ],
  },
  {
    key: "blumenfeld-scotch",
    slug: "blumenfeld-scotch",
    name: "Blumenfeld Scotch",
    lines: 14,
    color: "white",
    description: "Scotch with ...Qb6 poison — separate from generic Scotch variations, built for club players.",
    donors: ["scotch-vars", "scotch"],
    extra: [
      ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Nf6", "Nxc6", "bxc6", "e5", "Qe7", "Be2", "Ng4", "O-O", "d5"],
      ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Qh4", "Nc3", "Bb4", "Be2", "Nf6", "Nf5", "Qh5", "g4", "Nxg4"],
      ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Bc5", "Be3", "Qf6", "c3", "Nge7", "Bc4", "d6", "O-O", "O-O"],
    ],
  },
  {
    key: "accel-dragon",
    slug: "accelerated-dragon",
    name: "Accelerated Dragon",
    lines: 18,
    color: "black",
    description: "Sicilian ...g6 ...Bg7 before ...d6 — 15–18 main lines without meme-depth bloat.",
    donors: ["sicilian", "anti-dragon", "closed-sicilian"],
    extra: [
      ["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "g6", "Nc3", "Bg7", "Be3", "Nf6", "Bc4", "O-O", "Bb3", "d6"],
      ["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "g6", "Nc3", "Bg7", "Be3", "Nf6", "f3", "O-O", "Qd2", "d6"],
      ["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "g6", "Nc3", "Bg7", "Be2", "Nf6", "Be3", "O-O", "O-O", "d6"],
      ["e4", "c5", "Nf3", "g6", "d4", "cxd4", "Nxd4", "Bg7", "Nc3", "Nc6", "Be3", "Nf6", "Bc4", "O-O", "Bb3", "d6"],
    ],
  },
  {
    key: "najdorf-starter",
    slug: "najdorf-starter",
    name: "Najdorf Starter",
    lines: 18,
    color: "black",
    description: "Core Najdorf ...a6 against 6.Be2, 6.Bg5, and English setups — a solid starter pack.",
    donors: ["sicilian", "mengarini", "rossolimo"],
    extra: [
      ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be2", "e5", "Nb3", "Be6", "O-O", "Be7"],
      ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Bg5", "e6", "f4", "Be7", "Qf3", "Qc7"],
      ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be6", "f3", "Be7"],
      ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "g3", "e5", "Nde2", "Be6", "Bg2", "Be7"],
    ],
  },
  {
    key: "dutch-defense",
    slug: "dutch-defense",
    name: "Dutch Defense",
    lines: 20,
    color: "black",
    description: "Full Dutch — Leningrad ...g6, Stonewall ...e6, and Classical ...Nf6 plans vs every white setup.",
    donors: ["anglaise", "counter-rep", "kid-random"],
    extra: [
      ["d4", "f5", "c4", "Nf6", "g3", "e6", "Bg2", "Be7", "Nf3", "O-O", "O-O", "d6", "Nc3", "Qe8"],
      ["d4", "f5", "c4", "e6", "Nf3", "Nf6", "g3", "d5", "Bg2", "c6", "O-O", "Bd6", "b3", "O-O"],
      ["d4", "f5", "g3", "Nf6", "Bg2", "g6", "Nf3", "Bg7", "O-O", "O-O", "c4", "d6", "Nc3", "Qe8"],
      ["d4", "f5", "Nf3", "Nf6", "c4", "e6", "g3", "Be7", "Bg2", "O-O", "O-O", "d6", "Nc3", "Qe8"],
      ["d4", "f5", "c4", "Nf6", "Nc3", "e6", "a3", "Be7", "Nf3", "O-O", "e3", "d6", "Be2", "Qe8"],
    ],
  },
  {
    key: "slav-semi-slav",
    slug: "slav-semi-slav",
    name: "Slav & Semi-Slav",
    lines: 18,
    color: "black",
    description: "Queen's Gambit vs the Slav — ...c6 ...d5 with ...Bf5 and Chebanenko ...a6 ideas.",
    donors: ["qgd", "agg-qgd", "caro-slav"],
    extra: [
      ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "dxc4", "a4", "Bf5", "e3", "e6", "Bxc4", "Bb4"],
      ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "e3", "Bf5", "Nc3", "e6", "Nh4", "Bg6", "Be2", "Nbd7"],
      ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "a6", "e3", "Bf5", "Bd3", "Bxd3", "Qxd3", "e6"],
      ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "e3", "e6", "Bd3", "Nbd7", "O-O", "Bd6", "Nc3", "O-O"],
    ],
  },
  {
    key: "benoni-benko",
    slug: "benoni-benko",
    name: "Benoni & Benko",
    lines: 16,
    color: "black",
    description: "Surprise d4 defenses — Modern Benoni ...c5 and Benko ...b5 with clear pawn-break plans.",
    donors: ["kid", "kid-full", "qgd"],
    extra: [
      ["d4", "Nf6", "c4", "c5", "d5", "e6", "Nc3", "exd5", "cxd5", "d6", "e4", "g6", "Nf3", "Bg7", "Be2", "O-O"],
      ["d4", "Nf6", "c4", "c5", "d5", "b5", "cxb5", "a6", "bxa6", "Bxa6", "Nc3", "d6", "e4", "Bxf1", "Kxf1", "g6"],
      ["d4", "Nf6", "c4", "c5", "d5", "b5", "Qc2", "bxc4", "e4", "d6", "Bxc4", "g6", "Ne2", "Bg7", "O-O", "O-O"],
      ["d4", "Nf6", "c4", "c5", "d5", "e6", "Nc3", "exd5", "cxd5", "d6", "e4", "g6", "Nf3", "Bg7", "Be2", "O-O"],
    ],
  },
  {
    key: "anti-jobava",
    slug: "anti-jobava",
    name: "Anti-Jobava",
    lines: 14,
    color: "black",
    description: "Counter the Jobava London — ...c5, ...Qb6, and ...e5 setups when White plays Nc3 and Bf4.",
    donors: ["qgd", "french", "anti-london"],
    extra: [
      ["d4", "Nf6", "Nc3", "d5", "Bf4", "c5", "e3", "cxd4", "exd4", "a6", "Nf3", "Nc6", "Be2", "Bf5"],
      ["d4", "Nf6", "Nc3", "d5", "Bf4", "c5", "e3", "cxd4", "exd4", "Qb6", "Rb1", "Bg4", "f3", "e6"],
      ["d4", "Nf6", "Nc3", "d5", "Bf4", "c5", "e3", "cxd4", "exd4", "e6", "Nf3", "Be7", "Bd3", "O-O"],
      ["d4", "Nf6", "Nc3", "d5", "Bf4", "Bf5", "e3", "e6", "Nf3", "c6", "Ne5", "Nbd7", "Bd3", "Bxd3"],
    ],
  },
  {
    key: "black-tournament-rep",
    slug: "black-tournament-rep",
    name: "Black Tournament Repertoire",
    lines: 22,
    color: "black",
    description: "Mega black rep — Sicilian vs 1.e4 and Nimzo/QGD vs 1.d4 in one tournament-ready bundle.",
    donors: ["sicilian", "nimzo-indian", "qgd", "caro-kann", "anti-london"],
    extra: [
      ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be2", "e5", "Nb3", "Be7"],
      ["e4", "c5", "Nf3", "Nc6", "Bb5", "g6", "O-O", "Bg7", "Re1", "e5", "Bxc6", "dxc6", "d3", "Qe7"],
      ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "O-O"],
      ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4", "e3", "O-O", "Bd3", "d5", "Nge2", "c5"],
      ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5", "Be7", "e3", "O-O", "Nf3", "Nbd7", "Rc1", "c6"],
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

/** Potluck course — P1 community-demand batch. */
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
  const today = new Date().toISOString().slice(0, 10);

  for (const course of P1_COURSES) {
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
      updatedAt: today,
      status: "pending",
    });
    existingKeys.add(course.key);
    added += 1;
    console.log(`OK ${course.key}: ${lines.length} lines`);
  }

  manifest.updatedAt = today;
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\nAdded ${added} P1 potluck courses to manifest.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
