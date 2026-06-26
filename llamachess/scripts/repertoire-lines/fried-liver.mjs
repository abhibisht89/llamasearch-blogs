import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION = "The Fried Liver Attack (1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5) — 15 brutal attacking lines.";

export default [
  mkLine(
    1,
    "fried_liver_classic",
    "Classic Fried Liver — ...Ke6",
    "Line #1 · Main · 4...d5",
    "Let's learn the Fried Liver! Sacrifice a knight, drag the king out, and win. Start with pawn to e4.",
    ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nxd5", "Nxf7", "Kxf7", "Qf3+", "Ke6", "Nc3", "Ne7", "Bxd5+", "Kd6", "Qe4+"],
    [
      "Let's get started with pawn to e4.",
      "Black plays ...e5.",
      "Knight to f3.",
      "Black defends with ...Nc6.",
      "Bishop to c4 — eyeing f7.",
      "Black plays ...Nf6.",
      "Knight to g5! The Fried Liver begins!",
      "Black strikes with ...d5.",
      "Take on d5.",
      "Black recaptures with the knight.",
      "Sacrifice on f7!! This is the whole point.",
      "King captures — he has to.",
      "Queen to f3 check! The king is exposed.",
      "Black walks forward to e6. Perfect!",
      "Develop with Nc3.",
      "Knight retreats to e7.",
      "Bishop takes d5 with check.",
      "King sidesteps to d6.",
      "Queen to e4 check — you're winning.",
    ],
    ["Fried Liver","Sacrifice"]
  ),
  mkLine(
    2,
    "fried_liver_kg8",
    "Fried Liver — ...Kg8",
    "Line #2 · King hides on g8",
    "Some opponents hide the king on g8. Grab material and keep checking.",
    ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nxd5", "Nxf7", "Kxf7", "Qf3+", "Kg8", "Bxd5+", "Qxd5", "Qxd5+", "Be6", "Qxe5+"],
    [
      "e4.",
      "e5.",
      "Nf3.",
      "Nc6.",
      "Bc4.",
      "Nf6.",
      "Ng5!",
      "d5.",
      "exd5.",
      "Nxd5.",
      "Nxf7!!",
      "Kxf7.",
      "Qf3+.",
      "Kg8.",
      "Bxd5+ fork!",
      "Qxd5.",
      "Qxd5+.",
      "Be6.",
      "Qxe5+ — Black is busted.",
    ],
    ["Fried Liver"]
  ),
  mkLine(
    3,
    "fried_liver_polerio",
    "Polerio Defense — ...Na5",
    "Line #3 · Most common defense",
    "Black chases your bishop with ...Na5. Keep the initiative with Bb5+.",
    ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Na5", "Bb5+", "c6", "dxc6", "bxc6", "Be2", "h6", "Nf3", "e4", "Ne5"],
    [
      "e4.",
      "e5.",
      "Nf3.",
      "Nc6.",
      "Bc4.",
      "Nf6.",
      "Ng5.",
      "d5.",
      "exd5.",
      "Na5 — Polerio.",
      "Bb5+!",
      "c6.",
      "dxc6.",
      "bxc6.",
      "Be2 — solid retreat.",
      "h6.",
      "Nf3.",
      "e4.",
      "Ne5 — strong outpost.",
    ],
    ["Polerio"]
  ),
  lineFromMoves(
    4,
    "fried",
    "Traxler — ...Bc5",
    ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Bc5", "O-O", "Nxe4", "Nxe4", "d5", "Bxd5", "Qxd5", "Re1"],
    "When Black plays the crazy Traxler, castle and take the pawn.",
    ["Traxler"]
  ),
  lineFromMoves(
    5,
    "fried",
    "Ulvestad — ...b5",
    ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "b5", "Bf1", "Nd4", "d3"],
    "Black tries ...b5. Retreat the bishop and keep developing.",
    ["Ulvestad"]
  ),
  lineFromMoves(
    6,
    "fried",
    "Main — ...Nd4",
    ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nd4", "c3", "Nxd5", "Nxf7", "Kxf7", "Qf3+", "Ke6", "Bxd5+", "Kd6", "Qe4+"],
    "The ...Nd4 fork — push c3 and keep attacking.",
    ["Nd4"]
  ),
  lineFromMoves(
    7,
    "fried",
    "Main — ...h6",
    ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "h6", "Nxf7", "Kxf7", "Qf3+", "Kg8", "Qe4", "Ne7", "O-O", "c6", "dxc6"],
    "Black asks the knight to leave. Take on f7 anyway!",
    ["h6"]
  ),
  lineFromMoves(
    8,
    "fried",
    "vs ...Nxe4",
    ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Nxe4", "O-O", "Nxf2", "Kxf2", "d5", "Bxd5+", "Be6", "Bxe6", "fxe6", "d4"],
    "Black grabs e4. Take the fork on f2 and open the center.",
    ["Nxe4"]
  ),
  lineFromMoves(
    9,
    "fried",
    "Polerio — Quiet Be2",
    ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Na5", "Bb5+", "c6", "dxc6", "bxc6", "Be2", "h6", "Nf3", "e4", "Ne5", "Qe7", "Ng4"],
    "The solid Be2 retreat — keep pressure without overcommitting.",
    ["Be2"]
  ),
  lineFromMoves(
    10,
    "fried",
    "Polerio — d4 break",
    ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Na5", "Bb5+", "c6", "dxc6", "bxc6", "Be2", "h6", "Nf3", "e4", "Ne5", "Qe7", "Ng4"],
    "Hit back in the center — Polerio with Be2.",
    ["Polerio"]
  ),
  lineFromMoves(
    11,
    "fried",
    "Traxler Punish — Bxd5",
    ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Bc5", "O-O", "Nxe4", "Nxe4", "d5", "Bxd5", "Qxd5", "Re1", "Be6", "c3"],
    "Against the Traxler, take on d5 and keep the initiative.",
    ["Traxler"]
  ),
  lineFromMoves(
    12,
    "fried",
    "Main — ...Ncb4",
    ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nxd5", "Nxf7", "Kxf7", "Qf3+", "Ke6", "Nc3", "Ncb4", "a3", "Nxc2+", "Kd1", "Nxa1", "Qe4+"],
    "Black tries ...Ncb4. Keep checking!",
    ["Tactics"]
  ),
  lineFromMoves(
    13,
    "fried",
    "Main — Nd4 c3",
    ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nd4", "c3", "Nxd5", "Nxf7", "Kxf7", "Qf3+", "Ke6", "Bxd5+", "Kd6", "Qe4+"],
    "Trade on d5 and keep the attack — Nd4 line.",
    ["Nd4"]
  ),
  lineFromMoves(
    14,
    "fried",
    "vs ...Nxe4 O-O",
    ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Nxe4", "O-O", "Nxf2", "Kxf2", "d5", "Bxd5+", "Be6", "Bxe6", "fxe6", "Nc3"],
    "Grab e4? Castle, take the fork, and develop.",
    ["Nxe4"]
  ),
  lineFromMoves(
    15,
    "fried",
    "Ulvestad — ...Nd4",
    ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "b5", "Bf1", "Nd4", "d3", "Nf5", "g4", "h5", "f4", "exf4", "Qe2+"],
    "The Ulvestad — push g4 and f4.",
    ["Ulvestad"]
  ),
];
