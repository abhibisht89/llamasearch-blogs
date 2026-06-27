/** Interactive solver for Sisters Tournament Combinations (first-move validation). */

import { Chess } from "chess.js";
import { Chessground } from "@lichess-org/chessground";
import { getSection } from "./data-sisters.js";
import {
  nextPrevLoadableIds,
  resolveLoadablePuzzle,
} from "./fen-utils.js";
import { progress, migrateProgressToSequential } from "./progress.js";
import { initBoardThemeSwitcher } from "./board-theme.js";
import { createHintUi } from "./hint-ui.js";
import { initBoardSettings } from "./board-settings.js";

const SECTION_ID = "sisters";
const puzzleId = Number(new URLSearchParams(location.search).get("id") || "1");

const statusEl = document.getElementById("status-msg");
const boardEl = document.getElementById("board");
const puzzleNumEl = document.getElementById("puzzle-num");
const sideToMoveEl = document.getElementById("side-to-move");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const resetBtn = document.getElementById("reset-btn");

let chess;
let ground;
let puzzle;
let section;
let solved = false;
let hint;

function initHint() {
  hint = createHintUi({
    idleTitle: "Your move",
    idleBody: "Find the winning first move from the tournament game.",
    revealBody: "Play this move to start the winning combination.",
    doneTitle: "Done",
    doneBody: "You found the winning first move.",
  });
  hint.setStatusHandler(setStatus);
  hint.setBlockedCheck(() => solved);
  hint.setMoveProvider(() => puzzle.solutionMoves?.[0] || null);
  hint.showIdle();
  hint.updateControls();
}

function setStatus(text, kind = "idle") {
  statusEl.textContent = text;
  statusEl.className = `status-msg ${kind}`;
}

function toDests(game) {
  const dests = new Map();
  for (const move of game.moves({ verbose: true })) {
    if (!dests.has(move.from)) dests.set(move.from, []);
    dests.get(move.from).push(move.to);
  }
  return dests;
}

function orientColor(side) {
  return side === "w" ? "white" : "black";
}

function sideLabel(side) {
  return side === "w" ? "White to move" : "Black to move";
}

function showSideToMove(side) {
  const label = sideLabel(side);
  const cls = side === "w" ? "white" : "black";

  if (sideToMoveEl) {
    sideToMoveEl.className = `side-to-move ${cls}`;
    sideToMoveEl.innerHTML = `<span class="side-dot" aria-hidden="true"></span>${label}`;
  }
}

/** Strip check/mate suffixes for first-move comparison. */
function normalizeMoveSan(san) {
  return san.replace(/[+#]/g, "");
}

function isCorrectFirstMove(san) {
  const played = normalizeMoveSan(san);
  return puzzle.solutionMoves.some((s) => normalizeMoveSan(s) === played);
}

function updateGround(lastMove) {
  const turn = chess.turn();
  const canMove = !solved && turn === puzzle.sideToMove;

  ground.set({
    fen: chess.fen(),
    turnColor: orientColor(turn),
    movable: {
      color: canMove ? orientColor(puzzle.sideToMove) : undefined,
      dests: canMove ? toDests(chess) : new Map(),
    },
    lastMove: lastMove ? [lastMove.from, lastMove.to] : undefined,
    check: chess.isCheck() ? orientColor(chess.turn()) : false,
  });
}

function onMove(orig, dest) {
  if (solved) return;

  progress.markAttempted(SECTION_ID, puzzle.id);

  const move = chess.move({ from: orig, to: dest, promotion: "q" });
  if (!move) {
    updateGround();
    return;
  }

  const lastMove = { from: orig, to: dest };

  if (isCorrectFirstMove(move.san)) {
    solved = true;
    progress.markSolved(SECTION_ID, puzzle.id);
    setStatus("Correct! That's the winning first move.", "success");
    hint?.markDone();
    updateGround(lastMove);
    return;
  }

  chess.undo();
  setStatus("Not quite — find the winning combination.", "error");
  updateGround();
}

function resetPuzzle() {
  solved = progress.isSolved(SECTION_ID, puzzle.id);
  chess = new Chess(puzzle.fen);
  setStatus(
    solved ? "Already solved — play again for practice." : "Find the winning first move.",
    solved ? "success" : "idle"
  );
  updateGround();
  hint?.reset();
}

function setupNav() {
  const { prev, next } = nextPrevLoadableIds(section, puzzle.id);
  prevBtn.href = prev ? `solve-sisters.html?id=${prev}` : "#";
  prevBtn.style.opacity = prev ? "1" : "0.4";
  prevBtn.style.pointerEvents = prev ? "auto" : "none";

  nextBtn.href = next ? `solve-sisters.html?id=${next}` : "#";
  nextBtn.style.opacity = next ? "1" : "0.4";
  nextBtn.style.pointerEvents = next ? "auto" : "none";
}

async function main() {
  initBoardThemeSwitcher();

  section = await getSection();
  migrateProgressToSequential(SECTION_ID, section.puzzles);

  puzzle = resolveLoadablePuzzle(section, puzzleId);
  if (!puzzle) throw new Error("No loadable puzzles in this section");

  if (puzzle.id !== puzzleId) {
    history.replaceState({}, "", `solve-sisters.html?id=${puzzle.id}`);
  }

  puzzleNumEl.textContent = String(puzzle.id);
  document.title = `Puzzle #${puzzle.id} — Tournament Combinations`;
  showSideToMove(puzzle.sideToMove || puzzle.fen.split(" ")[1]);

  solved = progress.isSolved(SECTION_ID, puzzle.id);
  chess = new Chess(puzzle.fen);

  ground = Chessground(boardEl, {
    fen: puzzle.fen,
    orientation: orientColor(puzzle.sideToMove),
    movable: {
      color: orientColor(puzzle.sideToMove),
      free: false,
      dests: toDests(chess),
      events: { after: onMove },
    },
    draggable: { enabled: true, showGhost: true },
    premovable: { enabled: false },
    highlight: { lastMove: true, check: true },
    animation: { enabled: true, duration: 180 },
  });

  setupNav();
  initHint();
  initBoardSettings({ getFen: () => chess.fen(), onStatus: setStatus });
  resetPuzzle();
}

resetBtn.addEventListener("click", resetPuzzle);

main().catch((err) => {
  console.error(err);
  setStatus("Could not load this puzzle.", "error");
});
