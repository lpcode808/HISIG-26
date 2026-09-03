# Agent Handoff

Newest entry first. Append a dated section when you finish a body of work.

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
