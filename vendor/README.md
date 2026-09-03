# vendor/

`qrcode.js` — [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)
by Kazuhiko Arase, v1.4.4, MIT licensed (license header is in the file).
Draws the "scan to open this page" QR code in the Venue toggle.

**Self-hosted on purpose**, same reasoning as `fonts/`: a CDN script would send
every attendee's browser to a third party on page load and would break offline
mode. It ships here instead and is precached by `sw.js`.

Unmodified from upstream except this file's own comment header — if you need
a newer version, drop in `qrcode.js` from a fresh `npm pack qrcode-generator`.
