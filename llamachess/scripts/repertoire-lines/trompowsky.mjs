import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION =
  "If you play KID or Nimzo with 1...Nf6, you must know the Trompowsky (2.Bg5). This short rep covers the main lines and traps.";

const CORE = ["d4","Nf6","Bg5","Ne4","Bf4","c5","f3","Nf6","e3","Qb6","b3","Qa5+","Qd2","Qxd2+","Nxd2","Nc6","c3","e6","Be2","Be7","Bd3","O-O"];

export default [
  mkLine(
    1,
    "tromp_main",
    "Main Line — ...Ne4 and ...c5",
    "Line #1 · Trompowsky core",
    "Meet Bg5 with ...Ne4, then strike the center with ...c5.",
    CORE,
    [
      "d4.",
      "...Nf6.",
      "Bg5 — Trompowsky!",
      "...Ne4! — kick the bishop.",
      "Bf4.",
      "...c5! — strike the center.",
      "f3.",
      "...Nf6 — knight retreats.",
      "e3.",
      "...Qb6 — queen enters.",
      "b3.",
      "...Qa5+ — check with tempo.",
      "Qd2.",
      "...Qxd2+ — trade queens.",
      "Nxd2.",
      "...Nc6.",
      "c3.",
      "...e6 — solid.",
      "Be2.",
      "...Be7.",
      "Bd3.",
      "...O-O.",
      "O-O — king safe, play for d5.",
    ],
    ["Trompowsky","Main Line"]
  ),
  lineFromMoves(2, "tromp", "4...c5 Strike", CORE.slice(0, 14), "c5 is the key counter.", ["Trompowsky"]),
  lineFromMoves(3, "tromp", "3...Ne4 Kick", CORE.slice(0, 10), "Ne4 kicks the bishop.", ["Trompowsky"]),
  lineFromMoves(4, "tromp", "5...Qb6", CORE.slice(0, 12), "Qb6 targets b2.", ["Trompowsky"]),
  lineFromMoves(5, "tromp", "6.f3 Nf6", CORE.slice(0, 10), "f3 supports e4 and g4.", ["Trompowsky"]),
  lineFromMoves(6, "tromp", "2.Bg5 h6", ["d4","Nf6","Bg5","h6","Bxf6","exf6","c4","d5","Nc3","Be6","e3","c6","Bd3","Bd6","Nge2","O-O","O-O","Nd7","cxd5","cxd5"], "If White takes on f6, play ...exf6 and ...d5.", ["Trompowsky","h6"]),
  lineFromMoves(7, "tromp", "3.Bxf6 exf6", ["d4","Nf6","Bg5","h6","Bxf6","exf6","c4","d5","Nc3","Be6","e3","c6","Bd3","Bd6","Nge2","O-O","O-O","Nd7","cxd5","cxd5"], "Double pawns but solid center.", ["Trompowsky"]),
  lineFromMoves(8, "tromp", "4.c4 d5", ["d4","Nf6","Bg5","h6","Bxf6","exf6","c4","d5","Nc3","Be6","e3","c6","Bd3","Bd6","Nge2","O-O","O-O","Nd7","cxd5","cxd5"], "Strike with ...d5.", ["Trompowsky"]),
  lineFromMoves(9, "tromp", "7...Be7", CORE.slice(0, 20), "Develop and castle.", ["Trompowsky"]),
  lineFromMoves(10, "tromp", "8...O-O", CORE, "Castle and play ...d5.", ["Trompowsky"]),
];
