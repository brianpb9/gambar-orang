# Gambar Orang — Langkah demi langkah

Kindergarten people-tracing + coloring game for iPad/tablet + stylus (puplen).

## Open on iPad

1. Copy the whole `gambar-orang` folder to a Mac/PC, or host it on any static server / AirDrop the folder.
2. Easiest local: on the same Wi‑Fi, from this folder run:
   ```bash
   python3 -m http.server 8765
   ```
3. On the iPad Safari, open `http://<your-computer-ip>:8765/`
4. Optional: Share → **Add to Home Screen** for app-like fullscreen (`apple-mobile-web-app-capable`).

You can also open `index.html` via Files app if Safari allows local file access; HTTP serve is more reliable for fonts/audio.

## Files

| File | Role |
|------|------|
| `index.html` | Shell + PWA meta |
| `styles.css` | Tablet-first UI |
| `characters.js` | 4 chibi kids — shared body, step paths, fill regions, palettes |
| `game.js` | Per-line guiding, trace scoring, stylus/palm handling, colour fill, i18n, audio |
| `manifest.webmanifest` | Standalone theme |
| `preview/` | Screenshots |

## Characters & steps

Chibi kids drawn on a 400x520 design grid with real child proportions: the head
is about a third of the figure, the eyes sit in the lower half of the face, the
shoulders are narrower than the head, and the arms and legs taper properly.

1. **Cewek ekor** — brown hair with a high ponytail and yellow tie, yellow tee, blue trousers, grey shoes
2. **Cowok** — soft tousled dark hair, green tee, blue shorts, brown shoes
3. **Cewek pita** — dark bob with a pink side bow, pink A-line dress with a scalloped hem, pink shoes
4. **Cewek overall** — brown twin buns, yellow tee under blue dungarees, brown shoes

**One line at a time.** A step is never handed over as a bundle of shapes. Each
step is split into single pen movements and the game guides them in order, so
the head goes *Dagu → Atas kepala → Telinga kiri → Telinga kanan* and the face
goes *Mata kiri → Mata kanan → Senyum → Pipi kiri → Pipi kanan*. Only the line
being drawn is highlighted; the rest of the step sits behind it as a faint
preview, and an orange dot marks where to put the pen down. The header shows
`Langkah 3/6` plus `garis 1/4` and the name of the line. Roughly 24-29 guided
lines per character.

**A line has to be traced properly to count.** Three tests, all of which must
pass, so a child cannot finish a shape by covering part of it or scribbling
over it:

| Test | Threshold | Catches |
|------|-----------|---------|
| Coverage | 93% of the line | stopping half way |
| Accuracy | 70% of the reported pen points within 16 units of the guide | drifting or zigzagging off the line |
| Sweep direction | 70% of the line filled in one direction | scribbling back and forth |

Accuracy is measured only on the points the device actually reports, never on
the interpolated ones in between — otherwise a zigzag across the guide scores
well, because the filled-in segments keep crossing it. The sweep test is
skipped on shapes shorter than eight hit radii (a cheek, a hair tie), where one
dab of the pen reaches most of the line and the order means nothing.

A stroke that wanders off the guide is rolled back and earns nothing. A neat
stroke that stops short keeps its progress so the child can carry on.

**Stylus.** Pointer events are read at the full stylus sample rate via
`getCoalescedEvents()`, and while the pen is in use fingers are ignored for
1.5s — palm rejection. After that window a finger works normally, so the game
is still playable without a stylus.

**Flow:** Trace every line -> **Warnai** (tap region + palette) -> **Hebat!** card.

### Editing the artwork

`characters.js` builds every path from helpers (`ell` for ellipses, `mir` to
mirror around the centre line x=200) on top of one shared body, so a change to
the head or the arms applies to all four kids. Two rules keep it rendering
correctly:

- Only absolute `M` / `L` / `C` / `Q` / `Z` — that is all the parser in
  `game.js` understands.
- Subpaths inside a single `fillRegion` must not overlap each other: the canvas
  fills with `evenodd`, so an overlap punches a hole. Overlap between two
  *different* regions is fine — the later one simply paints on top.
- Every entry in `steps[].paths` is one guided line, `{d, labelId, labelEn}`.
  Keep each one a single pen movement a five-year-old can finish without
  lifting, and give it a name they will recognise — the label is read out in
  the header as the instruction.

## UI language

Default Indonesian; top-right **EN** / **ID** toggle.
