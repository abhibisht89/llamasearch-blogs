/** Shared catalog for Line Kitchen — all casual repertoire courses. */

export const REPERTOIRE_HUB = {
  id: "line_kitchen",
  title: "Line Kitchen",
  tag: "Repertoire",
  href: "repertoire.html",
};

/** Watson book volumes use study-only mode (no actor-tagged drill steps). */
const WATSON_KEYS = new Set(["v1", "v2", "v3", "v4"]);

/** All Line Kitchen repertoire courses support interactive drill mode. */
export function isDrillEnabled(collectionKey) {
  return Boolean(collectionKey) && !WATSON_KEYS.has(collectionKey);
}

export function drillLessonHref(collectionKey, lessonId) {
  return `opening-drill.html?collection=${encodeURIComponent(collectionKey)}&lesson=${lessonId}`;
}

export function studyLessonHref(collectionKey, lessonId) {
  return `opening-study.html?collection=${encodeURIComponent(collectionKey)}&lesson=${lessonId}`;
}

let _catalogCache;

export async function loadRepertoireCatalog() {
  if (_catalogCache) return _catalogCache;
  const res = await fetch("data/repertoire-catalog.json");
  if (!res.ok) throw new Error("Could not load repertoire-catalog.json");
  _catalogCache = await res.json();
  return _catalogCache;
}
