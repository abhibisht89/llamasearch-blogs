/**
 * London System — 28 repertoire lines (casual commentary).
 * Move sequences and notes are original LlamaChess content.
 */

function line(num, topicId, title, subtitle, intro, moves, comments, tags = []) {
  return {
    lineNumber: num,
    topicId,
    title,
    subtitle,
    intro,
    moves,
    comments,
    tags: ["London System", ...tags],
    orientation: "white",
  };
}

export const LONDON_LINES = [
  line(
    1,
    "london_g7_heist",
    "G7 Heist — Punishing ...Bd6",
    "Line #1 · vs ...e6 ...Bd6",
    "Let's learn the London system! Before we get started, I have to warn you: this opening is basically the same five boring moves over and over and nobody will be your friend. If you're ok with that, then let's get started with pawn to d4.",
    ["d4", "d5", "Bf4", "e6", "e3", "Bd6", "Qg4", "Bxf4", "Qxg7", "Qf6", "Qxf6", "Nxf6", "exf4"],
    [
      "Let's get started with pawn to d4.",
      "Black plays d5 — the most common response. Let's continue with the London!",
      "Second move of the London is bishop to f4.",
      "Solid ...e6 from Black. We'll continue with our regular London setup: pawn to e3.",
      "The classic London pyramid begins. Black tries ...Bd6 to trade dark-squared bishops.",
      "Black has abandoned the guard of the g7 pawn — let's play queen to g4 to attack it.",
      "Black has BLUNDERED! And this was their most common move too!! Before we recapture the bishop, we can take a free pawn with queen to g7.",
      "Snatch the pawn on g7!",
      "Black tries ...Qf6. Before we take back the bishop, let's trade queens — queen takes queen on f6.",
      "Queens off the board.",
      "Black recaptures with the knight.",
      "NOW we can finally take back the bishop — pawn to f4. A free pawn is a free pawn!",
    ],
    ["G7 Heist", "Tactics"]
  ),

  line(
    2,
    "london_f_pawn_folly",
    "F-Pawn Folly — Crushing ...e5",
    "Line #2 · vs ...f6 ...e5",
    "Some opponents try ...f6 to blunt your bishop on f4. Don't panic — they often follow up with ...e5 and walk into a miniature attack.",
    ["d4", "d5", "Bf4", "f6", "e3", "e5", "dxe5", "fxe5", "Qh5+", "g6", "Qxe5+"],
    [
      "Claim the center with d4.",
      "Black mirrors with d5.",
      "Bishop out to f4 — the London way.",
      "...f6 is passive but common at club level.",
      "Regular London stuff: pawn to e3.",
      "Black just gave us a free pawn! This has happened in over a million games. Take on e5.",
      "Black recaptures with the f-pawn.",
      "Instead of bishop taking back — we have an even better move! Queen to h5 check.",
      "Black blocks with ...g6.",
      "Now queen takes pawn on e5 with check. Black just lost the game in like five moves.",
    ],
    ["F-Pawn Folly", "Attack"]
  ),

  line(
    3,
    "london_rook_lure",
    "Rook Lure — vs Symmetrical ...Bf5",
    "Line #3 · vs ...Bf5",
    "When Black mirrors your bishop to f5, break out of autopilot London — strike in the center with c4.",
    ["d4", "d5", "Bf4", "Bf5", "c4", "dxc4", "e3", "b5", "Qf3", "c6", "Bxb8", "Rxb8", "Qxf5"],
    [
      "Start with d4.",
      "Black plays d5.",
      "Bishop to f4.",
      "Black goes for the symmetrical ...Bf5. Time to break the mirror — pawn to c4.",
      "Black takes on c4.",
      "It looks like we gave away a pawn, but e3 opens the diagonal for our light-squared bishop.",
      "Black tries ...b5 to hold the extra pawn.",
      "Huge blunder! Queen to f3 hits the rook on a8.",
      "Black blocks with ...c6.",
      "Even better: bishop takes knight on b8, discovering an attack on the f5 bishop.",
      "Black recaptures with the rook.",
      "Free bishop! Queen takes on f5. A pawn for a bishop — that's a good trade.",
    ],
    ["Rook Lure", "Symmetrical"]
  ),

  line(
    4,
    "london_c7_sting",
    "C7 Sting — Nc3 vs ...c5",
    "Line #4 · vs ...Nf6 ...c5 ...Nc6",
    "When Black plays ...c5 early, knight to c3 sets up a nasty Nb5 fork trap that catches half your opponents.",
    ["d4", "d5", "Bf4", "Nf6", "e3", "c5", "Nc3", "Nc6", "Nb5", "e5", "Bxe5", "Nxe5", "dxe5", "Ne4", "Qxd5", "Qxd5", "Nc7+", "Kd8", "Nxd5", "Be6", "c4"],
    [
      "Open with d4.",
      "Classical ...d5.",
      "Bf4 — the London signature.",
      "Black develops ...Nf6.",
      "The next normal London move is pawn to e3.",
      "Black goes for the ...c5 break. Break away from the usual setup — knight to c3.",
      "Black's most common move is actually a BLUNDER. We hop the knight to b5, threatening a fork on c7.",
      "Black pushes ...e5 to challenge the center.",
      "Take with the bishop on e5.",
      "Knight recaptures.",
      "Pawn takes knight — our e5 pawn is powerful.",
      "Black jumps ...Ne4.",
      "Incredible sequence: queen SACRIFICE on d5!",
      "Black has to take the queen.",
      "Knight to c7+, forking king and queen!",
      "King sidesteps to d8.",
      "Win the queen back — knight takes on d5.",
      "Black develops ...Be6.",
      "Lock Black in with c4. We are crushing — just don't castle queenside because ...Ne4 eyes f2.",
    ],
    ["C7 Sting", "Trap"]
  ),

  line(
    5,
    "london_queen_ransom",
    "Queen Ransom — vs ...c5 ...Nc6",
    "Line #5 · Jobava-style Nb5",
    "Black plays ...c5 before ...Nf6? This line transposes into Jobava London territory — a personal favorite.",
    ["d4", "d5", "Bf4", "c5", "e3", "Nc6", "Nc3", "Nf6", "Nb5", "Qa5+", "c3", "e5", "Bxe5", "Nxe5", "dxe5", "Nd7", "Qxd5"],
    [
      "d4 kicks things off.",
      "Black plays d5.",
      "Bf4, as always.",
      "An early ...c5 from Black.",
      "Don't grab the pawn — keep the center with e3.",
      "Black develops the knight to c6.",
      "Trap time: knight to c3, aiming for b5 and the c7 fork.",
      "Black develops ...Nf6.",
      "OUR OPPONENT FELL FOR THE TRAP! Knight to b5 immediately.",
      "Black checks on a5.",
      "Block with c3 — the c7 fork threat lives.",
      "Black pushes ...e5.",
      "Win a pawn: bishop takes on e5.",
      "Knight recaptures.",
      "Pawn takes knight.",
      "Black's knight retreats to d7.",
      "Queen to d5 wins another pawn with a huge lead in development.",
    ],
    ["Queen Ransom", "Jobava"]
  ),

  line(
    6,
    "london_main_pyramid",
    "Main Line Pyramid",
    "Line #6 · Classical ...Nf6 ...e6",
    "The canonical London: build the c3-d4-e3 pyramid, develop knights to f3 and d2, and enjoy a rock-solid game.",
    ["d4", "d5", "Bf4", "Nf6", "e3", "e6", "Nf3", "c5", "Nbd2", "Nc6", "c3"],
    [
      "Start with d4.",
      "Black mirrors d5.",
      "Bf4 before e3 — the accelerated London.",
      "Black develops ...Nf6.",
      "Lock the bishop outside the pawn chain with e3.",
      "Solid ...e6 from Black.",
      "Knight to f3 — natural development.",
      "Black strikes with ...c5.",
      "Knight to d2 supports the center without blocking the c-pawn.",
      "Black develops ...Nc6.",
      "Complete the famous pyramid with c3. The center is locked and your setup is complete.",
    ],
    ["Main Line"]
  ),

  line(
    7,
    "london_vs_kid_g6",
    "King's Indian Setup — vs ...g6",
    "Line #7 · vs 1...Nf6 ...g6",
    "When Black fianchettos, the London still works — same structure, just watch the ...c5 and ...Qb6 breaks.",
    ["d4", "Nf6", "Bf4", "g6", "e3", "Bg7", "Nf3", "d6", "h3", "O-O", "Nbd2"],
    [
      "d4 against ...Nf6 — universal.",
      "Black prepares a King's Indian with ...g6.",
      "Bf4 anyway — the London doesn't care.",
      "The g7 bishop will stare at your center.",
      "e3 keeps our bishop safe from ...Ng4 tricks.",
      "Black completes the fianchetto.",
      "Nf3 is natural.",
      "Black supports ...e5 ideas with ...d6.",
      "A small prophylaxis move — h3 stops ...Ng4.",
      "Black castles.",
      "Nbd2 finishes development. Same London plans apply.",
    ],
    ["King's Indian"]
  ),

  line(
    8,
    "london_early_c5_nf6",
    "Early ...c5 vs 1...Nf6",
    "Line #8 · Flank break",
    "Black tries ...c5 before settling on d5. Meet it calmly — e3 and c3 keep your structure intact.",
    ["d4", "Nf6", "Bf4", "c5", "e3", "d5", "c3"],
    [
      "Universal d4.",
      "Black develops ...Nf6.",
      "London bishop to f4.",
      "Immediate ...c5 — Black wants counterplay.",
      "Don't panic — e3 solidifies the center.",
      "Black supports with ...d5.",
      "c3 keeps the d4 pawn safe and completes the pyramid.",
    ],
    ["...c5"]
  ),

  line(
    9,
    "london_vs_dutch_f5",
    "Dutch Defense — vs 1...f5",
    "Line #9 · vs ...f5",
    "Someone plays the Dutch? Fine — develop normally and let them weaken their own kingside.",
    ["d4", "f5", "Bf4", "Nf6", "e3", "g6", "Nf3", "Bg7", "Nbd2"],
    [
      "d4 meets the Dutch ...f5.",
      "Black weakens the kingside early.",
      "Bf4 targets c7 and keeps development smooth.",
      "Black develops ...Nf6.",
      "e3 — standard London.",
      "Black fianchettos with ...g6.",
      "Nf3 develops with tempo on the center.",
      "The g7 bishop appears.",
      "Nbd2 — same London recipe against everything.",
    ],
    ["Dutch"]
  ),

  line(
    10,
    "london_qb6_counter",
    "Queenside Counter — vs ...Qb6",
    "Line #10 · Poisoning ...Qb6",
    "Black's ...Qb6 targets the b2 pawn your f4 bishop no longer defends. Meet it with Qb3 and c5.",
    ["d4", "d5", "Bf4", "c6", "e3", "Bf5", "c4", "e6", "Qb3", "Qb6", "c5", "Qxb3", "axb3"],
    [
      "d4 opens the game.",
      "Black plays d5.",
      "Bf4 — London style.",
      "Black prepares ...Qb6 with ...c6.",
      "e3 keeps things solid.",
      "Black develops the bishop to f5.",
      "Strike in the center with c4!",
      "Black supports with ...e6.",
      "Queen to b3 — offer a trade on your terms.",
      "Black takes the bait with ...Qb6.",
      "Push c5 — gain space.",
      "Black captures on b3.",
      "Recapture with the a-pawn. You have queenside space and an open a-file.",
    ],
    ["...Qb6"]
  ),

  line(
    11,
    "london_vs_c6",
    "Solid ...c6 Setup",
    "Line #11 · Slav-style ...c6",
    "Black plays ...c6 to support d5 without blocking the c8 bishop. Develop smoothly and keep the pressure.",
    ["d4", "d5", "Bf4", "c6", "e3", "Bf5", "Nd2", "e6", "Ngf3"],
    [
      "d4.",
      "d5.",
      "Bf4.",
      "Slav-style ...c6.",
      "e3 — London pyramid starts.",
      "Black mirrors with ...Bf5.",
      "Nd2 avoids blocking the e-pawn and eyes e4.",
      "Black plays ...e6.",
      "Ngf3 completes development.",
    ],
    ["...c6"]
  ),

  line(
    12,
    "london_d5_c5_early",
    "Early ...c5 vs 1...d5",
    "Line #12 · Immediate ...c5",
    "Black skips ...Nf6 and hits c5 immediately. Stay calm — c3 and Nf3 hold everything.",
    ["d4", "d5", "Bf4", "c5", "e3", "Nc6", "c3"],
    [
      "d4.",
      "d5.",
      "Bf4.",
      "Black strikes with ...c5 right away.",
      "e3 supports d4.",
      "Black develops ...Nc6.",
      "c3 locks the center — classic London.",
    ],
    ["...c5"]
  ),

  line(
    13,
    "london_bd6_g6",
    "Safe ...Bd6 — vs ...g6",
    "Line #13 · Declining the G7 trap",
    "Smart opponents play ...g6 instead of taking on f4. Keep the queen active with Qg3.",
    ["d4", "d5", "Bf4", "e6", "e3", "Bd6", "Qg4", "g6", "Qg3"],
    [
      "d4.",
      "d5.",
      "Bf4.",
      "e6.",
      "e3.",
      "Bd6 again — but this time Black knows the trick.",
      "Qg4 still asks questions.",
      "Black blocks with ...g6.",
      "Retreat the queen to g3 — keep pressure on g6 and e5.",
    ],
    ["...Bd6"]
  ),

  line(
    14,
    "london_symmetrical_qb3",
    "Symmetrical — ...Bf5 ...c6",
    "Line #14 · Qb3 vs ...c6",
    "When Black answers c4 with ...c6 instead of taking, hit b7 with Qb3.",
    ["d4", "d5", "Bf4", "Bf5", "c4", "c6", "Qb3"],
    [
      "d4.",
      "d5.",
      "Bf4.",
      "Symmetrical ...Bf5.",
      "Break with c4.",
      "Black supports with ...c6.",
      "Queen to b3 hits b7 — the square the bishop left behind.",
    ],
    ["Symmetrical"]
  ),

  line(
    15,
    "london_kid_qb6",
    "KID ...Qb6 Break",
    "Line #15 · vs ...g6 ...c5 ...Qb6",
    "King's Indian players love ...c5 and ...Qb6. Qb3 and c3 hold the queenside.",
    ["d4", "Nf6", "Bf4", "g6", "e3", "Bg7", "Nf3", "c5", "c3", "Qb6", "Qb3"],
    [
      "d4.",
      "Nf6.",
      "Bf4.",
      "g6 — KID on the way.",
      "e3.",
      "Bg7.",
      "Nf3.",
      "Black breaks with ...c5.",
      "c3 supports d4.",
      "Black hits b2 with ...Qb6.",
      "Qb3 defends b2 and offers a trade.",
    ],
    ["King's Indian", "...Qb6"]
  ),

  line(
    16,
    "london_nc6_no_c5",
    "vs ...Nc6 (no ...c5)",
    "Line #16 · Early ...Nc6",
    "Black develops the knight to c6 before ...c5. Continue normal London development.",
    ["d4", "d5", "Bf4", "Nc6", "e3", "Nf6", "Nf3"],
    [
      "d4.",
      "d5.",
      "Bf4.",
      "Black develops ...Nc6 early.",
      "e3.",
      "Nf6.",
      "Nf3 — simple and strong.",
    ],
    ["...Nc6"]
  ),

  line(
    17,
    "london_e6_c5_early",
    "Early ...c5 vs ...e6",
    "Line #17 · ...e6 ...c5",
    "When Black plays ...c5 before ...Nf6 in a ...d5 ...e6 setup, Nbd2 is the modern answer.",
    ["d4", "d5", "Bf4", "e6", "e3", "c5", "c3", "Nc6", "Nbd2"],
    [
      "d4.",
      "d5.",
      "Bf4.",
      "e6.",
      "e3.",
      "Early ...c5.",
      "c3 supports d4.",
      "Nc6.",
      "Nbd2 — the main-line way to meet ...c5.",
    ],
    ["...c5"]
  ),

  line(
    18,
    "london_vs_h6",
    "Prophylactic ...h6",
    "Line #18 · vs ...h6",
    "Black plays ...h6 to prevent Ng5 ideas. Ignore it and finish development.",
    ["d4", "d5", "Bf4", "h6", "e3", "Nf6", "Nf3"],
    [
      "d4.",
      "d5.",
      "Bf4.",
      "A harmless ...h6.",
      "e3.",
      "Nf6.",
      "Nf3 — develop and castle next.",
    ],
    ["...h6"]
  ),

  line(
    19,
    "london_vs_a6",
    "Queenside ...a6",
    "Line #19 · vs ...a6",
    "Black prepares ...b5 expansion. Keep building your pyramid.",
    ["d4", "d5", "Bf4", "a6", "e3", "Nf6", "Nf3"],
    [
      "d4.",
      "d5.",
      "Bf4.",
      "a6 stops Nb5 tricks.",
      "e3.",
      "Nf6.",
      "Nf3 — same plan regardless.",
    ],
    ["...a6"]
  ),

  line(
    20,
    "london_vs_b6",
    "Queenside ...b6",
    "Line #20 · vs ...b6 ...Bb7",
    "Black fianchettos the queen's bishop. Develop normally — your structure is still better.",
    ["d4", "d5", "Bf4", "b6", "e3", "Bb7", "Nf3"],
    [
      "d4.",
      "d5.",
      "Bf4.",
      "b6 prepares ...Bb7.",
      "e3.",
      "Bb7 eyes your center.",
      "Nf3 — keep developing.",
    ],
    ["...b6"]
  ),

  line(
    21,
    "london_nbd7",
    "vs ...Nbd7",
    "Line #21 · Early ...Nbd7",
    "Black develops the queen's knight early. Standard London continues.",
    ["d4", "d5", "Bf4", "Nf6", "e3", "Nbd7", "Nf3"],
    [
      "d4.",
      "d5.",
      "Bf4.",
      "Nf6.",
      "e3.",
      "Nbd7 — flexible but passive.",
      "Nf3 finishes kingside development.",
    ],
    ["...Nbd7"]
  ),

  line(
    22,
    "london_be7",
    "vs ...Be7",
    "Line #22 · Solid ...Be7",
    "Black develops the bishop to e7 instead of ...Bd6. No tricks needed — just develop.",
    ["d4", "d5", "Bf4", "Nf6", "e3", "e6", "Nf3", "Be7"],
    [
      "d4.",
      "d5.",
      "Bf4.",
      "Nf6.",
      "e3.",
      "Black plays ...e6.",
      "Nf3 develops while Black prepares ...Be7.",
      "Solid ...Be7 behind the pawn chain.",
    ],
    ["...Be7"]
  ),

  line(
    23,
    "london_qd6",
    "Early ...Qd6",
    "Line #23 · vs ...Qd6",
    "Black develops the queen early to ...d6. Keep developing — it's not a real threat.",
    ["d4", "d5", "Bf4", "Qd6", "e3", "Nf6", "Nf3"],
    [
      "d4.",
      "d5.",
      "Bf4.",
      "Qd6 looks active but exposes the queen.",
      "e3.",
      "Nf6.",
      "Nf3 — finish development and castle.",
    ],
    ["...Qd6"]
  ),

  line(
    24,
    "london_poisoned_qb2",
    "Poisoned Pawn — ...Qxb2",
    "Line #24 · Nb5 fork trap",
    "If Black grabs the b2 pawn with ...Qxb2, Nb5 wins it back with interest — fork on c7 is coming.",
    ["d4", "d5", "Bf4", "c5", "e3", "Nc6", "Nc3", "Qb6", "Nb5"],
    [
      "d4.",
      "d5.",
      "Bf4.",
      "c5.",
      "e3.",
      "Nc6.",
      "Nc3 develops with tempo.",
      "Black hits b2 with ...Qb6.",
      "Nb5! Threatening Nc7+ forking king and rook. Black is in trouble.",
    ],
    ["Trap", "...Qb6"]
  ),

  line(
    25,
    "london_vs_benoni_c5",
    "Benoni-style 1...c5",
    "Line #25 · vs 1...c5",
    "Black opens with ...c5 instead of ...d5. Transpose to a solid London with e3.",
    ["d4", "c5", "Bf4", "Nc6", "e3", "d5", "c3"],
    [
      "d4.",
      "Benoni-style ...c5.",
      "Bf4 anyway.",
      "Nc6.",
      "e3 supports the center.",
      "Black plays ...d5.",
      "c3 — pyramid complete.",
    ],
    ["Benoni"]
  ),

  line(
    26,
    "london_old_nf3_order",
    "Classical Order — 2.Nf3",
    "Line #26 · 2.Nf3 Nf6 3.Bf4",
    "The old main line still works: Nf3 before Bf4. Same structure, one tempo slower.",
    ["d4", "d5", "Nf3", "Nf6", "Bf4", "e6", "e3"],
    [
      "d4.",
      "d5.",
      "Classical Nf3 first.",
      "Nf6.",
      "Now Bf4 — the traditional London order.",
      "e6.",
      "e3 completes the setup.",
    ],
    ["Move order"]
  ),

  line(
    27,
    "london_bg4_pin",
    "Bishop Pin — vs ...Bg4",
    "Line #27 · Pin on Nf3",
    "Black pins your knight with ...Bg4. Break it with h3 — simple and effective.",
    ["d4", "d5", "Bf4", "Nf6", "e3", "Bg4", "h3"],
    [
      "d4.",
      "d5.",
      "Bf4.",
      "Nf6.",
      "e3.",
      "Black pins the knight with ...Bg4.",
      "h3 asks the bishop to declare itself.",
    ],
    ["...Bg4"]
  ),

  line(
    28,
    "london_ne4",
    "Knight Jump — vs ...Ne4",
    "Line #28 · Early ...Ne4",
    "Black jumps the knight to e4 early. Kick it with Nd2 and keep your structure.",
    ["d4", "d5", "Bf4", "Nf6", "e3", "Ne4", "Nd2"],
    [
      "d4.",
      "d5.",
      "Bf4.",
      "Nf6.",
      "e3.",
      "Black jumps ...Ne4, attacking your bishop.",
      "Nd2 kicks the knight and develops — perfect London move.",
    ],
    ["...Ne4"]
  ),
];
