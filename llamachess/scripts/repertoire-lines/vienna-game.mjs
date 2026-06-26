import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION = "Vienna Game (1.e4 e5 2.Nc3, non-gambit) — 19 solid white lines.";

export default [
  mkLine(
    1,
    "vienna_game_1",
    "Vienna Game — Main",
    "Line #1",
    "Non-gambit Vienna — no early f4.",
    ["e4", "e5", "Nc3", "Nc6", "f3", "Na5", "Na4", "Nh6", "Ke2", "Nf5", "b4", "d6", "Nc5", "Qf6", "exf5", "Qh6", "f4", "Qxf4"],
    ["Play e4 — your move here.", "Black plays e5.", "Play Nc3 — your move here.", "Black plays Nc6.", "Play f3 — your move here.", "Black plays Na5.", "Play Na4 — your move here.", "Black plays Nh6.", "Play Ke2 — your move here.", "Black plays Nf5.", "Play b4 — your move here.", "Black plays d6.", "Play Nc5 — your move here.", "Black plays Qf6.", "Play exf5 — your move here.", "Black plays Qh6.", "Play f4 — your move here.", "Black plays Qxf4."],
    ["Vienna Game"]
  ),
  mkLine(
    2,
    "vienna_game_2",
    "Vienna Game — Line 2",
    "Line #2",
    "Non-gambit Vienna — no early f4.",
    ["e4", "e5", "Nc3", "Na6", "g3", "Qh4", "Qf3", "Qg5", "Qf6", "b5", "d3", "d6", "Ke2", "c6", "Qxf7+", "Kxf7", "Ke1", "Nb4"],
    ["Play e4 — your move here.", "Black plays e5.", "Play Nc3 — your move here.", "Black plays Na6.", "Play g3 — your move here.", "Black plays Qh4.", "Play Qf3 — your move here.", "Black plays Qg5.", "Play Qf6 — your move here.", "Black plays b5.", "Play d3 — your move here.", "Black plays d6.", "Play Ke2 — your move here.", "Black plays c6.", "Play Qxf7+ — your move here.", "Black plays Kxf7.", "Play Ke1 — your move here.", "Black plays Nb4."],
    ["Vienna Game"]
  ),
  mkLine(
    3,
    "vienna_game_3",
    "Vienna Game — Line 3",
    "Line #3",
    "Non-gambit Vienna — no early f4.",
    ["e4", "e5", "Nc3", "Qe7", "g4", "b6", "Bb5", "h5", "Ke2", "Ba6", "Rb1", "Kd8", "Ke3", "f6", "Be2", "Kc8", "Bc4", "c6"],
    ["Play e4 — your move here.", "Black plays e5.", "Play Nc3 — your move here.", "Black plays Qe7.", "Play g4 — your move here.", "Black plays b6.", "Play Bb5 — your move here.", "Black plays h5.", "Play Ke2 — your move here.", "Black plays Ba6.", "Play Rb1 — your move here.", "Black plays Kd8.", "Play Ke3 — your move here.", "Black plays f6.", "Play Be2 — your move here.", "Black plays Kc8.", "Play Bc4 — your move here.", "Black plays c6."],
    ["Vienna Game"]
  ),
  lineFromMoves(
    4,
    "vienna_game",
    "Vienna Game — Line 4",
    ["e4", "e5", "Nc3", "Qf6", "h3", "Qh6", "Bc4", "Qg6", "d3", "Qf5", "Nb5", "Nh6", "Bb3", "Qh5", "Bd2", "Nc6", "Ne2", "Ng8"],
    "Branch 4 — know this line.",
    ["Vienna Game"]
  ),
  lineFromMoves(
    5,
    "vienna_game",
    "Vienna Game — Line 5",
    ["e4", "e5", "Nc3", "Qg5", "h4", "Qe7", "Ke2", "Qa3", "b3", "Na6", "Nh3", "b6", "Nb1", "f6", "c3", "Qc5", "Qe1", "Ne7"],
    "Branch 5 — know this line.",
    ["Vienna Game"]
  ),
  lineFromMoves(
    6,
    "vienna_game",
    "Vienna Game — Line 6",
    ["e4", "e5", "Nc3", "Qh4", "Qh5", "Qxf2+", "Kxf2", "b6", "Nge2", "Bb7", "b3", "g5", "Kg1", "Ke7", "Qg4", "a6", "a3", "f6"],
    "Branch 6 — know this line.",
    ["Vienna Game"]
  ),
  lineFromMoves(
    7,
    "vienna_game",
    "Vienna Game — Line 7",
    ["e4", "e5", "Nc3", "Ke7", "Qe2", "h6", "Kd1", "g6", "Qc4", "Nc6", "Nd5+", "Ke6", "Nb4+", "Kd6", "Be2", "Nb8", "f4", "f5"],
    "Branch 7 — know this line.",
    ["Vienna Game"]
  ),
  lineFromMoves(
    8,
    "vienna_game",
    "Vienna Game — Line 8",
    ["e4", "e5", "Nc3", "Be7", "Qf3", "Bf6", "Qd1", "Bg5", "Nb1", "Qf6", "Bc4", "a5", "a4", "c5", "b3", "Bh4", "Nc3", "Nc6"],
    "Branch 8 — know this line.",
    ["Vienna Game"]
  ),
  lineFromMoves(
    9,
    "vienna_game",
    "Vienna Game — Line 9",
    ["e4", "e5", "Nc3", "Bd6", "Qg4", "b6", "Qxg7", "Qf6", "Qxf6", "a5", "Bd3", "Ra7", "Ke2", "Rb7", "Qg7", "Bc5", "g3", "d6"],
    "Branch 9 — know this line.",
    ["Vienna Game"]
  ),
  lineFromMoves(
    10,
    "vienna_game",
    "Vienna Game — Line 10",
    ["e4", "e5", "Nc3", "Bc5", "Qh5", "Ne7", "Qg4", "f6", "Qg6+", "Kf8", "Qxf6+", "Ke8", "b4", "Nd5", "Qe7+", "Bxe7", "d4", "Nc6"],
    "Branch 10 — know this line.",
    ["Vienna Game"]
  ),
  lineFromMoves(
    11,
    "vienna_game",
    "Vienna Game — Line 11",
    ["e4", "e5", "Nc3", "Bb4", "Bd3", "Ke7", "Nb1", "Kd6", "Kf1", "Ke7", "f3", "Nf6", "f4", "a5", "Nh3", "c6", "b3", "Ke8"],
    "Branch 11 — know this line.",
    ["Vienna Game"]
  ),
  lineFromMoves(
    12,
    "vienna_game",
    "Vienna Game — Line 12",
    ["e4", "e5", "Nc3", "Ba3", "Bc4", "Ne7", "g4", "Bc5", "Bb5", "Nd5", "Nce2", "Ke7", "Nc3", "b6", "Kf1", "f5", "Nxd5+", "Kf7"],
    "Branch 12 — know this line.",
    ["Vienna Game"]
  ),
  lineFromMoves(
    13,
    "vienna_game",
    "Vienna Game — Line 13",
    ["e4", "e5", "Nc3", "Nh6", "Bd3", "c6", "Nce2", "Ng8", "h4", "Qg5", "Rh2", "Nh6", "Nf4", "Qg4", "a4", "Nf5", "Nh5", "Ke7"],
    "Branch 13 — know this line.",
    ["Vienna Game"]
  ),
  lineFromMoves(
    14,
    "vienna_game",
    "Vienna Game — Line 14",
    ["e4", "e5", "Nc3", "Nf6", "Bc4", "h6", "g3", "Qe7", "Qh5", "g6", "Nf3", "g5", "O-O", "Qb4", "Nb1", "Rh7", "Bb3", "b6"],
    "Branch 14 — know this line.",
    ["Vienna Game"]
  ),
  lineFromMoves(
    15,
    "vienna_game",
    "Vienna Game — Line 15",
    ["e4", "e5", "Nc3", "Ne7", "Bb5", "h5", "Qg4", "Ng8", "Ba6", "Qh4", "Qxg7", "d6", "Bd3", "Bh3", "Kd1", "b5", "Qg4", "Bg7"],
    "Branch 15 — know this line.",
    ["Vienna Game"]
  ),
  lineFromMoves(
    16,
    "vienna_game",
    "Vienna Game — Line 16",
    ["e4", "e5", "Nc3", "a6", "Bxa6", "Ne7", "Nge2", "Rxa6", "Nf4", "Re6", "Nb1", "Nbc6", "O-O", "g6", "Qg4", "Bg7", "Qe2", "Nd4"],
    "Branch 16 — know this line.",
    ["Vienna Game"]
  ),
  lineFromMoves(
    17,
    "vienna_game",
    "Vienna Game — Line 17",
    ["e4", "e5", "Nc3", "a5", "Nge2", "b6", "d4", "d6", "Be3", "Ke7", "a4", "Ba6", "g3", "Qc8", "Qd3", "c6", "Rd1", "c5"],
    "Branch 17 — know this line.",
    ["Vienna Game"]
  ),
  lineFromMoves(
    18,
    "vienna_game",
    "Vienna Game — Line 18",
    ["e4", "e5", "Nc3", "b6", "Nf3", "a5", "a4", "h5", "Ke2", "Na6", "Ra3", "Bxa3", "Nb1", "Kf8", "h3", "Rh6", "Rh2", "Nb4"],
    "Branch 18 — know this line.",
    ["Vienna Game"]
  ),
  lineFromMoves(
    19,
    "vienna_game",
    "Vienna Game — Line 19",
    ["e4", "e5", "Nc3", "b5", "Nxb5", "d6", "Nd4", "Ne7", "Nf5", "Bd7", "Nh3", "Nxf5", "Bd3", "h6", "Rf1", "Rh7", "c4", "Nc6"],
    "Branch 19 — know this line.",
    ["Vienna Game"]
  ),
];
