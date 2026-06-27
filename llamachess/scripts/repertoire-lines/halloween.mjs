import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION =
  "If you want an obscure aggressive opening Black often doesn't know — the Halloween Gambit (4.Nxe5) sacrifices a knight for a crushing pawn center.";

export default [
  mkLine(
    1,
    "halloween_main",
    "Main Line — Knight Sac on e5",
    "Line #1 · 4.Nxe5 core",
    "Sacrifice the knight on e5. If Black takes it back wrong, your pawn center wins the game.",
    ["e4","e5","Nf3","Nc6","Nc3","Nf6","Nxe5","Nxe5","d4","Ng6","e5","Ng8","Bc4","c6","Qf3","f6","exf6","Qxf6","Bb3","d5"],
    [
      "e4.",
      "...e5.",
      "Nf3.",
      "...Nc6.",
      "Nc3.",
      "...Nf6 — normal so far.",
      "Nxe5! — Halloween!",
      "...Nxe5 — they must take.",
      "d4 — blast the center open.",
      "...Ng6 — knight retreats.",
      "e5 — pawn storm!",
      "...Ng8 — knight humiliated.",
      "Bc4 — aim at f7.",
      "...c6 — block the bishop.",
      "Qf3 — threaten f7.",
      "...f6 — block.",
      "exf6 — open lines.",
      "...Qxf6.",
      "Bb3 — keep pressure.",
      "...d5 — only move.",
    ],
    ["Halloween Gambit","Main Line"]
  ),
  lineFromMoves(2, "halloween", "5...Nxe5 Recapture", ["e4","e5","Nf3","Nc6","Nc3","Nf6","Nxe5","Nxe5","d4","Ng6","e5","Ng8","Bc4","c6","Qf3","f6","exf6","Qxf6","Bb3","d5"], "If knight retreats to g6, push e5 and attack.", ["Halloween Gambit"]),
  lineFromMoves(3, "halloween", "6...Ng8 Retreat", ["e4","e5","Nf3","Nc6","Nc3","Nf6","Nxe5","Nxe5","d4","Ng6","e5","Ng8","Bc4","c6","Qf3","f6","exf6","Qxf6","Bb3","d5"], "The Ng8 retreat is awkward for Black.", ["Halloween Gambit"]),
  lineFromMoves(4, "halloween", "7.Bc4 c6", ["e4","e5","Nf3","Nc6","Nc3","Nf6","Nxe5","Nxe5","d4","Ng6","e5","Ng8","Bc4","c6","Qf3","f6","exf6","Qxf6"], "Bc4 targets f7 — Black must react.", ["Halloween Gambit"]),
  lineFromMoves(5, "halloween", "8.Qf3 f6", ["e4","e5","Nf3","Nc6","Nc3","Nf6","Nxe5","Nxe5","d4","Ng6","e5","Ng8","Bc4","c6","Qf3","f6","exf6","Qxf6","Bb3","d5"], "Qf3 is the key follow-up.", ["Halloween Gambit"]),
  lineFromMoves(6, "halloween", "4...d6 Decline", ["e4","e5","Nf3","Nc6","Nc3","Nf6","Nxe5","Nxe5","d4","Ng6","e5","Ng8","Bc4","c6","Qf3","f6","exf6","Qxf6","Bb3","Be7","O-O"], "Declining the sac still leaves White with a huge center.", ["Halloween Gambit"]),
  lineFromMoves(7, "halloween", "5.d4 Ng6", ["e4","e5","Nf3","Nc6","Nc3","Nf6","Nxe5","Nxe5","d4","Ng6","e5","Ng8","Bc4","c6","Qf3","f6"], "d4 immediately after the sac.", ["Halloween Gambit"]),
  lineFromMoves(8, "halloween", "9.exf6 Qxf6", ["e4","e5","Nf3","Nc6","Nc3","Nf6","Nxe5","Nxe5","d4","Ng6","e5","Ng8","Bc4","c6","Qf3","f6","exf6","Qxf6","Bb3","d5"], "Open the f-file after exf6.", ["Halloween Gambit"]),
  lineFromMoves(9, "halloween", "10.Bb3 d5", ["e4","e5","Nf3","Nc6","Nc3","Nf6","Nxe5","Nxe5","d4","Ng6","e5","Ng8","Bc4","c6","Qf3","f6","exf6","Qxf6","Bb3","d5","Bxd5","cxd5","Qxd5","Qe7"], "Bb3 keeps queenside pressure.", ["Halloween Gambit"]),
  lineFromMoves(10, "halloween", "6.e5 Ng8", ["e4","e5","Nf3","Nc6","Nc3","Nf6","Nxe5","Nxe5","d4","Ng6","e5","Ng8","Bc4","c6","Qf3","f6"], "The e5 pawn is your compensation.", ["Halloween Gambit"]),
  lineFromMoves(11, "halloween", "3...Bc5 Decline", ["e4","e5","Nf3","Nc6","Nc3","Nf6","Nxe5","Nxe5","d4","Ng6","e5","Ng8","Bc4","c6","Qf3","f6","exf6","Qxf6","Bb3","d5"], "If Black avoids the sac, the pawn center still wins.", ["Halloween Gambit"]),
  lineFromMoves(12, "halloween", "5...Ne4 Sideline", ["e4","e5","Nf3","Nc6","Nc3","Nf6","Nxe5","Nxe5","d4","Ng6","e5","Ng8","Bc4","c6","Qf3","f6","exf6","Qxf6","Bb3","Be7"], "Ne4 sideline transposes to the main attack.", ["Halloween Gambit"]),
  lineFromMoves(13, "halloween", "7...c6 Block", ["e4","e5","Nf3","Nc6","Nc3","Nf6","Nxe5","Nxe5","d4","Ng6","e5","Ng8","Bc4","c6","Qf3","f6","exf6","Qxf6"], "c6 blocks Bc4 — plan Qf3 anyway.", ["Halloween Gambit"]),
  lineFromMoves(14, "halloween", "11...Qe7", ["e4","e5","Nf3","Nc6","Nc3","Nf6","Nxe5","Nxe5","d4","Ng6","e5","Ng8","Bc4","c6","Qf3","f6","exf6","Qxf6","Bb3","d5","Bxd5","cxd5","Qxd5","Qe7"], "Central queen pressure after Qxd5.", ["Halloween Gambit"]),
  lineFromMoves(15, "halloween", "4...Nxe5 Best", ["e4","e5","Nf3","Nc6","Nc3","Nf6","Nxe5","Nxe5","d4","Ng6","e5","Ng8","Bc4","c6","Qf3","f6","exf6","Qxf6","Bb3","d5","Bxd5","cxd5","Qxd5","Qe7","Be3","Be6"], "Full main line to a playable middlegame.", ["Halloween Gambit"]),
];
