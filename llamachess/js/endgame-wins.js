/**
 * Endgame Wins section grid — loads data/sections/endgame_wins.json (isolated).
 */
import { createEndgameSectionGrid } from "./endgame-section-grid.js";

createEndgameSectionGrid({
  sectionId: "endgame_wins",
  dataUrl: "data/sections/endgame_wins.json",
  solvePage: "solve-endgame-wins.html",
});
