/** Load Sisters Tournament Combinations section data (isolated from puzzles.json). */

const VERIFIED_IDS_URL = "data/sections/sisters_verified_ids.json";

let _cache = null;

async function filterVerified(section) {
  const verifiedRes = await fetch(VERIFIED_IDS_URL, { cache: "no-store" });
  if (!verifiedRes.ok) return section;

  const verified = await verifiedRes.json();
  const verifiedIds = new Set(verified.ids || []);
  const puzzles = section.puzzles.filter((p) => verifiedIds.has(p.id));

  return {
    ...section,
    available: puzzles.length,
    puzzles,
  };
}

export async function loadSectionData() {
  if (_cache) return _cache;
  const res = await fetch("data/sections/sisters.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load data/sections/sisters.json");
  const section = await res.json();
  _cache = await filterVerified(section);
  return _cache;
}

export async function getSection() {
  return loadSectionData();
}

export async function getPuzzle(puzzleId) {
  const section = await loadSectionData();
  const id = Number(puzzleId);
  const puzzle = section.puzzles.find((p) => p.id === id);
  if (!puzzle) throw new Error(`Puzzle #${id} not found in sisters`);
  return { section, puzzle };
}

export function sortedPuzzleIds(section) {
  return section.puzzles.map((p) => p.id).sort((a, b) => a - b);
}

export function nextPrevIds(section, currentId) {
  const ids = sortedPuzzleIds(section);
  const idx = ids.indexOf(currentId);
  return {
    prev: idx > 0 ? ids[idx - 1] : null,
    next: idx < ids.length - 1 ? ids[idx + 1] : null,
  };
}

export function firstUnsolvedId(section, progress) {
  const ids = sortedPuzzleIds(section);
  for (const id of ids) {
    if (!progress.isSolved(section.id, id)) return id;
  }
  return ids[0] ?? null;
}
