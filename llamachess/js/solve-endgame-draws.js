/**
 * Endgame Draws solve page — play through the book's drawing line.
 */
import { createEndgameLineSolver } from "./solve-endgame-line.js";

createEndgameLineSolver({
  sectionId: "endgame_draws",
  dataUrl: "data/sections/endgame_draws.json",
  solvePage: "solve-endgame-draws.html",
  sectionListPage: "endgame-draws.html",
  sectionTitle: "Endgame Draws",
  playerSide: "w",
  successMessages: {
    draw: "Correct — half point saved!",
  },
});
