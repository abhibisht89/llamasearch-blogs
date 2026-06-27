import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION =
  "Scholar's Mate looks harmless — but many players fail to punish it. Learn how to crush Qf3/Qh5 attacks and turn White's cheap tricks into a winning advantage.";

const CORE = ["e4","e5","Bc4","Nc6","Qf3","Nf6","d3","d6","Qg3","Be6","Bxe6","fxe6","Qxg7","Qe7","Qxh8","Kd7","Nf3","Re8","Be3","Ng4"];

export default [
  mkLine(
    1,
    "scholar_main",
    "Scholar's Mate — ...Nf6 Punish",
    "Line #1 · Crush Qf3",
    "White plays Bc4 and Qf3? Develop with ...Nf6 and ...d6, then counterattack.",
    CORE,
    [
      "e4.",
      "...e5.",
      "Bc4 — Scholar's setup.",
      "...Nc6.",
      "Qf3? — cheap attack!",
      "...Nf6! — develop and block.",
      "d3.",
      "...d6 — solid.",
      "Qg3.",
      "...Be6 — trade the bishop.",
      "Bxe6.",
      "...fxe6.",
      "Qxg7.",
      "...Qe7! — trap the queen.",
      "Qxh8.",
      "...Kd7 — king escapes.",
      "Nf3.",
      "...Re8 — attack the queen.",
      "Be3.",
      "...Ng4 — fork the queen and bishop.",
    ],
    ["Scholar's Mate","Punish"]
  ),
  lineFromMoves(2, "scholar", "4...Nf6 Block", CORE.slice(0, 14), "Nf6 blocks f7 and develops.", ["Scholar's Mate"]),
  lineFromMoves(3, "scholar", "5...d6 Solid", CORE.slice(0, 14), "d6 supports ...Be6.", ["Scholar's Mate"]),
  lineFromMoves(4, "scholar", "6...Be6 Trade", CORE.slice(0, 12), "Trade bishops — trap the queen.", ["Scholar's Mate"]),
  lineFromMoves(5, "scholar", "8...Qe7 Trap", CORE.slice(0, 14), "Qe7 traps the queen on g7.", ["Scholar's Mate"]),
  lineFromMoves(6, "scholar", "Qh5 Attack", ["e4","e5","Bc4","Nc6","Qh5","g6","Qf3","Nf6","Ne2","d6","d3","Bg7","O-O","O-O","Bg5","h6","Bh4","Nh5"], "Meet Qh5 with ...g6 and ...Nf6.", ["Scholar's Mate","Qh5"]),
  lineFromMoves(7, "scholar", "3.Bc4 Nc6", CORE.slice(0, 14), "Standard Scholar's setup.", ["Scholar's Mate"]),
  lineFromMoves(8, "scholar", "9...Kd7 Escape", CORE.slice(0, 16), "Kd7 escapes the queen trap.", ["Scholar's Mate"]),
  lineFromMoves(9, "scholar", "10...Re8 Attack", CORE.slice(0, 18), "Re8 attacks the trapped queen.", ["Scholar's Mate"]),
  lineFromMoves(10, "scholar", "Legal Trap Style", ["e4","e5","Nf3","d6","Bc4","Bg4","Nc3","Nf6","Nxe5","Bxd1","Bxf7+","Ke7","Nd5"], "If White tries Bc4-Nc3 tricks, the Legal trap refutes it.", ["Scholar's Mate","Legal"]),
  lineFromMoves(11, "scholar", "Full Punish Line", CORE, "Full punishment from Scholar's Mate.", ["Scholar's Mate"]),
  lineFromMoves(12, "scholar", "Parham 2.Qh5", ["e4","e5","Qh5","Nc6","Bc4","g6","Qf3","Nf6","Ne2","d6","d3","Bg7","O-O","O-O","Bg5","h6","Bh4","Nh5"], "Parham Attack — same ...g6 and ...Nf6 plan.", ["Scholar's Mate","Parham"]),
  lineFromMoves(13, "scholar", "7.Qxg7 Qe7", CORE.slice(0, 14), "Never fear Qxg7 — Qe7 wins.", ["Scholar's Mate"]),
];
