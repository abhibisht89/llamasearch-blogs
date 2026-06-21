/** Progress tracking in localStorage. */

const STORAGE_KEY = "llamachess-progress";
const LEGACY_KEY = "polgar-dojo-progress";
const PROGRESS_META_KEY = "llamachess-progress-meta";

function migrateLegacyKey() {
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy && !localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, legacy);
    localStorage.removeItem(LEGACY_KEY);
  }
}

function readAll() {
  migrateLegacyKey();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Remap progress from Polgar book ids (v1) to sequential ids (v2). */
export function migrateProgressToSequential(sectionId, puzzles) {
  if (localStorage.getItem(PROGRESS_META_KEY) === "2") return;
  const section = readAll()[sectionId];
  if (!section) {
    localStorage.setItem(PROGRESS_META_KEY, "2");
    return;
  }

  const bookToId = {};
  for (const p of puzzles) {
    if (p.bookId != null) bookToId[String(p.bookId)] = String(p.id);
  }

  const migrated = {};
  for (const [key, val] of Object.entries(section)) {
    const nextKey = bookToId[key] || key;
    if (!migrated[nextKey] || val.status === "solved") {
      migrated[nextKey] = val;
    }
  }

  const all = readAll();
  all[sectionId] = migrated;
  writeAll(all);
  localStorage.setItem(PROGRESS_META_KEY, "2");
}

export const progress = {
  getSection(sectionId) {
    const all = readAll();
    return all[sectionId] || {};
  },

  getPuzzle(sectionId, puzzleId) {
    return this.getSection(sectionId)[String(puzzleId)] || null;
  },

  isSolved(sectionId, puzzleId) {
    const entry = this.getPuzzle(sectionId, puzzleId);
    return entry?.status === "solved";
  },

  isAttempted(sectionId, puzzleId) {
    const entry = this.getPuzzle(sectionId, puzzleId);
    return entry?.status === "attempted";
  },

  markAttempted(sectionId, puzzleId) {
    const all = readAll();
    const section = { ...(all[sectionId] || {}) };
    const key = String(puzzleId);
    if (section[key]?.status === "solved") return;
    section[key] = { status: "attempted", at: Date.now() };
    all[sectionId] = section;
    writeAll(all);
  },

  markSolved(sectionId, puzzleId) {
    const all = readAll();
    const section = { ...(all[sectionId] || {}) };
    section[String(puzzleId)] = { status: "solved", at: Date.now() };
    all[sectionId] = section;
    writeAll(all);
  },

  countSolved(sectionId, puzzleIds) {
    return puzzleIds.filter((id) => this.isSolved(sectionId, id)).length;
  },

  resetSection(sectionId) {
    const all = readAll();
    delete all[sectionId];
    writeAll(all);
  },

  exportJson() {
    return JSON.stringify(readAll(), null, 2);
  },
};
