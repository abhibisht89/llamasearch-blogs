import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION =
  "The Stafford Gambit: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 Nxe4 — twenty wild lines punishing the Fried Liver setup.";

export default [
  mkLine(
    1,
    "stafford_main",
    "Main Line — ...Nxe4 Sacrifice",
    "Line #1 · Stafford core",
    "White plays Ng5? You sacrifice the knight on e4 and go hunting.",
    ["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5","Nxe4","Nxf7","Qh4","g3","Nxf2","Qf3","Qf6","Kxf2","d5"],
    [
      "e4.",
      "...e5 — classical.",
      "Nf3.",
      "...Nc6.",
      "Bc4.",
      "...Nf6 — invite Ng5.",
      "Ng5 — Fried Liver bait!",
      "...Nxe4! — Stafford begins.",
      "Nxf7.",
      "...Qh4 — queen enters the attack.",
      "g3.",
      "...Nxf2! — fork trick.",
      "Qf3.",
      "...Qf6 — queen stays active.",
      "Kxf2.",
      "...d5 — blast the center open.",
    ],
    ["Stafford Gambit","Main Line"]
  ),
  lineFromMoves(2, "stafford", "Queen on h4 — Attack", ["e4","e5","Nf3","Nc6","Bc4","Bc5","Ng5","Nf6","Nxf7","Bxf2+","Kxf2","Nxe4+","Kg1","Qh4","g3","Nxg3","hxg3","Qxg3+","Kf1","Rf8"], "The queen on h4 is your best friend. Know the follow-ups.", ["Stafford Gambit","Tactics"]),
  lineFromMoves(3, "stafford", "5.d3 Defense", ["e4","e5","Nf3","Nc6","Bc4","Bc5","Ng5","Nf6","Nxf7","Bxf2+","Kxf2","Nxe4+","Kg1","Qh4","g3","Nxg3","hxg3","Qxg3+","Kf1","Rf8"], "When White plays d3 instead of g3, same knight fork ideas.", ["Stafford Gambit"]),
  lineFromMoves(4, "stafford", "6.Qe2 Block", ["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5","Nxe4","Nxf7","Qh4","g3","Nxf2","Qf3","Qf6","Kxf2","d5"], "Qe2 block — take on f2 and play ...d5.", ["Stafford Gambit"]),
  lineFromMoves(5, "stafford", "Knight Fork on f2", ["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5","Nxe4","Nxf7","Qh4","g3","Nxf2","Qf3","Qf6","Kxf2","d5","Nxh8","Bd7"], "The Nxf2 fork wins material or the queen when White missteps.", ["Stafford Gambit"]),
  lineFromMoves(6, "stafford", "4.d3 Avoidance", ["e4","e5","Nf3","Nc6","Bc4","Nf6","d3","Be7","O-O","O-O","Re1","d6","c3","Na5"], "If White avoids Ng5 with d3, play solid ...Be7.", ["Stafford Gambit"]),
  lineFromMoves(7, "stafford", "7.Bb3 Retreat", ["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5","Nxe4","Nxf7","Qh4","d3","Nxf2","Qf3","Qf6","Kxf2","d5","Nxh8","Bd7"], "When bishop retreats to b3, ...d5 opens lines.", ["Stafford Gambit"]),
  lineFromMoves(8, "stafford", "5.Nxh8 Material", ["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5","Nxe4","Nxf7","Qh4","d3","Nxf2","Qf3","Qf6","Kxf2","d5"], "If White grabs the rook on h8, keep attacking.", ["Stafford Gambit"]),
  lineFromMoves(9, "stafford", "Central Break ...d5", ["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5","Nxe4","Nxf7","Qh4","g3","Nxf2","Qf3","Qf6","Kxf2","d5","Nxh8","Bd7","Ng6","O-O-O"], "...d5 is your thematic break — use it to activate all pieces.", ["Stafford Gambit"]),
  lineFromMoves(10, "stafford", "6.Nc3 Develop", ["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5","Nxe4","Nxf7","Qh4","Nc3","Nxf2","Qf3","Qf6","Kxf2","d5"], "Nc3 from White — same Stafford core.", ["Stafford Gambit"]),
  lineFromMoves(11, "stafford", "4.d4 Transpose", ["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5","Nxe4","Nxf7","Qh4","d3","Nxf2","Qf3","Qf6","Kxf2","d5"], "Scotch-Gambit style when White plays d4.", ["Stafford Gambit"]),
  lineFromMoves(12, "stafford", "8.Bg5 Pin", ["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5","Nxe4","Nxf7","Qh4","d3","Nxf2","Qf3","Qf6","Kxf2","d5","Nxh8","Bd7"], "Meet Bg5 with ...Qd6 and keep the initiative.", ["Stafford Gambit"]),
  lineFromMoves(13, "stafford", "Italian Decline 4.d3", ["e4","e5","Nf3","Nc6","Bc4","Nf6","d3","Be7","Ng5","d5","exd5","Na5","Bb3","Nxb3","axb3","h6"], "If Ng5 comes late, ...d5 is still strong.", ["Stafford Gambit"]),
  lineFromMoves(14, "stafford", "Bishop g4 — Pin", ["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5","Nxe4","Nxf7","Qh4","g3","Nxf2","Qf3","Qf6","Kxf2","d5","Nxh8","Bd7","Ng6","O-O-O","Ne7+","Bxe7"], "After the dust settles, ...Bg4 pins the queen to the king.", ["Stafford Gambit"]),
  lineFromMoves(15, "stafford", "5.Bxf7+ Check", ["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5","Nxe4","Nxf7","Qh4","g3","Nxf2","Qf3","Qf6","Kxf2","d5"], "If White takes with the bishop, ...Kxf7 and ...d5.", ["Stafford Gambit"]),
  lineFromMoves(16, "stafford", "7.h4 Block", ["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5","Nxe4","Nxf7","Qh4","d3","Nxf2","Qf3","Qf6","Kxf2","d5"], "h4 tries to trap the queen — keep playing ...Nxf2.", ["Stafford Gambit"]),
  lineFromMoves(17, "stafford", "6.Be3 Solid", ["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5","Nxe4","Nxf7","Qh4","g3","Nxf2","Qf3","Qf6","Kxf2","d5"], "Be3 from White — Stafford still works.", ["Stafford Gambit"]),
  lineFromMoves(18, "stafford", "3...Bc5 Italian", ["e4","e5","Nf3","Nc6","Bc4","Bc5","Ng5","Nf6","Nxf7","Bxf2+","Kxf2","Nxe4+","Kg1","Qh4"], "If you play ...Bc5 instead, Fried Liver gets messy too.", ["Stafford Gambit"]),
  lineFromMoves(19, "stafford", "8.Nc3 Block", ["e4","e5","Nf3","Nc6","Bc4","Nf6","Ng5","Nxe4","Nxf7","Qh4","d3","Nxf2","Qf3","Qf6","Kxf2","d5","Nxh8","Bd7"], "Nc3 block — push ...e4 anyway.", ["Stafford Gambit"]),
  lineFromMoves(20, "stafford", "Quiet 4.O-O", ["e4","e5","Nf3","Nc6","Bc4","Nf6","O-O","Nxe4","Re1","d5","Bxd5","Qxd5","Nc3","Qd8","Nxe4","Be7"], "When White castles, grab on e4 and play ...d5.", ["Stafford Gambit"]),
];
