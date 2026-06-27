/**
 * Shared arrow-key navigation for chess board pages.
 *
 * ← / → — previous / next step or puzzle
 * ↑ / ↓ — previous / next line (study & drill only, when links are provided)
 */

/** True when focus is in a field where arrow keys should type, not navigate. */
export function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return Boolean(el.isContentEditable);
}

/** True when a sidebar nav link can be followed. */
export function isNavLinkEnabled(link) {
  if (!link || link.tagName !== "A") return false;
  if (link.classList.contains("disabled")) return false;
  if (link.style.pointerEvents === "none") return false;
  const href = link.getAttribute("href");
  return Boolean(href && href !== "#");
}

/** Follow an enabled nav link. Returns whether navigation started. */
export function followNavLink(link) {
  if (!isNavLinkEnabled(link)) return false;
  location.href = link.href;
  return true;
}

/** Click a button when it exists and is not disabled. */
export function clickButton(button) {
  if (!button || button.disabled) return false;
  button.click();
  return true;
}

function activateAction(action) {
  if (!action) return false;
  if (typeof action === "function") return Boolean(action());
  if (action instanceof HTMLElement) {
    if (action.tagName === "A") return followNavLink(action);
    if (action.tagName === "BUTTON") return clickButton(action);
  }
  return false;
}

/**
 * Bind document-level arrow keys for board navigation.
 *
 * @param {{
 *   prevStep?: (() => boolean) | HTMLElement,
 *   nextStep?: (() => boolean) | HTMLElement,
 *   prevItem?: (() => boolean) | HTMLElement,
 *   nextItem?: (() => boolean) | HTMLElement,
 *   enabled?: (event: KeyboardEvent) => boolean,
 * }} options
 * @returns {() => void} remove listener
 */
export function initBoardKeyboardNav({
  prevStep,
  nextStep,
  prevItem,
  nextItem,
  enabled,
} = {}) {
  const onKeyDown = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    const allowed = enabled
      ? enabled(event)
      : !isTypingTarget(document.activeElement);
    if (!allowed) return;

    let handled = false;
    switch (event.key) {
      case "ArrowLeft":
        handled = activateAction(prevStep);
        break;
      case "ArrowRight":
        handled = activateAction(nextStep);
        break;
      case "ArrowUp":
        handled = activateAction(prevItem);
        break;
      case "ArrowDown":
        handled = activateAction(nextItem);
        break;
      default:
        return;
    }

    if (handled) event.preventDefault();
  };

  document.addEventListener("keydown", onKeyDown);
  return () => document.removeEventListener("keydown", onKeyDown);
}

/** Puzzle pages: arrow keys follow prev-btn and next-btn links. */
export function initPuzzleKeyboardNav(prevLink, nextLink) {
  return initBoardKeyboardNav({ prevStep: prevLink, nextStep: nextLink });
}

/** Study pages: arrow keys for steps and lines. */
export function initStudyKeyboardNav(options) {
  return initBoardKeyboardNav(options);
}

/** Drill pages: arrow keys switch lines. */
export function initDrillKeyboardNav(prevLink, nextLink) {
  return initBoardKeyboardNav({ prevStep: prevLink, nextStep: nextLink });
}
