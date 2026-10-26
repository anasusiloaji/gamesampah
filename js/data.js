// Data sampah & gambar sapi. Format item: [nama file gambar di assets/img, nama, tipe] (o = organik, a = anorganik)
const IMG = (n) => `assets/img/${n}.svg`;
const img = (n, cls = '') => `<img src="${IMG(n)}" alt="" draggable="false" class="${cls}">`;

const TYPES = {
  o: { name: 'Organik', color: '#22c55e', dark: '#15803d', spot: '#9a6a3c', icon: 'seedling' },
  a: { name: 'Anorganik', color: '#38bdf8', dark: '#0369a1', spot: '#7c8aa5', icon: 'recycling-symbol' },
};

const ITEMS = [
  ['fallen-leaf', 'Daun kering', 'o'], ['leaf-fluttering-in-wind', 'Daun hijau', 'o'], ['wood', 'Ranting kayu', 'o'], ['banana', 'Sisa pisang', 'o'],
  ['red-apple', 'Sisa apel', 'o'], ['leafy-green', 'Sayur layu', 'o'], ['egg', 'Cangkang telur', 'o'], ['bread', 'Roti basi', 'o'],
  ['carrot', 'Sisa wortel', 'o'], ['page-facing-up', 'Kertas', 'o'], ['newspaper', 'Koran bekas', 'o'], ['ear-of-corn', 'Tongkol jagung', 'o'],
  ['watermelon', 'Kulit semangka', 'o'], ['wilted-flower', 'Bunga layu', 'o'], ['tangerine', 'Kulit jeruk', 'o'], ['potato', 'Kulit kentang', 'o'],
  ['cup-with-straw', 'Gelas plastik', 'a'], ['baby-bottle', 'Botol minum', 'a'], ['bottle-with-popping-cork', 'Botol kaca', 'a'], ['lotion-bottle', 'Botol plastik', 'a'],
  ['shopping-bags', 'Kantong plastik', 'a'], ['canned-food', 'Kaleng', 'a'], ['battery', 'Baterai bekas', 'a'], ['thong-sandal', 'Sandal bekas', 'a'],
  ['toothbrush', 'Sikat gigi', 'a'], ['beverage-box', 'Kemasan minuman', 'a'], ['light-bulb', 'Lampu bekas', 'a'], ['takeout-box', 'Wadah plastik', 'a'],
  ['bucket', 'Ember plastik', 'a'], ['radio', 'Radio rusak', 'a'],
];

// Sapi = tempat sampah. Mulutnya terbuka saat sampah didekatkan (class .open pada .cow)
const cowSVG = (t) => {
  const { name, color, dark, spot, icon } = TYPES[t];
  const ink = '#2b2457', line = `stroke="${ink}" stroke-width="5" stroke-linejoin="round"`;
  return `<svg viewBox="0 0 200 250" role="img" aria-label="Sapi ${name}" class="block w-full h-auto overflow-visible">
  <ellipse cx="100" cy="240" rx="78" ry="8" fill="#0003"/>
  <path d="M60 34 Q46 4 76 8 Q78 24 82 36Z" fill="#fde68a" ${line}/>
  <path d="M140 34 Q154 4 124 8 Q122 24 118 36Z" fill="#fde68a" ${line}/>
  <ellipse cx="20" cy="72" rx="23" ry="13" transform="rotate(-20 20 72)" fill="#fff" ${line}/>
  <ellipse cx="180" cy="72" rx="23" ry="13" transform="rotate(20 180 72)" fill="#fff" ${line}/>
  <ellipse cx="22" cy="72" rx="12" ry="6" transform="rotate(-20 22 72)" fill="#ffb3c4"/>
  <ellipse cx="178" cy="72" rx="12" ry="6" transform="rotate(20 178 72)" fill="#ffb3c4"/>
  <circle cx="68" cy="232" r="9" fill="${ink}"/><circle cx="132" cy="232" r="9" fill="${ink}"/>
  <path d="M42 140 H158 L147 226 Q100 238 53 226Z" fill="${color}" ${line}/>
  <path d="M52 148 H70 L66 218 L58 217Z" fill="#fff" opacity=".28"/>
  <rect x="34" y="136" width="132" height="16" rx="8" fill="${dark}" ${line}/>
  <rect x="38" y="24" width="124" height="124" rx="56" fill="#fff" ${line}/>
  <path d="M47 74 Q45 38 79 34 Q104 30 98 55 Q90 82 47 74Z" fill="${spot}"/>
  <circle class="eye" cx="74" cy="84" r="10" fill="${ink}"/><circle class="eye" cx="126" cy="84" r="10" fill="${ink}"/>
  <circle cx="77" cy="80" r="3.5" fill="#fff"/><circle cx="129" cy="80" r="3.5" fill="#fff"/>
  <circle cx="56" cy="104" r="8" fill="#ff9db1" opacity=".6"/><circle cx="144" cy="104" r="8" fill="#ff9db1" opacity=".6"/>
  <ellipse cx="100" cy="122" rx="44" ry="27" fill="#ffc2cf" ${line}/>
  <ellipse class="mouth" cx="100" cy="130" rx="22" ry="7" fill="#4a0d1d"/>
  <circle cx="80" cy="111" r="3.5" fill="${ink}"/><circle cx="120" cy="111" r="3.5" fill="${ink}"/>
  <rect x="52" y="160" width="96" height="26" rx="13" fill="#fff" ${line}/>
  <text x="100" y="179" text-anchor="middle" font-size="${name.length > 8 ? 16 : 19}" font-weight="700" fill="${dark}" style="font-family:'Lilita One',sans-serif">${name.toUpperCase()}</text>
  <image href="${IMG(icon)}" x="76" y="188" width="48" height="40"/>
</svg>`;
};
