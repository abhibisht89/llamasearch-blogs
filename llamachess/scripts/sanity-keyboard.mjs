/**
 * Final sanity: keyboard nav on board pages.
 * ←/→ walk steps/puzzles; ↑/↓ jump lines (study).
 */
import { chromium } from "playwright";

const BASE = process.env.LLAMACHESS_URL || "http://localhost:8765";
const results = { pass: [], fail: [], warn: [] };

function pass(name, detail = "") {
  results.pass.push({ name, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.fail.push({ name, detail });
  console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

function warn(name, detail = "") {
  results.warn.push({ name, detail });
  console.log(`WARN  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function waitForStudy(page) {
  await page.waitForSelector("#move-line", { timeout: 15000 });
  await page.waitForFunction(
    () => new URL(location.href).searchParams.get("step") != null,
    { timeout: 15000 }
  );
}

async function stepIndex(page) {
  const url = new URL(page.url());
  return Number(url.searchParams.get("step") || "0");
}

async function testStudyKeyboard(page) {
  const url = `${BASE}/opening-study.html?collection=london&lesson=1&step=0`;
  await page.goto(url, { waitUntil: "networkidle" });
  await waitForStudy(page);

  const start = await stepIndex(page);
  const canAdvance = !(await page.locator("#next-step").isDisabled());
  if (!canAdvance) {
    fail("study: load", "expected multi-step line with next step enabled");
    return;
  }
  pass("study: load", `step index ${start}`);

  // → advances step
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(250);
  const afterRight = await stepIndex(page);
  if (afterRight === start + 1) {
    pass("study: ArrowRight", `step ${start} → ${afterRight}`);
  } else {
    fail("study: ArrowRight", `expected step ${start + 1}, got ${afterRight}`);
  }

  // ← goes back
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(250);
  const afterLeft = await stepIndex(page);
  if (afterLeft === start) {
    pass("study: ArrowLeft", `step ${afterRight} → ${afterLeft}`);
  } else {
    fail("study: ArrowLeft", `expected step ${start}, got ${afterLeft}`);
  }

  // ↓ jumps to next line (lesson 2)
  const nextLessonHref = await page.locator("#next-lesson").getAttribute("href");
  if (!nextLessonHref || nextLessonHref === "#") {
    warn("study: ArrowDown", "no next line available to test");
    return;
  }

  await page.keyboard.press("ArrowDown");
  await page.waitForURL(/lesson=2/, { timeout: 10000 });
  await waitForStudy(page);
  const lessonParam = new URL(page.url()).searchParams.get("lesson");
  if (lessonParam === "2") {
    pass("study: ArrowDown", "jumped to lesson 2");
  } else {
    fail("study: ArrowDown", `expected lesson=2, got lesson=${lessonParam}`);
  }

  // ↑ jumps back to previous line
  await page.keyboard.press("ArrowUp");
  await page.waitForURL(/lesson=1/, { timeout: 10000 });
  await waitForStudy(page);
  const backLesson = new URL(page.url()).searchParams.get("lesson");
  if (backLesson === "1") {
    pass("study: ArrowUp", "jumped back to lesson 1");
  } else {
    fail("study: ArrowUp", `expected lesson=1, got lesson=${backLesson}`);
  }
}

async function testDrillKeyboard(page) {
  const url = `${BASE}/opening-drill.html?collection=london&lesson=1`;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector("#lesson-title:not(:empty)", { timeout: 15000 });

  const title1 = await page.locator("#lesson-title").textContent();
  pass("drill: load", title1?.trim().slice(0, 40) || "loaded");

  const nextHref = await page.locator("#next-lesson").getAttribute("href");
  if (!nextHref || nextHref === "#") {
    warn("drill: ArrowRight", "no next line to test");
    return;
  }

  await page.keyboard.press("ArrowRight");
  await page.waitForURL(/lesson=2/, { timeout: 10000 });
  const lesson2 = new URL(page.url()).searchParams.get("lesson");
  if (lesson2 === "2") {
    pass("drill: ArrowRight", "jumped to lesson 2");
  } else {
    fail("drill: ArrowRight", `expected lesson=2, got ${lesson2}`);
  }

  await page.keyboard.press("ArrowLeft");
  await page.waitForURL(/lesson=1/, { timeout: 10000 });
  const lesson1 = new URL(page.url()).searchParams.get("lesson");
  if (lesson1 === "1") {
    pass("drill: ArrowLeft", "jumped back to lesson 1");
  } else {
    fail("drill: ArrowLeft", `expected lesson=1, got ${lesson1}`);
  }
}

async function testPuzzleKeyboard(page, path, label) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForSelector("#puzzle-num:not(:empty)", { timeout: 15000 });

  const startId = await page.locator("#puzzle-num").textContent();
  const nextHref = await page.locator("#next-btn").getAttribute("href");
  if (!nextHref || nextHref === "#") {
    warn(`${label}: ArrowRight`, "no next puzzle");
    return;
  }

  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(
    (prev) => document.getElementById("puzzle-num")?.textContent !== prev,
    startId,
    { timeout: 10000 }
  );
  const nextId = await page.locator("#puzzle-num").textContent();
  if (nextId !== startId) {
    pass(`${label}: ArrowRight`, `#${startId} → #${nextId}`);
  } else {
    fail(`${label}: ArrowRight`, "puzzle id unchanged");
  }

  await page.keyboard.press("ArrowLeft");
  await page.waitForFunction(
    (expected) => document.getElementById("puzzle-num")?.textContent === expected,
    startId,
    { timeout: 10000 }
  );
  const backId = await page.locator("#puzzle-num").textContent();
  if (backId === startId) {
    pass(`${label}: ArrowLeft`, `#${nextId} → #${backId}`);
  } else {
    fail(`${label}: ArrowLeft`, `expected #${startId}, got #${backId}`);
  }
}

async function testHub(page) {
  await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
  await page.waitForSelector(".hub-card", { timeout: 15000 });
  const count = await page.locator(".hub-card").count();
  if (count >= 6) {
    pass("hub: index", `${count} collection cards`);
  } else {
    fail("hub: index", `expected 6 cards, got ${count}`);
  }
}

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    page.on("pageerror", (err) => warn("console error", err.message));

    await testHub(page);
    await testStudyKeyboard(page);
    await testDrillKeyboard(page);
    await testPuzzleKeyboard(page, "/solve.html?section=mate_in_1&id=1", "mate-in-1");
    await testPuzzleKeyboard(page, "/solve-mate-in-3.html?id=1", "mate-in-3");
    await testPuzzleKeyboard(page, "/solve-sisters.html?id=1", "sisters");
    await testPuzzleKeyboard(page, "/solve-endgame-wins.html?id=1", "endgame-wins");

    console.log("\n=== SUMMARY ===");
    console.log(`Pass: ${results.pass.length}  Fail: ${results.fail.length}  Warn: ${results.warn.length}`);
    if (results.fail.length) process.exit(1);
  } catch (err) {
    console.error("Sanity runner crashed:", err);
    process.exit(1);
  } finally {
    await browser?.close();
  }
}

main();
