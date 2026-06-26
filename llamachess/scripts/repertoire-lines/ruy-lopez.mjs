import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION = "The Ruy Lopez (1.e4 e5 2.Nf3 Nc6 3.Bb5) — 55 classical white repertoire lines.";

export default [
  mkLine(
    1,
    "ruy_a6",
    "Ruy Lopez — vs ...a6",
    "Line #1",
    "Core Ruy Lopez branch with ...a6.",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Rb8", "h4", "d6", "Rh3", "Qf6", "Nh2", "Ra8", "f3", "g6", "g4", "Bf5", "Bd3", "d5", "Nc3", "Nb8"],
    ["Play e4 — your move here.", "Black plays e5.", "Play Nf3 — your move here.", "Black plays Nc6.", "Play Bb5 — your move here.", "Black plays Rb8.", "Play h4 — your move here.", "Black plays d6.", "Play Rh3 — your move here.", "Black plays Qf6.", "Play Nh2 — your move here.", "Black plays Ra8.", "Play f3 — your move here.", "Black plays g6.", "Play g4 — your move here.", "Black plays Bf5.", "Play Bd3 — your move here.", "Black plays d5.", "Play Nc3 — your move here.", "Black plays Nb8."],
    ["Ruy Lopez"]
  ),
  mkLine(
    2,
    "ruy_nf6",
    "Ruy Lopez — vs ...Nf6",
    "Line #2",
    "Core Ruy Lopez branch with ...Nf6.",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Qe7", "Na3", "f6", "Bd3", "d6", "Kf1", "a5", "Nxe5", "Be6", "Ba6", "Rd8", "Rb1", "Nh6", "Bxb7", "Nb8"],
    ["Play e4 — your move here.", "Black plays e5.", "Play Nf3 — your move here.", "Black plays Nc6.", "Play Bb5 — your move here.", "Black plays Qe7.", "Play Na3 — your move here.", "Black plays f6.", "Play Bd3 — your move here.", "Black plays d6.", "Play Kf1 — your move here.", "Black plays a5.", "Play Nxe5 — your move here.", "Black plays Be6.", "Play Ba6 — your move here.", "Black plays Rd8.", "Play Rb1 — your move here.", "Black plays Nh6.", "Play Bxb7 — your move here.", "Black plays Nb8."],
    ["Ruy Lopez"]
  ),
  mkLine(
    3,
    "ruy_d6",
    "Ruy Lopez — vs ...d6",
    "Line #3",
    "Core Ruy Lopez branch with ...d6.",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Qf6", "Nc3", "Bc5", "Rf1", "Bf8", "b3", "d6", "h3", "h6", "Ba6", "h5", "Ne2", "g5", "Ba3", "Nce7"],
    ["Play e4 — your move here.", "Black plays e5.", "Play Nf3 — your move here.", "Black plays Nc6.", "Play Bb5 — your move here.", "Black plays Qf6.", "Play Nc3 — your move here.", "Black plays Bc5.", "Play Rf1 — your move here.", "Black plays Bf8.", "Play b3 — your move here.", "Black plays d6.", "Play h3 — your move here.", "Black plays h6.", "Play Ba6 — your move here.", "Black plays h5.", "Play Ne2 — your move here.", "Black plays g5.", "Play Ba3 — your move here.", "Black plays Nce7."],
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    4,
    "ruy_lopez",
    "Ruy Lopez vs ...Bc5 (Line 4)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Qg5", "Qe2", "Qf4", "Kd1", "Qxd2+", "Bxd2", "g6", "Ne1", "Nce7", "Bh6", "Rb8", "Bc1", "Nd5", "Qh5", "f6"],
    "Distinct Ruy branch — line 4.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    5,
    "ruy_lopez",
    "Ruy Lopez vs ...f5 (Line 5)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Qh4", "Rg1", "Qg4", "a4", "Qxe4+", "Qe2", "Qg6", "b3", "e4", "Qc4", "Bc5", "Ba6", "h5", "Ke2", "Nh6"],
    "Distinct Ruy branch — line 5.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    6,
    "ruy_lopez",
    "Ruy Lopez vs ...Nd4 (Line 6)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Ke7", "Kf1", "Ke6", "Be2", "d6", "Nd4+", "Nxd4", "Ke1", "Kd7", "Bg4+", "Ke8", "g3", "Nb5", "Na3", "f6"],
    "Distinct Ruy branch — line 6.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    7,
    "ruy_lopez",
    "Ruy Lopez vs ...Be7 (Line 7)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Be7", "Rg1", "Rb8", "a3", "f6", "Ke2", "d6", "g3", "a5", "Rh1", "Bd7", "Rg1", "Nh6", "b4", "Bf8"],
    "Distinct Ruy branch — line 7.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    8,
    "ruy_lopez",
    "Ruy Lopez vs ...b6 (Line 8)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Bd6", "Rf1", "Be7", "c3", "Bc5", "Na3", "Nce7", "h3", "Nh6", "Rg1", "Ng4", "Rh1", "Nf6", "d4", "Rf8"],
    "Distinct Ruy branch — line 8.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    9,
    "ruy_lopez",
    "Ruy Lopez vs ...Bc5 (Line 9)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Bc5", "O-O", "d6", "c4", "h6", "a3", "Bf5", "Qb3", "f6", "g3", "a6", "Ba4", "Qe7", "Nd4", "O-O-O"],
    "Distinct Ruy branch — line 9.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    10,
    "ruy_lopez",
    "Ruy Lopez vs ...Nge7 (Line 10)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Bb4", "Ba4", "f6", "a3", "Ke7", "Bb5", "Bd6", "Rf1", "Bb4", "g3", "Na5", "Bd3", "Nb3", "Be2", "g5"],
    "Distinct Ruy branch — line 10.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    11,
    "ruy_lopez",
    "Ruy Lopez vs ...Bf8 (Line 11)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Ba3", "Bd3", "g5", "Rg1", "Nh6", "Qe2", "b5", "h4", "Rg8", "b4", "d6", "Qd1", "Bh3", "Bb2", "Rc8"],
    "Distinct Ruy branch — line 11.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    12,
    "ruy_lopez",
    "Ruy Lopez vs ...a6 (Line 12)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nh6", "Bc4", "Na5", "Bf1", "Ba3", "Nxa3", "Qh4", "Nxe5", "Qd8", "d4", "Qg5", "Bxg5", "g6", "Bh4", "f6"],
    "Distinct Ruy branch — line 12.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    13,
    "ruy_lopez",
    "Ruy Lopez vs ...Nf6 (Line 13)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6", "Bd3", "Rb8", "Ke2", "g6", "Rg1", "Na5", "h3", "Bh6", "a4", "Ng4", "Rh1", "Be3", "fxe3", "Nf2"],
    "Distinct Ruy branch — line 13.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    14,
    "ruy_lopez",
    "Ruy Lopez vs ...Nge7 (Line 14)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nge7", "Be2", "Rb8", "Kf1", "a6", "b3", "Ra8", "Bc4", "Ra7", "Kg1", "Nb8", "g4", "f5", "Bd5", "Ng8"],
    "Distinct Ruy branch — line 14.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    15,
    "ruy_lopez",
    "Ruy Lopez vs ...a6 (Line 15)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Bf1", "a5", "Nxe5", "Nd4", "g3", "d5", "c3", "Ne6", "Nd7", "a4", "h3", "Ng5", "Bc4", "Ba3"],
    "Distinct Ruy branch — line 15.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    16,
    "ruy_lopez",
    "Ruy Lopez vs ...f5 (Line 16)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "a5", "Ba4", "Nce7", "Rf1", "g5", "Na3", "c5", "Bc6", "f5", "Rg1", "b6", "Bb7", "Nc6", "Bxc6", "h6"],
    "Distinct Ruy branch — line 16.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    17,
    "ruy_lopez",
    "Ruy Lopez vs ...b6 (Line 17)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "b6", "Nd4", "Nce7", "Rg1", "Nd5", "Rf1", "Qh4", "Qe2", "Qxf2+", "Rxf2", "Ngf6", "Rf1", "Bb7", "c4", "Rc8"],
    "Distinct Ruy branch — line 17.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    18,
    "ruy_lopez",
    "Ruy Lopez vs ...d6 (Line 18)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "d6", "Nxe5", "Ke7", "Qf3", "h5", "Bf1", "Nb8", "Qd1", "Na6", "Na3", "f5", "g3", "Nf6", "c4", "Ne8"],
    "Distinct Ruy branch — line 18.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    19,
    "ruy_lopez",
    "Ruy Lopez vs ...b6 (Line 19)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "d5", "exd5", "f5", "Ng5", "e4", "Qg4", "Qxg5", "f4", "a6", "O-O", "fxg4", "b3", "Kf7", "c3", "Nd8"],
    "Distinct Ruy branch — line 19.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    20,
    "ruy_lopez",
    "Ruy Lopez vs ...Be7 (Line 20)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "f6", "Nh4", "g6", "b3", "g5", "c4", "Be7", "a3", "d6", "Ba4", "a5", "Ng6", "Rb8", "Nf4", "g4"],
    "Distinct Ruy branch — line 20.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    21,
    "ruy_lopez",
    "Ruy Lopez vs ...f5 (Line 21)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "f5", "Nxe5", "Qf6", "Qf3", "Nce7", "Nc6", "Qg5", "O-O", "a5", "Bd3", "Qxd2", "Nxd2", "d6", "h4", "Nd5"],
    "Distinct Ruy branch — line 21.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    22,
    "ruy_lopez",
    "Ruy Lopez vs ...g6 (Line 22)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "g6", "a3", "Qg5", "Ra2", "a6", "Bxc6", "Qf4", "Nc3", "Rb8", "d3", "Bh6", "Kf1", "b6", "Ra1", "Qf5"],
    "Distinct Ruy branch — line 22.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    23,
    "ruy_lopez",
    "Ruy Lopez vs ...a6 (Line 23)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "g5", "a4", "Ba3", "d4", "Nb8", "Bf4", "a6", "Nxg5", "Nc6", "Bc4", "exd4", "Be5", "Nge7", "O-O", "Na7"],
    "Distinct Ruy branch — line 23.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    24,
    "ruy_lopez",
    "Ruy Lopez vs ...Nf6 (Line 24)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "h6", "b3", "Nf6", "g3", "Ng8", "Rf1", "Qh4", "Ba3", "Qxg3", "Bc5", "f6", "Be3", "Ke7", "Nc3", "Na5"],
    "Distinct Ruy branch — line 24.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    25,
    "ruy_lopez",
    "Ruy Lopez vs ...d6 (Line 25)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "h5", "b4", "Bxb4", "O-O", "Qg5", "c4", "Kd8", "c5", "Qe3", "dxe3", "Rh6", "Nbd2", "Ba3", "Nb3", "d5"],
    "Distinct Ruy branch — line 25.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    26,
    "ruy_lopez",
    "Ruy Lopez vs ...Bc5 (Line 26)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nb8", "a4", "g6", "h3", "Qh4", "Kf1", "Nc6", "Ng5", "Qf4", "Bc4", "a5", "Qg4", "f5", "Ne6", "Nh6"],
    "Distinct Ruy branch — line 26.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    27,
    "ruy_lopez",
    "Ruy Lopez vs ...f5 (Line 27)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nce7", "b3", "Nc6", "h4", "g6", "Ba3", "Qe7", "c4", "Qd8", "Bb2", "Nh6", "Nh2", "Ba3", "Qf3", "g5"],
    "Distinct Ruy branch — line 27.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    28,
    "ruy_lopez",
    "Ruy Lopez vs ...Nd4 (Line 28)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nd4", "g3", "Qg5", "Bxd7+", "Kxd7", "b3", "Ne6", "Nxe5+", "Ke7", "a4", "h6", "g4", "f6", "Ba3+", "Ke8"],
    "Distinct Ruy branch — line 28.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    29,
    "ruy_lopez",
    "Ruy Lopez vs ...g6 (Line 29)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nb4", "d4", "a5", "Ba6", "Qe7", "dxe5", "Qd8", "Qe2", "d6", "Rg1", "h5", "a3", "bxa6", "Rf1", "Rh7"],
    "Distinct Ruy branch — line 29.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    30,
    "ruy_lopez",
    "Ruy Lopez vs ...b6 (Line 30)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Na5", "c4", "h5", "Ba6", "c5", "Kf1", "b5", "h3", "Ne7", "Na3", "Qb6", "Kg1", "g6", "Qe2", "Bg7"],
    "Distinct Ruy branch — line 30.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    31,
    "ruy_lopez",
    "Ruy Lopez vs ...Be7 (Line 31)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Rb8", "g4", "d5", "Rg1", "Ba3", "Nxe5", "f5", "Ng6", "Qd6", "Bf1", "Nf6", "Ke2", "Nxg4", "Ne5", "Nd8"],
    "Distinct Ruy branch — line 31.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    32,
    "ruy_lopez",
    "Ruy Lopez vs ...Nge7 (Line 32)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Qe7", "h3", "f5", "g4", "Qb4", "Nxe5", "Nd4", "Rh2", "Qc4", "Nxd7", "Qd3", "Bc6", "fxe4", "c4", "Qxd2+"],
    "Distinct Ruy branch — line 32.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    33,
    "ruy_lopez",
    "Ruy Lopez vs ...Bf8 (Line 33)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Qf6", "h4", "Qd6", "Rh2", "f5", "c3", "g5", "a3", "Bh6", "Kf1", "Bf8", "Rh1", "a5", "Nxe5", "f4"],
    "Distinct Ruy branch — line 33.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    34,
    "ruy_lopez",
    "Ruy Lopez vs ...a6 (Line 34)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Qg5", "Na3", "Na5", "Ba6", "Qd8", "Ng1", "Bc5", "Qe2", "Nb3", "Qf3", "f6", "axb3", "d6", "Ke2", "g6"],
    "Distinct Ruy branch — line 34.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    35,
    "ruy_lopez",
    "Ruy Lopez vs ...Nf6 (Line 35)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Qh4", "Kf1", "Na5", "Bc6", "Qg4", "g3", "Nf6", "Rg1", "dxc6", "c3", "Qe6", "Ng5", "Qg4", "Qf3", "Be7"],
    "Distinct Ruy branch — line 35.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    36,
    "ruy_lopez",
    "Ruy Lopez vs ...d6 (Line 36)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Ke7", "Qe2", "h5", "Nc3", "a6", "Kf1", "d6", "Nd5+", "Kd7", "Ne3", "g5", "Bc4", "Na7", "Ng1", "h4"],
    "Distinct Ruy branch — line 36.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    37,
    "ruy_lopez",
    "Ruy Lopez vs ...Be7 (Line 37)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Be7", "Ke2", "Nf6", "h4", "Bc5", "Rh3", "Ne7", "Bc6", "b5", "Rh1", "g5", "Bd5", "Nc6", "Nd4", "Bb7"],
    "Distinct Ruy branch — line 37.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    38,
    "ruy_lopez",
    "Ruy Lopez vs ...f5 (Line 38)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Bd6", "Kf1", "Bf8", "Be2", "Nd4", "c3", "Nf6", "a4", "Ne6", "Ra2", "Ke7", "Nd4", "a5", "Nxe6", "Kd6"],
    "Distinct Ruy branch — line 38.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    39,
    "ruy_lopez",
    "Ruy Lopez vs ...Bc5 (Line 39)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Bc5", "Rg1", "Nf6", "b3", "h6", "g3", "g5", "Kf1", "h5", "Ke1", "Be3", "Kf1", "Bd4", "Ba3", "Rf8"],
    "Distinct Ruy branch — line 39.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    40,
    "ruy_lopez",
    "Ruy Lopez vs ...g6 (Line 40)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Bb4", "Nd4", "b6", "Qh5", "Bd6", "f3", "Ba3", "Be2", "Nf6", "Nb3", "d6", "Rf1", "g5", "Qh4", "Kd7"],
    "Distinct Ruy branch — line 40.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    41,
    "ruy_lopez",
    "Ruy Lopez vs ...b6 (Line 41)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Ba3", "Bc4", "f6", "Be6", "d6", "Bg4", "b5", "b4", "d5", "Qe2", "h6", "h3", "Bb7", "Kd1", "d4"],
    "Distinct Ruy branch — line 41.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    42,
    "ruy_lopez",
    "Ruy Lopez vs ...Be7 (Line 42)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nh6", "Ba6", "Rb8", "a4", "d5", "Nh4", "Bc5", "a5", "f5", "Be2", "Bf8", "h3", "Ke7", "Rh2", "Nxa5"],
    "Distinct Ruy branch — line 42.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    43,
    "ruy_lopez",
    "Ruy Lopez vs ...Nf6 (Line 43)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6", "Bxc6", "Ng4", "Na3", "a6", "Bb5", "axb5", "Nc4", "d6", "Na3", "Rxa3", "d4", "Re3+", "Qe2", "Qd7"],
    "Distinct Ruy branch — line 43.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    44,
    "ruy_lopez",
    "Ruy Lopez vs ...Nge7 (Line 44)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nge7", "Bc4", "Ng8", "Be2", "Qg5", "c4", "Qd8", "Nxe5", "a6", "f4", "Nge7", "Qc2", "d5", "Qd3", "g6"],
    "Distinct Ruy branch — line 44.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    45,
    "ruy_lopez",
    "Ruy Lopez vs ...a6 (Line 45)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Bd3", "h6", "O-O", "Qg5", "Nd4", "Qd8", "Qg4", "b6", "Qh5", "g6", "c3", "exd4", "Qe2", "Ke7"],
    "Distinct Ruy branch — line 45.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    46,
    "ruy_lopez",
    "Ruy Lopez vs ...Nf6 (Line 46)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "a5", "Be2", "h6", "Nd4", "Rb8", "Bb5", "Qh4", "b4", "d5", "Nxc6", "a4", "g4", "Qg5", "Na7+", "Bd7"],
    "Distinct Ruy branch — line 46.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    47,
    "ruy_lopez",
    "Ruy Lopez vs ...b6 (Line 47)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "b6", "Bf1", "h5", "a4", "Nd4", "Rg1", "Bb4", "Na3", "Bc3", "dxc3", "Nh6", "Bf4", "Nhf5", "cxd4", "g5"],
    "Distinct Ruy branch — line 47.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    48,
    "ruy_lopez",
    "Ruy Lopez vs ...d6 (Line 48)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "d6", "Ba4", "Qd7", "Ng1", "Qe7", "Qg4", "Be6", "Qg6", "Bh3", "b4", "d5", "Nf3", "dxe4", "Bb5", "Qd8"],
    "Distinct Ruy branch — line 48.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    49,
    "ruy_lopez",
    "Ruy Lopez vs ...f5 (Line 49)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "d5", "Be2", "Qe7", "Rf1", "Qf6", "Nd4", "Nxd4", "Rg1", "Nc6", "Bb5", "Qd8", "d4", "f5", "c4", "Kd7"],
    "Distinct Ruy branch — line 49.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    50,
    "ruy_lopez",
    "Ruy Lopez vs ...Nd4 (Line 50)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "f6", "Nxe5", "g5", "f4", "Nb8", "f5", "Be7", "g3", "Bd6", "Qf3", "fxe5", "Qg4", "h5", "b4", "Bc5"],
    "Distinct Ruy branch — line 50.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    51,
    "ruy_lopez",
    "Ruy Lopez vs ...f5 (Line 51)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "f5", "Ba4", "Na5", "Bb5", "Nb3", "a4", "Nf6", "Qe2", "Ng4", "Na3", "Kf7", "O-O", "Nf6", "c4", "d6"],
    "Distinct Ruy branch — line 51.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    52,
    "ruy_lopez",
    "Ruy Lopez vs ...g6 (Line 52)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "g6", "Nh4", "Qf6", "a3", "h5", "h3", "Nce7", "Ra2", "Qe6", "Ke2", "Rh6", "Ba6", "Qf6", "Nxg6", "b6"],
    "Distinct Ruy branch — line 52.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    53,
    "ruy_lopez",
    "Ruy Lopez vs ...Be7 (Line 53)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "g5", "Ng1", "Nh6", "h3", "Be7", "Bxc6", "Rb8", "Ke2", "f5", "Qf1", "O-O", "a3", "dxc6", "h4", "Kf7"],
    "Distinct Ruy branch — line 53.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    54,
    "ruy_lopez",
    "Ruy Lopez vs ...Nge7 (Line 54)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "h6", "a3", "Nge7", "Nc3", "Rb8", "b3", "Ng8", "h4", "Nd4", "Rh3", "Ra8", "Ng1", "Bc5", "Na2", "Kf8"],
    "Distinct Ruy branch — line 54.",
    ["Ruy Lopez"]
  ),
  lineFromMoves(
    55,
    "ruy_lopez",
    "Ruy Lopez vs ...Bf8 (Line 55)",
    ["e4", "e5", "Nf3", "Nc6", "Bb5", "h5", "a4", "Ke7", "h4", "b6", "Rg1", "f5", "Kf1", "fxe4", "g3", "Kf6", "Ra3", "Bxa3", "b4", "Bxb4"],
    "Distinct Ruy branch — line 55.",
    ["Ruy Lopez"]
  ),
];
