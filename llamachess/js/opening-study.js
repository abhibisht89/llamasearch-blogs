import { Chessground } from "@lichess-org/chessground";
import { loadOpenings, getLesson, nextPrevLesson } from "./opening-data.js";
import { progress } from "./progress.js";
import { initBoardThemeSwitcher } from "./board-theme.js";

const params = new URLSearchParams(location.search);
const COLLECTION_META = {
  v1: { backHref: "watson.html", label: "Watson Vol. 1" },
  v2: { backHref: "watson-v2.html", label: "Watson Vol. 2" },
  v3: { backHref: "watson-v3.html", label: "Watson Vol. 3" },
  v4: { backHref: "watson-v4.html", label: "Watson Vol. 4" },
};
const requestedCollection = params.get("collection");
const collectionKey = Object.hasOwn(COLLECTION_META, requestedCollection) ? requestedCollection : "v1";
const lessonId = Number(params.get("lesson") || "1");
const stepParam = params.get("step");
let stepIdx = stepParam != null ? Number(stepParam) : 0;

const collectionBackHref = COLLECTION_META[collectionKey].backHref;
const collectionLabel = COLLECTION_META[collectionKey].label;

const boardEl = document.getElementById("board");
const lessonTitleEl = document.getElementById("lesson-title");
const lessonSubEl = document.getElementById("lesson-sub");
const stepCounterEl = document.getElementById("step-counter");
const moveLineEl = document.getElementById("move-line");
const theoryTitleEl = document.getElementById("theory-title");
const theoryBodyEl = document.getElementById("theory-body");
const alternativesEl = document.getElementById("alternatives");
const implicationsEl = document.getElementById("implications");
const prevStepBtn = document.getElementById("prev-step");
const nextStepBtn = document.getElementById("next-step");
const prevLessonBtn = document.getElementById("prev-lesson");
const nextLessonBtn = document.getElementById("next-lesson");
const markStudiedBtn = document.getElementById("mark-studied");

let data;
let lesson;
let ground;
let lastMove;

function orientColor(side) {
  return side === "white" || side === "w" ? "white" : "black";
}

function updateUrl() {
  const url = new URL(location.href);
  url.searchParams.set("collection", collectionKey);
  url.searchParams.set("lesson", String(lesson.id));
  url.searchParams.set("step", String(stepIdx));
  history.replaceState(null, "", url);
}

function currentStep() {
  return lesson.steps[stepIdx];
}

function renderMoveLine() {
  const parts = [];
  for (let i = 0; i <= stepIdx; i++) {
    const s = lesson.steps[i];
    if (s.type !== "move") continue;
    if (s.turn === "b") parts.push(`${s.moveNumber}. ${s.san}`);
    else parts.push(s.san);
  }
  moveLineEl.textContent = parts.length ? parts.join(" ") : "Starting position";
}

function computeLastMove() {
  const step = currentStep();
  // Chessground expects lastMove as [from, to], not { from, to }.
  if (step.type !== "move" || !step.from || !step.to) return undefined;
  return [step.from, step.to];
}

function renderBoard() {
  const step = currentStep();
  if (!step) return;
  lastMove = computeLastMove();

  ground.set({
    fen: step.fen,
    orientation: orientColor(lesson.orientation),
    turnColor: step.turn ? orientColor(step.turn) : orientColor(lesson.orientation),
    movable: { color: undefined, dests: new Map() },
    draggable: { enabled: false },
    lastMove,
    check: false,
    animation: { enabled: true, duration: 200 },
  });
}

function renderTheory() {
  const step = currentStep();
  theoryTitleEl.textContent = step.title || (step.type === "intro" ? "Introduction" : step.san);
  theoryBodyEl.textContent = step.theory || "Study the position on the board.";

  if (step.alternatives?.length) {
    alternativesEl.hidden = false;
    alternativesEl.innerHTML = `
      <h3>Alternatives</h3>
      <ul>${step.alternatives.map((a) => `<li><strong>${a.san}</strong> — ${a.note}</li>`).join("")}</ul>
    `;
  } else {
    alternativesEl.hidden = true;
    alternativesEl.innerHTML = "";
  }

  if (step.implications) {
    implicationsEl.hidden = false;
    implicationsEl.innerHTML = `<h3>Implications</h3><p>${step.implications}</p>`;
  } else {
    implicationsEl.hidden = true;
    implicationsEl.innerHTML = "";
  }
}

function renderStep() {
  stepIdx = Math.max(0, Math.min(stepIdx, lesson.steps.length - 1));
  const step = currentStep();
  if (!step) return;

  stepCounterEl.textContent = `Step ${stepIdx + 1} of ${lesson.steps.length}`;
  renderMoveLine();
  renderTheory();
  renderBoard();
  updateUrl();

  prevStepBtn.disabled = stepIdx === 0;
  nextStepBtn.disabled = stepIdx >= lesson.steps.length - 1;

  progress.markAttempted(data.collectionId, lesson.id);
}

function lessonHref(id, step = 0) {
  return `opening-study.html?collection=${collectionKey}&lesson=${id}&step=${step}`;
}

function wireNav() {
  const { prev, next } = nextPrevLesson(data, lesson.id);
  prevLessonBtn.href = prev ? lessonHref(prev) : "#";
  nextLessonBtn.href = next ? lessonHref(next) : "#";
  prevLessonBtn.classList.toggle("disabled", !prev);
  nextLessonBtn.classList.toggle("disabled", !next);

  prevStepBtn.addEventListener("click", () => {
    stepIdx--;
    renderStep();
  });

  nextStepBtn.addEventListener("click", () => {
    stepIdx++;
    renderStep();
  });

  markStudiedBtn.addEventListener("click", () => {
    progress.markSolved(data.collectionId, lesson.id);
    markStudiedBtn.textContent = "Studied ✓";
    markStudiedBtn.disabled = true;
  });
}

async function main() {
  data = await loadOpenings(collectionKey);
  lesson = getLesson(data, lessonId);

  if (lesson.status === "coming_soon") {
    document.body.innerHTML = `
      <p style="padding:24px;color:var(--muted)">
        This lesson is coming soon.
        <a href="${collectionBackHref}">Back to ${collectionLabel}</a>
      </p>`;
    return;
  }

  // Clamp step from URL — old bookmarks may exceed lesson length after updates.
  stepIdx = Math.max(0, Math.min(stepIdx, lesson.steps.length - 1));

  lessonTitleEl.textContent = lesson.title;
  lessonSubEl.textContent = lesson.subtitle || lesson.chapterTitle;

  document.title = `${lesson.title} — ${collectionLabel}`;

  const backLink = document.getElementById("collection-back");
  if (backLink) {
    backLink.href = collectionBackHref;
    backLink.textContent = collectionLabel;
  }

  ground = Chessground(boardEl, {
    fen: lesson.steps[0].fen,
    orientation: orientColor(lesson.orientation),
    movable: { color: undefined },
    draggable: { enabled: false },
    highlight: { lastMove: true },
    animation: { enabled: true, duration: 200 },
  });

  initBoardThemeSwitcher();

  if (progress.isSolved(data.collectionId, lesson.id)) {
    markStudiedBtn.textContent = "Studied ✓";
    markStudiedBtn.disabled = true;
  }

  wireNav();
  renderStep();
}

main().catch((err) => {
  console.error(err);
  document.body.innerHTML = `<p style="padding:24px;color:var(--error)">Could not load lesson.</p>`;
});
