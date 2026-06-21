/** Board theme preference — blue, green, or brown. */

const STORAGE_KEY = "llamachess-board-theme";
const LEGACY_KEY = "polgar-dojo-board-theme";
export const THEMES = ["brown", "green", "blue"];
export const DEFAULT_THEME = "brown";

function migrateLegacyKey() {
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy && !localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, legacy);
    localStorage.removeItem(LEGACY_KEY);
  }
}

/** Map old saved values to current theme ids. */
function normalizeTheme(saved) {
  if (saved === "lichess") return "blue";
  if (saved === "chesscom") return "green";
  if (THEMES.includes(saved)) return saved;
  return DEFAULT_THEME;
}

export function getBoardTheme() {
  migrateLegacyKey();
  return normalizeTheme(localStorage.getItem(STORAGE_KEY));
}

/** Apply theme class to the board wrapper. */
export function applyBoardTheme(theme) {
  const wrap = document.querySelector(".board-wrap");
  if (!wrap) return;

  const active = normalizeTheme(theme);
  wrap.classList.remove(...THEMES.map((t) => `theme-${t}`));
  wrap.classList.add(`theme-${active}`);

  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === active);
  });
}

export function setBoardTheme(theme) {
  const next = normalizeTheme(theme);
  localStorage.setItem(STORAGE_KEY, next);
  applyBoardTheme(next);
}

export function initBoardThemeSwitcher() {
  applyBoardTheme(getBoardTheme());

  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.addEventListener("click", () => setBoardTheme(btn.dataset.theme));
  });
}
