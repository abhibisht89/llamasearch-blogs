/** chess.js FEN checks — stricter than export-time python-chess alone. */

import { Chess } from "chess.js";

export function isLoadableFen(fen) {
  try {
    new Chess(fen);
    return true;
  } catch {
    return false;
  }
}

export function isLoadablePuzzle(puzzle) {
  return Boolean(puzzle?.fen && isLoadableFen(puzzle.fen));
}

export function loadablePuzzles(section) {
  return section.puzzles.filter(isLoadablePuzzle);
}

/** Nearest loadable sequential id, preferring id then next, then prev. */
export function resolveLoadablePuzzle(section, puzzleId) {
  const loadable = loadablePuzzles(section);
  if (!loadable.length) return null;

  const byId = new Map(loadable.map((p) => [p.id, p]));
  if (byId.has(puzzleId)) return byId.get(puzzleId);

  const ids = loadable.map((p) => p.id).sort((a, b) => a - b);
  const next = ids.find((id) => id >= puzzleId);
  if (next != null) return byId.get(next);

  return byId.get(ids[ids.length - 1]);
}

export function sortedLoadableIds(section) {
  return loadablePuzzles(section)
    .map((p) => p.id)
    .sort((a, b) => a - b);
}

export function nextPrevLoadableIds(section, currentId) {
  const ids = sortedLoadableIds(section);
  const idx = ids.indexOf(currentId);
  return {
    prev: idx > 0 ? ids[idx - 1] : null,
    next: idx < ids.length - 1 ? ids[idx + 1] : null,
  };
}

export function firstUnsolvedLoadableId(section, progress, sectionId) {
  const ids = sortedLoadableIds(section);
  for (const id of ids) {
    if (!progress.isSolved(sectionId, id)) return id;
  }
  return ids[0] ?? null;
}
