/* Headless smoke test for the core attendee flows.
   Usage: node smoke.mjs [baseUrl]   (default http://127.0.0.1:4180/hisig-site/)
   Requires playwright locally; the site itself has no dependencies. */

import { chromium } from "playwright";

const BASE = process.argv[2] || "http://127.0.0.1:4180/hisig-site/";
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
check("day tabs render", (await page.locator(".day").count()) >= 1);

await page.fill("#q", "keynote");
await page.waitForTimeout(250);
const searched = await page.locator(".session").count();
check("search filters the program", searched === 1, `${searched} result(s)`);
await page.fill("#q", "");
await page.waitForTimeout(250);

await page.selectOption("#track", "Track B");
await page.waitForTimeout(150);
check("track filter narrows results", (await page.locator(".session").count()) === 1);
await page.selectOption("#track", "");
await page.waitForTimeout(150);

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
check("speakers render", (await page.locator(".speaker").count()) === 3);
await page.fill("#speaker-q", "second");
await page.waitForTimeout(250);
check("speaker search filters", (await page.locator(".speaker").count()) === 1);
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

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
