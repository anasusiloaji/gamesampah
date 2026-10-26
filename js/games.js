// Game aksi: pilah (drag & drop), hujan sampah, cari pasangan
// ---------- Pilah Sampah (drag & drop) ----------
const sort = { queue: [], i: 0, score: 0, combo: 0, miss: 0, busy: false, dx: 0, dy: 0 };
const drag = $('#drag');
let origin = null;

START.sort = () => {
  const half = (t) => shuffle(itemsOf(t)).slice(0, 5);
  Object.assign(sort, { queue: shuffle([...half('o'), ...half('a')]), i: 0, score: 0, combo: 0, miss: 0, busy: false });
  show('sort');
  nextItem();
};

const sortHud = () => hud('sort', `Sampah ${Math.min(sort.i + 1, 10)} dari 10`, sort.score, (sort.i / 10) * 100, `${img('sparkles')}x${sort.combo}`);

const nextItem = () => {
  if (sort.i >= sort.queue.length) return finish('sort', sort.score, sort.miss, rate(sort.miss, [1, 3]));
  const [file, name] = sort.queue[sort.i];
  drag.style.cssText = '';
  drag.innerHTML = img(file);
  animate(drag, 'pop');
  $('#item-name').textContent = name;
  sort.dx = sort.dy = 0;
  sort.busy = false;
  sortHud();
};

const cowAt = (x, y) => [...$$('.cow')].find((c) => {
  const r = c.getBoundingClientRect();
  return x > r.left - 16 && x < r.right + 16 && y > r.top - 16 && y < r.bottom + 16;
});
const openCow = (cow) => $$('.cow').forEach((c) => c.classList.toggle('open', c === cow));

const back = () => {
  drag.style.transition = 'transform .35s cubic-bezier(.3,1.6,.5,1)';
  drag.style.transform = '';
  sort.dx = sort.dy = 0;
};

const judge = (type) => {
  if (sort.busy || $('#sort').classList.contains('hidden')) return;
  const cow = $(`.cow[data-type=${type}]`);
  if (type === sort.queue[sort.i][2]) {
    sort.busy = true;
    sort.combo++;
    const pts = 10 + Math.min(sort.combo - 1, 5) * 2;
    sort.score += pts;
    const a = drag.getBoundingClientRect(), b = cow.getBoundingClientRect();
    drag.style.transition = 'transform .45s ease-in, opacity .45s';
    drag.style.transform = `translate(${sort.dx + b.left + b.width / 2 - (a.left + a.width / 2)}px,${sort.dy + b.top + b.height * 0.4 - (a.top + a.height / 2)}px) scale(.2)`;
    drag.style.opacity = 0;
    animate(cow, 'happy', 700);
    right(cow, '', pts);
    sortHud();
    setTimeout(() => { sort.i++; nextItem(); }, 1300);
  } else {
    sort.combo = 0;
    sort.miss++;
    animate(cow, 'shake', 500);
    animate(drag, 'shake', 500);
    wrong();
    sortHud();
    back();
  }
};

drag.addEventListener('pointerdown', (e) => {
  if (sort.busy) return;
  origin = { x: e.clientX - sort.dx, y: e.clientY - sort.dy };
  drag.setPointerCapture(e.pointerId);
  drag.classList.add('dragging');
  drag.style.transition = 'none';
  sfx.pop();
});
drag.addEventListener('pointermove', (e) => {
  if (!origin) return;
  sort.dx = e.clientX - origin.x;
  sort.dy = e.clientY - origin.y;
  drag.style.transform = `translate(${sort.dx}px,${sort.dy}px) scale(1.15) rotate(${sort.dx / 20}deg)`;
  openCow(cowAt(e.clientX, e.clientY));
});
const drop = (e) => {
  if (!origin) return;
  const cow = e.type === 'pointerup' && cowAt(e.clientX, e.clientY);
  origin = null;
  drag.classList.remove('dragging');
  openCow(null);
  cow ? judge(cow.dataset.type) : back();
};
drag.addEventListener('pointerup', drop);
drag.addEventListener('pointercancel', drop);
$$('.cow').forEach((c) => c.addEventListener('click', () => judge(c.dataset.type))); // alternatif: ketuk sapi

// ---------- Hujan Sampah ----------
const rain = { score: 0, miss: 0, left: 0, target: 'o', timers: [], over: false };
const rainArea = $('#rain-area');

const setTarget = (t) => {
  rain.target = t;
  $('#rain-target').innerHTML = `Ketuk sampah ${chip(t)}`;
  animate($('#rain-target'), 'pop', 500);
};

const rainHud = () => hud('rain', 'Tangkap sebanyak-banyaknya!', rain.score, ((30 - rain.left) / 30) * 100, `${img('timer-clock')}${rain.left}`);

const spawn = () => {
  const it = Math.random() < 0.55 ? pick(itemsOf(rain.target)) : pick(ITEMS);
  const d = document.createElement('button');
  d.className = 'drop';
  d.dataset.type = it[2];
  d.innerHTML = img(it[0]);
  d.style.cssText = `left:${rand(Math.max(1, rainArea.clientWidth - 90))}px;--h:${rainArea.clientHeight + 120}px;animation-duration:${(4 + Math.random() * 2.5).toFixed(1)}s`;
  d.addEventListener('animationend', () => d.remove());
  d.addEventListener('pointerdown', () => hitDrop(d));
  rainArea.append(d);
};

const hitDrop = (d) => {
  if (rain.over || rain.paused || d.classList.contains('hit')) return;
  d.classList.add('hit');
  if (d.dataset.type === rain.target) {
    rain.score++;
    right(d, 'Yeay!', 1);
    setTimeout(() => d.remove(), 250);
  } else {
    rain.miss++;
    wrong('Tetot! Bukan itu');
    setTimeout(() => d.remove(), 250);
  }
  rainHud();
};

const stopRain = () => { rain.timers.forEach(clearInterval); rain.timers = []; rain.over = true; rainArea.querySelectorAll('.drop').forEach((x) => x.remove()); };

START.rain = () => {
  show('rain');
  Object.assign(rain, { score: 0, miss: 0, left: 30, over: false, paused: false });
  setTarget(pick(['o', 'a']));
  rainHud();
  onLeave = stopRain;
  pauseHook = (p) => { rain.paused = p; rainArea.classList.toggle('paused', p); };
  rain.timers.push(setInterval(() => !rain.paused && spawn(), 750), setInterval(() => {
    if (rain.paused) return;
    rain.left--;
    if (rain.left > 0 && rain.left % 10 === 0) setTarget(other(rain.target));
    rainHud();
    if (rain.left <= 0) { stopRain(); finish('rain', rain.score, rain.miss, rate(-rain.score, [-12, -7])); }
  }, 1000));
  spawn();
};

// ---------- Cari Pasangan (memory) ----------
const mem = { open: [], matched: 0, miss: 0, locked: false };

START.memory = () => {
  show('memory');
  const pairs = shuffle(ITEMS).slice(0, 6);
  Object.assign(mem, { open: [], matched: 0, miss: 0, locked: false });
  $('#mem-grid').innerHTML = shuffle([...pairs, ...pairs]).map((it) =>
    `<button class="mcard" data-k="${it[0]}"><span class="in"><span class="face back">${img('cow-face')}</span><span class="face front">${img(it[0])}</span></span></button>`).join('');
  memHud();
};

const memHud = () => hud('memory', `Pasangan ${mem.matched} dari 6`, Math.max(0, mem.matched * 20 - mem.miss * 5), (mem.matched / 6) * 100);

$('#mem-grid').addEventListener('click', (e) => {
  const c = e.target.closest('.mcard');
  if (!c || mem.locked || c.classList.contains('flip')) return;
  c.classList.add('flip');
  sfx.pop();
  mem.open.push(c);
  if (mem.open.length < 2) return;
  const [a, b] = mem.open;
  mem.open = [];
  if (a.dataset.k === b.dataset.k) {
    mem.matched++;
    [a, b].forEach((x) => x.classList.add('done'));
    right(a, 'Yeay! Kartunya kembar!', 20);
    memHud();
    if (mem.matched === 6) setTimeout(() => finish('memory', mem.matched * 20 - mem.miss * 5, mem.miss, rate(mem.miss, [4, 8])), 1500);
  } else {
    mem.miss++;
    mem.locked = true;
    wrong('Tetot! Belum sama');
    memHud();
    setTimeout(() => { [a, b].forEach((x) => x.classList.remove('flip')); mem.locked = false; }, 900);
  }
});

// ---------- Mulai ----------
$$('[data-cow]').forEach((el) => { el.innerHTML = cowSVG(el.dataset.cow); });
$$('[data-hud]').forEach((el) => { el.innerHTML = hudHTML(el.dataset.hud); });
$('#btn-sound').innerHTML = img('speaker-high-volume');
const first = location.hash.slice(1); // buka langsung lewat #id game / layar, mis. index.html#sort
const known = GAMES.some((g) => g.id === first) || [...$$('.screen')].some((s) => s.id === first && s.id !== 'quiz');
known ? go(first) : show('home');
