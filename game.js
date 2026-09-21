/**
 * Gambar Orang — step-by-step people tracing + coloring for TK / iPad stylus
 */
(function () {
  "use strict";

  const DESIGN_W = 400;
  const DESIGN_H = 520;
  // A line only counts when it is traced almost end to end, so a child cannot
  // finish a shape by scribbling over part of it.
  const COVER_THRESHOLD = 0.93;
  // ...and this much of what they drew has to sit on the guide, so scrubbing
  // back and forth off the line earns nothing.
  const ACCURACY_THRESHOLD = 0.7;
  // Nearness is not enough on its own: a short wide curve like the chin almost
  // fills its own bounding box, so random scribbling inside it scores as
  // "near the line". The order the line gets covered in has to look like a
  // sweep from one end to the other, not a random jumble.
  const ORDER_THRESHOLD = 0.7;
  const HIT_RADIUS_DESIGN = 16; // tight enough to stay neat, kind to small hands
  const SAMPLE_SPACING = 8;
  // While a stylus is in use, ignore fingers: palm rejection.
  const PALM_REJECT_MS = 1500;

  const I18N = {
    id: {
      title: "Gambar Orang",
      subtitle: "Langkah demi langkah",
      start: "Mulai!",
      pickTitle: "Pilih teman",
      back: "Kembali",
      stepOf: (n, t) => `Langkah ${n}/${t}`,
      lineOf: (n, t) => `garis ${n}/${t}`,
      hintTrace: "Ikuti garis putus-putus sampai habis ✎",
      hintColor: "Sentuh bagian, lalu pilih warna",
      region: "Bagian",
      cobaLagi: "Coba lagi ✨",
      kurangRapi: "Pelan-pelan, ikuti garisnya ✨",
      belumSelesai: "Terusin sampai ujung ya ✎",
      hebat: "Hebat! ⭐",
      garisSelesai: "Bagus! Garis berikutnya…",
      langkahSelesai: "Hebat! Lanjut langkah…",
      selesaiTrace: "Selesai menggambar! Saatnya warnai 🎨",
      doneTitle: "Hebat!",
      doneSub: "Gambarmu sudah jadi.",
      gambarLagi: "Gambar lagi",
      gantiKarakter: "Ganti karakter",
      selesaiWarnai: "Selesai",
      undo: "Hapus goresan",
      langBtn: "EN",
    },
    en: {
      title: "Draw a Person",
      subtitle: "Step by step",
      start: "Start!",
      pickTitle: "Pick a friend",
      back: "Back",
      stepOf: (n, t) => `Step ${n}/${t}`,
      lineOf: (n, t) => `line ${n}/${t}`,
      hintTrace: "Follow the dashed line all the way ✎",
      hintColor: "Tap a part, then pick a color",
      region: "Part",
      cobaLagi: "Try again ✨",
      kurangRapi: "Slow down and follow the line ✨",
      belumSelesai: "Keep going to the end ✎",
      hebat: "Great! ⭐",
      garisSelesai: "Nice! Next line…",
      langkahSelesai: "Great! Next step…",
      selesaiTrace: "Drawing done! Time to color 🎨",
      doneTitle: "Awesome!",
      doneSub: "Your picture is ready.",
      gambarLagi: "Draw again",
      gantiKarakter: "Change character",
      selesaiWarnai: "Done",
      undo: "Clear stroke",
      langBtn: "ID",
    },
  };

  let lang = "id";
  let character = null;
  let stepIndex = 0;
  let strokeIndex = 0; // which guided line inside the current step
  let mode = "trace"; // trace | color | done
  let covered = []; // bool per sample for the current guided line
  let samples = []; // {x,y} design coords
  let completedOutlines = []; // array of path strings already traced
  let kidStrokes = []; // completed step strokes as point arrays
  let currentStroke = null; // [{x,y}] design space
  let fillColors = {}; // regionId -> color
  let selectedColor = null;
  let selectedRegion = null;
  let drawing = false;
  let activePointerId = null;
  let strokeMarked = []; // sample indices this pen-down covered, for rollback
  let strokePts = 0; // points the child drew during this pen-down...
  let strokeHits = 0; // ...of which this many landed on the guide
  let coverOrder = []; // per sample: when it was first covered, -1 if not yet
  let coverTick = 0;
  let orderMatters = false; // false on shapes too small to sweep along
  let lastPenAt = 0;
  let audioCtx = null;
  let reducedMotion = false;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  const canvas = $("#game-canvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  const toastEl = $("#feedback-toast");

  function t(key, ...args) {
    const v = I18N[lang][key];
    return typeof v === "function" ? v(...args) : v;
  }

  function applyI18n() {
    $$("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (I18N[lang][key] !== undefined) el.textContent = t(key);
    });
    $("#lang-toggle").textContent = t("langBtn");
    if (character) {
      updateStepUI();
      renderCharCards();
    }
  }

  /* —— Screens —— */
  function showScreen(id) {
    $$(".screen").forEach((s) => s.classList.remove("active"));
    $(`#screen-${id}`).classList.add("active");
  }

  /* —— Audio (soft WebAudio beeps) —— */
  function ensureAudio() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (_) {}
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  }

  function beep(freq, dur, type, vol) {
    if (!audioCtx || reducedMotion) return;
    try {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      g.gain.value = vol || 0.08;
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      o.stop(audioCtx.currentTime + dur);
    } catch (_) {}
  }

  function sfxCheer() {
    ensureAudio();
    beep(523, 0.12, "sine", 0.07);
    setTimeout(() => beep(659, 0.12, "sine", 0.07), 90);
    setTimeout(() => beep(784, 0.18, "triangle", 0.06), 180);
  }

  function sfxSoft() {
    ensureAudio();
    beep(440, 0.08, "sine", 0.05);
  }

  function sfxRetry() {
    ensureAudio();
    beep(330, 0.1, "triangle", 0.04);
  }

  /* —— Path utilities —— */
  function parsePathToCommands(d) {
    // Minimal SVG path parser for M L C Q Z (absolute)
    const cmds = [];
    const re = /([MLCQZmlcqz])|(-?\d*\.?\d+(?:e[-+]?\d+)?)/g;
    let match;
    let current = null;
    const nums = [];
    function flush() {
      if (!current) return;
      const c = current.toUpperCase();
      if (c === "M" || c === "L") {
        while (nums.length >= 2) {
          cmds.push({ type: c, x: nums.shift(), y: nums.shift() });
          if (c === "M") current = "L"; // implicit lineto
        }
      } else if (c === "C") {
        while (nums.length >= 6) {
          cmds.push({
            type: "C",
            x1: nums.shift(), y1: nums.shift(),
            x2: nums.shift(), y2: nums.shift(),
            x: nums.shift(), y: nums.shift(),
          });
        }
      } else if (c === "Q") {
        while (nums.length >= 4) {
          cmds.push({
            type: "Q",
            x1: nums.shift(), y1: nums.shift(),
            x: nums.shift(), y: nums.shift(),
          });
        }
      } else if (c === "Z") {
        cmds.push({ type: "Z" });
      }
      nums.length = 0;
    }
    while ((match = re.exec(d))) {
      if (match[1]) {
        flush();
        current = match[1];
        if (current.toUpperCase() === "Z") flush();
      } else {
        nums.push(parseFloat(match[2]));
      }
    }
    flush();
    return cmds;
  }

  function sampleCubic(x0, y0, x1, y1, x2, y2, x3, y3, spacing, out) {
    // Approximate length
    let len = 0;
    let px = x0, py = y0;
    for (let i = 1; i <= 20; i++) {
      const t = i / 20;
      const u = 1 - t;
      const x = u*u*u*x0 + 3*u*u*t*x1 + 3*u*t*t*x2 + t*t*t*x3;
      const y = u*u*u*y0 + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*y3;
      len += Math.hypot(x - px, y - py);
      px = x; py = y;
    }
    const n = Math.max(2, Math.ceil(len / spacing));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const u = 1 - t;
      out.push({
        x: u*u*u*x0 + 3*u*u*t*x1 + 3*u*t*t*x2 + t*t*t*x3,
        y: u*u*u*y0 + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*y3,
      });
    }
  }

  function sampleQuad(x0, y0, x1, y1, x2, y2, spacing, out) {
    let len = 0, px = x0, py = y0;
    for (let i = 1; i <= 16; i++) {
      const t = i / 16;
      const u = 1 - t;
      const x = u*u*x0 + 2*u*t*x1 + t*t*x2;
      const y = u*u*y0 + 2*u*t*y1 + t*t*y2;
      len += Math.hypot(x - px, y - py);
      px = x; py = y;
    }
    const n = Math.max(2, Math.ceil(len / spacing));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const u = 1 - t;
      out.push({
        x: u*u*x0 + 2*u*t*x1 + t*t*x2,
        y: u*u*y0 + 2*u*t*y1 + t*t*y2,
      });
    }
  }

  function sampleLine(x0, y0, x1, y1, spacing, out) {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.ceil(len / spacing));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      out.push({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t });
    }
  }

  function samplePath(d, spacing) {
    const cmds = parsePathToCommands(d);
    const out = [];
    let cx = 0, cy = 0, sx = 0, sy = 0;
    for (const c of cmds) {
      if (c.type === "M") {
        cx = c.x; cy = c.y; sx = c.x; sy = c.y;
        out.push({ x: cx, y: cy });
      } else if (c.type === "L") {
        sampleLine(cx, cy, c.x, c.y, spacing, out);
        cx = c.x; cy = c.y;
      } else if (c.type === "C") {
        sampleCubic(cx, cy, c.x1, c.y1, c.x2, c.y2, c.x, c.y, spacing, out);
        cx = c.x; cy = c.y;
      } else if (c.type === "Q") {
        sampleQuad(cx, cy, c.x1, c.y1, c.x, c.y, spacing, out);
        cx = c.x; cy = c.y;
      } else if (c.type === "Z") {
        sampleLine(cx, cy, sx, sy, spacing, out);
        cx = sx; cy = sy;
      }
    }
    return out;
  }

  function pathToCanvas2D(path2d, d) {
    const cmds = parsePathToCommands(d);
    let cx = 0, cy = 0, sx = 0, sy = 0;
    for (const c of cmds) {
      if (c.type === "M") { path2d.moveTo(c.x, c.y); cx = c.x; cy = c.y; sx = c.x; sy = c.y; }
      else if (c.type === "L") { path2d.lineTo(c.x, c.y); cx = c.x; cy = c.y; }
      else if (c.type === "C") { path2d.bezierCurveTo(c.x1, c.y1, c.x2, c.y2, c.x, c.y); cx = c.x; cy = c.y; }
      else if (c.type === "Q") { path2d.quadraticCurveTo(c.x1, c.y1, c.x, c.y); cx = c.x; cy = c.y; }
      else if (c.type === "Z") { path2d.closePath(); cx = sx; cy = sy; }
    }
  }

  function makePath2D(d) {
    const p = new Path2D();
    pathToCanvas2D(p, d);
    return p;
  }

  /* —— Canvas sizing —— */
  let viewScale = 1;
  let viewOffsetX = 0;
  let viewOffsetY = 0;

  function resizeCanvas() {
    const wrap = $(".canvas-wrap");
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    const pad = 16;
    const sx = (rect.width - pad * 2) / DESIGN_W;
    const sy = (rect.height - pad * 2) / DESIGN_H;
    viewScale = Math.min(sx, sy);
    viewOffsetX = (rect.width - DESIGN_W * viewScale) / 2;
    viewOffsetY = (rect.height - DESIGN_H * viewScale) / 2;

    draw();
  }

  function screenToDesign(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - viewOffsetX) / viewScale;
    const y = (clientY - rect.top - viewOffsetY) / viewScale;
    return { x, y };
  }

  function withDesignTransform(fn) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(viewOffsetX, viewOffsetY);
    ctx.scale(viewScale, viewScale);
    fn();
    ctx.restore();
  }

  /* —— Drawing —— */
  function drawPaperBg() {
    ctx.fillStyle = "#FFFEF8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function strokePath(d, style) {
    const p = makePath2D(d);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    Object.assign(ctx, style);
    if (style.dash) ctx.setLineDash(style.dash);
    else ctx.setLineDash([]);
    ctx.stroke(p);
    ctx.setLineDash([]);
  }

  function fillPath(d, color) {
    const p = makePath2D(d);
    ctx.fillStyle = color;
    ctx.fill(p, "evenodd");
  }

  function drawKidStroke(pts, color, width) {
    if (!pts || pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash([]);
    ctx.stroke();
  }

  function draw() {
    if (!canvas.width) return;
    drawPaperBg();
    withDesignTransform(() => {
      // Color fills (under outlines)
      if (character && (mode === "color" || mode === "done")) {
        for (const r of character.fillRegions) {
          const col = fillColors[r.id] || r.defaultColor;
          // Only show default lightly until user colored? Show always in color mode with defaults as soft
          if (fillColors[r.id]) {
            fillPath(r.path, fillColors[r.id]);
          } else if (mode === "color") {
            // soft preview tint
            ctx.globalAlpha = 0.15;
            fillPath(r.path, r.defaultColor);
            ctx.globalAlpha = 1;
          }
        }
      }

      // Completed outline paths (black)
      for (const d of completedOutlines) {
        strokePath(d, { strokeStyle: "#2C2416", lineWidth: 7.5 });
      }

      // Past kid strokes (faded under outlines look)
      for (const stroke of kidStrokes) {
        drawKidStroke(stroke, "rgba(232,122,58,0.35)", 8);
      }

      if (mode === "trace" && character) {
        const step = character.steps[stepIndex];

        // What is still to come in this step, barely there: enough to see where
        // it is heading without competing with the line to draw right now.
        ctx.globalAlpha = 0.16;
        for (let i = strokeIndex + 1; i < step.paths.length; i++) {
          strokePath(step.paths[i].d, { strokeStyle: "#5BB8B0", lineWidth: 5 });
        }
        ctx.globalAlpha = 1;

        // The one line to trace now. The band is narrower than the hit radius,
        // so staying inside it always counts.
        const cur = step.paths[strokeIndex].d;
        strokePath(cur, { strokeStyle: "rgba(91,184,176,0.4)", lineWidth: 22 });
        strokePath(cur, { strokeStyle: "#5BB8B0", lineWidth: 4, dash: [10, 10] });

        // Green beads fill in as they go, so any gap left behind is obvious.
        for (let i = 0; i < samples.length; i++) {
          if (!covered[i]) continue;
          const s = samples[i];
          ctx.beginPath();
          ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(107,191,138,0.75)";
          ctx.fill();
        }

        // Where to put the pen down.
        if (samples.length && !covered[0]) {
          const s = samples[0];
          ctx.beginPath();
          ctx.arc(s.x, s.y, 12, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(232,122,58,0.2)";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = "#E87A3A";
          ctx.fill();
        }

        if (currentStroke) {
          drawKidStroke(currentStroke, "#E87A3A", 9);
        }
      }

      if (mode === "color" && selectedRegion) {
        const r = character.fillRegions.find((x) => x.id === selectedRegion);
        if (r) {
          strokePath(r.path, { strokeStyle: "#CE93D8", lineWidth: 3, dash: [6, 4] });
        }
      }

      // Always draw full completed black outline on top in color/done
      if (mode === "color" || mode === "done") {
        for (const d of completedOutlines) {
          strokePath(d, { strokeStyle: "#2C2416", lineWidth: 7 });
        }
      }
    });
  }

  /* —— Trace logic —— */

  /** The one line the child is being guided through right now. */
  function currentLine() {
    if (!character) return null;
    const step = character.steps[stepIndex];
    return step ? step.paths[strokeIndex] : null;
  }

  function resetStrokeStats() {
    strokeMarked = [];
    strokePts = 0;
    strokeHits = 0;
  }

  /** Share of this pen-down that landed on the guide. */
  function strokeAccuracy() {
    return strokePts ? strokeHits / strokePts : 1;
  }

  /** Take back everything this pen-down covered — used when it went off-line. */
  function rollbackStroke() {
    for (const i of strokeMarked) {
      covered[i] = false;
      coverOrder[i] = -1;
    }
    resetStrokeStats();
  }

  /** Start this guided line over from nothing. */
  function resetLineProgress() {
    covered = covered.map(() => false);
    coverOrder = coverOrder.map(() => -1);
    coverTick = 0;
    resetStrokeStats();
  }

  /**
   * How much the line was covered in one sweeping direction. A real trace fills
   * the samples in order (either way round); a scribble fills them at random,
   * which lands near 0.5.
   */
  function traceOrderliness() {
    // On a cheek or a hair tie — smaller across than the hit radius — one dab
    // of the pen reaches most of the line, so the order samples fill in says
    // nothing. Coverage and accuracy still have to be met.
    if (!orderMatters) return 1;
    const times = [];
    for (let i = 0; i < coverOrder.length; i++) {
      if (coverOrder[i] >= 0) times.push(coverOrder[i]);
    }
    // Samples covered by the same pen point share a tick; those ties say
    // nothing about direction, so they are not counted either way.
    let rising = 0;
    let falling = 0;
    for (let i = 1; i < times.length; i++) {
      if (times[i] > times[i - 1]) rising++;
      else if (times[i] < times[i - 1]) falling++;
    }
    const moves = rising + falling;
    if (moves < 3) return 1;
    return Math.max(rising, falling) / moves;
  }

  function loadStrokeSamples() {
    const line = currentLine();
    samples = line ? samplePath(line.d, SAMPLE_SPACING) : [];
    covered = new Array(samples.length).fill(false);
    coverOrder = new Array(samples.length).fill(-1);
    coverTick = 0;

    let length = 0;
    for (let i = 1; i < samples.length; i++) {
      length += Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y);
    }
    orderMatters = length > HIT_RADIUS_DESIGN * 8;

    resetStrokeStats();
  }

  /**
   * Coverage is taken from the interpolated stroke, so the gaps between the
   * points a device reports still count. Every sample reached by one pen point
   * shares that point's tick, which keeps traceOrderliness unbiased.
   */
  function markCoverage(pts) {
    const r2 = HIT_RADIUS_DESIGN * HIT_RADIUS_DESIGN;
    for (const p of pts) {
      const tick = coverTick++;
      for (let i = 0; i < samples.length; i++) {
        if (covered[i]) continue;
        const s = samples[i];
        const dx = p.x - s.x;
        const dy = p.y - s.y;
        if (dx * dx + dy * dy <= r2) {
          covered[i] = true;
          coverOrder[i] = tick;
          strokeMarked.push(i);
        }
      }
    }
  }

  /**
   * Neatness is judged only on points the pen actually reported. Scoring the
   * interpolated ones would flatter a zigzag across the guide, because the
   * filled-in segments keep crossing the line.
   */
  function markAccuracy(pts) {
    const r2 = HIT_RADIUS_DESIGN * HIT_RADIUS_DESIGN;
    for (const p of pts) {
      strokePts++;
      for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        const dx = p.x - s.x;
        const dy = p.y - s.y;
        if (dx * dx + dy * dy <= r2) {
          strokeHits++;
          break;
        }
      }
    }
  }

  function coverageRatio() {
    if (!samples.length) return 0;
    let n = 0;
    for (const c of covered) if (c) n++;
    return n / samples.length;
  }

  function finishStrokeSuccess() {
    const step = character.steps[stepIndex];
    completedOutlines.push(step.paths[strokeIndex].d);
    if (currentStroke && currentStroke.length > 1) {
      kidStrokes.push(currentStroke.slice());
    }
    currentStroke = null;
    resetStrokeStats();

    const lastLine = strokeIndex >= step.paths.length - 1;
    const lastStep = stepIndex >= character.steps.length - 1;

    if (lastLine && lastStep) {
      sfxCheer();
      mode = "color-pending";
      draw();
      setTimeout(() => {
        enterColorMode();
      }, reducedMotion ? 200 : 700);
      return;
    }

    if (lastLine) {
      sfxCheer();
      showToast(t("langkahSelesai"), "cheer");
      stepIndex++;
      strokeIndex = 0;
    } else {
      sfxSoft();
      showToast(t("garisSelesai"), "cheer");
      strokeIndex++;
    }
    loadStrokeSamples();
    updateStepUI();
    draw();
  }

  function enterColorMode() {
    mode = "color";
    currentStroke = null;
    selectedColor = character.palette[0];
    selectedRegion = null;
    fillColors = {};
    showToast(t("selesaiTrace"), "cheer");
    updateStepUI();
    buildPalette();
    $("#palette").classList.add("visible");
    $("#region-hint").classList.add("visible");
    $("#btn-done-color").style.display = "";
    $("#btn-undo").style.display = "none";
    $("#hint-trace").style.display = "none";
    draw();
  }

  function updateStepUI() {
    if (!character) return;
    const total = character.steps.length;
    const badge = $("#step-badge");
    const label = $("#step-label");
    const lineBadge = $("#stroke-badge");
    const dots = $("#progress-dots");

    if (mode === "trace") {
      const step = character.steps[stepIndex];
      const line = step.paths[strokeIndex];
      const stepName = lang === "id" ? step.labelId : step.labelEn;
      const lineName = lang === "id" ? line.labelId : line.labelEn;
      badge.textContent = t("stepOf", stepIndex + 1, total);
      label.textContent = stepName === lineName ? stepName : stepName + " · " + lineName;
      lineBadge.textContent = t("lineOf", strokeIndex + 1, step.paths.length);
      lineBadge.style.display = "";
      $("#hint-trace").textContent = t("hintTrace");
      $("#hint-trace").style.display = "";
    } else if (mode === "color") {
      badge.textContent = lang === "id" ? "Warnai" : "Color";
      label.textContent = t("hintColor");
      lineBadge.style.display = "none";
      $("#hint-trace").style.display = "none";
    } else {
      badge.textContent = "★";
      label.textContent = t("doneTitle");
      lineBadge.style.display = "none";
    }

    dots.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const d = document.createElement("span");
      d.className = "dot";
      if (mode !== "trace") d.classList.add("done");
      else if (i < stepIndex) d.classList.add("done");
      else if (i === stepIndex) d.classList.add("current");
      dots.appendChild(d);
    }
    if (mode === "color" || mode === "done") {
      const c = document.createElement("span");
      c.className = "dot color-mode current";
      dots.appendChild(c);
    }
  }

  function showToast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = "feedback-toast show " + (kind || "");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toastEl.classList.remove("show");
    }, 1600);
  }

  /* —— Pointer / stylus —— */

  /** Once the stylus is in play, a palm landing on the glass must not draw. */
  function pointerAllowed(e) {
    if (e.pointerType === "pen") {
      lastPenAt = Date.now();
      return true;
    }
    if (e.pointerType === "touch" && Date.now() - lastPenAt < PALM_REJECT_MS) {
      return false;
    }
    return true;
  }

  function lineDone() {
    return (
      coverageRatio() >= COVER_THRESHOLD &&
      strokeAccuracy() >= ACCURACY_THRESHOLD &&
      traceOrderliness() >= ORDER_THRESHOLD
    );
  }

  function onPointerDown(e) {
    if (mode === "done" || mode === "color-pending") return;
    if (!pointerAllowed(e)) return;
    ensureAudio();
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}

    if (mode === "color") {
      handleColorTap(e);
      return;
    }

    if (drawing) return; // a second finger must not hijack the stroke
    drawing = true;
    activePointerId = e.pointerId;
    resetStrokeStats();
    const p = screenToDesign(e.clientX, e.clientY);
    currentStroke = [p];
    markAccuracy([p]);
    markCoverage([p]);
    draw();
  }

  function onPointerMove(e) {
    // Apple Pencil reports hover moves; keep the palm-rejection window warm.
    if (e.pointerType === "pen") lastPenAt = Date.now();
    if (!drawing || mode !== "trace") return;
    if (activePointerId !== null && e.pointerId !== activePointerId) return;
    e.preventDefault();

    // Coalesced events give the full stylus sample rate rather than one point
    // per frame, which is what makes a traced curve land accurately.
    // Some pointer events carry no coalesced list; fall back to the event itself.
    let raw = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
    if (!raw || !raw.length) raw = [e];
    const penPts = [];
    const mid = [];
    for (const ev of raw) {
      const p = screenToDesign(ev.clientX, ev.clientY);
      const last = currentStroke[currentStroke.length - 1];
      if (last && Math.hypot(p.x - last.x, p.y - last.y) < 0.7) continue;
      if (last) {
        const dist = Math.hypot(p.x - last.x, p.y - last.y);
        const n = Math.ceil(dist / 4);
        for (let i = 1; i <= n; i++) {
          mid.push({
            x: last.x + (p.x - last.x) * (i / n),
            y: last.y + (p.y - last.y) * (i / n),
          });
        }
      } else {
        mid.push(p);
      }
      penPts.push(p);
      currentStroke.push(p);
    }
    if (!mid.length) return;

    markAccuracy(penPts);
    markCoverage(mid);
    draw();

    if (lineDone()) {
      drawing = false;
      activePointerId = null;
      try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
      finishStrokeSuccess();
    }
  }

  function onPointerUp(e) {
    if (mode !== "trace" || !drawing) return;
    if (activePointerId !== null && e.pointerId !== activePointerId) return;
    e.preventDefault();
    drawing = false;
    activePointerId = null;

    if (lineDone()) {
      finishStrokeSuccess();
      return;
    }

    if (currentStroke && currentStroke.length > 3) {
      sfxRetry();
      if (strokeAccuracy() < ACCURACY_THRESHOLD) {
        // Drawn off the guide: that attempt earns nothing.
        rollbackStroke();
        showToast(t("kurangRapi"), "retry");
      } else if (coverageRatio() >= COVER_THRESHOLD) {
        // Every bit is covered, but not by tracing it — scribbled over. Start
        // the line again rather than hand it to them.
        resetLineProgress();
        showToast(t("kurangRapi"), "retry");
      } else {
        // On the guide but stopped short: keep what they traced and nudge them
        // to carry on to the end.
        resetStrokeStats();
        showToast(t("belumSelesai"), "retry");
      }
    } else {
      resetStrokeStats();
    }
    currentStroke = null;
    draw();
  }

  function handleColorTap(e) {
    const p = screenToDesign(e.clientX, e.clientY);
    const regions = character.fillRegions.slice().reverse();
    let hit = null;
    // isPointInPath(path, x, y): path transformed by CTM; x,y in canvas pixel space
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * dpr;
    const cy = (e.clientY - rect.top) * dpr;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(viewOffsetX, viewOffsetY);
    ctx.scale(viewScale, viewScale);
    for (const r of regions) {
      const path = makePath2D(r.path);
      if (ctx.isPointInPath(path, cx, cy)) {
        hit = r;
        break;
      }
    }
    ctx.restore();

    if (hit) {
      selectedRegion = hit.id;
      const name = lang === "id" ? hit.labelId : hit.labelEn;
      $("#region-hint").textContent = `${t("region")}: ${name}`;
      if (selectedColor) {
        fillColors[hit.id] = selectedColor;
        sfxSoft();
      }
      draw();
    }
  }

  function buildPalette() {
    const pal = $("#palette");
    pal.innerHTML = "";
    character.palette.forEach((color, i) => {
      const b = document.createElement("button");
      b.className = "swatch" + (i === 0 ? " selected" : "");
      b.style.background = color;
      b.setAttribute("aria-label", color);
      b.addEventListener("click", () => {
        selectedColor = color;
        $$(".swatch").forEach((s) => s.classList.remove("selected"));
        b.classList.add("selected");
        sfxSoft();
        if (selectedRegion) {
          fillColors[selectedRegion] = color;
          draw();
        }
      });
      pal.appendChild(b);
    });
    selectedColor = character.palette[0];
  }

  /* —— Character cards —— */
  function renderCharCards() {
    const grid = $("#char-grid");
    grid.innerHTML = "";
    window.GAMBOR_CHARACTERS.forEach((ch) => {
      const card = document.createElement("button");
      card.className = "char-card";
      card.type = "button";
      const preview = document.createElement("div");
      preview.className = "char-preview";
      const cv = document.createElement("canvas");
      cv.width = 200;
      cv.height = 250;
      preview.appendChild(cv);
      const span = document.createElement("span");
      span.textContent = (lang === "id" ? ch.nameId : ch.nameEn) + " " + ch.emoji;
      card.appendChild(preview);
      card.appendChild(span);
      card.addEventListener("click", () => startGame(ch.id));
      grid.appendChild(card);
      drawCharPreview(cv, ch);
    });
  }

  function drawCharPreview(cv, ch) {
    const c = cv.getContext("2d");
    c.fillStyle = "#FFFEF8";
    c.fillRect(0, 0, cv.width, cv.height);
    const sc = Math.min(cv.width / DESIGN_W, cv.height / DESIGN_H) * 0.92;
    const ox = (cv.width - DESIGN_W * sc) / 2;
    const oy = (cv.height - DESIGN_H * sc) / 2;
    c.save();
    c.translate(ox, oy);
    c.scale(sc, sc);
    for (const r of ch.fillRegions) {
      const p = makePath2D(r.path);
      c.fillStyle = r.defaultColor;
      c.globalAlpha = 0.85;
      c.fill(p, "evenodd");
      c.globalAlpha = 1;
    }
    c.lineCap = "round";
    c.lineJoin = "round";
    c.strokeStyle = "#2C2416";
    c.lineWidth = 7;
    for (const step of ch.steps) {
      for (const line of step.paths) {
        c.stroke(makePath2D(line.d));
      }
    }
    c.restore();
  }

  function startGame(charId) {
    character = window.GAMBOR_CHARACTERS.find((c) => c.id === charId);
    stepIndex = 0;
    strokeIndex = 0;
    mode = "trace";
    completedOutlines = [];
    kidStrokes = [];
    currentStroke = null;
    fillColors = {};
    selectedRegion = null;
    drawing = false;
    activePointerId = null;
    loadStrokeSamples();
    $("#palette").classList.remove("visible");
    $("#region-hint").classList.remove("visible");
    $("#btn-done-color").style.display = "none";
    $("#btn-undo").style.display = "";
    $("#overlay-done").classList.remove("visible");
    showScreen("play");
    updateStepUI();
    requestAnimationFrame(() => {
      resizeCanvas();
      draw();
    });
    sfxSoft();
  }

  function showDone() {
    mode = "done";
    sfxCheer();
    $("#overlay-done").classList.add("visible");
    $("#done-title").textContent = t("doneTitle");
    $("#done-sub").textContent = t("doneSub");
    draw();
  }

  /* —— Init —— */
  function init() {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    $("#btn-start").addEventListener("click", () => {
      ensureAudio();
      renderCharCards();
      showScreen("pick");
      sfxSoft();
    });

    $("#btn-back-pick").addEventListener("click", () => showScreen("title"));
    $("#btn-back-play").addEventListener("click", () => {
      showScreen("pick");
      renderCharCards();
    });

    $("#lang-toggle").addEventListener("click", () => {
      lang = lang === "id" ? "en" : "id";
      applyI18n();
    });

    $("#btn-undo").addEventListener("click", () => {
      if (mode !== "trace") return;
      currentStroke = null;
      // wipe only the line in progress so they can retrace it cleanly
      resetLineProgress();
      draw();
      showToast(t("cobaLagi"), "retry");
      sfxRetry();
    });

    $("#btn-done-color").addEventListener("click", showDone);
    $("#btn-gambar-lagi").addEventListener("click", () => {
      $("#overlay-done").classList.remove("visible");
      startGame(character.id);
    });
    $("#btn-ganti").addEventListener("click", () => {
      $("#overlay-done").classList.remove("visible");
      showScreen("pick");
      renderCharCards();
    });

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    // Prevent scroll/zoom while drawing
    canvas.addEventListener("touchstart", (e) => e.preventDefault(), { passive: false });
    canvas.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });

    window.addEventListener("resize", () => {
      if ($("#screen-play").classList.contains("active")) resizeCanvas();
    });
    window.addEventListener("orientationchange", () => {
      setTimeout(resizeCanvas, 200);
    });

    applyI18n();
    showScreen("title");
  }


  // Debug API for preview screenshots / QA (not shown in UI)
  window.__gambarDebug = {
    getState: () => ({ mode, stepIndex, strokeIndex, lang, charId: character && character.id, coverage: coverageRatio(), accuracy: strokeAccuracy(), orderliness: traceOrderliness() }),
    // Lets a test drive real pointer events along the guide the child sees.
    getSamples: () => samples.map((s) => ({ x: s.x, y: s.y })),
    designToClient: (x, y) => {
      const rect = canvas.getBoundingClientRect();
      return { x: rect.left + viewOffsetX + x * viewScale, y: rect.top + viewOffsetY + y * viewScale };
    },
    forceCompleteLine: () => {
      if (mode !== "trace" || !character) return false;
      covered = covered.map(() => true);
      finishStrokeSuccess();
      return true;
    },
    forceCompleteStep: async () => {
      if (mode !== "trace" || !character) return false;
      const target = stepIndex;
      while (mode === "trace" && stepIndex === target) {
        covered = covered.map(() => true);
        finishStrokeSuccess();
        await new Promise((r) => setTimeout(r, 20));
      }
      return true;
    },
    completeAllTrace: async () => {
      while (mode === "trace") {
        covered = covered.map(() => true);
        finishStrokeSuccess();
        await new Promise((r) => setTimeout(r, 20));
      }
      return mode;
    },
    fillDefaults: () => {
      if (!character) return;
      for (const r of character.fillRegions) fillColors[r.id] = r.defaultColor;
      draw();
    },
    jumpToColor: async () => {
      while (mode === "trace") {
        covered = covered.map(() => true);
        finishStrokeSuccess();
        await new Promise((r) => setTimeout(r, 12));
      }
      // wait for enterColorMode timeout
      for (let i = 0; i < 60 && mode !== "color"; i++) {
        await new Promise((r) => setTimeout(r, 50));
      }
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
