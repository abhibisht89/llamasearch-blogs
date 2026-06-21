/**
 * Shared endgame line solver — play through the book's main line move-by-move.
 * User plays sideToMove; opponent replies are auto-played from solutionMoves.
 */
import { Chess } from "chess.js";
import { Chessground } from "@lichess-org/chessground";
import { progress, migrateProgressToSequential } from "./progress.js";
import {
  nextPrevLoadableIds,
  resolveLoadablePuzzle,
} from "./fen-utils.js";
import { initBoardThemeSwitcher } from "./board-theme.js";

export function createEndgameLineSolver(config) {
  const {
    sectionId,
    dataUrl,
    solvePage,
    sectionListPage,
    sectionTitle,
    playerSide = "w",
    successMessages = {},
  } = config;

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
  let moveIndex = 0;
  let autoPlaying = false;

  async function loadSection() {
    const res = await fetch(dataUrl);
    if (!res.ok) throw new Error(`Could not load ${dataUrl}`);
    return res.json();
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

  function expectedMove() {
    return puzzle.solutionMoves[moveIndex] ?? null;
  }

  function isPlayerTurn() {
    return chess.turn() === playerSide;
  }

  function successText() {
    if (puzzle.outcome === "draw") {
      return successMessages.draw || "Correct — the position is drawn.";
    }
    return successMessages.win || "Correct — winning technique found.";
  }

  function idleText() {
    if (puzzle.outcome === "draw") {
      return "Play the drawing line from the book.";
    }
    return "Play the winning line from the book.";
  }

  function markComplete() {
    solved = true;
    progress.markSolved(sectionId, puzzle.id);
    setStatus(successText(), "success");
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
        setStatus("Internal error replaying the book line.", "error");
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

    progress.markAttempted(sectionId, puzzle.id);

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

    if (normalizeSan(move.san) !== normalizeSan(bookMove)) {
      chess.undo();
      setStatus("Not the book move — try again.", "error");
      updateGround();
      return;
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
    solved = progress.isSolved(sectionId, puzzle.id);
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
    const { prev, next } = nextPrevLoadableIds(section, puzzle.id);
    prevBtn.href = prev ? `${solvePage}?id=${prev}` : "#";
    prevBtn.style.opacity = prev ? "1" : "0.4";
    prevBtn.style.pointerEvents = prev ? "auto" : "none";

    nextBtn.href = next ? `${solvePage}?id=${next}` : "#";
    nextBtn.style.opacity = next ? "1" : "0.4";
    nextBtn.style.pointerEvents = next ? "auto" : "none";
  }

  async function main() {
    initBoardThemeSwitcher();

    section = await loadSection();
    migrateProgressToSequential(sectionId, section.puzzles);
    puzzle = resolveLoadablePuzzle(section, puzzleId);
    if (!puzzle) throw new Error("No loadable puzzles in this section");
    if (puzzle.id !== puzzleId) {
      history.replaceState({}, "", `${solvePage}?id=${puzzle.id}`);
    }

    puzzleNumEl.textContent = String(puzzle.id);
    document.title = `Puzzle #${puzzle.id} — ${sectionTitle} — LlamaChess`;
    showSideToMove(puzzle.sideToMove || puzzle.fen.split(" ")[1]);

    solved = progress.isSolved(sectionId, puzzle.id);
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
}
