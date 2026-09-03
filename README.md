# Conference Program Site (staging)

Minimal static conference program page: four files, no build step, no
dependencies, no framework.

    index.html   structure only
    styles.css   theme + layout (all colors are custom properties at the top)
    data.js      ALL content — this is the only file you edit per event
    script.js    day tabs, search, track filter, rendering

## Run it

    python3 -m http.server 4180
    # http://127.0.0.1:4180/hisig-site/

## Launch a new event

Edit `data.js` only:

- `DATA.event` — name, dates, location, venue, registration + official URLs
- `DATA.days` — one entry per program day (`id` is referenced by sessions)
- `DATA.sessions` — the program; see the field notes at the top of the file
- `DATA.speakers` — optional; drop the array and the section hides itself

Times are plain strings rendered verbatim, so they match the official schedule
exactly — there is no timezone math to get wrong. Sessions sharing a `start`
value are grouped into one time slot automatically. Tracks populate the filter
dropdown automatically; if no session has a `track`, the filter hides itself.

Theme: change `--accent`, `--ink`, and `--bg` in `styles.css`. Dark mode is
derived from the same properties under `prefers-color-scheme`.

## Status

The program content is placeholder. The source page
(https://www.hisig.org/program/) is blocked by this environment's network
egress policy, so real content has not been filled in yet.

## Checked

Rendered in headless Chromium at 390px and 1280px: no console errors, no
horizontal overflow, day tabs / search / track filter / details all working.
