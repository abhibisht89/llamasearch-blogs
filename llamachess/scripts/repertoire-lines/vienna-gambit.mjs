import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION = "The Vienna Gambit (1.e4 e5 2.Nc3 Nf6 3.f4) — 14 aggressive gambit lines.";

export default [
  mkLine(
    1,
    "vienna_gambit_1",
    "The Vienna Gambit — Main",
    "Line #1",
    "Core The Vienna Gambit (1.e4 e5 2.Nc3 Nf6 3.f4) line.",
    ["e4", "e5", "Nc3", "Nf6", "f4", "Nc6", "Kf2", "g6", "Qe2", "Nb4", "Nb5", "Rb8", "Na3", "Bg7", "Nf3", "c5", "Kg3", "Qb6"],
    ["Play e4 — your move here.", "Black plays e5.", "Play Nc3 — your move here.", "Black plays Nf6.", "Play f4 — your move here.", "Black plays Nc6.", "Play Kf2 — your move here.", "Black plays g6.", "Play Qe2 — your move here.", "Black plays Nb4.", "Play Nb5 — your move here.", "Black plays Rb8.", "Play Na3 — your move here.", "Black plays Bg7.", "Play Nf3 — your move here.", "Black plays c5.", "Play Kg3 — your move here.", "Black plays Qb6."],
    ["The Vienna Gambit"]
  ),
  mkLine(
    2,
    "vienna_gambit_2",
    "The Vienna Gambit — Line 2",
    "Line #2",
    "Important branch 2.",
    ["e4", "e5", "Nc3", "Nf6", "f4", "Na6", "Be2", "Nc5", "b4", "Rb8", "Bd3", "d6", "Ba6", "Nfd7", "Bxb7", "Nd3+", "Ke2", "g5"],
    ["Play e4 — your move here.", "Black plays e5.", "Play Nc3 — your move here.", "Black plays Nf6.", "Play f4 — your move here.", "Black plays Na6.", "Play Be2 — your move here.", "Black plays Nc5.", "Play b4 — your move here.", "Black plays Rb8.", "Play Bd3 — your move here.", "Black plays d6.", "Play Ba6 — your move here.", "Black plays Nfd7.", "Play Bxb7 — your move here.", "Black plays Nd3+.", "Play Ke2 — your move here.", "Black plays g5."],
    ["The Vienna Gambit"]
  ),
  lineFromMoves(
    3,
    "vienna_gambit",
    "Vienna Gambit — Line 3",
    ["e4", "e5", "Nc3", "Nf6", "f4", "Qe7", "Bd3", "h5", "Nd5", "Rg8", "Ne2", "b5", "g4", "c6", "Nb6", "Nxe4", "c3", "exf4"],
    "Branch 3 — know this line.",
    ["The Vienna Gambit"]
  ),
  lineFromMoves(
    4,
    "vienna_gambit",
    "Vienna Gambit — Line 4",
    ["e4", "e5", "Nc3", "Nf6", "f4", "Ke7", "Bc4", "Rg8", "h3", "Nd5", "Nf3", "g5", "Nxg5", "Kd6", "Nb1", "Nc6", "O-O", "Ndb4"],
    "Branch 4 — know this line.",
    ["The Vienna Gambit"]
  ),
  lineFromMoves(
    5,
    "vienna_gambit",
    "Vienna Gambit — Line 5",
    ["e4", "e5", "Nc3", "Nf6", "f4", "Be7", "Bb5", "Na6", "Ke2", "h5", "a3", "exf4", "h4", "Nc5", "Nd5", "Nb3", "Nxc7+", "Kf8"],
    "Branch 5 — know this line.",
    ["The Vienna Gambit"]
  ),
  lineFromMoves(
    6,
    "vienna_gambit",
    "Vienna Gambit — Line 6",
    ["e4", "e5", "Nc3", "Nf6", "f4", "Bd6", "Ba6", "Nxe4", "Nf3", "f6", "Kf1", "Ke7", "Bxb7", "Re8", "Ke1", "h5", "Nxe5", "Kf8"],
    "Branch 6 — know this line.",
    ["The Vienna Gambit"]
  ),
  lineFromMoves(
    7,
    "vienna_gambit",
    "Vienna Gambit — Line 7",
    ["e4", "e5", "Nc3", "Nf6", "f4", "Bc5", "Nh3", "c6", "a4", "d6", "Ra2", "Ba3", "Bd3", "Qa5", "Ne2", "d5", "Ng3", "Bg4"],
    "Branch 7 — know this line.",
    ["The Vienna Gambit"]
  ),
  lineFromMoves(
    8,
    "vienna_gambit",
    "Vienna Gambit — Line 8",
    ["e4", "e5", "Nc3", "Nf6", "f4", "Bb4", "f5", "h5", "Qe2", "Nd5", "Qg4", "Rg8", "h4", "Bxc3", "Bd3", "g6", "Rb1", "f6"],
    "Branch 8 — know this line.",
    ["The Vienna Gambit"]
  ),
  lineFromMoves(
    9,
    "vienna_gambit",
    "Vienna Gambit — Line 9",
    ["e4", "e5", "Nc3", "Nf6", "f4", "Ba3", "fxe5", "Ng4", "Bb5", "Nxe5", "d3", "Bb4", "Ne2", "Bc5", "Rf1", "Bd6", "Rxf7", "c5"],
    "Branch 9 — know this line.",
    ["The Vienna Gambit"]
  ),
  lineFromMoves(
    10,
    "vienna_gambit",
    "Vienna Gambit — Line 10",
    ["e4", "e5", "Nc3", "Nf6", "f4", "Rg8", "f5", "Bc5", "Qf3", "Bf2+", "Qxf2", "Kf8", "Nh3", "c5", "d4", "Ne8", "Ng1", "Qg5"],
    "Branch 10 — know this line.",
    ["The Vienna Gambit"]
  ),
  lineFromMoves(
    11,
    "vienna_gambit",
    "Vienna Gambit — Line 11",
    ["e4", "e5", "Nc3", "Nf6", "f4", "a6", "fxe5", "Bb4", "g3", "Nc6", "Qf3", "Nxe4", "g4", "Ba3", "Qe3", "Nf6", "Bg2", "Rg8"],
    "Branch 11 — know this line.",
    ["The Vienna Gambit"]
  ),
  lineFromMoves(
    12,
    "vienna_gambit",
    "Vienna Gambit — Line 12",
    ["e4", "e5", "Nc3", "Nf6", "f4", "a5", "Na4", "Nc6", "g4", "Bd6", "Bh3", "g5", "Nc3", "Bb4", "Kf2", "Nb8", "Nd5", "Rf8"],
    "Branch 12 — know this line.",
    ["The Vienna Gambit"]
  ),
  lineFromMoves(
    13,
    "vienna_gambit",
    "Vienna Gambit — Line 13",
    ["e4", "e5", "Nc3", "Nf6", "f4", "b6", "Nb5", "Ba6", "a3", "Bc8", "Rb1", "exf4", "b3", "Rg8", "d3", "Qe7", "Nd4", "Qc5"],
    "Branch 13 — know this line.",
    ["The Vienna Gambit"]
  ),
  lineFromMoves(
    14,
    "vienna_gambit",
    "Vienna Gambit — Line 14",
    ["e4", "e5", "Nc3", "Nf6", "f4", "b5", "Nb1", "Na6", "Kf2", "h6", "g4", "Nxg4+", "Kg2", "d6", "b3", "d5", "Nf3", "f6"],
    "Branch 14 — know this line.",
    ["The Vienna Gambit"]
  ),
];
