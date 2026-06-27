/**
 * Shared wrong-move hints for Italian Game repertoire lines (White).
 * Applied automatically from move context — no need to hand-edit every line.
 */

const BC4_HINTS = {
  Bb5: "While fine, this course recommends playing bishop to c4 — the Italian Game targets f7, not the Ruy Lopez on b5.",
  "Bb5 a6": "That's the Ruy Lopez — this course plays the Italian with bishop to c4.",
  d4: "While fine, this course recommends bishop to c4 first. We'll hit the center with c3 and d4 once the Italian bishop is out.",
  Nc3: "While fine, develop the bishop to c4 before bringing the knight out again.",
  Be2: "While fine, this course recommends the active Italian bishop to c4, not the quiet e2 setup.",
};

const C3_GIUOCO_HINTS = {
  b4: "That's the Evans Gambit — fun, but this course plays the Italian center attack with pawn to c3.",
  d3: "While solid, this course recommends pawn to c3 to set up the classic c3–d4 center strike.",
  Nc3: "Hold the knight — pawn to c3 is the move that makes this an Italian Game.",
  Bb3: "While fine, this course recommends pawn to c3, preparing d4 against Black's bishop on c5.",
};

const D4_GIUOCO_HINTS = {
  d3: "Too slow here — this course strikes with pawn to d4 while Black's bishop is still on c5.",
  Nbd2: "Save the knight for later — pawn to d4 opens the center now.",
  Bb3: "While fine, pawn to d4 is the main Italian idea — attack the center and the c5-bishop.",
};

const D3_QUIET_HINTS = {
  d4: "While fine, this line plays quiet pawn to d3 first — save d4 for when development is complete.",
  Nc3: "While fine, this course recommends pawn to d3 in this quiet Italian setup.",
};

const NC3_AFTER_BB4_HINTS = {
  Bd2: "While fine, this course recommends knight to c3 — develop a piece and offer the e4 pawn.",
  Nd2: "While fine, knight to c3 is sharper — it develops and keeps the gambit ideas alive.",
  Qe2: "While fine, this course recommends knight to c3 here in the Greco Gambit.",
};

const CASTLE_GRECO_HINTS = {
  Qe2: "While fine, this course recommends castling — ignore the pawn grab and get the king safe.",
  "Bxf7+": "While fine, just castle! Development beats material when Black's king is stuck in the center.",
  Re1: "Castle first — the rook belongs on e1 after your king is safe.",
  Nxe4: "Don't grab back yet — castle kingside and let the attack roll.",
};

const BA3_HINTS = {
  Rc1: "While fine, this course recommends bishop to a3 — stop Black from castling at all costs.",
  Bb2: "While fine, bishop to a3 is the point — block Black's kingside escape.",
};

const TWO_KNIGHTS_D4_HINTS = {
  Ng5: "While fine, this course recommends pawn to d4 — strike in the center instead of the Fried Liver with Ng5.",
  Nc3: "While fine, pawn to d4 takes the center immediately against the Two Knights.",
  d3: "While fine, be aggressive — pawn to d4 opens the position on your terms.",
};

const TWO_KNIGHTS_NG5_HINTS = {
  d4: "While fine, this line plays knight to g5 — the Fried Liver / Two Knights attacking setup.",
};

const PHILIDOR_D4_HINTS = {
  Bc4: "While fine, this course recommends pawn to d4 — open the center against the passive Philidor.",
  c3: "While fine, strike with pawn to d4 when Black plays ...d6.",
};

const PHILIDOR_NF3_HINTS = {
  d4: "While fine, develop knight to f3 first, then open with d4 next move.",
};

function prefixMatch(moves, index, expected) {
  if (index !== expected.length) return false;
  for (let i = 0; i < expected.length; i++) {
    if (moves[i] !== expected[i]) return false;
  }
  return true;
}

function atMove(moves, san) {
  const out = [];
  for (let i = 0; i < moves.length; i += 2) {
    if (moves[i] === san) out.push(i);
  }
  return out;
}

function setHints(hints, index, map) {
  if (index == null || index < 0) return;
  hints[index] = { ...(hints[index] || {}), ...map };
}

/** @param {string[]} moves */
export function buildItalianWrongMoveHints(moves) {
  const hints = moves.map(() => undefined);

  // 3. Bc4 after 1.e4 e5 2.Nf3 Nc6
  for (const i of atMove(moves, "Bc4")) {
    if (prefixMatch(moves, i, ["e4", "e5", "Nf3", "Nc6"])) {
      setHints(hints, i, BC4_HINTS);
    }
  }

  // 4. c3 in Giuoco Piano (...Bc5)
  for (const i of atMove(moves, "c3")) {
    if (prefixMatch(moves, i, ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"])) {
      setHints(hints, i, C3_GIUOCO_HINTS);
    }
    if (prefixMatch(moves, i, ["e4", "e5", "Nf3", "Nc6", "Bc4", "Be7"])) {
      setHints(hints, i, C3_GIUOCO_HINTS);
    }
    if (prefixMatch(moves, i, ["e4", "e5", "Nf3", "Nc6", "Bc4", "Qe7"])) {
      setHints(hints, i, C3_GIUOCO_HINTS);
    }
  }

  // d4 — Giuoco center attack
  for (const i of atMove(moves, "d4")) {
    if (prefixMatch(moves, i, ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6"])) {
      setHints(hints, i, D4_GIUOCO_HINTS);
    }
    if (prefixMatch(moves, i, ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "d6"])) {
      setHints(hints, i, D4_GIUOCO_HINTS);
    }
    // Two Knights 4.d4
    if (prefixMatch(moves, i, ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"])) {
      setHints(hints, i, TWO_KNIGHTS_D4_HINTS);
    }
    // Philidor 3.d4
    if (prefixMatch(moves, i, ["e4", "e5", "Nf3", "d6"])) {
      setHints(hints, i, PHILIDOR_D4_HINTS);
    }
  }

  // Quiet d3 lines
  for (const i of atMove(moves, "d3")) {
    if (moves.includes("Bc5") || moves.includes("Nf6")) {
      setHints(hints, i, D3_QUIET_HINTS);
    }
  }

  // 7. Nc3 after ...Bb4+
  for (const i of atMove(moves, "Nc3")) {
    if (
      prefixMatch(moves, i, [
        "e4",
        "e5",
        "Nf3",
        "Nc6",
        "Bc4",
        "Bc5",
        "c3",
        "Nf6",
        "d4",
        "exd4",
        "cxd4",
        "Bb4+",
      ])
    ) {
      setHints(hints, i, NC3_AFTER_BB4_HINTS);
    }
  }

  // 8. O-O Greco gambit
  for (const i of atMove(moves, "O-O")) {
    if (
      prefixMatch(moves, i, [
        "e4",
        "e5",
        "Nf3",
        "Nc6",
        "Bc4",
        "Bc5",
        "c3",
        "Nf6",
        "d4",
        "exd4",
        "cxd4",
        "Bb4+",
        "Nc3",
        "Nxe4",
      ])
    ) {
      setHints(hints, i, CASTLE_GRECO_HINTS);
    }
  }

  // 10. Ba3 rook gambit
  for (const i of atMove(moves, "Ba3")) {
    if (
      prefixMatch(moves, i, [
        "e4",
        "e5",
        "Nf3",
        "Nc6",
        "Bc4",
        "Bc5",
        "c3",
        "Nf6",
        "d4",
        "exd4",
        "cxd4",
        "Bb4+",
        "Nc3",
        "Nxe4",
        "O-O",
        "Nxc3",
        "bxc3",
        "Bxc3",
      ])
    ) {
      setHints(hints, i, BA3_HINTS);
    }
  }

  // Line 20: Ng5 vs d4
  for (const i of atMove(moves, "Ng5")) {
    if (prefixMatch(moves, i, ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"])) {
      setHints(hints, i, TWO_KNIGHTS_NG5_HINTS);
    }
  }

  // Philidor: Nf3 before d4
  for (const i of atMove(moves, "Nf3")) {
    if (prefixMatch(moves, i, ["e4", "e5"])) {
      const d6Next = moves[3] === "d6";
      const d4Soon = moves.includes("d4") && moves.indexOf("d4") === 4;
      if (d6Next && d4Soon) {
        setHints(hints, i, PHILIDOR_NF3_HINTS);
      }
    }
  }

  return hints;
}
