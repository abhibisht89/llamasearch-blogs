import { loadRepertoireCatalog } from "./repertoire-config.js";
import { loadOpenings, allLessons } from "./opening-data.js";
import { progress } from "./progress.js";

/** @type {{ course: object, stats: { live: number, studied: number } }[]} */
let catalogRows = [];

function studiedInCourse(collectionId, lessons) {
  const live = lessons.filter((l) => l.status === "live");
  const studied = progress.countSolved(
    collectionId,
    live.map((l) => l.id)
  );
  return { live: live.length, studied };
}

function renderCourseCard(course, stats) {
  const { live, studied } = stats;
  const pct = live ? Math.round((studied / live) * 100) : 0;
  const tags = (course.tags || [])
    .map((t) => `<span class="rep-course-tag">${t}</span>`)
    .join("");
  const colorLabel = course.color === "black" ? "Black" : "White";

  return `
    <a class="rep-course-card" href="${course.href}" data-color="${course.color}">
      <div class="rep-course-top">
        <span class="rep-course-color">${colorLabel}</span>
        <span class="rep-course-lines">${live} lines</span>
      </div>
      <h2 class="rep-course-title">${course.title}</h2>
      <p class="rep-course-desc">${course.description}</p>
      ${tags ? `<div class="rep-course-tags">${tags}</div>` : ""}
      <div class="rep-course-progress">
        <div class="rep-course-bar" style="width:${pct}%"></div>
      </div>
      <span class="rep-course-meta">${studied} / ${live} studied</span>
    </a>
  `;
}

function getFilterState() {
  const white = document.getElementById("filter-white").checked;
  const black = document.getElementById("filter-black").checked;
  const query = document.getElementById("course-search").value.trim().toLowerCase();
  return { white, black, query };
}

function matchesFilters(row, { white, black, query }) {
  const color = row.course.color === "black" ? "black" : "white";
  if (color === "white" && !white) return false;
  if (color === "black" && !black) return false;

  if (!query) return true;

  const haystack = [
    row.course.title,
    row.course.description,
    ...(row.course.tags || []),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function renderGrid() {
  const state = getFilterState();
  const visible = catalogRows.filter((row) => matchesFilters(row, state));
  const grid = document.getElementById("course-grid");

  if (!visible.length) {
    grid.innerHTML =
      '<p class="rep-empty">No openings match your filters. Try another color or search term.</p>';
    return;
  }

  grid.innerHTML = visible
    .map(({ course, stats }) => renderCourseCard(course, stats))
    .join("");
}

function wireFilters() {
  const toggle = document.getElementById("filter-toggle");
  const panel = document.getElementById("filter-panel");
  const white = document.getElementById("filter-white");
  const black = document.getElementById("filter-black");
  const search = document.getElementById("course-search");

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    panel.hidden = open;
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".rep-filter-wrap")) {
      toggle.setAttribute("aria-expanded", "false");
      panel.hidden = true;
    }
  });

  panel.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  for (const el of [white, black, search]) {
    el.addEventListener("input", renderGrid);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      toggle.setAttribute("aria-expanded", "false");
      panel.hidden = true;
    }
  });
}

async function main() {
  const catalog = await loadRepertoireCatalog();

  document.title = `${catalog.title} — LlamaChess`;
  document.getElementById("hub-title").textContent = catalog.title;
  document.getElementById("hub-tagline").textContent = catalog.tagline;
  document.getElementById("hub-description").textContent = catalog.description;

  const statsList = await Promise.all(
    catalog.courses.map(async (course) => {
      const data = await loadOpenings(course.collectionKey);
      return studiedInCourse(data.collectionId, allLessons(data));
    })
  );

  catalogRows = catalog.courses.map((course, i) => ({
    course,
    stats: statsList[i],
  }));

  let totalLines = 0;
  let totalStudied = 0;
  for (const s of statsList) {
    totalLines += s.live;
    totalStudied += s.studied;
  }

  document.getElementById("hub-stats").textContent =
    `${catalog.courses.length} openings · ${totalLines} lines · ${totalStudied} studied by you`;

  wireFilters();
  renderGrid();
}

main().catch((err) => {
  console.error(err);
  document.getElementById("course-grid").innerHTML = `
    <p style="color:var(--error)">Could not load repertoire catalog.</p>
  `;
});
