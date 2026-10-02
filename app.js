/* Portfolio renderer: all content comes from data.json (+ i18n overlays).
   Security: every string is inserted with textContent; URLs pass safeUrl(). */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var state = { base: null, data: null, ui: {}, uiEn: {}, lang: 'en', plStatus: null, domain: 'all', skill: null };

  // ---------- helpers ----------
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') n.textContent = v;
      else if (k === 'class') n.className = v;
      else n.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function clear(n) { while (n && n.firstChild) n.removeChild(n.firstChild); return n; }
  function safeUrl(u) {
    if (typeof u !== 'string' || !u) return null;
    if (/^(https:|mailto:)/i.test(u)) return u;
    if (/^(#|case\.html\?id=[\w-]+$|index\.html)/.test(u)) return u;
    return null;
  }
  function extLink(href, text, cls) {
    var h = safeUrl(href); if (!h) return document.createTextNode(text);
    var a = el('a', { href: h, text: text, class: cls });
    if (/^https:/.test(h)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    return a;
  }
  function getJSON(path) {
    return fetch(path, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(path + ' ' + r.status); return r.json();
    });
  }
  function refocus(key) {
    var n = document.querySelector('[data-key="' + (window.CSS && CSS.escape ? CSS.escape(key) : key) + '"]');
    if (n) n.focus({ preventScroll: true });
  }
  // file:// cannot fetch(); fall back to the generated content.js bundle.
  var BUNDLE_KEYS = { 'data.json': 'data', 'i18n/en.json': 'en', 'i18n/pl.json': 'pl' };
  var bundleP = null;
  function bundle() {
    if (window.__CONTENT__) return Promise.resolve(window.__CONTENT__);
    if (!bundleP) bundleP = new Promise(function (ok, no) {
      var s = document.createElement('script'); s.src = 'content.js?v=' + Date.now();
      s.onload = function () { window.__CONTENT__ ? ok(window.__CONTENT__) : no(new Error('empty bundle')); };
      s.onerror = function () { no(new Error('content.js missing')); };
      document.head.appendChild(s);
    });
    return bundleP;
  }
  function fromBundle(path) {
    return bundle().then(function (B) { var v = B[BUNDLE_KEYS[path]]; if (!v) throw new Error(path + ' not in bundle'); return clone(v); });
  }
  function load(path) {
    if (location.protocol === 'file:' && BUNDLE_KEYS[path]) return fromBundle(path);
    return getJSON(path).catch(function (e) { if (BUNDLE_KEYS[path]) return fromBundle(path); throw e; });
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function get(obj, path) {
    return path.split('.').reduce(function (o, s) {
      if (o == null) return undefined;
      if (Array.isArray(o)) return /^\d+$/.test(s) ? o[+s] : o.filter(function (x) { return x && x.id === s; })[0];
      return o[s];
    }, obj);
  }
  function set(obj, path, val) {
    var segs = path.split('.'), last = segs.pop(), parent = get(obj, segs.join('.')) ;
    if (!segs.length) parent = obj;
    if (parent == null) return;
    if (Array.isArray(parent)) { if (/^\d+$/.test(last) && typeof parent[+last] === typeof val) parent[+last] = val; }
    else if (last in parent && (parent[last] === null || typeof parent[last] === typeof val) && Array.isArray(parent[last]) === Array.isArray(val)) parent[last] = val;
  }
  function t(key, vars) {
    var s = state.ui[key] || state.uiEn[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(String(vars[k])); });
    return s;
  }
  function fmtYM(ym) {
    if (!ym) return t('experience.present');
    var p = String(ym).split('-');
    if (p.length < 2) return p[0];
    return new Intl.DateTimeFormat(state.lang, { month: 'short', year: 'numeric' }).format(new Date(+p[0], +p[1] - 1, 1));
  }
  function range(s, e) { return fmtYM(s) + ' – ' + fmtYM(e); }
  function storage(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }

  // ---------- theme ----------
  function initTheme() {
    var b = $('theme-toggle'); if (!b) return;
    b.addEventListener('click', function () {
      var root = document.documentElement, next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      function apply() { root.setAttribute('data-theme', next); storage('theme', next); document.dispatchEvent(new Event('themechange')); }
      if (reduceMotion || !document.startViewTransition) { apply(); return; }
      // circular wipe that grows out of the toggle button
      var r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      document.startViewTransition(apply).ready.then(function () {
        root.animate({ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + end + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 520, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' });
      }).catch(function () {});
    });
  }

  // ---------- i18n ----------
  function params() { return new URLSearchParams(location.search); }
  function plAllowed() {
    return true; // toggle always shown; English stays default until the visitor picks Polish
  }
  function pickLang() {
    var q = params().get('lang');
    if (q === 'en' || q === 'pl') return q;
    var s = storage('lang'); if (s === 'en' || s === 'pl') return s;
    return 'en';
  }
  var langReq = 0;
  function loadLang(lang) {
    var my = ++langReq;
    if (lang !== 'pl') { state.lang = 'en'; state.ui = state.uiEn; state.data = state.base; return Promise.resolve(); }
    return load('i18n/pl.json').then(function (ov) {
      state.plStatus = /^reviewed/.test(ov._status || '') ? 'reviewed' : 'draft';
      if (my !== langReq) return;
      if (!plAllowed()) { state.lang = 'en'; state.ui = state.uiEn; state.data = state.base; return; }
      var d = clone(state.base);
      Object.keys(ov.data || {}).forEach(function (p) { set(d, p, ov.data[p]); });
      state.lang = 'pl'; state.ui = ov.ui || {}; state.data = d;
    }).catch(function () { state.lang = 'en'; state.ui = state.uiEn; state.data = state.base; });
  }
  function initLangSwitch(rerender) {
    var box = $('lang-switch'); if (!box) return;
    var probe = state.plStatus ? Promise.resolve() : load('i18n/pl.json').then(function (ov) {
      state.plStatus = /^reviewed/.test(ov._status || '') ? 'reviewed' : 'draft';
    }).catch(function () {});
    probe.then(function () {
      if (!plAllowed()) return;
      box.hidden = false;
      Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === state.lang));
        b.addEventListener('click', function () {
          var l = b.getAttribute('data-lang'); if (l === (state.want || state.lang)) return;
          state.want = l;
          storage('lang', l);
          if (params().get('lang')) { var u = new URL(location.href); u.searchParams.set('lang', l); history.replaceState(null, '', u); }
          loadLang(l).then(function () {
            if (state.lang !== l) return;
            Array.prototype.forEach.call(box.querySelectorAll('button'), function (x) {
              x.setAttribute('aria-pressed', String(x.getAttribute('data-lang') === state.lang));
            });
            rerender();
          });
        });
      });
    });
  }
  function applyStatic() {
    document.documentElement.lang = state.lang;
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (n) { n.textContent = t(n.getAttribute('data-i18n')); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-aria]'), function (n) { n.setAttribute('aria-label', t(n.getAttribute('data-i18n-aria'))); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-bind]'), function (n) {
      var v = get(state.data, n.getAttribute('data-bind'));
      n.textContent = v == null ? '' : v; n.hidden = v == null || v === '';
    });
  }

  // ---------- skill <-> project matching (always on English base data) ----------
  function tokens(s) {
    return String(s).replace(/\([^)]*\)/g, '').split(/[\/,]/).map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function projectMatches(p, skillName) {
    var tech = (p.tech || []).map(function (x) { return x.toLowerCase(); });
    var hay = [p.title, p.description, p.outcome].concat(p.tech || []).join(' ').toLowerCase();
    return tokens(skillName).some(function (tok) {
      var k = tok.toLowerCase();
      if (k.length < 3) return tech.some(function (x) { return tokens(x).map(function (y) { return y.toLowerCase(); }).indexOf(k) >= 0; });
      return new RegExp('(^|[^a-z0-9])' + esc(k) + '([^a-z0-9]|$)').test(hay);
    });
  }

  // ---------- flow diagrams (case-study page): data.json `diagram.nodes` -> stepping SVG ----------
  var ICONS = {
    doc: 'M4 1.5h5l3 3v10H4zM9 1.5v3h3',
    db: 'M3 4c0-1.4 2.2-2.5 5-2.5s5 1.1 5 2.5v8c0 1.4-2.2 2.5-5 2.5S3 13.4 3 12zM3 4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5M3 8c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5',
    gear: 'M5.2 8a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0 -5.6 0M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4',
    check: 'M8 1.5l5 2v4c0 3.2-2.1 5.6-5 7-2.9-1.4-5-3.8-5-7v-4zM5.6 8l1.8 1.8 3.2-3.4',
    cloud: 'M4.5 12.5a3 3 0 0 1-.4-5.97A4 4 0 0 1 11.9 6a3.25 3.25 0 0 1-.4 6.5z',
    chart: 'M2 14h12M4 14V9M8 14V4M12 14V7',
    lock: 'M4 7.5h8V14H4zM5.5 7.5V5a2.5 2.5 0 0 1 5 0v2.5',
    model: 'M1.8 4.5a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0M1.8 11.5a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0M6.8 8a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0M11.8 4.5a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0M11.8 11.5a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0M4 5.2l3 2.1M4 10.8l3-2.1M9 7.3l3-2.1M9 8.7l3 2.1',
    search: 'M3 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M10 10l4 4',
    plant: 'M2 14V7l4 2.5V7l4 2.5V3h3v11z',
    user: 'M5.5 5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M3 14c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5',
    drop: 'M8 1.8c2.6 3.2 4 5.4 4 7.4a4 4 0 0 1-8 0c0-2 1.4-4.2 4-7.4z',
    wave: 'M1.5 8c1.3-5 2.9-5 4.3 0s3 5 4.4 0 2.6-4 4.3-1.5',
    bolt: 'M9 1.5L3.5 9H8l-1 5.5L12.5 7H8z',
    api: 'M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5M9 3L7 13'
  };
  var flows = [], flowTimer = null;
  function flowDiagram(dg, per, W) {
    var nodes = ((dg && dg.nodes) || []).filter(function (n) { return n && n.label; }), n = nodes.length;
    if (n < 2) return null;
    per = Math.min(per, n);
    var GAP = 20, NH = 34, RG = 16, rows = Math.ceil(n / per), nw = (W - (per - 1) * GAP) / per, H = rows * NH + (rows - 1) * RG;
    var svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true' }), edges = sv('g'), boxes = sv('g'), pos = [], gs = [], es = [];
    svg.appendChild(edges); svg.appendChild(boxes);
    nodes.forEach(function (nd, i) {
      // rows snake left-to-right then right-to-left, so each step sits next to the previous one
      var r = Math.floor(i / per), c = i % per; if (r % 2) c = per - 1 - c;
      var x = c * (nw + GAP), y = r * (NH + RG); pos.push({ x: x, y: y, r: r });
      var g = sv('g', { class: 'dg-node', 'data-i': i }, [
        sv('rect', { x: x + .5, y: y + .5, width: nw - 1, height: NH - 1, rx: 8 }),
        sv('path', { d: ICONS[nd.icon] || ICONS.gear, transform: 'translate(' + (x + 9) + ' ' + (y + 9) + ')' }),
        sv('text', { x: x + 31, y: y + NH / 2 + 4, textLength: String(nd.label).length * 6.2 > nw - 38 ? nw - 38 : null, lengthAdjust: 'spacingAndGlyphs' }, [nd.label])
      ]);
      boxes.appendChild(g); gs.push(g);
      if (!i) return;
      var a = pos[i - 1], x1, y1, x2, y2, hd;
      if (a.r === r) { var fwd = x > a.x; x1 = fwd ? a.x + nw : a.x; x2 = fwd ? x - 2 : x + nw + 2; y1 = y2 = y + NH / 2; hd = fwd ? 'M-5 -3.5L0 0L-5 3.5' : 'M5 -3.5L0 0L5 3.5'; }
      else { x1 = x2 = x + nw / 2; y1 = a.y + NH; y2 = y - 2; hd = 'M-3.5 -5L0 0L3.5 -5'; }
      var e = sv('g', { class: 'dg-edge' }, [sv('line', { x1: x1, y1: y1, x2: x2, y2: y2 }), sv('path', { d: hd, transform: 'translate(' + x2 + ' ' + y2 + ')' })]);
      edges.appendChild(e); es.push(e);
    });
    var cap = el('p', { class: 'dg-detail' });
    var box = el('div', { class: 'diagram', tabindex: '0', role: 'group', 'aria-label': t('diagram.label', { n: n }) }, [svg, cap]);
    var f = stepper(box, cap, n, function (i) {
      gs.forEach(function (g, k) { g.classList.toggle('on', k === i); g.classList.toggle('done', k < i); });
      es.forEach(function (e, k) { e.classList.toggle('on', k < i); });
      caption(cap, nodes[i].label, nodes[i].detail);
    });
    function pick(ev) { var g = ev.target.closest && ev.target.closest('.dg-node'); if (g) f.show(+g.getAttribute('data-i')); return !!g; }
    svg.addEventListener('mouseover', function (ev) { f.hover = true; pick(ev); });
    box.addEventListener('mouseleave', function () { f.hover = false; });
    svg.addEventListener('click', function (ev) { if (pick(ev)) f.hold = Date.now() + 8000; });
    return box;
  }
  function caption(cap, title, detail) {
    clear(cap); cap.appendChild(el('b', { text: title }));
    if (detail) cap.appendChild(document.createTextNode(' — ' + detail));
  }
  // Shared by every stepped visual: auto-play while on screen, one tab stop, arrow keys to step.
  // Changes are announced only while the visual has keyboard focus. dwell[i] = ticks to stay on step i.
  function stepper(box, cap, n, paint, dwell) {
    var f = { box: box, at: -1, hold: 0, hover: false, wait: 0 };
    f.show = function (i) { f.at = i = (i + n) % n; f.wait = ((dwell && dwell[i]) || 1) - 1; paint(i); };
    box.addEventListener('focus', function () { f.hover = true; cap.setAttribute('aria-live', 'polite'); });
    box.addEventListener('blur', function () { f.hover = false; cap.removeAttribute('aria-live'); });
    box.addEventListener('keydown', function (ev) {
      var d = ev.key === 'ArrowRight' || ev.key === 'ArrowDown' ? 1 : ev.key === 'ArrowLeft' || ev.key === 'ArrowUp' ? -1 : 0;
      if (d) { ev.preventDefault(); f.show(f.at + d); }
    });
    f.show(0); flows.push(f);
    if (!flowTimer && !reduceMotion) flowTimer = setInterval(function () {
      if (document.hidden) return;
      var now = Date.now();
      flows.forEach(function (x, k) {
        if (x.hover || x.hold > now || !x.box.isConnected) return;
        var r = x.box.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || !r.height) return;
        if (x.wait > 0) { x.wait--; return; }
        setTimeout(function () { if (!x.hover) x.show(x.at + 1); }, (k % 3) * 350);
      });
    }, 2600);
    return f;
  }

  // ---------- project scenes (case-study page): bespoke animations keyed by data.json `scene` ----------
  // Sequencing QC: reads come off the sequencer -> bases coloured by quality -> low quality removed
  // -> reads aligned to the reference -> a consistent mismatch is called as a variant. Schematic, made-up bases.
  var SEQ = { ref: 'ACGTTAGCCATGGACTTGCAA', col: 11, alt: 'A', reads: [
    { s: 0, q: 'hhhhhmhhhhhhll', alt: true },
    { s: 4, q: 'lhhmhhhhhhmhhhl' },
    { s: 2, q: 'mllmlllhllmll', fail: true },
    { s: 8, q: 'hhhhhhhmhhlll', alt: true }
  ] };
  function sceneSequencing() {
    var X0 = 46, CW = 12, RY = 26, RH = 18, W = X0 + SEQ.ref.length * CW + 2, rows = SEQ.reads.length, H = RY + rows * RH + 18;
    function cell(ch, x, y, cls) { return sv('g', { class: cls }, [sv('rect', { x: x, y: y, width: CW - 1, height: 14, rx: 2.5 }), sv('text', { x: x + (CW - 1) / 2, y: y + 10.5 }, [ch])]); }
    var svg = sv('svg', { class: 'sq', viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true' });
    var ref = sv('g', { class: 'ref' }, [sv('text', { class: 'lbl', x: 2, y: 12.5 }, ['REF'])]);
    SEQ.ref.split('').forEach(function (ch, c) { ref.appendChild(cell(ch, X0 + c * CW, 2, 'rb')); });
    svg.appendChild(ref);
    // the sequencer the reads come out of
    svg.appendChild(sv('g', { class: 'dev' }, [
      sv('rect', { x: 3, y: RY + 4, width: 34, height: rows * RH - 12, rx: 5 }),
      sv('rect', { class: 'slot', x: 9, y: RY + 12, width: 22, height: 5, rx: 2 }),
      sv('circle', { class: 'led', cx: 30, cy: RY + rows * RH - 17, r: 2.4 }),
      sv('path', { d: 'M38 ' + (RY + rows * RH / 2 - 2) + 'h5m-2.5-2.5l2.5 2.5l-2.5 2.5' })
    ]));
    SEQ.reads.forEach(function (rd, r) {
      var g = sv('g', { class: 'rd' + (rd.fail ? ' fail' : '') });
      g.style.setProperty('--s', rd.s);
      rd.q.split('').forEach(function (q, k) {
        var c = rd.s + k, isAlt = rd.alt && c === SEQ.col;
        // drawn left-aligned (as generated); CSS slides the read to its aligned position later
        var b = cell(isAlt ? SEQ.alt : SEQ.ref[c], X0 + k * CW, RY + r * RH, 'b q-' + q + (isAlt ? ' alt' : ''));
        b.style.setProperty('--d', (k * 55 + r * 130) + 'ms');
        g.appendChild(b);
      });
      svg.appendChild(g);
    });
    var vx = X0 + SEQ.col * CW;
    svg.appendChild(sv('g', { class: 'vr' }, [
      sv('rect', { class: 'col', x: vx - 1.5, y: .5, width: CW + 2, height: RY + rows * RH - 3, rx: 3.5 }),
      sv('rect', { class: 'tag', x: vx - 10, y: RY + rows * RH, width: 31, height: 14, rx: 3 }),
      sv('text', { x: vx + 5.5, y: RY + rows * RH + 10.5 }, [SEQ.ref[SEQ.col] + '>' + SEQ.alt])
    ]));
    var N = 5, dots = el('div', { class: 'dg-steps' }), cap = el('p', { class: 'dg-detail' });
    for (var k = 0; k < N; k++) dots.appendChild(el('span', { 'data-i': k }));
    var box = el('div', { class: 'diagram scene', tabindex: '0', role: 'group', 'aria-label': t('diagram.label', { n: N }) }, [svg, dots, cap]);
    var f = stepper(box, cap, N, function (i) {
      svg.classList.toggle('ph0', i === 0); svg.classList.toggle('q', i === 1 || i === 2);
      svg.classList.toggle('trim', i >= 2); svg.classList.toggle('aln', i >= 3); svg.classList.toggle('var', i === 4);
      Array.prototype.forEach.call(dots.children, function (dt, k) { dt.classList.toggle('on', k === i); dt.classList.toggle('done', k < i); });
      caption(cap, t('scene.seq.' + i + '.title'), t('scene.seq.' + i + '.text'));
    }, [1, 1, 1, 1, 2]);
    dots.addEventListener('click', function (ev) { var i = ev.target.getAttribute('data-i'); if (i != null) { f.show(+i); f.hold = Date.now() + 8000; } });
    return box;
  }
  var SCENES = { 'sequencing-qc': sceneSequencing };
  function scene(p) { return SCENES.hasOwnProperty(p.scene) ? SCENES[p.scene]() : null; }
  function primary(p) { return p.domain || (p.domains || [])[0]; }
  function mainProjects(d) { return (d.projects || []).filter(function (p) { return p.section !== 'research'; }); }

  // ---------- renderers ----------
  function renderHero(d) {
    var h = d.hero || {};
    var p = $('cta-primary'), s = $('cta-secondary');
    if (p && h.cta_primary) { p.textContent = h.cta_primary.text; p.href = safeUrl(h.cta_primary.link) || '#projects'; }
    if (s && h.cta_secondary) { s.textContent = h.cta_secondary.text; s.href = safeUrl(h.cta_secondary.link) || '#contact'; }
    var soc = clear($('social')), so = d.meta.social || {};
    [['LinkedIn', so.linkedin], ['GitHub', so.github], ['Google Scholar', so.scholar], [t('social.email'), d.meta.email && 'mailto:' + d.meta.email]]
      .forEach(function (x) { if (safeUrl(x[1])) soc.appendChild(el('li', null, [extLink(x[1], x[0])])); });
    var cl = clear($('currently-list'));
    (d.currently || []).forEach(function (c) { cl.appendChild(el('li', null, [el('div', null, [el('strong', { text: c.label }), c.detail ? el('span', { text: c.detail }) : null])])); });
    var st = clear($('stats'));
    ((d.about || {}).stats || []).forEach(function (x) {
      var n = statValue(x);
      if (n == null) return;
      var num = el('span', { class: 'count-up', 'aria-hidden': 'true', 'data-target': String(n), text: reduceMotion ? String(n) : '0' });
      var dd = el('dd', null, [num, x.suffix ? el('span', { class: 'suffix', 'aria-hidden': 'true', text: x.suffix }) : null, el('span', { class: 'sr-only', text: n + (x.suffix || '') })]);
      var box = el('div', { class: 'stat reveal' }, [el('dt', { text: x.label }), dd]);
      if (x.flags && x.flags.length) {
        var fl = el('div', { class: 'flags' });
        x.flags.forEach(function (c) { var f = flag(c); if (f) fl.appendChild(f); });
        box.appendChild(fl);
      }
      st.appendChild(box);
    });
    countUp(st); observeReveal(st);
  }
  function renderAbout(d) {
    var a = d.about || {}, tx = clear($('about-text')), hl = clear($('highlights'));
    (a.paragraphs || []).forEach(function (p) { tx.appendChild(el('p', { text: p })); });
    (a.highlights || []).forEach(function (h) { hl.appendChild(el('li', { class: 'reveal' }, [el('strong', { text: h.label }), el('span', { text: h.value })])); });
  }
  function renderDomainFilter(d) {
    var box = clear($('domain-filter')), proj = mainProjects(state.base);
    var doms = [{ id: 'all', label: t('projects.filter.all') }].concat((d.domains || []).filter(function (x) {
      return proj.some(function (p) { return primary(p) === x.id; });
    }));
    doms.forEach(function (x) {
      var cnt = x.id === 'all' ? proj.length : proj.filter(function (p) { return primary(p) === x.id; }).length;
      var b = el('button', { type: 'button', class: 'chip', 'data-key': 'd:' + x.id, 'aria-pressed': String(state.domain === x.id), 'aria-label': x.label + ' (' + cnt + ')' }, [x.label, el('span', { class: 'count', 'aria-hidden': 'true', text: String(cnt) })]);
      if (x.color) b.style.setProperty('--dom', safeColor(x.color));
      b.addEventListener('click', function () { state.domain = x.id; state.skill = null; renderDomainFilter(state.data); renderProjects(state.data); renderSkills(state.data); refocus('d:' + x.id); });
      box.appendChild(b);
    });
  }
  function projectCard(p, baseP, domLabels, domColors) {
    var card = el('article', { class: 'card project reveal', 'data-id': p.id }), art = el('div', { class: 'project-body' });
    if (domColors[primary(p)]) card.style.setProperty('--dom', domColors[primary(p)]);
    var thumb = caseImg(p.image);
    if (thumb) {
      var im = el('img', { src: thumb, alt: '', loading: 'lazy', decoding: 'async' }), raw = caseImg(p.image_raw);
      im.addEventListener('error', function () { card.classList.remove('has-media'); im.parentNode.remove(); });
      // with a raw frame underneath, CSS plays raw scan -> sweep -> detection overlay on a loop
      var media = el('div', { class: 'media' + (raw ? ' detect' : ''), 'aria-hidden': 'true' }, raw ? [
        el('img', { src: raw, alt: '', loading: 'lazy', decoding: 'async' }), im,
        el('span', { class: 'scanline' }), el('span', { class: 'phase raw', text: t('media.input') }), el('span', { class: 'phase det', text: t('media.detection') })
      ] : [im]);
      if (raw) im.className = 'overlay';
      card.classList.add('has-media'); card.appendChild(media);
    }
    card.appendChild(art);
    var metaBits = [p.org, p.period && range(p.period.start, p.period.end)].filter(Boolean).join(' · ');
    art.appendChild(el('div', { class: 'status', text: (p.domains || []).map(function (x) { return domLabels[x] || x; }).join(' · ') }));
    art.appendChild(el('h3', { text: p.title }));
    if (metaBits) art.appendChild(el('div', { class: 'meta', text: metaBits }));
    art.appendChild(el('p', { text: p.description }));
    if (p.metrics && p.metrics.length) {
      var ml = el('ul', { class: 'metrics', 'aria-label': t('projects.impact') });
      p.metrics.forEach(function (m) { ml.appendChild(el('li', null, [el('b', { text: m.value }), m.label])); });
      art.appendChild(ml);
    } else if (p.outcome) art.appendChild(el('p', { text: p.outcome }));
    var tg = el('ul', { class: 'tags' });
    (p.tech || []).forEach(function (x) { tg.appendChild(el('li', { class: 'tag', text: x })); });
    art.appendChild(tg);
    var act = el('div', { class: 'actions' });
    if (p.case_study && p.case_study.enabled) act.appendChild(el('a', { class: 'more', href: 'case.html?id=' + encodeURIComponent(p.id) }, [t('projects.case_study'), el('span', { class: 'arrow', 'aria-hidden': 'true', text: '→' })]));
    if (p.links && p.links.paper) act.appendChild(extLink(p.links.paper, t('projects.paper') + ' ↗'));
    if (act.childNodes.length) art.appendChild(act);
    return card;
  }
  function renderProjects(d) {
    var grid = clear($('project-grid')), domLabels = {}, domColors = {};
    (d.domains || []).forEach(function (x) { domLabels[x.id] = x.label; if (x.color) domColors[x.id] = safeColor(x.color); });
    var list = mainProjects(d).filter(function (p) { return state.domain === 'all' || primary(p) === state.domain; });
    list.sort(function (a, b) {
      if (state.skill) { var ma = projectMatches(get(state.base, 'projects.' + a.id) || a, state.skill), mb = projectMatches(get(state.base, 'projects.' + b.id) || b, state.skill); if (ma !== mb) return ma ? -1 : 1; }
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
    var n = 0;
    list.forEach(function (p) {
      var bp = get(state.base, 'projects.' + p.id) || p;
      var card = projectCard(p, bp, domLabels, domColors);
      if (state.skill) { var m = projectMatches(bp, state.skill); card.classList.add(m ? 'match' : 'dim'); if (m) n++; }
      grid.appendChild(card);
    });
    var ss = clear($('skill-status'));
    if (state.skill) ss.appendChild(el('a', { href: '#projects', text: state.skill + ': ' + n + ' / ' + list.length + ' ↑' }));
    $('filter-status').textContent = state.skill ? (state.skill + ': ' + n + ' / ' + list.length) + (n ? '' : ' — ' + t('projects.empty')) : '';
    observeReveal(grid);
  }
  function skillCount(name) { return mainProjects(state.base).filter(function (p) { return projectMatches(p, name); }).length; }
  function selectSkill(name, key) {
    state.skill = state.skill === name ? null : name; state.domain = 'all';
    renderDomainFilter(state.data); renderProjects(state.data); renderSkills(state.data);
    refocus(key);
  }
  function renderSkills(d) {
    var box = clear($('skill-groups'));
    (d.skills || []).forEach(function (g, gi) {
      var baseG = state.base.skills[gi] || g;
      var card = el('div', { class: 'card skill-group reveal' });
      if (/^#[0-9a-f]{3,8}$/i.test(g.color || '')) card.style.setProperty('--group', g.color);
      card.appendChild(el('h3', { text: g.name }));
      var row = el('div', { class: 'chip-row', role: 'group', 'aria-label': g.name });
      (g.items || []).forEach(function (it, ii) {
        var name = (baseG.items[ii] || it).name, cnt = skillCount(name);
        if (!cnt) { row.appendChild(el('span', { class: 'chip static', text: it.name })); return; }
        var b = el('button', { type: 'button', class: 'chip', 'data-key': 's:' + name, 'aria-pressed': String(state.skill === name), 'aria-label': it.name + ' (' + cnt + ')' }, [it.name, el('span', { class: 'count', 'aria-hidden': 'true', text: String(cnt) })]);
        b.addEventListener('click', function () { selectSkill(name, 's:' + name); });
        row.appendChild(b);
      });
      card.appendChild(row); box.appendChild(card);
    });
    renderNetwork(d);
    applySkillsView();
    observeReveal(box);
  }


  // ---------- key-figure cards ----------
  function statValue(x) {
    var b = state.base;
    if (x.auto === 'years') {
      var starts = (b.experience || []).map(function (e) { return e.start; }).filter(Boolean).sort();
      if (!starts.length) return null;
      var p = starts[0].split('-'), now = new Date();
      return Math.floor(((now.getFullYear() - +p[0]) * 12 + (now.getMonth() + 1 - +(p[1] || 1))) / 12);
    }
    if (x.auto === 'organizations') {
      var seen = {};
      (b.experience || []).forEach(function (e) { seen[String(e.company).split(/\s+[—–-]\s+/)[0].replace(/\s*\(.*\)$/, '').trim().toLowerCase()] = 1; });
      return Object.keys(seen).length;
    }
    if (x.auto === 'publications') return (b.publications || []).length;
    return typeof x.value === 'number' ? x.value : null;
  }
  var FLAGS = {
    in: [['rect', { width: 30, height: 20, fill: '#fff' }], ['rect', { width: 30, height: 6.67, fill: '#FF9933' }], ['rect', { y: 13.33, width: 30, height: 6.67, fill: '#138808' }], ['circle', { cx: 15, cy: 10, r: 2.6, fill: 'none', stroke: '#000080', 'stroke-width': 0.8 }], ['circle', { cx: 15, cy: 10, r: 0.6, fill: '#000080' }]],
    pl: [['rect', { width: 30, height: 20, fill: '#fff' }], ['rect', { y: 10, width: 30, height: 10, fill: '#DC143C' }]],
    us: (function () {
      var a = [['rect', { width: 30, height: 20, fill: '#fff' }]];
      for (var i = 0; i < 13; i += 2) a.push(['rect', { y: i * 20 / 13, width: 30, height: 20 / 13, fill: '#B22234' }]);
      a.push(['rect', { width: 12, height: 20 * 7 / 13, fill: '#3C3B6E' }]);
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) a.push(['circle', { cx: 1.6 + c * 2.9, cy: 1.4 + r * 2.5, r: 0.5, fill: '#fff' }]);
      return a;
    })()
  };
  function flag(code) {
    var parts = FLAGS[code]; if (!parts) return null;
    var name = t('country.' + code);
    return sv('svg', { class: 'flag', viewBox: '0 0 30 20', width: 30, height: 20, role: 'img', 'aria-label': name },
      [sv('title', null, [name])].concat(parts.map(function (p) { return sv(p[0], p[1]); })));
  }
  var countObs = null;
  function countUp(root) {
    var nums = root.querySelectorAll('.count-up');
    if (reduceMotion || !('IntersectionObserver' in window)) { Array.prototype.forEach.call(nums, function (n) { n.textContent = n.getAttribute('data-target'); }); return; }
    function run(n) {
      var target = +n.getAttribute('data-target'), t0 = null, dur = 1200 + target * 20;
      function step(ts) {
        if (!t0) t0 = ts;
        var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        n.textContent = String(Math.round(target * e));
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (countObs) countObs.disconnect();
    countObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); countObs.unobserve(e.target); } });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(nums, function (n) { countObs.observe(n); });
  }

  // ---------- skill network (hub-and-spoke SVG, built from data.json) ----------
  var NS = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs, kids) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { if (attrs[k] != null) n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  var netPlayed = false, netObs = null;
  function safeColor(c) { return /^#[0-9a-f]{3,8}$/i.test(c || '') ? c : '#22d3ee'; }
  function renderNetwork(d) {
    var host = $('skill-network'); if (!host) return;
    clear(host);
    var groups = d.skills || [], W = 1420, H = 1260, cx = W / 2, cy = H / 2;
    var R = 360, SPOKE = 92, ORB = 11, HUB = 24;
    var total = groups.reduce(function (n, g) { return n + (g.items || []).length; }, 0);
    var svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'group', 'aria-label': t('skills.graph.label', { n: total, g: groups.length }) });
    var edges = sv('g'), nodes = sv('g');
    svg.appendChild(edges); svg.appendChild(nodes);
    // first time on screen the graph grows outward from the core; --d staggers each element
    var enter = !reduceMotion && !netPlayed && 'IntersectionObserver' in window;
    function at(n, ms) { if (enter) n.style.setProperty('--d', ms + 'ms'); return n; }
    // core node
    nodes.appendChild(sv('g', { class: 'sn-core sn-item', 'aria-hidden': 'true' }, [
      sv('circle', { class: 'sn-ping', cx: cx, cy: cy, r: 42 }),
      sv('circle', { cx: cx, cy: cy, r: 42 }),
      sv('text', { x: cx, y: cy + 9, 'text-anchor': 'middle' }, [d.meta.initials || 'SB'])
    ]));
    groups.forEach(function (g, gi) {
      var baseG = state.base.skills[gi] || g, col = safeColor(g.color);
      var a0 = gi / groups.length * 2 * Math.PI - Math.PI / 2;
      var hx = cx + R * Math.cos(a0), hy = cy + R * Math.sin(a0);
      var t0 = 150 + gi * 70;
      edges.appendChild(at(sv('line', { class: 'sn-core-edge sn-item', 'data-g': g.id, pathLength: 1, x1: cx + 42 * Math.cos(a0), y1: cy + 42 * Math.sin(a0), x2: hx - HUB * Math.cos(a0), y2: hy - HUB * Math.sin(a0) }), t0));
      var items = g.items || [], n = items.length;
      var spread = Math.min(Math.PI * 0.8, Math.max(0.5, (n - 1) * 0.25));
      items.forEach(function (it, ii) {
        var name = (baseG.items[ii] || it).name, cnt = skillCount(name);
        var a = n === 1 ? a0 : a0 - spread / 2 + ii / (n - 1) * spread;
        var sx = hx + SPOKE * Math.cos(a), sy = hy + SPOKE * Math.sin(a);
        edges.appendChild(at(sv('line', { class: 'sn-edge sn-item', 'data-g': g.id, stroke: col, pathLength: 1, x1: hx + HUB * Math.cos(a), y1: hy + HUB * Math.sin(a), x2: sx - ORB * Math.cos(a), y2: sy - ORB * Math.sin(a) }), t0 + 450 + ii * 35));
        var deg = a * 180 / Math.PI, left = Math.cos(a) < 0;
        var label = sv('text', { class: 'sn-label', x: left ? -(ORB + 6) : ORB + 6, y: 5, 'text-anchor': left ? 'end' : 'start', transform: 'rotate(' + (left ? deg + 180 : deg) + ')' }, [it.short || it.name]);
        var grp = sv('g', { class: 'sn-skill sn-item ' + (cnt ? 'live' : 'zero') + (state.skill === name ? ' sel' : ''), 'data-g': g.id, transform: 'translate(' + sx.toFixed(1) + ',' + sy.toFixed(1) + ')' }, [
          sv('title', null, [it.name + (cnt ? ' — ' + t('skills.projects', { n: cnt }) : '')]),
          sv('circle', { r: ORB, fill: col, stroke: 'var(--bg-elev)', 'stroke-width': 2 }),
          cnt ? sv('text', { class: 'sn-count', y: 3.5, 'text-anchor': 'middle' }, [String(cnt)]) : null,
          label
        ]);
        at(grp, t0 + 600 + ii * 35);
        if (cnt) {
          grp.setAttribute('tabindex', '0'); grp.setAttribute('role', 'button');
          grp.setAttribute('data-key', 'g:' + name);
          grp.setAttribute('aria-pressed', String(state.skill === name));
          grp.setAttribute('aria-label', it.name + ' (' + cnt + ')');
          grp.addEventListener('click', function () { selectSkill(name, 'g:' + name); });
          grp.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectSkill(name, 'g:' + name); } });
        } else grp.setAttribute('aria-hidden', 'true');
        nodes.appendChild(grp);
      });
      // hub + label on the centre side of the hub; long names wrap to two lines
      var words = String(g.name), lines = [words];
      if (words.length > 16) {
        var cut = words.lastIndexOf(' ', Math.ceil(words.length / 2) + 4);
        if (cut > 0) lines = [words.slice(0, cut), words.slice(cut + 1)];
      }
      var off = HUB + 22, sinA = Math.sin(a0), cosA = Math.cos(a0);
      var lx = hx - off * cosA, ly = hy - off * sinA;
      var y0 = sinA >= -0.2 ? ly - (lines.length - 1) * 19 + 5 : ly + 12;
      var anchor = cosA > 0.35 ? 'end' : cosA < -0.35 ? 'start' : 'middle';
      var txt = sv('text', { class: 'sn-hub-label', 'text-anchor': anchor });
      lines.forEach(function (ln, li) { txt.appendChild(sv('tspan', { x: lx.toFixed(1), y: (y0 + li * 19).toFixed(1) }, [ln])); });
      nodes.appendChild(at(sv('g', { class: 'sn-hub sn-item', 'data-g': g.id, 'aria-hidden': 'true' }, [
        sv('circle', { cx: hx, cy: hy, r: HUB, fill: col, stroke: 'var(--bg-elev)', 'stroke-width': 3 }),
        txt
      ]), t0 + 300));
    });
    // hover / focus: emphasise one group
    function hl(id) {
      svg.classList.toggle('focus-mode', !!id);
      Array.prototype.forEach.call(svg.querySelectorAll('.sn-item'), function (n) { n.classList.toggle('hl', !!id && n.getAttribute('data-g') === id); });
    }
    svg.addEventListener('mouseover', function (e) { var g = e.target.closest && e.target.closest('[data-g]'); hl(g ? g.getAttribute('data-g') : null); });
    svg.addEventListener('mouseleave', function () { hl(null); });
    svg.addEventListener('focusin', function (e) { var g = e.target.closest && e.target.closest('[data-g]'); hl(g ? g.getAttribute('data-g') : null); });
    svg.addEventListener('focusout', function () { hl(null); });
    host.appendChild(svg);
    if (netObs) netObs.disconnect();
    if (!enter) return;
    svg.classList.add('sn-enter');
    netObs = new IntersectionObserver(function (es) {
      if (!es.some(function (e) { return e.isIntersecting; })) return;
      netObs.disconnect(); netPlayed = true;
      svg.classList.add('sn-in');
      // drop the entrance classes once it has played so hover dimming is not delayed by --d
      setTimeout(function () { svg.classList.remove('sn-enter', 'sn-in'); }, 2600);
    }, { threshold: 0.15 });
    netObs.observe(host);
  }
  function currentView() {
    var v = storage('skillsView');
    return v === 'list' || v === 'network' ? v : (window.innerWidth < 768 ? 'list' : 'network');
  }
  function applySkillsView() {
    var v = currentView(), net = $('skill-network'), list = $('skill-groups'), tg = $('skills-view');
    if (!net || !list || !tg) return;
    net.hidden = v !== 'network'; list.hidden = v !== 'list';
    Array.prototype.forEach.call(tg.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-view') === v)); });
  }
  function initSkillsView() {
    var tg = $('skills-view'); if (!tg) return;
    tg.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-view]'); if (!b) return;
      storage('skillsView', b.getAttribute('data-view')); applySkillsView();
    });
  }
  function caseImg(u) { return typeof u === 'string' && /^assets\/case\/[\w.-]+\.(png|svg|webp|jpe?g)$/i.test(u) ? u : null; }
  function safeImg(u) { return typeof u === 'string' && /^assets\/logos\/[\w.-]+\.(png|svg|webp|jpe?g)$/i.test(u) ? u : null; }
  function monogram(name, mono) {
    var m = mono || String(name).split(/[\s—–-]+/).filter(function (w) { return /^[A-Z]/.test(w); }).slice(0, 3).map(function (w) { return w[0]; }).join('');
    return el('span', { class: 'org-logo mono', 'aria-hidden': 'true', text: m || '•' });
  }
  function orgLogo(e, name) {
    var src = safeImg(e.logo);
    if (!src) return monogram(name, e.monogram);
    var img = el('img', { class: 'org-logo', src: src, alt: '', width: 48, height: 48, loading: 'lazy', decoding: 'async' });
    img.addEventListener('error', function () { img.replaceWith(monogram(name, e.monogram)); });
    return img;
  }
  function roleItem(e) {
    var li = el('li', { class: 'reveal' });
    var head = el('div', { class: 'role-head' }, [orgLogo(e, e.company), el('div', null, [
      el('h3', null, [e.role, el('span', { class: 'org', text: ' · ' + e.company })]),
      el('div', { class: 'when', text: [range(e.start, e.end), e.location, e.company_note].filter(Boolean).join(' · ') })
    ])]);
    li.appendChild(head);
    if (e.bullets && e.bullets.length) { var ul = el('ul'); e.bullets.forEach(function (b) { ul.appendChild(el('li', { text: b })); }); li.appendChild(ul); }
    return li;
  }
  function renderExperience(d) {
    var main = clear($('timeline')), cmp = clear($('timeline-compact'));
    (d.experience || []).forEach(function (e) { (e.compact ? cmp : main).appendChild(roleItem(e)); });
    $('earlier').hidden = !cmp.childNodes.length;
    observeReveal(main); observeReveal(cmp);
  }
  function chipList(items) { var r = el('div', { class: 'chip-row' }); items.forEach(function (x) { r.appendChild(el('span', { class: 'tag', text: x })); }); return r; }
  function renderCapabilities(d) {
    var c = d.capabilities || {}, g = clear($('cap-grid'));
    [['capabilities.practices', c.engineering_practices], ['capabilities.compliance', c.compliance], ['capabilities.stakeholders', c.stakeholders], ['capabilities.leadership', c.leadership]]
      .forEach(function (x) {
        if (!x[1]) return;
        g.appendChild(el('div', { class: 'card reveal' }, [el('h3', { class: 'card-kicker', text: t(x[0]) }), Array.isArray(x[1]) ? chipList(x[1]) : el('p', { text: x[1] })]));
      });
    observeReveal(g);
  }
  function renderResearch(d) {
    var r = d.research || {};
    $('research-summary').textContent = r.summary || '';
    var rl = clear($('research-list'));
    (r.project_ids || []).forEach(function (id) {
      var p = get(d, 'projects.' + id); if (!p) return;
      rl.appendChild(el('li', { class: 'card reveal' }, [el('h3', { text: p.title }), el('p', { text: p.outcome || p.description })]));
    });
    var pl = clear($('pubs'));
    (d.publications || []).forEach(function (p) {
      var ap = p.author_position || {};
      var pos = ap.n === 1 ? t('publications.first_author') : (ap.n && ap.of ? t('publications.author', { n: ap.n, of: ap.of }) : null);
      pl.appendChild(el('li', null, [
        p.doi ? extLink('https://doi.org/' + encodeURIComponent(p.doi).replace(/%2F/g, '/'), p.title) : el('span', { text: p.title }),
        el('span', { class: 'venue', text: [p.journal + ' ' + p.year + (p.citation ? ', ' + p.citation : ''), pos].filter(Boolean).join(' · ') })
      ]));
    });
    observeReveal(rl);
  }
  function renderCreds(d) {
    function fill(id, arr, fn) { var u = clear($(id)); (arr || []).forEach(function (x) { u.appendChild(fn(x)); }); }
    fill('education', d.education, function (e) { return el('li', { class: 'edu-item' }, [orgLogo(e, e.institution), el('div', null, [el('strong', { text: e.degree }), el('small', { text: e.institution + ' · ' + range(e.start, e.end).replace(/ – $/, '') }), e.note ? el('small', { text: e.note }) : null])]); });
    fill('certs', d.certifications, function (c) { return el('li', { class: 'edu-item' }, [orgLogo(c, c.issuer || c.title), el('div', null, [el('strong', { text: c.title }), (c.issuer || c.year) ? el('small', { text: [c.issuer, c.year].filter(Boolean).join(' · ') }) : null])]); });
    fill('awards', d.awards, function (a) { return el('li', { class: 'edu-item' }, [orgLogo(a, a.issuer || a.title), el('div', null, [el('strong', { text: a.title }), el('small', { text: [a.issuer, a.year].filter(Boolean).join(' · ') })])]); });
    fill('languages', d.languages, function (l) { return el('li', null, [el('strong', { text: l.name }), el('small', { text: l.level })]); });
  }
  function renderContact(d) {
    var sel = clear($('cf-reason'));
    sel.appendChild(el('option', { value: '', text: t('contact.reason.placeholder') }));
    ((d.contact || {}).reasons || []).forEach(function (r) { sel.appendChild(el('option', { value: r, text: r })); });
    var a = $('contact-email'); a.textContent = d.meta.email; a.href = 'mailto:' + d.meta.email;
  }
  function initContactForm() {
    var f = $('contact-form'); if (!f) return;
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = f.name.value.trim(), email = f.email.value.trim(), reason = f.reason.value, msg = f.message.value.trim();
      var err = $('cf-error');
      var bad = [[f.name, !name], [f.email, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)], [f.reason, !reason], [f.message, !msg]];
      bad.forEach(function (x) { if (x[1]) x[0].setAttribute('aria-invalid', 'true'); else x[0].removeAttribute('aria-invalid'); });
      var first = bad.filter(function (x) { return x[1]; })[0];
      if (first) { err.textContent = t('contact.error'); first[0].focus(); return; }
      err.textContent = '';
      var subject = '[Portfolio] ' + reason + ' — ' + name;
      var body = msg + '\n\n— ' + name + ' <' + email + '>';
      window.location.href = 'mailto:' + state.base.meta.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  // ---------- behaviour ----------
  var revealObs = null;
  function observeReveal(root) {
    var nodes = (root || document).querySelectorAll('.reveal:not(.in)');
    if (reduceMotion || !('IntersectionObserver' in window)) { Array.prototype.forEach.call(nodes, function (n) { n.classList.add('in'); }); return; }
    if (!revealObs) revealObs = new IntersectionObserver(function (es) {
      var i = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        // items entering together cascade; the delay is cleared afterwards so it never slows hover
        var n = e.target, d = Math.min(i++, 6) * 70;
        n.style.transitionDelay = d + 'ms';
        n.classList.add('in'); revealObs.unobserve(n);
        setTimeout(function () { n.style.transitionDelay = ''; }, d + 700);
      });
    }, { rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(nodes, function (n) { revealObs.observe(n); });
  }
  // scroll progress bar, header shadow, and the experience line that fills as you read
  var scrollFx = function () {};
  function initScrollFx() {
    var bar = $('scroll-progress'), head = document.querySelector('.site-header'), lines = document.querySelectorAll('.timeline'), queued = false;
    function update() {
      queued = false;
      var y = window.pageYOffset, max = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ')';
      if (head) head.classList.toggle('scrolled', y > 8);
      if (reduceMotion) return;
      Array.prototype.forEach.call(lines, function (tl) {
        var r = tl.getBoundingClientRect(); if (!r.height) return;
        tl.style.setProperty('--tp', Math.max(0, Math.min(1, (innerHeight * .65 - r.top) / r.height)).toFixed(3));
      });
    }
    scrollFx = function () { if (!queued) { queued = true; requestAnimationFrame(update); } };
    addEventListener('scroll', scrollFx, { passive: true });
    addEventListener('resize', scrollFx);
    scrollFx();
  }
  // cards light up under the pointer: CSS reads --mx/--my
  function initSpotlight() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest('.card, .stat, .highlights li'); if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
    }, { passive: true });
  }
  function initNav() {
    var btn = $('nav-toggle'), links = $('nav-links'); if (!btn || !links) return;
    function close() { links.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function () { var o = links.classList.toggle('open'); btn.setAttribute('aria-expanded', String(o)); });
    links.addEventListener('click', function (e) { if (e.target.tagName === 'A') close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && links.classList.contains('open')) { close(); btn.focus(); } });
    links.addEventListener('focusout', function (e) { if (!links.contains(e.relatedTarget) && e.relatedTarget !== btn) close(); });
    if (!('IntersectionObserver' in window)) return;
    var map = {};
    Array.prototype.forEach.call(links.querySelectorAll('a[href^="#"]'), function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && map[e.target.id]) { Object.keys(map).forEach(function (k) { map[k].removeAttribute('aria-current'); }); map[e.target.id].setAttribute('aria-current', 'true'); } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = $(id); if (s) obs.observe(s); });
  }
  var typedTimer = null;
  function initTyped(d) {
    var out = $('typed'); if (!out) return;
    var words = ((d.hero || {}).typed_strings || [d.meta.title]).filter(Boolean);
    clearTimeout(typedTimer);
    out.textContent = words[0] || '';
    if (reduceMotion || words.length < 2) return;
    var wi = 0, ci = words[0].length, del = true;
    (function tick() {
      if (del) { ci--; if (ci <= 0) { del = false; wi = (wi + 1) % words.length; } }
      else { ci++; if (ci >= words[wi].length) { del = true; out.textContent = words[wi]; typedTimer = setTimeout(tick, 2200); return; } }
      out.textContent = words[wi].slice(0, Math.max(ci, 0));
      typedTimer = setTimeout(tick, del ? 35 : 70);
    })();
  }

  // ---------- lazy decorative background (2D canvas: drifting nodes, links, pulses hopping between them) ----------
  function lazyBackground() {
    var c = $('bg-canvas');
    if (!c || !c.getContext || reduceMotion || window.innerWidth < 768 || (navigator.connection && navigator.connection.saveData)) return;
    var start = function () { try { flow(c); } catch (e) { /* decorative only */ } };
    var idle = window.requestIdleCallback || function (f) { setTimeout(f, 600); };
    if (document.readyState === 'complete') idle(start); else window.addEventListener('load', function () { idle(start); });
  }
  function flow(canvas) {
    var ctx = canvas.getContext('2d'); if (!ctx) return;
    var LINK = 150, NEAR = 200, TAU = Math.PI * 2;
    var W = 0, H = 0, nodes = [], pulses = [], adj = [], color = '#22d3ee';
    var mx = -1e4, my = -1e4, running = true, raf = 0, resizeT = 0;
    function tint() { color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#22d3ee'; }
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = innerWidth; H = innerHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(90, Math.round(W * H / 16000));
      while (nodes.length < n) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: 1 + Math.random() * 1.4 });
      nodes.length = n; pulses.length = 0;
    }
    function dot(x, y, r, alpha) { ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
    function frame() {
      if (!running) return;
      var n = nodes.length, i, j, a, b, dx, dy, d, p, next;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1;
      for (i = 0; i < n; i++) {
        a = nodes[i]; a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) { a.vx = -a.vx; a.x = Math.max(0, Math.min(W, a.x)); }
        if (a.y < 0 || a.y > H) { a.vy = -a.vy; a.y = Math.max(0, Math.min(H, a.y)); }
        if (adj[i]) adj[i].length = 0; else adj[i] = [];
      }
      for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) {
        a = nodes[i]; b = nodes[j]; dx = a.x - b.x; dy = a.y - b.y; d = dx * dx + dy * dy;
        if (d > LINK * LINK) continue;
        adj[i].push(j); adj[j].push(i);
        ctx.globalAlpha = (1 - Math.sqrt(d) / LINK) * .35;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      for (i = 0; i < n; i++) {
        a = nodes[i]; dx = a.x - mx; dy = a.y - my; d = Math.sqrt(dx * dx + dy * dy);
        if (d < NEAR) { ctx.globalAlpha = (1 - d / NEAR) * .6; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke(); }
        dot(a.x, a.y, a.r, d < NEAR ? 1 : .7);
      }
      if (pulses.length < n / 5 && Math.random() < .08) {
        i = Math.floor(Math.random() * n);
        if (adj[i].length) pulses.push({ a: i, b: adj[i][Math.floor(Math.random() * adj[i].length)], t: 0, hops: 2 + Math.floor(Math.random() * 4) });
      }
      for (i = pulses.length - 1; i >= 0; i--) {
        p = pulses[i]; p.t += .018;
        if (p.t >= 1) {
          next = adj[p.b];
          if (--p.hops <= 0 || next.length < 2) { pulses.splice(i, 1); continue; }
          do { j = next[Math.floor(Math.random() * next.length)]; } while (j === p.a);
          p.a = p.b; p.b = j; p.t = 0;
        }
        a = nodes[p.a]; b = nodes[p.b]; dx = a.x + (b.x - a.x) * p.t; dy = a.y + (b.y - a.y) * p.t;
        dot(dx, dy, 5, .22); dot(dx, dy, 2.2, .95);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    tint(); size();
    document.addEventListener('themechange', tint);
    addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.documentElement.addEventListener('mouseleave', function () { mx = my = -1e4; });
    document.addEventListener('visibilitychange', function () { running = !document.hidden; cancelAnimationFrame(raf); if (running) frame(); });
    addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(size, 150); });
    frame(); canvas.classList.add('ready');
  }

  // ---------- case study page ----------
  function renderCase(d) {
    var id = params().get('id') || '', root = clear($('case'));
    var p = (d.projects || []).filter(function (x) { return x.id === id; })[0] || null;
    root.appendChild(el('a', { class: 'back', href: 'index.html#projects', text: '← ' + t('case.back') }));
    if (!p || !p.case_study || !p.case_study.enabled) { root.appendChild(el('h1', { text: t('case.not_found') })); document.title = t('case.not_found'); return; }
    document.title = p.title + ' — ' + d.meta.name;
    var cs = p.case_study;
    root.appendChild(el('p', { class: 'status', text: [p.org, p.period && range(p.period.start, p.period.end)].filter(Boolean).join(' · ') }));
    root.appendChild(el('h1', { text: p.title }));
    root.appendChild(el('p', { class: 'lead', text: p.description }));
    if (p.metrics && p.metrics.length) { var ml = el('ul', { class: 'metrics' }); p.metrics.forEach(function (m) { ml.appendChild(el('li', null, [el('b', { text: m.value }), m.label])); }); root.appendChild(ml); }
    (cs.visuals || []).forEach(function (v) {
      var src = caseImg(v && v.src); if (!src) return;
      root.appendChild(el('figure', { class: 'case-figure' }, [el('img', { src: src, alt: v.alt || '', decoding: 'async' }),
        (v.caption || v.credit) ? el('figcaption', null, [v.caption || '', v.credit ? el('small', null, [extLink(v.credit_url, v.credit)]) : null]) : null]));
    });
    var csc = scene(p), cdg = flowDiagram(p.diagram, 5, 760);
    if (csc) root.appendChild(csc);
    if (cdg) root.appendChild(cdg);
    var dl = el('dl');
    [['case.problem', cs.problem], ['case.role', cs.role], ['case.architecture', cs.architecture], ['case.data_scale', cs.data_scale], ['case.results', cs.results || p.outcome], ['case.lessons', cs.lessons]]
      .forEach(function (x) { if (x[1]) dl.appendChild(el('div', null, [el('dt', { text: t(x[0]) }), el('dd', { text: x[1] })])); });
    dl.appendChild(el('div', null, [el('dt', { text: t('case.stack') }), el('dd', null, [chipList(p.tech || [])])]));
    root.appendChild(dl);
    if (p.links && p.links.paper) root.appendChild(el('p', null, [extLink(p.links.paper, t('projects.paper') + ' ↗')]));
  }

  // ---------- boot ----------
  function renderAll() {
    var d = state.data;
    applyStatic();
    if (document.body.getAttribute('data-page') === 'case') { renderCase(d); return; }
    var ce = $('cf-error'); if (ce) ce.textContent = '';
    renderHero(d); renderAbout(d); renderDomainFilter(d); renderProjects(d); renderSkills(d);
    renderExperience(d); renderCapabilities(d); renderResearch(d); renderCreds(d); renderContact(d);
    initTyped(d); observeReveal(document); scrollFx();
  }
  function fail() {
    var m = $('main') || $('case');
    if (m) { clear(m); m.appendChild(el('p', { class: 'container', role: 'alert', text: state.uiEn['error.load'] || 'Content failed to load. Please refresh the page.' })); }
  }
  document.addEventListener('DOMContentLoaded', function () {
    var y = $('year'); if (y) y.textContent = String(new Date().getFullYear());
    initTheme(); initNav(); initContactForm(); initSkillsView(); initScrollFx(); initSpotlight();
    Promise.all([load('data.json'), load('i18n/en.json')]).then(function (r) {
      state.base = r[0]; state.data = r[0]; state.uiEn = r[1].ui || {}; state.ui = state.uiEn;
      return loadLang(pickLang());
    }).then(function () {
      renderAll();
      initLangSwitch(renderAll);
      if (document.body.getAttribute('data-page') !== 'case') lazyBackground();
    }).catch(function (e) { if (window.console) console.error(e); fail(); });
  });
})();
