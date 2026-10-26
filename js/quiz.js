// Game kuis: cukup mendefinisikan QUIZ[id].make(ronde) (mesin kuis ada di core.js)
const numOpts = (answer) => {
  const near = shuffle(Array.from({ length: 12 }, (_, i) => i + 1).filter((x) => x !== answer && Math.abs(x - answer) <= 3)).slice(0, 3);
  return [answer, ...near].sort((a, b) => a - b).map((x) => ({ html: x, ok: x === answer, cls: 'num' }));
};
const itemCard = (it, ok) => ({ html: `${img(it[0])}<span>${it[1]}</span>`, ok, cls: 'card' });
const imgs = (list) => list.map((it) => img(it[0])).join('');
const pileHTML = (t, n) => `${chip(t)}<span class="pile-items">${imgs(Array.from({ length: n }, () => pick(itemsOf(t))))}</span>`;

// ---------- Hitung Sampah ----------
QUIZ.count = {
  make(r) {
    const max = r <= 2 ? 3 : r <= 5 ? 5 : 7;
    const n = { o: 1 + rand(max), a: 1 + rand(max) };
    if (n.o === n.a) n.a = (n.a % max) + 1;
    const ask = pick(['o', 'a']);
    const things = ['o', 'a'].flatMap((t) => Array.from({ length: n[t] }, () => [pick(itemsOf(t)), t]));
    return {
      cow: ask, cheer: ask, cols: 'grid-cols-4',
      q: `Ada berapa sampah ${chip(ask)} ?`,
      tip: 'Sentuh sampah untuk membantu berhitung, lalu pilih angkanya',
      field: shuffle(things).map(([it, t], i) => `<button class="it" data-type="${t}" style="--r:${rand(30) - 15}deg;animation-delay:-${(i * 0.37).toFixed(2)}s">${img(it[0])}</button>`).join(''),
      opts: numOpts(n[ask]),
    };
  },
};

// ---------- Cari yang Beda ----------
QUIZ.odd = {
  make() {
    const t = pick(['o', 'a']);
    const items = [...shuffle(itemsOf(t)).slice(0, 3).map((x) => [x, false]), [pick(itemsOf(other(t))), true]];
    return {
      cow: t, cols: 'grid-cols-2 sm:grid-cols-4',
      q: `Mana yang <u>bukan</u> sampah ${chip(t)} ?`,
      tip: 'Ketuk gambar yang berbeda sendiri',
      opts: shuffle(items).map(([it, ok]) => itemCard(it, ok)),
    };
  },
};

// ---------- Lebih Banyak ----------
QUIZ.more = {
  make(r) {
    const max = r <= 3 ? 4 : r <= 6 ? 6 : 8;
    const n = { o: 1 + rand(max), a: 1 + rand(max) };
    if (n.o === n.a) n.a = (n.a % max) + 1;
    const win = n.o > n.a ? 'o' : 'a';
    return {
      cow: win, cols: 'grid-cols-2',
      q: 'Sampah mana yang <u>lebih banyak</u> ?',
      tip: 'Ketuk kelompok sampah yang jumlahnya lebih banyak',
      opts: shuffle(['o', 'a']).map((t) => ({ html: pileHTML(t, n[t]), ok: t === win, cls: 'pile' })),
    };
  },
};

// ---------- Hitung Semua (penjumlahan) ----------
QUIZ.sum = {
  make(r) {
    const max = r <= 3 ? 3 : r <= 6 ? 4 : 5;
    const a = 1 + rand(max), b = 1 + rand(max);
    return {
      cow: 'o', cols: 'grid-cols-4',
      q: 'Berapa <u>jumlah semua</u> sampah ?',
      tip: 'Hitung semua sampah di kedua kelompok, lalu pilih angkanya',
      field: `<div class="sumrow"><span class="grp">${chip('o')}<span class="pile-items">${imgs(Array.from({ length: a }, () => pick(itemsOf('o'))))}</span></span><i>+</i><span class="grp">${chip('a')}<span class="pile-items">${imgs(Array.from({ length: b }, () => pick(itemsOf('a'))))}</span></span></div>`,
      opts: numOpts(a + b),
    };
  },
};

// ---------- Ya atau Bukan ----------
QUIZ.yesno = {
  make() {
    const t = pick(['o', 'a']), it = pick(ITEMS), yes = it[2] === t;
    return {
      cow: t, cols: 'grid-cols-2',
      q: `Apakah ini sampah ${chip(t)} ?`,
      tip: 'Pilih Ya atau Bukan',
      field: `<div class="bigitem">${img(it[0])}<span>${it[1]}</span></div>`,
      opts: [{ html: 'Ya', ok: yes, cls: 'yn yes' }, { html: 'Bukan', ok: !yes, cls: 'yn no' }],
    };
  },
};

// ---------- Tebak Bayangan ----------
QUIZ.shadow = {
  make() {
    const ans = pick(ITEMS), rest = shuffle(ITEMS.filter((x) => x !== ans)).slice(0, 2);
    return {
      cow: ans[2], cols: 'grid-cols-3',
      q: 'Siapa <u>bayangan</u> ini ?',
      tip: 'Pilih gambar yang bentuknya sama dengan bayangan',
      field: `<div class="bigitem shadow">${img(ans[0])}</div>`,
      opts: shuffle([itemCard(ans, true), ...rest.map((x) => itemCard(x, false))]),
    };
  },
};

// ---------- Lanjutkan Pola ----------
QUIZ.pattern = {
  make(r) {
    const [A, B, C] = shuffle(ITEMS);
    const base = r <= 3 ? [A, B] : r <= 6 ? [A, A, B] : [A, B, C];
    const seq = Array.from({ length: 6 }, (_, i) => base[i % base.length]), ans = base[6 % base.length];
    const wrongs = shuffle([A, B, C, pick(ITEMS)].filter((x) => x !== ans)).filter((x, i, a) => a.indexOf(x) === i).slice(0, 2);
    return {
      cow: ans[2], cols: 'grid-cols-3',
      q: 'Gambar apa yang <u>berikutnya</u> ?',
      tip: 'Perhatikan urutan gambarnya, lalu pilih yang melanjutkan',
      field: `<div class="seq">${imgs(seq)}<span class="qmark">?</span></div>`,
      opts: shuffle([itemCard(ans, true), ...wrongs.map((x) => itemCard(x, false))]),
    };
  },
};

// ---------- Gosok & Tebak (gosok layar dengan jari) ----------
QUIZ.scratch = {
  make() {
    const it = pick(ITEMS);
    return {
      cow: pick(['o', 'a']), cols: 'grid-cols-2',
      q: 'Gosok layar, lalu <u>tebak jenisnya</u> !',
      tip: 'Gosok dengan jarimu sampai gambarnya terlihat',
      field: `<div class="scratch">${img(it[0])}<canvas></canvas></div>`,
      init() {
        const cv = $('#field canvas'), s = cv.parentElement.clientWidth, c = cv.getContext('2d');
        cv.width = cv.height = s;
        c.fillStyle = '#a98254';
        c.fillRect(0, 0, s, s);
        for (let i = 0; i < 70; i++) { c.fillStyle = pick(['#8f6a3f', '#b9925f', '#7d5a33']); c.beginPath(); c.arc(rand(s), rand(s), 4 + rand(14), 0, 7); c.fill(); }
        c.fillStyle = '#fff';
        c.font = `${s * 0.2}px "Lilita One", sans-serif`;
        c.textAlign = 'center';
        c.fillText('GOSOK!', s / 2, s * 0.56);
        c.globalCompositeOperation = 'destination-out';
        const rub = (e) => {
          if (!e.buttons && e.pointerType !== 'touch') return;
          const r = cv.getBoundingClientRect();
          c.beginPath();
          c.arc(e.clientX - r.left, e.clientY - r.top, s * 0.09, 0, 7);
          c.fill();
        };
        cv.addEventListener('pointerdown', rub);
        cv.addEventListener('pointermove', rub);
      },
      opts: ['o', 'a'].map((t) => ({ html: TYPES[t].name, ok: it[2] === t, cls: 'yn t-' + t })),
    };
  },
};

Object.keys(QUIZ).forEach((id) => { START[id] = () => startQuiz(id); });
