/**
 * Convert SAN move lists into LlamaChess opening lesson steps (FEN, from/to, theory).
 */
import { Chess } from "../vendor/chess.js/dist/esm/chess.js";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * @param {string[]} moves SAN moves in order
 * @param {string[]} comments parallel commentary; comments[i] annotates moves[i]
 * @param {{ intro?: string, introTitle?: string, orientation?: 'white'|'black' }} opts
 */
export function buildStepsFromMoves(moves, comments = [], opts = {}) {
  const steps = [];
  const chess = new Chess();
  const userColor = opts.orientation === "black" ? "b" : "w";

  if (opts.intro) {
    steps.push({
      type: "intro",
      fen: chess.fen(),
      title: opts.introTitle || "Overview",
      theory: opts.intro,
      bookPage: null,
      segment: opts.introTitle || "Overview",
    });
  }

  for (let i = 0; i < moves.length; i++) {
    const san = moves[i];
    let move;
    try {
      move = chess.move(san);
    } catch (error) {
      throw new Error(`Illegal move ${san} at ply ${i + 1}: ${error.message}`);
    }

    steps.push({
      type: "move",
      san: move.san,
      fen: chess.fen(),
      moveNumber: chess.moveNumber(),
      turn: chess.turn(),
      title: move.color === "w" ? `${chess.moveNumber()}.${move.san}` : move.san,
      theory: comments[i] || "",
      alternatives: [],
      wrongMoveHints: opts.wrongMoveHints?.[i] || undefined,
      implications: "",
      from: move.from,
      to: move.to,
      bookPage: null,
      actor: move.color === userColor ? "user" : "opponent",
    });
  }

  return steps;
}

/** @param {object} line source line definition */
export function lineToLesson(line, lessonId) {
  const orientation = line.orientation || "white";
  const steps = buildStepsFromMoves(line.moves, line.comments, {
    intro: line.intro,
    introTitle: line.introTitle || line.title,
    orientation,
    wrongMoveHints: line.wrongMoveHints,
  });

  return {
    id: lessonId,
    topicId: line.topicId,
    partId: line.partId || "repertoire_lines",
    bookChapter: line.lineNumber || lessonId,
    bookPage: line.lineNumber || lessonId,
    title: line.title,
    subtitle: line.subtitle || `Line #${line.lineNumber || lessonId}`,
    status: "live",
    orientation,
    tags: line.tags || [],
    sourcePages: [],
    steps,
  };
}

export function summarizeLine(moves) {
  const chess = new Chess();
  const parts = [];
  for (const san of moves) {
    const move = chess.move(san);
    if (move.color === "w") parts.push(`${chess.moveNumber() - 1}.${move.san}`);
    else parts.push(`${chess.moveNumber()}...${move.san}`);
  }
  return parts.join(" ");
}

export { START_FEN };
