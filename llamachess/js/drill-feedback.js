/**
 * Chessreps-style drill copy: plain-English moves, soft wrong-move hints,
 * and opponent turn prompts.
 */

const PIECE_NAMES = {
  K: "king",
  Q: "queen",
  R: "rook",
  B: "bishop",
  N: "knight",
};

export function normalizeSan(san) {
  return String(san || "").replace(/[+#?!]+/g, "");
}

/** e.g. Bc4 → "bishop to c4", exd4 → "pawn takes on d4" */
export function sanToPlain(san) {
  const raw = String(san || "").trim();
  const s = normalizeSan(raw);

  if (s === "O-O") return "castle kingside";
  if (s === "O-O-O") return "castle queenside";

  const promoMatch = s.match(/=([QRBNK])/);
  const promo = promoMatch ? PIECE_NAMES[promoMatch[1]] : null;
  const base = promoMatch ? s.split("=")[0] : s;

  const piece = PIECE_NAMES[base[0]];
  if (piece) {
    if (base.includes("x")) {
      const sq = base.slice(base.indexOf("x") + 1, base.indexOf("x") + 3);
      return `${piece} takes on ${sq}`;
    }
    const dest = base.match(/[a-h][1-8]/)?.[0];
    return dest ? `${piece} to ${dest}` : `${piece} ${base.toLowerCase()}`;
  }

  if (base.includes("x")) {
    const sq = base.slice(base.indexOf("x") + 1, base.indexOf("x") + 3);
    return `pawn takes on ${sq}`;
  }

  const dest = base.match(/[a-h][1-8]/)?.[0] || base;
  if (promo) return `pawn to ${dest}, promoting to ${promo}`;
  return `pawn to ${dest}`;
}

export function sideName(side) {
  return side === "w" ? "White" : "Black";
}

/** Chessreps-style pause before the opponent replies. */
export function opponentTurnPrompt(side) {
  return `Okay, ${sideName(side)}'s turn.`;
}

/**
 * Soft wrong-move feedback. Supports optional per-step overrides:
 * - step.wrongMoveHints: { "Bb5": "custom message" }
 * - step.alternatives: [{ san, note }]
 */
export function wrongMoveMessage(playedSan, expectedSan, step) {
  const played = normalizeSan(playedSan);

  if (step?.wrongMoveHints && typeof step.wrongMoveHints === "object") {
    for (const [san, note] of Object.entries(step.wrongMoveHints)) {
      if (normalizeSan(san) === played && note) return note;
    }
  }

  if (step?.alternatives?.length) {
    const alt = step.alternatives.find((a) => normalizeSan(a.san) === played);
    if (alt?.note) return alt.note;
  }

  return `You made an incorrect move. While fine, this course recommends playing ${sanToPlain(expectedSan)}.`;
}
