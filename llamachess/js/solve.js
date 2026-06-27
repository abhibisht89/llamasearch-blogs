import { Chess } from "chess.js";
import { Chessground } from "@lichess-org/chessground";
import { getSection, nextPrevIds } from "./data.js";
import {
  nextPrevLoadableIds,
  resolveLoadablePuzzle,
} from "./fen-utils.js";
import { progress, migrateProgressToSequential } from "./progress.js";
import { initBoardThemeSwitcher } from "./board-theme.js";
import { createHintUi } from "./hint-ui.js";

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
const sectionLinkEl = document.getElementById("section-link");
const MATE_IN_1_VERIFIED_IDS_URL = "data/sections/mate_in_1_verified_ids.json";
const MATE_IN_2_VERIFIED_IDS_URL = "data/sections/mate_in_2_verified_ids.json";

let chess;
let ground;
let puzzle;
let section;
let solved = false;
let autoPlaying = false;
let expectedFinalMate = null;
let hint;

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

function initHint() {
  const isMi1 = sectionId === "mate_in_1";
  const isMi2 = sectionId === "mate_in_2";
  if (!isMi1 && !isMi2) {
    document.getElementById("hint-card")?.style.setProperty("display", "none");
    document.getElementById("hint-btn")?.style.setProperty("display", "none");
    return;
  }

  hint = createHintUi({
    idleTitle: "Your move",
    idleBody: isMi1
      ? "Find the checkmate in one move."
      : "Find the first move, then finish the checkmate.",
    revealBody: isMi1
      ? "Play this move to deliver checkmate."
      : "Play this move, then continue the mating line.",
    doneTitle: "Done",
    doneBody: isMi1 ? "You found the checkmate." : "You finished the mating line.",
  });

  hint.setStatusHandler(setStatus);
  hint.setBlockedCheck(() => solved || autoPlaying);
  hint.setMoveProvider(() => {
    if (expectedFinalMate) return expectedFinalMate;
    if (isMi1) return mateInOneSolutionSan();
    return mateInTwoFirstMove();
  });
  hint.showIdle();
  hint.updateControls();
}

function mateInOneSolutionSan() {
  if (!isMateInOne()) return null;
  if (puzzle.solutionMoves?.[0]) return puzzle.solutionMoves[0];
  return parseRawMainLine(puzzle.solutionRaw)[0] || null;
}

function isMateInOne() {
  return (puzzle.mateIn || 1) === 1;
}

function isMateInTwo() {
  return puzzle.mateIn === 2;
}

function normalizeMove(san) {
  if (isMateInOne()) {
    return san.endsWith("#") ? san : san.replace("+", "") + "#";
  }
  return san.replace(/[+#]$/, "");
}

function normalizeSolutionToken(token) {
  return token
    .replace(/X/g, "x")
    .replace(/m$/i, "#")
    .replace(/[?!]+$/g, "");
}

function removeBracketedText(text) {
  return text.replace(/\[[^\]]*\]/g, " ");
}

function removeParenthesizedText(text) {
  let result = "";
  let depth = 0;

  for (const char of text) {
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
  if (!raw) return [];

  // The local Polgar JSON often stores only the first move in solutionMoves.
  // Use the readable source line when it contains a complete main line.
  return removeParenthesizedText(removeBracketedText(raw))
    .replace(/\d+\.\.\./g, " ")
    .replace(/\d+\./g, " ")
    .split(/\s+/)
    .map((token) => normalizeSolutionToken(token.trim()))
    .filter(Boolean);
}

function mateInTwoLine() {
  if (!isMateInTwo()) return null;
  if (puzzle.solutionMoves?.length >= 3) return puzzle.solutionMoves.slice(0, 3);

  const rawLine = parseRawMainLine(puzzle.solutionRaw);
  return rawLine.length >= 3 ? rawLine.slice(0, 3) : null;
}

function mateInTwoFirstMove() {
  if (!isMateInTwo()) return null;

  const fullLine = mateInTwoLine();
  if (fullLine?.[0]) return fullLine[0];

  return puzzle.solutionMoves?.[0] || parseRawMainLine(puzzle.solutionRaw)[0] || null;
}

function mateInTwoFirstMoves() {
  if (!isMateInTwo()) return [];

  const candidates = [
    mateInTwoLine()?.[0],
    puzzle.solutionMoves?.[0],
    parseRawMainLine(puzzle.solutionRaw)[0],
  ].filter(Boolean);

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

function continuationFromPosition(replySan, finalSan) {
  if (!replySan) return null;

  try {
    const probe = new Chess(chess.fen());
    const reply = probe.move(replySan);
    if (!reply) return null;

    if (finalSan) {
      const finalMove = probe.move(finalSan);
      if (finalMove && probe.isCheckmate()) {
        return {
          replySan: reply.san,
          finalSan: finalMove.san,
        };
      }
    }

    const computedMate = findCheckmateMove(probe);
    if (!computedMate) return null;

    return {
      replySan: reply.san,
      finalSan: computedMate,
    };
  } catch {
    return null;
  }
}

function derivedMateInTwoContinuation(preferredReply, preferredFinal) {
  const preferred = continuationFromPosition(preferredReply, preferredFinal);
  if (preferred) return preferred;

  // Some local rows have only the key move. Keep practice usable by choosing
  // a legal defender reply that still has an immediate mate on the board.
  for (const reply of chess.moves({ verbose: true })) {
    const continuation = continuationFromPosition(reply.san, null);
    if (continuation) return continuation;
  }

  return null;
}

function getMateInTwoContinuation(firstMove) {
  const line = mateInTwoLine();
  if (!mateInTwoFirstMoves().includes(normalizeMove(firstMove.san))) return null;

  try {
    const rawLine = parseRawMainLine(puzzle.solutionRaw);
    return derivedMateInTwoContinuation(line?.[1] || rawLine[1], line?.[2] || rawLine[2]);
  } catch {
    return null;
  }
}

function isCorrectMove(san) {
  const played = normalizeMove(san);
  const candidateMoves = [...(puzzle.solutionMoves || [])];
  const fullMateLine = mateInTwoLine();
  const firstMove = mateInTwoFirstMove();

  if (fullMateLine?.[0]) candidateMoves.push(fullMateLine[0]);
  if (firstMove) candidateMoves.push(firstMove);

  return candidateMoves.some((s) => normalizeMove(s) === played);
}

/** Pawn promotion piece for this from/to, parsed from the book solution when needed. */
function promotionPieceForMove(orig, dest) {
  const piece = chess.get(orig);
  if (!piece || piece.type !== "p") return null;

  const promoRank = piece.color === "w" ? "8" : "1";
  if (dest[1] !== promoRank) return null;

  const candidateSans = [...(puzzle.solutionMoves || [])];
  const fullMateLine = mateInTwoLine();
  if (fullMateLine) candidateSans.push(...fullMateLine);

  for (const san of candidateSans) {
    for (const promo of ["q", "r", "b", "n"]) {
      const probe = new Chess(chess.fen());
      try {
        const m = probe.move({ from: orig, to: dest, promotion: promo });
        if (m && normalizeMove(m.san) === normalizeMove(san)) return promo;
      } catch {
        // try next promotion piece
      }
    }
  }

  return "q";
}

function applyPlayerMove(orig, dest) {
  const promotion = promotionPieceForMove(orig, dest);
  if (promotion) return chess.move({ from: orig, to: dest, promotion });
  return chess.move({ from: orig, to: dest });
}

function updateGround(lastMove) {
  const turn = chess.turn();
  const canMove = !solved && !autoPlaying && turn === puzzle.sideToMove;
  const fen = chess.fen();

  ground.set({
    fen,
    turnColor: orientColor(turn),
    movable: {
      color: canMove ? orientColor(puzzle.sideToMove) : undefined,
      dests: canMove ? toDests(chess) : new Map(),
    },
    lastMove: lastMove ? [lastMove.from, lastMove.to] : undefined,
    check: chess.isCheck() ? orientColor(chess.turn()) : false,
  });
  // Lets automations (do-check) verify the live board matches chess.js.
  if (boardEl) boardEl.dataset.fen = fen;
  showSideToMove(turn);
}

/** Snap chessground back to the puzzle start (no animation — practice reset). */
function syncGroundToPuzzleStart() {
  const turn = puzzle.sideToMove || chess.turn();

  ground.cancelMove?.();
  // Instant reset: animated fen updates can leave pieces stuck after a solved line.
  ground.set({ animation: { enabled: false } });
  ground.set({
    fen: puzzle.fen,
    turnColor: orientColor(turn),
    lastMove: undefined,
    check: false,
    movable: {
      color: orientColor(puzzle.sideToMove),
      dests: toDests(chess),
    },
  });
  ground.set({ animation: { enabled: true, duration: 180 } });
  if (boardEl) boardEl.dataset.fen = puzzle.fen;
  showSideToMove(turn);
}

function markSolved(message) {
  solved = true;
  expectedFinalMate = null;
  progress.markSolved(sectionId, puzzle.id);
  setStatus(message, "success");
  hint?.markDone();
}

function fallbackToFirstMoveSolved(lastMove) {
  chess.undo();
  expectedFinalMate = null;
  setStatus("Correct first move, but this local row has no playable mate line.", "error");
  updateGround();
}

function playMateInTwoReply(continuation, lastMove) {
  autoPlaying = true;
  hint?.updateControls();
  setStatus("Correct first move — opponent replying…", "idle");
  updateGround(lastMove);

  window.setTimeout(() => {
    try {
      const reply = chess.move(continuation.replySan);
      expectedFinalMate = continuation.finalSan;
      autoPlaying = false;
      hint?.updateControls();
      setStatus("Now find checkmate.", "idle");
      updateGround({ from: reply.from, to: reply.to });
    } catch {
      autoPlaying = false;
      expectedFinalMate = null;
      fallbackToFirstMoveSolved(lastMove);
    }
  }, 180);
}

function onMove(orig, dest) {
  if (solved || autoPlaying) return;

  progress.markAttempted(sectionId, puzzle.id);

  const move = applyPlayerMove(orig, dest);
  if (!move) {
    updateGround();
    return;
  }

  const lastMove = { from: orig, to: dest };

  if (expectedFinalMate) {
    const correctFinalMove =
      chess.isCheckmate() && normalizeMove(move.san) === normalizeMove(expectedFinalMate);

    if (correctFinalMove) {
      markSolved("Solved! Checkmate.");
      updateGround(lastMove);
      return;
    }

    chess.undo();
    setStatus("Not quite — find the checkmate.", "error");
    updateGround();
    return;
  }

  const correct =
    isMateInOne()
      ? chess.isCheckmate() && isCorrectMove(move.san)
      : isCorrectMove(move.san);

  if (correct) {
    if (isMateInTwo()) {
      const continuation = getMateInTwoContinuation(move);
      if (continuation) {
        playMateInTwoReply(continuation, lastMove);
        return;
      }

      fallbackToFirstMoveSolved(lastMove);
      return;
    }

    markSolved("Solved! Checkmate.");
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
  if (isMateInTwo()) return "Find the first move, then finish the checkmate.";
  return "Find the correct first move.";
}

function resetPuzzle() {
  const alreadySolved = progress.isSolved(sectionId, puzzle.id);
  solved = false;
  autoPlaying = false;
  expectedFinalMate = null;
  chess = new Chess(puzzle.fen);
  syncGroundToPuzzleStart();
  setStatus(
    alreadySolved ? "Already solved — play again for practice." : idlePrompt(),
    alreadySolved ? "success" : "idle"
  );
  hint?.reset();
}

function setupNav() {
  const navIds = isMateInTwo()
    ? nextPrevLoadableIds(section, puzzle.id)
    : nextPrevIds(section, puzzle.id);
  const { prev, next } = navIds;
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

function sectionPageHref() {
  const pages = {
    mate_in_1: "mate-in-1.html",
    mate_in_2: "mate-in-2.html",
    mate_in_3: "mate-in-3.html",
  };

  return pages[sectionId] || "collection.html";
}

async function filterToVerifiedPuzzles(sec) {
  const verifiedUrl =
    sectionId === "mate_in_1"
      ? MATE_IN_1_VERIFIED_IDS_URL
      : sectionId === "mate_in_2"
        ? MATE_IN_2_VERIFIED_IDS_URL
        : null;

  if (!verifiedUrl) return sec;

  const res = await fetch(verifiedUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load ${verifiedUrl}`);

  const verified = await res.json();
  const verifiedIds = new Set(verified.ids || []);

  return {
    ...sec,
    available: verifiedIds.size,
    puzzles: sec.puzzles.filter((p) => verifiedIds.has(p.id)),
  };
}

function setupBreadcrumb() {
  if (!sectionLinkEl) return;

  sectionLinkEl.href = sectionPageHref();
  sectionLinkEl.textContent = section?.title || "Polgar Collection";
}

async function main() {
  initBoardThemeSwitcher();

  const sec = await getSection(sectionId);
  migrateProgressToSequential(sectionId, sec.puzzles);

  section = await filterToVerifiedPuzzles(sec);
  setupBreadcrumb();
  puzzle = resolveLoadablePuzzle(section, puzzleId);
  if (!puzzle) throw new Error("No loadable puzzles in this section");
  if (puzzle.id !== puzzleId) {
    history.replaceState({}, "", `solve.html?section=${sectionId}&id=${puzzle.id}`);
  }

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
  initHint();
  resetPuzzle();
}

resetBtn.addEventListener("click", resetPuzzle);

main().catch((err) => {
  console.error(err);
  setStatus("Could not load this puzzle.", "error");
});
