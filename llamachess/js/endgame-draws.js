/**
 * Endgame Draws section grid — loads data/sections/endgame_draws.json (isolated).
 */
import { createEndgameSectionGrid } from "./endgame-section-grid.js";

createEndgameSectionGrid({
  sectionId: "endgame_draws",
  dataUrl: "data/sections/endgame_draws.json",
  solvePage: "solve-endgame-draws.html",
});
