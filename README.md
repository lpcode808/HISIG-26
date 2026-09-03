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
    styles.css    theme + layout; all color is custom properties at the top
    data.js       ALL content — the only file you edit per event
    app.js        behavior
    sw.js         offline cache
    smoke.mjs     headless end-to-end test
    manifest.webmanifest, favicon.svg

## What attendees get

- **Program** — day tabs, live search, track filter, sessions grouped by start
  time. Tap a speaker name to jump to their profile.
- **Save (★)** sessions and speakers, then filter to just those.
- **Notes** on any session or speaker, plus untethered quick notes. All notes
  live in `localStorage` on that person's own device — nothing is uploaded.
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

## Test

    npm run serve            # in one shell
    npm test                 # in another

40 checks covering search, filters, stars, note save/persist/delete,
cross-navigation, export contents, the destructive-action guard, mobile
layout, touch-target sizes, console errors, UTC conversion, outbound links,
and the live badge — including one run with the clock moved to 11:00 HST on
event day to confirm NOW lands on the right session.

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
