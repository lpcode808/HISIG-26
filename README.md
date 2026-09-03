# HiSIG 2026 Program App

**Live site: https://lpcode808.github.io/HISIG-26/**

Made at the [TechZone](https://www.hawaiischoolforgirls.org/academics/techzone)
at Hawaiʻi School for Girls at La Pietra.

Picking this up cold? Start with [AGENT_HANDOFF.md](AGENT_HANDOFF.md) — repo
provenance, conventions that matter, and what still needs human confirmation.

Mobile-first static conference companion for HiSIG 2026 — *Navigating Global
Digital Governance*, Friday September 4, 2026, Mililani, Hawaiʻi. No build
step, no framework, no backend. Ported from the conference skeleton in
`lpcode808/KSEDTECH-26`, but split into separate files instead of one
6,000-line HTML document.

    index.html    app shell (markup only)
    styles.css    theme, type scale + layout; both live in custom properties at the top
    data.js       ALL content — the only file you edit per event
    app.js        behavior
    sw.js         offline cache
    smoke.mjs     headless end-to-end test
    fonts/        the self-hosted display face, its license and its provenance
    manifest.webmanifest, favicon.svg

## What attendees get

- **Program** — day tabs, live search, track filter, sessions grouped by start
  time. Tap a speaker name to jump to their profile.
- **Save (★)** sessions and speakers, then filter to just those.
- **Notes** on any session or speaker, plus untethered quick notes. All notes
  live in `localStorage` on that person's own device — nothing is uploaded.
  The Notes tab says so plainly, and the first note anyone saves — from
  anywhere in the app — gets a toast telling them to export before they go,
  because plenty of attendees will never open the Notes tab at all.
- **Notes tab** — search across everything saved, jump back to the source
  session, delete individually.
- **Export** — copy, iOS share sheet (`navigator.share`), or download a
  Markdown file that also lists saved sessions.
- **Clear all** — requires typing `delete all`, since it is irreversible.
- **NOW / Up Next** badges, resolved in the event's IANA timezone. They only
  appear on an actual event day — otherwise "Up Next" would sit on the first
  session for months.
- **UTC times** shown beside HST on every session, derived from the HST time
  rather than transcribed, so the two cannot drift.
- **Works offline** after the first visit; installable to a phone home screen.

## Run it

    npm run serve      # or: python3 -m http.server 4180
    # http://127.0.0.1:4180/

Opening `index.html` directly from the filesystem also works — only the
service worker sits out, which is intentional.

## Launch a new event

Edit `data.js`, nothing else:

- `DATA.event` — name, dates, location, venue, registration + official URLs,
  `timeZone` (IANA), and `storagePrefix`
- `DATA.days` — one per program day; `date` (ISO) anchors the live badge
- `DATA.sessions` — the program; field notes are at the top of the file
- `DATA.speakers` — matched to sessions by name

Then bump `CACHE_NAME` in `sw.js`, or returning visitors keep the old copy
until the next revalidation.

**Change `storagePrefix` for each event.** It namespaces the `localStorage`
keys; if two conferences share a prefix on the same domain, attendees see one
event's notes inside the other.

Times are plain display strings rendered verbatim, so they match the official
schedule exactly. The clock is only consulted for the NOW / Up Next badge,
which reads `start24`/`end24` — a session without those simply never gets a
badge.

Theme: change `--accent`, `--ink`, `--bg` in `styles.css`. Dark mode derives
from the same properties.

## Typography

Two families with separate jobs, both declared at the top of `styles.css`:

- `--font-display` — **Vollkorn**, self-hosted from `fonts/`. Brand, headings,
  session titles, speaker names, and the small-caps hour labels.
- `--font-ui` — the device's own sans. Body copy and every control. Costs
  nothing to load.

Sizes come from the `--t-*` scale in `:root`; change them there rather than
per-rule. Keep the display face off buttons, inputs and metadata — the
contrast between the two families is the design, and it stops meaning anything
if the serif is everywhere.

**Before swapping the display face, read `fonts/README.md`.** The current one
was chosen on Hawaiian orthography, not looks: Fraunces has no ʻokina glyph,
and Literata's shaping merges the ʻokina into the next letter, so "Hawaiʻi"
came out as "Hawaiï". Test any replacement against `Hawaiʻi`, `ʻĀina`,
`Waimānalo` and `kuleana` on a real screen.

The font is precached by `sw.js`, so **bump `CACHE_NAME` if you change it**,
same as any other precached file.

## Test

    npm run serve            # in one shell
    npm test                 # in another

48 checks covering search, filters, stars, note save/persist/delete,
cross-navigation, export contents, the destructive-action guard, mobile
layout, touch-target sizes, console errors, UTC conversion, outbound links,
and the live badge — including one run with the clock moved to 11:00 HST on
event day to confirm NOW lands on the right session.

The last seven are regression guards for bugs that were live and invisible on
a casual click-through: a pasted URL overflowing the page, a modal losing your
scroll position or failing to lock the page behind it, `--stick` drifting from
the real header height, and — at 320px — the note-count pill growing the
header, the search placeholder being clipped, and horizontal overflow. Each
was confirmed to fail with its fix reverted, so they are not decoration.

## Deploy

GitHub Pages serves this repo from the root of `main`. Push to `main` and the
live site updates a minute or two later; there is no build step or workflow.

Every path in the app is relative, so it works from a project subpath
(`/HISIG-26/`) as well as from a domain root.

## Needs human confirmation before publishing

Content was transcribed from pasted text, not scraped (hisig.org is blocked by
this environment's network egress policy). Check against the official program:

- The **Indigenous Knowledge** session lists a `Moderator:` label with no name
  in the source. Currently omitted.
- **4:00–4:30 pm is unaccounted for** between the last panel and the reception.
  Rendered as a gap; presumably travel to Wahiawā.
- The **Pau Hana Reception is at a different venue** (604 Clubhouse, Wahiawā).
  Called out on the card, but worth making louder if attendees will drive.
- **No registration link** was in the source, so the Register button is hidden.
  Set `event.registerUrl` to show it.
- Speaker titles and organizations are as written in the source; several
  speakers have an organization but no title.
- Verify spelling of names and organizations, and test once on a real phone.
