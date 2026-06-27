import { loadRepertoireCatalog } from "./repertoire-config.js";
import { loadOpenings, allLessons } from "./opening-data.js";
import { progress } from "./progress.js";

/** @type {{ course: object, stats: { live: number, studied: number } }[]} */
let catalogRows = [];
/** @type {{ id: string, title: string, courseIds: string[] }[]} */
let catalogSections = [];
/** @type {{ official: number, potluck: number }} */
let tierCounts = { official: 0, potluck: 0 };
let activeTier = "all";

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
  const colorLabel = course.color === "black" ? "Black" : "White";

  return `
    <article class="rep-course-card" data-color="${course.color}" data-category="${course.category || "official"}">
      <a class="rep-course-link" href="${course.href}">
        <div class="rep-course-top">
          <span class="rep-course-color">${colorLabel}</span>
          <span class="rep-course-lines">${live} lines</span>
        </div>
        <h2 class="rep-course-title">${course.title}</h2>
        <p class="rep-course-desc">${course.description}</p>
        <div class="rep-course-progress">
          <div class="rep-course-bar" style="width:${pct}%"></div>
        </div>
      </a>
    </article>
  `;
}

function getFilterState() {
  const white = document.getElementById("filter-white").checked;
  const black = document.getElementById("filter-black").checked;
  const query = document.getElementById("course-search").value.trim().toLowerCase();
  return { white, black, query, tier: activeTier };
}

function matchesFilters(row, { white, black, query, tier }) {
  const color = row.course.color === "black" ? "black" : "white";
  if (color === "white" && !white) return false;
  if (color === "black" && !black) return false;

  const category = row.course.category || "official";
  if (tier !== "all" && category !== tier) return false;

  if (!query) return true;

  const haystack = [
    row.course.title,
    row.course.description,
    row.course.author || "",
    ...(row.course.tags || []),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function sectionCourseIds(section) {
  return section.courseIds || section.courses || [];
}

function normalizeSections(sections) {
  return sections.map((section) => ({
    ...section,
    courseIds: sectionCourseIds(section),
  }));
}

function sectionDescription(sectionId) {
  switch (sectionId) {
    case "official":
      return `<p class="rep-section-desc">The core menu — ${tierCounts.official} signature opening courses.</p>`;
    case "potluck":
      return `<p class="rep-section-desc">Player-style recipes — ${tierCounts.potluck} potluck lines to pick from.</p>`;
    default:
      return "";
  }
}

function renderGrid() {
  const state = getFilterState();
  const visible = catalogRows.filter((row) => matchesFilters(row, state));
  const root = document.getElementById("course-sections");
  const sections =
    state.tier === "all"
      ? catalogSections
      : catalogSections.filter((section) => section.id === state.tier);

  const byId = new Map(visible.map((row) => [row.course.id, row]));
  const renderedSections = sections
    .map((section) => {
      const rows = sectionCourseIds(section)
        .map((id) => byId.get(id))
        .filter(Boolean);
      if (!rows.length) return "";
      const cards = rows
        .map(({ course, stats }) => renderCourseCard(course, stats))
        .join("");
      return `
        <section class="rep-section" data-section="${section.id}">
          <div class="rep-section-head">
            <h2 class="rep-section-title">${section.title}</h2>
            ${sectionDescription(section.id)}
          </div>
          <div class="rep-course-grid">${cards}</div>
        </section>
      `;
    })
    .filter(Boolean);

  if (!renderedSections.length) {
    root.innerHTML =
      '<p class="rep-empty">No openings match your filters. Try another tier, color, or search term.</p>';
    return;
  }

  root.innerHTML = renderedSections.join("");
}

function wireTierTabs() {
  const tabs = document.querySelectorAll("[data-tier-tab]");
  for (const tab of tabs) {
    tab.addEventListener("click", () => {
      activeTier = tab.dataset.tierTab || "all";
      for (const el of tabs) {
        el.classList.toggle("is-active", el === tab);
        el.setAttribute("aria-pressed", String(el === tab));
      }
      renderGrid();
    });
  }
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
  catalogSections = catalog.sections?.length
    ? normalizeSections(catalog.sections)
    : [{ id: "all", title: "All Courses", courseIds: catalog.courses.map((c) => c.id) }];

  tierCounts = {
    official: catalog.courses.filter((c) => c.category === "official").length,
    potluck: catalog.courses.filter((c) => c.category === "potluck").length,
  };

  document.title = `${catalog.title} — LlamaChess`;
  document.getElementById("hub-title").textContent = catalog.title;
  document.getElementById("hub-tagline").textContent = catalog.tagline;
  document.getElementById("hub-description").textContent = catalog.description;

  const tabOfficial = document.getElementById("tier-official-count");
  const tabPotluck = document.getElementById("tier-potluck-count");
  if (tabOfficial) tabOfficial.textContent = String(tierCounts.official);
  if (tabPotluck) tabPotluck.textContent = String(tierCounts.potluck);

  const statsList = await Promise.all(
    catalog.courses.map(async (course) => {
      try {
        const data = await loadOpenings(course.collectionKey);
        return studiedInCourse(data.collectionId, allLessons(data));
      } catch (err) {
        console.warn(`Could not load stats for ${course.collectionKey}`, err);
        return { live: course.lineCount || 0, studied: 0 };
      }
    })
  );

  catalogRows = catalog.courses.map((course, i) => ({
    course,
    stats: statsList[i],
  }));

  let totalLines = 0;
  for (const s of statsList) {
    totalLines += s.live;
  }

  document.getElementById("hub-stats").textContent =
    `${catalog.courses.length} openings · ${totalLines} lines`;

  wireTierTabs();
  wireFilters();
  renderGrid();
}

main().catch((err) => {
  console.error(err);
  document.getElementById("course-sections").innerHTML = `
    <p style="color:var(--error)">Could not load repertoire catalog.</p>
  `;
});
