/**
 * Generate casual Chessreps-style move commentary for repertoire lines.
 * Keeps hand-written comments; upgrades generic stubs at build time.
 */
import { Chess } from "../vendor/chess.js/dist/esm/chess.js";

const STUB_PATTERNS = [
  /^Play .+ — this is your move in the line\.?$/,
  /^Play .+ — your move here\.?$/,
  /^Black plays .+\. Know your reply\.?$/,
  /^White plays .+\. Know your reply\.?$/,
];

const PIECE_NAMES = { K: "king", Q: "queen", R: "rook", B: "bishop", N: "knight" };

function normalizeSan(san) {
  return String(san || "").replace(/[+#?!]+/g, "");
}

export function sanToPlain(san) {
  const s = normalizeSan(san);
  if (s === "O-O") return "castle kingside";
  if (s === "O-O-O") return "castle queenside";

  const promo = s.match(/=([QRBNK])/)?.[1];
  const base = promo ? s.split("=")[0] : s;
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
  return `pawn to ${dest}`;
}

export function isStubComment(text) {
  const t = String(text || "").trim();
  if (!t) return true;
  if (STUB_PATTERNS.some((re) => re.test(t))) return true;
  // Ultra-short echo: "e4." "Nf3." "...e5."
  if (t.length <= 12 && /^\.{0,3}[NBRQK]?[a-h]?x?[a-h][1-8][+#]?\.?$/.test(t)) return true;
  return false;
}

const OPENING_RESPONSES = {
  c5: "Black fires back with ...c5 — the Sicilian Defense!",
  c6: "Black plays ...c6, heading into a Caro-Kann structure.",
  e5: "Black responds ...e5 — the classical fight for the center.",
  e6: "Black plays ...e6 — solid and flexible.",
  d5: "Black strikes with ...d5 in the center.",
  d6: "Black plays ...d6 — a solid but passive setup.",
  Nf6: "Black develops ...Nf6, putting pressure on your e4 pawn.",
  Nc6: "Black defends with ...Nc6.",
  Bc5: "The Giuoco Piano — Black mirrors with ...Bc5.",
  Bb4: "Black checks with ...Bb4+ — you need to deal with the king.",
  Be7: "Black develops ...Be7, keeping things solid.",
  g6: "Black fianchettos with ...g6 — Dragon vibes.",
  Bg7: "Black completes the fianchetto with ...Bg7.",
  a6: "Black plays ...a6 — flexible prophylaxis.",
  "O-O": "Black castles kingside.",
};

const USER_MOVE_IDEAS = {
  e4: "Claim the center with pawn to e4.",
  d4: "Take space with pawn to d4.",
  c4: "English style — pawn to c4, keeping things flexible.",
  Nf3: "Knight to f3 — develop and attack the center.",
  Nc3: "Knight to c3 — develop with tempo toward the center.",
  Bc4: "Bishop to c4 — aimed at f7, the weakest pawn in Black's camp.",
  Bb5: "Bishop to b5 — pin the knight and pressure e5.",
  Bf4: "Bishop to f4 — the London bishop, active on the long diagonal.",
  Bd3: "Bishop to d3 — solid development toward the kingside.",
  Be3: "Bishop to e3 — tuck the bishop in and support the center.",
  c3: "Pawn to c3 — set up a central break with d4.",
  d3: "Quiet pawn to d3 — solid development before opening the center.",
  "O-O": "Castle kingside — safety first, then the attack.",
  "O-O-O": "Castle queenside — the king is safe and the rook eyes the c-file.",
  Re1: "Rook to e1 — pressure down the open e-file.",
  Qd2: "Queen to d2 — connect the rooks and keep the king safe.",
};

const BLACK_USER_IDEAS = {
  c5: "Strike back with ...c5 — the Sicilian!",
  c6: "Solid ...c6 — the Caro-Kann foundation.",
  e5: "Meet 1.e4 with ...e5 — classical and sound.",
  e6: "Flexible ...e6 — support the center and develop smoothly.",
  d5: "Challenge White with ...d5 in the center.",
  d6: "Solid ...d6 — keep the position compact.",
  Nf6: "Develop ...Nf6 — hit back at the center.",
  Nc6: "Develop ...Nc6 — natural and active.",
  Nc3: "Develop ...Nc3 — get pieces into the fight.",
  Bc5: "Bishop to c5 — mirror White and target f2.",
  Bd6: "Bishop to d6 — challenge White's London bishop.",
  Be7: "Bishop to e7 — solid development.",
  g6: "Fianchetto with ...g6 — prepare ...Bg7.",
  Bg7: "Complete the fianchetto with ...Bg7.",
  a6: "Prophylaxis with ...a6.",
  b5: "Expand on the queenside with ...b5.",
  Qb6: "Queen to b6 — pressure b2 and the queenside.",
  "O-O": "Castle kingside — get the king safe.",
};

function describeCapture(move) {
  const plain = sanToPlain(move.san);
  return `Take with ${plain}.`;
}

function describeCheck(move) {
  const plain = sanToPlain(move.san);
  return move.san.includes("+") ? `${plain} — check!` : plain;
}

function describeOpponentMove(move, userColor, openingName) {
  const key = normalizeSan(move.san);
  const isBlackMove = move.color === "b";
  const label = isBlackMove ? "Black" : "White";

  if (userColor === "w" && OPENING_RESPONSES[key]) return OPENING_RESPONSES[key];

  if (move.san.includes("x")) {
    return `${label} captures with ${sanToPlain(move.san)}.`;
  }
  return `${label} plays ${sanToPlain(move.san)} — know your reply.`;
}

function describeUserMove(move, ply, openingName, userColor) {
  const key = normalizeSan(move.san);

  if (userColor === "w" && USER_MOVE_IDEAS[key]) return USER_MOVE_IDEAS[key];
  if (userColor === "b" && BLACK_USER_IDEAS[key]) return BLACK_USER_IDEAS[key];

  if (move.san.includes("x")) return describeCapture(move);
  if (move.san.includes("+")) return describeCheck(move);
  if (ply === 0) return `Let's get into the ${openingName} — ${sanToPlain(move.san)}.`;
  if (userColor === "b") return `Your move: ${sanToPlain(move.san)}.`;
  return `Play ${sanToPlain(move.san)} — your move in this line.`;
}

function generateComment(chess, san, ply, userColor, openingName) {
  const move = chess.move(san);
  if (!move) return `Play ${sanToPlain(san)}.`;

  const isUser = move.color === userColor;
  if (isUser) return describeUserMove(move, ply, openingName, userColor);
  return describeOpponentMove(move, userColor, openingName);
}

/**
 * @param {string[]} moves
 * @param {{ orientation?: 'white'|'black', openingName?: string, existingComments?: string[] }} opts
 */
export function richComments(moves, opts = {}) {
  const userColor = opts.orientation === "black" ? "b" : "w";
  const openingName = opts.openingName || "opening";
  const existing = opts.existingComments || [];
  const out = [];

  for (let i = 0; i < moves.length; i++) {
    if (existing[i] && !isStubComment(existing[i])) {
      out.push(existing[i]);
    } else {
      const chess = new Chess();
      for (let j = 0; j < i; j++) chess.move(moves[j]);
      out.push(generateComment(chess, moves[i], i, userColor, openingName));
    }
  }

  return out;
}

/** Enrich a line object before lineToLesson. */
export function enrichLineComments(line, meta) {
  const orientation = line.orientation || (meta.color === "black" ? "black" : "white");
  const comments = richComments(line.moves, {
    orientation,
    openingName: meta.name,
    existingComments: line.comments,
  });

  return { ...line, comments };
}
