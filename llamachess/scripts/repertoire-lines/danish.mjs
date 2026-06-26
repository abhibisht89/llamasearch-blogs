import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION = "The Danish Gambit (1.e4 e5 2.d4 exd4 3.c3) — 15 wild sacrificial lines.";

export default [
  mkLine(
    1,
    "danish_1",
    "The Danish Gambit — Main",
    "Line #1",
    "Core The Danish Gambit (1.e4 e5 2.d4 exd4 3.c3) line.",
    ["e4", "e5", "d4", "exd4", "c3", "Nc6", "Bd2", "Bb4", "Qf3", "a6", "Bg5", "Na5", "Bd2", "Nb3", "g4", "Ke7", "Ke2", "Na5"],
    ["Play e4 — your move here.", "Black plays e5.", "Play d4 — your move here.", "Black plays exd4.", "Play c3 — your move here.", "Black plays Nc6.", "Play Bd2 — your move here.", "Black plays Bb4.", "Play Qf3 — your move here.", "Black plays a6.", "Play Bg5 — your move here.", "Black plays Na5.", "Play Bd2 — your move here.", "Black plays Nb3.", "Play g4 — your move here.", "Black plays Ke7.", "Play Ke2 — your move here.", "Black plays Na5."],
    ["The Danish Gambit"]
  ),
  mkLine(
    2,
    "danish_2",
    "The Danish Gambit — Line 2",
    "Line #2",
    "Important branch 2.",
    ["e4", "e5", "d4", "exd4", "c3", "Na6", "Be3", "Nf6", "b4", "Rb8", "f4", "h6", "Qd2", "Ng4", "Nh3", "Ke7", "Ng5", "Nf6"],
    ["Play e4 — your move here.", "Black plays e5.", "Play d4 — your move here.", "Black plays exd4.", "Play c3 — your move here.", "Black plays Na6.", "Play Be3 — your move here.", "Black plays Nf6.", "Play b4 — your move here.", "Black plays Rb8.", "Play f4 — your move here.", "Black plays h6.", "Play Qd2 — your move here.", "Black plays Ng4.", "Play Nh3 — your move here.", "Black plays Ke7.", "Play Ng5 — your move here.", "Black plays Nf6."],
    ["The Danish Gambit"]
  ),
  lineFromMoves(
    3,
    "danish",
    "Danish — Line 3",
    ["e4", "e5", "d4", "exd4", "c3", "Qe7", "Bf4", "Qd8", "Bc1", "f5", "Na3", "fxe4", "Bf4", "Bb4", "Ne2", "e3", "g3", "Qh4"],
    "Branch 3 — know this line.",
    ["The Danish Gambit"]
  ),
  lineFromMoves(
    4,
    "danish",
    "Danish — Line 4",
    ["e4", "e5", "d4", "exd4", "c3", "Qf6", "Bg5", "Nc6", "b3", "Ke7", "h4", "Qxg5", "f3", "Nb4", "a4", "a6", "Ra2", "Nh6"],
    "Branch 4 — know this line.",
    ["The Danish Gambit"]
  ),
  lineFromMoves(
    5,
    "danish",
    "Danish — Line 5",
    ["e4", "e5", "d4", "exd4", "c3", "Qg5", "Qa4", "Qe3+", "Ne2", "Ke7", "Qd1", "b5", "a4", "Qxc3+", "Nd2", "Qc5", "Rg1", "a6"],
    "Branch 5 — know this line.",
    ["The Danish Gambit"]
  ),
  lineFromMoves(
    6,
    "danish",
    "Danish — Line 6",
    ["e4", "e5", "d4", "exd4", "c3", "Qh4", "Qe2", "Qf4", "Qd3", "Qh4", "Be2", "Nc6", "Bd2", "Na5", "Be3", "Qf6", "Nd2", "Qf4"],
    "Branch 6 — know this line.",
    ["The Danish Gambit"]
  ),
  lineFromMoves(
    7,
    "danish",
    "Danish — Line 7",
    ["e4", "e5", "d4", "exd4", "c3", "Ke7", "Qb3", "c6", "g3", "h5", "g4", "dxc3", "Qd5", "g5", "Bf4", "c2", "Qd1", "d6"],
    "Branch 7 — know this line.",
    ["The Danish Gambit"]
  ),
  lineFromMoves(
    8,
    "danish",
    "Danish — Line 8",
    ["e4", "e5", "d4", "exd4", "c3", "Be7", "Qa4", "Na6", "f3", "Bb4", "Bd3", "c6", "Bh6", "Ba3", "Qxa6", "Bb4", "h3", "Bd6"],
    "Branch 8 — know this line.",
    ["The Danish Gambit"]
  ),
  lineFromMoves(
    9,
    "danish",
    "Danish — Line 9",
    ["e4", "e5", "d4", "exd4", "c3", "Bd6", "Qd2", "c6", "a4", "b6", "Qxd4", "Bb4", "Qf6", "Nh6", "Bd3", "d6", "g4", "Ba5"],
    "Branch 9 — know this line.",
    ["The Danish Gambit"]
  ),
  lineFromMoves(
    10,
    "danish",
    "Danish — Line 10",
    ["e4", "e5", "d4", "exd4", "c3", "Bc5", "Qd3", "h6", "Nd2", "Qg5", "Qb5", "a6", "h3", "Kd8", "Bc4", "Nf6", "g3", "Be7"],
    "Branch 10 — know this line.",
    ["The Danish Gambit"]
  ),
  lineFromMoves(
    11,
    "danish",
    "Danish — Line 11",
    ["e4", "e5", "d4", "exd4", "c3", "Bb4", "Qh5", "Bc5", "Qd5", "Na6", "Qxd4", "f6", "e5", "Nb8", "Bb5", "Be7", "Be2", "h5"],
    "Branch 11 — know this line.",
    ["The Danish Gambit"]
  ),
  lineFromMoves(
    12,
    "danish",
    "Danish — Line 12",
    ["e4", "e5", "d4", "exd4", "c3", "Ba3", "Qg4", "f5", "h3", "g5", "Nf3", "a5", "Bb5", "Na6", "Bf1", "d5", "Be2", "fxg4"],
    "Branch 12 — know this line.",
    ["The Danish Gambit"]
  ),
  lineFromMoves(
    13,
    "danish",
    "Danish — Line 13",
    ["e4", "e5", "d4", "exd4", "c3", "Nh6", "Qf3", "Nf5", "Kd2", "h5", "Qxh5", "Ne3", "Qg5", "a6", "Qh4", "g5", "Bb5", "Nc2"],
    "Branch 13 — know this line.",
    ["The Danish Gambit"]
  ),
  lineFromMoves(
    14,
    "danish",
    "Danish — Line 14",
    ["e4", "e5", "d4", "exd4", "c3", "Nf6", "Qg4", "Na6", "b4", "h6", "Qe2", "Ng4", "Qd1", "Rh7", "Bc4", "h5", "e5", "f6"],
    "Branch 14 — know this line.",
    ["The Danish Gambit"]
  ),
  lineFromMoves(
    15,
    "danish",
    "Danish — Line 15",
    ["e4", "e5", "d4", "exd4", "c3", "Ne7", "Qh5", "b6", "Qd5", "d6", "Qg5", "a5", "Qxe7+", "Bxe7", "h4", "Na6", "Nd2", "Bg5"],
    "Branch 15 — know this line.",
    ["The Danish Gambit"]
  ),
];
