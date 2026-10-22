/**
 * Render display math in .formula.tex blocks with KaTeX.
 * Pure HTML .formula blocks (sup/sub/unicode) are left alone.
 * Prefer data-tex when the visible node still has HTML noise.
 */
(function () {
  function sourceFor(el) {
    var raw = el.getAttribute("data-tex");
    if (raw != null && String(raw).trim() !== "") return String(raw);
    return el.textContent || "";
  }

  function renderAll() {
    if (typeof katex === "undefined") return;
    document.querySelectorAll(".formula.tex").forEach(function (el) {
      if (el.getAttribute("data-katex-done") === "1") return;
      var src = sourceFor(el).trim();
      if (!src) return;
      try {
        katex.render(src, el, {
          displayMode: true,
          throwOnError: false,
          strict: "ignore",
        });
        el.setAttribute("data-katex-done", "1");
      } catch (err) {
        console.warn("[katex-init]", err);
      }
    });
  }

  function boot() {
    if (typeof katex !== "undefined") {
      renderAll();
      return;
    }
    // Defer scripts: katex may land one tick later than this file.
    var tries = 0;
    var id = setInterval(function () {
      tries += 1;
      if (typeof katex !== "undefined") {
        clearInterval(id);
        renderAll();
      } else if (tries > 40) {
        clearInterval(id);
      }
    }, 50);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
