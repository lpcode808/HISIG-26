# Conference Program App

Mobile-first static conference companion. No build step, no framework, no
backend. Ported from `conference-skeleton-export/`, but split into separate
files instead of one 6,000-line HTML document.

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
- **NOW / Up Next** badges during the event, resolved in the event's IANA
  timezone so they stay right across DST.
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

27 checks covering search, filters, stars, note save/persist/delete,
cross-navigation, export contents, the destructive-action guard, mobile
layout, touch-target sizes, and console errors.

## Status

**Program content is placeholder.** The source page
(https://www.hisig.org/program/) is blocked by this environment's network
egress policy, so real content has not been filled in. Swapping it in is a
`data.js` edit.

## Before publishing

The skeleton's review list still applies: verify session order and times,
timezone, room names, and speaker spelling/titles/organizations against the
official program, and test once on a real phone.
