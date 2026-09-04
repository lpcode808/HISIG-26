# Agent Handoff

Newest entry first. Append a dated section when you finish a body of work.

## 2026-09-04 Three-Persona Audit, The Night Before

Three subagents drove the running app in Chromium, each as a different
attendee, and reported without touching the tree; every fix below was made
here and re-measured. The personas were chosen to pull in different
directions, and that is what made them worth running:

1. **A 16-year-old at her first policy conference**, 360×800 Android, there
   for a class assignment — comprehension, and getting her notes out.
2. **A delegate arriving mid-morning**, 390×844 and landscape, clock faked to
   10:40 AM and 4:15 PM HST — orientation on the day.
3. **A community attendee in their 60s**, 200% text, bright sun, unreliable
   cell service — contrast, large text, offline.

**Two of the three independently hit the same quick-note data loss.** That
convergence is the strongest signal in the set; when personas overlap, believe
it.

### The four ways this app was destroying notes

All silent. Nothing on screen said the note was gone, which is why nobody had
caught them by clicking around.

1. **Every quick note wrote to one shared `quick:general` key.** The second
   thought of the day replaced the first. Worse: the note count stayed at 1, so
   the save re-fired the *first-note* toast — "Saved on this phone only" —
   reassuring the attendee at the exact moment their earlier note was
   destroyed. The composer now adds a new note each time and clears itself.
   Notes already under the old key still render and stay editable.
2. **Stars alone could not be exported.** Export was greyed out with the red
   Delete all as the only enabled control, and `exportMarkdown()` returned
   before it ever reached the starred list. Someone told to "pick three
   sessions" who stars three and types nothing could not get them off the
   phone. Saved speakers are carried now too.
3. **Any re-render ate an unsaved draft.** Tapping ★ Saved or typing in search
   rebuilt every card. `flushEditors()` persists dirty drafts first. It only
   ever *writes* — an emptied box is cleared by Save, never by a re-render —
   which is also why clear-all cannot resurrect anything.
4. **Emptying a note box and pressing Save deleted it with no undo**, though
   the Delete button has had one since the last pass.

### Orientation on the day

- **"Up Next" was an `else if`.** For every minute a session was actually
  running, the app answered "what is on now?" and stayed silent on "what is on
  next?". Both are badged now — which promptly exposed that `.status-badge
  .is-next` was 3.46:1. Fixed to `--ink`.
- **At 10:40 AM the live session sat ~1,350px down**, behind two that had
  finished hours earlier. `jumpToLive()` lands first paint on it. First paint
  only, so it never fights the per-tab scroll memory.
- **The reception's "different venue" warning was inside the collapsed
  disclosure.** A skimmer got an address and no hint it was somewhere else.
  `summary` now renders on the face of the card (see `.card-summary`), and
  `room` is a maps link.
- **The UTC line had no date** though Hawaiʻi is UTC−10 and every afternoon
  session falls on the next UTC day.

### Accessibility — the three that actually blocked someone

- **The tab row overflowed the document at large system text.** At a 24px
  default font the Notes tab was clipped; at 32px it was 193px off-screen
  entirely, and the row read `PROGRAM SPEAKERS` with no hint a third tab
  existed. Notes, export and the privacy explanation all unreachable. The row
  wraps now; each tab keeps `nowrap` so its label and count pill stay together,
  which is what the earlier 320px fix was protecting. **Verified: document
  scrollWidth equals the viewport at 390 and 360 wide, at 16/24/32px.**
- **Saved and unsaved ★ were 1.01:1 apart and pixel-identical in greyscale.**
  Colour was the only difference. The glyph now carries the state (☆ / ★) and
  `--star-ink` clears 4.5:1 on white. Measured 5.81:1.
- **`cache.addAll` is all-or-nothing.** One dropped request out of fourteen —
  an icon, on exactly the flaky first load a QR scan produces at a venue with
  poor signal — rejected the whole install. The worker never activated, the
  cache stayed empty, the app rendered perfectly, and the silent `.catch` on
  registration meant nothing said so. The attendee found out by walking
  outside. Core five strict, extras `allSettled`. **Verified: with icon-512
  failing, 1 registration and 13 cached entries; it was 0 and 0.**

### Contrast, measured not eyeballed

Fixed: `.utc` 2.84 → 6.39 (it stacked `opacity:.85` on `--ink-soft` at 11px);
`.status-badge.is-next` 3.46 → 16.7; `::placeholder` now `--ink-soft`, one rule
covering all four failing placeholders; and in dark mode the **`Delete all
notes` confirm button was white on salmon at 2.55:1** — the final confirm on
the one irreversible action in the app — now `--danger-ink` at 7.11:1.

`.muted` on light was checked and is **fine at 6.39:1**. Every failure was a
case of an extra `opacity`, a lighter `--bg-alt` backdrop, or a hardcoded UA
grey layered on top — not the token itself.

### Also

Header capped at 60vh when the venue panel is open. The panel is inside the
sticky header and never closed itself; open on a 360×800 phone at 32px text it
made the header **taller than the viewport**, so scrolling changed nothing and
the app read as frozen. Capping the panel alone was not enough — the brand, tab
row and summary above it grow with the text size too, so the cap belongs on
`.site`. It also closes on tab change now. `syncStick()` tracks the capped
height correctly (verified 506/506 and 480/480).

Plus: the Venue & share link to the official program was the one outbound link
with no `target`/`rel`, so it navigated the app away and lost every open panel;
the toast sat above the modal and in landscape ate the tap on the download
button (`pointer-events: none`, re-enabled on `.toast-action`); the quick-note
and speaker note boxes are built while their panel is `hidden`, where
`scrollHeight` is 0, so autogrow pinned them to a 20px sliver (`min-height` is
the floor); the Notes tab told someone holding three starred sessions "No
notes yet"; the destructive action had three different names; `Export ↓` and
`Download .md` became `Save a copy` and `Save as a file`; the export hint named
a Share button that is hidden wherever `navigator.share` is missing; empty
states are announced through the always-present count live region rather than
a region that does not exist until it matters; the page had no `<h1>`; the skip
link moved the view but not focus; speaker chips named a session but never its
time; and the export timestamp used the device's timezone, not the event's.

### The test suite had a time bomb

`"no live badges outside the event day"` ran against the wall clock. That meant
it only tested anything on a non-event day — and went red the moment HST ticked
over into September 4, which is exactly when someone would run it. It pins its
own clock now. **This was not caused by any code change; it fired mid-session
at HST midnight and is worth remembering as a class of bug: a test whose
meaning depends on the date it runs.**

### Verification

- Smoke test **54/54** (was 48). Six new guards, all confirmed to fail with
  their fix reverted — proven, not assumed.
- Measured after fixing: tab row fits at 390/360 × 16/24/32px; header 60% of
  viewport with the panel open at both sizes; star 5.81:1 and glyph-distinct;
  `.utc` 6.39:1; dark danger confirm 7.11:1; Up Next 16.7/14.6; service worker
  survives a failed asset; Now and Up Next both badge at 10:40 HST.
- `CACHE_NAME` at **v6**.
- **Not** verified: anything on a real phone. Everything above is Chromium.

### Left for a human — content, not code

These are decisions, and inventing them would be worse than leaving them:

- **Plain-language `summary` lines for the seven teaching sessions.** The field
  exists and now renders on the face of the card; only the reception has one.
  This was the single highest-value change for a first-timer, and the sentences
  have to come from the organisers. Do not write them from the abstracts.
- **No speaker has a `bio`**, so tapping a name crosses to a card offering
  nothing the programme did not already show.
- **`data.js:86`** — the keynote abstract reads "the Internet in Hawaii", no
  ʻokina. It is transcribed verbatim from the official programme, so this is a
  question for the organiser, not a silent edit. Every other instance in
  `data.js` is correctly "Hawaiʻi". The reception `room` keeps the venue's
  postal spelling "Wahiawa" while the plain-language line says "Wahiawā".
- **`event.kicker`** ("Hawaiʻi School on Internet Governance") still renders
  nowhere; the header says only "HiSIG 2026".
- **Android back button** exits the app rather than stepping back through tabs.
  Deliberately not fixed the night before — it needs `pushState` plus real
  device testing, and getting it wrong strands people mid-conference.

## 2026-09-03 Typography, Mobile UX Pass, Privacy Disclaimer

Three things, in this order: a display face and a real type scale; a plain
statement that notes live only on the attendee's phone; then an audit of the
result on phone-sized screens and fixes for what it found.

### Typography

`fonts/vollkorn-var-subset.woff2` — Vollkorn, variable weight 400–900, 61 KB,
OFL. It is the display face: brand, headings, session titles, speaker names,
and the small-caps hour labels. Everything else — all body copy, every control
— stays on the device's own sans. **Read `fonts/README.md` before touching
this.** It has the provenance, the exact subsetting command, and the reason.

The reason is Hawaiian orthography, and it is the thing to remember here:

- **Fraunces has no U+02BB glyph at all.** Google Fonts' CSS declares the
  ʻokina in its `latin` unicode-range, but the glyph is not in the font — the
  browser silently substitutes another face for that one character.
- **Literata has the glyph but shapes it wrong**, merging ʻokina into the
  letter after it. "Hawaiʻi" rendered as "Hawaiï". This was seen in a browser
  screenshot, not inferred.
- Vollkorn renders the ʻokina and all five kahakō vowels correctly, verified
  in Chromium.

Test any replacement against `Hawaiʻi`, `ʻĀina`, `Waimānalo`, `kuleana` on a
real screen. A font's character map is not enough — Literata passed that check
and still failed.

Self-hosted rather than linked from fonts.googleapis.com, deliberately: a font
request to a third party on every page load contradicts the app's own claim
that nothing about an attendee leaves their phone, and it would break offline
mode. The file is precached by `sw.js`.

**Note for a future event:** today's `data.js` happens to keep its Hawaiian
text in sans-rendered elements (`location`, `venue.notes`, `credit`, a speaker
`org`). The moment a session title or a speaker's name carries an ʻokina or a
kahakō, it lands in the display face — which is what the font choice above was
made for. The subset covers Latin + Latin Ext-A only; a Japanese, Korean,
Vietnamese or Cyrillic name will fall back per-glyph.

Sizes now come from a `--t-*` scale in `:root`. The old design had session
titles at 1.02rem against 1rem body copy with everything else between .86 and
.92 — different sizes, no hierarchy. Change the scale there, not per-rule.

`event.tagline` moved out of the sticky header into the programme as a
`.masthead` line. It was costing a third row of sticky height on every screen
of every tab to repeat the same seven words. The header is now shorter than
before despite a much larger wordmark.

### The privacy disclaimer

The Notes tab leads with a `.privacy` callout saying both halves: nobody else
can read these, and precisely because of that, nothing backs them up.

The part worth preserving if this gets rewritten: **it does not depend on
anyone opening the Notes tab.** Attendees star and type all day from programme
cards; someone can fill the app and never look at Notes. So the first note
saved from anywhere gets a different toast — "Saved on this phone only —
export before you go". It counts notes rather than storing a "seen" flag, so
someone who clears everything and starts over is told again.

### Mobile UX pass

A subagent drove the app at 320, 360, 390, 430 and 844×390 landscape and
reported 17 findings; each was re-verified here before and after fixing. Two
could have cost an attendee their notes:

1. **A pasted URL broke the whole app.** `.note-text` had `pre-wrap` but not
   `overflow-wrap`, so one unbroken string gave the document horizontal
   overflow — Chromium shrank a 390px viewport out to 543px and stayed that
   way until the note was deleted. Guarded there and in every other box where
   attendee or `data.js` text lands.
2. **Opening a modal threw you to the top of your notes.** `body.locked` was
   `overflow: hidden`, which collapses the viewport's scroll range and clamps
   the offset to 0. Now `position: fixed` with the offset pinned to `top` and
   restored on close.

Also fixed: per-tab scroll memory (tabs used to reset all three panels to the
top); 20px-tall speaker links in session cards; a search placeholder truncated
at 390px that also advertised "rooms" this programme does not have; the star
at 1.28:1 contrast with no tap feedback; the count pill breaking the tab row
at 320px; export actions off-screen in landscape; undo on note delete; auto-
growing note boxes; a measured `--stick`; a focus trap; honest empty states;
a reduced-motion landing cue; and the horizontal safe-area inset.

**`--stick` is now measured by `syncStick()` in app.js**, re-measured on
resize and after the font swaps in. The literal in `:root` is only the
pre-JS fallback. Do not hard-code it again — the old 112px matched no width.

### Verification

- Smoke test **41/41**, unchanged and unmodified — no test was relaxed to make
  a fix pass.
- Plus 21 targeted regression checks written for this pass (scroll restore,
  overflow at 320/390, header height at three viewports, landscape export
  reachability, undo, focus trap, placeholder fit). Those live in the session
  scratchpad, not the repo; fold them into `smoke.mjs` if you want them kept.
- `CACHE_NAME` is at **v4** (was v3). One bump covers this whole batch, since
  v4 has not been served from `main` before now.
- **Not** verified: anything on a real phone, and the two iOS-only items —
  `88dvh` behaviour with the keyboard up, and the horizontal safe-area inset
  in landscape on a notched device. Both are reasoned fixes, not measured
  ones. Chromium cannot reproduce either.

### Left alone on purpose

- `--accent` is still `#1f4fd8` and does not match the logo. Restyling the
  colour is a decision, not a defect — the sampled brand colours are listed
  further down this file.
- `event.kicker` ("Hawaiʻi School on Internet Governance") is in `data.js` and
  rendered nowhere. It would sit naturally in the masthead, but adding it is a
  content call.
- Everything under "Still Needs Human Confirmation Before The Event" below.

## 2026-09-03 Repo Split Out Of KSEDTECH-26, Then Program Links + Branding

Four things happened, in this order.

**1. The app moved here from `lpcode808/KSEDTECH-26`.** It had been living in a
`hisig-site/` subfolder on the branch `claude/conference-website-staging-b85n5f`
there. `git subtree split -P hisig-site` rewrote that folder's 3 commits with
their paths at the repo root, so `cf45dea..ec89a30` keep their original authors
and messages. The resulting root tree hash was verified identical to the
original `hisig-site/` tree (`a8e2cc8`), so nothing was retyped or lost.

Deliberately left behind in KSEDTECH-26: the CONNECT26 site at that repo's root,
`assets/img/` (28 images), `conference-skeleton-export/`, `scraped/`, `_docs/`.
None of it was referenced from inside `hisig-site/`. The source branch was
**not** deleted — it still exists in KSEDTECH-26 as a fallback.

**2. Official program hyperlinks were wired in** (`974d10c`), from a link
extraction of <https://www.hisig.org/program/> supplied by the user. See
"Where The Links Came From" below.

**3. Live URL + build credit** (`c24d535`). GitHub Pages was switched on, and a
`event.credit` field now renders a TechZone credit in the site footer.

**4. Favicon** (`daf368b`). The placeholder blue document icon was replaced with
the HiSIG globe mark, cropped from the official logo.

## What This Repo Is

A mobile-first static program companion for **HiSIG 2026** (Hawaiʻi School on
Internet Governance) — *Navigating Global Digital Governance*, Friday
September 4, 2026, at Servpac in Mililani, Hawaiʻi.

No build step, no framework, no backend, no dependencies in the shipped site.
Everything an attendee types stays in their own browser's `localStorage`;
nothing is uploaded anywhere.

## Live Site And Deploy

- Live at <https://lpcode808.github.io/HISIG-26/>
- GitHub Pages, **Deploy from a branch** → `main` → `/ (root)`
- Default branch is `main`
- Push to `main` and the site updates in a minute or two. There is no workflow
  and no build; Pages serves the files as they sit in the repo.
- Every path in the app is **relative**, which is what lets it work from the
  `/HISIG-26/` project subpath. Do not introduce root-absolute paths like
  `/app.js` — they resolve to `lpcode808.github.io/app.js` and 404.

## Core Files

- `data.js` — **all content.** The only file you edit to change the program or
  launch a different event. Field documentation is in the comment block at the
  top of the file. Everything below is driven from here.
- `index.html` — markup only, no content decisions.
- `styles.css` — theme and layout. All color is custom properties in the
  `:root` block at the top; dark mode derives from the same properties.
- `app.js` — all behavior.
- `sw.js` — offline cache.
- `smoke.mjs` — headless end-to-end test, 41 checks.
- `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`,
  `icon-512.png`, `icon-maskable-512.png`, `manifest.webmanifest`

## Conventions That Will Bite You If Ignored

1. **Bump `CACHE_NAME` in `sw.js` whenever a precached file changes.** Currently
   `hisig26-v3`. Skip this and returning visitors keep serving the old copy out
   of cache until the next revalidation. `sw.js` says so at the top too.
2. **Run the smoke test before pushing.** It catches broken cross-navigation and
   console errors that are invisible on a casual click-through.
3. **Content goes in `data.js`, nowhere else.** Resist putting a string in
   `index.html`; the whole design premise is that one file is the content
   source of truth.
4. **`event.storagePrefix` namespaces the `localStorage` keys** (`hisig26`).
   Change it for a different event, or two conferences on the same domain will
   show each other's notes.
5. Times in `data.js` are **plain display strings rendered verbatim** so they
   match the official schedule exactly. The clock is only consulted for the
   NOW / Up Next badge, which reads the separate `start24`/`end24` fields. A
   session without those simply never gets a badge — it still renders.

## Running It

    npm run serve      # or: python3 -m http.server 4180
    # then http://127.0.0.1:4180/

Opening `index.html` straight off the filesystem also works; only the service
worker sits out, which is intentional.

    npm run serve      # in one shell
    npm test           # in another

## Environment Gotchas (Claude Code On The Web)

These cost time in this session; they are properties of the sandbox, not the
code.

- **Playwright**: Chromium is pre-installed. Run the test as
  `CHROME_PATH=/opt/pw-browsers/chromium node smoke.mjs`. Do **not** run
  `playwright install`.
- **Egress proxy blocks `github.io` and `hisig.org`.** The live site could not
  be loaded from inside the sandbox to verify it, and hisig.org could never be
  scraped — which is why all content was transcribed from pasted text instead.
  Expect to ask the user to confirm anything that requires loading the real
  page.
- **No lockfile is tracked.** `playwright` is a devDependency for the smoke test
  only; `npm install` generates a `package-lock.json` that is intentionally not
  committed. Delete it before committing, or it lands in the diff.

## Where The Links Came From

The links in `data.js` were extracted from <https://www.hisig.org/program/> on
September 3, 2026 and supplied by the user as a markdown list. They are not
guesses. Three judgment calls are baked in:

- **`speaker.url`** is whatever destination the program page attached to that
  person — an org homepage, a faculty bio, a conference profile, a LinkedIn.
  It is not uniformly "their bio page." 15 of 16 speakers have one; **Burt Lum
  is not hyperlinked on the source page**, so his affiliation renders as plain
  text. That is correct, not an omission.
- **`100thfilm.com` redirects to `100thfilm.org`**, so the `.org` URL is used
  directly.
- **The program page's footer links were deliberately not carried over.** Team,
  History, Careers, Privacy Policy, Terms and Conditions, Contact Us, Facebook,
  Instagram and Twitter/X all resolve back to the program page itself on the
  live site. There is nothing to point at yet. If those pages get built, they
  belong in `data.js`.

## Still Needs Human Confirmation Before The Event

Carried forward from the original build and **not yet resolved.** Content was
transcribed from pasted text, not scraped, so check against the official
program:

- The **Indigenous Knowledge** session lists a `Moderator:` label with no name
  in the source. Currently omitted.
- **4:00–4:30 pm is unaccounted for** between the last panel and the reception.
  Rendered as a gap; presumably travel to Wahiawā.
- The **Pau Hana Reception is at a different venue** (604 Clubhouse, Wahiawā,
  about a 15 minute drive). Called out on the card, but worth making louder if
  attendees will drive.
- **No registration link** was in the source, so the Register button is hidden.
  Set `event.registerUrl` to reveal it.
- Several speakers have an organization but no title, as written in the source.
- Verify spelling of names and organizations, and **test once on a real phone.**

## Known Limitations / Open Items

- **The 512px icon is soft.** The supplied logo was only 75×75 px of actual
  mark, so `favicon.svg` embeds that raster rather than tracing it — a trace off
  75 pixels comes out blobbier than the original. Fine at favicon and
  home-screen sizes. If the vector original (`.ai`, `.eps`, `.svg`) or any
  larger export turns up, swap the `<image>` element in `favicon.svg` for real
  paths; that is the only change needed.
- **The site accent does not match the logo.** `--accent` is still `#1f4fd8`
  from the skeleton. Sampled brand colors, if anyone wants to align them:
  `#f0840c` orange, `#f0c000` gold, `#3cb43c` and `#78cc24` greens, `#306cc0`
  blue, `#00a8e4` cyan; the wordmark "Hi" is `#1496dc`. Nothing was restyled —
  this is an open decision, not an oversight.
- `manifest.webmanifest` `theme_color` is likewise still `#1f4fd8`.

## Assumptions Baked In

- Single-day event. `DATA.days` has one entry, and the day-tab bar hides itself
  rather than showing one lonely tab. Adding a second day should just work, but
  is untested.
- No session declares a `track`, so the track filter removes itself. Same
  situation — supported, untested here.
- Notes and stars are **per-device and per-browser** by design. There is no
  account, no sync, and no server. An attendee who switches phones loses them.
  The UI says so.
- Attendee-facing copy is deliberately plain-language.

## Safe To Change

- Layout, typography, section ordering
- Color tokens in the `:root` block
- Componentization or a framework port
- Icon artwork

## Should Stay Stable Unless Reconfirmed With The User

- Conference name, date, timezone (`Pacific/Honolulu`), venue and address
- Session titles, times, and the official abstracts — these are transcribed
  from the official program and match it verbatim
- Speaker names, titles, organizations, and their link destinations
- Sponsor credit lines (Internet Society, Servpac, ID8)
- `event.storagePrefix`

## Verification State As Of `daf368b`

- Smoke test: **41/41 passing.**
- Every declared icon and manifest entry returns 200; `favicon.svg` decodes in
  a real browser.
- Checked: no horizontal overflow at 390px, touch target sizes, no console
  errors, UTC conversion correctness, and the NOW badge with the clock moved to
  11:00 HST on event day.
- **Not** verified from inside the sandbox: the live GitHub Pages site (egress
  blocked) and any behavior on a real phone.

## Next Steps

**Intentionally left open.** The user has their own priorities for this and
will bring them into a fresh session. Do not invent a roadmap here.

The unresolved items that are known to exist are the two lists above:
"Still Needs Human Confirmation Before The Event" and "Known Limitations /
Open Items". Ask before acting on them — several are decisions
(accent color, how loudly to flag the reception venue), not defects.
