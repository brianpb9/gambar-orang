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
| `characters.js` | Shared chibi body, hair and outfits, 9 characters + 2 scenes |
| `game.js` | Per-line guiding, trace scoring, stylus/palm handling, colour fill, i18n, audio |
| `manifest.webmanifest` | Standalone theme |
| `preview/` | Screenshots |

111 cards in all, 537 guided lines.

## Pictures

Three levels, shown as bands on the picking screen.

**Teman — nine single characters** (400x520 grid), chibi proportions: the head
is about a third of the figure, the eyes sit in the lower half of the face, the
shoulders are narrower than the head, and the arms and legs taper properly.

| | |
|---|---|
| Cewek ekor | high ponytail and yellow tie, tee, trousers |
| Cowok | tousled hair, tee, shorts |
| Cewek pita | dark bob, pink side bow, A-line dress |
| Cewek overall | twin buns, tee under dungarees |
| Ayah | adult hairline, collared shirt with buttons, trousers |
| Ibu | long hair falling to the shoulders, dress |
| Kakek | hair round the sides only, glasses |
| Nenek | bun on the crown, glasses, dress |
| Kucing | sitting cat: ears, whiskers, paws, tail |

**Keluarga — Foto keluarga** (820x482): Ayah, Ibu and two children side by side
under the sun, 42 lines.

**Pemandangan — Keluarga di taman** (900x540): the family with a cat, a tree, a
house, sun and cloud, 48 lines.

**Angka 1–100** — one card per number, banded ten at a time. Each digit is the
strokes a child is taught to write it with, in order and in the direction the
pen travels: 4 is "slant then across" and then the downstroke, 5 is "down then
belly" and then the top bar last. A digit is a step, so 47 is walked through as
*Angka 4* then *Angka 7* rather than handed over whole. These are skeletons,
not outlines — what is being practised is the path of the pen, so only the
numeral is traced. The board behind it is not: drawing a rectangle teaches
nothing and stood between the child and finishing each of the hundred cards.

A number card skips colouring entirely (`skipColour`) and goes straight to the
star: it is handwriting practice, not a colouring page. The board fills itself
in so the finished card still looks finished.

A card is 200 units wide per digit, so the tolerance (which follows the canvas)
keeps a 1 and a 100 feeling the same under the hand.

While tracing, the rest of the picture is ghosted in faintly — on a number
card that is what tells a child the 4 they are drawing is going to become a 47.

Every person in a scene is the same body as the single character, scaled and
moved onto the scene's ground line by `scenePerson`, and cut down to ten lines
so a picture with several people stays finishable. Scenes declare their own
`width`/`height`; the drawing tolerance grows with the canvas so a line feels
the same under the hand, capped so it cannot swallow a small prop whole.

**One line at a time.** A step is never handed over as a bundle of shapes. Each
step is split into single pen movements and the game guides them in order, so
the head goes *Dagu → Atas kepala → Telinga kiri → Telinga kanan* and the face
goes *Mata kiri → Mata kanan → Senyum*. The chin is a plain U and the neck is
drawn later with the clothes: a child builds the face first, and a chin that
already had a neck hanging off it was confusing. Only the line
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
| Accuracy | 70% of the reported pen points within the tolerance | drifting or zigzagging off the line |
| Sweep direction | 85% of the line filled in one direction, measured round the loop | scribbling back and forth |

Accuracy is measured only on the points the device actually reports, never on
the interpolated ones in between — otherwise a zigzag across the guide scores
well, because the filled-in segments keep crossing it.

The sweep test needs care, and most of the rules here exist because a
straightforward version of it rejected honest tracing:

- A sample only counts towards direction when the pen was **beside it on the
  line**. Where an outline folds back within the tolerance — the two sides of a
  leg — the far side is reached incidentally, and counting it made an honest
  trace read as a jumble.
- Position along the line is compared **round the loop**, so starting a closed
  shape part-way is not punished.
- The test is skipped on a line shorter than eight tolerances (a cheek, a hair
  tie), on one made of several strokes (six whiskers are filled stroke by
  stroke), and on one that folds back on itself — a fold being where the line
  returns within the tolerance after running at least a quarter of the way
  along, which is what tells a real fold from the teeth of the sun. On those,
  coverage and accuracy carry the line.

A stroke that wanders off the guide is rolled back and earns nothing. A shape
that ends up covered without being swept is reset. A neat stroke that stops
short keeps its progress so the child can carry on.

Checked by driving synthetic pen input over all 313 lines: honest tracing with
hand wobble is never rejected, while scribbling, stopping at 70% and a wide
zigzag are.

**Stylus.** Pointer events are read at the full stylus sample rate via
`getCoalescedEvents()`, and while the pen is in use fingers are ignored for
1.5s — palm rejection. After that window a finger works normally, so the game
is still playable without a stylus.

**Flow:** Trace every line -> **Warnai** (tap region + palette) -> **Hebat!**
card. Number cards go straight from the last line to **Hebat!**.

The finish card leads with **Lanjut ke <next>** so a child carries straight on
to the next number rather than repeating the one they just did; Ulangi and
Pilih lain sit beside it, and the button is hidden on the last card.

On a phone the palette takes a full-width row of its own; sharing the row with
the Done button turned it into a narrow column five rows tall that ate a third
of the screen and cropped the drawing.

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
  lifting, and give it a name they will recognise — the label is shown in the
  header as the instruction.
- `mir` mirrors a path around x=200, `xf` scales and moves one into a scene,
  `weld`/`chain` build a fill out of the very lines the child traces, so a
  colour region can never drift away from its outline.

## UI language

Default Indonesian; top-right **EN** / **ID** toggle.
