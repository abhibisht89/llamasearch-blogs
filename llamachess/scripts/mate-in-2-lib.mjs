/**
 * Shared mate-in-2 validation (mirrors js/solve.js continuation rules).
 */
import { Chess } from "../vendor/chess.js/dist/esm/chess.js";

export function isLoadableFen(fen) {
  try {
    new Chess(fen);
    return true;
  } catch {
    return false;
  }
}

export function removeBracketedText(text) {
  return text.replace(/\[[^\]]*\]/g, " ");
}

export function removeParenthesizedText(text) {
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

export function normalizeSolutionToken(token) {
  return token
    .replace(/X/g, "x")
    .replace(/m$/i, "#")
    .replace(/[?!]+$/g, "");
}

export function parseRawMainLine(raw) {
  if (!raw) return [];
  return removeParenthesizedText(removeBracketedText(raw))
    .replace(/\d+\.\.\./g, " ")
    .replace(/\d+\./g, " ")
    .split(/\s+/)
    .map((token) => normalizeSolutionToken(token.trim()))
    .filter(Boolean);
}

export function normalizeMove(san) {
  return san.replace(/#+$/, "#").replace(/\+#/, "#");
}

function cleanSan(san) {
  if (!san) return san;
  return san.replace(/#+/g, "#");
}

export function sideNotToMoveInCheck(fen) {
  const parts = fen.split(" ");
  const turn = parts[1];
  parts[1] = turn === "w" ? "b" : "w";
  try {
    const probe = new Chess(parts.join(" "));
    return probe.isCheck();
  } catch {
    return false;
  }
}

export function mateInTwoLine(puzzle) {
  if (puzzle.mateIn !== 2) return null;
  if (puzzle.solutionMoves?.length >= 3) return puzzle.solutionMoves.slice(0, 3);
  const rawLine = parseRawMainLine(puzzle.solutionRaw);
  return rawLine.length >= 3 ? rawLine.slice(0, 3) : null;
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

function continuationFromPosition(game, replySan, finalSan) {
  if (!replySan) return null;
  try {
    const probe = new Chess(game.fen());
    const reply = probe.move(cleanSan(replySan));
    if (!reply) return null;

    if (finalSan) {
      const finalMove = probe.move(cleanSan(finalSan));
      if (finalMove && probe.isCheckmate()) {
        return { replySan: reply.san, finalSan: finalMove.san };
      }
    }

    const computedMate = findCheckmateMove(probe);
    if (!computedMate) return null;
    return { replySan: reply.san, finalSan: computedMate };
  } catch {
    return null;
  }
}

export function derivedMateInTwoContinuation(game, preferredReply, preferredFinal) {
  const preferred = continuationFromPosition(game, preferredReply, preferredFinal);
  if (preferred) return preferred;

  for (const reply of game.moves({ verbose: true })) {
    const continuation = continuationFromPosition(game, reply.san, null);
    if (continuation) return continuation;
  }
  return null;
}

export function replayBookLine(fen, line) {
  const game = new Chess(fen);
  const played = [];
  for (const san of line) {
    const move = game.move(cleanSan(san));
    if (!move) return null;
    played.push(move.san);
  }
  return game.isCheckmate() ? played : null;
}

/**
 * Validate one puzzle for board play.
 * Returns { status, reason, line, continuation }.
 */
export function validateMateInTwoPuzzle(puzzle) {
  const bookId = puzzle.bookId;
  const id = puzzle.id;

  if (!puzzle.fen || !isLoadableFen(puzzle.fen)) {
    return { bookId, id, status: "unplayable", reason: "bad_fen" };
  }

  if (sideNotToMoveInCheck(puzzle.fen)) {
    return { bookId, id, status: "side_wrong", reason: "opponent_in_check" };
  }

  const line = mateInTwoLine(puzzle);
  if (!line || line.length < 3) {
    return { bookId, id, status: "line_wrong", reason: "incomplete_solution_line" };
  }

  const replayed = replayBookLine(puzzle.fen, line);
  if (!replayed) {
    return { bookId, id, status: "line_wrong", reason: "book_line_does_not_mate" };
  }

  const game = new Chess(puzzle.fen);
  try {
    const first = game.move(cleanSan(line[0]));
    if (!first) {
      return { bookId, id, status: "line_wrong", reason: "illegal_first_move" };
    }
  } catch {
    return { bookId, id, status: "line_wrong", reason: "illegal_first_move" };
  }

  const continuation = derivedMateInTwoContinuation(game, line[1], line[2]);
  if (!continuation) {
    return { bookId, id, status: "unplayable", reason: "no_board_continuation" };
  }

  const turnOk = puzzle.sideToMove === puzzle.fen.split(" ")[1];
  if (!turnOk) {
    return { bookId, id, status: "side_wrong", reason: "side_to_move_field_mismatch" };
  }

  return {
    bookId,
    id,
    status: "ok",
    reason: "ok",
    line: replayed,
    continuation,
  };
}
