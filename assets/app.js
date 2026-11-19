/* KLAVA — логіка конструктора й генератор клавіатури.
   Один стан (state) і один генератор (renderKeyboard) для hero, конструктора й готових збірок. */
(() => {
  'use strict';

  /* ---------- Дані ---------- */
  const SIZES = {
    '60': { id: '60', name: '60%', price: 3400, note: 'Компактна, без стрілок' },
    '65': { id: '65', name: '65%', price: 3900, note: 'Зі стрілками й колонкою Del / PgUp / PgDn' },
    '75': { id: '75', name: '75%', price: 4600, note: 'Плюс ряд F1–F12' }
  };

  // peak — точка піку на графіку (координати viewBox 0 0 120 64) і сила в грамах
  const SWITCHES = {
    linear:  { id: 'linear',  name: 'Лінійні',   add: 0,   desc: 'Плавні й тихі',     dot: '#E5484D',
               path: 'M12 54 C 40 46, 78 32, 112 14', peak: { x: 112, y: 14, g: 45, align: 'end' } },
    tactile: { id: 'tactile', name: 'Тактильні', add: 300, desc: 'Відчутний поштовх', dot: '#A0703C',
               path: 'M12 54 C 22 44, 30 27, 41 25 C 48 25, 53 37, 63 38 C 80 37, 97 32, 112 29',
               peak: { x: 41, y: 25, g: 55, align: 'center' } },
    clicky:  { id: 'clicky',  name: 'Клікові',   add: 300, desc: 'Гучний клік',       dot: '#3E8BFF',
               path: 'M12 54 L 39 22 L 45 41 C 68 39, 92 33, 112 29',
               peak: { x: 39, y: 22, g: 60, align: 'center' } }
  };

  const CAPS = {
    // sub — колір кириличних підписів; контраст з фоном літерних клавіш ≥ 4.5:1
    graphite: { id: 'graphite', name: 'Графіт',  add: 0,   desc: 'Темні',   alpha: '#2C2C32', mod: '#212126', fg: '#D6D6DC', sub: '#A9A9B3' },
    chalk:    { id: 'chalk',    name: 'Крейда',  add: 500, desc: 'Світлі',  alpha: '#E9E6DF', mod: '#CDC9BF', fg: '#26262A', sub: '#57534B' },
    lavender: { id: 'lavender', name: 'Лаванда', add: 700, desc: 'Бузкові', alpha: '#CBBEEC', mod: '#A795D6', fg: '#271F40', sub: '#45386F' }
  };

  const ACCENT = { bg: '#FF6B2C', fg: '#140A04', sub: 'rgba(20,10,4,.55)' };

  const BUILDS = {
    night:    { name: 'Нічна зміна',  size: '65', sw: 'linear',  cap: 'graphite' },
    white:    { name: 'Біла кімната', size: '75', sw: 'tactile', cap: 'chalk' },
    lavender: { name: 'Лаванда',      size: '60', sw: 'clicky',  cap: 'lavender' }
  };

  const priceOf = (c) => SIZES[c.size].price + SWITCHES[c.sw].add + CAPS[c.cap].add;

  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₴';
  const fmtAdd = (n) => '+' + fmt(n);

  const plural = (n, one, few, many) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  };

  /* ---------- Розкладки (ширини в стандартних одиницях u) ---------- */
  // t: a — літерна, m — модифікатор, x — акцентна, g — проміжок
  const A = (l, s = '', w = 1, code) => ({ l, s, w, t: 'a', code });
  const M = (l, w = 1, code) => ({ l, w, t: 'm', code });
  const X = (l, w = 1, code) => ({ l, w, t: 'x', code });
  const G = (w) => ({ l: '', w, t: 'g' });

  const letters = (pairs) => pairs.map(([l, s]) => A(l, s, 1, /^[A-Z]$/.test(l) ? 'Key' + l : undefined));

  const numRow = () => [
    ...'1234567890'.split('').map((d) => A(d, '', 1, 'Digit' + d)),
    A('-', '', 1, 'Minus'), A('=', '', 1, 'Equal')
  ];
  const qRow = () => [
    ...letters([['Q','Й'],['W','Ц'],['E','У'],['R','К'],['T','Е'],['Y','Н'],['U','Г'],['I','Ш'],['O','Щ'],['P','З']]),
    A('[', 'Х', 1, 'BracketLeft'), A(']', 'Ї', 1, 'BracketRight')
  ];
  const aRow = () => [
    ...letters([['A','Ф'],['S','І'],['D','В'],['F','А'],['G','П'],['H','Р'],['J','О'],['K','Л'],['L','Д']]),
    A(';', 'Ж', 1, 'Semicolon'), A("'", 'Є', 1, 'Quote')
  ];
  const zRow = () => [
    ...letters([['Z','Я'],['X','Ч'],['C','С'],['V','М'],['B','И'],['N','Т'],['M','Ь']]),
    A(',', 'Б', 1, 'Comma'), A('.', 'Ю', 1, 'Period'), A('/', '.', 1, 'Slash')
  ];

  function layout(size) {
    if (size === '60') {
      return [
        [X('Esc', 1, 'Escape'), ...numRow(), M('Bksp', 2, 'Backspace')],
        [M('Tab', 1.5, 'Tab'), ...qRow(), A('\\', 'Ґ', 1.5, 'Backslash')],
        [M('Caps', 1.75, 'CapsLock'), ...aRow(), X('Enter', 2.25, 'Enter')],
        [M('Shift', 2.25, 'ShiftLeft'), ...zRow(), M('Shift', 2.75, 'ShiftRight')],
        [M('Ctrl', 1.25, 'ControlLeft'), M('Win', 1.25, 'MetaLeft'), M('Alt', 1.25, 'AltLeft'),
         A('', '', 6.25, 'Space'),
         M('Alt', 1.25, 'AltRight'), M('Fn', 1.25), M('Menu', 1.25, 'ContextMenu'), M('Ctrl', 1.25, 'ControlRight')]
      ];
    }
    const lower = [
      [M('Tab', 1.5, 'Tab'), ...qRow(), A('\\', 'Ґ', 1.5, 'Backslash'), M('PgUp', 1, 'PageUp')],
      [M('Caps', 1.75, 'CapsLock'), ...aRow(), X('Enter', 2.25, 'Enter'), M('PgDn', 1, 'PageDown')],
      [M('Shift', 2.25, 'ShiftLeft'), ...zRow(), M('Shift', 1.75, 'ShiftRight'), X('↑', 1, 'ArrowUp'), M('End', 1, 'End')],
      [M('Ctrl', 1.25, 'ControlLeft'), M('Win', 1.25, 'MetaLeft'), M('Alt', 1.25, 'AltLeft'),
       A('', '', 6.25, 'Space'),
       M('Alt', 1, 'AltRight'), M('Fn', 1), M('Ctrl', 1, 'ControlRight'),
       M('←', 1, 'ArrowLeft'), M('↓', 1, 'ArrowDown'), M('→', 1, 'ArrowRight')]
    ];
    if (size === '65') {
      return [[X('Esc', 1, 'Escape'), ...numRow(), M('Bksp', 2, 'Backspace'), M('Del', 1, 'Delete')], ...lower];
    }
    // 75%
    const f = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => M('F' + (from + i), 1, 'F' + (from + i)));
    return [
      [X('Esc', 1, 'Escape'), G(0.5), ...f(1, 4), G(0.5), ...f(5, 8), G(0.5), ...f(9, 12), G(0.5), M('Del', 1, 'Delete')],
      [A('`', 'ʼ', 1, 'Backquote'), ...numRow(), M('Bksp', 2, 'Backspace'), M('Home', 1, 'Home')],
      ...lower
    ];
  }

  const LAYOUTS = {};
  Object.keys(SIZES).forEach((id) => {
    const rows = layout(id);
    const widths = rows.map((r) => r.reduce((s, k) => s + k.w, 0));
    const total = widths[0];
    // Перевірка: правий край кожного ряду має бути рівним
    widths.forEach((w, i) => {
      if (Math.abs(w - total) > 0.001) console.warn(`KLAVA: ряд ${i + 1} розкладки ${id}% має ${w}u замість ${total}u`);
    });
    const count = rows.reduce((s, r) => s + r.filter((k) => k.t !== 'g').length, 0);
    LAYOUTS[id] = { rows, total, count };
  });

  /* ---------- Генератор клавіатури ---------- */
  // Підписи модифікаторів задані заздалегідь. Для 1u-клавіш, де 4 літери
  // фізично не вміщаються на телефоні, є коротший варіант (коли клавіатура вужча за 440px).
  const NARROW = { PgUp: 'PgU', PgDn: 'PgD', Home: 'Hom', Ctrl: 'Ctl', Menu: 'Mnu' };

  function renderKeyboard(host, cfg, opts = {}) {
    const { rows, total } = LAYOUTS[cfg.size];
    const cap = CAPS[cfg.cap];

    host.textContent = '';
    const kb = document.createElement('div');
    kb.className = 'kb' + (opts.mini ? ' kb-mini' : '');
    kb.setAttribute('role', 'img');
    kb.setAttribute('aria-label', `Клавіатура ${SIZES[cfg.size].name}, світчі ${SWITCHES[cfg.sw].name.toLowerCase()}, кейкапи ${cap.name}`);

    const shell = document.createElement('div');
    shell.className = 'kb-case';
    const board = document.createElement('div');
    board.className = 'kb-board';
    board.style.aspectRatio = `${total} / ${rows.length}`;

    rows.forEach((row) => {
      const r = document.createElement('div');
      r.className = 'kb-row';
      row.forEach((k) => {
        const slot = document.createElement('div');
        slot.className = 'kb-slot';
        slot.style.width = (k.w / total * 100) + '%';

        const key = document.createElement('span');
        key.className = 'kc' + (k.t === 'g' ? ' gap' : '') + (k.t === 'm' || k.t === 'x' ? ' mod' : '');
        const c = k.t === 'x' ? ACCENT
          : k.t === 'm' ? { bg: cap.mod, fg: cap.fg, sub: cap.sub }
          : { bg: cap.alpha, fg: cap.fg, sub: cap.sub };
        key.style.setProperty('--k-bg', c.bg);
        key.style.setProperty('--k-fg', c.fg);
        key.style.setProperty('--k-sub', c.sub);
        if (k.code) key.dataset.code = k.code;

        if (k.l) {
          const l = document.createElement('span');
          l.className = 'kc-l';
          l.textContent = k.l;
          key.appendChild(l);
          const narrow = (k.w <= 1 || (k.w <= 1.25 && (k.l === 'Ctrl' || k.l === 'Menu'))) && NARROW[k.l];
          if (narrow) {
            l.classList.add('has-narrow');
            const n = document.createElement('span');
            n.className = 'kc-l narrow';
            n.textContent = narrow;
            n.setAttribute('aria-hidden', 'true');
            key.appendChild(n);
          }
        }
        if (k.s) {
          const s = document.createElement('span');
          s.className = 'kc-s';
          s.textContent = k.s;
          key.appendChild(s);
        }
        slot.appendChild(key);
        r.appendChild(slot);
      });
      board.appendChild(r);
    });

    shell.appendChild(board);
    kb.appendChild(shell);
    host.appendChild(kb);
    return kb;
  }

  /* ---------- Мініграфік сили натискання ---------- */
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function renderGraph(host, swId) {
    const sw = SWITCHES[swId];
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 120 64');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `Графік сили натискання: ${sw.name.toLowerCase()} світчі, пік ${sw.peak.g} г`);
    const axis = document.createElementNS(SVG_NS, 'path');
    axis.setAttribute('d', 'M10 6 V56 H114');
    axis.setAttribute('class', 'graph-axis');
    axis.setAttribute('vector-effect', 'non-scaling-stroke');
    const line = document.createElementNS(SVG_NS, 'path');
    line.setAttribute('d', sw.path);
    line.setAttribute('class', 'graph-line');
    line.setAttribute('stroke', sw.dot);
    line.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.append(axis, line);
    host.textContent = '';
    host.classList.add('graph');
    host.appendChild(svg);
    if (host.dataset.graphSize !== 'big') svg.setAttribute('class', 'opt-graph');

    // Позначка піку — HTML поверх SVG, щоб текст не розтягувався разом із графіком
    const { x, y, g, align } = sw.peak;
    const dot = document.createElement('span');
    dot.className = 'graph-dot';
    dot.style.left = (x / 120 * 100) + '%';
    dot.style.top = (y / 64 * 100) + '%';
    dot.style.background = sw.dot;
    const lbl = document.createElement('span');
    lbl.className = 'graph-peak' + (align === 'end' ? ' end' : '');
    lbl.style.left = (x / 120 * 100) + '%';
    lbl.style.top = (y / 64 * 100) + '%';
    lbl.textContent = g + '\u00A0г';
    dot.setAttribute('aria-hidden', 'true');
    lbl.setAttribute('aria-hidden', 'true');
    host.append(dot, lbl);
  }

  /* ---------- Стан ---------- */
  const state = { size: '65', sw: 'tactile', cap: 'graphite', cart: 0 };
  let shownPrice = priceOf(state);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Опції конструктора ---------- */
  function optButton(group, id, onPick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'opt';
    b.dataset.group = group;
    b.dataset.id = id;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', onPick);
    return b;
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function buildOptions() {
    const sizeBox = $('#opts-size');
    Object.values(SIZES).forEach((s) => {
      const b = optButton('size', s.id, () => setConfig({ size: s.id }));
      const top = el('span', 'opt-top');
      top.append(el('span', 'opt-name', s.name), el('span', 'radio'));
      const kbHost = el('span', 'opt-kb');
      kbHost.dataset.optKb = s.id;
      const n = LAYOUTS[s.id].count;
      b.append(top, kbHost, el('span', 'opt-desc', s.note),
        el('span', 'opt-meta', `${n} ${plural(n, 'клавіша', 'клавіші', 'клавіш')}`),
        el('span', 'opt-price', fmt(s.price)));
      b.setAttribute('aria-label', `${s.name}: ${s.note}, ${fmt(s.price)}`);
      sizeBox.appendChild(b);
    });

    const swBox = $('#opts-switch');
    Object.values(SWITCHES).forEach((s) => {
      const b = optButton('sw', s.id, () => setConfig({ sw: s.id }));
      const top = el('span', 'opt-top');
      const dot = el('span', 'sw-dot');
      dot.style.background = s.dot;
      top.append(dot, el('span', 'opt-name', s.name), el('span', 'radio'));
      const g = el('span');
      g.style.display = 'block';
      renderGraph(g, s.id);
      g.firstChild.setAttribute('aria-hidden', 'true');
      g.firstChild.removeAttribute('role');
      b.append(top, el('span', 'opt-desc', s.desc), g, el('span', 'opt-price', fmtAdd(s.add)));
      b.setAttribute('aria-label', `${s.name}: ${s.desc.toLowerCase()}, ${fmtAdd(s.add)}`);
      swBox.appendChild(b);
    });

    const capBox = $('#opts-cap');
    Object.values(CAPS).forEach((c) => {
      const b = optButton('cap', c.id, () => setConfig({ cap: c.id }));
      const top = el('span', 'opt-top');
      top.append(el('span', 'opt-name', c.name), el('span', 'radio'));
      const sw = el('span', 'swatch');
      [c.alpha, c.mod, ACCENT.bg].forEach((col) => { const s = el('span'); s.style.background = col; sw.appendChild(s); });
      sw.setAttribute('aria-hidden', 'true');
      b.append(top, sw, el('span', 'opt-desc', c.desc), el('span', 'opt-price', fmtAdd(c.add)));
      b.setAttribute('aria-label', `${c.name}: ${c.desc.toLowerCase()}, ${fmtAdd(c.add)}`);
      capBox.appendChild(b);
    });
  }

  /* ---------- Рендер ---------- */
  function render() {
    const size = SIZES[state.size], sw = SWITCHES[state.sw], cap = CAPS[state.cap];

    // клавіатури, що показують поточну збірку
    $$('[data-kb="current"]').forEach((h) => renderKeyboard(h, state));
    $$('[data-kb="current-mini"]').forEach((h) => renderKeyboard(h, state, { mini: true }));
    // мініатюри розмірів — у кольорі обраних кейкапів
    $$('[data-opt-kb]').forEach((h) => renderKeyboard(h, { size: h.dataset.optKb, sw: state.sw, cap: state.cap }, { mini: true }));

    // активні опції
    $$('.opt').forEach((b) => {
      const on = (b.dataset.group === 'size' && b.dataset.id === state.size)
        || (b.dataset.group === 'sw' && b.dataset.id === state.sw)
        || (b.dataset.group === 'cap' && b.dataset.id === state.cap);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    // тексти
    const n = LAYOUTS[state.size].count;
    const binds = {
      'size-name': size.name,
      'switch-name': sw.name,
      'cap-name': cap.name,
      'size-price': fmt(size.price),
      'switch-price': fmtAdd(sw.add),
      'cap-price': fmtAdd(cap.add),
      'key-count': `${n} ${plural(n, 'клавіша', 'клавіші', 'клавіш')}`
    };
    Object.entries(binds).forEach(([k, v]) => $$(`[data-bind="${k}"]`).forEach((e) => { e.textContent = v; }));

    animatePrice(priceOf(state));
  }

  /* ---------- Анімація ціни ---------- */
  let raf = 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animatePrice(target) {
    const targets = $$('[data-bind="price"]');
    cancelAnimationFrame(raf);
    if (reduceMotion || shownPrice === target) {
      shownPrice = target;
      targets.forEach((e) => { e.textContent = fmt(target); });
      return;
    }
    const from = shownPrice, t0 = performance.now(), dur = 500;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      shownPrice = from + (target - from) * e;
      const v = Math.round(shownPrice / 10) * 10;
      targets.forEach((el) => { el.textContent = fmt(p < 1 ? v : target); });
      if (p < 1) raf = requestAnimationFrame(step);
      else shownPrice = target;
    };
    raf = requestAnimationFrame(step);
  }

  function setConfig(patch) {
    Object.assign(state, patch);
    render();
  }

  const scrollToBuilder = () => {
    $('#build').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  /* ---------- Кошик ---------- */
  let addedTimer = 0;
  function addToCart() {
    state.cart += 1;
    const badge = $('#cart-count');
    badge.textContent = state.cart;
    badge.hidden = state.cart === 0;
    badge.classList.remove('bump');
    void badge.offsetWidth; // перезапуск анімації
    badge.classList.add('bump');
    $('#cart-btn').setAttribute('aria-label', `Кошик: ${state.cart} ${plural(state.cart, 'товар', 'товари', 'товарів')}`);

    const btn = $('#add-btn');
    btn.classList.add('is-added');
    btn.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-check"/></svg><span>Додано</span>';
    clearTimeout(addedTimer);
    addedTimer = setTimeout(() => {
      btn.classList.remove('is-added');
      btn.innerHTML = '<span>Додати в кошик</span>';
    }, 2000);
  }

  /* ---------- Натискання клавіш ---------- */
  function pressVisual(key) {
    key.classList.add('is-down');
    setTimeout(() => key.classList.remove('is-down'), 120);
  }

  function bindPhysicalKeys() {
    // Справжня клавіатура підсвічує відповідну клавішу в hero
    document.addEventListener('keydown', (e) => {
      if (e.repeat || e.target.closest('input, textarea, [contenteditable]')) return;
      const key = $(`#hero-kb .kc[data-code="${CSS.escape(e.code)}"]`);
      if (key) pressVisual(key);
    });
  }

  /* ---------- Плашка підсумку: лише в зоні конструктора ---------- */
  function bindSummaryVisibility() {
    const sum = $('.sum');
    const zone = $('.steps');
    if (!sum || !zone) return;
    if (!('IntersectionObserver' in window)) { sum.classList.add('is-visible'); return; }
    // Плашка з'являється, коли кроки конструктора займають верхні 60% екрана,
    // і ховається, щойно вони вийшли — тож у hero та нижчих секціях її немає.
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => sum.classList.toggle('is-visible', en.isIntersecting));
    }, { rootMargin: '0px 0px -40% 0px', threshold: 0 });
    io.observe(zone);
  }

  /* ---------- Бургер-меню ---------- */
  function bindBurger() {
    const btn = $('#burger');
    const nav = $('#main-nav');
    if (!btn || !nav) return;
    const set = (open) => {
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
      btn.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
    };
    btn.addEventListener('click', () => set(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { set(false); btn.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('is-open') && !e.target.closest('.hdr')) set(false);
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', (m) => { if (m.matches) set(false); });
  }

  /* ---------- Старт ---------- */
  function init() {
    buildOptions();

    // мініатюри готових збірок (той самий генератор)
    $$('[data-kb="build"]').forEach((h) => {
      renderKeyboard(h, { size: h.dataset.size, sw: h.dataset.switch, cap: h.dataset.cap }, { mini: true });
    });
    Object.entries(BUILDS).forEach(([id, b]) => {
      const p = $(`[data-build-price="${id}"]`);
      if (p) p.textContent = fmt(priceOf(b));
      const s = $(`[data-build-spec="${id}"]`);
      if (s) s.textContent = `${SIZES[b.size].name} · ${SWITCHES[b.sw].name} · ${CAPS[b.cap].name}`;
    });

    $$('[data-pick-build]').forEach((btn) => btn.addEventListener('click', () => {
      const b = BUILDS[btn.dataset.pickBuild];
      setConfig({ size: b.size, sw: b.sw, cap: b.cap });
      scrollToBuilder();
    }));

    $$('[data-pick-switch]').forEach((btn) => btn.addEventListener('click', () => {
      setConfig({ sw: btn.dataset.pickSwitch });
      scrollToBuilder();
    }));

    $$('[data-graph]').forEach((h) => renderGraph(h, h.dataset.graph));

    $('#add-btn').addEventListener('click', addToCart);

    bindPhysicalKeys();
    bindSummaryVisibility();
    bindBurger();
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
