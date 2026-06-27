/** Shared FEN / PGN helpers for exporting positions to Lichess or the clipboard. */

/** Side to move from a FEN string: "white" or "black". */
export function fenActiveColor(fen) {
  const side = String(fen || "").trim().split(/\s+/)[1];
  return side === "b" ? "black" : "white";
}

/** Minimal PGN that loads a FEN setup position in external tools. */
export function buildPgnFromFen(fen, { event = "LlamaChess" } = {}) {
  const clean = String(fen || "").trim();
  return `[Event "${event}"]\n[FEN "${clean}"]\n[SetUp "1"]\n\n*`;
}

/** Lichess analysis board from a raw FEN path segment (most reliable for setup positions). */
export function lichessAnalysisUrlFromFen(fen, orientation) {
  const clean = String(fen || "").trim();
  const path = clean.replace(/ /g, "_");
  // Lichess ?color= is board orientation (bottom side), not side to move.
  const color = orientation === "black" || orientation === "white"
    ? orientation
    : fenActiveColor(clean);
  return `https://lichess.org/analysis/${path}?color=${color}`;
}

/**
 * Open the current position in Lichess analysis.
 * Pass orientation ("white" | "black") to match the LlamaChess board view.
 */
export function lichessAnalysisUrl(fen, orientation) {
  return lichessAnalysisUrlFromFen(fen, orientation);
}

/**
 * Lichess analysis board via PGN import (for tools that need movetext).
 * Prefer lichessAnalysisUrl() for "Open in Lichess" in the browser.
 */
export function lichessAnalysisUrlFromPgn(fen, meta) {
  const pgn = buildPgnFromFen(fen, meta);
  const color = fenActiveColor(fen);
  return `https://lichess.org/analysis/pgn?pgn=${encodeURIComponent(pgn)}&color=${color}`;
}

/** Copy text to the clipboard with a textarea fallback for older browsers. */
export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
