// Fungsi umum: layar, HUD, efek, menu, intro, hasil akhir, mesin kuis
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const rand = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const pick = (a) => a[rand(a.length)];
const itemsOf = (t) => ITEMS.filter((x) => x[2] === t);
const other = (t) => (t === 'o' ? 'a' : 'o');
const chip = (t) => `<b class="chip" style="background:${TYPES[t].color}">${TYPES[t].name}</b>`;
const store = {
  get: (k) => { try { return +localStorage.getItem(k) || 0; } catch (e) { return 0; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
};

const GAMES = [
  { id: 'sort', cat: 'g', name: 'Pilah Sampah', desc: 'Seret sampah ke sapi', icon: 'cow-face', c: '#34c759', s: '#1d8a3a', how: 'Seret sampah ke sapi yang tepat. Daun, sisa makanan, dan kertas masuk sapi hijau. Plastik, kaleng, dan botol masuk sapi biru.' },
  { id: 'throw', cat: 'g', name: 'Lempar Sampah', desc: 'Jentik ke arah sapi', icon: 'rocket', c: '#d946ef', s: '#a21caf', how: 'Sentuh sampah, lalu jentikkan jarimu ke atas ke arah sapi yang tepat. Sapinya bergerak, jadi pilih waktu yang pas!' },
  { id: 'catch', cat: 'g', name: 'Tangkap Sampah', desc: 'Geser sapi penangkap', icon: 'basket', c: '#14b8a6', s: '#0b7a6e', how: 'Geser sapi ke kiri dan kanan untuk menangkap sampah yang jatuh sesuai jenis yang diminta. Hati-hati, jangan salah tangkap!' },
  { id: 'run', cat: 'g', name: 'Sapi Berlari', desc: 'Pindah jalur naik-turun', icon: 'person-running', c: '#06b6d4', s: '#0e7490', how: 'Sapi berlari di 3 jalur. Geser jarimu ke atas atau bawah untuk pindah jalur dan kumpulkan sampah yang diminta.' },
  { id: 'line', cat: 'g', name: 'Tarik Garis', desc: 'Hubungkan ke sapi', icon: 'link', c: '#10b981', s: '#047857', how: 'Tekan gambar sampah, tarik garis sampai ke sapi yang tepat, lalu lepaskan.' },
  { id: 'puzzle', cat: 'g', name: 'Susun Gambar', desc: 'Tukar kepingan puzzle', icon: 'framed-picture', c: '#f59e0b', s: '#b45309', how: 'Seret satu kepingan ke kepingan lain agar saling bertukar. Susun sampai gambarnya utuh seperti contoh.' },
  { id: 'trace', cat: 'g', name: 'Tulis Angka', desc: 'Telusuri angka', icon: 'pencil', c: '#ec4899', s: '#a8185f', how: 'Hitung sampahnya, lalu telusuri angka putus-putus dengan jarimu sampai penuh. Tekan Selesai kalau sudah.' },
  { id: 'scratch', cat: 'g', name: 'Gosok & Tebak', desc: 'Gosok layar, tebak jenisnya', icon: 'broom', c: '#78716c', s: '#44403c', how: 'Gosok layar dengan jarimu sampai gambar sampah terlihat, lalu pilih jenisnya: organik atau anorganik.' },
  { id: 'rain', cat: 'g', name: 'Hujan Sampah', desc: 'Ketuk sampah yang jatuh', icon: 'umbrella-with-rain-drops', c: '#38bdf8', s: '#0c7bb5', how: 'Ketuk sampah yang jatuh sesuai jenis yang diminta sebelum waktu 30 detik habis.' },
  { id: 'count', cat: 'k', name: 'Hitung Sampah', desc: 'Ada berapa sampah?', icon: 'input-numbers', c: '#ff9f1c', s: '#b86a00', how: 'Sentuh sampah untuk membantu berhitung, lalu pilih angka yang benar.' },
  { id: 'memory', cat: 'k', name: 'Cari Pasangan', desc: 'Temukan kartu kembar', icon: 'puzzle-piece', c: '#a78bfa', s: '#6d45d6', how: 'Buka dua kartu. Kalau gambarnya kembar, kartu tetap terbuka. Temukan semua pasangan!' },
  { id: 'odd', cat: 'k', name: 'Cari yang Beda', desc: 'Mana yang tidak sejenis?', icon: 'magnifying-glass-tilted-left', c: '#f472b6', s: '#c0247e', how: 'Pilih gambar yang jenisnya berbeda dari yang lain.' },
  { id: 'more', cat: 'k', name: 'Lebih Banyak', desc: 'Mana yang lebih banyak?', icon: 'balance-scale', c: '#fbbf24', s: '#b98200', how: 'Lihat dua kelompok sampah, lalu ketuk kelompok yang jumlahnya lebih banyak.' },
  { id: 'sum', cat: 'k', name: 'Hitung Semua', desc: 'Jumlahkan sampahnya', icon: 'plus', c: '#84cc16', s: '#4d8a00', how: 'Hitung sampah organik dan anorganik, lalu pilih jumlah semuanya.' },
  { id: 'yesno', cat: 'k', name: 'Ya atau Bukan', desc: 'Jenis sampah ini benar?', icon: 'thumbs-up', c: '#ef4444', s: '#a61b1b', how: 'Lihat gambar sampah. Pilih Ya kalau jenisnya sama dengan yang ditanya, pilih Bukan kalau berbeda.' },
  { id: 'shadow', cat: 'k', name: 'Tebak Bayangan', desc: 'Siapa bayangan ini?', icon: 'ghost', c: '#6366f1', s: '#3b3fb5', how: 'Lihat bayangan hitam, lalu pilih gambar sampah yang cocok dengan bentuk bayangannya.' },
  { id: 'pattern', cat: 'k', name: 'Lanjutkan Pola', desc: 'Gambar apa berikutnya?', icon: 'rainbow', c: '#f43f5e', s: '#b01a38', how: 'Perhatikan urutan gambar, lalu pilih gambar yang datang berikutnya.' },
];

// ---------- Layar ----------
let pauseHook = null; // diisi game yang punya timer: (paused) => void
let onLeave = null; // dipanggil saat pindah layar (mis. menghentikan timer)
const stars = (n) => [1, 2, 3].map((i) => img('star', i <= n ? '' : 'off')).join('');
const totalStars = () => GAMES.reduce((a, g) => a + store.get('stars_' + g.id), 0);

const show = (id) => {
  if (onLeave) onLeave();
  onLeave = pauseHook = null;
  sfx.stop();
  $$('.screen').forEach((s) => s.classList.toggle('hidden', s.id !== id));
  $$('.overlay').forEach((o) => o.classList.add('hidden'));
  window.scrollTo(0, 0);
  ({ home: renderHome, menu: renderMenu, howto: renderHowto, scores: renderScores })[id]?.();
};

const renderHome = () => { $('#home-stars').innerHTML = `${img('star')}${totalStars()} / ${GAMES.length * 3}`; };

let menuTab = 'all';
const renderMenu = () => {
  $$('.tab').forEach((t) => t.classList.toggle('on', t.dataset.tab === menuTab));
  $('#menu-grid').innerHTML = GAMES.filter((g) => menuTab === 'all' || g.cat === menuTab).map((g, i) => `
    <button data-go="${g.id}" class="gcard" style="--c:${g.c};--s:${g.s};--i:${i}">
      <span class="gicon">${img(g.icon)}</span>
      <span class="gname">${g.name}</span>
      <span class="gdesc">${g.desc}</span>
      <span class="gstars">${stars(store.get('stars_' + g.id))}</span>
    </button>`).join('');
};

const renderHowto = () => {
  $('#howto-list').innerHTML = GAMES.map((g) => `<div class="panel how"><span class="gicon" style="--c:${g.c}">${img(g.icon)}</span><div><h3>${g.name}</h3><p>${g.how}</p></div></div>`).join('');
};

const renderScores = () => {
  $('#scores-list').innerHTML = GAMES.map((g) => `<div class="panel score"><span class="gicon" style="--c:${g.c}">${img(g.icon)}</span><b>${g.name}</b><span class="gstars">${stars(store.get('stars_' + g.id))}</span><span class="pill">${img('trophy')}${store.get('best_' + g.id)}</span></div>`).join('');
};

const hudHTML = (id) => `
  <button data-go="menu" class="pill home back-pill" aria-label="Kembali ke pilihan game">${img('left-arrow')}<span>Kembali</span></button>
  <button data-go="pause" class="pill home" aria-label="Jeda">${img('pause-button')}</button>
  <div class="flex-1 min-w-0"><div class="bar"><i id="${id}-bar"></i></div><p id="${id}-count" class="hud-text"></p></div>
  <div class="pill">${img('star')}<span id="${id}-score">0</span></div>
  <div class="pill" id="${id}-extra"></div>`;

const hud = (id, label, score, pct, extra = '') => {
  $(`#${id}-count`).textContent = label;
  $(`#${id}-score`).textContent = score;
  $(`#${id}-bar`).style.width = pct + '%';
  $(`#${id}-extra`).innerHTML = extra;
};

// ---------- Efek ----------
const toast = (text, ok) => {
  const el = $('#toast');
  el.textContent = text;
  el.className = 'toast show ' + (ok ? 'good' : 'bad');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 1500);
};

const animate = (el, cls, ms = 600) => {
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
};

const spawnFx = (el, html, cls, style = '', ms = 1300) => {
  const r = el.getBoundingClientRect(), s = document.createElement('span');
  s.className = cls;
  s.innerHTML = html;
  s.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;${style}`;
  $('#fx').append(s);
  setTimeout(() => s.remove(), ms);
};

const confetti = (el, n = 16) => {
  for (let i = 0; i < n; i++) {
    spawnFx(el, img(pick(['star', 'sparkles', 'glowing-star', 'party-popper', 'red-heart'])), 'confetti',
      `--dx:${(Math.random() - 0.5) * 380}px;--dy:${-80 - Math.random() * 240}px;--r:${rand(720) - 360}deg`);
  }
};

const right = (el, text, pts) => {
  sfx.yeay();
  confetti(el);
  if (pts) spawnFx(el, '+' + pts, 'floaty', '', 1000);
  toast(text || pick(['Yeay! Benar!', 'Hore, pintar!', 'Hebat sekali!']), true);
};
const wrong = (text) => { sfx.tetot(); toast(text || 'Tetot! Coba lagi ya', false); };

// ---------- Intro, jeda & hasil ----------
let lastGame = 'sort';
const openIntro = (id) => {
  const g = GAMES.find((x) => x.id === id);
  lastGame = id;
  $('#intro-icon').style.setProperty('--c', g.c);
  $('#intro-icon').innerHTML = img(g.icon);
  $('#intro-name').textContent = g.name;
  $('#intro-how').textContent = g.how;
  $('#intro').classList.remove('hidden');
  sfx.pop();
};

const setPause = (p) => {
  $('#pause').classList.toggle('hidden', !p);
  if (pauseHook) pauseHook(p);
};

const rate = (v, [a, b]) => (v <= a ? 3 : v <= b ? 2 : 1); // 3 bintang bila v <= a, 2 bintang bila v <= b
const finish = (id, score, miss, n) => {
  const best = Math.max(store.get('best_' + id), score);
  store.set('best_' + id, best);
  store.set('stars_' + id, Math.max(store.get('stars_' + id), n));
  lastGame = id;
  $('#m-stars').innerHTML = [1, 2, 3].map((i) => `<span class="star ${i <= n ? '' : 'off'}" style="animation-delay:${i * 0.25}s">${img('star')}</span>`).join('');
  $('#m-title').textContent = ['Ayo Coba Lagi!', 'Bagus Sekali!', 'Hebat Sekali!'][n - 1];
  $('#m-info').innerHTML = `Skor <b>${score}</b> &nbsp;|&nbsp; Salah ${miss}x<br><span class="gbest inline-flex">${img('trophy')}Terbaik ${best}</span>`;
  $('#modal').classList.remove('hidden');
  sfx.yeay();
  confetti($('#m-stars'), 30);
};

// ---------- Mesin kuis ----------
// QUIZ[id].make(ronde) -> { cow, q, field, tip, cols, cheer, opts: [{ html, ok, cls }] } (didefinisikan di quiz.js)
const QUIZ = {};
const quiz = { id: '', round: 0, total: 8, score: 0, miss: 0, tries: 0, locked: false, cur: null, tapped: 0 };

const startQuiz = (id) => {
  Object.assign(quiz, { id, round: 0, score: 0, miss: 0 });
  show('quiz');
  nextRound();
};

const nextRound = () => {
  if (quiz.round >= quiz.total) return finish(quiz.id, quiz.score, quiz.miss, rate(quiz.miss, [1, 4]));
  quiz.round++;
  Object.assign(quiz, { tries: 0, locked: false, tapped: 0 });
  const r = (quiz.cur = QUIZ[quiz.id].make(quiz.round));
  $('#q-cow').innerHTML = cowSVG(r.cow);
  $('#q-text').innerHTML = r.q;
  $('#field').innerHTML = r.field || '';
  $('#field').classList.toggle('hidden', !r.field);
  r.init?.();
  $('#q-tip').textContent = r.tip;
  $('#opts').className = 'grid gap-3 ' + r.cols;
  $('#opts').innerHTML = r.opts.map((o, i) => `<button class="opt btn3d ${o.cls}" data-i="${i}">${o.html}</button>`).join('');
  hud('quiz', `Soal ${quiz.round} dari ${quiz.total}`, quiz.score, ((quiz.round - 1) / quiz.total) * 100);
};

$('#field').addEventListener('click', (e) => { // ketuk sampah untuk membantu berhitung
  const it = e.target.closest('.it');
  if (!it || it.classList.contains('on')) return;
  it.classList.add('on');
  it.insertAdjacentHTML('beforeend', `<i class="badge">${++quiz.tapped}</i>`);
  sfx.pop();
});

$('#opts').addEventListener('click', (e) => {
  const btn = e.target.closest('.opt');
  if (!btn || btn.disabled || quiz.locked) return;
  quiz.tries++;
  if (quiz.cur.opts[btn.dataset.i].ok) {
    const pts = quiz.tries === 1 ? 10 : 5;
    quiz.locked = true;
    quiz.score += pts;
    btn.classList.add('ok');
    $$('#opts .opt').forEach((b) => { b.disabled = true; });
    $$(`#field .it[data-type="${quiz.cur.cheer}"]`).forEach((x) => animate(x, 'cheer', 900));
    $('#field .shadow, #field .scratch')?.classList.add('reveal');
    right(btn, '', pts);
    hud('quiz', `Soal ${quiz.round} dari ${quiz.total}`, quiz.score, (quiz.round / quiz.total) * 100);
    setTimeout(nextRound, 1900);
  } else {
    quiz.miss++;
    btn.disabled = true;
    btn.classList.add('bad');
    animate(btn, 'shake', 500);
    wrong();
  }
});

// ---------- Navigasi & pengaturan ----------
const START = {}; // diisi di quiz.js / games.js: START[id]()
const go = (to) => {
  if (to === 'pause' || to === 'resume') return setPause(to === 'pause');
  if (to === 'again' || to === 'start') return START[lastGame]();
  if (START[to]) return openIntro(to);
  show(to);
};

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-go]');
  if (!b) return;
  sfx.pop();
  go(b.dataset.go);
});
$$('.tab').forEach((t) => t.addEventListener('click', () => { menuTab = t.dataset.tab; sfx.pop(); renderMenu(); }));
$('#btn-reset').addEventListener('click', () => {
  if (!confirm('Hapus semua skor dan bintang?')) return;
  GAMES.forEach((g) => { store.set('best_' + g.id, 0); store.set('stars_' + g.id, 0); });
  renderScores();
});
$('#btn-sound').addEventListener('click', (e) => { e.currentTarget.innerHTML = img(sfx.toggle() ? 'speaker-high-volume' : 'muted-speaker'); });

// ---------- Dekorasi latar ----------
$('#bg').insertAdjacentHTML('beforeend',
  Array.from({ length: 18 }, (_, i) => `<img src="${IMG(pick(['sunflower', 'tulip', 'blossom', 'hibiscus', 'cherry-blossom']))}" class="flower" alt="" style="left:${i * 5.6 + rand(3)}%;bottom:${rand(5) - 1}%;animation-delay:-${rand(30) / 10}s">`).join('') +
  Array.from({ length: 3 }, (_, i) => `<img src="${IMG(i === 1 ? 'honeybee' : 'butterfly')}" class="fly" alt="" style="top:${22 + i * 14}%;--d:${22 + i * 9}s;animation-delay:-${i * 8}s">`).join(''));
