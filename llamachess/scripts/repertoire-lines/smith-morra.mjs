import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION =
  "The most aggressive gambit to destroy the Sicilian — 1.e4 c5 2.d4 cxd4 3.c3. Sacrifice a pawn for rapid development and open lines.";

const MAIN = ["e4","c5","d4","cxd4","c3","dxc3","Nxc3","Nc6","Nf3","d6","Bc4","Nf6","O-O","a6","Qe2","e6","Rd1","Be7","Bf4","O-O"];
const ALT = ["e4","c5","d4","cxd4","c3","dxc3","Nxc3","Nc6","Nf3","d6","Bc4","Nf6","O-O","a6","Qe2","e6","Rd1","Be7","Bf4","Qc7"];

export default [
  mkLine(
    1,
    "morra_main",
    "Accepted — Rapid Development",
    "Line #1 · Morra accepted core",
    "Black takes the gambit? Develop fast, castle, and attack the weakened king.",
    MAIN,
    [
      "e4.",
      "...c5 — Sicilian.",
      "d4! — Morra begins.",
      "...cxd4.",
      "c3! — gambit pawn.",
      "...dxc3.",
      "Nxc3 — recapture with development.",
      "...Nc6.",
      "Nf3.",
      "...d6 — block the bishop.",
      "Bc4 — aim at f7.",
      "...Nf6.",
      "...a6 — prep ...b5.",
      "Qe2 — connect rooks.",
      "...e6 — solid center.",
      "Rd1 — central pressure.",
      "...Be7 — develop.",
      "Bf4 — complete development.",
      "...O-O — castle.",
    ],
    ["Smith-Morra Gambit","Accepted"]
  ),
  lineFromMoves(2, "morra", "6...a6 Sideline", ALT, "6...a6 — develop and castle.", ["Smith-Morra Gambit"]),
  lineFromMoves(3, "morra", "5...d6 Setup", MAIN, "Classic ...d6 and ...Nf6 setup.", ["Smith-Morra Gambit"]),
  lineFromMoves(4, "morra", "7.Bc4 e6", ["e4","c5","d4","cxd4","c3","dxc3","Nxc3","Nc6","Nf3","e6","Bc4","Nf6","O-O","Be7","Qe2","O-O","Rd1","a6","Bf4","Qc7"], "Meet ...e6 with Bc4 and O-O.", ["Smith-Morra Gambit"]),
  lineFromMoves(5, "morra", "Declined 3...d5", ["e4","c5","d4","cxd4","c3","d5","exd5","Nf6","Qa4+","Bd7","Qb3","e6","Nf3","Be7","Be2","O-O","O-O","b6"], "If Black declines with ...d5, Qa4+ wins tempo.", ["Smith-Morra Gambit","Declined"]),
  lineFromMoves(6, "morra", "4...d5 Decline", ["e4","c5","d4","cxd4","c3","d5","exd5","Nf6","Qa4+","Bd7","Qb3","e6","Nf3","Be7","Be2","O-O","O-O","b6"], "Same Qa4+ pattern against ...d5.", ["Smith-Morra Gambit"]),
  lineFromMoves(7, "morra", "8.O-O Be7", MAIN, "Castle and connect rooks.", ["Smith-Morra Gambit"]),
  lineFromMoves(8, "morra", "9.Qe2 O-O", MAIN, "Qe2 supports e4-e5 ideas.", ["Smith-Morra Gambit"]),
  lineFromMoves(9, "morra", "10.Rd1 Central", MAIN, "Rd1 adds pressure on d6.", ["Smith-Morra Gambit"]),
  lineFromMoves(10, "morra", "6...g6 Dragon", ["e4","c5","d4","cxd4","c3","dxc3","Nxc3","Nc6","Nf3","g6","Bc4","Bg7","O-O","Nf6","Qe2","O-O","Rd1","a6","Bf4","Qc7"], "Dragon setup — Bc4 still hits f7.", ["Smith-Morra Gambit"]),
  lineFromMoves(11, "morra", "7...Bg7 Fianchetto", ["e4","c5","d4","cxd4","c3","dxc3","Nxc3","Nc6","Nf3","g6","Bc4","Bg7","O-O","Nf6","Qe2","O-O","Rd1","a6","Bf4","Qc7"], "Fianchetto — develop and attack.", ["Smith-Morra Gambit"]),
  lineFromMoves(12, "morra", "5...Nf6 Early", MAIN, "Early ...Nf6 — same plan.", ["Smith-Morra Gambit"]),
  lineFromMoves(13, "morra", "8...Nf6", MAIN, "Standard development sequence.", ["Smith-Morra Gambit"]),
  lineFromMoves(14, "morra", "4...Nf6 Transpo", MAIN, "Transposition with ...Nf6.", ["Smith-Morra Gambit"]),
  lineFromMoves(15, "morra", "9...O-O", MAIN, "Both sides castled — middlegame attack.", ["Smith-Morra Gambit"]),
  lineFromMoves(16, "morra", "11.Bf4 Qc7", MAIN, "Bf4 completes development.", ["Smith-Morra Gambit"]),
  lineFromMoves(17, "morra", "Declined 3...Nf6", ["e4","c5","d4","cxd4","c3","Nf6","e5","Nd5","Nf3","Nc6","Bc4","Nb6","Bb3","e6","O-O","Be7","Qe2","O-O"], "If Black declines with ...Nf6, e5 wins space.", ["Smith-Morra Gambit"]),
  lineFromMoves(18, "morra", "Grand Prix 6.f4", ["e4","c5","d4","cxd4","c3","dxc3","Nxc3","Nc6","f4","d6","Nf3","Nf6","Bc4","g6","O-O","Bg7","Qe2","O-O","Rd1","Qc7"], "Grand Prix f4 — keep the attack going.", ["Smith-Morra Gambit","Grand Prix"]),
];
