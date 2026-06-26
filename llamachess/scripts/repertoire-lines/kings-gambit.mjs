import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION = "The King's Gambit (1.e4 e5 2.f4) — 22 romantic attacking lines.";

export default [
  mkLine(
    1,
    "kings_gambit_1",
    "The King's Gambit — Main",
    "Line #1",
    "Core The King's Gambit (1.e4 e5 2.f4) line.",
    ["e4", "e5", "f4", "Nc6", "g4", "Nb4", "Ne2", "Qf6", "Nd4", "h6", "Nc6", "d6", "Bg2", "Qxf4", "Bh3", "Qf5", "Bg2", "Nf6"],
    ["Play e4 — your move here.", "Black plays e5.", "Play f4 — your move here.", "Black plays Nc6.", "Play g4 — your move here.", "Black plays Nb4.", "Play Ne2 — your move here.", "Black plays Qf6.", "Play Nd4 — your move here.", "Black plays h6.", "Play Nc6 — your move here.", "Black plays d6.", "Play Bg2 — your move here.", "Black plays Qxf4.", "Play Bh3 — your move here.", "Black plays Qf5.", "Play Bg2 — your move here.", "Black plays Nf6."],
    ["The King's Gambit"]
  ),
  mkLine(
    2,
    "kings_gambit_2",
    "The King's Gambit — Line 2",
    "Line #2",
    "Important branch 2.",
    ["e4", "e5", "f4", "Na6", "h3", "Qf6", "Bb5", "Be7", "Qe2", "Nc5", "Qh5", "Qc6", "Ne2", "a5", "Rh2", "Kf8", "fxe5", "f6"],
    ["Play e4 — your move here.", "Black plays e5.", "Play f4 — your move here.", "Black plays Na6.", "Play h3 — your move here.", "Black plays Qf6.", "Play Bb5 — your move here.", "Black plays Be7.", "Play Qe2 — your move here.", "Black plays Nc5.", "Play Qh5 — your move here.", "Black plays Qc6.", "Play Ne2 — your move here.", "Black plays a5.", "Play Rh2 — your move here.", "Black plays Kf8.", "Play fxe5 — your move here.", "Black plays f6."],
    ["The King's Gambit"]
  ),
  mkLine(
    3,
    "kings_gambit_3",
    "The King's Gambit — Line 3",
    "Line #3",
    "Important branch 3.",
    ["e4", "e5", "f4", "Qe7", "h4", "a6", "Be2", "Qa3", "Bc4", "a5", "Kf2", "f6", "d4", "a4", "Qg4", "Qe7", "Ne2", "h5"],
    ["Play e4 — your move here.", "Black plays e5.", "Play f4 — your move here.", "Black plays Qe7.", "Play h4 — your move here.", "Black plays a6.", "Play Be2 — your move here.", "Black plays Qa3.", "Play Bc4 — your move here.", "Black plays a5.", "Play Kf2 — your move here.", "Black plays f6.", "Play d4 — your move here.", "Black plays a4.", "Play Qg4 — your move here.", "Black plays Qe7.", "Play Ne2 — your move here.", "Black plays h5."],
    ["The King's Gambit"]
  ),
  lineFromMoves(
    4,
    "kings_gambit",
    "King's Gambit — Line 4",
    ["e4", "e5", "f4", "Qf6", "Na3", "Qg5", "Kf2", "Qd8", "Qf3", "f5", "b4", "Bc5+", "bxc5", "fxe4", "Qb3", "Nc6", "Qxg8+", "Ke7"],
    "Branch 4 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    5,
    "kings_gambit",
    "King's Gambit — Line 5",
    ["e4", "e5", "f4", "Qg5", "h4", "Qe7", "Bc4", "Qd6", "g4", "Na6", "Bd3", "h6", "Nc3", "Ke7", "Bf1", "Kf6", "Nh3", "Qd5"],
    "Branch 5 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    6,
    "kings_gambit",
    "King's Gambit — Line 6",
    ["e4", "e5", "f4", "Qh4+", "g3", "Qf6", "Bb5", "Be7", "Ke2", "h6", "b3", "a5", "d3", "c5", "d4", "Kd8", "a3", "Rh7"],
    "Branch 6 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    7,
    "kings_gambit",
    "King's Gambit — Line 7",
    ["e4", "e5", "f4", "Ke7", "Qf3", "g6", "Qc3", "a6", "Qd3", "c6", "g3", "h5", "Ne2", "Qc7", "a4", "b6", "g4", "Qb7"],
    "Branch 7 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    8,
    "kings_gambit",
    "King's Gambit — Line 8",
    ["e4", "e5", "f4", "Be7", "Qg4", "d5", "Qxc8", "Bc5", "g3", "g6", "d4", "f6", "Nf3", "Kf8", "b4", "h6", "Qxc7", "Rh7"],
    "Branch 8 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    9,
    "kings_gambit",
    "King's Gambit — Line 9",
    ["e4", "e5", "f4", "Bd6", "Qh5", "g6", "Qxe5+", "Bxe5", "Bc4", "Bf6", "b4", "Nc6", "g3", "Na5", "Ke2", "Bg5", "h3", "c5"],
    "Branch 9 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    10,
    "kings_gambit",
    "King's Gambit — Line 10",
    ["e4", "e5", "f4", "Bc5", "Be2", "Nc6", "d4", "Qf6", "Nd2", "Qh4+", "g3", "b5", "d5", "Qh3", "Bd3", "Qh5", "b3", "exf4"],
    "Branch 10 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    11,
    "kings_gambit",
    "King's Gambit — Line 11",
    ["e4", "e5", "f4", "Bb4", "Ne2", "Qf6", "Na3", "Qc6", "Kf2", "Qg6", "h4", "h5", "Nd4", "a5", "Be2", "Nh6", "Ba6", "a4"],
    "Branch 11 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    12,
    "kings_gambit",
    "King's Gambit — Line 12",
    ["e4", "e5", "f4", "Ba3", "Bc4", "Nh6", "Qh5", "g5", "Qxg5", "c6", "Qf6", "Qc7", "Nc3", "Bxb2", "Qd6", "Ba3", "Nf3", "Na6"],
    "Branch 12 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    13,
    "kings_gambit",
    "King's Gambit — Line 13",
    ["e4", "e5", "f4", "Nh6", "Bd3", "b6", "Bf1", "g6", "h4", "Ba6", "Bb5", "Bb4", "Qf3", "Bxb5", "Qg3", "Bd6", "Qxg6", "hxg6"],
    "Branch 13 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    14,
    "kings_gambit",
    "King's Gambit — Line 14",
    ["e4", "e5", "f4", "Nf6", "Bc4", "g6", "Qg4", "g5", "Bb3", "Bb4", "Nh3", "Bc3", "Qe6+", "dxe6", "Bc4", "Nc6", "a4", "Bb4"],
    "Branch 14 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    15,
    "kings_gambit",
    "King's Gambit — Line 15",
    ["e4", "e5", "f4", "Ne7", "Bb5", "g6", "Qh5", "f5", "Qh6", "Kf7", "a4", "d6", "Bf1", "Ke8", "Qh5", "Nd7", "h3", "Nd5"],
    "Branch 15 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    16,
    "kings_gambit",
    "King's Gambit — Line 16",
    ["e4", "e5", "f4", "a6", "Bxa6", "Nh6", "Bxb7", "c6", "h3", "f6", "Bxc6", "Qe7", "Rh2", "Ra3", "g3", "Kf7", "g4", "Qc5"],
    "Branch 16 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    17,
    "kings_gambit",
    "King's Gambit — Line 17",
    ["e4", "e5", "f4", "a5", "Ne2", "Nf6", "d4", "a4", "c3", "Ra5", "Qd2", "Ra8", "Kf2", "g5", "Ng3", "Ba3", "b3", "Bc5"],
    "Branch 17 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    18,
    "kings_gambit",
    "King's Gambit — Line 18",
    ["e4", "e5", "f4", "b6", "Nf3", "Ne7", "a4", "b5", "d4", "Bb7", "Ke2", "c5", "Qd2", "Nbc6", "Rg1", "exf4", "g4", "Qb6"],
    "Branch 18 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    19,
    "kings_gambit",
    "King's Gambit — Line 19",
    ["e4", "e5", "f4", "b5", "fxe5", "c6", "Qe2", "g5", "Nh3", "Bg7", "a3", "Qe7", "Ra2", "Bf8", "b3", "a5", "c3", "d5"],
    "Branch 19 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    20,
    "kings_gambit",
    "King's Gambit — Line 20",
    ["e4", "e5", "f4", "c6", "f5", "d5", "g3", "Qb6", "Be2", "Bxf5", "Nf3", "Qb4", "Ng5", "d4", "O-O", "Qc3", "Rf4", "Ne7"],
    "Branch 20 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    21,
    "kings_gambit",
    "King's Gambit — Line 21",
    ["e4", "e5", "f4", "c5", "fxe5", "h6", "Nc3", "Ne7", "Qe2", "Nec6", "Rb1", "g6", "Qd3", "Qe7", "g4", "Kd8", "b3", "Qf6"],
    "Branch 21 — know this line.",
    ["The King's Gambit"]
  ),
  lineFromMoves(
    22,
    "kings_gambit",
    "King's Gambit — Line 22",
    ["e4", "e5", "f4", "d6", "a3", "Nh6", "Qe2", "g5", "h3", "Bxh3", "Nf3", "Qf6", "g4", "Nf5", "Qd3", "Qh6", "Qb3", "d5"],
    "Branch 22 — know this line.",
    ["The King's Gambit"]
  ),
];
