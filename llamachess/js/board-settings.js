/**
 * Shared settings panel for puzzle, drill, and study pages.
 * Left sidebar info-card (same style/width as the right sidebar boxes).
 */
import {
  buildPgnFromFen,
  copyText,
  lichessAnalysisUrl,
} from "./board-export.js";

const SETTINGS_GEAR = `<svg class="board-settings-gear" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.39 1.26 1 1.51.31.13.65.2 1 .2H21a2 2 0 1 1 0 4h-.09c-.66 0-1.26.39-1.51 1Z"/></svg>`;

const BOARD_LAYOUT_SELECTOR = ".solve-layout, .study-layout";

/**
 * Mount the settings card once per page.
 * @param {{ getFen: () => string, getOrientation?: () => "white" | "black", onStatus?: (text: string, kind?: string) => void }} options
 */
export function initBoardSettings({ getFen, getOrientation, onStatus } = {}) {
  const layout = document.querySelector(BOARD_LAYOUT_SELECTOR);
  if (!layout || layout.querySelector(".board-sidebar-left")) return null;

  unwrapBoardStage(layout);

  const getFenFn = typeof getFen === "function" ? getFen : () => "";
  const getOrientationFn = typeof getOrientation === "function"
    ? getOrientation
    : readBoardOrientation;
  const sidebarClass = layout.classList.contains("study-layout")
    ? "study-sidebar"
    : "solve-sidebar";

  const aside = document.createElement("aside");
  aside.className = `${sidebarClass} board-sidebar-left`;
  aside.innerHTML = `
    <div class="info-card board-settings-card is-open">
      <button
        type="button"
        class="board-settings-header"
        aria-expanded="true"
        aria-controls="board-settings-menu"
      >
        <span class="board-settings-title">
          ${SETTINGS_GEAR}
          <h2>Setting</h2>
        </span>
        <span class="board-settings-chevron" aria-hidden="true"></span>
      </button>
      <div id="board-settings-menu" class="board-settings-body">
        <p class="board-settings-label">Export &amp; Share</p>
        <button type="button" class="btn btn-ghost btn-block board-settings-action" data-action="lichess">
          Open in Lichess
        </button>
        <button type="button" class="btn btn-ghost btn-block board-settings-action" data-action="copy-pgn">
          Copy PGN
        </button>
        <button type="button" class="btn btn-ghost btn-block board-settings-action" data-action="copy-fen">
          Copy FEN
        </button>
      </div>
      <div class="board-settings-theme-slot"></div>
    </div>
  `;

  layout.insertBefore(aside, layout.firstChild);
  relocateBoardTheme(aside);

  const card = aside.querySelector(".board-settings-card");
  const toggle = aside.querySelector(".board-settings-header");
  const menu = aside.querySelector(".board-settings-body");

  function closeMenu() {
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    card.classList.remove("is-open");
  }

  function openMenu() {
    menu.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    card.classList.add("is-open");
  }

  toggle.addEventListener("click", () => {
    if (menu.hidden) openMenu();
    else closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  menu.addEventListener("click", async (event) => {
    const item = event.target.closest("[data-action]");
    if (!item) return;

    const fen = getFenFn()?.trim();
    if (!fen) {
      onStatus?.("No position to export.", "error");
      return;
    }

    const action = item.dataset.action;

    try {
      if (action === "lichess") {
        window.open(lichessAnalysisUrl(fen, getOrientationFn()), "_blank", "noopener,noreferrer");
        onStatus?.("Opened in Lichess.", "idle");
      } else if (action === "copy-pgn") {
        await copyText(buildPgnFromFen(fen));
        onStatus?.("PGN copied to clipboard.", "idle");
      } else if (action === "copy-fen") {
        await copyText(fen);
        onStatus?.("FEN copied to clipboard.", "idle");
      }
    } catch {
      onStatus?.("Could not complete that action.", "error");
    }
  });

  return { closeMenu, wrap: aside };
}

/** Read chessground orientation from the live board (matches what you see in LlamaChess). */
function readBoardOrientation() {
  const wrap = document.querySelector(".board-wrap .cg-wrap");
  if (wrap?.classList.contains("orientation-black")) return "black";
  return "white";
}

/** Move Board theme controls from the right sidebar into the Setting card. */
function relocateBoardTheme(leftSidebar) {
  const slot = leftSidebar.querySelector(".board-settings-theme-slot");
  const rightSidebar = document.querySelector(
    ".solve-sidebar:not(.board-sidebar-left), .study-sidebar:not(.board-sidebar-left)",
  );
  const themeCard = rightSidebar?.querySelector(".theme-switch")?.closest(".info-card");
  if (!slot || !themeCard) return;

  const heading = themeCard.querySelector("h2");
  const themeSwitch = themeCard.querySelector(".theme-switch");
  if (heading) slot.appendChild(heading);
  if (themeSwitch) slot.appendChild(themeSwitch);
  themeCard.remove();
}

/** Undo older board-stage layout if present. */
function unwrapBoardStage(layout) {
  const main = layout.querySelector(".solve-main, .study-main");
  const stage = main?.querySelector(".board-stage");
  if (!main || !stage) return;

  const boardWrap = stage.querySelector(".board-wrap");
  if (!boardWrap) return;

  const anchor = main.querySelector("#status-msg") || main.querySelector("#start-btn");
  main.insertBefore(boardWrap, anchor);
  stage.remove();
}
