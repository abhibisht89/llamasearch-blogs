import { loadOpenings, allLessons } from "./opening-data.js";
import { progress } from "./progress.js";
import {
  drillLessonHref,
  isDrillEnabled,
  loadRepertoireCatalog,
  studyLessonHref,
} from "./repertoire-config.js";

const params = new URLSearchParams(location.search);
const courseKey = params.get("key");

function renderLineCard(lesson, collectionKey) {
  const studyHref = studyLessonHref(collectionKey, lesson.id);
  const drillHref = drillLessonHref(collectionKey, lesson.id);
  const drillOn = isDrillEnabled(collectionKey);
  const studied = progress.isSolved(collectionKey, lesson.id);
  const attempted =
    progress.isAttempted(collectionKey, lesson.id) && !studied;
  const cls = studied ? "studied" : attempted ? "attempted" : "";
  const check = studied ? " ✓" : "";

  const actions = drillOn
    ? `<div class="line-card-actions">
        <a class="btn btn-primary" href="${studyHref}">Study</a>
        <a class="btn btn-ghost" href="${drillHref}">Drill</a>
      </div>`
    : `<a class="btn btn-primary btn-block" href="${studyHref}">Study</a>`;

  return `
    <article class="london-line-card ${cls}">
      <div class="london-line-num">Line #${lesson.id}${check}</div>
      <h2 class="london-line-title">${lesson.title}</h2>
      ${actions}
    </article>
  `;
}

async function main() {
  if (!courseKey) {
    document.body.innerHTML = `<p style="padding:24px">Missing course key. <a href="repertoire.html">Back to Line Kitchen</a></p>`;
    return;
  }

  const catalog = await loadRepertoireCatalog();
  const courseMeta = catalog.courses.find((c) => c.collectionKey === courseKey);
  const data = await loadOpenings(courseKey);
  const lessons = allLessons(data);
  const collectionId = data.collectionId;

  const colorLabel = (courseMeta?.color || data.meta?.color) === "black" ? "Black" : "White";
  document.getElementById("course-tag").textContent = colorLabel;
  document.getElementById("course-title").textContent = data.title;
  document.getElementById("course-description").textContent =
    courseMeta?.description || data.description || "";
  document.getElementById("breadcrumb-title").textContent = data.title;
  document.title = `${data.title} — Line Kitchen`;

  document.getElementById("line-grid").innerHTML = lessons
    .map((lesson) => renderLineCard(lesson, collectionId))
    .join("");

  document.getElementById("reset-btn")?.addEventListener("click", () => {
    if (confirm(`Reset all ${data.title} progress?`)) {
      progress.resetSection(collectionId);
      location.reload();
    }
  });
}

main().catch((err) => {
  console.error(err);
  document.getElementById("line-grid").innerHTML = `
    <p style="color:var(--error)">Could not load course "${courseKey}".</p>
  `;
});
