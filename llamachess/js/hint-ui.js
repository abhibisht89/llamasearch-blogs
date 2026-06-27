/** Shared hint panel + Show hint button (matches Line Kitchen opening drill UI). */

const HINT_BTN_ICON = `<svg class="hint-btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>`;

/** Add lightbulb icon to the shared Show hint button. */
export function decorateHintButton(btn = document.getElementById("hint-btn")) {
  if (!btn || btn.dataset.hintDecorated === "true") return btn;

  btn.dataset.hintDecorated = "true";
  btn.classList.add("btn-hint");
  const label = btn.textContent.trim() || "Hint";
  btn.innerHTML = `${HINT_BTN_ICON}<span>${label}</span>`;
  return btn;
}

export function createHintUi({
  idleTitle = "Your move",
  idleBody = "Find the correct move.",
  revealBody = "Play this move from the book line.",
  doneTitle = "Done",
  doneBody = "Puzzle complete.",
} = {}) {
  decorateHintButton();
  const hintBtn = document.getElementById("hint-btn");
  const hintTitleEl = document.getElementById("hint-title");
  const hintBodyEl = document.getElementById("hint-body");

  let getMove = () => null;
  let isBlocked = () => false;
  let onRevealStatus = null;

  function setPanel(title, body) {
    if (hintTitleEl) hintTitleEl.textContent = title || "";
    if (hintBodyEl) hintBodyEl.textContent = body || "";
  }

  function showIdle() {
    setPanel(idleTitle, idleBody);
  }

  function updateControls() {
    if (hintBtn) hintBtn.disabled = isBlocked();
  }

  function reveal() {
    if (isBlocked()) return;

    const san = getMove();
    if (!san) {
      onRevealStatus?.("No hint available right now.", "error");
      return;
    }

    setPanel(`Book move: ${san}`, revealBody);
    onRevealStatus?.(`Hint: play ${san}`, "idle");
  }

  function markDone(title, body) {
    setPanel(title || doneTitle, body || doneBody);
    if (hintBtn) hintBtn.disabled = true;
  }

  function reset() {
    showIdle();
    updateControls();
  }

  hintBtn?.addEventListener("click", reveal);

  return {
    showIdle,
    reset,
    markDone,
    updateControls,
    reveal,
    setMoveProvider(fn) {
      getMove = fn;
    },
    setBlockedCheck(fn) {
      isBlocked = fn;
    },
    setStatusHandler(fn) {
      onRevealStatus = fn;
    },
  };
}
