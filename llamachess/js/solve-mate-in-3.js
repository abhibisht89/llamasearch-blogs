/**
 * Mate in 3 solve page — validates the book's first move (not full line).
 * Loads data/sections/mate_in_3.json directly; does not use shared data.js.
 */
import { Chess } from "chess.js";
import { Chessground } from "@lichess-org/chessground";
import { progress, migrateProgressToSequential } from "./progress.js";
import {
  firstUnsolvedLoadableId,
  nextPrevLoadableIds,
  resolveLoadablePuzzle,
  sortedLoadableIds,
} from "./fen-utils.js";
import { initBoardThemeSwitcher } from "./board-theme.js";

const SECTION_ID = "mate_in_3";
const DATA_URL = "data/sections/mate_in_3.json";
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

async function loadSection() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`Could not load ${DATA_URL}`);
  return res.json();
}

function getPuzzle(sec, id) {
  const p = sec.puzzles.find((x) => x.id === id);
  if (!p) throw new Error(`Puzzle #${id} not found`);
  return p;
}

function sortedPuzzleIds(sec) {
  return sec.puzzles.map((p) => p.id).sort((a, b) => a - b);
}

function nextPrevIds(sec, currentId) {
  const ids = sortedPuzzleIds(sec);
  const idx = ids.indexOf(currentId);
  return {
    prev: idx > 0 ? ids[idx - 1] : null,
    next: idx < ids.length - 1 ? ids[idx + 1] : null,
  };
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

function normalizeSan(san) {
  return san.replace(/[+#]$/, "");
}

function isCorrectFirstMove(san) {
  const n = normalizeSan(san);
  return puzzle.solutionMoves.some((s) => normalizeSan(s) === n);
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
    setStatus("Correct first move!", "success");
    updateGround(lastMove);
    return;
  }

  chess.undo();
  setStatus("Not quite — find the correct first move.", "error");
  updateGround();
}

function resetPuzzle() {
  solved = progress.isSolved(SECTION_ID, puzzle.id);
  chess = new Chess(puzzle.fen);
  setStatus(
    solved ? "Already solved — play again for practice." : "Find the correct first move.",
    solved ? "success" : "idle"
  );
  updateGround();
}

function setupNav() {
  const { prev, next } = nextPrevLoadableIds(section, puzzle.id);
  prevBtn.href = prev ? `solve-mate-in-3.html?id=${prev}` : "#";
  prevBtn.style.opacity = prev ? "1" : "0.4";
  prevBtn.style.pointerEvents = prev ? "auto" : "none";

  nextBtn.href = next ? `solve-mate-in-3.html?id=${next}` : "#";
  nextBtn.style.opacity = next ? "1" : "0.4";
  nextBtn.style.pointerEvents = next ? "auto" : "none";
}

async function main() {
  initBoardThemeSwitcher();

  section = await loadSection();
  migrateProgressToSequential(SECTION_ID, section.puzzles);
  puzzle = resolveLoadablePuzzle(section, puzzleId);
  if (!puzzle) throw new Error("No loadable puzzles in this section");
  if (puzzle.id !== puzzleId) {
    history.replaceState({}, "", `solve-mate-in-3.html?id=${puzzle.id}`);
  }

  puzzleNumEl.textContent = String(puzzle.id);
  document.title = `Puzzle #${puzzle.id} — Mate in 3 — LlamaChess`;
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
  resetPuzzle();
}

resetBtn.addEventListener("click", resetPuzzle);

main().catch((err) => {
  console.error(err);
  setStatus("Could not load this puzzle.", "error");
});
