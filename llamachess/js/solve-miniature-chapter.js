import { Chess } from "chess.js";
import { Chessground } from "@lichess-org/chessground";
import { getChapter, chapterDataUrl } from "./miniatures-config.js";
import { progress, migrateProgressToSequential } from "./progress.js";
import { initBoardThemeSwitcher } from "./board-theme.js";

const params = new URLSearchParams(location.search);
const chapterSlug = params.get("chapter") || "f3_f6";
const chapterMeta = getChapter(chapterSlug);
const SECTION_ID = chapterMeta.id;
const puzzleId = Number(params.get("id") || "1");

const statusEl = document.getElementById("status-msg");
const boardEl = document.getElementById("board");
const puzzleNumEl = document.getElementById("puzzle-num");
const sideToMoveEl = document.getElementById("side-to-move");
const targetHintEl = document.getElementById("target-hint");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const resetBtn = document.getElementById("reset-btn");
const chapterCrumb = document.getElementById("chapter-crumb");

let chess;
let ground;
let puzzle;
let section;
let solved = false;

async function loadSection() {
  const res = await fetch(chapterDataUrl(chapterMeta));
  if (!res.ok) throw new Error(`Could not load ${chapterMeta.dataFile}`);
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

function solveHref(id) {
  return `solve-miniature-chapter.html?chapter=${chapterSlug}&id=${id}`;
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
  const squares = puzzle.targetSquares?.join(" / ") || chapterMeta.targets.join(" / ");
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
  const onTarget =
    puzzle.targetSquares?.includes(dest) || dest === puzzle.targetSquare;

  if (onTarget && isCorrectTargetMove(move.san)) {
    solved = true;
    progress.markSolved(SECTION_ID, puzzle.id);
    setStatus(`Correct! Winning move to ${moveDest(move.san)}.`, "success");
    updateGround(lastMove);
    return;
  }

  chess.undo();
  const hint = puzzle.targetSquares?.join(" or ") || chapterMeta.targets.join(" or ");
  setStatus(`Not quite — find the winning move to ${hint}.`, "error");
  updateGround();
}

function resetPuzzle() {
  solved = progress.isSolved(SECTION_ID, puzzle.id);
  chess = new Chess(puzzle.fen);
  const hint = puzzle.targetSquares?.join(" or ") || chapterMeta.targets.join(" or ");
  setStatus(
    solved ? "Already solved — play again for practice." : `Find the winning move to ${hint}.`,
    solved ? "success" : "idle"
  );
  updateGround();
}

function setupNav() {
  const { prev, next } = nextPrevIds(section, puzzle.id);
  prevBtn.href = prev ? solveHref(prev) : "#";
  prevBtn.style.opacity = prev ? "1" : "0.4";
  prevBtn.style.pointerEvents = prev ? "auto" : "none";

  nextBtn.href = next ? solveHref(next) : "#";
  nextBtn.style.opacity = next ? "1" : "0.4";
  nextBtn.style.pointerEvents = next ? "auto" : "none";
}

async function main() {
  initBoardThemeSwitcher();

  chapterCrumb.href = `miniature-chapter.html?chapter=${chapterSlug}`;
  chapterCrumb.textContent = chapterMeta.title;

  section = await loadSection();
  migrateProgressToSequential(SECTION_ID, section.puzzles);
  puzzle = getPuzzle(section, puzzleId);

  puzzleNumEl.textContent = String(puzzle.id);
  document.title = `Puzzle #${puzzle.id} — ${section.title} — LlamaChess`;
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
  resetPuzzle();
}

resetBtn.addEventListener("click", resetPuzzle);

main().catch((err) => {
  console.error(err);
  setStatus("Could not load this puzzle.", "error");
});
