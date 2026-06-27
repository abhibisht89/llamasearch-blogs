import { loadData } from "./data.js";
import { loadOpenings, allLessons } from "./opening-data.js";
import { progress } from "./progress.js";
import { COLLECTIONS } from "./config.js";
import { loadRepertoireCatalog } from "./repertoire-config.js";

async function loadSectionJson(path) {
  const res = await fetch(path);
  if (!res.ok) return null;
  return res.json();
}

async function miniaturesCountAndSolved() {
  const { MINIATURE_CHAPTERS, chapterDataUrl } = await import("./miniatures-config.js");
  let total = 0;
  let solved = 0;
  for (const ch of MINIATURE_CHAPTERS) {
    const res = await fetch(chapterDataUrl(ch));
    if (!res.ok) continue;
    const sec = await res.json();
    const ids = sec.puzzles.map((p) => p.id);
    total += ids.length;
    solved += progress.countSolved(ch.id, ids);
  }
  return { total, solved };
}

async function polgarMeta() {
  const data = await loadData();
  const [mateIn2, mateIn3, sisters, endgameDraws, endgameWins, miniatures] = await Promise.all([
    loadSectionJson("data/sections/mate_in_2.json"),
    loadSectionJson("data/sections/mate_in_3.json"),
    loadSectionJson("data/sections/sisters.json"),
    loadSectionJson("data/sections/endgame_draws.json"),
    loadSectionJson("data/sections/endgame_wins.json"),
    miniaturesCountAndSolved(),
  ]);
  const liveSections = [data.sections[0], mateIn2, mateIn3, sisters, endgameDraws, endgameWins].filter(Boolean);
  const totalPuzzles =
    liveSections.reduce((sum, s) => sum + s.puzzles.length, 0) + miniatures.total;
  const solved =
    liveSections.reduce((sum, s) => {
      const ids = s.puzzles.map((p) => p.id);
      return sum + progress.countSolved(s.id, ids);
    }, 0) + miniatures.solved;
  return `${totalPuzzles} puzzles live · ${solved} solved by you`;
}

async function watsonV1Meta() {
  const data = await loadOpenings("v1");
  const lessons = allLessons(data);
  const live = lessons.filter((l) => l.status !== "coming_soon");
  const studied = progress.countSolved(
    data.collectionId,
    live.map((l) => l.id)
  );
  return `${live.length} live · ${lessons.length} topics · ${studied} studied by you`;
}

async function watsonV2Meta() {
  const data = await loadOpenings("v2");
  const lessons = allLessons(data);
  const live = lessons.filter((l) => l.status === "live");
  const studied = progress.countSolved(
    data.collectionId,
    live.map((l) => l.id)
  );
  return `${lessons.length} topics · ${live.length} live · ${studied} studied by you`;
}

async function watsonV3Meta() {
  const data = await loadOpenings("v3");
  const lessons = allLessons(data);
  const live = lessons.filter((l) => l.status === "live");
  const studied = progress.countSolved(
    data.collectionId,
    live.map((l) => l.id)
  );
  return `${lessons.length} topics · ${live.length} live · ${studied} studied by you`;
}

async function watsonV4Meta() {
  const data = await loadOpenings("v4");
  const lessons = allLessons(data);
  const live = lessons.filter((l) => l.status === "live");
  const studied = progress.countSolved(
    data.collectionId,
    live.map((l) => l.id)
  );
  return `${lessons.length} topics · ${live.length} live · ${studied} studied by you`;
}

async function lineKitchenMeta() {
  const catalog = await loadRepertoireCatalog();
  const totalLines = catalog.courses.reduce((sum, c) => sum + (c.lineCount || 0), 0);

  const studiedCounts = await Promise.all(
    catalog.courses.map(async (course) => {
      try {
        const data = await loadOpenings(course.collectionKey);
        const lessons = allLessons(data).filter((l) => l.status === "live");
        return progress.countSolved(
          data.collectionId,
          lessons.map((l) => l.id)
        );
      } catch {
        return 0;
      }
    })
  );
  const totalStudied = studiedCounts.reduce((sum, n) => sum + n, 0);

  return `${catalog.courses.length} openings · ${totalLines.toLocaleString()} lines · ${totalStudied} studied by you`;
}

async function lineKitchenDescription(fallback) {
  try {
    const catalog = await loadRepertoireCatalog();
    return `${catalog.tagline} ${catalog.description}`;
  } catch {
    return fallback;
  }
}

async function main() {
  const metaFns = {
    polgar: polgarMeta,
    watson_v1: watsonV1Meta,
    watson_v2: watsonV2Meta,
    watson_v3: watsonV3Meta,
    watson_v4: watsonV4Meta,
    line_kitchen: lineKitchenMeta,
  };

  const cards = await Promise.all(
    COLLECTIONS.map(async (c) => {
      const description =
        c.id === "line_kitchen" ? await lineKitchenDescription(c.description) : c.description;
      const meta = await (metaFns[c.id]?.() ?? Promise.resolve("Coming soon"));
      return `
        <a class="hub-card" href="${c.href}">
          <span class="hub-tag">${c.tag}</span>
          <h2>${c.title}</h2>
          <p>${description}</p>
          <div class="hub-meta">${meta}</div>
        </a>
      `;
    })
  );

  document.getElementById("hub-grid").innerHTML = cards.join("");
}

main().catch((err) => {
  console.error(err);
  document.getElementById("hub-grid").innerHTML = `
    <p style="color:var(--error)">Could not load collections. Run a local server from this folder (see README).</p>
  `;
});
