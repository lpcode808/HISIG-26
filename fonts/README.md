# fonts/

`vollkorn-var-subset.woff2` — **Vollkorn**, a variable serif (weight axis
400–900) by Friedrich Althausen, licensed under the SIL Open Font License 1.1
(`OFL.txt`). It is the display face: brand, headings, session titles, speaker
names, and the small-caps time labels. Body text and every control stay on the
device's own sans, which costs nothing to load.

**Self-hosted on purpose.** Linking to fonts.googleapis.com would send every
attendee's browser to a third party on page load, which contradicts the app's
whole pitch that nothing about them leaves their phone. It would also break
offline mode. So the file ships here and is precached by `sw.js`.

## How it was built

Subset from the upstream variable TTF
(`google/fonts/ofl/vollkorn/Vollkorn[wght].ttf`) with `fontTools`:

    python3 -m fontTools.subset Vollkorn.ttf \
      --unicodes=U+0020-007E,U+00A0-00FF,U+0100-017F,U+02BB-02BC,\
    U+2010-2015,U+2018-201D,U+2026,U+00D7,U+2212,U+2192,U+2605,U+2606,U+00B7,U+2022 \
      --flavor=woff2 --no-hinting --desubroutinize \
      --layout-features=kern,liga,calt,ccmp,locl,rlig,rvrn,mark,mkmk,\
    smcp,c2sc,case,lnum,onum,tnum,pnum,frac,sups \
      --output-file=vollkorn-var-subset.woff2

61 KB. The character range is **Basic Latin + Latin-1 + Latin Extended-A +
U+02BB–02BC**, which covers every Hawaiian word the program uses: the ʻokina
(U+02BB) and all five kahakō vowels (ā ē ī ō ū / Ā Ē Ī Ō Ū) are present and
were verified rendering in Chromium, not assumed.

`smcp`/`c2sc` are kept because the time labels use real small caps
(`font-variant-caps: all-small-caps`), not faked uppercase. They are most of
the ~19 KB above a features-stripped subset; that was a deliberate trade.

## If you launch a different event

A name outside Latin Extended-A — Japanese, Korean, Vietnamese tone marks,
Cyrillic — has no glyph here and the browser will silently substitute the
device's own serif for those characters only. The line still reads, but it
will look off. Re-run the command above with the extra ranges added if that
comes up.

## Why not Fraunces or Literata

Both were tried first and both failed on Hawaiian orthography. Fraunces has no
U+02BB glyph at all. Literata has one, but its shaping merges ʻokina into the
following letter — "Hawaiʻi" rendered as "Hawaiï". Check any replacement face
against `Hawaiʻi`, `ʻĀina`, `Waimānalo` and `kuleana` on a real screen before
swapping it in.
