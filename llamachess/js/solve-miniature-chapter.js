/**
 * Miniature chapter solver — play the full winning combination line.
 * User plays their side; opponent replies are auto-played from solutionMoves.
 */
import { Chess } from "chess.js";
import { Chessground } from "@lichess-org/chessground";
import { getChapter, chapterDataUrl, filterPlayableMiniatures } from "./miniatures-config.js";
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
let moveIndex = 0;
let autoPlaying = false;
let playerSide = "w";

async function loadSection() {
  const [sectionRes, verifiedRes] = await Promise.all([
    fetch(chapterDataUrl(chapterMeta)),
    fetch(`data/sections/${SECTION_ID}_verified_ids.json`, { cache: "no-store" }),
  ]);
  if (!sectionRes.ok) throw new Error(`Could not load ${chapterMeta.dataFile}`);

  const sec = await sectionRes.json();
  if (!verifiedRes.ok) return sec;

  const verified = await verifiedRes.json();
  const verifiedIds = new Set(verified.ids || []);

  return filterPlayableMiniatures(sec, verifiedIds);
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

function targetSquares() {
  return puzzle.targetSquares?.length
    ? puzzle.targetSquares
    : puzzle.targetSquare
      ? [puzzle.targetSquare]
      : chapterMeta.targets;
}

function showTargetHint() {
  if (!targetHintEl) return;
  const squares = targetSquares().join(" / ");
  targetHintEl.textContent = `Winning combination — key move lands on ${squares}, then finish the line.`;
}

function normalizeMove(san) {
  return String(san || "").replace(/[+#]$/, "");
}

function expectedMove() {
  return puzzle.solutionMoves[moveIndex] ?? null;
}

function isPlayerTurn() {
  return chess.turn() === playerSide;
}

function idleText() {
  if (moveIndex === 0) {
    const squares = targetSquares().join(" or ");
    return `Find the winning move to ${squares}, then play the rest of the combination.`;
  }
  return "Continue the winning combination.";
}

function markComplete() {
  solved = true;
  progress.markSolved(SECTION_ID, puzzle.id);
  setStatus("Correct! Combination complete.", "success");
  updateGround();
}

function finishIfDone() {
  if (moveIndex >= puzzle.solutionMoves.length) {
    markComplete();
    return true;
  }
  return false;
}

function playOpponentReplies(lastMove) {
  autoPlaying = true;
  const playNext = (prevMove) => {
    if (finishIfDone()) {
      autoPlaying = false;
      return;
    }
    if (isPlayerTurn()) {
      autoPlaying = false;
      setStatus(idleText(), "idle");
      updateGround(prevMove);
      return;
    }

    const bookMove = expectedMove();
    if (!bookMove) {
      autoPlaying = false;
      markComplete();
      return;
    }

    try {
      const reply = chess.move(bookMove);
      moveIndex += 1;
      const lm = { from: reply.from, to: reply.to };
      window.setTimeout(() => playNext(lm), 180);
    } catch {
      autoPlaying = false;
      setStatus("Internal error replaying the combination.", "error");
      updateGround(prevMove);
    }
  };

  window.setTimeout(() => playNext(lastMove), 180);
}

function updateGround(lastMove) {
  const turn = chess.turn();
  const canMove = !solved && !autoPlaying && isPlayerTurn();

  ground.set({
    fen: chess.fen(),
    turnColor: orientColor(turn),
    movable: {
      color: canMove ? orientColor(playerSide) : undefined,
      dests: canMove ? toDests(chess) : new Map(),
    },
    lastMove: lastMove ? [lastMove.from, lastMove.to] : undefined,
    check: chess.isCheck() ? orientColor(chess.turn()) : false,
  });
  showSideToMove(turn);
}

function onMove(orig, dest) {
  if (solved || autoPlaying || !isPlayerTurn()) return;

  progress.markAttempted(SECTION_ID, puzzle.id);

  const move = chess.move({ from: orig, to: dest, promotion: "q" });
  if (!move) {
    updateGround();
    return;
  }

  const lastMove = { from: orig, to: dest };
  const bookMove = expectedMove();
  if (!bookMove) {
    chess.undo();
    setStatus("Unexpected move — reset and try again.", "error");
    updateGround();
    return;
  }

  if (normalizeMove(move.san) !== normalizeMove(bookMove)) {
    chess.undo();
    setStatus("Not the book move — try again.", "error");
    updateGround();
    return;
  }

  if (moveIndex === 0) {
    const targets = targetSquares();
    if (!targets.includes(dest)) {
      chess.undo();
      setStatus(`The first move must land on ${targets.join(" or ")}.`, "error");
      updateGround();
      return;
    }
  }

  moveIndex += 1;
  if (finishIfDone()) {
    updateGround(lastMove);
    return;
  }

  setStatus("Correct — opponent replying…", "idle");
  updateGround(lastMove);
  playOpponentReplies(lastMove);
}

function resetPuzzle() {
  solved = progress.isSolved(SECTION_ID, puzzle.id);
  moveIndex = 0;
  autoPlaying = false;
  chess = new Chess(puzzle.fen);
  setStatus(
    solved ? "Already solved — play again for practice." : idleText(),
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

  playerSide = puzzle.sideToMove || puzzle.fen.split(" ")[1] || "w";

  puzzleNumEl.textContent = String(puzzle.id);
  document.title = `Puzzle #${puzzle.id} — ${section.title} — LlamaChess`;
  showSideToMove(playerSide);
  showTargetHint();

  if (!puzzle.solutionMoves || puzzle.solutionMoves.length < 2) {
    setStatus("This puzzle is missing a full combination line.", "error");
    return;
  }

  solved = progress.isSolved(SECTION_ID, puzzle.id);
  chess = new Chess(puzzle.fen);

  ground = Chessground(boardEl, {
    fen: puzzle.fen,
    orientation: orientColor(playerSide),
    movable: {
      color: orientColor(playerSide),
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
