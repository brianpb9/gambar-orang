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
| `characters.js` | 3 characters, step paths, fill regions, palettes |
| `game.js` | Trace coverage, pointer/stylus, color fill, i18n, audio |
| `manifest.webmanifest` | Standalone theme |
| `preview/` | Screenshots |

## Characters & steps

1. **Cewek kuncir** (9): Kepala → Kuncir kiri → Kuncir kanan → Rambut depan → Wajah → Badan/baju → Tangan → Kaki → Sepatu  
2. **Cowok** (8): Kepala → Rambut → Telinga → Wajah → Baju → Tangan → Celana & kaki → Sepatu  
3. **Cewek topi** (6): Topi → Kepala → Rambut → Wajah → Baju & tangan → Kaki & sepatu  

**Flow:** Trace all steps (≥72% guide coverage, generous hit radius) → **Warnai** (tap region + palette) → **Hebat!** card.

## UI language

Default Indonesian; top-right **EN** / **ID** toggle.
