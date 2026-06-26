/** Load puzzle data and expose helpers. */

let _cache = null;
const _sectionCache = new Map();

export async function loadData() {
  if (_cache) return _cache;
  const res = await fetch("data/puzzles.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load puzzles.json");
  _cache = await res.json();
  return _cache;
}

export async function getSection(sectionId) {
  if (_sectionCache.has(sectionId)) return _sectionCache.get(sectionId);

  const data = await loadData();
  let section = data.sections.find((s) => s.id === sectionId);

  // Larger sections live in data/sections/{id}.json (mate_in_2, mate_in_3, …).
  if (!section) {
    const res = await fetch(`data/sections/${sectionId}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Unknown section: ${sectionId}`);
    section = await res.json();
  }

  _sectionCache.set(sectionId, section);
  return section;
}

export async function getPuzzle(sectionId, puzzleId) {
  const section = await getSection(sectionId);
  const id = Number(puzzleId);
  const puzzle = section.puzzles.find((p) => p.id === id);
  if (!puzzle) throw new Error(`Puzzle #${id} not found in ${sectionId}`);
  return { section, puzzle };
}

export function puzzleMap(section) {
  const map = new Map();
  for (const p of section.puzzles) map.set(p.id, p);
  return map;
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
