/* ==========================================================
   CA L'ENRIC — interacciones
   Intro de la brasa, ast que dora con el scroll, «monta tu
   plato combinado» con comanda impresa, carta con filtros,
   baraja de fotos, stories del Instagram e historia.
   ========================================================== */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const eur = (n) => n.toFixed(2).replace('.', ',') + ' €';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const motion = hasGSAP && !reduced;
if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const watchdog = (tl, ms) => { setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, ms); return tl; };
const rng = (seed) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

/* ----------------------------------------------------------
   DATOS · carta de platos combinados (en sala, IVA incl.)
   ---------------------------------------------------------- */
const CATS = [
  ['all', 'Todo'], ['ast', "Del ast"], ['brasa', 'A la brasa'], ['carnes', 'Ternera y cerdo'],
  ['escalopa', 'Escalopas'], ['huevos', 'Huevos y tortillas'], ['otros', 'Pasta y más']
];
const DISHES = [
  { n: 1, cat: 'ast', t: "½ pollo a l'ast", f: "½ pollo a l'ast con patatas y guarnición", p: 14.00, m: 'pollo2', pat: 1, g: 1 },
  { n: 2, cat: 'ast', t: "¼ pollo a l'ast", f: "¼ pollo a l'ast con patatas y guarnición", p: 10.30, m: 'pollo1', pat: 1, g: 1 },
  { n: 3, cat: 'brasa', t: 'Parrillada de carne', f: 'Parrillada de carne con guarnición', p: 26.00, m: 'parrillada', g: 1 },
  { n: 4, cat: 'brasa', t: 'Cordero a la brasa', f: 'Cordero a la brasa con patatas y guarnición', p: 19.80, m: 'chuletas', pat: 1, g: 1 },
  { n: 5, cat: 'brasa', t: 'Butifarra a la brasa', f: 'Butifarra a la brasa con judías blancas', p: 12.80, m: 'butifarra', side: 'judias' },
  { n: 6, cat: 'brasa', t: 'Entrecot a la brasa', f: 'Entrecot a la brasa con patatas y guarnición', p: 22.00, m: 'entrecot', pat: 1, g: 1 },
  { n: 7, cat: 'carnes', t: 'Bistec de ternera', f: 'Bistec de ternera con patatas y guarnición', p: 13.80, m: 'bistec', pat: 1, g: 1 },
  { n: 8, cat: 'carnes', t: 'Bistec con espaguetis', f: 'Bistec de ternera con patatas y espaguetis', p: 17.30, m: 'bistec', pat: 1, side: 'espaguetis' },
  { n: 9, cat: 'carnes', t: 'Hamburguesa de ternera', f: 'Hamburguesa de ternera con patatas y ensalada', p: 12.50, m: 'hamburguesa', pat: 1, side: 'ensalada' },
  { n: 10, cat: 'carnes', t: 'Lomo de cerdo', f: 'Lomo de cerdo con patatas y guarnición', p: 12.80, m: 'lomo', pat: 1, g: 1 },
  { n: 11, cat: 'carnes', t: 'Lomo con huevo', f: 'Lomo de cerdo con patatas, guarnición y 1 huevo', p: 14.80, m: 'lomohuevo', pat: 1, g: 1 },
  { n: 12, cat: 'carnes', t: 'Chuletas de cerdo', f: 'Chuletas de cerdo con patatas y guarnición', p: 12.80, m: 'chuletas', pat: 1, g: 1 },
  { n: 13, cat: 'escalopa', t: 'Escalopa de cerdo', f: 'Escalopa de cerdo con patatas y guarnición', p: 15.80, m: 'escalopa2', pat: 1, g: 1 },
  { n: 14, cat: 'escalopa', t: '½ escalopa de cerdo', f: '½ escalopa de cerdo con patatas y guarnición', p: 13.50, m: 'escalopa1', pat: 1, g: 1 },
  { n: 15, cat: 'escalopa', t: '½ escalopa, patatas y espaguetis', f: '½ escalopa de cerdo con patatas y espaguetis', p: 17.00, m: 'escalopa1', pat: 1, side: 'espaguetis' },
  { n: 16, cat: 'escalopa', t: '½ escalopa con espaguetis', f: '½ escalopa de cerdo con espaguetis', p: 15.00, m: 'escalopa1', side: 'espaguetis' },
  { n: 17, cat: 'escalopa', t: 'Escalopa de ternera', f: 'Escalopa de ternera con patatas y guarnición', p: 16.00, m: 'escalopa2', pat: 1, g: 1 },
  { n: 18, cat: 'ast', t: "Pierna de cerdo a l'ast", f: "Pierna de cerdo a l'ast con patatas y guarnición", note: 'con salsa española', p: 14.50, m: 'pierna', pat: 1, g: 1 },
  { n: 19, cat: 'carnes', t: 'Hígado de ternera', f: 'Hígado de ternera con patatas y guarnición', note: 'con cebolla y beicon', p: 13.50, m: 'higado', pat: 1, g: 1 },
  { n: 20, cat: 'huevos', t: 'Tortilla francesa', f: 'Tortilla francesa con patatas y guarnición', p: 8.80, m: 'francesa', pat: 1, g: 1 },
  { n: 21, cat: 'huevos', t: 'Tortilla de gambas', f: 'Tortilla de gambas con patatas y ensalada', p: 12.30, m: 'gambas', pat: 1, side: 'ensalada' },
  { n: 22, cat: 'huevos', t: 'Tortilla española', f: 'Tortilla española con ensalada', p: 13.30, m: 'espanola', side: 'ensalada' },
  { n: 23, cat: 'huevos', t: 'Huevos con beicon', f: 'Huevos con beicon', p: 8.50, m: 'huevosbeicon' },
  { n: 24, cat: 'huevos', t: 'Huevos con patatas', f: 'Huevos con patatas', p: 8.50, m: 'huevos', pat: 1 },
  { n: 25, cat: 'huevos', t: 'Huevos, patatas y beicon', f: 'Huevos con patatas y beicon', p: 11.00, m: 'huevosbeicon', pat: 1 },
  { n: 26, cat: 'carnes', t: 'Pincho de pollo', f: 'Pincho de pollo con patatas y guarnición', p: 10.80, m: 'pincho', pat: 1, g: 1 },
  { n: 27, cat: 'otros', t: 'Espaguetis a la boloñesa', f: 'Espaguetis a la boloñesa', p: 13.50, m: 'espaguetis2' },
  { n: 28, cat: 'otros', t: '½ espaguetis a la boloñesa', f: '½ espaguetis a la boloñesa', p: 10.00, m: 'espaguetis1' },
  { n: 29, cat: 'otros', t: 'Calamares a la romana', f: 'Calamares a la romana con guarnición', p: 17.50, m: 'calamares2', g: 1 },
  { n: 30, cat: 'otros', t: '½ calamares a la romana', f: '½ calamares a la romana con guarnición', p: 14.00, m: 'calamares1', g: 1 },
  { n: 31, cat: 'otros', t: 'Croquetas de pollo y ensalada', f: 'Croquetas de pollo con ensalada', p: 12.00, m: 'croquetas', side: 'ensalada' },
  { n: 32, cat: 'otros', t: 'Croquetas de pollo y patatas', f: 'Croquetas de pollo con patatas', p: 12.00, m: 'croquetas', pat: 1 }
];
const GARN = [
  { id: 'pimiento', t: 'Pimiento frito y tomate', p: 0 }, { id: 'calabacin', t: 'Calabacín rebozado', p: 0 },
  { id: 'escalivada', t: 'Escalivada', p: 0 }, { id: 'ensalada', t: 'Ensalada', p: 0 },
  { id: 'ensaladilla', t: 'Ensaladilla rusa', p: 2 }, { id: 'judias', t: 'Judías blancas', p: 2 }
];
const SIDE_NAME = { judias: 'judías blancas', espaguetis: 'espaguetis', ensalada: 'ensalada' };

const PHOTOS = [
  ['pollo.jpg', "¼ de pollo a l'ast", 'Google'], ['escalopas.jpg', 'Escalopa con patatas', 'Google'],
  ['escalopa-calabacin.jpg', 'Con calabacín rebozado', 'Google'], ['calamares.jpg', 'Calamares a la romana', 'Google'],
  ['brasa.jpg', 'A la brasa', 'Google'], ['ast.jpg', "Pollos en el ast", 'Instagram'],
  ['escalopa-pimiento.jpg', 'Con pimiento frito y tomate', 'Google'], ['bistec.jpg', 'Bistec con patatas', 'Google'],
  ['escalopa-xl.jpg', 'Raciones de las de antes', 'Google'], ['escalopa-ensalada.jpg', 'Escalopa y ensalada', 'Google'],
  ['flan.jpg', 'Flan de postre', 'Google'], ['mantel.jpg', 'El mantel de la casa', 'Google'],
  ['barra.jpg', 'La barra y el comedor', 'Google'], ['barra-equipo.jpg', 'Detrás de la barra', 'Google'],
  ['terraza.jpg', 'La terraza', 'Google']
];

const STORIES = [
  { v: 'story-horari', t: 'Horari', d: '12.30–16.00 i 19.30–23.00 · dimecres nit i dijous tancat' },
  { v: 'story-obrim-25', t: 'Comencem temporada!', d: 'Obrim el dimarts 25 de març' },
  { v: 'fachada', p: 'poster-fachada', t: 'La casa', d: "Snack Bar Ca L'Enric, Av. Frederic Mistral" },
  { v: 'story-vacances', t: 'Estem de vacances', d: "40è aniversari · fins la propera temporada" },
  { v: 'cf-lloret', p: 'poster-cf-lloret', t: 'Amb el CF Lloret', d: 'El nostre nom, a la samarreta' },
  { v: 'story-obrim-24', t: 'Comencem temporada!!!', d: 'Obrim dimarts 24 de març' },
  { v: 'story-acabada', t: 'Temporada acabada', d: "Gràcies a tothom! Ens veiem l'any vinent" }
];

/* ----------------------------------------------------------
   SCROLL SUAVE + NAVEGACIÓN
   ---------------------------------------------------------- */
let lenis = null;
if (motion && window.Lenis) {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const lock = (on) => { document.body.classList.toggle('is-locked', on); if (lenis) on ? lenis.stop() : lenis.start(); };

const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');
const onScroll = () => nav.classList.toggle('is-solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', open); links.classList.toggle('is-open', open);
});
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'); const t = id.length > 1 ? $(id) : document.body;
  if (!t) return;
  e.preventDefault();
  burger.setAttribute('aria-expanded', 'false'); links.classList.remove('is-open');
  if (lenis) lenis.scrollTo(id === '#top' ? 0 : t, { offset: -60, duration: 1.4 });
  else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}));

/* ----------------------------------------------------------
   ¿OBERT? (hora de Lloret)
   ---------------------------------------------------------- */
const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const TWO = [[750, 960], [1170, 1380]];
const OPEN = { 0: TWO, 1: TWO, 2: TWO, 3: [[750, 960]], 4: [], 5: TWO, 6: TWO };
const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const madridNow = () => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), m: +p.hour * 60 + +p.minute };
};
const liveStatus = () => {
  const { d, m } = madridNow();
  const slot = OPEN[d].find(([a, b]) => m >= a && m < b);
  if (slot) return { open: true, txt: `Obert · cerramos a las ${hhmm(slot[1])}` };
  const later = OPEN[d].find(([a]) => a > m);
  if (later) return { open: false, txt: `Tancat · abrimos a las ${hhmm(later[0])}` };
  for (let i = 1; i <= 7; i++) {
    const nd = (d + i) % 7;
    if (OPEN[nd].length) return { open: false, txt: `Tancat · abrimos ${i === 1 ? 'mañana' : 'el ' + DAYS[nd]} a las ${hhmm(OPEN[nd][0][0])}` };
  }
  return { open: false, txt: 'Tancat' };
};
const paintLive = () => {
  const s = liveStatus();
  $$('[data-live]').forEach((el) => {
    el.classList.toggle('is-open', s.open); el.classList.toggle('is-closed', !s.open);
    $('[data-live-text]', el).textContent = s.txt;
  });
  const { d } = madridNow();
  $$('#hours li').forEach((li) => li.classList.toggle('is-today', +li.dataset.day === d));
};
paintLive(); setInterval(paintLive, 60000);

/* ----------------------------------------------------------
   INTRO · la brasa se abre
   ---------------------------------------------------------- */
const intro = $('#intro');
const heroIn = () => {
  if (!motion) return;
  gsap.from('.hero__title .line > span', { yPercent: 105, duration: 1.2, ease: 'expo.out', stagger: .1 });
  gsap.from('.kicker, .hero__lead, .hero__cta, .hero__facts li', { y: 26, opacity: 0, duration: 1, ease: 'power3.out', stagger: .07, delay: .3 });
  gsap.from('.hero__img', { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'expo.inOut' });
  gsap.from('.hero__img img', { scale: 1.4, duration: 2, ease: 'expo.out' });
  gsap.from('.badge', { scale: 0, rotate: -120, duration: 1.2, ease: 'back.out(1.5)', delay: .6 });
};
if (!motion) intro.remove();
else {
  lock(true); scrollTo(0, 0);
  const line = $('.intro__hatline'), len = line.getTotalLength();
  gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
  const yr = { v: 0 }, yEl = $('#introYear'), years = new Date().getFullYear() - 1982;
  let done = false;
  const finish = () => {
    if (done) return; done = true;
    gsap.timeline({ onComplete: () => { intro.remove(); lock(false); ScrollTrigger.refresh(); } })
      .to('.intro__core', { opacity: 0, scale: .96, duration: .4, ease: 'power2.in' })
      .to('.intro__half--top', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '<.1')
      .to('.intro__half--bot', { yPercent: 100, duration: 1, ease: 'expo.inOut' }, '<');
    setTimeout(heroIn, 350);
  };
  const tl = gsap.timeline({ delay: .3, onComplete: finish });
  tl.to(line, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' })
    .from('.intro__name span', { yPercent: 105, duration: .9, ease: 'expo.out' }, '-=.6')
    .from('.intro__year', { opacity: 0, y: 10, duration: .5 }, '-=.5')
    .to(yr, { v: years, duration: 1, ease: 'power2.out', onUpdate: () => (yEl.textContent = Math.round(yr.v)) }, '-=.3')
    .to({}, { duration: .35 });
  watchdog(tl, 6000);
  intro.addEventListener('click', () => { tl.kill(); finish(); });
}

/* ----------------------------------------------------------
   L'AST · los pollos giran y se doran con el scroll
   ---------------------------------------------------------- */
const astSvg = $('#astSvg');
const ROWS = [118, 218, 318, 418], COLS = [112, 212, 312, 412];
let astHTML = `<defs>
  <linearGradient id="metal" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#6E655B"/><stop offset=".5" stop-color="#2A241E"/><stop offset="1" stop-color="#4A423A"/></linearGradient>
  <linearGradient id="heat" x1="0" x2="1"><stop offset="0" stop-color="#FF8A2A" stop-opacity="0"/><stop offset=".5" stop-color="#FFB25C"/><stop offset="1" stop-color="#FF8A2A" stop-opacity="0"/></linearGradient>
  <radialGradient id="shine" cx=".35" cy=".3" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs>
<rect x="18" y="40" width="484" height="462" rx="18" fill="#14100D" stroke="#3A3027" stroke-width="2"/>
<rect id="heatBar" x="38" y="58" width="444" height="22" rx="6" fill="url(#heat)" opacity=".3"/>
<rect x="30" y="40" width="16" height="462" rx="6" fill="url(#metal)"/><rect x="474" y="40" width="16" height="462" rx="6" fill="url(#metal)"/>`;
ROWS.forEach((y, r) => {
  astHTML += `<line x1="40" y1="${y}" x2="480" y2="${y}" stroke="#A69C8F" stroke-width="5" stroke-linecap="round"/>`;
  COLS.forEach((x, c) => {
    astHTML += `<g class="chick" data-ph="${(r * .9 + c * .35).toFixed(2)}" transform="translate(${x} ${y})">
      <g class="chick__legs">
        <ellipse class="chick__skin" cx="-20" cy="-22" rx="9" ry="17" transform="rotate(-32 -20 -22)"/><circle cx="-31" cy="-38" r="5" fill="#F4E9D4" stroke="#CDBE9E"/>
        <ellipse class="chick__skin" cx="20" cy="-22" rx="9" ry="17" transform="rotate(32 20 -22)"/><circle cx="31" cy="-38" r="5" fill="#F4E9D4" stroke="#CDBE9E"/>
      </g>
      <g class="chick__body">
        <ellipse class="chick__skin" cx="0" cy="2" rx="34" ry="27"/>
        <ellipse class="chick__leg" cx="-31" cy="10" rx="8" ry="13" transform="rotate(20 -31 10)"/>
        <ellipse class="chick__leg" cx="31" cy="10" rx="8" ry="13" transform="rotate(-20 31 10)"/>
        <circle class="chick__spot" cx="-12" cy="10" r="3"/><circle class="chick__spot" cx="14" cy="-4" r="2.5"/><circle class="chick__spot" cx="4" cy="16" r="2.2"/>
        <ellipse class="chick__shine" cx="-9" cy="-8" rx="16" ry="8" fill="url(#shine)"/>
      </g>
    </g>`;
  });
  astHTML += `<rect x="36" y="${y - 3}" width="10" height="6" fill="#A69C8F"/>`;
});
astHTML += `<path d="M40 478 H480 L466 496 H54Z" fill="#2A231C" stroke="#4A3F35"/><ellipse cx="260" cy="482" rx="200" ry="4" fill="#C77A2E" opacity=".35"/>`;
astSvg.innerHTML = astHTML;
const chicks = $$('.chick', astSvg).map((g) => ({ g, body: $('.chick__body', g), legs: $('.chick__legs', g), shine: $('.chick__shine', g), ph: +g.dataset.ph }));
const skins = $$('.chick__skin, .chick__leg', astSvg), spots = $$('.chick__spot', astSvg);
const COL_A = ['#F1CFA6', '#E7AE66', '#C8772F', '#9A4D1A'], COL_S = ['#DDB98C', '#C9873F', '#8E4516', '#5E2A0C'];
const lerpCol = (stops, p) => {
  const t = Math.min(.999, Math.max(0, p)) * (stops.length - 1), i = Math.floor(t), f = t - i;
  const a = stops[i].match(/\w\w/g).map((h) => parseInt(h, 16)), b = stops[i + 1].match(/\w\w/g).map((h) => parseInt(h, 16));
  return '#' + a.map((v, k) => Math.round(v + (b[k] - v) * f).toString(16).padStart(2, '0')).join('');
};
let astP = reduced ? 1 : 0, spin = 0;
const steps = $$('#astSteps li'), gaugeBar = $('#gaugeBar'), gaugeNum = $('#gaugeNum'), glow = $('#astGlow'), heatBar = $('#heatBar');
const paintAst = () => {
  const skin = lerpCol(COL_A, astP), spot = lerpCol(COL_S, astP);
  skins.forEach((s) => s.setAttribute('fill', skin));
  spots.forEach((s) => s.setAttribute('fill', spot));
  chicks.forEach((c) => {
    const a = spin + c.ph;
    const k = Math.cos(a);
    c.legs.setAttribute('transform', `scale(1 ${k.toFixed(3)})`);
    c.legs.style.opacity = (.35 + .65 * Math.abs(k)).toFixed(2);
    c.body.setAttribute('transform', `scale(1 ${(.9 + .1 * Math.abs(k)).toFixed(3)})`);
    c.shine.setAttribute('transform', `translate(0 ${(Math.sin(a) * 9).toFixed(2)})`);
  });
  const pct = Math.round(astP * 100);
  gaugeBar.style.width = pct + '%'; gaugeNum.textContent = pct + '%';
  glow.style.opacity = (.2 + astP * .75).toFixed(2); heatBar.setAttribute('opacity', (.25 + astP * .75).toFixed(2));
  const k = Math.min(3, Math.floor(astP * 4));
  steps.forEach((li, i) => li.classList.toggle('is-on', i === k));
};
paintAst();
if (motion) {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    ScrollTrigger.create({ trigger: '.ast__pin', start: 'top top', end: '+=140%', pin: true, scrub: true, onUpdate: (s) => (astP = s.progress) });
  });
  mm.add('(max-width: 900px)', () => {
    ScrollTrigger.create({ trigger: '.ast', start: 'top 60%', end: 'bottom 60%', scrub: true, onUpdate: (s) => (astP = s.progress) });
  });
  let astVisible = false;
  ScrollTrigger.create({ trigger: '.ast', start: 'top bottom', end: 'bottom top', onToggle: (s) => (astVisible = s.isActive) });
  gsap.ticker.add((t, dt) => { if (!astVisible) return; spin += dt * .0024; paintAst(); });
}

/* ----------------------------------------------------------
   EL PLATO · dibujos en SVG de cada componente
   ---------------------------------------------------------- */
const R = rng(1982);
const grp = (x, y, inner, s = 1) => `<g class="part" transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;
const marks = (w, n = 3, col = '#2B160B') => Array.from({ length: n }, (_, i) => `<path d="M${-w / 2 + (i + 1) * w / (n + 1) - 10} -18 l20 36" stroke="${col}" stroke-width="3.2" stroke-linecap="round" opacity=".55"/>`).join('');
const ART = {
  fries: (x, y) => { const r = rng(7); let s = ''; for (let i = 0; i < 17; i++) { const a = (r() * 120 - 60).toFixed(0), dx = (r() * 64 - 32).toFixed(1), dy = (r() * 44 - 22).toFixed(1), l = (30 + r() * 16).toFixed(0); s += `<rect x="${-l / 2}" y="-4" width="${l}" height="8.5" rx="3" fill="#F4C85A" stroke="#D69A2D" stroke-width="1" transform="translate(${dx} ${dy}) rotate(${a})"/>`; } return grp(x, y, s); },
  ensalada: (x, y) => { const r = rng(3); let s = ''; for (let i = 0; i < 8; i++) { const a = (i * 45 + r() * 20).toFixed(0), dx = (Math.cos(i) * 22).toFixed(1), dy = (Math.sin(i * 1.3) * 14).toFixed(1); s += `<path d="M0 0 C10 -14 30 -12 38 0 C30 12 10 14 0 0Z" fill="${i % 2 ? '#7DB24A' : '#5E9A35'}" stroke="#4C7E2A" stroke-width=".8" transform="translate(${dx} ${dy}) rotate(${a})"/>`; } for (let i = 0; i < 9; i++) { const dx = (r() * 50 - 25).toFixed(1), dy = (r() * 30 - 15).toFixed(1), a = (r() * 180).toFixed(0); s += `<line x1="-7" y1="0" x2="7" y2="0" stroke="#F08A24" stroke-width="3" stroke-linecap="round" transform="translate(${dx} ${dy}) rotate(${a})"/>`; } s += `<circle cx="-18" cy="10" r="10" fill="#D2452F"/><circle cx="-18" cy="10" r="6" fill="#E86A50"/><circle cx="20" cy="-8" r="9" fill="#D2452F"/><circle cx="20" cy="-8" r="5" fill="#E86A50"/>`; return grp(x, y, s); },
  pimiento: (x, y) => grp(x, y, `<path d="M-40 -14 C-20 -26 18 -22 34 -10 C22 -2 -18 -2 -40 -14Z" fill="#3E7A2E" stroke="#2C5A1F"/><path d="M-36 6 C-14 -6 22 -2 38 10 C24 18 -14 18 -36 6Z" fill="#4C8C36" stroke="#2C5A1F"/><path d="M-30 -14 C-10 -20 10 -18 24 -12" stroke="#9BC57A" stroke-width="2" fill="none" opacity=".7"/><circle cx="-6" cy="26" r="13" fill="#D2452F"/><circle cx="-6" cy="26" r="8.5" fill="#E8765A"/><circle cx="20" cy="28" r="11" fill="#C83C28"/><circle cx="20" cy="28" r="7" fill="#E8765A"/>`),
  calabacin: (x, y) => { let s = ''; [[-26, -12], [6, -18], [30, 4], [-8, 14], [-34, 16]].forEach(([a, b]) => { s += `<circle cx="${a}" cy="${b}" r="15" fill="#E3B35E" stroke="#C3893A" stroke-width="2"/><circle cx="${a}" cy="${b}" r="9" fill="#EADA9A" stroke="#7FA04A" stroke-width="2"/>`; }); return grp(x, y, s); },
  escalivada: (x, y) => grp(x, y, `<path d="M-42 -12 C-14 -24 18 -20 40 -8" stroke="#C0392B" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M-40 6 C-12 -4 16 0 42 12" stroke="#5B2A4E" stroke-width="11" stroke-linecap="round" fill="none"/><path d="M-36 24 C-8 16 18 20 38 30" stroke="#D9533F" stroke-width="10" stroke-linecap="round" fill="none"/><path d="M-20 -2 q10 -8 20 0 M4 18 q10 -8 20 0" stroke="#EFE3C8" stroke-width="3" fill="none"/>`),
  ensaladilla: (x, y) => { const r = rng(9); let s = '<ellipse cx="0" cy="4" rx="44" ry="30" fill="#E9D8A6"/><ellipse cx="-4" cy="-2" rx="38" ry="24" fill="#F3E4B4"/>'; for (let i = 0; i < 14; i++) s += `<circle cx="${(r() * 60 - 30).toFixed(1)}" cy="${(r() * 34 - 16).toFixed(1)}" r="2.6" fill="${i % 3 ? '#F08A24' : '#6FA43E'}"/>`; return grp(x, y, s + '<circle cx="8" cy="-10" r="5" fill="#3B3A2A"/>'); },
  judias: (x, y) => { const r = rng(11); let s = '<ellipse cx="0" cy="2" rx="46" ry="30" fill="#E6D3AE"/>'; for (let i = 0; i < 30; i++) s += `<ellipse cx="${(r() * 70 - 35).toFixed(1)}" cy="${(r() * 40 - 18).toFixed(1)}" rx="6.5" ry="4.2" fill="#F7F1E2" stroke="#CDBE9E" stroke-width=".8" transform="rotate(${(r() * 180).toFixed(0)} 0 0)"/>`; return grp(x, y, s); },
  espaguetis: (x, y, s = 1) => { const r = rng(5); let p = ''; for (let i = 0; i < 12; i++) { const a = r() * 6.28, rr = 14 + r() * 22; p += `<path d="M${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr * .7).toFixed(1)} q${(r() * 40 - 20).toFixed(0)} ${(r() * 30 - 15).toFixed(0)} ${(r() * 50 - 25).toFixed(0)} ${(r() * 20 - 10).toFixed(0)} t${(r() * 40 - 20).toFixed(0)} ${(r() * 16 - 8).toFixed(0)}" stroke="#F0C46A" stroke-width="3.2" fill="none" stroke-linecap="round"/>`; } p += '<path d="M-22 -6 C-16 -22 14 -22 22 -8 C26 4 10 14 -4 12 C-16 10 -26 4 -22 -6Z" fill="#B8402A"/>'; for (let i = 0; i < 8; i++) p += `<circle cx="${(r() * 34 - 17).toFixed(1)}" cy="${(r() * 22 - 12).toFixed(1)}" r="3" fill="#7A2614"/>`; return grp(x, y, p, s); },
  pollo: (x, y, big) => grp(x, y, `${big ? '<path d="M-20 -46 C14 -58 52 -36 46 -6 C42 14 18 16 0 6 C-18 -4 -40 -28 -20 -46Z" fill="#C27A36" stroke="#8A4A1C" stroke-width="2"/><path d="M-6 -40 C16 -46 34 -32 32 -16" stroke="#E8B06A" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>' : ''}<path d="M-50 10 C-54 -20 -22 -30 0 -18 C22 -6 26 22 6 34 C-14 46 -46 36 -50 10Z" fill="#C9813A" stroke="#8A4A1C" stroke-width="2"/><path d="M2 30 C20 30 44 40 54 50 C60 56 52 64 46 58 C36 50 16 44 0 42Z" fill="#B96F2E" stroke="#8A4A1C" stroke-width="2"/><circle cx="52" cy="58" r="6" fill="#F2E6D0" stroke="#CDBE9E"/><path d="M-36 -6 C-24 -18 -6 -16 4 -8" stroke="#E8B06A" stroke-width="4" fill="none" stroke-linecap="round" opacity=".75"/><circle cx="-20" cy="12" r="3" fill="#7A3C14"/><circle cx="-4" cy="20" r="2.5" fill="#7A3C14"/><circle cx="-30" cy="22" r="2.2" fill="#7A3C14"/>`),
  bistec: (x, y, w = 1) => grp(x, y, `<path d="M-56 -6 C-58 -32 -20 -40 10 -34 C40 -28 60 -10 54 14 C48 36 10 40 -20 34 C-46 28 -54 16 -56 -6Z" fill="#8A4A2A" stroke="#5E2E17" stroke-width="2"/><path d="M-50 -14 C-46 -30 -16 -36 8 -30" stroke="#EBD3B0" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>${marks(100, 4)}`, w),
  chuleta: (x, y, a = 0) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M-30 -2 C-32 -24 -4 -30 14 -20 C30 -10 30 14 12 22 C-6 30 -28 20 -30 -2Z" fill="#9A5232" stroke="#5E2E17" stroke-width="2"/><path d="M-26 -10 C-20 -24 0 -26 12 -18" stroke="#EBD3B0" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="18" y="-4" width="38" height="9" rx="4.5" fill="#F2E6D0" stroke="#CDBE9E"/>${marks(50, 2)}</g>`,
  butifarra: (x, y) => grp(x, y, `<path d="M-62 10 C-40 -30 30 -34 62 -2" stroke="#5E2E17" stroke-width="28" fill="none" stroke-linecap="round"/><path d="M-62 10 C-40 -30 30 -34 62 -2" stroke="#7C4226" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M-50 -2 C-30 -24 20 -26 46 -10" stroke="#B57A52" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/><path d="M-36 -18 l8 18 M-12 -26 l8 18 M14 -26 l8 18 M38 -18 l8 16" stroke="#2B160B" stroke-width="3" stroke-linecap="round" opacity=".55"/>`),
  hamburguesa: (x, y) => grp(x, y, `<circle r="46" fill="#5E3219" stroke="#3E1E0E" stroke-width="2"/><circle r="40" fill="#6B3A20"/>${marks(80, 3)}<path d="M-30 -20 C-20 -32 0 -36 16 -32" stroke="#9A6038" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`),
  escalopa: (x, y, big) => { const r = rng(big ? 21 : 13); let s = `<path d="M-60 -10 C-64 -38 -26 -48 6 -42 C40 -36 66 -16 60 12 C54 40 14 46 -18 42 C-48 38 -58 18 -60 -10Z" fill="#DCA24C" stroke="#B3762A" stroke-width="2.5"/>`; for (let i = 0; i < 40; i++) s += `<circle cx="${(r() * 100 - 50).toFixed(1)}" cy="${(r() * 64 - 32).toFixed(1)}" r="${(1 + r() * 1.8).toFixed(1)}" fill="${i % 3 ? '#B9782C' : '#F0C66E'}"/>`; s += '<path d="M-48 -20 C-36 -36 -6 -40 14 -36" stroke="#F3D08A" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>'; if (big) s += '<path d="M34 26 L58 38 L40 48Z" fill="#F5D547" stroke="#D9B32A"/>'; return grp(x, y, s, big ? 1.12 : .92); },
  huevo: (x, y) => `<g transform="translate(${x} ${y})"><path d="M-30 -4 C-34 -24 -6 -30 10 -26 C30 -22 36 -4 28 10 C20 24 -4 26 -18 20 C-30 14 -28 6 -30 -4Z" fill="#FFFFFF" stroke="#EADFCB" stroke-width="2"/><circle cx="0" cy="-2" r="12" fill="#F5B21E"/><circle cx="-4" cy="-6" r="4" fill="#FCD674"/></g>`,
  beicon: (x, y, a = 0) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M-40 0 q10 -8 20 0 t20 0 t20 0 t20 0" stroke="#B5524A" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M-40 0 q10 -8 20 0 t20 0 t20 0 t20 0" stroke="#E7A79B" stroke-width="4" fill="none" stroke-linecap="round"/></g>`,
  tortilla: (x, y, gambas) => { let s = '<path d="M-58 14 C-56 -34 56 -34 58 14 Z" fill="#F2CF5B" stroke="#DDAE36" stroke-width="2.5"/><path d="M-44 6 C-38 -18 30 -22 44 4" stroke="#F8E08F" stroke-width="5" fill="none" opacity=".8"/>'; if (gambas) [[-26, -2], [-4, -10], [18, -4], [6, 6], [-16, 8]].forEach(([a, b]) => { s += `<path d="M${a} ${b} a6 6 0 1 1 8 4" stroke="#F08F78" stroke-width="4" fill="none" stroke-linecap="round"/>`; }); return grp(x, y, s); },
  espanola: (x, y) => grp(x, y, `<path d="M0 0 L50 -18 A52 52 0 1 1 46 24 Z" fill="#F0C552" stroke="#C98A2C" stroke-width="4"/><path d="M0 0 L50 -18 L46 24Z" fill="#F6E3A1" stroke="#C98A2C" stroke-width="2"/><path d="M12 -3 L40 -12 M14 6 L42 4 M12 14 L36 18" stroke="#E7CF86" stroke-width="3"/><path d="M-30 -30 C-14 -42 14 -42 30 -34" stroke="#F7DC86" stroke-width="5" fill="none" opacity=".8"/>`),
  pierna: (x, y) => grp(x, y, `<ellipse cx="4" cy="8" rx="64" ry="38" fill="#6B3A1E" opacity=".85"/>${[[-30, -2, -12], [0, -8, 0], [30, -2, 12]].map(([a, b, rot]) => `<path d="M${a - 18} ${b - 14} C${a - 6} ${b - 22} ${a + 14} ${b - 18} ${a + 18} ${b - 4} C${a + 20} ${b + 12} ${a + 4} ${b + 20} ${a - 12} ${b + 16} C${a - 24} ${b + 10} ${a - 24} ${b - 6} ${a - 18} ${b - 14}Z" fill="#C88A5E" stroke="#8E4F2A" stroke-width="3" transform="rotate(${rot} ${a} ${b})"/>`).join('')}`),
  higado: (x, y) => grp(x, y, `<path d="M-56 -4 C-50 -30 -10 -34 4 -18 C14 -6 4 18 -18 22 C-40 26 -60 16 -56 -4Z" fill="#5A2A1E" stroke="#3A170F" stroke-width="2"/><path d="M-4 -10 C10 -32 50 -28 54 -6 C58 14 30 26 8 20 C-8 14 -10 2 -4 -10Z" fill="#62301F" stroke="#3A170F" stroke-width="2"/><ellipse cx="-20" cy="-4" rx="14" ry="9" fill="none" stroke="#EFE3C8" stroke-width="3"/><ellipse cx="22" cy="-2" rx="12" ry="8" fill="none" stroke="#EFE3C8" stroke-width="3"/>${ART.beicon(-6, 30, -6)}`),
  pincho: (x, y) => { let s = '<line x1="-66" y1="6" x2="66" y2="-6" stroke="#C8A271" stroke-width="4" stroke-linecap="round"/>'; [-48, -24, 0, 24, 48].forEach((a, i) => { s += i % 2 ? `<rect x="${a - 9}" y="-14" width="18" height="22" rx="4" fill="${i === 1 ? '#3E7A2E' : '#C0392B'}" transform="rotate(-5 ${a} 0)"/>` : `<rect x="${a - 13}" y="-16" width="26" height="28" rx="8" fill="#C9803E" stroke="#8A4A1C" stroke-width="2" transform="rotate(-5 ${a} 0)"/>`; }); return grp(x, y, s); },
  calamares: (x, y, big) => { const r = rng(big ? 31 : 17); let s = ''; const n = big ? 10 : 7; for (let i = 0; i < n; i++) { const a = i / n * 6.28, rr = i % 2 ? 26 : 12; s += `<circle cx="${(Math.cos(a) * rr * 1.5 + r() * 6).toFixed(1)}" cy="${(Math.sin(a) * rr + r() * 6).toFixed(1)}" r="13" fill="none" stroke="#B9782C" stroke-width="10"/><circle cx="${(Math.cos(a) * rr * 1.5).toFixed(1)}" cy="${(Math.sin(a) * rr).toFixed(1)}" r="13" fill="none" stroke="#E3B35E" stroke-width="7"/>`; } return grp(x, y, s + '<path d="M40 22 L64 30 L46 42Z" fill="#F5D547" stroke="#D9B32A"/>'); },
  croquetas: (x, y) => { let s = ''; [[-30, -18, -14], [6, -24, 6], [-22, 10, 10], [16, 6, -8], [-4, 30, 4]].forEach(([a, b, rot]) => { s += `<rect x="${a - 22}" y="${b - 10}" width="44" height="20" rx="10" fill="#C98A3A" stroke="#9A6224" stroke-width="2" transform="rotate(${rot} ${a} ${b})"/><path d="M${a - 14} ${b - 4} h20" stroke="#E7B566" stroke-width="3" stroke-linecap="round" transform="rotate(${rot} ${a} ${b})"/>`; }); return grp(x, y, s); }
};
const MAIN = {
  pollo2: (x, y) => ART.pollo(x, y + 6, true), pollo1: (x, y) => ART.pollo(x, y, false),
  parrillada: (x, y) => grp(x, y, `${ART.butifarra(-6, -26).replace('class="part"', '')}${ART.chuleta(-26, 22, -10)}${ART.chuleta(28, 18, 20)}`),
  chuletas: (x, y) => grp(x, y, `${ART.chuleta(-16, -22, -12)}${ART.chuleta(-6, 4, 6)}${ART.chuleta(-20, 30, 18)}`),
  butifarra: (x, y) => ART.butifarra(x, y), entrecot: (x, y) => ART.bistec(x, y, 1.12), bistec: (x, y) => ART.bistec(x, y, .95), lomo: (x, y) => ART.bistec(x, y, .85),
  lomohuevo: (x, y) => grp(x, y, `${ART.bistec(-6, 6, .8).replace('class="part"', '')}${ART.huevo(10, -18)}`),
  hamburguesa: (x, y) => ART.hamburguesa(x, y), escalopa2: (x, y) => ART.escalopa(x, y, true), escalopa1: (x, y) => ART.escalopa(x, y, false),
  pierna: (x, y) => ART.pierna(x, y), higado: (x, y) => ART.higado(x, y),
  francesa: (x, y) => ART.tortilla(x, y, false), gambas: (x, y) => ART.tortilla(x, y, true), espanola: (x, y) => ART.espanola(x, y),
  huevos: (x, y) => grp(x, y, `${ART.huevo(-26, -6)}${ART.huevo(28, 8)}`),
  huevosbeicon: (x, y) => grp(x, y, `${ART.beicon(-8, -34, -8)}${ART.beicon(8, 38, 6)}${ART.huevo(-26, -2)}${ART.huevo(28, 6)}`),
  pincho: (x, y) => ART.pincho(x, y), espaguetis2: (x, y) => ART.espaguetis(x, y, 1.9), espaguetis1: (x, y) => ART.espaguetis(x, y, 1.45),
  calamares2: (x, y) => ART.calamares(x, y, true), calamares1: (x, y) => ART.calamares(x, y, false), croquetas: (x, y) => ART.croquetas(x, y)
};
const plateSVG = (d, gid) => {
  const garn = d.g ? gid : null, extras = !!(d.pat || d.side || garn);
  let s = `<ellipse cx="200" cy="152" rx="192" ry="134" fill="#E9E3D6"/><ellipse cx="200" cy="148" rx="190" ry="132" fill="#FBF8F1"/><ellipse cx="200" cy="150" rx="158" ry="106" fill="#FFFFFF" stroke="#EEE7D9" stroke-width="3"/>`;
  s += MAIN[d.m](extras ? 150 : 200, extras ? 156 : 150);
  const two = d.pat && (d.side || garn);
  if (d.pat) s += ART.fries(274, two ? 104 : 150);
  const second = d.side || garn;
  if (second) s += ART[second](272, d.pat ? 204 : 150);
  return s;
};

/* ----------------------------------------------------------
   MONTA TU PLATO · selección, plato y comanda
   ---------------------------------------------------------- */
const catsEl = $('#cats'), dishesEl = $('#dishes'), garnEl = $('#garn'), plate = $('#plate');
let cat = 'ast', dish = DISHES[0], garn = 'ensalada';
const order = [];
catsEl.innerHTML = CATS.slice(1).map(([id, t]) => `<button class="cat" type="button" role="tab" data-c="${id}" aria-selected="${id === cat}">${t}</button>`).join('');
garnEl.innerHTML = GARN.map((g) => `<button type="button" data-g="${g.id}" aria-pressed="false">${g.t}${g.p ? `<small>+${eur(g.p)}</small>` : ''}</button>`).join('');
const renderDishes = () => {
  dishesEl.innerHTML = DISHES.filter((d) => d.cat === cat).map((d) => `<button class="dish" type="button" data-n="${d.n}" aria-pressed="${d === dish}"><span class="dish__n">${d.n}</span><span class="dish__t">${d.t}</span><span class="dish__p">${eur(d.p)}</span></button>`).join('');
  if (motion) gsap.from($$('.dish', dishesEl), { y: 14, opacity: 0, duration: .45, stagger: .03, ease: 'power2.out' });
};
const garnPrice = () => (dish.g ? GARN.find((g) => g.id === garn).p : 0);
const renderPlate = () => {
  plate.innerHTML = plateSVG(dish, garn);
  if (motion) gsap.from($$('.part', plate), { scale: .4, opacity: 0, transformOrigin: '50% 50%', duration: .6, ease: 'back.out(1.8)', stagger: .08 });
  const gname = dish.g ? ' · ' + GARN.find((g) => g.id === garn).t.toLowerCase() : '';
  $('#plateName').textContent = `${dish.n}. ${dish.f}${dish.note ? ` (${dish.note})` : ''}${gname}`;
  $('#platePrice').textContent = eur(dish.p + garnPrice());
  $$('button', garnEl).forEach((b) => { b.disabled = !dish.g; b.setAttribute('aria-pressed', dish.g && b.dataset.g === garn); });
  $('#garnNote').textContent = dish.g ? 'Cuatro guarniciones incluidas; ensaladilla rusa y judías blancas, +2,00 €.'
    : dish.side ? `Este plato ya se sirve con ${SIDE_NAME[dish.side]}.` : dish.pat ? 'Se sirve con patatas; sin guarnición a elegir.' : 'Se sirve tal cual, sin guarnición.';
};
catsEl.addEventListener('click', (e) => {
  const b = e.target.closest('.cat'); if (!b) return;
  cat = b.dataset.c; $$('.cat', catsEl).forEach((x) => x.setAttribute('aria-selected', x === b));
  dish = DISHES.find((d) => d.cat === cat); renderDishes(); renderPlate();
});
dishesEl.addEventListener('click', (e) => {
  const b = e.target.closest('.dish'); if (!b) return;
  dish = DISHES.find((d) => d.n === +b.dataset.n);
  $$('.dish', dishesEl).forEach((x) => x.setAttribute('aria-pressed', x === b));
  renderPlate();
});
garnEl.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b || b.disabled) return; garn = b.dataset.g; renderPlate(); });

// la comanda
const lines = $('#ticketLines'), ticketEl = $('#ticket');
const { m: nowM } = madridNow();
$('#ticketMeta').textContent = `Comanda nº ${String(1982 + Math.floor(Math.random() * 7000)).padStart(4, '0')} · ${hhmm(nowM)}`;
const renderTicket = (flash) => {
  if (!order.length) lines.innerHTML = '<li class="ticket__empty">Tu comanda está vacía.<br>Monta un plato y añádelo.</li>';
  else lines.innerHTML = order.map((o, i) => {
    const g = o.g ? GARN.find((x) => x.id === o.g) : null;
    const unit = o.d.p + (g ? g.p : 0);
    return `<li data-i="${i}"><span>${o.q} × ${o.d.n}. ${o.d.t}<small>${g ? 'Guarn.: ' + g.t + (g.p ? ' (+' + eur(g.p) + ')' : '') : (o.d.side ? 'Con ' + SIDE_NAME[o.d.side] : '')}</small></span><b>${eur(unit * o.q)}</b><button type="button" aria-label="Quitar">×</button></li>`;
  }).join('');
  const total = order.reduce((s, o) => s + o.q * (o.d.p + (o.g ? GARN.find((x) => x.id === o.g).p : 0)), 0);
  $('#ticketTotal').textContent = eur(total);
  if (flash && motion) {
    gsap.fromTo(ticketEl, { y: -24 }, { y: 0, duration: .6, ease: 'power3.out' });
    const li = lines.querySelector(`li[data-i="${flash}"]`) || lines.lastElementChild;
    if (li) gsap.from(li, { backgroundColor: '#FCE9C8', duration: 1.2 });
  }
};
$('#addBtn').addEventListener('click', () => {
  const g = dish.g ? garn : null;
  const ex = order.findIndex((o) => o.d === dish && o.g === g);
  if (ex >= 0) order[ex].q++; else order.push({ d: dish, g, q: 1 });
  renderTicket(String(ex >= 0 ? ex : order.length - 1));
  if (motion) gsap.fromTo('#addBtn', { scale: .94 }, { scale: 1, duration: .4, ease: 'back.out(3)' });
});
lines.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const i = +b.closest('li').dataset.i;
  if (order[i].q > 1) order[i].q--; else order.splice(i, 1);
  renderTicket();
});
$('#clearBtn').addEventListener('click', () => { order.length = 0; renderTicket(); });
renderDishes(); renderPlate(); renderTicket();

/* ----------------------------------------------------------
   CARTA · filtros y buscador
   ---------------------------------------------------------- */
const chips = $('#menuChips'), list = $('#menuList'), search = $('#menuSearch');
let mcat = 'all';
chips.innerHTML = CATS.map(([id, t]) => `<button class="chip" type="button" role="tab" data-c="${id}" aria-selected="${id === 'all'}">${t}</button>`).join('');
const hl = (txt, q) => { if (!q) return txt; const i = norm(txt).indexOf(q); return i < 0 ? txt : `${txt.slice(0, i)}<mark>${txt.slice(i, i + q.length)}</mark>${txt.slice(i + q.length)}`; };
const renderMenu = () => {
  const q = norm(search.value.trim());
  const rows = DISHES.filter((d) => (mcat === 'all' || d.cat === mcat) && (!q || norm(d.f + ' ' + (d.note || '')).includes(q)));
  list.innerHTML = rows.length ? rows.map((d) => `<li class="mi"><span class="mi__n">${d.n}</span><span class="mi__t">${hl(d.f, q)}${d.note ? `<small>(${d.note})</small>` : ''}</span><span class="mi__d"></span><span class="mi__p">${d.p.toFixed(2).replace('.', ',')} €</span></li>`).join('')
    : `<li class="board__empty">Nada con «${search.value}». Prueba con «pollo» o «escalopa».</li>`;
  if (motion) gsap.from($$('.mi', list), { opacity: 0, x: -10, duration: .4, stagger: .015, ease: 'power2.out' });
};
chips.addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (!b) return; mcat = b.dataset.c; $$('.chip', chips).forEach((x) => x.setAttribute('aria-selected', x === b)); renderMenu(); });
search.addEventListener('input', () => {
  if (search.value && mcat !== 'all') { mcat = 'all'; $$('.chip', chips).forEach((x) => x.setAttribute('aria-selected', x.dataset.c === 'all')); }
  renderMenu();
});
renderMenu();

/* ----------------------------------------------------------
   LA BARRA · baraja de fotos que se desliza
   ---------------------------------------------------------- */
const deck = $('#deck'), cap = $('#deckCap'), countEl = $('#deckCount');
let stack = PHOTOS.map(([src, t, from], i) => {
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `<img src="assets/img/${src}" alt="${t}" ${i > 3 ? 'loading="lazy"' : ''} draggable="false"><div class="card__cap">${t}<span>${from}</span></div>`;
  el.dataset.r = ((i * 37) % 9 - 4) * .9;
  el.dataset.i = i;
  return el;
});
stack.slice().reverse().forEach((el) => deck.appendChild(el)); // la primera foto queda arriba
const layout = (animate) => {
  stack.forEach((el, k) => {
    const props = { x: k * 7, y: k * -7, rotate: k ? +el.dataset.r : 0, scale: 1 - Math.min(k, 4) * .035, opacity: k < 5 ? 1 : 0, zIndex: 100 - k };
    if (animate && motion) gsap.to(el, { ...props, duration: .55, ease: 'power3.out' });
    else if (hasGSAP) gsap.set(el, props);
    else { el.style.zIndex = 100 - k; el.style.transform = `translate(${props.x}px,${props.y}px) rotate(${props.rotate}deg) scale(${props.scale})`; el.style.opacity = props.opacity; }
  });
  const top = stack[0];
  cap.textContent = top.querySelector('.card__cap').firstChild.textContent;
  countEl.textContent = `${String(+top.dataset.i + 1).padStart(2, '0')} / ${String(PHOTOS.length).padStart(2, '0')}`;
};
const flyOut = (dir) => {
  const top = stack.shift();
  if (motion) {
    gsap.to(top, { x: dir * 560, y: 40, rotate: dir * 28, opacity: 0, duration: .5, ease: 'power2.in', onComplete: () => { stack.push(top); layout(true); } });
    layout(true);
  } else { stack.push(top); layout(false); }
};
const flyIn = () => {
  const last = stack.pop(); stack.unshift(last);
  if (motion) { gsap.set(last, { x: -560, rotate: -26, opacity: 0, zIndex: 101 }); }
  layout(true);
};
$('#deckNext').addEventListener('click', () => flyOut(-1));
$('#deckPrev').addEventListener('click', flyIn);
let drag = null;
deck.addEventListener('pointerdown', (e) => {
  const top = stack[0]; if (!e.target.closest('.card') || e.target.closest('.card') !== top) return;
  drag = { el: top, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0 }; top.classList.add('is-drag'); top.setPointerCapture(e.pointerId);
});
deck.addEventListener('pointermove', (e) => {
  if (!drag) return;
  drag.dx = e.clientX - drag.sx; drag.dy = e.clientY - drag.sy;
  const t = `translate(${drag.dx}px, ${drag.dy * .4}px) rotate(${drag.dx / 14}deg)`;
  if (hasGSAP) gsap.set(drag.el, { x: drag.dx, y: drag.dy * .4, rotate: drag.dx / 14 }); else drag.el.style.transform = t;
});
const endDeck = () => {
  if (!drag) return; const { el, dx } = drag; drag = null; el.classList.remove('is-drag');
  if (Math.abs(dx) > 100) flyOut(Math.sign(dx)); else layout(true);
};
deck.addEventListener('pointerup', endDeck); deck.addEventListener('pointercancel', endDeck);
deck.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') flyOut(1); if (e.key === 'ArrowLeft') flyIn(); });
deck.tabIndex = 0;
layout(false);

/* ----------------------------------------------------------
   AVISOS · stories en el tablón y visor a pantalla completa
   ---------------------------------------------------------- */
const row = $('#notesRow');
STORIES.forEach((s, i) => {
  const r = ((i % 3) - 1) * 2.4;
  row.insertAdjacentHTML('beforeend', `<button class="note" type="button" style="--r:${r}deg" data-i="${i}" aria-label="Ver story: ${s.t}"><video muted loop playsinline preload="none" poster="assets/img/${s.p || s.v}.jpg" data-src="assets/video/${s.v}.mp4"></video><span class="note__bar"></span><span class="note__pin"><i class="ph ph-play"></i></span><span class="note__label"><b>${s.t}</b><span>${s.d}</span></span></button>`);
});
const noteVids = $$('video', row);
const noteIO = new IntersectionObserver((ens) => ens.forEach((en) => {
  const v = en.target;
  if (en.isIntersecting) { if (!v.getAttribute('src')) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
}), { threshold: .4 });
noteVids.forEach((v) => noteIO.observe(v));

const viewer = $('#viewer'), vv = $('#viewerVideo'), bars = $('#viewerBars');
let vi = 0;
bars.innerHTML = STORIES.map(() => '<span><i></i></span>').join('');
const showStory = (i) => {
  if (i < 0) i = 0;
  if (i >= STORIES.length) return closeViewer();
  vi = i; const s = STORIES[i];
  $$('i', bars).forEach((b, k) => (b.style.width = k < i ? '100%' : '0%'));
  $('#viewerTitle').textContent = s.t;
  vv.poster = `assets/img/${s.p || s.v}.jpg`; vv.src = `assets/video/${s.v}.mp4`; vv.muted = false;
  vv.play().catch(() => { vv.muted = true; vv.play().catch(() => {}); });
};
const openViewer = (i) => { viewer.hidden = false; lock(true); noteVids.forEach((v) => v.pause()); showStory(i); $('.viewer__close').focus(); };
function closeViewer() { vv.pause(); vv.removeAttribute('src'); vv.load(); viewer.hidden = true; lock(false); }
vv.addEventListener('timeupdate', () => { if (vv.duration) $$('i', bars)[vi].style.width = (vv.currentTime / vv.duration * 100) + '%'; });
vv.addEventListener('ended', () => showStory(vi + 1));
row.addEventListener('click', (e) => { const b = e.target.closest('.note'); if (b) openViewer(+b.dataset.i); });
$('.viewer__tap--prev').addEventListener('click', () => showStory(vi - 1));
$('.viewer__tap--next').addEventListener('click', () => showStory(vi + 1));
$('.viewer__close').addEventListener('click', closeViewer);
viewer.addEventListener('click', (e) => { if (e.target === viewer) closeViewer(); });
addEventListener('keydown', (e) => {
  if (viewer.hidden) return;
  if (e.key === 'Escape') closeViewer();
  if (e.key === 'ArrowRight') showStory(vi + 1);
  if (e.key === 'ArrowLeft') showStory(vi - 1);
});

/* ----------------------------------------------------------
   HISTORIA · recorrido horizontal
   ---------------------------------------------------------- */
const trackEl = $('#storyTrack');
if (motion) {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const dist = () => Math.max(0, trackEl.scrollWidth - innerWidth);
    gsap.to(trackEl, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.story__pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } });
  });
}

/* ----------------------------------------------------------
   RESEÑAS + APARICIONES
   ---------------------------------------------------------- */
$$('.slip').forEach((s, i) => s.style.setProperty('--r', `${((i * 53) % 7 - 3) * .9}deg`));
if (motion) {
  ScrollTrigger.batch('.ast__copy > *, .combo__head > *, .combo__pick, .combo__serve, .board, .deck-sec__copy > *, .notes__head > *, .story__intro > *, .rail-sec__head > *, .where__info > *, .where__map', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.from(els, { y: 46, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .06, overwrite: true })
  });
  gsap.from('.note', { y: 120, rotate: 10, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: '#notesRow', start: 'top 85%' } });
  gsap.from('.slip', { rotate: -14, opacity: 0, duration: 1.6, ease: 'elastic.out(1, .45)', stagger: .08, transformOrigin: '50% 0%', scrollTrigger: { trigger: '.rail', start: 'top 80%' } });
  gsap.from('.foot__big', { yPercent: 40, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.foot', start: 'top 85%' } });
  gsap.to('.hero__img img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  addEventListener('load', () => ScrollTrigger.refresh());
}
$$('.nav__links a').forEach((a) => {
  const sec = $(a.getAttribute('href'));
  if (sec && hasGSAP) ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => a.classList.toggle('is-active', s.isActive) });
});
})();
