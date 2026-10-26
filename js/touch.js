// Game gerak jari: lempar (jentik), tarik garis, puzzle geser-tukar, tulis angka
const inRect = (r, x, y, pad = 0) => x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad;
const halfSet = (n) => shuffle([...shuffle(itemsOf('o')).slice(0, n), ...shuffle(itemsOf('a')).slice(0, n)]);

// ---------- Lempar Sampah (jentik ke atas ke arah sapi yang bergerak) ----------
const thr = { queue: [], i: 0, score: 0, miss: 0, busy: false, dx: 0, dy: 0, pts: [], o: null };
const tItem = $('#t-item');

START.throw = () => {
  Object.assign(thr, { queue: halfSet(5), i: 0, score: 0, miss: 0, busy: false });
  show('throw');
  nextThrow();
};

const nextThrow = () => {
  if (thr.i >= thr.queue.length) return finish('throw', thr.score, thr.miss, rate(thr.miss, [2, 5]));
  const [file, name] = thr.queue[thr.i];
  tItem.style.cssText = '';
  tItem.innerHTML = img(file);
  animate(tItem, 'pop');
  $('#t-name').textContent = name;
  thr.dx = thr.dy = 0;
  thr.busy = false;
  hud('throw', `Sampah ${thr.i + 1} dari ${thr.queue.length}`, thr.score, (thr.i / thr.queue.length) * 100);
};

const thrBack = () => {
  tItem.style.transition = 'transform .35s cubic-bezier(.3,1.6,.5,1)';
  tItem.style.transform = '';
  thr.dx = thr.dy = 0;
  thr.busy = false;
};

const land = (x, y) => {
  const cow = [...$$('.tcow')].find((c) => inRect(c.querySelector('.slide').getBoundingClientRect(), x, y, 24));
  if (!cow) { toast('Meleset! Jentik lagi ya', false); return thrBack(); }
  if (cow.dataset.type === thr.queue[thr.i][2]) {
    const pts = 10;
    thr.score += pts;
    tItem.style.opacity = 0;
    animate(cow, 'happy', 700);
    right(cow, '', pts);
    setTimeout(() => { thr.i++; nextThrow(); }, 1200);
  } else {
    thr.miss++;
    animate(cow, 'shake', 500);
    wrong();
    thrBack();
  }
};

tItem.addEventListener('pointerdown', (e) => {
  if (thr.busy) return;
  thr.o = { x: e.clientX - thr.dx, y: e.clientY - thr.dy };
  thr.pts = [];
  tItem.setPointerCapture(e.pointerId);
  tItem.classList.add('dragging');
  tItem.style.transition = 'none';
  sfx.pop();
});
tItem.addEventListener('pointermove', (e) => {
  if (!thr.o) return;
  thr.dx = e.clientX - thr.o.x;
  thr.dy = e.clientY - thr.o.y;
  tItem.style.transform = `translate(${thr.dx}px,${thr.dy}px) scale(1.1)`;
  thr.pts = [...thr.pts, { x: e.clientX, y: e.clientY, t: performance.now() }].slice(-6);
});
const release = () => {
  if (!thr.o) return;
  thr.o = null;
  tItem.classList.remove('dragging');
  const a = thr.pts[0], b = thr.pts[thr.pts.length - 1];
  if (!b || performance.now() - b.t > 150) return thrBack();
  const dt = Math.max(1, b.t - a.t), vx = (b.x - a.x) / dt, vy = (b.y - a.y) / dt, v = Math.hypot(vx, vy);
  if (v < 0.5 || vy > -0.2) return thrBack(); // harus jentikan cepat ke arah atas
  const r = tItem.getBoundingClientRect(), x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
  const ux = vx / v, uy = vy / v, row = $('.tcow .slide').getBoundingClientRect();
  const L = (row.top + row.height / 2 - y0) / uy; // terbang lurus sesuai arah jentikan sampai baris sapi
  thr.busy = true;
  tItem.style.transition = 'transform .55s cubic-bezier(.2,.7,.4,1)';
  tItem.style.transform = `translate(${thr.dx + ux * L}px,${thr.dy + uy * L}px) scale(.45) rotate(${ux * 300}deg)`;
  setTimeout(() => land(x0 + ux * L, y0 + uy * L), 570);
};
tItem.addEventListener('pointerup', release);
tItem.addEventListener('pointercancel', release);

// ---------- Tarik Garis (hubungkan sampah ke sapi) ----------
const ln = { items: [], done: 0, miss: 0, score: 0, from: null };
const lnBoard = $('#line-board'), lnSvg = $('#line-svg');
const lnHud = () => hud('line', `Garis ${ln.done} dari 6`, ln.score, (ln.done / 6) * 100);

START.line = () => {
  Object.assign(ln, { items: halfSet(3), done: 0, miss: 0, score: 0, from: null });
  show('line');
  lnSvg.innerHTML = '';
  $('#line-items').innerHTML = ln.items.map((it, i) => `<button class="node" data-i="${i}">${img(it[0])}</button>`).join('');
  lnHud();
};

const lnXY = (x, y) => { const r = lnBoard.getBoundingClientRect(); return [x - r.left, y - r.top]; };
lnBoard.addEventListener('pointerdown', (e) => {
  const n = e.target.closest('.node');
  if (!n || n.classList.contains('done')) return;
  lnBoard.setPointerCapture(e.pointerId);
  const r = n.getBoundingClientRect(), [x, y] = lnXY(r.right, r.top + r.height / 2);
  const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  l.setAttribute('class', 'ln');
  [['x1', x], ['y1', y], ['x2', x], ['y2', y]].forEach(([k, v]) => l.setAttribute(k, v));
  lnSvg.append(l);
  ln.from = { n, l };
  sfx.pop();
});
lnBoard.addEventListener('pointermove', (e) => {
  if (!ln.from) return;
  const [x, y] = lnXY(e.clientX, e.clientY);
  ln.from.l.setAttribute('x2', x);
  ln.from.l.setAttribute('y2', y);
});
const lnEnd = (e) => {
  if (!ln.from) return;
  const { n, l } = ln.from, type = ln.items[n.dataset.i][2];
  ln.from = null;
  const cow = [...$$('.lcow')].find((c) => inRect(c.getBoundingClientRect(), e.clientX, e.clientY, 10));
  if (cow && cow.dataset.type === type) {
    const r = cow.getBoundingClientRect(), [x, y] = lnXY(r.left + 6, r.top + r.height * 0.45);
    l.setAttribute('x2', x);
    l.setAttribute('y2', y);
    l.style.stroke = TYPES[type].color;
    n.classList.add('done');
    ln.done++;
    ln.score += 10;
    animate(cow, 'happy', 700);
    right(cow, '', 10);
    lnHud();
    if (ln.done === 6) setTimeout(() => finish('line', ln.score, ln.miss, rate(ln.miss, [1, 3])), 1400);
  } else {
    l.remove();
    if (cow) { ln.miss++; animate(cow, 'shake', 500); wrong(); }
  }
};
lnBoard.addEventListener('pointerup', lnEnd);
lnBoard.addEventListener('pointercancel', lnEnd);

// ---------- Susun Gambar (puzzle: seret kepingan untuk saling bertukar) ----------
const PUZ = [2, 2, 3]; // ukuran kotak tiap puzzle
const pz = { round: 0, n: 2, order: [], item: null, swaps: 0, score: 0, o: null };
const pzGrid = $('#pz-grid');

START.puzzle = () => {
  Object.assign(pz, { round: 0, swaps: 0, score: 0 });
  show('puzzle');
  nextPuzzle();
};

const nextPuzzle = () => {
  if (pz.round >= PUZ.length) return finish('puzzle', pz.score, Math.max(0, pz.swaps - 14), rate(Math.max(0, pz.swaps - 14), [2, 8]));
  pz.n = PUZ[pz.round++];
  pz.item = pick(ITEMS);
  const ids = Array.from({ length: pz.n * pz.n }, (_, i) => i);
  do { pz.order = shuffle(ids); } while (pz.order.every((v, i) => v === i));
  $('#pz-ref').innerHTML = img(pz.item[0]);
  $('#pz-name').textContent = pz.item[1];
  hud('puzzle', `Puzzle ${pz.round} dari ${PUZ.length}`, pz.score, ((pz.round - 1) / PUZ.length) * 100);
  drawPuzzle();
};

const drawPuzzle = () => {
  const n = pz.n, pos = (v) => (n > 1 ? (v / (n - 1)) * 100 : 0);
  pzGrid.style.gridTemplateColumns = `repeat(${n},1fr)`;
  pzGrid.innerHTML = pz.order.map((id, slot) =>
    `<div class="piece ${id === slot ? 'ok' : ''}" data-slot="${slot}" style="background-image:url(${IMG(pz.item[0])});background-size:${n * 100}% ${n * 100}%;background-position:${pos(id % n)}% ${pos(Math.floor(id / n))}%"></div>`).join('');
};

pzGrid.addEventListener('pointerdown', (e) => {
  const p = e.target.closest('.piece');
  if (!p || pz.o) return;
  pz.o = { p, x: e.clientX, y: e.clientY };
  pzGrid.setPointerCapture(e.pointerId);
  p.classList.add('dragging');
  sfx.pop();
});
pzGrid.addEventListener('pointermove', (e) => {
  if (pz.o) pz.o.p.style.transform = `translate(${e.clientX - pz.o.x}px,${e.clientY - pz.o.y}px) scale(1.08)`;
});
const pzEnd = (e) => {
  if (!pz.o) return;
  const { p } = pz.o, from = +p.dataset.slot;
  pz.o = null;
  const to = [...pzGrid.children].findIndex((c) => c !== p && inRect(c.getBoundingClientRect(), e.clientX, e.clientY));
  if (to >= 0) {
    [pz.order[from], pz.order[to]] = [pz.order[to], pz.order[from]];
    pz.swaps++;
  }
  drawPuzzle();
  if (pz.order.every((v, i) => v === i)) {
    pz.score += 30;
    right(pzGrid, `Yeay! Gambar ${pz.item[1]} selesai!`, 30);
    setTimeout(nextPuzzle, 1900);
  }
};
pzGrid.addEventListener('pointerup', pzEnd);
pzGrid.addEventListener('pointercancel', pzEnd);

// ---------- Tulis Angka (telusuri angka dengan jari) ----------
const tr = { round: 0, total: 6, score: 0, miss: 0, n: 1, size: 0, mask: null, last: null, done: false };
const trGuide = $('#tr-guide'), trDraw = $('#tr-draw');
const trFont = (c, s) => { c.font = `${s * 0.9}px 'Lilita One', 'Fredoka', sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; };

START.trace = () => {
  Object.assign(tr, { round: 0, score: 0, miss: 0 });
  show('trace');
  nextTrace();
};

const nextTrace = async () => {
  if (tr.round >= tr.total) return finish('trace', tr.score, tr.miss, rate(tr.miss, [1, 4]));
  tr.round++;
  tr.n = 1 + rand(9);
  tr.done = false;
  $('#tr-items').innerHTML = imgs(Array.from({ length: tr.n }, () => pick(ITEMS)));
  hud('trace', `Angka ${tr.round} dari ${tr.total}`, tr.score, ((tr.round - 1) / tr.total) * 100);
  try { await document.fonts.load("100px 'Lilita One'"); } catch (e) {}
  const s = (tr.size = $('#tr-box').clientWidth), y = s * 0.54;
  [trGuide, trDraw].forEach((c) => { c.width = c.height = s; });
  const g = trGuide.getContext('2d');
  trFont(g, s);
  g.fillStyle = '#e2e8f0';
  g.fillText(tr.n, s / 2, y);
  g.setLineDash([s * 0.03, s * 0.03]);
  g.lineWidth = s * 0.012;
  g.strokeStyle = '#64748b';
  g.strokeText(tr.n, s / 2, y);
  const m = document.createElement('canvas').getContext('2d'); // mask untuk menghitung cakupan coretan
  m.canvas.width = m.canvas.height = s;
  trFont(m, s);
  m.fillText(tr.n, s / 2, y);
  tr.mask = m.getImageData(0, 0, s, s).data;
};

const trScore = () => {
  const d = trDraw.getContext('2d').getImageData(0, 0, tr.size, tr.size).data;
  let m = 0, c = 0, t = 0, o = 0;
  for (let i = 3; i < d.length; i += 16) { // contoh tiap 4 piksel
    const inMask = tr.mask[i] > 128, drawn = d[i] > 128;
    if (inMask) { m++; if (drawn) c++; }
    if (drawn) { t++; if (!inMask) o++; }
  }
  return { cover: m ? c / m : 0, spill: t ? o / t : 1 };
};

const trClear = () => trDraw.getContext('2d').clearRect(0, 0, tr.size, tr.size);
const trResult = (ok) => {
  if (tr.done) return;
  if (ok) {
    tr.done = true;
    tr.score += 10;
    right($('#tr-box'), `Hebat! Angka ${tr.n}`, 10);
    hud('trace', `Angka ${tr.round} dari ${tr.total}`, tr.score, (tr.round / tr.total) * 100);
    setTimeout(nextTrace, 1800);
  } else {
    tr.miss++;
    wrong('Tetot! Ikuti garis putus-putus ya');
    trClear();
  }
};

const trPt = (e) => { const r = trDraw.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
trDraw.addEventListener('pointerdown', (e) => {
  if (tr.done) return;
  trDraw.setPointerCapture(e.pointerId);
  tr.last = trPt(e);
  const c = trDraw.getContext('2d');
  c.lineCap = c.lineJoin = 'round';
  c.lineWidth = tr.size * 0.11;
  c.strokeStyle = '#ff8a3d';
  c.beginPath();
  c.moveTo(...tr.last);
  c.lineTo(tr.last[0] + 0.1, tr.last[1]);
  c.stroke();
});
trDraw.addEventListener('pointermove', (e) => {
  if (!tr.last) return;
  const c = trDraw.getContext('2d'), p = trPt(e);
  c.beginPath();
  c.moveTo(...tr.last);
  c.lineTo(...p);
  c.stroke();
  tr.last = p;
});
const trUp = () => {
  if (!tr.last) return;
  tr.last = null;
  const { cover, spill } = trScore();
  if (cover >= 0.8 && spill < 0.5) trResult(true);
};
trDraw.addEventListener('pointerup', trUp);
trDraw.addEventListener('pointercancel', trUp);
$('#tr-clear').addEventListener('click', trClear);
$('#tr-check').addEventListener('click', () => { const { cover, spill } = trScore(); trResult(cover >= 0.7 && spill < 0.55); });
