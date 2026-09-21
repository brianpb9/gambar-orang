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
| `game.js` | Trace coverage, pointer/stylus, color fill, i18n, audio |
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

**Steps (6-7 per character):** Kepala -> Mata & senyum -> Rambut -> Baju ->
Tangan -> Kaki & sepatu (plus Pita / Overall where relevant).

**Flow:** Trace all steps (>=72% guide coverage, generous hit radius) ->
**Warnai** (tap region + palette) -> **Hebat!** card.

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

## UI language

Default Indonesian; top-right **EN** / **ID** toggle.
