/** Section grid for Sisters Tournament Combinations (128 puzzles, paginated 100+28). */

import { getSection, firstUnsolvedId, sortedPuzzleIds } from "./data-sisters.js";
import { progress, migrateProgressToSequential } from "./progress.js";

const SECTION_ID = "sisters";
const PAGE_SIZE = 100;

let currentFilter = "all";
let currentPage = 1;
let section = null;
let puzzleIds = [];

function readPageFromUrl() {
  const raw = new URLSearchParams(window.location.search).get("page");
  const page = parseInt(raw || "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function updatePageInUrl(page, replace = false) {
  const url = new URL(window.location.href);
  if (page <= 1) url.searchParams.delete("page");
  else url.searchParams.set("page", String(page));
  const method = replace ? "replaceState" : "pushState";
  history[method]({ page }, "", url);
}

function getFilteredIds() {
  return puzzleIds.filter(puzzleVisible);
}

function getPageCount(count) {
  return Math.max(1, Math.ceil(count / PAGE_SIZE));
}

function clampPage(page, pageCount) {
  return Math.min(Math.max(1, page), pageCount);
}

function renderHeader() {
  const ids = puzzleIds;
  const solved = progress.countSolved(SECTION_ID, ids);
  const total = ids.length;
  const pct = total ? Math.round((solved / total) * 100) : 0;

  document.getElementById("section-title").textContent = section.title;
  document.getElementById("section-desc").textContent = section.description;
  document.getElementById("section-stats").innerHTML = `
    <span><strong>${solved}</strong> / ${total} solved</span>
    <span>${pct}% complete</span>
  `;
  document.getElementById("header-progress").style.width = `${pct}%`;

  const nextId = firstUnsolvedId(section, progress);
  const continueBtn = document.getElementById("continue-btn");
  if (nextId) {
    continueBtn.href = `solve-sisters.html?id=${nextId}`;
    continueBtn.textContent = solved ? "Continue" : "Start training";
  }
}

function puzzleVisible(id) {
  if (currentFilter === "all") return true;
  if (currentFilter === "solved") return progress.isSolved(SECTION_ID, id);
  if (currentFilter === "unsolved") return !progress.isSolved(SECTION_ID, id);
  return true;
}

function setPage(page, { replace = false, scroll = true } = {}) {
  const filtered = getFilteredIds();
  const pageCount = getPageCount(filtered.length);
  currentPage = clampPage(page, pageCount);
  updatePageInUrl(currentPage, replace);
  renderGrid();
  renderPagination();
  if (scroll) {
    document.getElementById("puzzle-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderGrid() {
  const grid = document.getElementById("puzzle-grid");
  const filtered = getFilteredIds();
  const pageCount = getPageCount(filtered.length);
  currentPage = clampPage(currentPage, pageCount);

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageIds = filtered.slice(start, start + PAGE_SIZE);

  grid.innerHTML = pageIds
    .map((id) => {
      const solved = progress.isSolved(SECTION_ID, id);
      const attempted = progress.isAttempted(SECTION_ID, id);
      const cls = ["puzzle-card", solved ? "solved" : "", attempted ? "attempted" : ""]
        .filter(Boolean)
        .join(" ");
      return `
        <a class="${cls}" href="solve-sisters.html?id=${id}" title="Puzzle #${id}">
          ${solved ? '<span class="check">✓</span>' : ""}
          ${id}
        </a>
      `;
    })
    .join("");
}

function renderPagination() {
  const nav = document.getElementById("pagination");
  if (!nav) return;

  const filtered = getFilteredIds();
  const total = filtered.length;
  const pageCount = getPageCount(total);
  currentPage = clampPage(currentPage, pageCount);

  if (total === 0) {
    nav.hidden = true;
    nav.innerHTML = "";
    return;
  }

  nav.hidden = false;
  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, total);

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  const pageButtons = pages
    .map((page) => {
      const active = page === currentPage ? " active" : "";
      return `<button type="button" class="page-btn${active}" data-page="${page}" aria-current="${page === currentPage ? "page" : "false"}">${page}</button>`;
    })
    .join("");

  nav.innerHTML = `
    <div class="pagination-info">Showing <strong>${start}–${end}</strong> of ${total}</div>
    <div class="pagination-controls">
      <button type="button" class="page-btn page-nav" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>← Prev</button>
      ${pageButtons}
      <button type="button" class="page-btn page-nav" data-page="${currentPage + 1}" ${currentPage === pageCount ? "disabled" : ""}>Next →</button>
    </div>
  `;

  nav.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = parseInt(btn.dataset.page, 10);
      if (!Number.isFinite(page) || page < 1 || page > pageCount) return;
      setPage(page);
    });
  });
}

function setupFilters() {
  document.querySelectorAll(".filter-btn[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn[data-filter]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      setPage(1, { replace: true, scroll: false });
    });
  });
}

document.getElementById("reset-btn")?.addEventListener("click", () => {
  if (confirm("Reset all progress for Tournament Combinations?")) {
    progress.resetSection(SECTION_ID);
    renderHeader();
    setPage(currentPage, { replace: true, scroll: false });
  }
});

window.addEventListener("popstate", () => {
  currentPage = readPageFromUrl();
  renderGrid();
  renderPagination();
});

async function main() {
  section = await getSection();
  migrateProgressToSequential(SECTION_ID, section.puzzles);
  puzzleIds = sortedPuzzleIds(section);
  currentPage = readPageFromUrl();
  renderHeader();
  renderGrid();
  renderPagination();
  setupFilters();
}

main().catch(console.error);
