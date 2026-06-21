import { loadOpenings, loadTocV4, lessonsByTopicId } from "./opening-data.js";
import { progress } from "./progress.js";

const COLLECTION = "v4";
const COLLECTION_ID = "watson_v4";

function statusBadge(lesson) {
  if (lesson.status === "coming_soon") {
    return '<span class="topic-badge soon">coming soon</span>';
  }
  if (progress.isSolved(COLLECTION_ID, lesson.id)) {
    return '<span class="topic-badge live">✓ studied</span>';
  }
  return "";
}

function renderTopicLink(lesson) {
  if (!lesson) {
    return `<li class="toc-topic missing"><span class="topic-title">—</span></li>`;
  }
  const href =
    lesson.status === "coming_soon"
      ? "#"
      : `opening-study.html?collection=v4&lesson=${lesson.id}`;
  const cls =
    lesson.status === "coming_soon"
      ? "toc-topic soon"
      : progress.isSolved(COLLECTION_ID, lesson.id)
        ? "toc-topic studied"
        : progress.isAttempted(COLLECTION_ID, lesson.id)
          ? "toc-topic attempted"
          : "toc-topic";
  const check = progress.isSolved(COLLECTION_ID, lesson.id) ? " ✓" : "";
  return `
    <li class="${cls}">
      <a href="${href}" ${lesson.status === "coming_soon" ? 'aria-disabled="true"' : ""}>
        <span class="topic-title">${lesson.title}${check}</span>
        <span class="topic-page">p. ${lesson.bookPage}</span>
        ${statusBadge(lesson)}
      </a>
    </li>
  `;
}

function renderChapter(chapter, topicMap) {
  const topics = chapter.topics
    .map((item) => renderTopicLink(topicMap.get(item.id)))
    .join("");
  const chLabel = chapter.number ? `Ch. ${chapter.number}` : "";
  return `
    <section class="toc-chapter">
      <h3 class="toc-chapter-title">
        ${chLabel ? `<span class="ch-num">${chLabel}</span>` : ""}
        ${chapter.title}
        <span class="toc-chapter-page">p. ${chapter.bookPage}</span>
      </h3>
      <ul class="toc-topics">${topics}</ul>
    </section>
  `;
}

function renderPart(part, topicMap) {
  const chapters = part.chapters.map((chapter) => renderChapter(chapter, topicMap)).join("");
  const title = part.title ? `<h2 class="toc-part-title">${part.title}</h2>` : "";
  return `
    <div class="toc-part">
      ${title}
      ${chapters}
    </div>
  `;
}

async function main() {
  const [data, toc] = await Promise.all([loadOpenings(COLLECTION), loadTocV4()]);
  const topicMap = lessonsByTopicId(data);
  const lessons = data.lessons;

  document.getElementById("toc-tree").innerHTML = toc.parts
    .map((part) => renderPart(part, topicMap))
    .join("");

  const live = lessons.filter((lesson) => lesson.status === "live").length;
  document.getElementById("chapter-count").textContent =
    `${lessons.length} topics · ${toc.parts.length} parts · ${live} live`;

  const studied = progress.countSolved(
    COLLECTION_ID,
    lessons.filter((lesson) => lesson.status === "live").map((lesson) => lesson.id)
  );
  const attempted = lessons.filter(
    (lesson) =>
      lesson.status === "live" &&
      progress.isAttempted(COLLECTION_ID, lesson.id) &&
      !progress.isSolved(COLLECTION_ID, lesson.id)
  ).length;
  document.getElementById("study-stats").textContent =
    attempted > 0
      ? `${studied} / ${live} studied · ${attempted} opened`
      : `${studied} / ${live} studied`;

  document.getElementById("reset-btn")?.addEventListener("click", () => {
    if (confirm("Reset all Watson Vol. 4 progress?")) {
      progress.resetSection(COLLECTION_ID);
      location.reload();
    }
  });
}

main().catch((err) => {
  console.error(err);
  document.getElementById("toc-tree").innerHTML = `
    <p style="color:var(--error)">Could not load Watson Vol. 4 course.</p>
  `;
});
