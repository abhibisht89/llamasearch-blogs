/**
 * Mate in 3 solve page — first move, auto reply, second move, auto reply, checkmate.
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
import { createHintUi } from "./hint-ui.js";
import { initBoardSettings } from "./board-settings.js";

const SECTION_ID = "mate_in_3";
const DATA_URL = "data/sections/mate_in_3.json";
const VERIFIED_IDS_URL = "data/sections/mate_in_3_verified_ids.json";
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
let autoPlaying = false;
let expectedMove2 = null;
let expectedFinalMate = null;
let activeContinuation = null;
let hint;

function currentHintMove() {
  if (expectedFinalMate) return expectedFinalMate;
  if (expectedMove2) return expectedMove2;
  const line = mateInThreeLine();
  return line?.[0] || puzzle.solutionMoves?.[0] || parseRawMainLine(puzzle.solutionRaw)[0] || null;
}

function initHint() {
  hint = createHintUi({
    idleTitle: "Your move",
    idleBody: "Find the first move, then finish the checkmate in three.",
    revealBody: "Play this move, then continue the mating line.",
    doneTitle: "Done",
    doneBody: "You finished the mate-in-three line.",
  });
  hint.setStatusHandler(setStatus);
  hint.setBlockedCheck(() => solved || autoPlaying);
  hint.setMoveProvider(currentHintMove);
  hint.showIdle();
  hint.updateControls();
}

async function loadSection() {
  const [sectionRes, verifiedRes] = await Promise.all([
    fetch(DATA_URL, { cache: "no-store" }),
    fetch(VERIFIED_IDS_URL, { cache: "no-store" }),
  ]);

  if (!sectionRes.ok) throw new Error(`Could not load ${DATA_URL}`);
  if (!verifiedRes.ok) throw new Error(`Could not load ${VERIFIED_IDS_URL}`);

  const sec = await sectionRes.json();
  const verified = await verifiedRes.json();
  const verifiedIds = new Set(verified.ids || []);

  sec.puzzles = sec.puzzles.filter((p) => verifiedIds.has(p.id));
  sec.available = sec.puzzles.length;

  return sec;
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

function normalizeMove(san) {
  return String(san || "").replace(/[+#]$/, "");
}

function normalizeSolutionToken(token) {
  return String(token || "")
    .replace(/X/g, "x")
    .replace(/m$/i, "#")
    .replace(/[?!]+$/g, "");
}

function removeBracketedText(text) {
  return String(text || "").replace(/\[[^\]]*\]/g, " ");
}

function removeParenthesizedText(text) {
  let result = "";
  let depth = 0;
  for (const char of String(text || "")) {
    if (char === "(") {
      depth += 1;
      continue;
    }
    if (char === ")") {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth === 0) result += char;
  }
  return result;
}

function parseRawMainLine(raw) {
  return removeParenthesizedText(removeBracketedText(raw))
    .replace(/\d+\.\.\./g, " ")
    .replace(/\d+\./g, " ")
    .split(/\s+/)
    .map((token) => normalizeSolutionToken(token.trim()))
    .filter(Boolean);
}

function mateInThreeLine() {
  if (puzzle.solutionMoves?.length >= 5) return puzzle.solutionMoves.slice(0, 5);
  const rawLine = parseRawMainLine(puzzle.solutionRaw);
  return rawLine.length >= 5 ? rawLine.slice(0, 5) : null;
}

function mateInThreeFirstMoves() {
  const line = mateInThreeLine();
  const raw = parseRawMainLine(puzzle.solutionRaw);
  const candidates = [line?.[0], puzzle.solutionMoves?.[0], raw[0]].filter(Boolean);
  return [...new Set(candidates.map(normalizeMove))];
}

function findCheckmateMove(game) {
  for (const candidate of game.moves({ verbose: true })) {
    game.move(candidate.san);
    const isMate = game.isCheckmate();
    game.undo();
    if (isMate) return candidate.san;
  }
  return null;
}

function continuationFromPosition(reply1San, move2San, reply2San, finalSan) {
  if (!reply1San) return null;

  try {
    const probe = new Chess(chess.fen());
    const reply1 = probe.move(reply1San);
    if (!reply1) return null;

    if (move2San) {
      const move2 = probe.move(move2San);
      if (!move2) return null;

      if (reply2San) {
        const reply2 = probe.move(reply2San);
        if (!reply2) return null;

        if (finalSan) {
          const finalMove = probe.move(finalSan);
          if (finalMove && probe.isCheckmate()) {
            return {
              reply1San: reply1.san,
              move2San: move2.san,
              reply2San: reply2.san,
              finalSan: finalMove.san,
            };
          }
        }

        const computedMate = findCheckmateMove(probe);
        if (computedMate) {
          return {
            reply1San: reply1.san,
            move2San: move2.san,
            reply2San: reply2.san,
            finalSan: computedMate,
          };
        }
      } else {
        for (const reply2 of probe.moves({ verbose: true })) {
          const branch = new Chess(probe.fen());
          branch.move(reply2.san);
          const mate = findCheckmateMove(branch);
          if (mate) {
            return {
              reply1San: reply1.san,
              move2San: move2.san,
              reply2San: reply2.san,
              finalSan: mate,
            };
          }
        }
      }
    }
  } catch {
    return null;
  }

  return null;
}

function derivedMateInThreeContinuation(preferredLine) {
  const preferred = continuationFromPosition(
    preferredLine?.[1],
    preferredLine?.[2],
    preferredLine?.[3],
    preferredLine?.[4]
  );
  if (preferred) return preferred;

  for (const reply1 of chess.moves({ verbose: true })) {
    const branch = new Chess(chess.fen());
    branch.move(reply1.san);
    for (const move2 of branch.moves({ verbose: true })) {
      const trial = new Chess(branch.fen());
      trial.move(move2.san);
      for (const reply2 of trial.moves({ verbose: true })) {
        const end = new Chess(trial.fen());
        end.move(reply2.san);
        const mate = findCheckmateMove(end);
        if (mate) {
          return {
            reply1San: reply1.san,
            move2San: move2.san,
            reply2San: reply2.san,
            finalSan: mate,
          };
        }
      }
    }
  }

  return null;
}

function getMateInThreeContinuation(firstMove) {
  if (!mateInThreeFirstMoves().includes(normalizeMove(firstMove.san))) return null;

  const line = mateInThreeLine();
  const rawLine = parseRawMainLine(puzzle.solutionRaw);
  return derivedMateInThreeContinuation(line || rawLine);
}

function updateGround(lastMove) {
  const turn = chess.turn();
  const canMove = !solved && !autoPlaying && turn === puzzle.sideToMove;

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
  showSideToMove(turn);
}

function markSolved(message) {
  solved = true;
  expectedMove2 = null;
  expectedFinalMate = null;
  activeContinuation = null;
  progress.markSolved(SECTION_ID, puzzle.id);
  setStatus(message, "success");
  hint?.markDone();
}

function fallbackNoLine(lastMove) {
  chess.undo();
  expectedMove2 = null;
  expectedFinalMate = null;
  activeContinuation = null;
  setStatus("Correct first move, but this local row has no playable mate line.", "error");
  updateGround();
}

function playAutoReply(replySan, nextExpectedMove2, nextExpectedFinalMate, statusText, lastMove) {
  autoPlaying = true;
  hint?.updateControls();
  setStatus(statusText, "idle");
  updateGround(lastMove);

  window.setTimeout(() => {
    try {
      const reply = chess.move(replySan);
      expectedMove2 = nextExpectedMove2;
      expectedFinalMate = nextExpectedFinalMate;
      autoPlaying = false;
      hint?.updateControls();
      setStatus(nextExpectedFinalMate ? "Now find checkmate." : "Continue the attack.", "idle");
      updateGround({ from: reply.from, to: reply.to });
    } catch {
      autoPlaying = false;
      expectedMove2 = null;
      expectedFinalMate = null;
      fallbackNoLine(lastMove);
    }
  }, 180);
}

function onMove(orig, dest) {
  if (solved || autoPlaying) return;

  progress.markAttempted(SECTION_ID, puzzle.id);

  const move = chess.move({ from: orig, to: dest, promotion: "q" });
  if (!move) {
    updateGround();
    return;
  }

  const lastMove = { from: orig, to: dest };

  if (expectedFinalMate) {
    if (chess.isCheckmate() && normalizeMove(move.san) === normalizeMove(expectedFinalMate)) {
      markSolved("Solved! Checkmate.");
      updateGround(lastMove);
      return;
    }
    chess.undo();
    setStatus("Not quite — find the checkmate.", "error");
    updateGround();
    return;
  }

  if (expectedMove2) {
    if (normalizeMove(move.san) === normalizeMove(expectedMove2)) {
      if (!activeContinuation?.reply2San) {
        chess.undo();
        setStatus("This local row has no playable mate line.", "error");
        updateGround();
        return;
      }
      playAutoReply(
        activeContinuation.reply2San,
        null,
        activeContinuation.finalSan,
        "Correct — opponent replying…",
        lastMove
      );
      return;
    }
    chess.undo();
    setStatus("Not quite — find the next move in the sequence.", "error");
    updateGround();
    return;
  }

  const continuation = getMateInThreeContinuation(move);
  if (continuation) {
    activeContinuation = continuation;
    playAutoReply(
      continuation.reply1San,
      continuation.move2San,
      null,
      "Correct first move — opponent replying…",
      lastMove
    );
    return;
  }

  chess.undo();
  setStatus("Not quite — find the correct first move.", "error");
  updateGround();
}

function resetPuzzle() {
  const alreadySolved = progress.isSolved(SECTION_ID, puzzle.id);
  solved = false;
  autoPlaying = false;
  expectedMove2 = null;
  expectedFinalMate = null;
  activeContinuation = null;
  chess = new Chess(puzzle.fen);
  setStatus(
    alreadySolved
      ? "Already solved — play again for practice."
      : "Find the first move, then finish the checkmate in three.",
    alreadySolved ? "success" : "idle"
  );
  updateGround();
  hint?.reset();
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
