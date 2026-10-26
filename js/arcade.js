// Game arcade 30 detik: tangkap sampah (geser sapi kiri-kanan) & sapi berlari (geser jalur atas-bawah)
// Tiap game mendefinisikan: size, place, point, spawn, hit, gone. Target jenis sampah berganti tiap 10 detik.
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const arc = { id: '', def: null, area: null, cow: null, score: 0, miss: 0, left: 0, target: 'o', items: [], wait: 0, last: 0, paused: false, over: false, timer: 0, raf: 0, pos: 0 };

const ARC = {
  catch: {
    gap: 0.85, pos: 0.5,
    size: (W) => ({ s: Math.min(72, W * 0.16), cw: Math.min(130, W * 0.3) }),
    place: (c) => { arc.cow.style.cssText = `width:${c.cw}px;left:${arc.pos * 100}%;bottom:0;translate:-50% 0`; },
    point: (e, r) => { arc.pos = clamp((e.clientX - r.left) / r.width, 0.08, 0.92); },
    spawn: (c, W, H) => ({ x: rand(Math.max(1, W - c.s)), y: -c.s, vx: 0, vy: H * (0.32 + Math.random() * 0.2) }),
    hit: (it, c, W, H) => {
      const mouth = H - c.cw * 1.25 + c.cw * 0.5, low = it.y + c.s * 0.6;
      return low >= mouth && low < mouth + c.cw * 0.5 && Math.abs(it.x + c.s / 2 - arc.pos * W) < c.cw * 0.5;
    },
    gone: (it, c, W, H) => it.y > H,
  },
  run: {
    gap: 0.95, pos: 1,
    size: (W, H) => ({ s: Math.min(60, (H / 3) * 0.7), cw: Math.min(90, (H / 3) * 0.76) }),
    place: (c, W, H) => { arc.cow.style.cssText = `width:${c.cw}px;left:6%;top:${arc.pos * (H / 3) + (H / 3 - c.cw * 1.25) / 2}px`; },
    point: (e, r) => { arc.pos = clamp(Math.floor(((e.clientY - r.top) / r.height) * 3), 0, 2); },
    spawn: (c, W, H) => {
      const lane = rand(3);
      return { lane, x: W, y: lane * (H / 3) + (H / 3 - c.s) / 2, vx: -(W * 0.3 + Math.random() * W * 0.1) * (1 + (30 - arc.left) / 40), vy: 0 };
    },
    hit: (it, c, W) => it.lane === arc.pos && it.x < W * 0.06 + c.cw && it.x + c.s > W * 0.06 + c.cw * 0.2,
    gone: (it, c) => it.x < -c.s,
  },
};

const setArcTarget = (t) => {
  arc.target = t;
  $(`#${arc.id}-target`).innerHTML = `${arc.id === 'run' ? 'Kumpulkan' : 'Tangkap'} sampah ${chip(t)}`;
  arc.cow.innerHTML = cowSVG(t);
  animate($(`#${arc.id}-target`), 'pop', 500);
};

const arcHud = () => hud(arc.id, 'Geser untuk bergerak!', arc.score, ((30 - arc.left) / 30) * 100, `${img('timer-clock')}${arc.left}`);

const arcCaught = (it) => {
  it.el.remove();
  if (it.type === arc.target) {
    arc.score++;
    animate(arc.cow, 'happy', 500);
    right(arc.cow, 'Yeay!', 1);
  } else {
    arc.miss++;
    animate(arc.cow, 'shake', 500);
    wrong('Tetot! Bukan itu');
  }
  arcHud();
};

const arcLoop = (t) => {
  if (arc.over) return;
  const dt = Math.min(0.05, (t - arc.last) / 1000);
  arc.last = t;
  if (!arc.paused) {
    const d = arc.def, W = arc.area.clientWidth, H = arc.area.clientHeight, c = d.size(W, H);
    d.place(c, W, H);
    if ((arc.wait -= dt) <= 0) {
      arc.wait = d.gap;
      const it = Math.random() < 0.5 ? pick(itemsOf(arc.target)) : pick(ITEMS), el = document.createElement('div');
      el.className = 'cdrop';
      el.style.width = c.s + 'px';
      el.innerHTML = img(it[0]);
      arc.area.append(el);
      arc.items.push({ el, type: it[2], ...d.spawn(c, W, H) });
    }
    arc.items = arc.items.filter((it) => {
      it.x += it.vx * dt;
      it.y += it.vy * dt;
      it.el.style.transform = `translate(${it.x}px,${it.y}px)`;
      if (d.hit(it, c, W, H)) { arcCaught(it); return false; }
      if (d.gone(it, c, W, H)) { it.el.remove(); return false; }
      return true;
    });
  }
  arc.raf = requestAnimationFrame(arcLoop);
};

const stopArc = () => {
  arc.over = true;
  cancelAnimationFrame(arc.raf);
  clearInterval(arc.timer);
  arc.items.forEach((it) => it.el.remove());
  arc.items = [];
};

const startArc = (id) => {
  show(id);
  Object.assign(arc, { id, def: ARC[id], area: $(`#${id}-area`), cow: $(`#${id}-cow`), score: 0, miss: 0, left: 30, items: [], wait: 0, paused: false, over: false, pos: ARC[id].pos });
  setArcTarget(pick(['o', 'a']));
  arcHud();
  onLeave = stopArc;
  pauseHook = (p) => { arc.paused = p; };
  arc.timer = setInterval(() => {
    if (arc.paused) return;
    arc.left--;
    if (arc.left > 0 && arc.left % 10 === 0) setArcTarget(other(arc.target));
    arcHud();
    if (arc.left <= 0) { stopArc(); finish(id, arc.score, arc.miss, rate(-arc.score, id === 'run' ? [-12, -7] : [-10, -6])); }
  }, 1000);
  arc.last = performance.now();
  arc.raf = requestAnimationFrame(arcLoop);
};

Object.keys(ARC).forEach((id) => {
  START[id] = () => startArc(id);
  const move = (e) => arc.id === id && !arc.over && arc.def.point(e, arc.area.getBoundingClientRect());
  $(`#${id}-area`).addEventListener('pointerdown', move);
  $(`#${id}-area`).addEventListener('pointermove', move);
});
