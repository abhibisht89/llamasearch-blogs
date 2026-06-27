import { mkLine, lineFromMoves } from "../repertoire-line-factory.mjs";

export const COURSE_DESCRIPTION =
  "Learn how to counter the Sicilian with the Closed Sicilian — 2.Nc3 and a kingside fianchetto. Slow, solid, and surprisingly dangerous.";

export default [
  mkLine(
    1,
    "closed_main",
    "Main Line — g3 Fianchetto",
    "Line #1 · Closed Sicilian core",
    "Fianchetto your bishop, castle kingside, then break with f4.",
    ["e4","c5","Nc3","Nc6","g3","g6","Bg2","Bg7","d3","d6","f4","e6","Nf3","Nge7","O-O","O-O","Be3","b6","Qd2","Bb7","Rae1","Qc7"],
    [
      "e4.",
      "...c5 — Sicilian.",
      "Nc3 — Closed Sicilian!",
      "...Nc6.",
      "g3 — fianchetto prep.",
      "...g6.",
      "Bg2 — bishop eyes the long diagonal.",
      "...Bg7.",
      "d3 — solid center.",
      "...d6.",
      "f4! — kingside break.",
      "...e6.",
      "Nf3.",
      "...Nge7.",
      "O-O.",
      "...O-O.",
      "Be3.",
      "...b6.",
      "Qd2.",
      "...Bb7.",
      "Rae1.",
      "...Qc7.",
    ],
    ["Closed Sicilian","Main Line"]
  ),
  lineFromMoves(2, "closed", "5...Bg7 Fianchetto", ["e4","c5","Nc3","Nc6","g3","g6","Bg2","Bg7","d3","d6","f4","e6","Nf3","Nge7","O-O","O-O","Be3","b6"], "Mirror fianchetto — plan f4.", ["Closed Sicilian"]),
  lineFromMoves(3, "closed", "6.f4 e6", ["e4","c5","Nc3","Nc6","g3","g6","Bg2","Bg7","d3","d6","f4","e6","Nf3","Nge7","O-O","O-O","Be3","b6"], "f4 is your main attacking idea.", ["Closed Sicilian"]),
  lineFromMoves(4, "closed", "7.Nf3 Nge7", ["e4","c5","Nc3","Nc6","g3","g6","Bg2","Bg7","d3","d6","f4","e6","Nf3","Nge7","O-O","O-O","Be3","b6","Qd2","Bb7"], "Develop knights before pushing.", ["Closed Sicilian"]),
  lineFromMoves(5, "closed", "4...e6 Setup", ["e4","c5","Nc3","Nc6","g3","e6","Bg2","d6","d3","Be7","Nge2","Nf6","O-O","O-O","f4","b6","Be3","Bb7"], "If Black plays ...e6, same plan.", ["Closed Sicilian"]),
  lineFromMoves(6, "closed", "5.d3 d6", ["e4","c5","Nc3","Nc6","g3","g6","Bg2","Bg7","d3","d6","f4","e6","Nf3","Nge7","O-O","O-O","Be3","b6"], "d3 keeps the center flexible.", ["Closed Sicilian"]),
  lineFromMoves(7, "closed", "8.O-O Both Castle", ["e4","c5","Nc3","Nc6","g3","g6","Bg2","Bg7","d3","d6","f4","e6","Nf3","Nge7","O-O","O-O","Be3","b6","Qd2","Bb7"], "Both sides castled — prepare f5.", ["Closed Sicilian"]),
  lineFromMoves(8, "closed", "9.Be3 b6", ["e4","c5","Nc3","Nc6","g3","g6","Bg2","Bg7","d3","d6","f4","e6","Nf3","Nge7","O-O","O-O","Be3","b6","Qd2","Bb7","Rae1","Qc7"], "Be3 completes development.", ["Closed Sicilian"]),
  lineFromMoves(9, "closed", "4...a6 Dragon", ["e4","c5","Nc3","Nc6","g3","a6","Bg2","g6","d3","Bg7","f4","d6","Nf3","Nf6","O-O","O-O","Be3","b5"], "Meet ...a6 with g3-Bg2 anyway.", ["Closed Sicilian"]),
  lineFromMoves(10, "closed", "6...Nf6", ["e4","c5","Nc3","Nc6","g3","g6","Bg2","Bg7","d3","d6","f4","Nf6","Nf3","O-O","O-O","Bg4","h3","Bxf3","Qxf3","Nd7"], "Trade the Bg4 pin with h3.", ["Closed Sicilian"]),
  lineFromMoves(11, "closed", "10.Qd2 Bb7", ["e4","c5","Nc3","Nc6","g3","g6","Bg2","Bg7","d3","d6","f4","e6","Nf3","Nge7","O-O","O-O","Be3","b6","Qd2","Bb7","Rae1","Qc7"], "Qd2 connects rooks.", ["Closed Sicilian"]),
];
