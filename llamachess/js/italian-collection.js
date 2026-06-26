import { loadOpenings, allLessons } from "./opening-data.js";
import { progress } from "./progress.js";

const COLLECTION = "italian";
const COLLECTION_ID = "italian";

function moveCount(lesson) {
  return lesson.steps.filter((s) => s.type === "move").length;
}

function renderLineCard(lesson) {
  const href = `opening-study.html?collection=italian&lesson=${lesson.id}`;
  const studied = progress.isSolved(COLLECTION_ID, lesson.id);
  const attempted =
    progress.isAttempted(COLLECTION_ID, lesson.id) && !studied;
  const cls = studied ? "studied" : attempted ? "attempted" : "";
  const check = studied ? " ✓" : "";
  const tags = (lesson.tags || [])
    .filter((t) => t !== "Italian Game")
    .slice(0, 3)
    .map((t) => `<span class="london-tag">${t}</span>`)
    .join("");

  return `
    <a class="london-line-card ${cls}" href="${href}">
      <div class="london-line-num">Line #${lesson.id}${check}</div>
      <h2 class="london-line-title">${lesson.title}</h2>
      <p class="london-line-sub">${lesson.subtitle || ""}</p>
      <div class="london-line-meta">${moveCount(lesson)} moves</div>
      ${tags ? `<div class="london-tags">${tags}</div>` : ""}
    </a>
  `;
}

async function main() {
  const data = await loadOpenings(COLLECTION);
  const lessons = allLessons(data);

  if (data.description) {
    document.getElementById("course-description").textContent = data.description;
  }

  document.getElementById("line-grid").innerHTML = lessons
    .map((lesson) => renderLineCard(lesson))
    .join("");

  const live = lessons.filter((l) => l.status === "live").length;
  document.getElementById("line-count").textContent = `${live} lines · play as White`;

  const studied = progress.countSolved(
    COLLECTION_ID,
    lessons.filter((l) => l.status === "live").map((l) => l.id)
  );
  const attempted = lessons.filter(
    (l) =>
      l.status === "live" &&
      progress.isAttempted(COLLECTION_ID, l.id) &&
      !progress.isSolved(COLLECTION_ID, l.id)
  ).length;
  document.getElementById("study-stats").textContent =
    attempted > 0
      ? `${studied} / ${live} studied · ${attempted} opened`
      : `${studied} / ${live} studied`;

  document.getElementById("reset-btn")?.addEventListener("click", () => {
    if (confirm("Reset all Italian Game progress?")) {
      progress.resetSection(COLLECTION_ID);
      location.reload();
    }
  });
}

main().catch((err) => {
  console.error(err);
  document.getElementById("line-grid").innerHTML = `
    <p style="color:var(--error)">Could not load Italian Game course.</p>
  `;
});
