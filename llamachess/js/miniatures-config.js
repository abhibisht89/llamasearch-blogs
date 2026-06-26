/** Shared config for all six Polgar miniature chapters (600 puzzles). */

export const MINIATURE_CHAPTERS = [
  {
    slug: "f3_f6",
    id: "miniature_f3_f6",
    title: "f3 / f6",
    subtitle: "100 combinations",
    dataFile: "miniature_f3_f6.json",
    targets: ["f3", "f6"],
    bookRange: [4463, 4562],
  },
  {
    slug: "g3_g6",
    id: "miniature_g3_g6",
    title: "g3 / g6",
    subtitle: "100 combinations",
    dataFile: "miniature_g3_g6.json",
    targets: ["g3", "g6"],
    bookRange: [4563, 4662],
  },
  {
    slug: "e3_e6",
    id: "miniature_e3_e6",
    title: "e3 / e6",
    subtitle: "100 combinations",
    dataFile: "miniature_e3_e6.json",
    targets: ["e3", "e6"],
    bookRange: [4663, 4762],
  },
  {
    slug: "f2_f7",
    id: "miniature_f2_f7",
    title: "f2 / f7",
    subtitle: "100 combinations",
    dataFile: "miniature_f2_f7.json",
    targets: ["f2", "f7"],
    bookRange: [4763, 4862],
  },
  {
    slug: "g2_g7",
    id: "miniature_g2_g7",
    title: "g2 / g7",
    subtitle: "100 combinations",
    dataFile: "miniature_g2_g7.json",
    targets: ["g2", "g7"],
    bookRange: [4863, 4962],
  },
  {
    slug: "h2_h7",
    id: "miniature_h2_h7",
    title: "h2 / h7",
    subtitle: "100 combinations",
    dataFile: "miniature_h2_h7.json",
    targets: ["h2", "h7"],
    bookRange: [4963, 5062],
  },
];

export function getChapter(slug) {
  const chapter = MINIATURE_CHAPTERS.find((c) => c.slug === slug);
  if (!chapter) throw new Error(`Unknown miniature chapter: ${slug}`);
  return chapter;
}

export function chapterDataUrl(chapter) {
  return `data/sections/${chapter.dataFile}`;
}

/** True when the puzzle has a stored multi-move line for the full-line solver. */
export function hasFullCombinationLine(puzzle) {
  return Array.isArray(puzzle.solutionMoves) && puzzle.solutionMoves.length >= 2;
}

export function filterPlayableMiniatures(section, verifiedIds) {
  const ids = verifiedIds instanceof Set ? verifiedIds : new Set(verifiedIds || []);
  const puzzles = section.puzzles.filter((p) => ids.has(p.id) && hasFullCombinationLine(p));
  return {
    ...section,
    available: puzzles.length,
    puzzles,
  };
}
