/* Headless smoke test for the core attendee flows.
   Usage: node smoke.mjs [baseUrl]   (default http://127.0.0.1:4180/)
   Requires playwright locally; the site itself has no dependencies. */

import { chromium } from "playwright";

const BASE = process.argv[2] || "http://127.0.0.1:4180/";
const CHROME = process.env.CHROME_PATH || undefined;

const results = [];
const check = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "  ok  " : " FAIL "} ${name}${detail ? "  -- " + detail : ""}`);
};

const browser = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

await page.goto(BASE, { waitUntil: "networkidle" });

/* -- program ------------------------------------------------------------- */
check("program renders sessions", (await page.locator(".session").count()) > 0);
/* Single-day event: the day-tab bar hides itself rather than showing one tab. */
check("single-day event hides the day tabs", await page.locator(".days").isHidden());
check("all sessions render", (await page.locator(".session").count()) === 11);

await page.fill("#q", "keynote");
await page.waitForTimeout(250);
const searched = await page.locator(".session").count();
check("search filters the program", searched === 1, `${searched} result(s)`);
await page.fill("#q", "");
await page.waitForTimeout(250);

/* No session declares a track, so the filter removes itself. */
check("track filter hides when unused", await page.locator(".select").isHidden());

check("UTC line is derived for every timed session",
  (await page.locator(".when .utc").count()) === 11);
/* 9:00-9:15 AM HST is 19:00-19:15 UTC, matching the official program. */
check("UTC conversion is right for the 9:00 AM HST session",
  (await page.locator(".session").nth(1).locator(".utc").textContent()).trim() === "19:00\u201319:15 UTC");
check("session sponsors render", (await page.locator(".sponsor").count()) === 4);

/* Outbound links: the event sponsor credits, the reception's venue/film links,
   and every one of them opened safely in a new tab. */
check("event sponsor credits link out",
  (await page.locator("#event-sponsors a.ext").count()) === 2);
check("footer credit links to the TechZone",
  (await page.locator("#site-credit a.ext").getAttribute("href"))
    === "https://www.hawaiischoolforgirls.org/academics/techzone");
check("session link row renders",
  (await page.locator(".session .links a.ext").count()) === 3);
const unsafe = await page.locator("a.ext").evaluateAll(
  (ns) => ns.filter((n) => n.target !== "_blank" || !n.rel.includes("noopener")).length);
check("outbound links carry target=_blank + noopener", unsafe === 0, `${unsafe} unsafe`);

/* Off-event, nothing should be badged -- otherwise "Up Next" sits on the first
   session for months before the conference. */
check("no live badges outside the event day",
  (await page.locator(".status-badge").count()) === 0);

/* -- stars --------------------------------------------------------------- */
const firstStar = page.locator(".session:not(.break) .star").first();
await firstStar.click();
check("star toggles on", (await firstStar.getAttribute("aria-pressed")) === "true");
await page.click("#starred-only");
await page.waitForTimeout(150);
check("saved-only filter works", (await page.locator(".session").count()) === 1);
await page.click("#starred-only");
await page.waitForTimeout(150);

/* -- session note -------------------------------------------------------- */
const firstDetails = page.locator(".session .expand").first();
await firstDetails.locator("summary").click();
await firstDetails.locator("textarea").fill("Test note from the smoke run.");
await firstDetails.getByRole("button", { name: "Save" }).click();
await page.waitForTimeout(250);
check("note count badge appears", (await page.locator("#note-count").textContent()) === "1");
check("note dot marks the session", await firstDetails.locator("summary.has-note").isVisible());

/* -- persistence --------------------------------------------------------- */
await page.reload({ waitUntil: "networkidle" });
check("note survives reload", (await page.locator("#note-count").textContent()) === "1");
check("star survives reload",
  (await page.locator(".session:not(.break) .star.on").count()) === 1);

/* -- speakers ------------------------------------------------------------ */
await page.click("#tab-speakers");
check("speakers render", (await page.locator(".speaker").count()) === 16);
/* Every speaker the official program hyperlinked gets a linked affiliation
   line; Burt Lum has no link there, so his stays plain text. */
check("speaker affiliations link out",
  (await page.locator(".speaker p.muted a.ext").count()) === 15);
check("unlinked speaker keeps a plain affiliation",
  (await page.locator("#speaker-burt-lum p.muted a").count()) === 0);
await page.fill("#speaker-q", "icann");
await page.waitForTimeout(250);
check("speaker search matches organizations", (await page.locator(".speaker").count()) === 2);
await page.fill("#speaker-q", "cerf");
await page.waitForTimeout(250);
check("speaker search matches names", (await page.locator(".speaker").count()) === 1);
await page.fill("#speaker-q", "");
await page.waitForTimeout(250);

/* -- cross navigation ---------------------------------------------------- */
await page.locator(".speaker .chip").first().click();
await page.waitForTimeout(500);
check("session chip jumps back to the program",
  (await page.locator("#tab-program").getAttribute("aria-selected")) === "true");

await page.locator(".session .people .linkish").first().click();
await page.waitForTimeout(500);
check("speaker name jumps to the speakers tab",
  (await page.locator("#tab-speakers").getAttribute("aria-selected")) === "true");

/* -- notes tab + export -------------------------------------------------- */
await page.click("#tab-notes");
await page.waitForTimeout(150);
check("note appears in the notes tab", (await page.locator(".note-card").count()) === 1);

await page.fill("#quick-note", "A quick note.");
await page.click("#save-quick");
await page.waitForTimeout(250);
check("quick note saves", (await page.locator(".note-card").count()) === 2);

await page.fill("#notes-q", "quick");
await page.waitForTimeout(250);
check("notes search filters", (await page.locator(".note-card").count()) === 1);
await page.fill("#notes-q", "");
await page.waitForTimeout(250);

await page.click("#export-btn");
await page.waitForTimeout(250);
const exported = await page.inputValue("#export-text");
check("export includes both notes",
  exported.includes("A quick note.") && exported.includes("Test note from the smoke run."));
check("export lists saved sessions", exported.includes("## Saved sessions"));
await page.keyboard.press("Escape");
await page.waitForTimeout(200);
check("Escape closes the modal", await page.locator("#export-modal").isHidden());

/* -- destructive guard --------------------------------------------------- */
await page.click("#clear-btn");
await page.waitForTimeout(200);
check("clear stays disabled without the phrase", await page.locator("#clear-confirm").isDisabled());
await page.fill("#clear-input", "delete all");
await page.waitForTimeout(150);
check("clear enables with the exact phrase", await page.locator("#clear-confirm").isEnabled());
await page.click("#clear-confirm");
await page.waitForTimeout(300);
check("clear removes every note", (await page.locator(".note-card").count()) === 0);
check("clear also drops the count badge", await page.locator("#note-count").isHidden());

/* -- layout -------------------------------------------------------------- */
await page.click("#tab-program");
await page.waitForTimeout(150);
const overflow = await page.evaluate(() =>
  document.documentElement.scrollWidth > document.documentElement.clientWidth);
check("no horizontal overflow at 390px", !overflow);

/* Links sitting inline in running text are exempt from target-size guidance
   (WCAG 2.5.8 inline exception) -- enlarging them would break the line box. */
const smallTargets = await page.evaluate(() =>
  [...document.querySelectorAll("button, a.btn, input, select")]
    .filter((n) => n.offsetParent !== null)
    .filter((n) => !n.closest("p"))
    .filter((n) => { const r = n.getBoundingClientRect(); return r.height > 0 && r.height < 36; })
    .map((n) => n.id || n.className || n.tagName));
check("touch targets are large enough", smallTargets.length === 0, smallTargets.join(", "));

check("no console errors", errors.length === 0, errors.join(" | "));

/* -- regressions worth keeping -------------------------------------------- */
/* Both of these were live bugs that could cost an attendee their notes, and
   neither is visible on a casual click-through. */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const rp = await ctx.newPage();
  await rp.goto(BASE, { waitUntil: "networkidle" });

  /* A pasted URL is one unbroken string. Without overflow-wrap it ran off the
     card and gave the whole document horizontal overflow, which persisted
     until the note was deleted. */
  await rp.evaluate(() => {
    const k = "quick|general";
    localStorage.setItem("hisig26_notes", JSON.stringify({
      [k]: { key: k, type: "quick", entityId: "general",
             text: "https://example.org/" + "a".repeat(280),
             createdAt: Date.now(), updatedAt: Date.now() }
    }));
  });
  await rp.reload({ waitUntil: "networkidle" });
  await rp.click("#tab-notes");
  await rp.waitForTimeout(200);
  const wide = await rp.evaluate(() => ({
    over: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    zoomed: window.innerWidth !== 390
  }));
  check("a long unbroken URL in a note does not overflow the page",
    !wide.over && !wide.zoomed, JSON.stringify(wide));

  /* body.locked used to be overflow:hidden, which collapses the viewport's
     scroll range and clamps the offset to 0 -- opening Export threw you to the
     top of your own notes. Click via the DOM: page.click() scrolls the button
     into view first and would hide the bug. */
  await rp.evaluate(() => {
    const n = {};
    for (let i = 0; i < 12; i++) {
      const k = `quick|n${i}`;
      n[k] = { key: k, type: "quick", entityId: `n${i}`, text: `note ${i}`,
               createdAt: Date.now(), updatedAt: Date.now() };
    }
    localStorage.setItem("hisig26_notes", JSON.stringify(n));
  });
  await rp.reload({ waitUntil: "networkidle" });
  await rp.click("#tab-notes");
  await rp.waitForTimeout(200);
  await rp.evaluate(() => window.scrollTo(0, 700));
  const wasAt = await rp.evaluate(() => window.scrollY);
  await rp.evaluate(() => document.querySelector("#export-btn").click());
  await rp.waitForTimeout(200);
  const locked = await rp.evaluate(() =>
    document.documentElement.scrollHeight <= window.innerHeight + 1);
  await rp.evaluate(() => document.querySelector("#export-close").click());
  await rp.waitForTimeout(300);
  const backAt = await rp.evaluate(() => window.scrollY);
  check("opening and closing a modal keeps your scroll position",
    Math.abs(backAt - wasAt) < 5, `${wasAt} -> ${backAt}`);
  /* The other half: the page behind the dialog must not be scrollable at all,
     which is what position:fixed buys over a bare overflow:hidden. */
  check("the page behind an open modal cannot scroll", locked);

  /* --stick drives scroll-margin and the skip link; a hard-coded value drifts
     the moment the header changes. */
  const stick = await rp.evaluate(() => ({
    real: Math.round(document.querySelector(".site").getBoundingClientRect().height),
    varr: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--stick"))
  }));
  check("--stick matches the real header height",
    Math.abs(stick.real - stick.varr) <= 1, `header=${stick.real} --stick=${stick.varr}`);

  await ctx.close();
}

/* -- the smallest phone anyone will bring ---------------------------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 320, height: 568 } });
  const sm = await ctx.newPage();
  await sm.goto(BASE, { waitUntil: "networkidle" });
  await sm.evaluate(() => document.fonts.ready);
  const bare = await sm.evaluate(() => document.querySelector(".site").getBoundingClientRect().height);

  /* Saving one note adds a count pill. It used to not fit beside "NOTES",
     wrapped to a second line, and grew the sticky header permanently. */
  await sm.evaluate(() => {
    const k = "quick|general";
    localStorage.setItem("hisig26_notes", JSON.stringify({
      [k]: { key: k, type: "quick", entityId: "general", text: "hi",
             createdAt: Date.now(), updatedAt: Date.now() }
    }));
  });
  await sm.reload({ waitUntil: "networkidle" });
  await sm.evaluate(() => document.fonts.ready);
  const withPill = await sm.evaluate(() => document.querySelector(".site").getBoundingClientRect().height);
  check("the note count pill does not grow the header at 320px",
    Math.abs(withPill - bare) < 2, `${bare.toFixed(1)} -> ${withPill.toFixed(1)}`);

  /* An input whose placeholder is cut off is the first thing a person reads. */
  const ph = await sm.evaluate(() => {
    const i = document.querySelector("#q");
    const cs = getComputedStyle(i);
    const cv = document.createElement("canvas").getContext("2d");
    cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    return { box: i.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
             text: cv.measureText(i.placeholder).width };
  });
  check("the search placeholder fits at 320px",
    ph.text <= ph.box, `text=${Math.round(ph.text)} box=${Math.round(ph.box)}`);

  const smOverflow = await sm.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth);
  check("no horizontal overflow at 320px", !smOverflow);
  await ctx.close();
}

/* -- live badges, with the clock moved into the event ---------------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const live = await ctx.newPage();
  /* 2026-09-04 21:00 UTC == 11:00 HST, inside Understanding Internet Governance. */
  await live.clock.setFixedTime(new Date("2026-09-04T21:00:00Z"));
  await live.goto(BASE, { waitUntil: "networkidle" });
  const now = live.locator(".status-badge.is-now");
  check("NOW badge appears during the event", (await now.count()) === 1);
  check("NOW badge lands on the running session",
    (await live.locator(".session.is-now .title").textContent()) === "Understanding Internet Governance");
  await ctx.close();
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
