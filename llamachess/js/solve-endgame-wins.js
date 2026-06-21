/**
 * Endgame Wins solve page — play through the book's winning line.
 */
import { createEndgameLineSolver } from "./solve-endgame-line.js";

createEndgameLineSolver({
  sectionId: "endgame_wins",
  dataUrl: "data/sections/endgame_wins.json",
  solvePage: "solve-endgame-wins.html",
  sectionListPage: "endgame-wins.html",
  sectionTitle: "Endgame Wins",
  playerSide: "w",
  successMessages: {
    win: "Correct — winning technique found!",
  },
});
