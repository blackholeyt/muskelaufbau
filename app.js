(function () {
  "use strict";
  const BC = { T: "var(--t)", E: "var(--e)", S: "var(--s)", R: "var(--r)" };
  const BK = { T: "t", E: "e", S: "s", R: "r" };
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const de = (v, d = 1) => { const r = Math.round(v * Math.pow(10, d)) / Math.pow(10, d); let t = r.toFixed(d); if (t.indexOf(".") >= 0) t = t.replace(/0+$/, "").replace(/\.$/, ""); return t.replace(".", ",").replace("-", "−"); };
  const sgn = (v, d = 1) => { const r = Math.round(v * Math.pow(10, d)) / Math.pow(10, d); if (r === 0) return "±0"; return (r > 0 ? "+" : "") + de(r, d); };
  const r1 = v => Math.round(v * 10) / 10;

  /* Evidenz-Punkte */
  function dots(key) {
    if (!key || !EV[key]) return "";
    const d = EV[key].dots; let h = "";
    for (let i = 1; i <= 4; i++) h += '<i class="' + (d >= i ? "on" : d >= i - 0.5 ? "half" : "") + '"></i>';
    return '<span class="dots" aria-hidden="true">' + h + "</span>";
  }
  $$("[data-ev]").forEach(el => { const k = el.dataset.ev; el.innerHTML = dots(k) + '<span>Evidenz ' + EV[k].label + "</span>"; el.title = "Evidenzstufe: " + EV[k].label; });

  /* Tooltip */
  const tip = $("#tip"); const TIPS = new Map(); let tipId = 0;
  const regTip = html => { const id = "t" + (++tipId); TIPS.set(id, html); return id; };
  function showTip(e, id) {
    tip.innerHTML = TIPS.get(id) || ""; tip.classList.add("on");
    const pt = e.touches ? e.touches[0] : e; const w = tip.offsetWidth, h = tip.offsetHeight;
    let x = pt.clientX + 14, y = pt.clientY + 16;
    if (x + w > innerWidth - 8) x = pt.clientX - w - 14;
    if (y + h > innerHeight - 8) y = pt.clientY - h - 14;
    tip.style.left = Math.max(8, x) + "px"; tip.style.top = Math.max(8, y) + "px";
  }
  const hideTip = () => tip.classList.remove("on");
  document.addEventListener("mousemove", e => { const t = e.target.closest && e.target.closest("[data-tip]"); if (t) showTip(e, t.dataset.tip); else hideTip(); });
  document.addEventListener("touchstart", e => { const t = e.target.closest && e.target.closest("[data-tip]"); if (t) showTip(e, t.dataset.tip); else hideTip(); }, { passive: true });
  document.addEventListener("focusin", e => { const t = e.target.closest && e.target.closest("[data-tip]"); if (t) { const b = t.getBoundingClientRect(); showTip({ clientX: b.right, clientY: b.top }, t.dataset.tip); } });
  document.addEventListener("focusout", hideTip);
  window.addEventListener("scroll", hideTip, { passive: true });

  const W = el => Math.max(280, Math.round(el.clientWidth || el.parentNode.clientWidth || 600));
  const svgOpen = (w, h, label) => '<svg viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="' + esc(label || "") + '">';
  const txt = (x, y, s, cls, anchor, extra) => '<text x="' + r1(x) + '" y="' + r1(y) + '" class="' + (cls || "") + '"' + (anchor ? ' text-anchor="' + anchor + '"' : "") + (extra || "") + ">" + s + "</text>";
  const ticks = (a, b, n) => { const span = b - a, raw = span / n, mag = Math.pow(10, Math.floor(Math.log10(raw))); const st = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => span / s <= n) || raw; const t = []; for (let v = Math.ceil(a / st - 1e-9) * st; v <= b + 1e-9; v += st) t.push(Math.round(v * 1000) / 1000); return t; };
  const barPath = (x0, x1, y, h, rad, roundEnd) => {
    // rechteckiger Balken, abgerundet nur am Datenende
    const l = Math.min(x0, x1), r = Math.max(x0, x1), w = r - l; const rr = Math.min(rad, w / 2, h / 2);
    if (w < 0.5) return "";
    if (roundEnd === "right") return "M" + l + "," + y + "H" + (r - rr) + "Q" + r + "," + y + " " + r + "," + (y + rr) + "V" + (y + h - rr) + "Q" + r + "," + (y + h) + " " + (r - rr) + "," + (y + h) + "H" + l + "Z";
    return "M" + r + "," + y + "H" + (l + rr) + "Q" + l + "," + y + " " + l + "," + (y + rr) + "V" + (y + h - rr) + "Q" + l + "," + (y + h) + " " + (l + rr) + "," + (y + h) + "H" + r + "Z";
  };

  /* ---------- Hantel ---------- */
  function barbell(el, plan, opt) {
    opt = opt || {};
    const w = W(el), dark = !!opt.dark;
    const H = opt.h || Math.round(Math.min(250, Math.max(150, w * 0.2)));
    const d = planDetail(plan, opt.weighted !== false);
    const cy = H / 2, D = H * 0.86;                         // Scheibendurchmesser
    const sleeveLen = Math.min(w * 0.33, 360), collarW = Math.max(8, w * 0.012);
    const gripL = sleeveLen + collarW + 6, gripR = w - gripL;
    const k = (sleeveLen - 6) / 62;                          // px pro MP (feste Skala)
    let s = svgOpen(w, H, opt.label || "Hantel");
    const barC = dark ? "#8d96a0" : "var(--bar)";
    // Stange
    s += '<rect x="2" y="' + r1(cy - H * 0.03) + '" width="' + (w - 4) + '" height="' + r1(H * 0.06) + '" rx="' + r1(H * 0.03) + '" fill="' + barC + '"/>';
    // Rändelung (Griff)
    for (let x = gripL + 30; x < gripR - 30; x += 5) s += '<line x1="' + x + '" x2="' + x + '" y1="' + r1(cy - H * 0.028) + '" y2="' + r1(cy + H * 0.028) + '" stroke="' + (dark ? "#6f7882" : "var(--line-2)") + '" stroke-width="1" opacity=".55"/>';
    // Hülsen
    [[2, sleeveLen], [w - 2 - sleeveLen, sleeveLen]].forEach(([x, len]) => { s += '<rect x="' + r1(x) + '" y="' + r1(cy - H * 0.045) + '" width="' + r1(len) + '" height="' + r1(H * 0.09) + '" rx="3" fill="' + barC + '"/>'; });
    // Innere Bunde
    [sleeveLen + 2, w - 2 - sleeveLen - collarW].forEach(x => { s += '<rect x="' + r1(x) + '" y="' + r1(cy - H * 0.12) + '" width="' + r1(collarW) + '" height="' + r1(H * 0.24) + '" rx="3" fill="' + (dark ? "#a7afb8" : "var(--steel)") + '"/>'; });
    // Scheiben
    const factor = d.factor;
    const plates = d.pos.map(p => ({ g: p.g, o: p.o, v: p.eff * factor, raw: p.v, sign: 1 }));
    const ghosts = d.neg.map(p => ({ g: p.g, o: p.o, v: Math.abs(p.eff) * factor, raw: p.v, sign: -1 }));
    const keys = new Set();
    const drawSide = (dir) => {
      let x = dir > 0 ? w - 2 - sleeveLen : sleeveLen + 2; // Startpunkt an der Innenseite der Hülse
      const items = plates.concat(ghosts);
      items.forEach((p, i) => {
        const pk = p.g.id + ":" + p.o.id;
        const anim = opt.intro ? ' plate-in" style="--i:' + i + ";--dx:" + (dir * 160) + 'px;--d0:' + (opt.d0 || 1.1) + 's' : (opt.prev && !opt.prev.has(pk) ? ' plate-new" style="--dx:' + (dir * 60) + 'px' : "");
        keys.add(pk);
        const th = Math.max(2.2, p.v * k);
        const small = p.v < 4.5;
        const dia = small ? D * (0.46 + Math.min(1, p.v / 4.5) * 0.24) : D;
        const gap = 1.5;
        const x0 = dir > 0 ? x + gap : x - gap - th;
        if (dir > 0 ? x0 + th > w - 4 : x0 < 4) return;
        const y0 = cy - dia / 2;
        const col = BC[p.g.block];
        const tipHtml = "<b>" + esc(p.g.title) + (p.g.toggle ? "" : " · " + esc(p.o.label)) + "</b>" + (p.sign < 0 ? "kostet " : "") + '<span class="n">' + sgn(p.sign * p.v) + " MP</span> im Plan" + (p.o.why ? "<br>" + esc(p.o.why) : "");
        const id = regTip(tipHtml);
        if (p.sign > 0) {
          s += '<g class="plate' + anim + '" data-tip="' + id + '" tabindex="0" role="img" aria-label="' + esc(p.g.title + ": " + sgn(p.v) + " Muskelpunkte") + '">';
          s += '<rect x="' + r1(x0) + '" y="' + r1(y0) + '" width="' + r1(th) + '" height="' + r1(dia) + '" rx="' + r1(Math.min(4, th / 2.4)) + '" fill="' + col + '"/>';
          if (th > 7) s += '<rect x="' + r1(x0 + th * 0.18) + '" y="' + r1(y0 + 3) + '" width="' + r1(Math.max(1, th * 0.12)) + '" height="' + r1(dia - 6) + '" rx="1" fill="#fff" opacity=".22"/>';
          if (th > 15 && !opt.mini) s += '<text x="' + r1(x0 + th / 2) + '" y="' + r1(cy) + '" transform="rotate(-90 ' + r1(x0 + th / 2) + " " + r1(cy) + ')" text-anchor="middle" dominant-baseline="central" fill="' + (p.g.block === "R" ? "#2a2100" : "#fff") + '" font-family="Anton, sans-serif" font-size="' + Math.min(15, th * 0.62) + '" opacity=".95">' + esc(SHORT[p.g.id + ":" + p.o.id] || p.g.title) + "</text>";
          s += "</g>";
        } else {
          s += '<g class="plate' + anim + '" data-tip="' + id + '" tabindex="0" role="img" aria-label="' + esc(p.g.title + ": " + sgn(-p.v) + " Muskelpunkte") + '"><rect x="' + r1(x0 + 0.75) + '" y="' + r1(y0) + '" width="' + r1(Math.max(1.5, th - 1.5)) + '" height="' + r1(dia) + '" rx="3" fill="none" stroke="' + (dark ? "#f08a83" : "var(--neg)") + '" stroke-width="1.5" stroke-dasharray="4 3"/></g>';
        }
        x = dir > 0 ? x0 + th : x0;
      });
    };
    drawSide(1); drawSide(-1);
    // Faktor-Marke
    if (Math.abs(factor - 1) > 0.001 && !opt.mini && w >= 560) {
      const fx = w / 2;
      s += '<text x="' + fx + '" y="' + r1(cy - H * 0.11) + '" text-anchor="middle" class="plate-label strong"' + (dark ? ' style="fill:#eef0f3"' : "") + '>' + d.factors.map(f => esc(SHORT[f.g.id + ":" + f.o.id] || f.o.label)).join(" · ") + " × " + de(factor, 2) + "</text>";
    }
    if (opt.center && w >= 760) s += '<text x="' + w / 2 + '" y="' + r1(cy + H * 0.2) + '" text-anchor="middle" class="plate-label">' + opt.center + "</text>";
    s += "</svg>";
    el.innerHTML = s;
    d.keys = keys;
    return d;
  }

  /* ---------- Generische Balkengrafik (horizontal) ---------- */
  function hbars(el, rows, o) {
    o = o || {};
    const w = W(el), top = o.top || 22, bot = 26;
    let labelW = Math.min(o.labelW || 190, w * 0.42);
    const stacked = rows.some(r => String(r.label).length * 6.6 > labelW);
    const rowH = stacked ? Math.max(o.rowH || 30, 44) : (o.rowH || 30);
    if (stacked) labelW = 0;
    const h = top + rows.length * rowH + bot;
    let min = o.min, max = o.max;
    if (min === undefined) min = Math.min(0, ...rows.map(r => r.lo !== undefined ? r.lo : r.v));
    if (max === undefined) max = Math.max(0, ...rows.map(r => r.hi !== undefined ? r.hi : r.v));
    const x0 = stacked ? 4 : labelW + 8, x1 = w - (o.right || 46);
    const X = v => x0 + (v - min) / (max - min) * (x1 - x0);
    let s = svgOpen(w, h, o.label);
    if (o.band) s += '<rect x="' + r1(X(o.band[0])) + '" y="' + (top - 6) + '" width="' + r1(X(o.band[1]) - X(o.band[0])) + '" height="' + (rows.length * rowH + 6) + '" fill="' + (o.bandColor || "var(--s)") + '" opacity=".1"/>' + txt((X(o.band[0]) + X(o.band[1])) / 2, top - 9, o.bandLabel || "", "ax", "middle");
    ticks(min, max, o.ticks || 6).forEach(t => { s += '<line class="' + (t === 0 ? "zero" : "gridl") + '" x1="' + r1(X(t)) + '" x2="' + r1(X(t)) + '" y1="' + (top - 4) + '" y2="' + (h - bot + 2) + '"/>' + txt(X(t), h - 8, (o.tickFmt || (v => de(v)))(t), "ax", "middle"); });
    if (o.axisTitle) s += txt(x1, top - 9, o.axisTitle, "ax-title", "end");
    rows.forEach((r, i) => {
      const y = top + i * rowH, bh = Math.min(18, rowH - 10), by = stacked ? y + rowH - bh - 4 : y + (rowH - bh) / 2;
      const col = r.color || "var(--iron)";
      if (stacked) s += txt(x0, y + 13, esc(r.label), "lbl", "start", r.bold ? ' font-weight="600"' : "");
      else s += txt(labelW, y + rowH / 2 + 4, esc(r.label), "lbl", "end", r.bold ? ' font-weight="600"' : "");
      const vy = stacked ? by + bh / 2 + 4 : y + rowH / 2 + 4;
      if (r.lo !== undefined) {
        const a = X(r.lo), b = X(r.hi);
        s += '<rect class="an gx" style="--i:' + i + '" x="' + r1(a) + '" y="' + r1(by) + '" width="' + r1(Math.max(3, b - a)) + '" height="' + bh + '" rx="4" fill="' + col + '"' + (r.open ? ' opacity=".9"' : "") + "/>";
        if (r.mean !== undefined) s += '<rect class="fadel" x=""' + r1(X(r.mean) - 1.5) + '" y="' + r1(by - 4) + '" width="3" height="' + (bh + 8) + '" rx="1.5" fill="var(--iron)"/>';
        if (r.open) s += '<path class="fadel" d="M' + r1(b + 3) + "," + r1(by + 2) + " l7," + (bh / 2 - 2) + " l-7," + (bh / 2 - 2) + 'z" fill="' + col + '"/>';
        if (r.valText) s += (r.valLeft ? txt(Math.min(a, b) - 6, vy, r.valText, "val", "end") : txt(Math.max(a, b) + (r.open ? 14 : 6), vy, r.valText, "val"));
      } else {
        const a = X(0), b = X(r.v);
        s += '<path class="an ' + (r.v >= 0 ? "gx" : "gxr") + '" style="--i:' + i + '" d="' + barPath(a, b, by, bh, 4, r.v >= 0 ? "right" : "left") + '" fill="' + col + '"' + (r.opacity ? ' opacity="' + r.opacity + '"' : "") + "/>";
        const vt = r.valText !== undefined ? r.valText : sgn(r.v), vw = vt.length * 7 + 8;
        let tx = r.v >= 0 ? b + 6 : b - 6, anc = r.v >= 0 ? "start" : "end", inside = false;
        if (r.v < 0 && b - vw < x0 - 4) { tx = b + 6; anc = "start"; inside = true; }
        if (r.v >= 0 && b + vw > w) { tx = b - 6; anc = "end"; inside = true; }
        s += txt(tx, vy, vt, "val", anc, inside ? ' style="fill:' + (r.insideInk || "#fff") + '"' : "");
      }
      if (r.tip) s += '<rect class="hit" x="0" y="' + y + '" width="' + w + '" height="' + rowH + '" data-tip="' + regTip(r.tip) + '"/>';
    });
    s += "</svg>";
    el.innerHTML = s;
  }

  /* ---------- Grafiken ---------- */
  const rowsByKey = () => { const m = {}; allRows(true).forEach(r => { m[r.key] = r; }); return m; };
  const methodTip = r => "<b>" + esc(r.g.title) + (r.g.toggle ? "" : " · " + esc(r.o.label)) + "</b>" + '<span class="n">' + sgn(r.mp) + " MP · " + sgn(r.lp) + " LP</span><br>" + esc(r.o.why || "") + "<br><span style=\"opacity:.7\">" + BLOCKS[r.g.block] + " · " + r.g.doc + " · Evidenz " + (r.o.em ? EV[r.o.em].label : "–") + "</span>";

  function chLevers() {
    const m = rowsByKey();
    const keys = ["kcal:d500", "prog:p0", "kcal:d250", "reps:rh", "macro:keto", "rom:sp", "cardio:bad", "cold:on", "rest:r60", "vol:v16", "prot:p19", "ex:e1", "meals:on", "rir:r12", "kcal:s300", "krea:on", "sleep:s8"];
    const rows = keys.map(k => m[k]).sort((a, b) => b.mp - a.mp).map(r => ({ label: SHORT[r.key] || r.g.title, v: r.mp, color: BC[r.g.block], tip: methodTip(r) }));
    hbars($("#ch-levers"), rows, { labelW: 170, rowH: 28, label: "Größte Hebel in Muskelpunkten", axisTitle: "Muskelpunkte (MP)", right: 52 });
  }

  function chVolume() {
    const el = $("#ch-volume"), w = W(el), h = Math.round(Math.min(320, w * 0.62));
    const m = { l: 40, r: 14, t: 18, b: 38 };
    const g = s => -1.14 + 1.68 * Math.sqrt(s);
    const X = v => m.l + (v - 4) / (30 - 4) * (w - m.l - m.r), Y = v => m.t + (9 - v) / 9 * (h - m.t - m.b);
    let s = svgOpen(w, h, "Wachstum nach Wochensätzen");
    s += '<rect x="' + r1(X(10)) + '" y="' + m.t + '" width="' + r1(X(16) - X(10)) + '" height="' + (h - m.t - m.b) + '" fill="var(--t)" opacity=".09"/>';
    s += txt((X(10) + X(16)) / 2, m.t + 14, "Ziel 10–16", "ax-title", "middle");
    [0, 2, 4, 6, 8].forEach(v => { s += '<line class="gridl" x1="' + m.l + '" x2="' + (w - m.r) + '" y1="' + r1(Y(v)) + '" y2="' + r1(Y(v)) + '"/>' + txt(m.l - 6, Y(v) + 4, v + " %", "ax", "end"); });
    [4, 8, 12, 16, 20, 24, 28].forEach(v => { s += txt(X(v), h - m.b + 16, v, "ax", "middle"); });
    s += txt(w - m.r, h - 4, "harte Sätze pro Muskel und Woche", "ax-title", "end");
    let p1 = "", p2 = "";
    for (let v = 4; v <= 30.01; v += 0.25) { const pt = r1(X(v)) + "," + r1(Y(g(v))); if (v <= 20) p1 += (p1 ? "L" : "M") + pt; if (v >= 20) p2 += (p2 ? "L" : "M") + pt; }
    s += '<path class="draw" pathLength="1" d="' + p1 + '" fill="none" stroke="var(--t)" stroke-width="2.5" stroke-linecap="round"/>';
    s += '<path class="fadel" d="' + p2 + '" fill="none" stroke="var(--t)" stroke-width="2.5" stroke-dasharray="5 5" stroke-linecap="round"/>';
    [[6, "3,0"], [10, "4,2"], [12, "4,7"], [16, "5,6"], [20, "6,4"], [24, "7,1"]].forEach(([v, l]) => {
      const id = regTip("<b>" + v + " Sätze pro Woche</b>≈ " + l + " % Wachstum in ~10 Wochen" + (v > 20 ? "<br>Bei Trainierten kein gesicherter Zusatznutzen" : ""));
      s += '<circle class="an pop" style="--i:' + (v / 2 + 6) + '" cx="' + r1(X(v)) + '" cy="' + r1(Y(g(v))) + '" r="5" fill="var(--paper)" stroke="var(--t)" stroke-width="2.5" data-tip="' + id + '" tabindex="0"/>';
      if (w >= 520 || [6, 10, 16, 24].includes(v)) s += txt(X(v), Y(g(v)) - 11, l + " %", "val", "middle");
    });
    s += "</svg>"; el.innerHTML = s;
  }

  function chExercise() {
    const el = $("#ch-exercise"), w = W(el), rowH = 82, top = 6, h = top + EXERCISE.length * rowH + 26;
    const x0 = 18, x1 = w - 18, X = v => x0 + v / 25 * (x1 - x0);
    let s = svgOpen(w, h, "Wachstum je nach Übung");
    [0, 5, 10, 15, 20, 25].forEach(v => { s += '<line class="gridl" x1="' + r1(X(v)) + '" x2="' + r1(X(v)) + '" y1="' + top + '" y2="' + (h - 24) + '"/>' + txt(X(v), h - 8, "+" + v + " %", "ax", "middle"); });
    EXERCISE.forEach((e, i) => {
      const y0 = top + i * rowH, y = y0 + 46, a = X(e.a[1]), b = X(e.b[1]);
      s += txt(2, y0 + 14, e.m, "lbl", "start", ' font-weight="600"');
      s += '<line class="an ' + (a >= b ? "gx" : "gxr") + '" style="--i:' + (i * 3) + '" x1="' + r1(b) + '" x2="' + r1(a) + '" y1="' + y + '" y2="' + y + '" stroke="var(--line-2)" stroke-width="3"/>';
      s += '<circle class="an pop" style="--i:' + (i * 3) + '" cx="' + r1(b) + '" cy="' + y + '" r="6" fill="var(--paper)" stroke="var(--muted)" stroke-width="2.5"/>';
      s += '<circle class="an pop" style="--i:' + (i * 3 + 8) + '" cx="' + r1(a) + '" cy="' + y + '" r="7" fill="var(--t)" stroke="var(--paper)" stroke-width="2"/>';
      const la = esc(e.a[0]) + " +" + de(e.a[1]), lb = esc(e.b[0]) + " +" + de(e.b[1]);
      const aEnd = a + 11 + la.length * 6.8 > x1;
      const bEnd = b + lb.length * 6.4 > x1;
      s += txt(aEnd ? a : a + 11, aEnd ? y - 13 : y + 4, la, "lbl", aEnd ? "end" : "start", ' font-weight="600"');
      s += txt(bEnd ? b : b - 4, y + 24, lb, "lbl-2", bEnd ? "end" : "start");
      s += '<rect class="hit" x="0" y="' + y0 + '" width="' + w + '" height="' + rowH + '" data-tip="' + regTip("<b>" + e.m + "</b>" + esc(e.a[0]) + ": +" + de(e.a[1]) + " %<br>" + esc(e.b[0]) + ": +" + de(e.b[1]) + " %<br><span style='opacity:.7'>" + e.src + "</span>") + '"/>';
    });
    s += "</svg>"; el.innerHTML = s;
  }
  function chSets() {
    hbars($("#ch-sets"), SETS.map(([k, v]) => ({ label: k, v, valText: de(v), color: "var(--t)", opacity: v < 10 ? 0.55 : 1, tip: "<b>" + k + "</b>" + v + " Wochensätze" + (v < 10 ? "<br>knapp unter dem Zielbereich" : "") })), { min: 0, max: 20, band: [10, 16], bandLabel: "Zielbereich 10–16", bandColor: "var(--s)", labelW: 100, rowH: 28, ticks: 5, label: "Wochensätze pro Muskel" });
  }

  function vbars(el, cats, o) {
    const w = W(el), h = o.h || Math.round(Math.min(280, w * 0.6));
    const m = { l: 44, r: 10, t: 22, b: o.sub || w < 480 ? 52 : 36 };
    const min = o.min, max = o.max;
    const Y = v => m.t + (max - v) / (max - min) * (h - m.t - m.b);
    const bw = (w - m.l - m.r) / cats.length;
    let s = svgOpen(w, h, o.label);
    ticks(min, max, 5).forEach(t => { s += '<line class="' + (t === 0 ? "zero" : "gridl") + '" x1="' + m.l + '" x2="' + (w - m.r) + '" y1="' + r1(Y(t)) + '" y2="' + r1(Y(t)) + '"/>' + txt(m.l - 6, Y(t) + 4, (o.tickFmt || de)(t), "ax", "end"); });
    if (o.axisTitle) s += txt(m.l, 12, o.axisTitle, "ax-title", "start");
    cats.forEach((c, i) => {
      const cx = m.l + bw * i + bw / 2, b = Math.min(56, bw * 0.56), y0 = Y(0), y1 = Y(c.v);
      const top = Math.min(y0, y1), hh = Math.abs(y1 - y0);
      if (hh > 0.5) { const rr = Math.min(4, hh / 2); s += c.v >= 0 ? '<path d="M' + r1(cx - b / 2) + "," + r1(y0) + "V" + r1(top + rr) + "Q" + r1(cx - b / 2) + "," + r1(top) + " " + r1(cx - b / 2 + rr) + "," + r1(top) + "H" + r1(cx + b / 2 - rr) + "Q" + r1(cx + b / 2) + "," + r1(top) + " " + r1(cx + b / 2) + "," + r1(top + rr) + "V" + r1(y0) + 'Z" class="an gy" style="--i:' + i * 2 + '" fill="' + c.color + '"/>' : '<path d="M' + r1(cx - b / 2) + "," + r1(y0) + "V" + r1(y1 - rr) + "Q" + r1(cx - b / 2) + "," + r1(y1) + " " + r1(cx - b / 2 + rr) + "," + r1(y1) + "H" + r1(cx + b / 2 - rr) + "Q" + r1(cx + b / 2) + "," + r1(y1) + " " + r1(cx + b / 2) + "," + r1(y1 - rr) + "V" + r1(y0) + 'Z" class="an gyd" style="--i:' + i * 2 + '" fill="' + c.color + '"/>'; }
      else s += '<line x1="' + r1(cx - b / 2) + '" x2="' + r1(cx + b / 2) + '" y1="' + r1(y0) + '" y2="' + r1(y0) + '" stroke="' + c.color + '" stroke-width="3"/>';
      s += txt(cx, c.v >= 0 ? top - 6 : y1 + 15, c.valText, "val", "middle");
      const narrow = bw < 92, parts = narrow && c.label.indexOf(" ") > 0 ? [c.label.slice(0, c.label.indexOf(" ")), c.label.slice(c.label.indexOf(" ") + 1)] : [c.label];
      parts.forEach((pt, k) => { s += txt(cx, h - m.b + 17 + k * 14, esc(pt), "lbl", "middle", ' font-size="' + (narrow ? 11.5 : 12.5) + '"'); });
      if (c.sub && !narrow) s += txt(cx, h - m.b + 33, esc(c.sub), "lbl-2", "middle", ' font-size="11.5"');
      if (c.tip) s += '<rect class="hit" x="' + r1(cx - bw / 2) + '" y="' + m.t + '" width="' + r1(bw) + '" height="' + (h - m.t) + '" data-tip="' + regTip(c.tip) + '"/>';
    });
    s += "</svg>"; el.innerHTML = s;
  }

  function chKcal() {
    const C = [
      { label: "−500 kcal", v: 0, valText: "0", color: "var(--e)", tip: "<b>Defizit ~500 kcal</b>Im Schnitt kein Zuwachs mehr (Murphy & Koehler 2022)" },
      { label: "−250 kcal", v: 0.5, valText: "× 0,5", color: "var(--e)", tip: "<b>Defizit ~250 kcal</b>Interpoliert: etwa halbes Wachstum (Schätzung)" },
      { label: "±0 kcal", v: 1, valText: "× 1", color: "var(--e)", tip: "<b>Erhaltungskalorien</b>Vergleichsstufe" },
      { label: "+250–400 kcal", v: 1.1, valText: "× 1,1", color: "color-mix(in srgb, var(--e) 40%, var(--paper))", tip: "<b>Kleiner Überschuss</b>Allenfalls ein kleiner Zusatznutzen (Schätzung). Empfehlung." },
      { label: "+500 kcal", v: 1.15, valText: "× 1,15", color: "color-mix(in srgb, var(--e) 40%, var(--paper))", tip: "<b>Großer Überschuss</b>Kaum mehr Muskel, deutlich mehr Fett (Schätzung)" }
    ];
    vbars($("#ch-kcal"), C, { min: 0, max: 1.25, label: "Wachstumsfaktor nach Kalorienbilanz", axisTitle: "Wachstum relativ zur Erhaltung", tickFmt: v => "× " + de(v, 2), sub: false });
    $("#ch-kcal").insertAdjacentHTML("beforeend", '<div class="legend" style="margin-top:6px"><span class="key"><i style="background:var(--e)"></i>aus Studien abgeleitet</span><span class="key"><i style="background:color-mix(in srgb, var(--e) 40%, var(--paper))"></i>Schätzung (Evidenz niedrig)</span></div>');
  }

  function chHelms() {
    vbars($("#ch-helms"), [
      { label: "Erhaltung", sub: "Gewicht +0,4 kg", v: -1.4, valText: "−1,4 mm", color: "var(--e)", tip: "<b>Erhaltung</b>Hautfalten −1,4 mm · Gewicht +0,4 kg" },
      { label: "~5 % Überschuss", sub: "Gewicht +3,3 kg", v: 10, valText: "+10,0 mm", color: "var(--e)", tip: "<b>~5 % Überschuss</b>Hautfalten +10,0 mm · Gewicht +3,3 kg" },
      { label: "~15 % Überschuss", sub: "Gewicht +3,3 kg", v: 12.4, valText: "+12,4 mm", color: "var(--e)", tip: "<b>~15 % Überschuss</b>Hautfalten +12,4 mm · Gewicht +3,3 kg" }
    ], { min: -3, max: 15, label: "Hautfalten nach Überschuss", axisTitle: "Veränderung der Hautfalten (mm)", tickFmt: v => de(v), sub: true });
  }

  function chProtein() {
    const el = $("#ch-protein"), w = W(el), h = Math.round(Math.min(280, w * 0.6));
    const m = { l: 44, r: 14, t: 20, b: 38 };
    const X = v => m.l + (v - 1) / (3.2 - 1) * (w - m.l - m.r), Y = v => m.t + (110 - v) / 110 * (h - m.t - m.b);
    let s = svgOpen(w, h, "Protein-Effekt nach Tagesmenge");
    s += '<rect x="' + r1(X(1.03)) + '" y="' + m.t + '" width="' + r1(X(2.2) - X(1.03)) + '" height="' + (h - m.t - m.b) + '" fill="var(--e)" opacity=".07"/>';
    s += '<rect x="' + r1(X(1.8)) + '" y="' + m.t + '" width="' + r1(X(2.0) - X(1.8)) + '" height="' + (h - m.t - m.b) + '" fill="var(--e)" opacity=".2"/>';
    s += txt(X(1.9), m.t + 12, "Ziel", "ax-title", "middle");
    [0, 25, 50, 75, 100].forEach(v => { s += '<line class="gridl" x1="' + m.l + '" x2="' + (w - m.r) + '" y1="' + r1(Y(v)) + '" y2="' + r1(Y(v)) + '"/>' + txt(m.l - 6, Y(v) + 4, v + " %", "ax", "end"); });
    [1.2, 1.6, 2.0, 2.4, 2.8, 3.2].forEach(v => { s += txt(X(v), h - m.b + 16, de(v), "ax", "middle"); });
    s += txt(w - m.r, h - 4, "g Protein pro kg Körpergewicht", "ax-title", "end");
    const pts = [[1.2, 0], [1.6, 80], [1.9, 100], [2.2, 100], [3.0, 100]];
    s += '<path class="draw" pathLength="1" d="M' + pts.map(p => r1(X(p[0])) + "," + r1(Y(p[1]))).join("L") + '" fill="none" stroke="var(--e)" stroke-width="2.5" stroke-linejoin="round"/>';
    const lab = ["1,2", "1,6", "1,8–2,0", "2,2", "3+"];
    pts.forEach((p, i) => { s += '<circle class="an pop" style="--i:' + (i * 5 + 6) + '" cx="' + r1(X(p[0])) + '" cy="' + r1(Y(p[1])) + '" r="5" fill="var(--paper)" stroke="var(--e)" stroke-width="2.5" data-tip="' + regTip("<b>" + lab[i] + " g/kg</b>" + p[1] + " % des möglichen Effekts" + (i === 4 ? "<br>Teurer, kein Zusatznutzen" : "")) + '" tabindex="0"/>'; });
    s += "</svg>"; el.innerHTML = s;
  }

  function chMacros() {
    const el = $("#ch-macros"), w = W(el), st = w < 520, rowH = st ? 56 : 46, top = 8, lw = st ? 0 : Math.min(160, w * 0.36);
    const h = top + MACROS.length * rowH + 30, max = 3700, x0 = st ? 2 : lw + 10, x1 = w - 52, X = v => x0 + v / max * (x1 - x0);
    let s = svgOpen(w, h, "Makronährstoffe nach Tagestyp");
    [0, 1000, 2000, 3000].forEach(v => { s += '<line class="gridl" x1="' + r1(X(v)) + '" x2="' + r1(X(v)) + '" y1="' + top + '" y2="' + (h - 26) + '"/>' + txt(X(v), h - 8, v.toLocaleString("de-DE"), "ax", "middle"); });
    MACROS.forEach((d, i) => {
      const y = top + i * rowH + (st ? 22 : 12), bh = 22; let acc = 0;
      s += st ? txt(x0, y - 7, esc(d.k), "lbl", "start") : txt(lw, y + 15, esc(d.k), "lbl", "end");
      const seg = [["Protein", d.p * 4, d.p + " g", "var(--e1)"], ["Fett", d.f * 9, d.f + " g", "var(--e2)"], ["Kohlenhydrate", d.c * 4, d.c + " g", "var(--e3)"]];
      seg.forEach(([n, kc, g, c], j) => {
        const a = X(acc) + (j ? 1 : 0), b = X(acc + kc) - (j < 2 ? 1 : 0); acc += kc;
        s += '<path class="an gx" style="--i:' + (i * 2 + j * 4) + '" d="' + (j === 2 ? barPath(a, b, y, bh, 4, "right") : "M" + r1(a) + "," + y + "H" + r1(b) + "V" + (y + bh) + "H" + r1(a) + "Z") + '" fill="' + c + '" data-tip="' + regTip("<b>" + esc(d.k) + " · " + n + "</b>" + g + " ≈ " + Math.round(kc).toLocaleString("de-DE") + " kcal") + '"/>';
        if (b - a > 44) s += txt((a + b) / 2, y + 15, g, j === 2 ? "lbl" : "", "middle", ' fill="' + (j === 2 ? "#10284d" : "#fff") + '" font-size="12" font-weight="600" pointer-events="none"');
      });
      s += txt(X(acc) + 6, y + 15, (Math.round(acc / 10) * 10).toLocaleString("de-DE"), "val");
    });
    s += "</svg>";
    el.innerHTML = '<div class="legend"><span class="key"><i style="background:var(--e1)"></i>Protein</span><span class="key"><i style="background:var(--e2)"></i>Fett</span><span class="key"><i style="background:var(--e3)"></i>Kohlenhydrate</span></div>' + s;
  }

  function pairChart(el, keys, color, label) {
    const m = rowsByKey(); const rows = keys.map(k => m[k]);
    const w = W(el), rowH = 30, top = 30, h = top + rows.length * rowH + 26;
    const lw = Math.min(150, w * 0.32), gap = 22, pw = (w - lw - 12 - gap) / 2;
    const pA = { x0: lw + 12, x1: lw + 12 + pw * 0.8, min: -10, max: 10, t: "Muskel (MP)" };
    const pB = { x0: lw + 12 + pw + gap, x1: w - 34, min: -20, max: 55, t: "Kraft & Erholung (LP)" };
    [pA, pB].forEach(p => { p.X = v => p.x0 + (Math.max(p.min, Math.min(p.max, v)) - p.min) / (p.max - p.min) * (p.x1 - p.x0); });
    let s = svgOpen(w, h, label);
    [pA, pB].forEach(p => {
      s += txt(p.x0, 14, p.t, "ax-title");
      (w < 520 ? [p.min < 0 ? 0 : p.min, p.max] : ticks(p.min, p.max, 4)).forEach(t => { s += '<line class="' + (t === 0 ? "zero" : "gridl") + '" x1="' + r1(p.X(t)) + '" x2="' + r1(p.X(t)) + '" y1="' + (top - 6) + '" y2="' + (h - 24) + '"/>' + txt(p.X(t), h - 8, sgn(t, 0), "ax", "middle"); });
    });
    rows.forEach((r, i) => {
      const y = top + i * rowH, bh = 16, by = y + (rowH - bh) / 2;
      s += txt(lw, y + rowH / 2 + 4, esc(SHORT[r.key] || r.g.title), "lbl", "end");
      [[pA, r.mp], [pB, r.lp]].forEach(([p, v]) => {
        const a = p.X(0), b = p.X(v);
        if (Math.abs(v) < 0.05) s += txt(a + 5, y + rowH / 2 + 4, "0", "lbl-2");
        else { s += '<path class="an ' + (v > 0 ? "gx" : "gxr") + '" style="--i:' + i + '" d="' + barPath(a, b, by, bh, 4, v > 0 ? "right" : "left") + '" fill="' + color + '" opacity="' + (v < 0 ? 0.55 : 1) + '"/>' + txt(v > 0 ? b + 5 : b - 5, y + rowH / 2 + 4, sgn(v), "val", v > 0 ? "start" : "end"); }
      });
      s += '<rect class="hit" x="0" y="' + y + '" width="' + w + '" height="' + rowH + '" data-tip="' + regTip(methodTip(r)) + '"/>';
    });
    s += "</svg>"; el.innerHTML = s;
  }

  function chSleep() {
    hbars($("#ch-sleep"), SLEEP.map(d => d.lo !== undefined
      ? { label: d.k, lo: d.lo, hi: d.hi, valText: "−10 bis −15 %", valLeft: false, color: "var(--r)", tip: "<b>" + d.k + "</b>−10 bis −15 %<br><span style='opacity:.7'>" + d.src + "</span>" }
      : { label: d.k, v: d.v, valText: de(d.v, 1) + " %", color: "var(--r)", insideInk: "#2a2100", tip: "<b>" + d.k + "</b>" + de(d.v, 2) + " %<br><span style='opacity:.7'>" + d.src + "</span>" }), { min: -20, max: 0, labelW: 240, rowH: 40, right: 16, ticks: 4, tickFmt: v => de(v) + " %", label: "Folgen von Schlafmangel" });
    // Beschriftung für den Bereichsbalken
    const t = $("#ch-sleep svg"); if (t) { /* Wert links vom Balken */ }
  }

  function chScale() {
    hbars($("#ch-scale"), SCALE.map(d => ({ label: d.k, lo: d.lo, hi: d.hi, valText: (d.approx ? "bis ~" + de(d.hi) : de(d.lo) + "–" + de(d.hi)) + " kg", color: d.hl ? "var(--t)" : "var(--line-2)", bold: d.hl, tip: "<b>" + d.k + "</b>" + (d.approx ? "bis ~" + de(d.hi) : de(d.lo) + "–" + de(d.hi)) + " kg" })), { min: 0, max: 2.2, labelW: 220, rowH: 32, right: 70, ticks: 5, tickFmt: v => de(v), axisTitle: "kg", label: "Größenordnungen auf der Waage" });
  }

  function chResponse() {
    hbars($("#ch-response"), RESPONSE.map(d => ({ label: d.k, lo: d.lo, hi: d.hi, mean: d.mean, open: d.open, valText: "", color: "var(--iron)", tip: "<b>" + d.k + "</b>Spanne " + de(d.lo) + " bis " + (d.open ? "über " : "") + de(d.hi) + " %, Mittel +" + de(d.mean) + " %" })), { min: -15, max: 50, labelW: 170, rowH: 44, right: 18, ticks: 6, tickFmt: v => sgn(v, 0) + " %", label: "Streuung im Muskelzuwachs" });
    $("#ch-response").insertAdjacentHTML("beforeend", '<div class="legend" style="margin-top:4px"><span class="key"><i style="background:var(--iron);width:3px;height:16px;border-radius:2px"></i>Mittelwert</span><span class="key"><i style="background:var(--iron)"></i>Spanne der Teilnehmenden</span></div>');
  }

  /* Streudiagramm aller Methoden */
  let scatterFilter = "all";
  function chScatter() {
    const el = $("#ch-scatter"), w = W(el), h = Math.round(Math.min(520, Math.max(340, w * 0.6)));
    const m = { l: 44, r: 16, t: 16, b: 38 };
    const rows = allRows(true);
    const xMin = -60, xMax = 20, yMin = -40, yMax = 60;
    const X = v => m.l + (v - xMin) / (xMax - xMin) * (w - m.l - m.r), Y = v => m.t + (yMax - v) / (yMax - yMin) * (h - m.t - m.b);
    let s = svgOpen(w, h, "Streudiagramm: Muskelpunkte gegen Leistungspunkte");
    for (let v = xMin; v <= xMax; v += 10) s += '<line class="' + (v === 0 ? "zero" : "gridl") + '" x1="' + r1(X(v)) + '" x2="' + r1(X(v)) + '" y1="' + m.t + '" y2="' + (h - m.b) + '"/>' + txt(X(v), h - m.b + 16, sgn(v, 0), "ax", "middle");
    for (let v = yMin; v <= yMax; v += 20) s += '<line class="' + (v === 0 ? "zero" : "gridl") + '" x1="' + m.l + '" x2="' + (w - m.r) + '" y1="' + r1(Y(v)) + '" y2="' + r1(Y(v)) + '"/>' + txt(m.l - 6, Y(v) + 4, sgn(v, 0), "ax", "end");
    s += txt(w - m.r, h - 4, "Muskelpunkte (MP) →", "ax-title", "end");
    s += txt(m.l + 6, m.t + 12, "↑ Leistungspunkte (LP)", "ax-title");
    const shape = (b, x, y, r) => b === "T" ? '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r1(r) + '"' : b === "E" ? '<rect x="' + r1(x - r * .9) + '" y="' + r1(y - r * .9) + '" width="' + r1(r * 1.8) + '" height="' + r1(r * 1.8) + '" rx="2"' : b === "S" ? '<path d="M' + r1(x) + "," + r1(y - r * 1.15) + "L" + r1(x + r * 1.15) + "," + r1(y + r * .9) + "L" + r1(x - r * 1.15) + "," + r1(y + r * .9) + 'Z"' : '<path d="M' + r1(x) + "," + r1(y - r * 1.2) + "L" + r1(x + r * 1.2) + "," + r1(y) + "L" + r1(x) + "," + r1(y + r * 1.2) + "L" + r1(x - r * 1.2) + "," + r1(y) + 'Z"';
    const ord = rows.slice().sort((a, b) => (Math.abs(a.mp) + Math.abs(a.lp) / 2) - (Math.abs(b.mp) + Math.abs(b.lp) / 2));
    ord.forEach(r => {
      const dim = scatterFilter !== "all" && r.g.block !== scatterFilter;
      const rad = 3.5 + (r.o.em ? EV[r.o.em].dots : 1) * 1.3;
      s += shape(r.g.block, X(Math.max(xMin, r.mp)), Y(Math.max(yMin, Math.min(yMax, r.lp))), rad) + ' class="an pop" style="--i:' + ((ord.indexOf(r) * 7) % 30) + ';cursor:pointer" fill="' + BC[r.g.block] + '" stroke="var(--paper)" stroke-width="1.5" opacity="' + (dim ? 0.15 : 1) + '" data-tip="' + regTip(methodTip(r)) + '" tabindex="' + (dim ? -1 : 0) + '"/>';
    });
    // Beschriftung markanter Punkte ohne Überlappung
    const placed = [];
    rows.filter(r => (scatterFilter === "all" || r.g.block === scatterFilter) && (Math.abs(r.mp) >= 7 || Math.abs(r.lp) >= 18)).sort((a, b) => (Math.abs(b.mp) + Math.abs(b.lp) / 2) - (Math.abs(a.mp) + Math.abs(a.lp) / 2)).forEach(r => {
      const t = SHORT[r.key] || r.g.title, tw = t.length * 6.2 + 4, th = 13, px = X(Math.max(xMin, r.mp)), py = Y(Math.max(yMin, Math.min(yMax, r.lp)));
      for (const [tx, ty, an] of [[px + 10, py + 4, "start"], [px - 10, py + 4, "end"], [px - tw / 2, py - 12, "start"], [px - tw / 2, py + 20, "start"]]) {
        const bx = an === "end" ? tx - tw : tx, by = ty - 10;
        if (bx < m.l || bx + tw > w - m.r || by < m.t || by + th > h - m.b) continue;
        if (placed.some(p => bx < p.x + p.w && bx + tw > p.x && by < p.y + p.h && by + th > p.y)) continue;
        if (rows.some(o => o !== r && (scatterFilter === "all" || o.g.block === scatterFilter) && Math.abs(X(Math.max(xMin, o.mp)) - (bx + tw / 2)) < tw / 2 + 4 && Math.abs(Y(Math.max(yMin, Math.min(yMax, o.lp))) - (by + th / 2)) < th / 2 + 4)) continue;
        placed.push({ x: bx, y: by, w: tw, h: th }); s += txt(tx, ty, esc(t), "lbl", an, ' font-size="12" pointer-events="none"'); break;
      }
    });
    s += "</svg>";
    const lg = '<div class="legend">' + [["T", "Training"], ["E", "Ernährung"], ["S", "Supplements"], ["R", "Regeneration"]].map(([b, n]) => '<span class="key"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">' + shape(b, 7, 7, 4.6) + ' fill="' + BC[b] + '"/></svg>' + n + "</span>").join("") + "</div>";
    el.innerHTML = lg + s;
  }
  function chipRow(el, cur, onPick) {
    const items = [["all", "Alle"]].concat(Object.entries(BLOCKS));
    el.innerHTML = items.map(([k, v]) => '<button type="button" class="chip" data-k="' + k + '" aria-pressed="' + (cur === k) + '">' + v + "</button>").join("");
    el.onclick = e => { const b = e.target.closest("button"); if (!b) return; onPick(b.dataset.k); };
  }

  /* ---------- Trainingsplan ---------- */
  let planTab = "Upper A";
  function renderPlan() {
    $("#plan-tabs").innerHTML = Object.keys(PLAN).map(k => '<button type="button" role="tab" aria-selected="' + (k === planTab) + '">' + k + "</button>").join("");
    const rows = PLAN[planTab];
    $("#plan-table").innerHTML = '<table class="plan"><thead><tr><th>Übung</th><th>Sätze × Wdh.</th><th>RIR</th><th>Pause</th></tr></thead><tbody>' + rows.map(r => "<tr><td>" + esc(r[0]) + '</td><td class="n">' + r[1] + '</td><td class="n">' + r[2] + '</td><td class="n">' + r[3] + "</td></tr>").join("") + "</tbody></table>";
  }
  $("#plan-tabs").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; planTab = b.textContent; renderPlan(); });

  /* ---------- Mythen ---------- */
  let mythF = "all";
  const mythStep = d => { const c = $("#myths"), card = c.querySelector(".myth"); if (card) c.scrollBy({ left: d * (card.offsetWidth + 16) * (innerWidth > 900 ? 2 : 1), behavior: "smooth" }); };
  $("#myth-prev").addEventListener("click", () => mythStep(-1));
  $("#myth-next").addEventListener("click", () => mythStep(1));
  $("#myths").addEventListener("click", e => { const c = e.target.closest(".myth"); if (c) { c.classList.toggle("flipped"); c.setAttribute("aria-pressed", c.classList.contains("flipped")); } });
  $("#myths").addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("myth")) { e.preventDefault(); e.target.click(); } });
  function renderMyths() {
    chipRow($("#myth-filter"), mythF, k => { mythF = k; renderMyths(); $("#myths").scrollTo({ left: 0 }); });
    const list = MYTHS.filter(m => mythF === "all" || m.b === mythF);
    $("#myth-count").textContent = list.length + " Mythen";
    $("#myths").innerHTML = list.map(m => '<div class="myth ' + BK[m.b] + '" role="button" tabindex="0" aria-pressed="false"><div class="myth-in"><div class="face front"><span class="pill ' + BK[m.b] + '"><i></i>' + BLOCKS[m.b] + '</span><span class="tag">Mythos</span><q>' + esc(m.m) + '</q><span class="flip-hint">Umdrehen <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.3M20 4v5h-5M20 12a8 8 0 0 1-14 5.3M4 20v-5h5"/></svg></span></div><div class="face back"><span class="tag">Was die Studien sagen</span><p>' + esc(m.f) + '</p><span class="src-ref">Recherche ' + m.d + "</span></div></div></div>").join("");
  }

  /* ---------- Rechner ---------- */
  let plan = presetPlan("rec"), weighted = true;
  try { const s = JSON.parse(localStorage.getItem("ma-plan") || "null"); if (s) Object.keys(s).forEach(k => { if (GROUPS.find(g => g.id === k)) plan[k] = s[k]; }); } catch (e) {}
  const save = () => { try { localStorage.setItem("ma-plan", JSON.stringify(plan)); } catch (e) {} };

  function optLabel(g, o) {
    if (o.std) return "0";
    if (g.factor) return "× " + de(o.f, 2);
    return sgn(optVal(o, "mp", weighted)) + " MP";
  }
  function renderForm() {
    let h = "";
    Object.entries(BLOCKS).forEach(([bk, name]) => {
      const gs = GROUPS.filter(g => g.block === bk);
      h += '<div class="cblock ' + BK[bk] + '"><h3><span class="disc"></span>' + name + "</h3>";
      gs.filter(g => !g.toggle).forEach(g => {
        h += '<fieldset class="q" style="border:0;margin:0;padding:12px 0"><legend class="q-head" style="width:100%;padding:0"><b>' + esc(g.title) + "</b> <small>" + esc(g.unit || "") + '</small></legend><div class="opts">';
        g.options.forEach(o => {
          const id = "o-" + g.id + "-" + o.id;
          h += '<label class="opt" for="' + id + '"' + (o.note ? ' title="' + esc(o.note) + '"' : "") + '><input type="radio" id="' + id + '" name="' + g.id + '" value="' + o.id + '"' + (plan[g.id] === o.id ? " checked" : "") + "><span>" + esc(o.label) + "<em>" + optLabel(g, o) + "</em>" + (o.rec ? '<span class="rec-mark">Empfehlung</span>' : "") + "</span></label>";
        });
        h += "</div></fieldset>";
      });
      const tg = gs.filter(g => g.toggle);
      if (tg.length) {
        h += '<div class="toggles">';
        tg.forEach(g => {
          const on = g.options.find(o => !o.std), id = "t-" + g.id;
          const lp = optVal(on, "lp", weighted);
          h += '<label class="tg" for="' + id + '"><span><span class="t1">' + esc(g.title) + (on.rec ? ' <span class="rec-mark" style="font-size:.7rem;color:var(--s-ink);font-weight:700">Empfehlung</span>' : "") + '</span><span class="t2' + (on.warn ? " warn" : "") + '">' + sgn(optVal(on, "mp", weighted)) + " MP · " + sgn(lp) + " LP" + (on.note ? " · " + (on.warn ? "⚠ " : "") + esc(on.note) : "") + '</span></span><span class="sw"><input type="checkbox" id="' + id + '" data-g="' + g.id + '"' + (plan[g.id] === on.id ? " checked" : "") + "><i></i></span></label>";
        });
        h += "</div>";
      }
      h += "</div>";
    });
    $("#calc-form").innerHTML = h;
  }
  $("#calc-form").addEventListener("change", e => {
    const t = e.target;
    if (t.type === "radio") plan[t.name] = t.value;
    if (t.type === "checkbox") { const g = GROUPS.find(x => x.id === t.dataset.g); plan[g.id] = t.checked ? g.options.find(o => !o.std).id : stdOf(g).id; }
    save(); updateScore();
  });
  function renderPresets() {
    $$("[data-presets]").forEach(el => {
      el.innerHTML = '<button type="button" data-p="rec">Empfohlener Plan</button><button type="button" data-p="min">Minimum</button><button type="button" data-p="myth">Gym-Mythen-Plan</button>';
      el.onclick = e => { const b = e.target.closest("button[data-p]"); if (!b) return; plan = presetPlan(b.dataset.p); save(); renderForm(); updateScore(); };
    });
  }
  $$("[data-mode]").forEach(b => b.addEventListener("click", () => { weighted = b.dataset.mode === "w"; $$("[data-mode]").forEach(x => x.setAttribute("aria-pressed", String(x === b))); renderForm(); updateScore(); }));

  let calcKeys = null;
  const TW = new WeakMap();
  function tween(el, to, fmt) {
    const from = TW.has(el) ? TW.get(el) : to; TW.set(el, to);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || from === to) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 650;
    const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(from + (to - from) * e); if (k < 1 && TW.get(el) === to) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function updateScore() {
    const d = planDetail(plan, weighted), kg = kgPerYear(plan);
    tween($("#s-mp"), d.mp, v => String(Math.round(v)));
    tween($("#s-lp"), d.lp, v => sgn(v, 0).replace("±", ""));
    tween($("#s-kg"), kg, v => de(v, 1));
    $("#s-rng").textContent = "Spanne " + de(kg / 2, 1) + "–" + de(kg * 2, 1) + " kg";
    $("#s-break").textContent = "(Basis 34 " + (d.addSum >= 0 ? "+ " : "− ") + de(Math.abs(d.addSum), 1) + " Zuschläge) × Faktor " + de(d.factor, 2) + " = " + Math.round(d.mp) + " MP" + (weighted ? ", mit Evidenz gewichtet." : ", Rohwerte.");
    const bd = barbell($("#calc-bar"), plan, { weighted, dark: true, mini: true, prev: calcKeys, h: W($("#calc-bar")) < 380 ? 88 : 132, label: "Dein Plan als Hantel" });
    calcKeys = bd.keys;
    let li = '<li><span>Basis (Stange)</span><span>34</span></li>';
    d.pos.forEach(p => { li += "<li><span>" + esc(SHORT[p.g.id + ":" + p.o.id] || p.g.title) + "</span><span>" + sgn(p.eff) + "</span></li>"; });
    d.neg.forEach(p => { li += '<li class="minus"><span>' + esc(SHORT[p.g.id + ":" + p.o.id] || p.g.title) + "</span><span>" + sgn(p.eff) + "</span></li>"; });
    d.factors.forEach(f => { li += '<li class="' + (f.f < 1 ? "minus" : "") + '"><span>' + esc(f.o.label) + "</span><span>× " + de(f.f, 2) + "</span></li>"; });
    $("#s-list").innerHTML = "<strong>So setzt sich dein Wert zusammen</strong><ul>" + li + "</ul>";
    $$("[data-presets] button").forEach(b => { const p = presetPlan(b.dataset.p); b.classList.toggle("active", GROUPS.every(g => p[g.id] === plan[g.id])); });
  }

  /* ---------- Quellen ---------- */
  const GROUP_OF = d => d[0];
  function renderSources(q) {
    q = (q || "").trim().toLowerCase();
    let total = 0, hits = 0; const seen = new Set();
    let h = "";
    Object.entries({ T: "Training", E: "Ernährung", S: "Supplements", R: "Regeneration und Ausdauer", Q: "Fortschritt und Erwartungen" }).forEach(([bk, name]) => {
      const docs = SOURCES.filter(d => GROUP_OF(d.doc) === bk);
      let gh = "";
      docs.forEach(d => {
        const list = d.sources.filter(s => { total++; seen.add((s.title || "").toLowerCase().slice(0, 60)); if (!q) return true; return (s.cite + " " + s.title + " " + s.venue + " " + s.year + " " + d.title).toLowerCase().includes(q); });
        hits += list.length;
        if (!list.length) return;
        gh += '<details class="fold"' + (q ? " open" : "") + '><summary><span class="src-group-head"><span class="code">' + d.doc + "</span>" + esc(d.title) + "</span><small>" + list.length + ' Quellen</small></summary><div class="inner"><ul class="src-list">' +
          list.map(s => "<li><b>" + (s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.cite) + "</a>" : esc(s.cite)) + "</b>" + (s.preprint ? '<span class="pp">Preprint</span>' : "") + ' <span class="ttl">' + esc(s.title) + (s.venue ? ". <i>" + esc(s.venue) + "</i>" : "") + "</span></li>").join("") + "</ul></div></details>";
      });
      if (gh) h += '<h3 style="margin:22px 0 4px">' + name + "</h3>" + gh;
    });
    $("#src-groups").innerHTML = h || '<p class="small">Keine Quelle gefunden. Versuch einen Autor, ein Jahr oder ein Thema.</p>';
    $("#src-hits").textContent = q ? hits + " Treffer" : "";
    return { total, unique: seen.size };
  }
  const srcStats = renderSources("");
  const uniq = Math.floor(srcStats.unique / 10) * 10;
  $("#src-count").textContent = srcStats.total + " Einträge (rund " + uniq + " verschiedene)";
  $("#fact-src").textContent = uniq + "+"; $("#fact-src").dataset.count = uniq;
  let st; $("#src-search").addEventListener("input", e => { clearTimeout(st); st = setTimeout(() => renderSources(e.target.value), 120); });

  /* ---------- Navigation & Theme ---------- */
  const links = $$(".nav a");
  const io = new IntersectionObserver(es => { es.forEach(en => { if (en.isIntersecting) links.forEach(a => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + en.target.id))); }); }, { rootMargin: "-40% 0px -55% 0px" });
  $$("section.block").forEach(s => io.observe(s));
  $("#theme").addEventListener("click", () => {
    const root = document.documentElement, cur = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    root.dataset.theme = cur === "dark" ? "light" : "dark"; try { localStorage.setItem("ma-theme", root.dataset.theme); } catch (e) {}
    renderCharts();
  });
  try { const t = localStorage.getItem("ma-theme"); if (t) document.documentElement.dataset.theme = t; } catch (e) {}

  /* ---------- Start ---------- */
  let heroDone = false;
  function renderCharts() {
    TIPS.clear();
    barbell($("#hero-bar"), presetPlan("rec"), { intro: !heroDone, d0: 1.0, dark: true, label: "Empfohlener Plan als beladene Hantel", center: "Basis 34 MP · empfohlener Plan 72 MP ≈ 3,5 kg fettfreie Masse pro Jahr" });
    chLevers(); chVolume(); chExercise(); chSets(); chKcal(); chHelms(); chProtein(); chMacros();
    pairChart($("#ch-supps"), ["krea:on", "caf:on", "pre:on", "bcaa:on", "ba:on", "cit:on", "whey:on", "eaa:on", "hmb:on", "myo:on"], "var(--s)", "Supplements: Muskel- und Leistungspunkte");
    pairChart($("#ch-regen"), ["sleep:s8", "sleep:s5", "stress:on", "cold:on", "stretchpre:on", "stretchlong:on", "massage:on", "compress:on", "nap:on", "late:on", "sauna:on", "hrv:on"], "var(--r)", "Regeneration: Muskel- und Leistungspunkte");
    chSleep(); chScale(); chResponse();
    const pickScatter = k => { scatterFilter = k; chScatter(); chipRow($("#scatter-filter"), scatterFilter, pickScatter); };
    chipRow($("#scatter-filter"), scatterFilter, pickScatter);
    chScatter();
    updateScore();
    heroDone = true;
  }
  renderPlan(); renderMyths(); renderPresets(); renderForm(); renderCharts();
  /* ---------- Bühne: Scheiben, Laufband, Einblenden, Scroll-Effekte ---------- */
  let plateUid = 0;
  function plateSVG(color, kg, name, ink) {
    const id = "pp" + (++plateUid); ink = ink || "#fff";
    const word = (name.toUpperCase() + "  •  ").repeat(3);
    return '<svg viewBox="0 0 200 200" aria-hidden="true">' +
      '<defs><path id="' + id + '" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0"/>' +
      '<radialGradient id="' + id + 'g" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient></defs>' +
      '<circle cx="100" cy="100" r="98" fill="' + color + '"/>' +
      '<circle cx="100" cy="100" r="98" fill="url(#' + id + 'g)"/>' +
      '<circle cx="100" cy="100" r="97" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="2"/>' +
      '<circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1.5"/>' +
      '<text font-family="Anton, sans-serif" font-size="11" letter-spacing="3" fill="' + ink + '" opacity=".72"><textPath href="#' + id + '">' + word + "</textPath></text>" +
      '<circle cx="100" cy="100" r="60" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="7"/>' +
      '<text x="100" y="62" text-anchor="middle" font-family="Anton, sans-serif" font-size="22" fill="' + ink + '">' + kg + '</text>' +
      '<text x="100" y="152" text-anchor="middle" font-family="Anton, sans-serif" font-size="15" letter-spacing="2" fill="' + ink + '" opacity=".9">KG</text>' +
      '<circle cx="100" cy="100" r="32" fill="#d5dade"/><circle cx="100" cy="100" r="32" fill="none" stroke="#8d96a0" stroke-width="2"/>' +
      '<circle cx="100" cy="100" r="25" fill="#eceff1"/>' +
      [0, 60, 120, 180, 240, 300].map(a => { const r = a * Math.PI / 180; return '<circle cx="' + r1(100 + 28.5 * Math.cos(r)) + '" cy="' + r1(100 + 28.5 * Math.sin(r)) + '" r="1.8" fill="#8d96a0"/>'; }).join("") +
      '<circle cx="100" cy="100" r="13" fill="#20252b"/></svg>';
  }
  const PLATES = {
    t: { c: "#d4372c", kg: 25, n: "Training", id: "training", ink: "#fff", p: "Steigern, 10–16 harte Sätze, 1–2 RIR und die passende Übung für jeden Muskel." },
    e: { c: "#2558c4", kg: 20, n: "Ernährung", id: "ernaehrung", ink: "#fff", p: "Kein Defizit, kleiner Überschuss und 1,8–2,0 g Protein pro kg." },
    r: { c: "#e0a800", kg: 15, n: "Regeneration", id: "regeneration", ink: "#2a2100", p: "Schlaf schützen, Ausdauer clever legen, Belastung an die Tagesform anpassen." },
    s: { c: "#16924a", kg: 10, n: "Supplements", id: "supplements", ink: "#fff", p: "Kreatin lohnt sich. Fast alles andere kannst du dir sparen." }
  };
  /* Auf einen Blick: Kacheln so groß wie ihr Hebel */
  const BENTO = [
    { k: "t", cls: "big", stats: [["10–16", "harte Sätze pro Muskel und Woche"], ["1–2", "Wiederholungen vor dem Versagen"], ["× 0,5", "Wachstum, wenn du nicht steigerst"]] },
    { k: "e", cls: "wide", stats: [["+250–400", "kcal Überschuss pro Tag"], ["1,8–2,0", "g Protein pro kg Körpergewicht"]] },
    { k: "r", cls: "", stats: [["7–9 h", "Schlaf pro Nacht"]] },
    { k: "s", cls: "", stats: [["3–5 g", "Kreatin täglich, sonst wenig"]] }
  ];
  $("#bento").innerHTML = BENTO.map(t => {
    const p = PLATES[t.k];
    return '<a class="tile spot rv ' + t.k + " " + t.cls + '" href="#' + p.id + '"><div class="tile-plate">' + plateSVG(p.c, p.kg, p.n, p.ink) + '</div><div class="tile-head"><span class="tile-kg">' + p.kg + ' kg</span><h3>' + p.n + '</h3></div><div class="tile-stats">' +
      t.stats.map(st => '<div class="stat"><b>' + st[0] + "</b><span>" + st[1] + "</span></div>").join("") + '</div><p class="tile-p">' + p.p + '</p><span class="tile-go" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a>';
  }).join("");
  const orns = [];
  ["t", "e", "s", "r"].forEach(k => {
    const sec = $("section.block." + k); if (!sec) return; const p = PLATES[k];
    const d = document.createElement("div"); d.className = "plate-orn"; d.innerHTML = plateSVG(p.c, p.kg, p.n, p.ink);
    sec.insertBefore(d, sec.firstChild); orns.push(d);
  });

  /* Laufband */
  const TICK = [["t", "Ohne Steigern nur halbes Wachstum", "Kassiano 2026"], ["t", "10–16 harte Sätze pro Muskel", "Pelland 2026"], ["t", "1–2 Wiederholungen vor dem Versagen", "Refalo 2024"],
    ["e", "1,8–2,0 g Protein pro kg", "Morton 2018"], ["e", "500 kcal Defizit = kein Zuwachs", "Murphy & Koehler 2022"], ["e", "+250–400 kcal Überschuss reichen", "Helms 2023"],
    ["s", "Kreatin: +11,4 kg Beinkraft", "Wang 2024"], ["r", "7–9 Stunden Schlaf", "Saner 2020"], ["r", "Kein Kältebad nach dem Training", "Piñero 2024"], ["t", "2–5 kg Muskel pro Jahr realistisch", "Q2"]];
  const tickHTML = TICK.map(([k, t, src]) => '<span class="ticker-item"><svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" fill="' + PLATES[k].c + '" stroke="rgba(255,255,255,.9)" stroke-width="1.5"/><circle cx="11" cy="11" r="3.2" fill="#eceff1"/></svg>' + esc(t) + " <small>" + esc(src) + "</small></span>").join("");
  $("#ticker").innerHTML = tickHTML + tickHTML;

  /* Überschriften wortweise */
  $$("section.block h2").forEach(h => {
    const words = h.textContent.trim().split(/\s+/);
    h.setAttribute("aria-label", h.textContent.trim());
    h.innerHTML = words.map((w, i) => '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + esc(w) + "</span></span>").join(" ");
    h.classList.add("split");
  });

  /* Reiter in den Abschnitten: weniger Scrollen, klare Gliederung */
  const TABS = {
    prioritaeten: ["Die 8 Hebel", "Alle Hebel als Grafik"],
    training: ["Kernpunkte", "Grafiken", "Trainingsplan"],
    ernaehrung: ["Kernpunkte", "Grafiken", "Beispieltag & Steuerung"],
    supplements: ["Empfehlung", "Grafik", "Empfehlung"],
    regeneration: ["Kernpunkte", "Wochenplan", "Grafiken", "Tagesform"],
    erwartungen: ["Die Zahlen", "Grafiken", "Routine & Fehlersuche"]
  };
  let tabUid = 0;
  Object.entries(TABS).forEach(([sid, names]) => {
    const sec = document.getElementById(sid); if (!sec) return;
    const wrap = sec.querySelector(".wrap"), head = wrap.querySelector(".sec-head");
    const kids = []; let n = head.nextElementSibling; while (n) { kids.push(n); n = n.nextElementSibling; }
    const order = [...new Set(names)];
    const bar = document.createElement("div"); bar.className = "seg-tabs"; bar.setAttribute("role", "tablist"); bar.setAttribute("aria-label", "Ansicht wählen");
    bar.innerHTML = '<span class="ind" aria-hidden="true"></span>' + order.map((t, i) => '<button type="button" role="tab" id="tb' + (++tabUid) + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + esc(t) + "</button>").join("");
    head.after(bar);
    const panels = order.map((t, i) => { const p = document.createElement("div"); p.className = "tabpanel"; p.setAttribute("role", "tabpanel"); p.setAttribute("aria-label", t); if (i) p.hidden = true; return p; });
    kids.forEach((k, i) => { panels[order.indexOf(names[i] || names[names.length - 1])].appendChild(k); });
    let last = bar; panels.forEach(p => { last.after(p); last = p; });
    const btns = $$("button", bar), ind = $(".ind", bar);
    const place = () => { const b = btns.find(x => x.getAttribute("aria-selected") === "true"); if (!b) return; ind.style.width = b.offsetWidth + "px"; ind.style.transform = "translateX(" + b.offsetLeft + "px)"; };
    const select = i => {
      btns.forEach((b, j) => { b.setAttribute("aria-selected", String(i === j)); b.tabIndex = i === j ? 0 : -1; });
      panels.forEach((p, j) => { p.hidden = i !== j; if (i === j) { p.classList.remove("enter"); void p.offsetWidth; p.classList.add("enter"); } });
      place();
      renderCharts();
      $$(".rv:not(.in), .chart:not(.in)", panels[i]).forEach(el => reveal.observe(el));
    };
    btns.forEach((b, i) => b.addEventListener("click", () => select(i)));
    bar.addEventListener("keydown", e => { const i = btns.indexOf(document.activeElement); if (i < 0) return; if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); const j = (i + (e.key === "ArrowRight" ? 1 : -1) + btns.length) % btns.length; select(j); btns[j].focus(); } });
    requestAnimationFrame(place); window.addEventListener("resize", place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  });

  /* Lichtkegel folgt der Maus auf Kacheln und Karten */
  document.addEventListener("pointermove", e => {
    const t = e.target.closest && e.target.closest(".spot, .panel, .chapter, .tile"); if (!t) return;
    const r = t.getBoundingClientRect(); t.style.setProperty("--mx", (e.clientX - r.left) + "px"); t.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });

  /* Einblenden beim Scrollen */
  const groups = [".panel", ".points li", ".tier", ".day", ".routine li", ".grid-3 > .panel.flat", ".cblock", ".hero-facts"];
  groups.forEach(sel => $$(sel).forEach((el, i) => { if (el.closest(".hero") || el.closest(".calc-side")) return; el.classList.add("rv"); el.style.setProperty("--i", i % 4); }));
  $$(".ranks li").forEach((li, i) => li.style.setProperty("--i", i % 8));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveal = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) return; en.target.classList.add("in"); if (en.target.dataset.count) countUp(en.target); reveal.unobserve(en.target); }), { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
  const watchAll = () => $$(".rv:not(.in), h2.split:not(.in), .chart:not(.in), .ranks li:not(.in), [data-count]:not(.counted)").forEach(el => reveal.observe(el));
  watchAll();
  new MutationObserver(() => $$(".myth:not(.rv)").forEach((el, i) => { el.classList.add("rv", "in"); })).observe($("#myths"), { childList: true });

  function countUp(el) {
    el.classList.add("counted");
    const to = +el.dataset.count, suf = el.dataset.suffix || "";
    if (reduce) { el.textContent = to + suf; return; }
    const t0 = performance.now() + (el.closest(".hero") ? 1000 : 0), dur = 1400;
    const step = t => { const k = Math.max(0, Math.min(1, (t - t0) / dur)), e = 1 - Math.pow(1 - k, 4); el.textContent = Math.round(to * e) + suf; if (k < 1) requestAnimationFrame(step); };
    el.textContent = "0" + suf; requestAnimationFrame(step);
  }

  /* Scroll: Fortschritt, Hero-Parallaxe, drehende Scheiben */
  const prog = $("#progress"), heroEl = $(".hero");
  let ticking = false;
  function onScroll() {
    ticking = false;
    const sh = document.documentElement.scrollHeight - innerHeight;
    prog.style.setProperty("--p", sh > 0 ? (scrollY / sh).toFixed(4) : 0);
    if (reduce) return;
    const hh = heroEl.offsetHeight; if (scrollY < hh) heroEl.style.setProperty("--hp", (scrollY / hh).toFixed(3));
    orns.forEach(o => { const r = o.getBoundingClientRect(); if (r.bottom > -100 && r.top < innerHeight + 100) o.style.setProperty("--rot", ((innerHeight - r.top) * 0.22).toFixed(1)); });
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  let rt, lastW = innerWidth; window.addEventListener("resize", () => { if (innerWidth === lastW) return; lastW = innerWidth; clearTimeout(rt); rt = setTimeout(renderCharts, 150); });
})();
