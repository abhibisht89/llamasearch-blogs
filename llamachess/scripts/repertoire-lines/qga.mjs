import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION = "Queen's Gambit Accepted (1.d4 d5 2.c4 dxc4) — 16 solid white repertoire lines.";

export default [
  mkLine(
    1,
    "qga_1",
    "Queen's Gambit Accepted — Main",
    "Line #1",
    "Core Queen's Gambit Accepted (1.d4 d5 2.c4 dxc4) line.",
    ["d4", "d5", "c4", "dxc4", "d5", "c5", "e3", "h5", "f3", "Be6", "Ke2", "Rh7", "Nh3", "Rh6", "Qd3", "f5", "Qe4", "Qc8"],
    ["Play d4 — your move here.", "Black plays d5.", "Play c4 — your move here.", "Black plays dxc4.", "Play d5 — your move here.", "Black plays c5.", "Play e3 — your move here.", "Black plays h5.", "Play f3 — your move here.", "Black plays Be6.", "Play Ke2 — your move here.", "Black plays Rh7.", "Play Nh3 — your move here.", "Black plays Rh6.", "Play Qd3 — your move here.", "Black plays f5.", "Play Qe4 — your move here.", "Black plays Qc8."],
    ["Queen's Gambit Accepted"]
  ),
  mkLine(
    2,
    "qga_2",
    "Queen's Gambit Accepted — Line 2",
    "Line #2",
    "Important branch 2.",
    ["d4", "d5", "c4", "dxc4", "a3", "c6", "Nc3", "c5", "Nb1", "Nc6", "b4", "e5", "dxc5", "g6", "Nd2", "Bd6", "Ne4", "Qh4"],
    ["Play d4 — your move here.", "Black plays d5.", "Play c4 — your move here.", "Black plays dxc4.", "Play a3 — your move here.", "Black plays c6.", "Play Nc3 — your move here.", "Black plays c5.", "Play Nb1 — your move here.", "Black plays Nc6.", "Play b4 — your move here.", "Black plays e5.", "Play dxc5 — your move here.", "Black plays g6.", "Play Nd2 — your move here.", "Black plays Bd6.", "Play Ne4 — your move here.", "Black plays Qh4."],
    ["Queen's Gambit Accepted"]
  ),
  lineFromMoves(
    3,
    "qga",
    "QGA — Line 3",
    ["d4", "d5", "c4", "dxc4", "a4", "c5", "g4", "h5", "Ra3", "hxg4", "Re3", "g6", "Qb3", "a5", "Re5", "Bd7", "Kd2", "f6"],
    "Branch 3 — know this line.",
    ["Queen's Gambit Accepted"]
  ),
  lineFromMoves(
    4,
    "qga",
    "QGA — Line 4",
    ["d4", "d5", "c4", "dxc4", "b3", "c5", "g4", "h6", "Bd2", "Qd7", "a4", "e5", "b4", "Na6", "Na3", "Ne7", "Nh3", "Qd5"],
    "Branch 4 — know this line.",
    ["Queen's Gambit Accepted"]
  ),
  lineFromMoves(
    5,
    "qga",
    "QGA — Line 5",
    ["d4", "d5", "c4", "dxc4", "b4", "e6", "Na3", "a5", "Qc2", "Nf6", "b5", "Nd5", "e4", "Bb4+", "Bd2", "Bf8", "Kd1", "Rg8"],
    "Branch 5 — know this line.",
    ["Queen's Gambit Accepted"]
  ),
  lineFromMoves(
    6,
    "qga",
    "QGA — Line 6",
    ["d4", "d5", "c4", "dxc4", "e3", "f6", "f4", "Bg4", "Kf2", "Bf3", "Qa4+", "c6", "Kg3", "h6", "Bd3", "Bxg2", "Qb3", "Bd5"],
    "Branch 6 — know this line.",
    ["Queen's Gambit Accepted"]
  ),
  lineFromMoves(
    7,
    "qga",
    "QGA — Line 7",
    ["d4", "d5", "c4", "dxc4", "e4", "f5", "Nf3", "Kd7", "Ng1", "Kc6", "exf5", "Qd7", "g4", "e6", "Na3", "Qe8", "Bd2", "Qe7"],
    "Branch 7 — know this line.",
    ["Queen's Gambit Accepted"]
  ),
  lineFromMoves(
    8,
    "qga",
    "QGA — Line 8",
    ["d4", "d5", "c4", "dxc4", "f3", "g6", "Bh6", "Qd7", "Qc2", "Qf5", "b3", "c6", "Qc1", "Qd7", "Qxc4", "Nf6", "Qc5", "Qd8"],
    "Branch 8 — know this line.",
    ["Queen's Gambit Accepted"]
  ),
  lineFromMoves(
    9,
    "qga",
    "QGA — Line 9",
    ["d4", "d5", "c4", "dxc4", "f4", "g5", "Qd3", "gxf4", "Qxh7", "Nf6", "b3", "Nc6", "Qg7", "Rh3", "Nf3", "Nd7", "Qh7", "Rxh7"],
    "Branch 9 — know this line.",
    ["Queen's Gambit Accepted"]
  ),
  lineFromMoves(
    10,
    "qga",
    "QGA — Line 10",
    ["d4", "d5", "c4", "dxc4", "g3", "h6", "Bf4", "Qd5", "Qc2", "Kd7", "Bd6", "e5", "Bh3+", "Ke8", "Qc3", "g6", "e3", "g5"],
    "Branch 10 — know this line.",
    ["Queen's Gambit Accepted"]
  ),
  lineFromMoves(
    11,
    "qga",
    "QGA — Line 11",
    ["d4", "d5", "c4", "dxc4", "g4", "Nd7", "Bg5", "Ndf6", "Qb3", "Nd7", "Kd2", "f5", "Ke3", "Nh6", "Bf6", "e5", "f4", "a6"],
    "Branch 11 — know this line.",
    ["Queen's Gambit Accepted"]
  ),
  lineFromMoves(
    12,
    "qga",
    "QGA — Line 12",
    ["d4", "d5", "c4", "dxc4", "h3", "c3", "Qa4+", "Qd7", "a3", "g5", "Rh2", "Bh6", "Qc4", "Kf8", "f4", "Ke8", "Nf3", "Qd8"],
    "Branch 12 — know this line.",
    ["Queen's Gambit Accepted"]
  ),
  lineFromMoves(
    13,
    "qga",
    "QGA — Line 13",
    ["d4", "d5", "c4", "dxc4", "h4", "Nd7", "Qc2", "c5", "b4", "Nb8", "Nf3", "Kd7", "Na3", "h5", "Bh6", "c3", "Qe4", "f5"],
    "Branch 13 — know this line.",
    ["Queen's Gambit Accepted"]
  ),
  lineFromMoves(
    14,
    "qga",
    "QGA — Line 14",
    ["d4", "d5", "c4", "dxc4", "Na3", "Nc6", "Qa4", "h6", "b4", "Nf6", "Kd2", "Bd7", "Ke3", "Nd5+", "Kf3", "Nxd4+", "Kg3", "Rg8"],
    "Branch 14 — know this line.",
    ["Queen's Gambit Accepted"]
  ),
  lineFromMoves(
    15,
    "qga",
    "QGA — Line 15",
    ["d4", "d5", "c4", "dxc4", "Nc3", "Be6", "Rb1", "c6", "Nf3", "h5", "Qd3", "g5", "Qd2", "g4", "a3", "Nf6", "e3", "Qxd4"],
    "Branch 15 — know this line.",
    ["Queen's Gambit Accepted"]
  ),
  lineFromMoves(
    16,
    "qga",
    "QGA — Line 16",
    ["d4", "d5", "c4", "dxc4", "Nd2", "Bd7", "e4", "e6", "Nh3", "Ke7", "f3", "Bb5", "g3", "h5", "d5", "e5", "Bxc4", "c6"],
    "Branch 16 — know this line.",
    ["Queen's Gambit Accepted"]
  ),
];
