/**
 * Gambar Orang — character artwork.
 *
 * Design space 400 x 520, absolute M / L / C / Q / Z only (that is all the
 * parser in game.js understands).
 *
 * Proportions are a real chibi child, not a blob: head is ~1/3 of the figure,
 * eyes sit in the lower half of the face and take about a fifth of the head
 * width each, shoulders are narrower than the head, arms taper from a sleeve
 * to a hand, legs are separate columns standing on shoes.
 *
 * Two kinds of path live here:
 *   steps[].paths   — one guided line each: {d, labelId, labelEn}. The game
 *                     walks these ONE AT A TIME, so keep every entry a single
 *                     pen movement a five-year-old can finish without lifting.
 *   fillRegions[]   — closed silhouettes used for colouring.
 * Subpaths inside one fillRegion must never overlap each other: the canvas
 * fills with "evenodd", so an overlap would punch a hole.
 */
(function () {
  "use strict";

  const K = 0.5523; // circle -> cubic bezier constant
  const r1 = (v) => Math.round(v * 10) / 10;

  /** One guided line: the path plus the name the child is told to draw. */
  function pl(d, labelId, labelEn) {
    return { d: d, labelId: labelId, labelEn: labelEn };
  }

  /** Closed ellipse built from four cubic segments. */
  function ell(cx, cy, rx, ry) {
    const ox = rx * K;
    const oy = ry * K;
    return [
      "M " + r1(cx - rx) + " " + r1(cy),
      "C " + r1(cx - rx) + " " + r1(cy - oy) + " " + r1(cx - ox) + " " + r1(cy - ry) + " " + r1(cx) + " " + r1(cy - ry),
      "C " + r1(cx + ox) + " " + r1(cy - ry) + " " + r1(cx + rx) + " " + r1(cy - oy) + " " + r1(cx + rx) + " " + r1(cy),
      "C " + r1(cx + rx) + " " + r1(cy + oy) + " " + r1(cx + ox) + " " + r1(cy + ry) + " " + r1(cx) + " " + r1(cy + ry),
      "C " + r1(cx - ox) + " " + r1(cy + ry) + " " + r1(cx - rx) + " " + r1(cy + oy) + " " + r1(cx - rx) + " " + r1(cy),
      "Z",
    ].join(" ");
  }

  /**
   * Mirror a path around the figure centre line (x = 200).
   * Safe because every command we use (M/L/C/Q) takes plain x,y pairs.
   */
  function mir(d) {
    let i = 0;
    return d.replace(/-?\d*\.?\d+/g, function (m) {
      const v = parseFloat(m);
      const out = i % 2 === 0 ? 400 - v : v;
      i += 1;
      return String(r1(out));
    });
  }

  /**
   * Weld two traced lines into the closed shape they outline, so a fill region
   * can never drift away from the lines the child actually drew.
   */
  function weld(a, b) {
    return a + " " + b.replace(/^M\s+-?[\d.]+\s+-?[\d.]+\s*/, "") + " Z";
  }

  /* ─────────────────────── shared body ─────────────────────── */

  // The head is traced as four separate lines — chin first, the way the paper
  // tutorials teach it — but filled as one silhouette.
  const HEAD_CHIN =
    "M 119 179 C 129 199 155 213 184 216 " +
    "L 182 230 C 186 242 214 242 218 230 L 220 216 " +
    "C 246 213 271 199 281 179";
  const HEAD_CROWN =
    "M 114 147 C 113 142 112 138 112 132 " +
    "C 112 85.6 151.4 48 200 48 " +
    "C 248.6 48 288 85.6 288 132 " +
    "C 288 138 287 142 286 147";
  const HEAD_EAR_L = "M 119 179 C 114 185 103 185 98 173 C 92 157 100 140 114 147";
  const HEAD_EAR_R = "M 286 147 C 300 140 308 157 302 173 C 297 185 286 185 281 179";

  const HEAD =
    "M 200 48 " +
    "C 249 48 288 86 288 132 " +
    "C 288 138 287 142 286 147 " +
    "C 300 140 308 157 302 173 " +
    "C 297 185 286 185 281 179 " +
    "C 271 199 246 213 220 216 " +
    "L 218 230 " +
    "C 214 242 186 242 182 230 " +
    "L 184 216 " +
    "C 155 213 129 199 119 179 " +
    "C 114 185 103 185 98 173 " +
    "C 92 157 100 140 114 147 " +
    "C 113 142 112 138 112 132 " +
    "C 112 86 151 48 200 48 Z";

  const EYE_L = ell(167, 150, 15, 19);
  const EYE_R = ell(233, 150, 15, 19);
  const SHINE_L = ell(161, 142, 6.5, 6.5);
  const SHINE_R = ell(227, 142, 6.5, 6.5);
  const MOUTH = "M 186 178 Q 200 191 214 178";
  // Cheeks sit below the eyes and inside the jaw, never touching either.
  const BLUSH_L = ell(153, 185, 12.5, 7.5);
  const BLUSH_R = mir(BLUSH_L);

  // Eyes with the highlight punched out (evenodd) so the white shows through.
  const EYES_FILL = EYE_L + " " + EYE_R + " " + SHINE_L + " " + SHINE_R;
  const SHINE_FILL = SHINE_L + " " + SHINE_R;

  // Tee, traced as five short lines. The collar is not repeated here — the
  // head's chin line already drew it.
  const SLEEVE_L =
    "M 182 230 C 174 230 160 228 150 232 " +
    "C 133 243 125 259 123 275 " +
    "C 131 285 149 285 157 275";
  const SLEEVE_R =
    "M 218 230 C 226 230 240 228 250 232 " +
    "C 267 243 275 259 277 275 " +
    "C 269 285 251 285 243 275";
  const SHIRT_SIDE_L = "M 157 275 C 152 294 148 316 147 338";
  const SHIRT_SIDE_R = "M 243 275 C 248 294 252 316 253 338";
  const SHIRT_HEM = "M 147 338 L 253 338";

  const SHIRT =
    "M 182 230 " +
    "C 174 230 160 228 150 232 " +
    "C 133 243 125 259 123 275 " +
    "C 131 285 149 285 157 275 " +
    "C 152 294 148 316 147 338 " +
    "L 253 338 " +
    "C 252 316 248 294 243 275 " +
    "C 251 285 269 285 277 275 " +
    "C 275 259 267 243 250 232 " +
    "C 240 228 226 230 218 230 " +
    "C 214 242 186 242 182 230 Z";

  // A-line dress: same sleeves, longer sides, soft scalloped hem.
  const DRESS_SIDE_L = "M 157 275 C 149 300 139 330 133 356";
  const DRESS_SIDE_R = "M 243 275 C 251 300 261 330 267 356";
  const DRESS_HEM =
    "M 133 356 C 142 366 152 360 161 366 " +
    "C 170 372 180 362 190 368 " +
    "C 200 374 210 362 220 368 " +
    "C 230 374 240 362 249 366 " +
    "C 258 370 264 364 267 356";

  const DRESS =
    "M 182 230 " +
    "C 174 230 160 228 150 232 " +
    "C 133 243 125 259 123 275 " +
    "C 131 285 149 285 157 275 " +
    "C 149 300 139 330 133 356 " +
    "C 142 366 152 360 161 366 " +
    "C 170 372 180 362 190 368 " +
    "C 200 374 210 362 220 368 " +
    "C 230 374 240 362 249 366 " +
    "C 258 370 264 364 267 356 " +
    "C 261 330 251 300 243 275 " +
    "C 251 285 269 285 277 275 " +
    "C 275 259 267 243 250 232 " +
    "C 240 228 226 230 218 230 " +
    "C 214 242 186 242 182 230 Z";

  // Forearm + hand: down the outside, round the hand, back up the inside —
  // one continuous movement. The sleeve already drew the top edge.
  const ARM_L = "M 124 277 C 118 297 117 314 119 329 C 121 343 147 343 149 329 C 151 314 152 297 156 277";
  const ARM_R = mir(ARM_L);
  const ARM_L_FILL = ARM_L + " Z";
  const ARM_R_FILL = ARM_R + " Z";

  /** One leg column per line: down the outside, across the ankle, back up. */
  function legs(top) {
    const y1 = r1(top + (450 - top) * 0.35);
    const y2 = r1(top + (450 - top) * 0.72);
    const t = r1(top);
    const traceL =
      "M 163 " + t + " C 158 " + y1 + " 159 " + y2 + " 164 450 " +
      "L 194 450 C 195 " + y2 + " 196 " + y1 + " 195 " + t;
    const traceR = mir(traceL);
    return {
      traceL: traceL,
      traceR: traceR,
      fill: traceL + " Z " + traceR + " Z",
    };
  }

  const SHOE_L =
    "M 156 440 L 190 440 C 194 452 196 462 196 468 " +
    "C 196 474 190 477 182 477 L 160 477 " +
    "C 152 477 148 471 148 462 C 148 452 152 446 156 440 Z";
  const SHOE_R = mir(SHOE_L);
  const SHOES = SHOE_L + " " + SHOE_R;

  /* ─────────────── step builders shared by every character ─────────────── */

  function headStep() {
    return {
      id: "head",
      labelId: "Kepala",
      labelEn: "Head",
      paths: [
        pl(HEAD_CHIN, "Dagu", "Chin"),
        pl(HEAD_CROWN, "Atas kepala", "Top of head"),
        pl(HEAD_EAR_L, "Telinga kiri", "Left ear"),
        pl(HEAD_EAR_R, "Telinga kanan", "Right ear"),
      ],
    };
  }

  function faceStep() {
    return {
      id: "face",
      labelId: "Wajah",
      labelEn: "Face",
      paths: [
        pl(EYE_L, "Mata kiri", "Left eye"),
        pl(EYE_R, "Mata kanan", "Right eye"),
        pl(MOUTH, "Senyum", "Smile"),
        pl(BLUSH_L, "Pipi kiri", "Left cheek"),
        pl(BLUSH_R, "Pipi kanan", "Right cheek"),
      ],
    };
  }

  function armsStep() {
    return {
      id: "arms",
      labelId: "Tangan",
      labelEn: "Arms",
      paths: [
        pl(ARM_L, "Tangan kiri", "Left arm"),
        pl(ARM_R, "Tangan kanan", "Right arm"),
      ],
    };
  }

  function shirtStep(labelId, labelEn) {
    return {
      id: "shirt",
      labelId: labelId,
      labelEn: labelEn,
      paths: [
        pl(SLEEVE_L, "Lengan baju kiri", "Left sleeve"),
        pl(SLEEVE_R, "Lengan baju kanan", "Right sleeve"),
        pl(SHIRT_SIDE_L, "Sisi kiri", "Left side"),
        pl(SHIRT_SIDE_R, "Sisi kanan", "Right side"),
        pl(SHIRT_HEM, "Ujung baju", "Hem"),
      ],
    };
  }

  function legsStep(lg, labelId, labelEn) {
    return {
      id: "legs",
      labelId: labelId,
      labelEn: labelEn,
      paths: [
        pl(lg.traceL, "Kaki kiri", "Left leg"),
        pl(lg.traceR, "Kaki kanan", "Right leg"),
        pl(SHOE_L, "Sepatu kiri", "Left shoe"),
        pl(SHOE_R, "Sepatu kanan", "Right shoe"),
      ],
    };
  }

  /** Face regions shared by every character, always last so taps land on them. */
  function faceRegions() {
    return [
      { id: "shine", labelId: "Kilau mata", labelEn: "Eye shine", path: SHINE_FILL, defaultColor: "#FFFFFF" },
      { id: "eyes", labelId: "Mata", labelEn: "Eyes", path: EYES_FILL, defaultColor: "#3B2A20" },
      { id: "blush", labelId: "Pipi", labelEn: "Cheeks", path: BLUSH_L + " " + BLUSH_R, defaultColor: "#F7A8A0" },
    ];
  }

  const SKIN = "#F6CBA6";

  /* ═════════════ 1. Cewek ekor — high ponytail, tee + trousers ═════════════ */

  const C1_HAIR_OUT =
    "M 125 176 C 120 164 114 150 112 132 " +
    "C 112 85.6 151.4 48 200 48 " +
    "C 248.6 48 288 85.6 288 132 " +
    "C 286 150 280 164 275 176";
  const C1_PONI =
    "M 275 176 C 271 148 266 118 254 100 " +
    "C 234 118 206 122 186 108 " +
    "C 172 120 152 122 140 112 " +
    "C 134 134 129 156 125 176";
  const C1_HAIR = weld(C1_HAIR_OUT, C1_PONI);

  // Ponytail off the crown — above the ear line, so the ears stay visible.
  const C1_TAIL =
    "M 232 46 " +
    "C 252 18 292 12 312 32 " +
    "C 332 52 330 92 308 104 " +
    "C 292 112 276 100 284 86 " +
    "C 296 70 292 52 272 48 " +
    "C 256 44 244 46 236 58 Z";
  const C1_BAND = ell(236, 58, 13, 10);
  const C1_LEGS = legs(340);

  /* ═════════════════ 2. Cowok — soft tousled hair, tee + shorts ═════════════ */

  const C2_HAIR_OUT =
    "M 120 168 C 116 156 113 146 112 132 " +
    "C 112 85.6 151.4 48 200 48 " +
    "C 248.6 48 288 85.6 288 132 " +
    "C 287 146 284 156 280 168";
  const C2_PONI =
    "M 280 168 C 276 138 270 110 256 94 " +
    "C 244 118 230 98 216 114 " +
    "C 202 128 188 102 174 116 " +
    "C 158 106 138 116 128 136 " +
    "C 125 146 122 156 120 168";
  const C2_HAIR = weld(C2_HAIR_OUT, C2_PONI);

  const C2_SHORTS_L = "M 148 336 C 149 356 153 372 157 388";
  const C2_SHORTS_R = "M 252 336 C 251 356 247 372 243 388";
  const C2_SHORTS_HEM =
    "M 157 388 L 195 388 C 197 376 198 368 200 362 " +
    "C 202 368 203 376 205 388 L 243 388";
  const C2_SHORTS =
    "M 148 336 L 252 336 " +
    "C 251 356 247 372 243 388 " +
    "L 205 388 C 203 376 202 368 200 362 " +
    "C 198 368 197 376 195 388 " +
    "L 157 388 C 153 372 149 356 148 336 Z";
  const C2_LEGS = legs(388);

  /* ═════════════════ 3. Cewek pita — bob, side bow, dress ═════════════════ */

  const C3_HAIR_OUT =
    "M 112 208 C 104 190 108 166 116 148 " +
    "C 113 143 112 138 112 132 " +
    "C 112 85.6 151.4 48 200 48 " +
    "C 248.6 48 288 85.6 288 132 " +
    "C 288 138 287 143 284 148 " +
    "C 292 166 296 190 288 208";
  const C3_PONI =
    "M 288 208 C 280 192 274 178 270 162 " +
    "C 277 140 279 118 275 100 " +
    "C 254 118 232 122 218 108 " +
    "C 202 122 182 122 168 106 " +
    "C 146 122 126 118 118 102 " +
    "C 114 124 122 146 132 162 " +
    "C 126 178 120 192 112 208";
  const C3_HAIR = weld(C3_HAIR_OUT, C3_PONI);

  // Bow perched on the side of the head so it overlaps the hair.
  const C3_BOW =
    "M 140 86 " +
    "C 131 72 107 69 103 85 " +
    "C 98 99 116 109 140 98 " +
    "C 165 109 182 99 177 85 " +
    "C 173 69 149 72 140 86 Z";
  const C3_KNOT = ell(140, 92, 9, 8);
  const C3_LEGS = legs(362);

  /* ═════════════ 4. Cewek overall — twin buns, tee + dungarees ═════════════ */

  const C4_HAIR_OUT = C1_HAIR_OUT;
  const C4_PONI =
    "M 275 176 C 272 148 268 116 256 98 " +
    "C 238 108 216 116 200 112 " +
    "C 184 116 162 108 144 98 " +
    "C 132 116 128 148 125 176";
  const C4_HAIR = weld(C4_HAIR_OUT, C4_PONI);

  const C4_BUN_L = ell(116, 84, 34, 32);
  const C4_BUN_R = mir(C4_BUN_L);

  const C4_STRAP_L = "M 158 234 L 180 234 L 182 266";
  const C4_STRAP_R = "M 242 234 L 220 234 L 218 266";
  const C4_CHEST = "M 182 266 L 218 266";
  const C4_SIDE_L = "M 158 234 L 160 272 C 156 300 155 320 155 338";
  const C4_SIDE_R = "M 242 234 L 240 272 C 244 300 245 320 245 338";
  const C4_OVERALL =
    "M 158 234 L 180 234 L 182 266 L 218 266 L 220 234 L 242 234 " +
    "L 240 272 C 244 300 245 320 245 338 " +
    "L 155 338 C 155 320 156 300 160 272 Z";
  const C4_LEGS = legs(340);

  /* ───────────────────────────── characters ───────────────────────────── */

  window.GAMBOR_CHARACTERS = [
    {
      id: "cewek-ekor",
      nameId: "Cewek ekor",
      nameEn: "Girl ponytail",
      emoji: "👧",
      steps: [
        headStep(),
        faceStep(),
        {
          id: "hair",
          labelId: "Rambut ekor",
          labelEn: "Ponytail hair",
          paths: [
            pl(C1_HAIR_OUT, "Garis rambut", "Hairline"),
            pl(C1_PONI, "Poni", "Fringe"),
            pl(C1_TAIL, "Ekor rambut", "Ponytail"),
            pl(C1_BAND, "Ikat rambut", "Hair band"),
          ],
        },
        shirtStep("Baju", "Shirt"),
        armsStep(),
        legsStep(C1_LEGS, "Celana & sepatu", "Trousers & shoes"),
      ],
      fillRegions: [
        { id: "ekor", labelId: "Ekor rambut", labelEn: "Ponytail", path: C1_TAIL, defaultColor: "#B07C3A" },
        { id: "skin", labelId: "Kulit", labelEn: "Skin", path: HEAD, defaultColor: SKIN },
        { id: "hair", labelId: "Rambut", labelEn: "Hair", path: C1_HAIR, defaultColor: "#B07C3A" },
        { id: "band", labelId: "Ikat rambut", labelEn: "Hair band", path: C1_BAND, defaultColor: "#F2B705" },
        { id: "arms", labelId: "Lengan", labelEn: "Arms", path: ARM_L_FILL + " " + ARM_R_FILL, defaultColor: SKIN },
        { id: "pants", labelId: "Celana", labelEn: "Trousers", path: C1_LEGS.fill, defaultColor: "#3C7DD9" },
        { id: "shirt", labelId: "Baju", labelEn: "Shirt", path: SHIRT, defaultColor: "#F7D648" },
        { id: "shoes", labelId: "Sepatu", labelEn: "Shoes", path: SHOES, defaultColor: "#8C93A8" },
      ].concat(faceRegions()),
      palette: ["#F6CBA6", "#B07C3A", "#C9973F", "#F2B705", "#F7D648", "#3C7DD9", "#8C93A8", "#F7A8A0", "#FFFFFF", "#3B2A20"],
    },

    {
      id: "cowok",
      nameId: "Cowok",
      nameEn: "Boy",
      emoji: "👦",
      steps: [
        headStep(),
        faceStep(),
        {
          id: "hair",
          labelId: "Rambut",
          labelEn: "Hair",
          paths: [
            pl(C2_HAIR_OUT, "Garis rambut", "Hairline"),
            pl(C2_PONI, "Poni", "Fringe"),
          ],
        },
        shirtStep("Kaos", "T-shirt"),
        armsStep(),
        {
          id: "shorts",
          labelId: "Celana pendek",
          labelEn: "Shorts",
          paths: [
            pl(C2_SHORTS_L, "Sisi kiri", "Left side"),
            pl(C2_SHORTS_R, "Sisi kanan", "Right side"),
            pl(C2_SHORTS_HEM, "Ujung celana", "Shorts hem"),
          ],
        },
        legsStep(C2_LEGS, "Kaki & sepatu", "Legs & shoes"),
      ],
      fillRegions: [
        { id: "skin", labelId: "Kulit", labelEn: "Skin", path: HEAD, defaultColor: SKIN },
        { id: "hair", labelId: "Rambut", labelEn: "Hair", path: C2_HAIR, defaultColor: "#5A3620" },
        { id: "arms", labelId: "Lengan", labelEn: "Arms", path: ARM_L_FILL + " " + ARM_R_FILL, defaultColor: SKIN },
        { id: "legs", labelId: "Kaki", labelEn: "Legs", path: C2_LEGS.fill, defaultColor: SKIN },
        { id: "shirt", labelId: "Kaos", labelEn: "T-shirt", path: SHIRT, defaultColor: "#5FBE7B" },
        { id: "shorts", labelId: "Celana", labelEn: "Shorts", path: C2_SHORTS, defaultColor: "#2E5FA3" },
        { id: "shoes", labelId: "Sepatu", labelEn: "Shoes", path: SHOES, defaultColor: "#8A5A3B" },
      ].concat(faceRegions()),
      palette: ["#F6CBA6", "#5A3620", "#5FBE7B", "#2E5FA3", "#8A5A3B", "#E4604A", "#F7A8A0", "#FFFFFF", "#3B2A20"],
    },

    {
      id: "cewek-pita",
      nameId: "Cewek pita",
      nameEn: "Girl with bow",
      emoji: "🎀",
      steps: [
        headStep(),
        faceStep(),
        {
          id: "hair",
          labelId: "Rambut bob",
          labelEn: "Bob hair",
          paths: [
            pl(C3_HAIR_OUT, "Garis rambut", "Hairline"),
            pl(C3_PONI, "Poni", "Fringe"),
          ],
        },
        {
          id: "bow",
          labelId: "Pita",
          labelEn: "Bow",
          paths: [
            pl(C3_BOW, "Pita", "Bow"),
            pl(C3_KNOT, "Simpul pita", "Bow knot"),
          ],
        },
        {
          id: "dress",
          labelId: "Gaun",
          labelEn: "Dress",
          paths: [
            pl(SLEEVE_L, "Lengan gaun kiri", "Left sleeve"),
            pl(SLEEVE_R, "Lengan gaun kanan", "Right sleeve"),
            pl(DRESS_SIDE_L, "Sisi kiri", "Left side"),
            pl(DRESS_SIDE_R, "Sisi kanan", "Right side"),
            pl(DRESS_HEM, "Ujung gaun", "Dress hem"),
          ],
        },
        armsStep(),
        legsStep(C3_LEGS, "Kaki & sepatu", "Legs & shoes"),
      ],
      fillRegions: [
        { id: "skin", labelId: "Kulit", labelEn: "Skin", path: HEAD, defaultColor: SKIN },
        { id: "hair", labelId: "Rambut", labelEn: "Hair", path: C3_HAIR, defaultColor: "#4A3328" },
        { id: "bow", labelId: "Pita", labelEn: "Bow", path: C3_BOW, defaultColor: "#F08BB0" },
        { id: "arms", labelId: "Lengan", labelEn: "Arms", path: ARM_L_FILL + " " + ARM_R_FILL, defaultColor: SKIN },
        { id: "legs", labelId: "Kaki", labelEn: "Legs", path: C3_LEGS.fill, defaultColor: SKIN },
        { id: "dress", labelId: "Gaun", labelEn: "Dress", path: DRESS, defaultColor: "#F9C2D6" },
        { id: "shoes", labelId: "Sepatu", labelEn: "Shoes", path: SHOES, defaultColor: "#E0507F" },
      ].concat(faceRegions()),
      palette: ["#F6CBA6", "#4A3328", "#F9C2D6", "#F08BB0", "#E0507F", "#3C7DD9", "#F7A8A0", "#FFFFFF", "#3B2A20"],
    },

    {
      id: "cewek-overall",
      nameId: "Cewek overall",
      nameEn: "Girl in dungarees",
      emoji: "👖",
      steps: [
        headStep(),
        faceStep(),
        {
          id: "hair",
          labelId: "Rambut cepol",
          labelEn: "Bun hair",
          paths: [
            pl(C4_HAIR_OUT, "Garis rambut", "Hairline"),
            pl(C4_PONI, "Poni", "Fringe"),
            pl(C4_BUN_L, "Cepol kiri", "Left bun"),
            pl(C4_BUN_R, "Cepol kanan", "Right bun"),
          ],
        },
        shirtStep("Kaos", "T-shirt"),
        {
          id: "overall",
          labelId: "Overall",
          labelEn: "Dungarees",
          paths: [
            pl(C4_STRAP_L, "Tali kiri", "Left strap"),
            pl(C4_STRAP_R, "Tali kanan", "Right strap"),
            pl(C4_CHEST, "Dada overall", "Bib top"),
            pl(C4_SIDE_L, "Sisi kiri", "Left side"),
            pl(C4_SIDE_R, "Sisi kanan", "Right side"),
          ],
        },
        armsStep(),
        legsStep(C4_LEGS, "Kaki & sepatu", "Legs & shoes"),
      ],
      fillRegions: [
        { id: "skin", labelId: "Kulit", labelEn: "Skin", path: HEAD, defaultColor: SKIN },
        { id: "hair", labelId: "Rambut", labelEn: "Hair", path: C4_HAIR, defaultColor: "#8A5A3B" },
        { id: "cepol", labelId: "Cepol", labelEn: "Buns", path: C4_BUN_L + " " + C4_BUN_R, defaultColor: "#8A5A3B" },
        { id: "arms", labelId: "Lengan", labelEn: "Arms", path: ARM_L_FILL + " " + ARM_R_FILL, defaultColor: SKIN },
        { id: "shirt", labelId: "Kaos", labelEn: "T-shirt", path: SHIRT, defaultColor: "#F7D648" },
        { id: "overall", labelId: "Overall", labelEn: "Dungarees", path: C4_OVERALL + " " + C4_LEGS.fill, defaultColor: "#2E5FA3" },
        { id: "shoes", labelId: "Sepatu", labelEn: "Shoes", path: SHOES, defaultColor: "#7A4A2E" },
      ].concat(faceRegions()),
      palette: ["#F6CBA6", "#8A5A3B", "#F7D648", "#2E5FA3", "#7A4A2E", "#5FBE7B", "#F7A8A0", "#FFFFFF", "#3B2A20"],
    },
  ];
})();
