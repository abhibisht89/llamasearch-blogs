import { MINIATURE_CHAPTERS, chapterDataUrl, filterPlayableMiniatures } from "./miniatures-config.js";
import { progress } from "./progress.js";

async function loadChapterData(chapter) {
  const [sectionRes, verifiedRes] = await Promise.all([
    fetch(chapterDataUrl(chapter)),
    fetch(`data/sections/${chapter.id}_verified_ids.json`, { cache: "no-store" }),
  ]);
  if (!sectionRes.ok) throw new Error(`Could not load ${chapter.dataFile}`);

  const section = await sectionRes.json();
  if (!verifiedRes.ok) return section;

  const verified = await verifiedRes.json();
  const verifiedIds = new Set(verified.ids || []);

  return filterPlayableMiniatures(section, verifiedIds);
}

function renderChapterCard(chapter, section, solved, total) {
  const pct = total ? Math.round((solved / total) * 100) : 0;
  return `
    <a class="course-card" href="miniature-chapter.html?chapter=${chapter.slug}">
      <span class="course-tag">Live</span>
      <h2>${chapter.title}</h2>
      <p>${section.description}</p>
      <div class="progress-label">${solved} / ${total} solved (${pct}%)</div>
      <div class="progress-bar-wrap">
        <div class="progress-bar" style="width:${pct}%"></div>
      </div>
      <span class="btn btn-primary">Train chapter</span>
    </a>
  `;
}

async function main() {
  const sections = await Promise.all(
    MINIATURE_CHAPTERS.map(async (chapter) => {
      const section = await loadChapterData(chapter);
      const ids = section.puzzles.map((p) => p.id);
      const solved = progress.countSolved(chapter.id, ids);
      return { chapter, section, solved, total: ids.length };
    })
  );

  const totalPuzzles = sections.reduce((sum, s) => sum + s.total, 0);
  const totalSolved = sections.reduce((sum, s) => sum + s.solved, 0);
  const pct = totalPuzzles ? Math.round((totalSolved / totalPuzzles) * 100) : 0;

  document.getElementById("overall-stats").innerHTML = `
    <span><strong>${totalSolved}</strong> / ${totalPuzzles} solved across all chapters</span>
    <span>${pct}% complete</span>
  `;
  document.getElementById("header-progress").style.width = `${pct}%`;

  document.getElementById("chapter-grid").innerHTML = sections
    .map(({ chapter, section, solved, total }) =>
      renderChapterCard(chapter, section, solved, total)
    )
    .join("");
}

main().catch((err) => {
  console.error(err);
  document.getElementById("chapter-grid").innerHTML = `
    <p style="color:var(--error)">Could not load miniature chapters. Check that <code>data/sections/</code> JSON is present.</p>
  `;
});
