/** Shared dark/light theme — uses same key as The Context Window. */

const root = document.documentElement;
const btn = document.getElementById("themeToggle");
const STORAGE = "tcw-theme";

const saved = localStorage.getItem(STORAGE);
if (saved === "light") root.setAttribute("data-theme", "light");

if (btn) {
  btn.addEventListener("click", () => {
    const isLight = root.getAttribute("data-theme") === "light";
    if (isLight) {
      root.removeAttribute("data-theme");
      localStorage.setItem(STORAGE, "dark");
    } else {
      root.setAttribute("data-theme", "light");
      localStorage.setItem(STORAGE, "light");
    }
  });
}
