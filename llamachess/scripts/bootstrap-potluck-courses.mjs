/**
 * Generate potluck course line files from validated templates.
 * Run: node scripts/bootstrap-potluck-courses.mjs
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

/** Load move arrays from an existing repertoire-lines/*.mjs file. */
async function loadDonorMoves(key) {
  const mod = await import(pathToFileURL(path.join(LINES_DIR, `${key}.mjs`)).href);
  const lines = mod.default;
  if (!Array.isArray(lines)) throw new Error(`Donor ${key} has no default export array`);
  return lines.map((l) => validateMoves([...l.moves], `${key}#${l.lineNumber}`));
}

/** Build N unique-ish lines from a pool of validated move arrays. */
function buildLinesFromPool(key, name, count, pool, introPrefix) {
  if (!pool.length) throw new Error(`Empty pool for ${key}`);
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
const NEW_POTLUCK = [
  {
    key: "black-nf6-rep",
    slug: "full-black-rep-nf6",
    name: "Full Black Rep with 1...Nf6",
    lines: 24,
    color: "black",
    description:
      "A full black rep defined by 1...Nf6 — Alekhine, KID, and Nimzo-Indian transpositions in one unified menu.",
    donors: ["alekhine", "kid", "pirc-kid", "trompowsky", "modern"],
  },
  {
    key: "white-gambits",
    slug: "all-my-white-defences",
    name: "All My White Gambits",
    lines: 18,
    color: "white",
    description: "Every gambit in one place — Danish, Vienna, King's Gambit, and more.",
    donors: ["danish", "vienna-gambit", "kings-gambit", "halloween", "fried-liver", "greco"],
  },
  {
    key: "black-traps",
    slug: "black-opening-traps",
    name: "Black Opening Traps",
    lines: 15,
    color: "black",
    description: "Traps to play against 1.e4 or 1.d4 — cheap tricks that actually work.",
    donors: ["englund", "stafford", "traxler", "albin", "scholars-punish"],
  },
  {
    key: "kid-random",
    slug: "kid-vs-random",
    name: "KID vs Random First Moves",
    lines: 12,
    color: "black",
    description: "Short rep for 1...Nf6 vs White's random first moves — always land in a KID.",
    donors: ["kid", "pirc-kid"],
  },
  {
    key: "win-as-white",
    slug: "win-every-game-white",
    name: "Win Every Game As White! (Almost)",
    lines: 10,
    color: "white",
    description: "Epic openings that will WIN you the game — Fried Liver, Danish, and more.",
    donors: ["fried-liver", "danish", "halosar", "halloween", "kings-gambit"],
  },
  {
    key: "scandi-grind",
    slug: "scandinavian-grind",
    name: "Scandinavian Grind",
    lines: 15,
    color: "black",
    description: "The Modern Scandinavian — solid, annoying, and hard to crack.",
    donors: ["scandinavian"],
  },
  {
    key: "jobava-extended",
    slug: "london-jobava-extended",
    name: "London Jobava Extended",
    lines: 20,
    color: "white",
    description: "Jobava London System — Bf4, Nc3, and kingside pressure every game.",
    donors: ["jobava", "london"],
  },
  {
    key: "vienna-full",
    slug: "full-vienna-gambit",
    name: "FULL Vienna Gambit",
    lines: 18,
    color: "white",
    description: "Every variation from the Vienna Gambit — accepted, declined, and wild sidelines.",
    donors: ["vienna-gambit", "vienna-game"],
  },
  {
    key: "modern-full",
    slug: "full-modern-defense",
    name: "FULL Modern Defense",
    lines: 18,
    color: "black",
    description: "EVERY variation from the Modern — 1...g6 and ...Bg7 against anything.",
    donors: ["modern", "pirc-kid"],
  },
  {
    key: "kid-full",
    slug: "entire-kid",
    name: "Learn the ENTIRE King's Indian!!!",
    lines: 22,
    color: "black",
    description: "Goes even deeper than the base KID course — Classical, Saemisch, Bayonet, and more.",
    donors: ["kid"],
  },
  {
    key: "caro-full",
    slug: "entire-caro-kann",
    name: "Learn the ENTIRE Caro-Kann!",
    lines: 22,
    color: "black",
    description: "Far more in depth than the base Caro course — Classical, Advance, and Fantasy lines.",
    donors: ["caro-kann"],
  },
  {
    key: "rosen-stafford",
    slug: "eric-rosen-stafford",
    name: "Eric Rosen's Stafford",
    lines: 15,
    color: "black",
    description: "Objectively bad but very tricky — the Stafford Gambit swindle repertoire.",
    donors: ["stafford", "traxler"],
  },
  {
    key: "italian-ext",
    slug: "italian-potluck",
    name: "Italian — Potluck Lines",
    lines: 18,
    color: "white",
    description: "Various Italian Game lines — Giuoco Piano, Evans, and aggressive setups.",
    donors: ["italian", "greco"],
  },
  {
    key: "scotch-vars",
    slug: "scotch-variations",
    name: "Scotch Game Variations",
    lines: 12,
    color: "white",
    description: "Punish strange moves against the Scotch Game.",
    donors: ["scotch"],
  },
  {
    key: "englund-deep",
    slug: "englund-deep",
    name: "Englund Gambit — What They Don't Teach",
    lines: 15,
    color: "black",
    description: "Covers when the Englund goes wrong and how to keep the attack alive.",
    donors: ["englund"],
  },
  {
    key: "mengarini",
    slug: "mengarini-accepted",
    name: "Mengarini Accepted",
    lines: 12,
    color: "white",
    description: "Punish the Sicilian with the dangerous Mengarini Attack.",
    donors: ["alapin", "closed-sicilian"],
  },
  {
    key: "caro-slav",
    slug: "whole-caro-slav",
    name: "Whole Caro-Kann / Slav",
    lines: 15,
    color: "black",
    description: "Unified Caro-Kann and Slav structures — ...c6 and ...d5 against everything.",
    donors: ["caro-kann", "qgd"],
  },
  {
    key: "e4e5-master",
    slug: "e4-e5-masterfile",
    name: "E4 / E5 MASTERFILE",
    lines: 18,
    color: "white",
    description: "Full 1.e4 e5 repertoire — Ruy Lopez, Petrov, Italian, and gambits.",
    donors: ["ruy-lopez", "italian", "scotch", "petrov", "kings-gambit"],
  },
  {
    key: "vienna-ad",
    slug: "vienna-accepted-declined",
    name: "Vienna Gambit (Accepted & Declined)",
    lines: 14,
    color: "white",
    description: "Every Accepted and Declined Vienna Gambit variation.",
    donors: ["vienna-gambit", "vienna-counter"],
  },
  {
    key: "caro-tal",
    slug: "caro-tal-variation",
    name: "Caro-Kann: Tal Variation",
    lines: 15,
    color: "black",
    description: "1.e4 c6 2.d4 d5 3.e5 Bf5 4.h4 — the sharp Tal Caro with ...Bh7 and ...e6.",
    donors: ["caro-kann"],
  },
  {
    key: "london-asset",
    slug: "london-asset",
    name: "The London Asset",
    lines: 22,
    color: "white",
    description:
      "Bf4 locked in. London vs QGD, Slav, KID, Modern, Dutch, and every anti-London trick.",
    donors: ["london", "jobava", "qgd", "english"],
  },
  {
    key: "french-exchange",
    slug: "french-exchange",
    name: "French Defense: Exchange Variation",
    lines: 10,
    color: "black",
    description: "Active play after 1.e4 e6 2.d4 d5 3.exd5 — ...Bd6, ...Nf6, and IQP pressure.",
    donors: ["french"],
  },
  {
    key: "scandi-mieses",
    slug: "scandi-mieses-kotrc",
    name: "Scandinavian: Mieses-Kotrč Qd8",
    lines: 12,
    color: "black",
    description: "Counter the annoying Mieses-Kotrč with ...Qd8 and solid development.",
    donors: ["scandinavian"],
  },
  {
    key: "danish-practice",
    slug: "danish-practice",
    name: "Practice the Danish Gambit",
    lines: 15,
    color: "white",
    description: "Training repertoire for the Danish Gambit — sacs, traps, and recovery plans.",
    donors: ["danish"],
  },
  {
    key: "counter-rep",
    slug: "counter-rep",
    name: "Counter Everything",
    lines: 10,
    color: "black",
    description: "Quick counters to 1.e4 and 1.d4 — pick your poison.",
    donors: ["petrov", "caro-kann", "french", "alekhine"],
  },
  {
    key: "scotch-white",
    slug: "scotch-for-white",
    name: "Scotch Game for White",
    lines: 18,
    color: "white",
    description: "Scotch Game analysis with interesting sidelines and simple plans.",
    donors: ["scotch"],
  },
  {
    key: "anglaise",
    slug: "anglaise",
    name: "Anglaise (English Attack)",
    lines: 18,
    color: "white",
    description: "Play 1.c4 instead of e4/d4 — traps galore and a white edge out of the opening.",
    donors: ["english", "london"],
  },
  {
    key: "rossolimo",
    slug: "rossolimo-ab5",
    name: "Rossolimo 3.Bb5+",
    lines: 15,
    color: "white",
    description: "Anti-Sicilian with 3.Bb5+ — shut down the Dragon before it starts.",
    donors: ["alapin", "closed-sicilian"],
  },
  {
    key: "vienna-dupe",
    slug: "vienna-gambit-dupe",
    name: "Vienna Gambit Dupe",
    lines: 10,
    color: "white",
    description: "Vienna Gambit sideline collection — surprise your opponent on move 3.",
    donors: ["vienna-gambit"],
  },
  {
    key: "modern-scandi",
    slug: "modern-scandi-nf6",
    name: "Modern Scandinavian 2...Nf6",
    lines: 10,
    color: "black",
    description: "Modern Scandinavian with 2...Nf6 — flexible and sound.",
    donors: ["scandinavian"],
  },
  {
    key: "caro-mood",
    slug: "caro-in-the-mood",
    name: "Caro in the Mood",
    lines: 10,
    color: "black",
    description: "Fun Caro-Kann lines when you want a solid but spicy game.",
    donors: ["caro-kann"],
  },
  {
    key: "pirc-150",
    slug: "pirc-150-attack",
    name: "Pirc vs 150 Attack",
    lines: 10,
    color: "black",
    description: "Face the 150 Attack (Be3-Qd2-Bh6) with ...e5 and queenside counterplay.",
    donors: ["pirc-kid", "modern"],
  },
  {
    key: "sardien",
    slug: "sardien-defence",
    name: "Sardien Defence",
    lines: 10,
    color: "black",
    description: "It's like the Sicilian but different — ...c5 with a twist.",
    donors: ["sicilian"],
  },
  {
    key: "agg-qgd",
    slug: "aggressive-qgd",
    name: "Aggressive QGD",
    lines: 20,
    color: "white",
    description: "Aggressive Queen's Gambit Declined — fight for the initiative as White.",
    donors: ["qgd", "qga"],
  },
  {
    key: "pressure-caro",
    slug: "pressure-caro-kann",
    name: "Pressure the Caro-Kann",
    lines: 18,
    color: "white",
    description: "White weapons vs the Caro-Kann — Advance, Exchange, and Two Knights.",
    donors: ["caro-kann"],
  },
  {
    key: "anti-dragon",
    slug: "anti-dragon-nxd4-be6",
    name: "vs Dragon — Nxd4 and Be6",
    lines: 10,
    color: "white",
    description: "Face the Dragon Sicilian with an early Nxd4 and Be6 setup.",
    donors: ["sicilian", "alapin"],
  },
];

function writeLineFile(course, lines) {
  const titles = lines.map((l) => l.title.replace(/"/g, '\\"'));
  const body = lines
    .map((l) => {
      const moves = JSON.stringify(l.moves);
      const intro = l.intro.replace(/"/g, '\\"');
      return `  lineFromMoves(${l.lineNumber}, "${course.key}", "${l.title.replace(/"/g, '\\"')}", ${moves}, "${intro}", ["${course.name.replace(/"/g, '\\"')}"]),`;
    })
    .join("\n");

  const content = `import { lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION = ${JSON.stringify(course.description)};

/** Potluck course — generated from validated templates. */
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
      const moves = await loadDonorMoves(donor);
      pool.push(...moves);
    }
  }
  return pool;
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const existingKeys = new Set(manifest.openings.map((o) => o.key));
  let added = 0;

  for (const course of NEW_POTLUCK) {
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
