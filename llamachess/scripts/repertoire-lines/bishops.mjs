import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION = "Bishop's Opening (1.e4 e5 2.Bc4) — 19 tricky white lines.";

export default [
  mkLine(
    1,
    "bishops_1",
    "Bishop's Opening — Main",
    "Line #1",
    "Core Bishop's Opening (1.e4 e5 2.Bc4) line.",
    ["e4", "e5", "Bc4", "Nc6", "Bb3", "Na5", "Ne2", "Nh6", "d3", "Nf5", "f4", "Be7", "a4", "Bf8", "h4", "c5", "Ra2", "Qxh4+"],
    ["Play e4 — your move here.", "Black plays e5.", "Play Bc4 — your move here.", "Black plays Nc6.", "Play Bb3 — your move here.", "Black plays Na5.", "Play Ne2 — your move here.", "Black plays Nh6.", "Play d3 — your move here.", "Black plays Nf5.", "Play f4 — your move here.", "Black plays Be7.", "Play a4 — your move here.", "Black plays Bf8.", "Play h4 — your move here.", "Black plays c5.", "Play Ra2 — your move here.", "Black plays Qxh4+."],
    ["Bishop's Opening"]
  ),
  mkLine(
    2,
    "bishops_2",
    "Bishop's Opening — Line 2",
    "Line #2",
    "Important branch 2.",
    ["e4", "e5", "Bc4", "Na6", "a3", "Qh4", "Qf3", "Nc5", "Bd5", "Na4", "Qh3", "h6", "Bc4", "Nxb2", "Bxf7+", "Ke7", "Qg4", "Rh7"],
    ["Play e4 — your move here.", "Black plays e5.", "Play Bc4 — your move here.", "Black plays Na6.", "Play a3 — your move here.", "Black plays Qh4.", "Play Qf3 — your move here.", "Black plays Nc5.", "Play Bd5 — your move here.", "Black plays Na4.", "Play Qh3 — your move here.", "Black plays h6.", "Play Bc4 — your move here.", "Black plays Nxb2.", "Play Bxf7+ — your move here.", "Black plays Ke7.", "Play Qg4 — your move here.", "Black plays Rh7."],
    ["Bishop's Opening"]
  ),
  mkLine(
    3,
    "bishops_3",
    "Bishop's Opening — Line 3",
    "Line #3",
    "Important branch 3.",
    ["e4", "e5", "Bc4", "Qe7", "a4", "b6", "c3", "Qh4", "Ke2", "g5", "Bd5", "Ba6+", "Ke1", "Qg3", "Be6", "Be7", "Bh3", "Bc4"],
    ["Play e4 — your move here.", "Black plays e5.", "Play Bc4 — your move here.", "Black plays Qe7.", "Play a4 — your move here.", "Black plays b6.", "Play c3 — your move here.", "Black plays Qh4.", "Play Ke2 — your move here.", "Black plays g5.", "Play Bd5 — your move here.", "Black plays Ba6+.", "Play Ke1 — your move here.", "Black plays Qg3.", "Play Be6 — your move here.", "Black plays Be7.", "Play Bh3 — your move here.", "Black plays Bc4."],
    ["Bishop's Opening"]
  ),
  lineFromMoves(
    4,
    "bishops",
    "Bishop's — Line 4",
    ["e4", "e5", "Bc4", "Qf6", "b3", "Qh6", "h3", "Qg6", "Kf1", "Qf5", "Rh2", "Be7", "Be2", "Qf6", "h4", "d5", "Bg4", "Bf8"],
    "Branch 4 — know this line.",
    ["Bishop's Opening"]
  ),
  lineFromMoves(
    5,
    "bishops",
    "Bishop's — Line 5",
    ["e4", "e5", "Bc4", "Qg5", "b4", "Qg6", "g3", "Qc6", "Qg4", "Bc5", "Ba3", "Bf8", "Qf5", "Qd6", "Qxh7", "Na6", "Ne2", "Nc5"],
    "Branch 5 — know this line.",
    ["Bishop's Opening"]
  ),
  lineFromMoves(
    6,
    "bishops",
    "Bishop's — Line 6",
    ["e4", "e5", "Bc4", "Qh4", "g3", "Qe7", "Nc3", "f6", "b3", "Kd8", "h3", "Qa3", "Bf1", "f5", "Nb1", "b5", "Qg4", "Bb7"],
    "Branch 6 — know this line.",
    ["Bishop's Opening"]
  ),
  lineFromMoves(
    7,
    "bishops",
    "Bishop's — Line 7",
    ["e4", "e5", "Bc4", "Ke7", "d3", "Na6", "f4", "g6", "Be3", "Bh6", "Be6", "Nb8", "Qd2", "Qf8", "Kf1", "Kd8", "Nc3", "Qc5"],
    "Branch 7 — know this line.",
    ["Bishop's Opening"]
  ),
  lineFromMoves(
    8,
    "bishops",
    "Bishop's — Line 8",
    ["e4", "e5", "Bc4", "Be7", "d4", "d5", "exd5", "h5", "b4", "Nd7", "dxe5", "b6", "Bb5", "Bf8", "Qe2", "Be7", "Nd2", "f5"],
    "Branch 8 — know this line.",
    ["Bishop's Opening"]
  ),
  lineFromMoves(
    9,
    "bishops",
    "Bishop's — Line 9",
    ["e4", "e5", "Bc4", "Bd6", "f3", "b6", "Bd5", "h5", "g4", "Bf8", "Bb7", "Qe7", "Bxc8", "b5", "b4", "hxg4", "Na3", "gxf3"],
    "Branch 9 — know this line.",
    ["Bishop's Opening"]
  ),
  lineFromMoves(
    10,
    "bishops",
    "Bishop's — Line 10",
    ["e4", "e5", "Bc4", "Bc5", "f4", "Nc6", "Qe2", "Bxg1", "Kd1", "d6", "a4", "Nb4", "c3", "Nf6", "h4", "Qe7", "Ra2", "Nc6"],
    "Branch 10 — know this line.",
    ["Bishop's Opening"]
  ),
  lineFromMoves(
    11,
    "bishops",
    "Bishop's — Line 11",
    ["e4", "e5", "Bc4", "Bb4", "Qe2", "Qh4", "c3", "Bxc3", "Qf3", "Qxf2+", "Qxf2", "Kf8", "Be2", "Bd4", "Bd1", "Na6", "h4", "g6"],
    "Branch 11 — know this line.",
    ["Bishop's Opening"]
  ),
  lineFromMoves(
    12,
    "bishops",
    "Bishop's — Line 12",
    ["e4", "e5", "Bc4", "Ba3", "h4", "Ne7", "Ke2", "Bc5", "a3", "Bb4", "c3", "d5", "Kd3", "Bxa3", "f4", "O-O", "Qc2", "g6"],
    "Branch 12 — know this line.",
    ["Bishop's Opening"]
  ),
  lineFromMoves(
    13,
    "bishops",
    "Bishop's — Line 13",
    ["e4", "e5", "Bc4", "Nh6", "h3", "c6", "Ne2", "Ng8", "a4", "Qg5", "Ba2", "Nh6", "c4", "Qe7", "Qc2", "Qe6", "Bb3", "Qxh3"],
    "Branch 13 — know this line.",
    ["Bishop's Opening"]
  ),
  lineFromMoves(
    14,
    "bishops",
    "Bishop's — Line 14",
    ["e4", "e5", "Bc4", "Nf6", "h4", "h6", "Qh5", "Bc5", "Bxf7+", "Kf8", "d3", "a5", "Kd1", "Na6", "Bg6", "Nxh5", "a3", "Qf6"],
    "Branch 14 — know this line.",
    ["Bishop's Opening"]
  ),
  lineFromMoves(
    15,
    "bishops",
    "Bishop's — Line 15",
    ["e4", "e5", "Bc4", "Ne7", "Na3", "d6", "Nh3", "d5", "exd5", "Nd7", "g4", "a5", "f4", "Ra7", "Ke2", "Rg8", "d3", "b6"],
    "Branch 15 — know this line.",
    ["Bishop's Opening"]
  ),
  lineFromMoves(
    16,
    "bishops",
    "Bishop's — Line 16",
    ["e4", "e5", "Bc4", "a6", "Nc3", "d5", "Qe2", "Nc6", "Kf1", "Nb8", "Na4", "Bg4", "Bd3", "d4", "a3", "Bh5", "Nh3", "Nd7"],
    "Branch 16 — know this line.",
    ["Bishop's Opening"]
  ),
  lineFromMoves(
    17,
    "bishops",
    "Bishop's — Line 17",
    ["e4", "e5", "Bc4", "a5", "Qe2", "b6", "Nf3", "f5", "Na3", "Nc6", "Bd5", "Qe7", "Qd1", "Qh4", "Nb1", "h5", "d3", "Qg5"],
    "Branch 17 — know this line.",
    ["Bishop's Opening"]
  ),
  lineFromMoves(
    18,
    "bishops",
    "Bishop's — Line 18",
    ["e4", "e5", "Bc4", "b6", "Qf3", "a5", "Qh5", "Qe7", "Qd1", "Nf6", "c3", "Nh5", "d4", "Qg5", "a4", "Qxg2", "Ra2", "Qf1+"],
    "Branch 18 — know this line.",
    ["Bishop's Opening"]
  ),
  lineFromMoves(
    19,
    "bishops",
    "Bishop's — Line 19",
    ["e4", "e5", "Bc4", "b5", "Ke2", "a6", "b4", "Bxb4", "g4", "Ba3", "h3", "Kf8", "Kd3", "d6", "Qe1", "Bxc1", "Rh2", "Qd7"],
    "Branch 19 — know this line.",
    ["Bishop's Opening"]
  ),
];
