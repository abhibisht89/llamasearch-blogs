import { loadData } from "./data.js";
import { progress } from "./progress.js";

async function loadSectionJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load ${path}`);
  return res.json();
}

function renderActiveCard(section, href) {
  const ids = section.puzzles.map((p) => p.id);
  const solved = progress.countSolved(section.id, ids);
  const total = ids.length;
  const pct = total ? Math.round((solved / total) * 100) : 0;

  return `
    <a class="course-card" href="${href}">
      <span class="course-tag">Live</span>
      <h2>${section.title}</h2>
      <p>${section.description}</p>
      <div class="progress-label">${solved} / ${total} solved (${pct}%)</div>
      <div class="progress-bar-wrap">
        <div class="progress-bar" style="width:${pct}%"></div>
      </div>
      <span class="btn btn-primary">Continue training</span>
    </a>
  `;
}

async function miniaturesMeta() {
  const { MINIATURE_CHAPTERS, chapterDataUrl } = await import("./miniatures-config.js");
  const sections = await Promise.all(
    MINIATURE_CHAPTERS.map(async (ch) => {
      const res = await fetch(chapterDataUrl(ch));
      if (!res.ok) return null;
      return res.json();
    })
  );
  const live = sections.filter(Boolean);
  const total = live.reduce((sum, s) => sum + s.puzzles.length, 0);
  const solved = live.reduce((sum, s) => {
    const ids = s.puzzles.map((p) => p.id);
    return sum + progress.countSolved(s.id, ids);
  }, 0);
  return { total, solved };
}

function renderMiniaturesCard(meta) {
  const { total, solved } = meta;
  const pct = total ? Math.round((solved / total) * 100) : 0;
  return `
    <a class="course-card" href="miniatures.html">
      <span class="course-tag">Live</span>
      <h2>Miniature Games</h2>
      <p>600 combinations — find the winning move to the target square, then play the full line (6 chapters)</p>
      <div class="progress-label">${solved} / ${total} solved (${pct}%)</div>
      <div class="progress-bar-wrap">
        <div class="progress-bar" style="width:${pct}%"></div>
      </div>
      <span class="btn btn-primary">Continue training</span>
    </a>
  `;
}

async function main() {
  const data = await loadData();
  const [mateIn2, mateIn3, sisters, endgameDraws, endgameWins, miniatures] = await Promise.all([
    loadSectionJson("data/sections/mate_in_2.json"),
    loadSectionJson("data/sections/mate_in_3.json"),
    loadSectionJson("data/sections/sisters.json"),
    loadSectionJson("data/sections/endgame_draws.json"),
    loadSectionJson("data/sections/endgame_wins.json"),
    miniaturesMeta(),
  ]);
  const grid = document.getElementById("course-grid");
  grid.innerHTML =
    renderActiveCard(data.sections[0], "mate-in-1.html") +
    renderActiveCard(mateIn2, "mate-in-2.html") +
    renderActiveCard(mateIn3, "mate-in-3.html") +
    renderMiniaturesCard(miniatures) +
    renderActiveCard(sisters, "sisters-combinations.html") +
    renderActiveCard(endgameDraws, "endgame-draws.html") +
    renderActiveCard(endgameWins, "endgame-wins.html");
}

main().catch((err) => {
  console.error(err);
  document.getElementById("course-grid").innerHTML = `
    <p style="color:var(--error)">Could not load puzzles. Run a local server from this folder (see README).</p>
  `;
});
