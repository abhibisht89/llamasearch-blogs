import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION = "The Scotch Game (1.e4 e5 2.Nf3 Nc6 3.d4) — 27 open tactical lines.";

export default [
  mkLine(
    1,
    "scotch_1",
    "The Scotch Game — Main",
    "Line #1",
    "Core The Scotch Game (1.e4 e5 2.Nf3 Nc6 3.d4) line.",
    ["e4", "e5", "Nf3", "Nc6", "d4", "Rb8", "Nbd2", "Nge7", "c4", "b5", "c5", "Rg8", "a4", "Nb4", "Nb1", "Bb7", "Bd3", "Rh8"],
    ["Play e4 — your move here.", "Black plays e5.", "Play Nf3 — your move here.", "Black plays Nc6.", "Play d4 — your move here.", "Black plays Rb8.", "Play Nbd2 — your move here.", "Black plays Nge7.", "Play c4 — your move here.", "Black plays b5.", "Play c5 — your move here.", "Black plays Rg8.", "Play a4 — your move here.", "Black plays Nb4.", "Play Nb1 — your move here.", "Black plays Bb7.", "Play Bd3 — your move here.", "Black plays Rh8."],
    ["The Scotch Game"]
  ),
  mkLine(
    2,
    "scotch_2",
    "The Scotch Game — Line 2",
    "Line #2",
    "Important branch 2.",
    ["e4", "e5", "Nf3", "Nc6", "d4", "Qe7", "Bd2", "Qe6", "Qe2", "Qh6", "d5", "Nf6", "dxc6", "Qxd2+", "Nfxd2", "Kd8", "Qf3", "Bb4"],
    ["Play e4 — your move here.", "Black plays e5.", "Play Nf3 — your move here.", "Black plays Nc6.", "Play d4 — your move here.", "Black plays Qe7.", "Play Bd2 — your move here.", "Black plays Qe6.", "Play Qe2 — your move here.", "Black plays Qh6.", "Play d5 — your move here.", "Black plays Nf6.", "Play dxc6 — your move here.", "Black plays Qxd2+.", "Play Nfxd2 — your move here.", "Black plays Kd8.", "Play Qf3 — your move here.", "Black plays Bb4."],
    ["The Scotch Game"]
  ),
  mkLine(
    3,
    "scotch_3",
    "The Scotch Game — Line 3",
    "Line #3",
    "Important branch 3.",
    ["e4", "e5", "Nf3", "Nc6", "d4", "Qf6", "Be3", "Ke7", "Nc3", "Qh4", "b4", "Kd8", "Qd2", "Qg4", "Bc4", "Qxf3", "Qd3", "Qf6"],
    ["Play e4 — your move here.", "Black plays e5.", "Play Nf3 — your move here.", "Black plays Nc6.", "Play d4 — your move here.", "Black plays Qf6.", "Play Be3 — your move here.", "Black plays Ke7.", "Play Nc3 — your move here.", "Black plays Qh4.", "Play b4 — your move here.", "Black plays Kd8.", "Play Qd2 — your move here.", "Black plays Qg4.", "Play Bc4 — your move here.", "Black plays Qxf3.", "Play Qd3 — your move here.", "Black plays Qf6."],
    ["The Scotch Game"]
  ),
  lineFromMoves(
    4,
    "scotch",
    "Scotch — Line 4",
    ["e4", "e5", "Nf3", "Nc6", "d4", "Qg5", "Qd2", "Qh4", "Kd1", "Qe7", "Na3", "Nf6", "Ke1", "h5", "Nb5", "exd4", "Qc3", "Qd6"],
    "Branch 4 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    5,
    "scotch",
    "Scotch — Line 5",
    ["e4", "e5", "Nf3", "Nc6", "d4", "Qh4", "Qd2", "Qh3", "Be2", "Qxf3", "Kf1", "h6", "Qb4", "Qxe4", "f4", "Qxd4", "Qxf8+", "Kxf8"],
    "Branch 5 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    6,
    "scotch",
    "Scotch — Line 6",
    ["e4", "e5", "Nf3", "Nc6", "d4", "Ke7", "Bh6", "d6", "Nc3", "Bg4", "b3", "Na5", "Rb1", "Bc8", "Rc1", "Nxh6", "Nb5", "g6"],
    "Branch 6 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    7,
    "scotch",
    "Scotch — Line 7",
    ["e4", "e5", "Nf3", "Nc6", "d4", "Be7", "Qd2", "h5", "Kd1", "Kf8", "Ke1", "d6", "dxe5", "Nh6", "g4", "Bf5", "g5", "Bc8"],
    "Branch 7 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    8,
    "scotch",
    "Scotch — Line 8",
    ["e4", "e5", "Nf3", "Nc6", "d4", "Bd6", "Qd3", "Nb8", "c4", "Kf8", "Bh6", "Qh4", "Kd1", "Qf4", "Qa3", "Nxh6", "h3", "Qh2"],
    "Branch 8 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    9,
    "scotch",
    "Scotch — Line 9",
    ["e4", "e5", "Nf3", "Nc6", "d4", "Bc5", "Qd2", "b5", "Be2", "d5", "h3", "Bb6", "Nc3", "Qe7", "exd5", "g6", "Rg1", "Bxd4"],
    "Branch 9 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    10,
    "scotch",
    "Scotch — Line 10",
    ["e4", "e5", "Nf3", "Nc6", "d4", "Bb4+", "c3", "f6", "Bc4", "b6", "cxb4", "Nxb4", "Bf1", "Ne7", "a4", "h6", "h4", "Nd3+"],
    "Branch 10 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    11,
    "scotch",
    "Scotch — Line 11",
    ["e4", "e5", "Nf3", "Nc6", "d4", "Ba3", "Bd3", "f5", "Bh6", "Nb4", "Nc3", "Kf8", "Be2", "d5", "g3", "Nf6", "Qd3", "Qd7"],
    "Branch 11 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    12,
    "scotch",
    "Scotch — Line 12",
    ["e4", "e5", "Nf3", "Nc6", "d4", "Nh6", "Be2", "Nxd4", "Kd2", "f5", "b4", "Nxf3+", "Kd3", "Qf6", "Qf1", "Ng5", "Kc4", "Nhf7"],
    "Branch 12 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    13,
    "scotch",
    "Scotch — Line 13",
    ["e4", "e5", "Nf3", "Nc6", "d4", "Nf6", "Bd3", "Nxe4", "Qd2", "a5", "h4", "Bb4", "Rh2", "Nd6", "Be2", "Ra6", "Nc3", "h5"],
    "Branch 13 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    14,
    "scotch",
    "Scotch — Line 14",
    ["e4", "e5", "Nf3", "Nc6", "d4", "Nge7", "Bc4", "Nxd4", "Nbd2", "Nef5", "a4", "c6", "Nxe5", "Ba3", "Bb5", "Ne2", "Qxe2", "c5"],
    "Branch 14 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    15,
    "scotch",
    "Scotch — Line 15",
    ["e4", "e5", "Nf3", "Nc6", "d4", "a6", "Bb5", "h5", "Bd2", "Nb8", "Bh6", "gxh6", "O-O", "Bd6", "Nc3", "h4", "h3", "Nc6"],
    "Branch 15 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    16,
    "scotch",
    "Scotch — Line 16",
    ["e4", "e5", "Nf3", "Nc6", "d4", "a5", "Ba6", "f5", "Be3", "h5", "c4", "Na7", "Qd2", "Nh6", "Bxh6", "gxh6", "dxe5", "Bc5"],
    "Branch 16 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    17,
    "scotch",
    "Scotch — Line 17",
    ["e4", "e5", "Nf3", "Nc6", "d4", "b6", "Rg1", "h5", "a3", "Nxd4", "Bf4", "Ne7", "Nh4", "Ne6", "Qd6", "f5", "Bd3", "g6"],
    "Branch 17 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    18,
    "scotch",
    "Scotch — Line 18",
    ["e4", "e5", "Nf3", "Nc6", "d4", "b5", "Nxe5", "Nb8", "Bh6", "Ne7", "c4", "Ng8", "a3", "Bb7", "b3", "Nf6", "Qg4", "Ke7"],
    "Branch 18 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    19,
    "scotch",
    "Scotch — Line 19",
    ["e4", "e5", "Nf3", "Nc6", "d4", "d6", "dxe5", "g6", "Bc4", "h6", "b3", "Bf5", "Bf1", "dxe5", "Qd4", "Qd6", "h3", "O-O-O"],
    "Branch 19 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    20,
    "scotch",
    "Scotch — Line 20",
    ["e4", "e5", "Nf3", "Nc6", "d4", "d5", "Nxe5", "Nh6", "Bxh6", "Ne7", "c3", "dxe4", "Ng4", "Ng6", "d5", "Bc5", "Bg5", "Rf8"],
    "Branch 20 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    21,
    "scotch",
    "Scotch — Line 21",
    ["e4", "e5", "Nf3", "Nc6", "d4", "f6", "Ng5", "d6", "Ba6", "Na5", "Nc3", "Qd7", "a4", "Nb3", "f3", "Qh3", "Nxh3", "c6"],
    "Branch 21 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    22,
    "scotch",
    "Scotch — Line 22",
    ["e4", "e5", "Nf3", "Nc6", "d4", "f5", "exf5", "Rb8", "Nh4", "Nh6", "Nf3", "Ne7", "b4", "Ra8", "Nfd2", "g6", "dxe5", "d6"],
    "Branch 22 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    23,
    "scotch",
    "Scotch — Line 23",
    ["e4", "e5", "Nf3", "Nc6", "d4", "g6", "Ng1", "g5", "c3", "Nge7", "b3", "d5", "Na3", "Qd6", "Bb2", "Nd8", "Qb1", "c5"],
    "Branch 23 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    24,
    "scotch",
    "Scotch — Line 24",
    ["e4", "e5", "Nf3", "Nc6", "d4", "g5", "a4", "Bh6", "c3", "Nb4", "h4", "b5", "Nxe5", "Na6", "c4", "Bf8", "b3", "f6"],
    "Branch 24 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    25,
    "scotch",
    "Scotch — Line 25",
    ["e4", "e5", "Nf3", "Nc6", "d4", "h6", "a3", "Be7", "h3", "exd4", "b4", "f6", "g4", "Bc5", "Nfd2", "a6", "Nc4", "d3"],
    "Branch 25 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    26,
    "scotch",
    "Scotch — Line 26",
    ["e4", "e5", "Nf3", "Nc6", "d4", "h5", "a4", "Qe7", "b4", "Qe6", "Nfd2", "a6", "Nf3", "Bd6", "g4", "g6", "a5", "Kd8"],
    "Branch 26 — know this line.",
    ["The Scotch Game"]
  ),
  lineFromMoves(
    27,
    "scotch",
    "Scotch — Line 27",
    ["e4", "e5", "Nf3", "Nc6", "d4", "Nb8", "b3", "Ba3", "Nbd2", "Nf6", "Nh4", "g5", "Qg4", "Bb2", "Nf5", "b5", "Ne7", "c6"],
    "Branch 27 — know this line.",
    ["The Scotch Game"]
  ),
];
