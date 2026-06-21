import { Chess } from "chess.js";
import { Chessground } from "@lichess-org/chessground";
import { getPuzzle, getSection, nextPrevIds } from "./data.js";
import { progress, migrateProgressToSequential } from "./progress.js";
import { initBoardThemeSwitcher } from "./board-theme.js";

const params = new URLSearchParams(location.search);
const sectionId = params.get("section") || "mate_in_1";
const puzzleId = Number(params.get("id") || "1");

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

function setStatus(text, kind = "idle") {
  statusEl.textContent = text;
  statusEl.className = `status-msg ${kind}`;
}

/** Legal move destinations for chessground. */
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

function isMateInOne() {
  return (puzzle.mateIn || 1) === 1;
}

function normalizeMove(san) {
  if (isMateInOne()) {
    return san.endsWith("#") ? san : san.replace("+", "") + "#";
  }
  return san.replace(/[+#]$/, "");
}

function isCorrectMove(san) {
  const played = normalizeMove(san);
  return puzzle.solutionMoves.some((s) => normalizeMove(s) === played);
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

  progress.markAttempted(sectionId, puzzle.id);

  const move = chess.move({ from: orig, to: dest, promotion: "q" });
  if (!move) {
    updateGround();
    return;
  }

  const lastMove = { from: orig, to: dest };

  const correct =
    isMateInOne()
      ? chess.isCheckmate() && isCorrectMove(move.san)
      : isCorrectMove(move.san);

  if (correct) {
    solved = true;
    progress.markSolved(sectionId, puzzle.id);
    setStatus(
      isMateInOne() ? "Solved! Checkmate." : "Correct first move!",
      "success"
    );
    updateGround(lastMove);
    return;
  }

  // Wrong move — take it back
  chess.undo();
  setStatus(
    isMateInOne() ? "Not quite — find the checkmate." : "Not quite — find the correct first move.",
    "error"
  );
  updateGround();
}

function idlePrompt() {
  if (isMateInOne()) return "Find checkmate in one move.";
  if (puzzle.mateIn === 2) return "Find the correct first move (mate in 2).";
  return "Find the correct first move.";
}

function resetPuzzle() {
  solved = progress.isSolved(sectionId, puzzle.id);
  chess = new Chess(puzzle.fen);
  setStatus(
    solved ? "Already solved — play again for practice." : idlePrompt(),
    solved ? "success" : "idle"
  );
  updateGround();
}

function setupNav() {
  const { prev, next } = nextPrevIds(section, puzzle.id);
  prevBtn.href = prev
    ? `solve.html?section=${sectionId}&id=${prev}`
    : "#";
  prevBtn.style.opacity = prev ? "1" : "0.4";
  prevBtn.style.pointerEvents = prev ? "auto" : "none";

  nextBtn.href = next
    ? `solve.html?section=${sectionId}&id=${next}`
    : "#";
  nextBtn.style.opacity = next ? "1" : "0.4";
  nextBtn.style.pointerEvents = next ? "auto" : "none";
}

async function main() {
  initBoardThemeSwitcher();

  const sec = await getSection(sectionId);
  migrateProgressToSequential(sectionId, sec.puzzles);

  const result = await getPuzzle(sectionId, puzzleId);
  section = result.section;
  puzzle = result.puzzle;

  puzzleNumEl.textContent = String(puzzle.id);
  document.title = `Puzzle #${puzzle.id} — LlamaChess`;
  showSideToMove(puzzle.sideToMove || puzzle.fen.split(" ")[1]);

  solved = progress.isSolved(sectionId, puzzle.id);
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
  resetPuzzle();
}

resetBtn.addEventListener("click", resetPuzzle);

main().catch((err) => {
  console.error(err);
  setStatus("Could not load this puzzle.", "error");
});
