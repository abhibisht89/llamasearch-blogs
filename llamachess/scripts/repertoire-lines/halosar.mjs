import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION =
  "Very overpowered trap — the Halosar Gambit (1.d4 d5 2.e4 dxe4 3.Nc3). Sacrifice pawns for a crushing attack on f7.";

const CORE = ["d4","d5","e4","dxe4","Nc3","Nf6","f3","exf3","Nxf3","Bg4","Bc4","e6","h3","Bh5","g4","Bg6","Ne5","Bh5","Qd3","b6","Nxf7","Kxf7","Qf3+","Ke8","Bg5","Be7","O-O-O"];

export default [
  mkLine(
    1,
    "halosar_main",
    "Main Line — f3 and g4 Attack",
    "Line #1 · Halosar core",
    "Push f3, then g4 and h4. Black's king won't survive the onslaught.",
    CORE,
    [
      "d4.",
      "...d5.",
      "e4! — Halosar!",
      "...dxe4.",
      "Nc3.",
      "...Nf6.",
      "f3! — blast open.",
      "...exf3.",
      "Nxf3 — recapture.",
      "...Bg4 — pin.",
      "Bc4 — aim at f7!",
      "...e6.",
      "h3 — chase the bishop.",
      "...Bh5.",
      "g4 — drive the bishop back.",
      "...Bg6.",
      "Ne5 — central knight.",
      "...Bh5 — retreat.",
      "Qd3 — double hit on g6 and f7!",
      "...b6 — block.",
      "Nxf7! — sac the knight!",
      "...Kxf7.",
      "Qf3+.",
      "...Ke8.",
      "Bg5.",
      "...Be7.",
      "O-O-O — king safe, attack continues.",
    ],
    ["Halosar Trap","Main Line"]
  ),
  lineFromMoves(2, "halosar", "6.f3 exf3", CORE.slice(0, 18), "f3 opens the position.", ["Halosar Trap"]),
  lineFromMoves(3, "halosar", "8.Bc4 e6", CORE.slice(0, 16), "Bc4 targets f7.", ["Halosar Trap"]),
  lineFromMoves(4, "halosar", "10.h3 Bh5", CORE.slice(0, 14), "h3 chases the Bg4 pin.", ["Halosar Trap"]),
  lineFromMoves(5, "halosar", "12.g4 Bg6", CORE.slice(0, 16), "g4 gains space on the kingside.", ["Halosar Trap"]),
  lineFromMoves(6, "halosar", "14.Ne5 Bh5", CORE.slice(0, 18), "Ne5 centralizes with tempo.", ["Halosar Trap"]),
  lineFromMoves(7, "halosar", "16.Qd3 Attack", CORE.slice(0, 20), "Qd3 hits g6 and f7.", ["Halosar Trap"]),
  lineFromMoves(8, "halosar", "18.Nxf7 Sac", CORE.slice(0, 22), "Nxf7 sac wins material.", ["Halosar Trap"]),
  lineFromMoves(9, "halosar", "5...Nf6 Best", CORE.slice(0, 12), "Nf6 is best — still dangerous.", ["Halosar Trap"]),
  lineFromMoves(10, "halosar", "Full Attack Line", CORE, "Full Halosar attack to a winning position.", ["Halosar Trap"]),
];
