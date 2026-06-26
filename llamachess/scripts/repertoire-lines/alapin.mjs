import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION = "Alapin Sicilian (1.e4 c5 2.c3) — 21 anti-Sicilian white lines.";

export default [
  mkLine(
    1,
    "alapin_1",
    "Alapin Sicilian — Main",
    "Line #1",
    "Core Alapin Sicilian (1.e4 c5 2.c3) line.",
    ["e4", "c5", "c3", "Nc6", "g3", "b5", "Qg4", "Nb8", "Qf3", "Ba6", "Bg2", "g6", "Ne2", "Qc7", "c4", "Nc6", "e5", "h6"],
    ["Play e4 — your move here.", "Black plays c5.", "Play c3 — your move here.", "Black plays Nc6.", "Play g3 — your move here.", "Black plays b5.", "Play Qg4 — your move here.", "Black plays Nb8.", "Play Qf3 — your move here.", "Black plays Ba6.", "Play Bg2 — your move here.", "Black plays g6.", "Play Ne2 — your move here.", "Black plays Qc7.", "Play c4 — your move here.", "Black plays Nc6.", "Play e5 — your move here.", "Black plays h6."],
    ["Alapin Sicilian"]
  ),
  mkLine(
    2,
    "alapin_2",
    "Alapin Sicilian — Line 2",
    "Line #2",
    "Important branch 2.",
    ["e4", "c5", "c3", "Na6", "g4", "Nb8", "Bc4", "g5", "Nf3", "e5", "Bd5", "Ke7", "Qb3", "Ke8", "Qc2", "Nh6", "Bxf7+", "Nxf7"],
    ["Play e4 — your move here.", "Black plays c5.", "Play c3 — your move here.", "Black plays Na6.", "Play g4 — your move here.", "Black plays Nb8.", "Play Bc4 — your move here.", "Black plays g5.", "Play Nf3 — your move here.", "Black plays e5.", "Play Bd5 — your move here.", "Black plays Ke7.", "Play Qb3 — your move here.", "Black plays Ke8.", "Play Qc2 — your move here.", "Black plays Nh6.", "Play Bxf7+ — your move here.", "Black plays Nxf7."],
    ["Alapin Sicilian"]
  ),
  mkLine(
    3,
    "alapin_3",
    "Alapin Sicilian — Line 3",
    "Line #3",
    "Important branch 3.",
    ["e4", "c5", "c3", "Qc7", "h3", "a6", "Bd3", "e5", "h4", "Qc6", "a3", "Qa4", "h5", "Nh6", "Qg4", "a5", "Qd1", "Qc4"],
    ["Play e4 — your move here.", "Black plays c5.", "Play c3 — your move here.", "Black plays Qc7.", "Play h3 — your move here.", "Black plays a6.", "Play Bd3 — your move here.", "Black plays e5.", "Play h4 — your move here.", "Black plays Qc6.", "Play a3 — your move here.", "Black plays Qa4.", "Play h5 — your move here.", "Black plays Nh6.", "Play Qg4 — your move here.", "Black plays a5.", "Play Qd1 — your move here.", "Black plays Qc4."],
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    4,
    "alapin",
    "Alapin — Line 4",
    ["e4", "c5", "c3", "Qb6", "h4", "Nc6", "Qh5", "Qa6", "e5", "c4", "Qxh7", "Nh6", "a4", "Qxa4", "Ra3", "d6", "f3", "Rb8"],
    "Branch 4 — know this line.",
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    5,
    "alapin",
    "Alapin — Line 5",
    ["e4", "c5", "c3", "Qa5", "Na3", "d5", "Rb1", "Nd7", "Bd3", "Qc7", "e5", "Nxe5", "Ke2", "Bf5", "Kf1", "a6", "Qb3", "Kd7"],
    "Branch 5 — know this line.",
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    6,
    "alapin",
    "Alapin — Line 6",
    ["e4", "c5", "c3", "Nh6", "Qc2", "Nc6", "Nh3", "Qb6", "d4", "Qxb2", "g3", "Kd8", "Bxb2", "Nxd4", "Bg2", "g6", "Qd1", "Nc2+"],
    "Branch 6 — know this line.",
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    7,
    "alapin",
    "Alapin — Line 7",
    ["e4", "c5", "c3", "Nf6", "Qb3", "Nh5", "d4", "d5", "Qxb7", "Nf6", "Nd2", "Nc6", "Ne2", "Nxd4", "Qxa7", "e6", "Nb3", "Qa5"],
    "Branch 7 — know this line.",
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    8,
    "alapin",
    "Alapin — Line 8",
    ["e4", "c5", "c3", "a6", "Qa4", "f6", "b4", "h6", "Bb2", "Qa5", "Bd3", "cxb4", "Qxb4", "Qxb4", "f4", "d6", "c4", "Rh7"],
    "Branch 8 — know this line.",
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    9,
    "alapin",
    "Alapin — Line 9",
    ["e4", "c5", "c3", "a5", "Qe2", "Na6", "Qd3", "h5", "c4", "d5", "Qe2", "dxe4", "h3", "f5", "Nc3", "e5", "b3", "Qxd2+"],
    "Branch 9 — know this line.",
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    10,
    "alapin",
    "Alapin — Line 10",
    ["e4", "c5", "c3", "b6", "Qf3", "a6", "h3", "h5", "Qf4", "e6", "a3", "Nc6", "g4", "g6", "Nf3", "d6", "Bc4", "a5"],
    "Branch 10 — know this line.",
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    11,
    "alapin",
    "Alapin — Line 11",
    ["e4", "c5", "c3", "b5", "Qh5", "d6", "Qd5", "g5", "a4", "b4", "Qf5", "d5", "Qxh7", "Nd7", "Be2", "Bb7", "e5", "e6"],
    "Branch 11 — know this line.",
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    12,
    "alapin",
    "Alapin — Line 12",
    ["e4", "c5", "c3", "d6", "Qh5", "e5", "d3", "Nh6", "f3", "Ng4", "Qh6", "f6", "Qd2", "Rg8", "f4", "a6", "Na3", "Nc6"],
    "Branch 12 — know this line.",
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    13,
    "alapin",
    "Alapin — Line 13",
    ["e4", "c5", "c3", "d5", "Qg4", "a5", "Qf3", "e5", "Ba6", "Rxa6", "h4", "Ne7", "Ne2", "Bg4", "Qf6", "Be6", "Qg5", "d4"],
    "Branch 13 — know this line.",
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    14,
    "alapin",
    "Alapin — Line 14",
    ["e4", "c5", "c3", "e6", "Be2", "a5", "d4", "h6", "h3", "Qb6", "Bg5", "Qa7", "Bh4", "f5", "Na3", "f4", "Bh5+", "g6"],
    "Branch 14 — know this line.",
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    15,
    "alapin",
    "Alapin — Line 15",
    ["e4", "c5", "c3", "e5", "Bb5", "Nc6", "Kf1", "g5", "Bd3", "Rb8", "Ke2", "a5", "Nh3", "Nf6", "Ke1", "Nxe4", "f4", "Bd6"],
    "Branch 15 — know this line.",
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    16,
    "alapin",
    "Alapin — Line 16",
    ["e4", "c5", "c3", "f6", "Bc4", "Nc6", "Qc2", "Qc7", "Bb5", "Nb4", "a3", "Qe5", "h4", "Nxc2+", "Kf1", "a6", "Nf3", "Ra7"],
    "Branch 16 — know this line.",
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    17,
    "alapin",
    "Alapin — Line 17",
    ["e4", "c5", "c3", "f5", "Bd3", "a6", "exf5", "h5", "a3", "b6", "Qe2", "Rh7", "f6", "b5", "b3", "g6", "f7+", "Rxf7"],
    "Branch 17 — know this line.",
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    18,
    "alapin",
    "Alapin — Line 18",
    ["e4", "c5", "c3", "g6", "Ba6", "d6", "Nh3", "Nxa6", "Rf1", "Nh6", "Qh5", "gxh5", "Rg1", "b5", "Rh1", "c4", "Rg1", "Qa5"],
    "Branch 18 — know this line.",
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    19,
    "alapin",
    "Alapin — Line 19",
    ["e4", "c5", "c3", "g5", "Ne2", "a5", "d4", "g4", "Be3", "e5", "g3", "b5", "Qc1", "f6", "Bd2", "Kf7", "Rg1", "Qb6"],
    "Branch 19 — know this line.",
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    20,
    "alapin",
    "Alapin — Line 20",
    ["e4", "c5", "c3", "h6", "Nf3", "g6", "g3", "e5", "Bb5", "a6", "a3", "Qa5", "Kf1", "h5", "Kg2", "Ra7", "Bd3", "Qb6"],
    "Branch 20 — know this line.",
    ["Alapin Sicilian"]
  ),
  lineFromMoves(
    21,
    "alapin",
    "Alapin — Line 21",
    ["e4", "c5", "c3", "h5", "Nh3", "b5", "g4", "b4", "Bb5", "g6", "c4", "f6", "Nc3", "Rh7", "g5", "Rg7", "a4", "Qa5"],
    "Branch 21 — know this line.",
    ["Alapin Sicilian"]
  ),
];
