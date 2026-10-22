/**
 * Render math with KaTeX.
 * - .formula.tex blocks (display); prefer data-tex over visible HTML noise
 * - \( ... \) / \[ ... \] inline/display via auto-render when loaded
 * Pure HTML .formula blocks (sup/sub/unicode) are left alone.
 */
(function () {
  function sourceFor(el) {
    var raw = el.getAttribute("data-tex");
    if (raw != null && String(raw).trim() !== "") return String(raw);
    return el.textContent || "";
  }

  function renderFormulaTex() {
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

  // Chapters that still embed \( ... \) / \[ ... \] in prose (e.g. Deep Cuts 24).
  function renderDelimited() {
    if (typeof renderMathInElement === "undefined") return;
    if (document.documentElement.getAttribute("data-katex-auto") === "1") return;
    try {
      renderMathInElement(document.body, {
        delimiters: [
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false },
        ],
        throwOnError: false,
        strict: "ignore",
        // Skip already-rendered .formula.tex / code / scripts.
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
        ignoredClasses: ["formula"],
      });
      document.documentElement.setAttribute("data-katex-auto", "1");
    } catch (err) {
      console.warn("[katex-init] auto-render", err);
    }
  }

  function renderAll() {
    renderFormulaTex();
    renderDelimited();
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
