import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION = "Queen's Gambit Declined (1.d4 d5 2.c4 e6) — 20 classical white lines.";

export default [
  mkLine(
    1,
    "qgd_1",
    "Queen's Gambit Declined — Main",
    "Line #1",
    "Core Queen's Gambit Declined (1.d4 d5 2.c4 e6) line.",
    ["d4", "d5", "c4", "e6", "c5", "a6", "g4", "Nd7", "Bg5", "a5", "b3", "Be7", "Bc1", "Ngf6", "Bg2", "Nxg4", "Bf1", "Rb8"],
    ["Play d4 — your move here.", "Black plays d5.", "Play c4 — your move here.", "Black plays e6.", "Play c5 — your move here.", "Black plays a6.", "Play g4 — your move here.", "Black plays Nd7.", "Play Bg5 — your move here.", "Black plays a5.", "Play b3 — your move here.", "Black plays Be7.", "Play Bc1 — your move here.", "Black plays Ngf6.", "Play Bg2 — your move here.", "Black plays Nxg4.", "Play Bf1 — your move here.", "Black plays Rb8."],
    ["Queen's Gambit Declined"]
  ),
  mkLine(
    2,
    "qgd_2",
    "Queen's Gambit Declined — Line 2",
    "Line #2",
    "Important branch 2.",
    ["d4", "d5", "c4", "e6", "cxd5", "Bd6", "h3", "Nf6", "Kd2", "a5", "Rh2", "Ke7", "f4", "b5", "e4", "Qf8", "a4", "Ng8"],
    ["Play d4 — your move here.", "Black plays d5.", "Play c4 — your move here.", "Black plays e6.", "Play cxd5 — your move here.", "Black plays Bd6.", "Play h3 — your move here.", "Black plays Nf6.", "Play Kd2 — your move here.", "Black plays a5.", "Play Rh2 — your move here.", "Black plays Ke7.", "Play f4 — your move here.", "Black plays b5.", "Play e4 — your move here.", "Black plays Qf8.", "Play a4 — your move here.", "Black plays Ng8."],
    ["Queen's Gambit Declined"]
  ),
  mkLine(
    3,
    "qgd_3",
    "Queen's Gambit Declined — Line 3",
    "Line #3",
    "Important branch 3.",
    ["d4", "d5", "c4", "e6", "a3", "Bxa3", "f4", "b6", "Nf3", "a5", "Bd2", "Nf6", "Ng5", "Nh5", "Rg1", "g6", "c5", "c6"],
    ["Play d4 — your move here.", "Black plays d5.", "Play c4 — your move here.", "Black plays e6.", "Play a3 — your move here.", "Black plays Bxa3.", "Play f4 — your move here.", "Black plays b6.", "Play Nf3 — your move here.", "Black plays a5.", "Play Bd2 — your move here.", "Black plays Nf6.", "Play Ng5 — your move here.", "Black plays Nh5.", "Play Rg1 — your move here.", "Black plays g6.", "Play c5 — your move here.", "Black plays c6."],
    ["Queen's Gambit Declined"]
  ),
  lineFromMoves(
    4,
    "qgd",
    "QGD — Line 4",
    ["d4", "d5", "c4", "e6", "a4", "Nh6", "h3", "f5", "Qd2", "f4", "Na3", "Nc6", "cxd5", "Ne5", "Rh2", "Kd7", "b4", "a6"],
    "Branch 4 — know this line.",
    ["Queen's Gambit Declined"]
  ),
  lineFromMoves(
    5,
    "qgd",
    "QGD — Line 5",
    ["d4", "d5", "c4", "e6", "b3", "Nf6", "Nc3", "Nh5", "h3", "dxc4", "Kd2", "g6", "Na4", "Bd6", "Nf3", "Qg5+", "Ke1", "Bf4"],
    "Branch 5 — know this line.",
    ["Queen's Gambit Declined"]
  ),
  lineFromMoves(
    6,
    "qgd",
    "QGD — Line 6",
    ["d4", "d5", "c4", "e6", "b4", "a5", "f4", "c6", "Kf2", "h6", "Qb3", "Na6", "Qe3", "a4", "Kf3", "Ra7", "Na3", "b5"],
    "Branch 6 — know this line.",
    ["Queen's Gambit Declined"]
  ),
  lineFromMoves(
    7,
    "qgd",
    "QGD — Line 7",
    ["d4", "d5", "c4", "e6", "e3", "a6", "f4", "h6", "Bd2", "Qg5", "Nc3", "a5", "Na4", "c6", "h4", "Qg3+", "Ke2", "Rh7"],
    "Branch 7 — know this line.",
    ["Queen's Gambit Declined"]
  ),
  lineFromMoves(
    8,
    "qgd",
    "QGD — Line 8",
    ["d4", "d5", "c4", "e6", "e4", "a6", "Nh3", "g5", "a3", "Bd7", "Nc3", "Bc5", "Kd2", "b5", "cxd5", "h6", "dxc5", "Nc6"],
    "Branch 8 — know this line.",
    ["Queen's Gambit Declined"]
  ),
  lineFromMoves(
    9,
    "qgd",
    "QGD — Line 9",
    ["d4", "d5", "c4", "e6", "f3", "b6", "Bf4", "f6", "g3", "Be7", "Qa4+", "Nd7", "Qb4", "c6", "Qxb6", "h5", "h3", "e5"],
    "Branch 9 — know this line.",
    ["Queen's Gambit Declined"]
  ),
  lineFromMoves(
    10,
    "qgd",
    "QGD — Line 10",
    ["d4", "d5", "c4", "e6", "f4", "b5", "Qa4", "f5", "Bd2", "Nc6", "Kd1", "h6", "Nh3", "h5", "Qc2", "Ne5", "Ng5", "Nf7"],
    "Branch 10 — know this line.",
    ["Queen's Gambit Declined"]
  ),
  lineFromMoves(
    11,
    "qgd",
    "QGD — Line 11",
    ["d4", "d5", "c4", "e6", "g3", "c6", "Bd2", "g6", "Qa4", "g5", "b3", "Bh6", "Qa3", "f5", "c5", "Qb6", "e3", "f4"],
    "Branch 11 — know this line.",
    ["Queen's Gambit Declined"]
  ),
  lineFromMoves(
    12,
    "qgd",
    "QGD — Line 12",
    ["d4", "d5", "c4", "e6", "g4", "c5", "Be3", "Nd7", "Nh3", "a5", "b4", "Ne7", "Nc3", "a4", "Ne4", "f5", "Qb3", "Nb8"],
    "Branch 12 — know this line.",
    ["Queen's Gambit Declined"]
  ),
  lineFromMoves(
    13,
    "qgd",
    "QGD — Line 13",
    ["d4", "d5", "c4", "e6", "h3", "f6", "Qb3", "Be7", "Qc2", "Nd7", "f4", "Bb4+", "Bd2", "e5", "g3", "dxc4", "dxe5", "Kf7"],
    "Branch 13 — know this line.",
    ["Queen's Gambit Declined"]
  ),
  lineFromMoves(
    14,
    "qgd",
    "QGD — Line 14",
    ["d4", "d5", "c4", "e6", "h4", "f5", "Bg5", "Qd6", "e4", "Qb6", "Qd3", "Nc6", "Qc2", "fxe4", "Ne2", "h5", "c5", "Nb8"],
    "Branch 14 — know this line.",
    ["Queen's Gambit Declined"]
  ),
  lineFromMoves(
    15,
    "qgd",
    "QGD — Line 15",
    ["d4", "d5", "c4", "e6", "Na3", "g6", "Qd2", "e5", "dxe5", "Ne7", "cxd5", "Na6", "Qh6", "Qd7", "h4", "Kd8", "Qxh7", "Bg7"],
    "Branch 15 — know this line.",
    ["Queen's Gambit Declined"]
  ),
  lineFromMoves(
    16,
    "qgd",
    "QGD — Line 16",
    ["d4", "d5", "c4", "e6", "Nc3", "g5", "Rb1", "Qe7", "Nh3", "f6", "Ng1", "Bd7", "h4", "Nh6", "e3", "a5", "g4", "Ba4"],
    "Branch 16 — know this line.",
    ["Queen's Gambit Declined"]
  ),
  lineFromMoves(
    17,
    "qgd",
    "QGD — Line 17",
    ["d4", "d5", "c4", "e6", "Nd2", "h6", "f3", "Qf6", "h3", "Ke7", "Qb3", "g5", "a3", "b6", "Qc2", "Kd8", "g4", "Ke7"],
    "Branch 17 — know this line.",
    ["Queen's Gambit Declined"]
  ),
  lineFromMoves(
    18,
    "qgd",
    "QGD — Line 18",
    ["d4", "d5", "c4", "e6", "Bd2", "h5", "Qb3", "Nd7", "Qd3", "Bb4", "Qh7", "Be7", "Bf4", "Kf8", "cxd5", "Bf6", "Be5", "g5"],
    "Branch 18 — know this line.",
    ["Queen's Gambit Declined"]
  ),
  lineFromMoves(
    19,
    "qgd",
    "QGD — Line 19",
    ["d4", "d5", "c4", "e6", "Be3", "e5", "Qc1", "c6", "g4", "f6", "Qd2", "Qa5", "Bh6", "Qb6", "Bg5", "Nd7", "Qa5", "Nh6"],
    "Branch 19 — know this line.",
    ["Queen's Gambit Declined"]
  ),
  lineFromMoves(
    20,
    "qgd",
    "QGD — Line 20",
    ["d4", "d5", "c4", "e6", "Bf4", "dxc4", "Na3", "c3", "h3", "cxb2", "Bd6", "bxa1=B", "e3", "e5", "dxe5", "Qe7", "g4", "Qf6"],
    "Branch 20 — know this line.",
    ["Queen's Gambit Declined"]
  ),
];
