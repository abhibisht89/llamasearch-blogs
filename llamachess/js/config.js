/** Shared labels and routes for LlamaChess pages. */

export const COLLECTIONS = [
  {
    id: "polgar",
    title: "Polgar Collection",
    tag: "Tactics",
    description:
      "Susan Polgar's <em>5334 Problems, Combinations, and Games</em> — mate puzzles, miniature combinations, endgames, and tournament tactics.",
    href: "collection.html",
    kind: "puzzles",
  },
  {
    id: "watson_v1",
    title: "Watson Openings Vol. 1",
    tag: "Openings",
    description:
      "John Watson's <em>Mastering the Chess Openings, Vol. 1</em> — walk annotated lines move by move and learn why each move matters.",
    href: "watson.html",
    kind: "openings",
  },
  {
    id: "watson_v2",
    title: "Watson Openings Vol. 2",
    tag: "Openings",
    description:
      "John Watson's <em>Mastering the Chess Openings, Vol. 2</em> — 1.d4, closed games, and Indian systems with book-aligned chapters and OCR commentary.",
    href: "watson-v2.html",
    kind: "openings",
  },
  {
    id: "watson_v3",
    title: "Watson Openings Vol. 3",
    tag: "Openings",
    description:
      "John Watson's <em>Mastering the Chess Openings, Vol. 3</em> — the English Opening (1.c4), reversed Sicilians, symmetrical systems, and Hedgehog structures with interactive lessons.",
    href: "watson-v3.html",
    kind: "openings",
  },
  {
    id: "watson_v4",
    title: "Watson Openings Vol. 4",
    tag: "Openings",
    description:
      "John Watson's <em>Mastering the Chess Openings, Vol. 4</em> — Réti systems, gambits, reversed openings, irregulars, and Watson's repertoire chapters in interactive form.",
    href: "watson-v4.html",
    kind: "openings",
  },
  {
    id: "line_kitchen",
    title: "Line Kitchen",
    tag: "Repertoire",
    description:
      "Walk the lines. Cook your opponents. Interactive opening repertoires with casual move-by-move notes.",
    href: "repertoire.html",
    kind: "openings",
  },
];

/** @deprecated use COLLECTIONS[0] */
export const COLLECTION = COLLECTIONS[0];
