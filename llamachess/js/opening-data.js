/** Load and navigate Watson opening lesson data across Watson volumes. */

const WATSON_FILES = {
  v1: "data/openings-watson-v1.json",
  v2: "data/openings-watson-v2.json",
  v3: "data/openings-watson-v3.json",
  v4: "data/openings-watson-v4.json",
};

const COLLECTION_FILES = { ...WATSON_FILES };

const _cache = {};
let _manifestLoaded = false;

async function ensureRepertoireManifest() {
  if (_manifestLoaded) return;
  try {
    const res = await fetch("data/repertoire-manifest.json");
    if (res.ok) {
      const manifest = await res.json();
      for (const opening of manifest.openings || []) {
        COLLECTION_FILES[opening.key] = `data/openings-${opening.key}.json`;
      }
    }
  } catch {
    /* manifest optional at runtime */
  }
  _manifestLoaded = true;
}

function collectionFile(collection) {
  return COLLECTION_FILES[collection] || `data/openings-${collection}.json`;
}

export async function loadTocLondon() {
  const res = await fetch("data/london-toc.json");
  if (!res.ok) throw new Error("Could not load london-toc.json");
  return res.json();
}

export async function loadTocItalian() {
  const res = await fetch("data/italian-toc.json");
  if (!res.ok) throw new Error("Could not load italian-toc.json");
  return res.json();
}

/** @param {string} collection watson v1–v4 or repertoire key */
export async function loadOpenings(collection = "v1") {
  if (_cache[collection]) return _cache[collection];
  await ensureRepertoireManifest();
  const file = collectionFile(collection);
  if (!COLLECTION_FILES[collection] && !file.startsWith("data/openings-")) {
    throw new Error(`Unknown collection: ${collection}`);
  }
  const res = await fetch(`${file}?v=3`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load ${file}`);
  _cache[collection] = await res.json();
  return _cache[collection];
}

export async function loadTocV2() {
  const res = await fetch("data/watson-v2-toc.json");
  if (!res.ok) throw new Error("Could not load watson-v2-toc.json");
  return res.json();
}

export async function loadTocV3() {
  const res = await fetch("data/watson-v3-toc.json");
  if (!res.ok) throw new Error("Could not load watson-v3-toc.json");
  return res.json();
}

export async function loadTocV4() {
  const res = await fetch("data/watson-v4-toc.json");
  if (!res.ok) throw new Error("Could not load watson-v4-toc.json");
  return res.json();
}

/** Flat list of lessons with chapter metadata attached. */
export function allLessons(data) {
  if (data.lessons) {
    return [...data.lessons].sort((a, b) => a.id - b.id);
  }
  const lessons = [];
  for (const chapter of data.chapters || []) {
    for (const lesson of chapter.lessons || []) {
      lessons.push({ ...lesson, chapterId: chapter.id, chapterTitle: chapter.title });
    }
  }
  return lessons.sort((a, b) => a.id - b.id);
}

/** Chapter list for Vol. 1 hub / chapter pages (nested chapters format). */
export function allChapters(data) {
  if (!data.chapters) return [];
  return data.chapters.map((ch) => {
    const lessons = ch.lessons || [];
    const live = lessons.filter((l) => l.status !== "coming_soon");
    return {
      id: ch.id,
      title: ch.title,
      number: ch.number ?? null,
      bookPage: ch.bookPage ?? null,
      partTitle: ch.partTitle || ch.partId || "Watson Vol. 1",
      lessons,
      liveCount: live.length,
      totalCount: lessons.length,
    };
  });
}

export function getChapter(data, chapterId) {
  const chapter = allChapters(data).find((c) => c.id === chapterId);
  if (!chapter) throw new Error(`Chapter ${chapterId} not found`);
  return chapter;
}

export function getLesson(data, lessonId) {
  const id = Number(lessonId);
  if (data.lessons) {
    const lesson = data.lessons.find((l) => l.id === id);
    if (lesson) return lesson;
    throw new Error(`Lesson #${id} not found`);
  }
  for (const chapter of data.chapters) {
    const lesson = chapter.lessons.find((l) => l.id === id);
    if (lesson) {
      return {
        ...lesson,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        chapterNumber: chapter.number,
        partId: chapter.partId,
        partTitle: chapter.partTitle,
      };
    }
  }
  throw new Error(`Lesson #${id} not found`);
}

export function nextPrevLesson(data, currentId) {
  const live = allLessons(data).filter((l) => l.status !== "coming_soon");
  const ids = live.map((l) => l.id);
  const idx = ids.indexOf(Number(currentId));
  return {
    prev: idx > 0 ? ids[idx - 1] : null,
    next: idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null,
  };
}

/** Moves played so far at a given step index (intro = none). */
export function movesSoFar(lesson, stepIdx) {
  const moves = [];
  for (let i = 0; i <= stepIdx && i < lesson.steps.length; i++) {
    const s = lesson.steps[i];
    if (s.type === "move") moves.push(s.san);
  }
  return moves;
}

/** Map topicId → lesson for Vol. 2 hierarchical nav. */
export function lessonsByTopicId(data) {
  const map = new Map();
  for (const lesson of allLessons(data)) {
    if (lesson.topicId) map.set(lesson.topicId, lesson);
  }
  return map;
}
