/** Shared hint panel + Show hint button (matches Line Kitchen opening drill UI). */

export function createHintUi({
  idleTitle = "Your move",
  idleBody = "Find the correct move.",
  revealBody = "Play this move from the book line.",
  doneTitle = "Done",
  doneBody = "Puzzle complete.",
} = {}) {
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
