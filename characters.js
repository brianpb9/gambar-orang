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

  /** Weld a run of traced lines, end to end, into the closed shape they draw. */
  function chain() {
    let d = arguments[0];
    for (let i = 1; i < arguments.length; i++) {
      d += " " + arguments[i].replace(/^M\s+-?[\d.]+\s+-?[\d.]+\s*/, "");
    }
    return d + " Z";
  }

  /** Scale then move a path — how a unit person is placed into a scene. */
  function xf(d, s, tx, ty) {
    let i = 0;
    return d.replace(/-?\d*\.?\d+/g, function (m) {
      const v = parseFloat(m);
      const out = i % 2 === 0 ? v * s + tx : v * s + ty;
      i += 1;
      return String(r1(out));
    });
  }

  /** Closed scalloped disc — the sun, a tree crown, a cloud. */
  function blob(cx, cy, rIn, rOut, n) {
    let d = "";
    for (let i = 0; i < n; i++) {
      const a0 = ((i) / n) * Math.PI * 2;
      const a1 = ((i + 0.5) / n) * Math.PI * 2;
      const a2 = ((i + 1) / n) * Math.PI * 2;
      if (i === 0) d += "M " + r1(cx + Math.cos(a0) * rIn) + " " + r1(cy + Math.sin(a0) * rIn) + " ";
      d += "Q " + r1(cx + Math.cos(a1) * rOut) + " " + r1(cy + Math.sin(a1) * rOut) +
           " " + r1(cx + Math.cos(a2) * rIn) + " " + r1(cy + Math.sin(a2) * rIn) + " ";
    }
    return d + "Z";
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


  /* ═════════════ 5-8. grown-ups: new hair, glasses, collared shirt ═════════════ */

  // Neat adult hairline, sitting higher on the forehead than a child's fringe.
  const H_ADULT_OUT =
    "M 122 166 C 117 152 113 146 112 132 " +
    "C 112 85.6 151.4 48 200 48 " +
    "C 248.6 48 288 85.6 288 132 " +
    "C 287 146 283 152 278 166";
  const H_ADULT_FRINGE =
    "M 278 166 C 275 136 270 108 256 94 " +
    "C 236 106 210 112 186 108 " +
    "C 168 104 150 112 138 108 " +
    "C 130 124 125 144 122 166";
  const H_ADULT = weld(H_ADULT_OUT, H_ADULT_FRINGE);

  // Long hair, traced as four lines. The inner edge follows the jaw and ends
  // on the shoulder, so the hair meets the face and the shirt with no gap of
  // background showing beside the chin.
  const H_LONG_OUT =
    "M 104 252 C 84 210 88 160 112 132 " +
    "C 112 85.6 151.4 48 200 48 " +
    "C 248.6 48 288 85.6 288 132 " +
    "C 312 160 316 210 296 252";
  const H_LONG_R =
    "M 296 252 C 284 252 266 250 250 246 " +
    "C 238 234 230 224 228 212 " +
    "C 252 202 270 184 277 160 " +
    "C 281 134 281 114 278 98";
  const H_LONG_F =
    "M 278 98 C 256 116 232 120 218 106 " +
    "C 202 120 182 120 166 104 " +
    "C 144 120 124 116 122 98";
  const H_LONG_L =
    "M 122 98 C 119 114 119 134 123 160 " +
    "C 130 184 148 202 172 212 " +
    "C 170 224 162 234 150 246 " +
    "C 134 250 116 252 104 252";
  const H_LONG = chain(H_LONG_OUT, H_LONG_R, H_LONG_F, H_LONG_L);

  // Grandpa: hair only round the sides, bare on top. Two pieces that never
  // touch, so they can share one fill region.
  const H_GPA_L =
    "M 116 174 C 108 144 112 114 126 96 " +
    "C 136 84 148 80 160 80 " +
    "C 152 92 142 102 138 116 " +
    "C 132 136 130 156 134 174 Z";
  const H_GPA_R = mir(H_GPA_L);
  const H_GPA = H_GPA_L + " " + H_GPA_R;

  // Bun on the crown, drawn after the hair so it reads as sitting on top.
  const BUN_TOP = ell(200, 44, 31, 25);

  // Glasses are outlines only — no fill region, so the lenses stay see-through.
  const GLASS_L = ell(167, 150, 25, 22);
  const GLASS_R = ell(233, 150, 25, 22);
  const GLASS_BRIDGE = "M 192 146 Q 200 141 208 146";
  const GLASS_ARM_L = "M 143 145 L 117 139";
  const GLASS_ARM_R = mir(GLASS_ARM_L);

  const COLLAR_V = "M 182 230 L 193 252 L 200 242 L 207 252 L 218 230";
  const BUTTONS = "M 200 246 L 200 332";

  /** Shirt step with a collar and button placket — the grown-ups' version. */
  function collaredShirtStep(labelId, labelEn) {
    const step = shirtStep(labelId, labelEn);
    step.paths = step.paths.concat([
      pl(COLLAR_V, "Kerah", "Collar"),
      pl(BUTTONS, "Deret kancing", "Buttons"),
    ]);
    return step;
  }

  function glassesStep() {
    return {
      id: "glasses",
      labelId: "Kacamata",
      labelEn: "Glasses",
      paths: [
        pl(GLASS_L, "Kaca kiri", "Left lens"),
        pl(GLASS_R, "Kaca kanan", "Right lens"),
        pl(GLASS_BRIDGE, "Jembatan", "Bridge"),
        pl(GLASS_ARM_L, "Gagang kiri", "Left arm"),
        pl(GLASS_ARM_R, "Gagang kanan", "Right arm"),
      ],
    };
  }

  const ADULT_LEGS = legs(340);
  const DRESS_LEGS = legs(362);

  function dressStep(labelId, labelEn) {
    return {
      id: "dress",
      labelId: labelId,
      labelEn: labelEn,
      paths: [
        pl(SLEEVE_L, "Lengan gaun kiri", "Left sleeve"),
        pl(SLEEVE_R, "Lengan gaun kanan", "Right sleeve"),
        pl(DRESS_SIDE_L, "Sisi kiri", "Left side"),
        pl(DRESS_SIDE_R, "Sisi kanan", "Right side"),
        pl(DRESS_HEM, "Ujung gaun", "Dress hem"),
      ],
    };
  }

  /* ═══════════════════════════ 9. Kucing ═══════════════════════════ */

  const CAT_HEAD = ell(200, 165, 76, 68);
  // Ear: traced as an open triangle whose two ends sit on the head circle, so
  // the head outline closes it. Drawing a base edge instead left it just
  // inside the circle, and the two strokes merged into a dark wedge.
  const CAT_EAR_L = "M 140 123 C 132 96 132 70 142 64 C 154 58 176 80 192 97";
  const CAT_EAR_R = mir(CAT_EAR_L);
  const CAT_EAR_L_FILL = CAT_EAR_L + " C 178 110 158 120 140 123 Z";
  const CAT_EAR_R_FILL = mir(CAT_EAR_L_FILL);
  const CAT_INNER_L =
    "M 152 106 C 148 90 150 76 155 73 " +
    "C 162 70 174 86 182 97 " +
    "C 172 104 160 107 152 106 Z";
  const CAT_INNER_R = mir(CAT_INNER_L);
  const CAT_EYE_L = ell(172, 170, 17, 20);
  const CAT_EYE_R = ell(228, 170, 17, 20);
  const CAT_SHINE = ell(166, 162, 6, 6) + " " + ell(222, 162, 6, 6);
  const CAT_NOSE = "M 190 196 C 196 194 204 194 210 196 C 208 205 202 210 200 210 C 198 210 192 205 190 196 Z";
  const CAT_MOUTH =
    "M 200 210 C 200 220 191 225 183 218 " +
    "M 200 210 C 200 220 209 225 217 218";
  const CAT_WHISK_L = "M 150 196 L 94 186 M 148 208 L 90 208 M 150 220 L 96 232";
  const CAT_WHISK_R = mir(CAT_WHISK_L);
  const CAT_BODY_L = "M 152 210 C 126 238 108 296 112 356 C 115 394 144 414 172 420";
  const CAT_BODY_R = mir(CAT_BODY_L);
  const CAT_BODY_BOTTOM = "M 172 420 C 182 424 218 424 228 420";
  const CAT_BODY =
    "M 152 210 C 126 238 108 296 112 356 C 115 394 144 414 172 420 " +
    "C 182 424 218 424 228 420 " +
    "C 256 414 285 394 288 356 C 292 296 274 238 248 210 " +
    "C 236 228 164 228 152 210 Z";
  const CAT_PAW_L = ell(164, 414, 27, 17);
  const CAT_PAW_R = mir(CAT_PAW_L);
  const CAT_TAIL =
    "M 282 350 C 322 360 352 338 352 302 " +
    "C 352 274 326 260 312 276 " +
    "C 300 290 310 310 324 304 " +
    "C 318 326 300 336 276 330 Z";


  /* ═══════════════════════ scenes ═══════════════════════ */

  /** Leg and shoe as one silhouette — a scene person is traced in ten lines. */
  function legShoe(top) {
    const y1 = r1(top + (450 - top) * 0.35);
    const y2 = r1(top + (450 - top) * 0.72);
    const L =
      "M 163 " + r1(top) + " C 158 " + y1 + " 159 " + y2 + " 162 440 " +
      "C 152 444 148 452 148 462 " +
      "C 148 474 154 477 162 477 " +
      "L 182 477 C 190 477 196 474 196 466 " +
      "C 196 456 194 446 191 440 " +
      "C 194 416 196 378 195 " + r1(top) + " Z";
    return { L: L, R: mir(L) };
  }

  /**
   * Place one of the unit people into a scene: same body, scaled and moved so
   * the feet land on the scene's ground line, and cut down to ten lines.
   * Region ids are prefixed with the person's key so several can share a scene.
   */
  function scenePerson(o) {
    const s = o.s;
    const tx = o.cx - 200 * s;
    const ty = o.baseY - 477 * s;
    const T = function (d) { return xf(d, s, tx, ty); };
    const ls = legShoe(o.legTop);
    const lg = legs(o.legTop);
    const k = o.key;
    const nid = o.nameId;
    const nen = o.nameEn;
    return {
      step: {
        id: k,
        labelId: nid,
        labelEn: nen,
        paths: [
          pl(T(HEAD), "Kepala", "Head"),
          pl(T(EYE_L), "Mata kiri", "Left eye"),
          pl(T(EYE_R), "Mata kanan", "Right eye"),
          pl(T(MOUTH), "Senyum", "Smile"),
          pl(T(o.hair), "Rambut", "Hair"),
          pl(T(o.body), "Baju", "Clothes"),
          pl(T(ARM_L), "Tangan kiri", "Left arm"),
          pl(T(ARM_R), "Tangan kanan", "Right arm"),
          pl(T(ls.L), "Kaki kiri", "Left leg"),
          pl(T(ls.R), "Kaki kanan", "Right leg"),
        ],
      },
      regions: [
        { id: k + "-skin", labelId: nid + " · kulit", labelEn: nen + " · skin", path: T(HEAD), defaultColor: SKIN },
        { id: k + "-hair", labelId: nid + " · rambut", labelEn: nen + " · hair", path: T(o.hair), defaultColor: o.hairColor },
        { id: k + "-arms", labelId: nid + " · lengan", labelEn: nen + " · arms", path: T(ARM_L_FILL) + " " + T(ARM_R_FILL), defaultColor: SKIN },
        { id: k + "-legs", labelId: nid + " · kaki", labelEn: nen + " · legs", path: T(lg.fill), defaultColor: o.legColor },
        { id: k + "-shoes", labelId: nid + " · sepatu", labelEn: nen + " · shoes", path: T(SHOES), defaultColor: o.shoeColor },
        { id: k + "-body", labelId: nid + " · baju", labelEn: nen + " · clothes", path: T(o.body), defaultColor: o.bodyColor },
        { id: k + "-eyes", labelId: nid + " · mata", labelEn: nen + " · eyes", path: T(EYE_L) + " " + T(EYE_R), defaultColor: "#3B2A20" },
      ],
    };
  }

  const DAD = { hair: H_ADULT, hairColor: "#3E2C21", body: SHIRT, bodyColor: "#7FB7E8", legTop: 340, legColor: "#3A4A63", shoeColor: "#5A4030" };
  const MUM = { hair: H_LONG, hairColor: "#6B4226", body: DRESS, bodyColor: "#E0719B", legTop: 362, legColor: SKIN, shoeColor: "#C24A6E" };
  const BOY = { hair: C2_HAIR, hairColor: "#5A3620", body: SHIRT, bodyColor: "#5FBE7B", legTop: 340, legColor: "#2E5FA3", shoeColor: "#8A5A3B" };
  const GIRL = { hair: C3_HAIR, hairColor: "#4A3328", body: DRESS, bodyColor: "#F9C2D6", legTop: 362, legColor: SKIN, shoeColor: "#E0507F" };

  function who(base, extra) {
    const out = {};
    for (const k in base) out[k] = base[k];
    for (const k in extra) out[k] = extra[k];
    return out;
  }

  /** Assemble a scene from people and props into one character entry. */
  function scene(cfg) {
    const steps = cfg.propSteps.slice();
    const regions = cfg.propRegions.slice();
    for (const p of cfg.people) {
      const built = scenePerson(p);
      steps.push(built.step);
      for (const r of built.regions) regions.push(r);
    }
    return {
      group: cfg.group,
      id: cfg.id,
      nameId: cfg.nameId,
      nameEn: cfg.nameEn,
      emoji: cfg.emoji,
      width: cfg.width,
      height: cfg.height,
      wide: true,
      steps: cfg.propsLast ? steps : steps,
      fillRegions: regions,
      palette: cfg.palette,
    };
  }

  /* ---- props ---- */

  const SUN_PHOTO = blob(722, 84, 40, 58, 12);
  const GROUND_PHOTO = "M 40 444 L 780 444";

  const SUN_YARD = blob(92, 96, 40, 58, 12);
  const CLOUD_YARD =
    "M 392 112 C 388 94 406 82 422 88 " +
    "C 430 72 458 70 468 84 " +
    "C 488 78 504 92 500 110 " +
    "C 508 116 504 124 494 124 " +
    "L 400 124 C 390 124 386 118 392 112 Z";
  const GROUND_YARD = "M 20 470 L 880 470";

  const ROOF = "M 686 362 L 785 280 L 884 362 Z";
  const WALLS = "M 708 362 L 708 470 L 862 470 L 862 362";
  const WALLS_FILL = WALLS + " Z";
  const DOOR = "M 772 470 L 772 418 C 772 406 800 406 800 418 L 800 470";
  const DOOR_FILL = DOOR + " Z";
  // Both windows are traced as one line: on their own each is small enough
  // that the tolerance would cover it in a single dab.
  const WIN_L = "M 722 376 L 762 376 L 762 428 L 722 428 Z";
  const WIN_R = "M 810 376 L 850 376 L 850 428 L 810 428 Z";
  const WINDOWS = WIN_L + " " + WIN_R;
  const CHIMNEY = "M 838 310 L 838 288 L 858 288 L 858 330";
  const CHIMNEY_FILL = "M 838 310 L 838 288 L 858 288 L 858 330 L 838 330 Z";

  const TRUNK = "M 604 470 L 604 388 C 604 378 636 378 636 388 L 636 470";
  const TRUNK_FILL = TRUNK + " Z";
  const CROWN = blob(620, 340, 60, 76, 11);

  // The cat, dropped into the yard at half size, standing on the ground line.
  const CATS = 0.4;
  const CATX = 452 - 200 * CATS;
  const CATY = 470 - 431 * CATS;
  const CT = function (d) { return xf(d, CATS, CATX, CATY); };


  /* ═══════════════════════ numbers 1-100 ═══════════════════════ */

  /**
   * Each digit as the strokes a child is taught to write it with, in order and
   * in the direction the pen travels, drawn in a 200 x 300 box. These are
   * skeletons, not outlines: what is being practised is the path of the pen.
   */
  const DIGIT_STROKES = {
    "0": [["Bulat", "Round", "M 100 32 C 68 32 42 85 42 150 C 42 215 68 268 100 268 C 132 268 158 215 158 150 C 158 85 132 32 100 32 Z"]],
    "1": [["Turun", "Down", "M 60 76 L 100 32 L 100 268"]],
    "2": [["Lengkung lalu alas", "Curve then base", "M 48 84 C 52 36 150 30 152 86 C 154 130 96 186 46 268 L 158 268"]],
    "3": [["Dua lengkung", "Two curves", "M 48 66 C 66 28 156 36 146 90 C 140 124 108 138 88 140 C 120 138 162 156 156 208 C 150 262 62 282 44 240"]],
    "4": [
      ["Miring lalu datar", "Slant then across", "M 120 32 L 40 196 L 160 196"],
      ["Turun", "Down", "M 120 32 L 120 268"],
    ],
    "5": [
      ["Turun lalu perut", "Down then belly", "M 62 40 L 62 140 C 100 118 158 140 158 200 C 158 256 96 282 52 252"],
      ["Topi", "Top bar", "M 62 40 L 152 40"],
    ],
    "6": [["Lengkung lalu gelung", "Curve then loop", "M 138 42 C 96 28 50 82 46 160 C 43 222 68 268 104 268 C 140 268 158 238 156 206 C 154 174 126 152 98 156 C 76 159 56 176 48 196"]],
    "7": [["Datar lalu miring", "Across then slant", "M 44 40 L 158 40 L 82 268"]],
    "8": [["Angka delapan", "Figure eight", "M 100 32 C 62 32 52 76 78 100 C 104 124 158 132 158 196 C 158 248 132 268 100 268 C 68 268 42 248 42 196 C 42 132 96 124 122 100 C 148 76 138 32 100 32 Z"]],
    "9": [["Gelung lalu turun", "Loop then down", "M 156 118 C 156 84 132 58 100 58 C 68 58 46 84 46 118 C 46 152 68 176 100 176 C 130 176 152 156 156 124 C 156 180 154 230 148 268"]],
  };

  const DIGIT_W = 200;
  const DIGIT_H = 300;
  const CARD_PAD = 40;

  /** Rounded rectangle, used as the board the number sits on. */
  function roundRect(x, y, w, h, r) {
    const k = r * 0.45;
    return [
      "M " + r1(x + r) + " " + r1(y),
      "L " + r1(x + w - r) + " " + r1(y),
      "C " + r1(x + w - k) + " " + r1(y) + " " + r1(x + w) + " " + r1(y + k) + " " + r1(x + w) + " " + r1(y + r),
      "L " + r1(x + w) + " " + r1(y + h - r),
      "C " + r1(x + w) + " " + r1(y + h - k) + " " + r1(x + w - k) + " " + r1(y + h) + " " + r1(x + w - r) + " " + r1(y + h),
      "L " + r1(x + r) + " " + r1(y + h),
      "C " + r1(x + k) + " " + r1(y + h) + " " + r1(x) + " " + r1(y + h - k) + " " + r1(x) + " " + r1(y + h - r),
      "L " + r1(x) + " " + r1(y + r),
      "C " + r1(x) + " " + r1(y + k) + " " + r1(x + k) + " " + r1(y) + " " + r1(x + r) + " " + r1(y),
      "Z",
    ].join(" ");
  }

  // One colour per band of ten, so each row of the picking screen reads apart.
  const BOARD_COLOURS = [
    "#FBD24B", "#8FD3A6", "#9FD2EC", "#F7A8C4", "#F5A65B",
    "#C3B2E8", "#7FB7E8", "#F0C987", "#8FD8D2", "#F09B9B",
  ];
  const NUMBER_PALETTE = [
    "#FBD24B", "#8FD3A6", "#9FD2EC", "#F7A8C4", "#F5A65B",
    "#C3B2E8", "#E4604A", "#6DBE72", "#FFFFFF", "#3B2A20",
  ];

  /**
   * One number to trace: each digit is its own step, so a child is walked
   * through "4" and then "7" rather than being handed "47" whole. Only the
   * numeral is traced; the board behind it is there to colour afterwards.
   */
  function numberCard(n) {
    const text = String(n);
    const width = CARD_PAD * 2 + text.length * DIGIT_W;
    const height = DIGIT_H + CARD_PAD * 2;
    const band = Math.ceil(n / 10);
    const lo = (band - 1) * 10 + 1;
    const hi = band * 10;

    const steps = [];
    for (let i = 0; i < text.length; i++) {
      const tx = CARD_PAD + i * DIGIT_W;
      const strokes = DIGIT_STROKES[text.charAt(i)];
      steps.push({
        id: "digit" + i,
        labelId: text.length > 1 ? "Angka " + text.charAt(i) : "Angka " + text,
        labelEn: text.length > 1 ? "Digit " + text.charAt(i) : "Number " + text,
        paths: strokes.map(function (st) {
          return pl(xf(st[2], 1, tx, CARD_PAD), st[0], st[1]);
        }),
      });
    }

    // The board is not traced: drawing a rectangle teaches nothing, and it
    // stood between the child and finishing every one of these hundred cards.
    // It is still there to colour once the number is written.
    const board = roundRect(14, 12, width - 28, height - 24, 34);

    return {
      group: "angka" + band,
      groupTitleId: "Angka " + lo + "–" + hi,
      groupTitleEn: "Numbers " + lo + "–" + hi,
      id: "angka-" + n,
      nameId: text,
      nameEn: text,
      emoji: "",
      width: width,
      height: height,
      steps: steps,
      fillRegions: [
        { id: "board", labelId: "Papan", labelEn: "Board", path: board, defaultColor: BOARD_COLOURS[(band - 1) % BOARD_COLOURS.length] },
      ],
      palette: NUMBER_PALETTE,
    };
  }

  /* ───────────────────────────── characters ───────────────────────────── */

  window.GAMBOR_CHARACTERS = [
    {
      id: "cewek-ekor",
      group: "teman",
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
      group: "teman",
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
      group: "teman",
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
      group: "teman",
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

    {
      id: "ayah",
      group: "teman",
      nameId: "Ayah",
      nameEn: "Dad",
      emoji: "👨",
      steps: [
        headStep(),
        faceStep(),
        {
          id: "hair",
          labelId: "Rambut",
          labelEn: "Hair",
          paths: [
            pl(H_ADULT_OUT, "Garis rambut", "Hairline"),
            pl(H_ADULT_FRINGE, "Poni", "Fringe"),
          ],
        },
        collaredShirtStep("Kemeja", "Shirt"),
        armsStep(),
        legsStep(ADULT_LEGS, "Celana & sepatu", "Trousers & shoes"),
      ],
      fillRegions: [
        { id: "skin", labelId: "Kulit", labelEn: "Skin", path: HEAD, defaultColor: SKIN },
        { id: "hair", labelId: "Rambut", labelEn: "Hair", path: H_ADULT, defaultColor: "#3E2C21" },
        { id: "arms", labelId: "Lengan", labelEn: "Arms", path: ARM_L_FILL + " " + ARM_R_FILL, defaultColor: SKIN },
        { id: "pants", labelId: "Celana", labelEn: "Trousers", path: ADULT_LEGS.fill, defaultColor: "#3A4A63" },
        { id: "shirt", labelId: "Kemeja", labelEn: "Shirt", path: SHIRT, defaultColor: "#7FB7E8" },
        { id: "shoes", labelId: "Sepatu", labelEn: "Shoes", path: SHOES, defaultColor: "#5A4030" },
      ].concat(faceRegions()),
      palette: ["#F6CBA6", "#3E2C21", "#7FB7E8", "#3A4A63", "#5A4030", "#E4604A", "#F7A8A0", "#FFFFFF", "#3B2A20"],
    },

    {
      id: "ibu",
      group: "teman",
      nameId: "Ibu",
      nameEn: "Mum",
      emoji: "👩",
      steps: [
        headStep(),
        faceStep(),
        {
          id: "hair",
          labelId: "Rambut panjang",
          labelEn: "Long hair",
          paths: [
            pl(H_LONG_OUT, "Garis luar rambut", "Outline"),
            pl(H_LONG_R, "Rambut kanan", "Right length"),
            pl(H_LONG_F, "Poni", "Fringe"),
            pl(H_LONG_L, "Rambut kiri", "Left length"),
          ],
        },
        dressStep("Gaun", "Dress"),
        armsStep(),
        legsStep(DRESS_LEGS, "Kaki & sepatu", "Legs & shoes"),
      ],
      fillRegions: [
        { id: "skin", labelId: "Kulit", labelEn: "Skin", path: HEAD, defaultColor: SKIN },
        { id: "hair", labelId: "Rambut", labelEn: "Hair", path: H_LONG, defaultColor: "#6B4226" },
        { id: "arms", labelId: "Lengan", labelEn: "Arms", path: ARM_L_FILL + " " + ARM_R_FILL, defaultColor: SKIN },
        { id: "legs", labelId: "Kaki", labelEn: "Legs", path: DRESS_LEGS.fill, defaultColor: SKIN },
        { id: "dress", labelId: "Gaun", labelEn: "Dress", path: DRESS, defaultColor: "#E0719B" },
        { id: "shoes", labelId: "Sepatu", labelEn: "Shoes", path: SHOES, defaultColor: "#C24A6E" },
      ].concat(faceRegions()),
      palette: ["#F6CBA6", "#6B4226", "#E0719B", "#C24A6E", "#F7D648", "#3C7DD9", "#F7A8A0", "#FFFFFF", "#3B2A20"],
    },

    {
      id: "kakek",
      group: "teman",
      nameId: "Kakek",
      nameEn: "Grandpa",
      emoji: "👴",
      steps: [
        headStep(),
        faceStep(),
        {
          id: "hair",
          labelId: "Rambut",
          labelEn: "Hair",
          paths: [
            pl(H_GPA_L, "Rambut kiri", "Left side"),
            pl(H_GPA_R, "Rambut kanan", "Right side"),
          ],
        },
        glassesStep(),
        collaredShirtStep("Kemeja", "Shirt"),
        armsStep(),
        legsStep(ADULT_LEGS, "Celana & sepatu", "Trousers & shoes"),
      ],
      fillRegions: [
        { id: "skin", labelId: "Kulit", labelEn: "Skin", path: HEAD, defaultColor: SKIN },
        { id: "hair", labelId: "Rambut", labelEn: "Hair", path: H_GPA, defaultColor: "#BDB8B2" },
        { id: "arms", labelId: "Lengan", labelEn: "Arms", path: ARM_L_FILL + " " + ARM_R_FILL, defaultColor: SKIN },
        { id: "pants", labelId: "Celana", labelEn: "Trousers", path: ADULT_LEGS.fill, defaultColor: "#6B7280" },
        { id: "shirt", labelId: "Kemeja", labelEn: "Shirt", path: SHIRT, defaultColor: "#8FA8C8" },
        { id: "shoes", labelId: "Sepatu", labelEn: "Shoes", path: SHOES, defaultColor: "#5A4030" },
      ].concat(faceRegions()),
      palette: ["#F6CBA6", "#BDB8B2", "#8FA8C8", "#6B7280", "#5A4030", "#5FBE7B", "#F7A8A0", "#FFFFFF", "#3B2A20"],
    },

    {
      id: "nenek",
      group: "teman",
      nameId: "Nenek",
      nameEn: "Grandma",
      emoji: "👵",
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
            pl(BUN_TOP, "Cepol", "Bun"),
          ],
        },
        glassesStep(),
        dressStep("Gaun", "Dress"),
        armsStep(),
        legsStep(DRESS_LEGS, "Kaki & sepatu", "Legs & shoes"),
      ],
      fillRegions: [
        { id: "skin", labelId: "Kulit", labelEn: "Skin", path: HEAD, defaultColor: SKIN },
        { id: "hair", labelId: "Rambut", labelEn: "Hair", path: C4_HAIR, defaultColor: "#C6C1BB" },
        { id: "cepol", labelId: "Cepol", labelEn: "Bun", path: BUN_TOP, defaultColor: "#C6C1BB" },
        { id: "arms", labelId: "Lengan", labelEn: "Arms", path: ARM_L_FILL + " " + ARM_R_FILL, defaultColor: SKIN },
        { id: "legs", labelId: "Kaki", labelEn: "Legs", path: DRESS_LEGS.fill, defaultColor: SKIN },
        { id: "dress", labelId: "Gaun", labelEn: "Dress", path: DRESS, defaultColor: "#A9C7E8" },
        { id: "shoes", labelId: "Sepatu", labelEn: "Shoes", path: SHOES, defaultColor: "#7A6A8C" },
      ].concat(faceRegions()),
      palette: ["#F6CBA6", "#C6C1BB", "#A9C7E8", "#7A6A8C", "#E0719B", "#5FBE7B", "#F7A8A0", "#FFFFFF", "#3B2A20"],
    },

    {
      id: "kucing",
      group: "teman",
      nameId: "Kucing",
      nameEn: "Cat",
      emoji: "🐱",
      steps: [
        { id: "head", labelId: "Kepala", labelEn: "Head", paths: [pl(CAT_HEAD, "Kepala", "Head")] },
        {
          id: "ears",
          labelId: "Telinga",
          labelEn: "Ears",
          paths: [
            pl(CAT_EAR_L, "Telinga kiri", "Left ear"),
            pl(CAT_EAR_R, "Telinga kanan", "Right ear"),
            pl(CAT_INNER_L, "Dalam kiri", "Left inner ear"),
            pl(CAT_INNER_R, "Dalam kanan", "Right inner ear"),
          ],
        },
        {
          id: "face",
          labelId: "Wajah",
          labelEn: "Face",
          paths: [
            pl(CAT_EYE_L, "Mata kiri", "Left eye"),
            pl(CAT_EYE_R, "Mata kanan", "Right eye"),
            pl(CAT_NOSE, "Hidung", "Nose"),
            pl(CAT_MOUTH, "Mulut", "Mouth"),
            pl(CAT_WHISK_L, "Kumis kiri", "Left whiskers"),
            pl(CAT_WHISK_R, "Kumis kanan", "Right whiskers"),
          ],
        },
        {
          id: "body",
          labelId: "Badan",
          labelEn: "Body",
          paths: [
            pl(CAT_BODY_L, "Badan kiri", "Left side"),
            pl(CAT_BODY_R, "Badan kanan", "Right side"),
            pl(CAT_BODY_BOTTOM, "Bawah badan", "Bottom"),
          ],
        },
        {
          id: "paws",
          labelId: "Kaki & ekor",
          labelEn: "Paws & tail",
          paths: [
            pl(CAT_PAW_L, "Kaki kiri", "Left paw"),
            pl(CAT_PAW_R, "Kaki kanan", "Right paw"),
            pl(CAT_TAIL, "Ekor", "Tail"),
          ],
        },
      ],
      fillRegions: [
        { id: "tail", labelId: "Ekor", labelEn: "Tail", path: CAT_TAIL, defaultColor: "#E8A15C" },
        { id: "ears", labelId: "Telinga", labelEn: "Ears", path: CAT_EAR_L_FILL + " " + CAT_EAR_R_FILL, defaultColor: "#E8A15C" },
        { id: "body", labelId: "Badan", labelEn: "Body", path: CAT_BODY, defaultColor: "#E8A15C" },
        { id: "head", labelId: "Kepala", labelEn: "Head", path: CAT_HEAD, defaultColor: "#E8A15C" },
        { id: "inner", labelId: "Dalam telinga", labelEn: "Inner ears", path: CAT_INNER_L + " " + CAT_INNER_R, defaultColor: "#F7B9C4" },
        { id: "paws", labelId: "Kaki", labelEn: "Paws", path: CAT_PAW_L + " " + CAT_PAW_R, defaultColor: "#FBEAD6" },
        { id: "shine", labelId: "Kilau mata", labelEn: "Eye shine", path: CAT_SHINE, defaultColor: "#FFFFFF" },
        { id: "eyes", labelId: "Mata", labelEn: "Eyes", path: CAT_EYE_L + " " + CAT_EYE_R + " " + CAT_SHINE, defaultColor: "#3B6B4A" },
        { id: "nose", labelId: "Hidung", labelEn: "Nose", path: CAT_NOSE, defaultColor: "#F08BA0" },
      ],
      palette: ["#E8A15C", "#FBEAD6", "#F7B9C4", "#F08BA0", "#3B6B4A", "#8C7A6B", "#4A4A4A", "#FFFFFF", "#3B2A20"],
    },

    /* ══════════════ level 2 — the family photo ══════════════ */
    scene({
      group: "keluarga",
      id: "foto-keluarga",
      nameId: "Foto keluarga",
      nameEn: "Family photo",
      emoji: "👨‍👩‍👧‍👦",
      width: 820,
      height: 482,
      propSteps: [
        {
          id: "latar",
          labelId: "Latar",
          labelEn: "Background",
          paths: [
            pl(SUN_PHOTO, "Matahari", "Sun"),
            pl(GROUND_PHOTO, "Garis tanah", "Ground"),
          ],
        },
      ],
      propRegions: [
        { id: "sun", labelId: "Matahari", labelEn: "Sun", path: SUN_PHOTO, defaultColor: "#FBD24B" },
      ],
      people: [
        who(DAD, { key: "ayah", nameId: "Ayah", nameEn: "Dad", s: 0.78, cx: 160, baseY: 430 }),
        who(MUM, { key: "ibu", nameId: "Ibu", nameEn: "Mum", s: 0.76, cx: 340, baseY: 430 }),
        who(BOY, { key: "kakak", nameId: "Kakak", nameEn: "Big brother", s: 0.6, cx: 510, baseY: 430 }),
        who(GIRL, { key: "adik", nameId: "Adik", nameEn: "Little sister", s: 0.6, cx: 670, baseY: 430 }),
      ],
      palette: ["#F6CBA6", "#3E2C21", "#6B4226", "#7FB7E8", "#E0719B", "#5FBE7B", "#F9C2D6", "#3A4A63", "#FBD24B", "#FFFFFF", "#3B2A20"],
    }),

    /* ══════════ level 3 — the family, the house, the tree, the cat ══════════ */
    scene({
      group: "pemandangan",
      id: "keluarga-taman",
      nameId: "Keluarga di taman",
      nameEn: "Family in the garden",
      emoji: "🏡",
      width: 900,
      height: 540,
      propSteps: [
        {
          id: "langit",
          labelId: "Langit",
          labelEn: "Sky",
          paths: [
            pl(SUN_YARD, "Matahari", "Sun"),
            pl(CLOUD_YARD, "Awan", "Cloud"),
            pl(GROUND_YARD, "Garis tanah", "Ground"),
          ],
        },
        {
          id: "rumah",
          labelId: "Rumah",
          labelEn: "House",
          paths: [
            pl(CHIMNEY, "Cerobong", "Chimney"),
            pl(ROOF, "Atap", "Roof"),
            pl(WALLS, "Dinding", "Walls"),
            pl(WINDOWS, "Jendela", "Windows"),
            pl(DOOR, "Pintu", "Door"),
          ],
        },
        {
          id: "pohon",
          labelId: "Pohon",
          labelEn: "Tree",
          paths: [
            pl(TRUNK, "Batang", "Trunk"),
            pl(CROWN, "Daun", "Leaves"),
          ],
        },
        {
          id: "kucing",
          labelId: "Kucing",
          labelEn: "Cat",
          paths: [
            pl(CT(CAT_HEAD), "Kepala kucing", "Cat head"),
            pl(CT(CAT_EAR_L) + " " + CT(CAT_EAR_R), "Telinga", "Ears"),
            pl(CT(CAT_EYE_L) + " " + CT(CAT_EYE_R), "Mata", "Eyes"),
            pl(CT(CAT_WHISK_L) + " " + CT(CAT_WHISK_R), "Kumis", "Whiskers"),
            pl(CT(CAT_BODY), "Badan", "Body"),
            pl(CT(CAT_PAW_L) + " " + CT(CAT_PAW_R), "Kaki", "Paws"),
            pl(CT(CAT_TAIL), "Ekor", "Tail"),
          ],
        },
      ],
      propRegions: [
        { id: "sun", labelId: "Matahari", labelEn: "Sun", path: SUN_YARD, defaultColor: "#FBD24B" },
        { id: "cloud", labelId: "Awan", labelEn: "Cloud", path: CLOUD_YARD, defaultColor: "#FFFFFF" },
        { id: "chimney", labelId: "Cerobong", labelEn: "Chimney", path: CHIMNEY_FILL, defaultColor: "#A5604A" },
        { id: "roof", labelId: "Atap", labelEn: "Roof", path: ROOF, defaultColor: "#D2604F" },
        { id: "walls", labelId: "Dinding", labelEn: "Walls", path: WALLS_FILL, defaultColor: "#F3E2C2" },
        { id: "windows", labelId: "Jendela", labelEn: "Windows", path: WINDOWS, defaultColor: "#9FD2EC" },
        { id: "door", labelId: "Pintu", labelEn: "Door", path: DOOR_FILL, defaultColor: "#A5604A" },
        { id: "trunk", labelId: "Batang", labelEn: "Trunk", path: TRUNK_FILL, defaultColor: "#8A5A3B" },
        { id: "crown", labelId: "Daun", labelEn: "Leaves", path: CROWN, defaultColor: "#6DBE72" },
        { id: "cat-tail", labelId: "Ekor kucing", labelEn: "Cat tail", path: CT(CAT_TAIL), defaultColor: "#E8A15C" },
        { id: "cat-ears", labelId: "Telinga kucing", labelEn: "Cat ears", path: CT(CAT_EAR_L_FILL) + " " + CT(CAT_EAR_R_FILL), defaultColor: "#E8A15C" },
        { id: "cat-body", labelId: "Badan kucing", labelEn: "Cat body", path: CT(CAT_BODY), defaultColor: "#E8A15C" },
        { id: "cat-head", labelId: "Kepala kucing", labelEn: "Cat head", path: CT(CAT_HEAD), defaultColor: "#E8A15C" },
        { id: "cat-paws", labelId: "Kaki kucing", labelEn: "Cat paws", path: CT(CAT_PAW_L) + " " + CT(CAT_PAW_R), defaultColor: "#FBEAD6" },
        { id: "cat-eyes", labelId: "Mata kucing", labelEn: "Cat eyes", path: CT(CAT_EYE_L) + " " + CT(CAT_EYE_R), defaultColor: "#3B6B4A" },
      ],
      people: [
        who(DAD, { key: "ayah", nameId: "Ayah", nameEn: "Dad", s: 0.6, cx: 75, baseY: 470 }),
        who(MUM, { key: "ibu", nameId: "Ibu", nameEn: "Mum", s: 0.58, cx: 210, baseY: 470 }),
        who(BOY, { key: "anak", nameId: "Anak", nameEn: "Child", s: 0.46, cx: 335, baseY: 470 }),
      ],
      palette: ["#F6CBA6", "#8A5A3B", "#6DBE72", "#D2604F", "#F3E2C2", "#9FD2EC", "#E8A15C", "#FBD24B", "#7FB7E8", "#E0719B", "#FFFFFF", "#3B2A20"],
    }),
  ];

  for (let n = 1; n <= 100; n++) window.GAMBOR_CHARACTERS.push(numberCard(n));
})();
