/**
 * Opening line drill — play your repertoire moves; opponent replies auto-play.
 * Enabled for all Line Kitchen courses (see isDrillEnabled in repertoire-config.js).
 */
import { Chess } from "chess.js";
import { Chessground } from "@lichess-org/chessground";
import { loadOpenings, getLesson, nextPrevLesson } from "./opening-data.js";
import {
  drillLessonHref,
  isDrillEnabled,
  loadRepertoireCatalog,
  studyLessonHref,
} from "./repertoire-config.js";
import { progress } from "./progress.js";
import { initBoardThemeSwitcher } from "./board-theme.js";
import { decorateHintButton } from "./hint-ui.js";
import { initBoardSettings } from "./board-settings.js";
import { initDrillKeyboardNav } from "./board-keyboard.js";
import {
  normalizeSan,
  opponentTurnPrompt,
  sanToPlain,
  wrongMoveMessage,
} from "./drill-feedback.js";

const params = new URLSearchParams(location.search);
const collectionKey = params.get("collection") || "london";
const lessonId = Number(params.get("lesson") || "1");

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const statusEl = document.getElementById("status-msg");
const boardEl = document.getElementById("board");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const hintBtn = document.getElementById("hint-btn");
const sideToMoveEl = document.getElementById("side-to-move");
const lessonTitleEl = document.getElementById("lesson-title");
const drillProgressEl = document.getElementById("drill-progress");
const hintTitleEl = document.getElementById("hint-title");
const hintBodyEl = document.getElementById("hint-body");
const commentaryTitleEl = document.getElementById("commentary-title");
const commentaryBodyEl = document.getElementById("commentary-body");
const prevLessonBtn = document.getElementById("prev-lesson");
const nextLessonBtn = document.getElementById("next-lesson");
const studyLinkEl = document.getElementById("study-link");
const collectionBackEl = document.getElementById("collection-back");

let data;
let lesson;
let chess;
let ground;
let playerSide = "w";
/** Index of the next move step to play in lesson.steps */
let stepPtr = 0;
let phase = "intro";
let solved = false;
let autoPlaying = false;
let userMovesDone = 0;
let userMovesTotal = 0;
let hintRevealed = false;
let playGen = 0;

function setStatus(text, kind = "idle") {
  if (!statusEl) return;
  const msg = String(text || "").trim();
  if (!msg) {
    statusEl.textContent = "";
    statusEl.hidden = true;
    statusEl.className = "status-msg idle";
    return;
  }
  statusEl.hidden = false;
  statusEl.textContent = msg;
  statusEl.className = `status-msg ${kind}`;
}

function clearStatus() {
  setStatus("");
}

function orientColor(side) {
  return side === "w" || side === "white" ? "white" : "black";
}

function sideLabel(side) {
  return side === "w" ? "White to move" : "Black to move";
}

function showSideToMove(side) {
  if (!sideToMoveEl) return;
  const label = sideLabel(side);
  const cls = side === "w" ? "white" : "black";
  sideToMoveEl.className = `side-to-move ${cls}`;
  sideToMoveEl.innerHTML = `<span class="side-dot" aria-hidden="true"></span>${label}`;
}

function toDests(game) {
  const dests = new Map();
  for (const move of game.moves({ verbose: true })) {
    if (!dests.has(move.from)) dests.set(move.from, []);
    dests.get(move.from).push(move.to);
  }
  return dests;
}

/** Who plays this step: user (repertoire side) or opponent. */
function stepActor(step) {
  if (step.actor === "user" || step.actor === "opponent") {
    return step.actor;
  }
  // step.turn = side to move after this step's move
  const mover = step.turn === "w" ? "b" : "w";
  return mover === playerSide ? "user" : "opponent";
}

function isUserStep(step) {
  return step.type === "move" && stepActor(step) === "user";
}

function isOpponentStep(step) {
  return step.type === "move" && stepActor(step) === "opponent";
}

function fenBeforeStep(index) {
  for (let j = index - 1; j >= 0; j--) {
    if (lesson.steps[j].fen) return lesson.steps[j].fen;
  }
  return START_FEN;
}

function firstMoveIndex() {
  return lesson.steps[0]?.type === "intro" ? 1 : 0;
}

function countUserMoves() {
  return lesson.steps.filter((s) => isUserStep(s)).length;
}

function currentUserStep() {
  const step = lesson.steps[stepPtr];
  return step && isUserStep(step) ? step : null;
}

function updateDrillProgress() {
  drillProgressEl.textContent = `Your moves: ${userMovesDone} / ${userMovesTotal}`;
}

function setHintPanel(title, body) {
  hintTitleEl.textContent = title || "";
  hintBodyEl.textContent = body || "";
}

function setCommentaryPanel(title, body) {
  if (!commentaryTitleEl || !commentaryBodyEl) return;
  commentaryTitleEl.textContent = title || "";
  commentaryBodyEl.textContent = body || "";
}

function showTurnCommentary(side) {
  setCommentaryPanel("", opponentTurnPrompt(side));
}

function showIntroPanel() {
  const intro = lesson.steps[0]?.type === "intro" ? lesson.steps[0] : null;
  setHintPanel(intro?.title || lesson.title, "Press Start line when ready, then play from memory.");
  setCommentaryPanel("", intro?.theory || "");
}

function showUserHint(step, revealed = false) {
  if (!step) {
    setHintPanel("", "");
    return;
  }
  if (revealed) {
    setHintPanel(`Book move: ${sanToPlain(step.san)}`, step.theory || "");
    return;
  }
  setHintPanel(step.title || "Your move", step.theory || "Find the correct move for your repertoire.");
}

function showMoveCommentary(step) {
  if (!step) {
    setCommentaryPanel("", "");
    return;
  }
  setCommentaryPanel(step.san || step.title || "Move", step.theory || "");
}

function updateGround(lastMove) {
  const turn = chess.turn();
  const waitingForUser = phase === "active" && !solved && !autoPlaying && isUserStep(lesson.steps[stepPtr]);
  const canMove = waitingForUser;

  ground.set({
    fen: chess.fen(),
    turnColor: orientColor(turn),
    movable: {
      color: canMove ? orientColor(playerSide) : undefined,
      dests: canMove ? toDests(chess) : new Map(),
      free: false,
      events: { after: onMove },
    },
    lastMove: lastMove ? [lastMove.from, lastMove.to] : undefined,
    check: chess.isCheck() ? orientColor(chess.turn()) : false,
  });
  showSideToMove(turn);
}

function markComplete() {
  solved = true;
  progress.markSolved(data.collectionId, lesson.id);
  clearStatus();
  setHintPanel("", "");
  setCommentaryPanel("Done", "You played the full line correctly.");
  updateGround();
  hintBtn.disabled = true;
}

function finishIfDone() {
  if (stepPtr >= lesson.steps.length) {
    markComplete();
    return true;
  }
  return false;
}

function playOpponentMoves(lastMove) {
  autoPlaying = true;
  hintBtn.disabled = true;
  const gen = ++playGen;

  const playNext = (prevMove) => {
    if (gen !== playGen) return;
    if (finishIfDone()) {
      autoPlaying = false;
      return;
    }

    const step = lesson.steps[stepPtr];
    if (!step || !isOpponentStep(step)) {
      autoPlaying = false;
      hintRevealed = false;
      hintBtn.disabled = false;
      if (step && isUserStep(step)) {
        showUserHint(step, false);
      }
      updateGround(prevMove);
      return;
    }

    showTurnCommentary(chess.turn());
    clearStatus();
    updateGround(prevMove);

    window.setTimeout(() => {
      if (gen !== playGen) return;

      try {
        const reply = chess.move(step.san);
        if (!reply) throw new Error(`Illegal ${step.san}`);
        stepPtr += 1;
        const lm = { from: reply.from, to: reply.to };
        showMoveCommentary(step);
        updateGround(lm);

        window.setTimeout(() => playNext(lm), 380);
      } catch (err) {
        console.error(err);
        autoPlaying = false;
        setStatus("Could not replay opponent move — reset and try again.", "error");
        updateGround(prevMove);
      }
    }, 320);
  };

  window.setTimeout(() => playNext(lastMove), 180);
}

function onMove(orig, dest) {
  if (phase !== "active" || solved || autoPlaying) return;

  const step = currentUserStep();
  if (!step) return;

  progress.markAttempted(data.collectionId, lesson.id);

  const move = chess.move({ from: orig, to: dest, promotion: "q" });
  if (!move) {
    updateGround();
    return;
  }

  const lastMove = { from: orig, to: dest };
  if (normalizeSan(move.san) !== normalizeSan(step.san)) {
    chess.undo();
    hintRevealed = true;
    showUserHint(step, true);
    setCommentaryPanel("", wrongMoveMessage(move.san, step.san, step));
    clearStatus();
    updateGround();
    return;
  }

  userMovesDone += 1;
  updateDrillProgress();
  const playedStep = step;
  stepPtr += 1;
  hintRevealed = false;
  showMoveCommentary(playedStep);

  if (finishIfDone()) {
    updateGround(lastMove);
    return;
  }

  clearStatus();
  updateGround(lastMove);
  playOpponentMoves(lastMove);
}

function startDrill() {
  phase = "active";
  solved = false;
  userMovesDone = 0;
  hintRevealed = false;
  stepPtr = firstMoveIndex();
  startBtn.hidden = true;
  hintBtn.disabled = false;

  chess = new Chess(fenBeforeStep(stepPtr));
  const step = lesson.steps[stepPtr];

  if (step && isOpponentStep(step)) {
    showTurnCommentary(chess.turn());
    clearStatus();
    updateGround();
    playOpponentMoves(undefined);
    return;
  }

  if (step && isUserStep(step)) {
    showUserHint(step, false);
    setCommentaryPanel("", "");
    clearStatus();
    updateGround();
    return;
  }

  finishIfDone();
}

function resetDrill() {
  playGen += 1;
  solved = progress.isSolved(data.collectionId, lesson.id);
  autoPlaying = false;
  userMovesDone = 0;
  hintRevealed = false;
  stepPtr = firstMoveIndex();
  hintBtn.disabled = phase !== "active";

  const hasIntro = lesson.steps[0]?.type === "intro";
  if (hasIntro) {
    phase = "intro";
    chess = new Chess(lesson.steps[0].fen || START_FEN);
    startBtn.hidden = false;
    showIntroPanel();
    clearStatus();
  } else {
    phase = "active";
    startBtn.hidden = true;
    chess = new Chess(fenBeforeStep(stepPtr));
    const step = lesson.steps[stepPtr];
    if (step && isOpponentStep(step)) {
      showTurnCommentary(chess.turn());
      clearStatus();
      updateGround();
      playOpponentMoves(undefined);
      return;
    }
    clearStatus();
    showUserHint(step, false);
    setCommentaryPanel("", "");
  }

  updateDrillProgress();
  updateGround();
}

function revealHint() {
  const step = currentUserStep();
  if (!step || phase !== "active" || solved || autoPlaying) return;
  hintRevealed = true;
  showUserHint(step, true);
  clearStatus();
}

function wireNav() {
  const { prev, next } = nextPrevLesson(data, lesson.id);
  const drillHref = (id) => drillLessonHref(collectionKey, id);
  prevLessonBtn.href = prev ? drillHref(prev) : "#";
  nextLessonBtn.href = next ? drillHref(next) : "#";
  prevLessonBtn.classList.toggle("disabled", !prev);
  nextLessonBtn.classList.toggle("disabled", !next);

  initDrillKeyboardNav(prevLessonBtn, nextLessonBtn);
}

async function resolveCollectionNav() {
  try {
    const catalog = await loadRepertoireCatalog();
    const course = catalog.courses.find((c) => c.collectionKey === collectionKey);
    if (course) return { backHref: course.href, label: course.title };
  } catch {
    /* optional */
  }
  return { backHref: `course.html?key=${collectionKey}`, label: data.title };
}

async function main() {
  decorateHintButton();
  if (!isDrillEnabled(collectionKey)) {
    document.body.innerHTML = `
      <p style="padding:24px;color:var(--muted)">
        Drill mode is not available for this opening yet.
        <a href="opening-study.html?collection=${collectionKey}&lesson=${lessonId}">Use study mode</a>
        or <a href="repertoire.html">return to Line Kitchen</a>.
      </p>`;
    return;
  }

  initBoardThemeSwitcher();

  data = await loadOpenings(collectionKey);
  lesson = getLesson(data, lessonId);

  if (lesson.status === "coming_soon") {
    document.body.innerHTML = `<p style="padding:24px">This line is coming soon. <a href="course.html?key=${collectionKey}">Back</a></p>`;
    return;
  }

  playerSide = lesson.orientation === "black" ? "b" : "w";
  userMovesTotal = countUserMoves();

  const nav = await resolveCollectionNav();
  collectionBackEl.href = nav.backHref;
  collectionBackEl.textContent = nav.label;

  lessonTitleEl.textContent = lesson.title;
  document.title = `Drill: ${lesson.title} — ${nav.label}`;
  studyLinkEl.href = studyLessonHref(collectionKey, lesson.id);

  chess = new Chess(START_FEN);
  ground = Chessground(boardEl, {
    fen: START_FEN,
    orientation: orientColor(playerSide),
    movable: { color: undefined, dests: new Map(), events: { after: onMove } },
    draggable: { enabled: true, showGhost: true },
    premovable: { enabled: false },
    highlight: { lastMove: true, check: true },
    animation: { enabled: true, duration: 200 },
  });

  wireNav();
  initBoardSettings({ getFen: () => chess?.fen?.() || START_FEN, onStatus: setStatus });
  resetDrill();
}

startBtn.addEventListener("click", startDrill);
resetBtn.addEventListener("click", resetDrill);
hintBtn.addEventListener("click", revealHint);

main().catch((err) => {
  console.error(err);
  setStatus("Could not load this line.", "error");
});
