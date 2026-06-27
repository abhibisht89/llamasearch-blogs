/**
 * Miniature f3/f6 solve page — validates the winning move to f3 or f6.
 * Loads data/sections/miniature_f3_f6.json directly (not shared data.js).
 */
import { Chess } from "chess.js";
import { Chessground } from "@lichess-org/chessground";
import { progress, migrateProgressToSequential } from "./progress.js";
import { initBoardThemeSwitcher } from "./board-theme.js";
import { createHintUi } from "./hint-ui.js";
import { initBoardSettings } from "./board-settings.js";
import { initPuzzleKeyboardNav } from "./board-keyboard.js";

const SECTION_ID = "miniature_f3_f6";
const DATA_URL = "data/sections/miniature_f3_f6.json";
const puzzleId = Number(new URLSearchParams(location.search).get("id") || "1");

const statusEl = document.getElementById("status-msg");
const boardEl = document.getElementById("board");
const puzzleNumEl = document.getElementById("puzzle-num");
const sideToMoveEl = document.getElementById("side-to-move");
const targetHintEl = document.getElementById("target-hint");
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
  const squares = puzzle.targetSquares?.join(" / ") || "f3 / f6";
  hint = createHintUi({
    idleTitle: "Your move",
    idleBody: `Find the winning move to ${squares}.`,
    revealBody: "Play this move to land on the target square.",
    doneTitle: "Done",
    doneBody: "You found the winning move.",
  });
  hint.setStatusHandler(setStatus);
  hint.setBlockedCheck(() => solved);
  hint.setMoveProvider(() => puzzle.solutionMoves?.[0] || null);
  hint.showIdle();
  hint.updateControls();
}

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

function showTargetHint() {
  if (!targetHintEl) return;
  const squares = puzzle.targetSquares?.join(" / ") || "f3 / f6";
  targetHintEl.textContent = `Winning move lands on ${squares}`;
}

function normalizeSan(san) {
  return san.replace(/[+#]$/, "");
}

function moveDest(san) {
  const s = normalizeSan(san);
  if (s.includes("=")) return s.split("=")[0].slice(-2);
  return s.slice(-2);
}

function isCorrectTargetMove(san) {
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
  const destSq = dest;
  const onTarget = puzzle.targetSquares?.includes(destSq) || destSq === puzzle.targetSquare;

  if (onTarget && isCorrectTargetMove(move.san)) {
    solved = true;
    progress.markSolved(SECTION_ID, puzzle.id);
    setStatus(`Correct! Winning move to ${moveDest(move.san)}.`, "success");
    hint?.markDone();
    updateGround(lastMove);
    return;
  }

  chess.undo();
  setStatus("Not quite — find the winning move to f3 or f6.", "error");
  updateGround();
}

function resetPuzzle() {
  solved = progress.isSolved(SECTION_ID, puzzle.id);
  chess = new Chess(puzzle.fen);
  setStatus(
    solved ? "Already solved — play again for practice." : "Find the winning move to f3 or f6.",
    solved ? "success" : "idle"
  );
  updateGround();
  hint?.reset();
}

function setupNav() {
  const { prev, next } = nextPrevIds(section, puzzle.id);
  prevBtn.href = prev ? `solve-miniature-f3-f6.html?id=${prev}` : "#";
  prevBtn.style.opacity = prev ? "1" : "0.4";
  prevBtn.style.pointerEvents = prev ? "auto" : "none";

  nextBtn.href = next ? `solve-miniature-f3-f6.html?id=${next}` : "#";
  nextBtn.style.opacity = next ? "1" : "0.4";
  nextBtn.style.pointerEvents = next ? "auto" : "none";
}

async function main() {
  initBoardThemeSwitcher();

  section = await loadSection();
  migrateProgressToSequential(SECTION_ID, section.puzzles);
  puzzle = getPuzzle(section, puzzleId);

  puzzleNumEl.textContent = String(puzzle.id);
  document.title = `Puzzle #${puzzle.id} — Miniature f3/f6 — LlamaChess`;
  showSideToMove(puzzle.sideToMove || puzzle.fen.split(" ")[1]);
  showTargetHint();

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
  initPuzzleKeyboardNav(prevBtn, nextBtn);
  initHint();
  initBoardSettings({ getFen: () => chess.fen(), onStatus: setStatus });
  resetPuzzle();
}

resetBtn.addEventListener("click", resetPuzzle);

main().catch((err) => {
  console.error(err);
  setStatus("Could not load this puzzle.", "error");
});
