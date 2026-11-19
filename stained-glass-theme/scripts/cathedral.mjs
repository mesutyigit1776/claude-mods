// Builds the Stained Glass backdrop: seven Gothic lancets in a dark nave, after Sainte-Chapelle.
// Writes ../hooks/scene-cathedral.js. Pass a folder to also write dark.svg and light.svg previews.
//   node scripts/cathedral.mjs [preview-folder]
import { writeFileSync } from 'node:fs'
const OUT = process.argv[2]
const LEAD = '#0a0810'
const f = n => +n.toFixed(1)
let seed = 21
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
const pick = a => a[Math.floor(rnd() * a.length)]
const P = pts => 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z'
const arch = (x, y, w, h) => { const s = w * 0.866; return `M${x} ${y + h}V${f(y + s)}A${w} ${w} 0 0 1 ${x + w / 2} ${y}A${w} ${w} 0 0 1 ${x + w} ${f(y + s)}V${y + h}Z` }

// ---- palette: medieval pot-metal glass --------------------------------
const FLEUR = 'M0 -9C3 -5 3 -2 0 2C-3 -2 -3 -5 0 -9ZM0 2C4 -1 8 -1 9 3C6 2 3 3 1 5ZM0 2C-4 -1 -8 -1 -9 3C-6 2 -3 3 -1 5ZM-5 5H5V7H-5ZM-1.5 7H1.5L0 11Z'
const CASTLE = 'M-8 8V-2H-9V-7H-6V-4H-3V-7H3V-4H6V-7H9V-2H8V8Z'
const RUBY = ['#9e0f2a', '#b8162f', '#8a0b24', '#c22a3a', '#a3122f']
const COBALT = ['#173a9e', '#1d47b8', '#122f86', '#2456c8', '#1a40a8']

// ---- medallion shapes (local radius ~100) -----------------------------
const SH = {
  c: 'M-100 0a100 100 0 1 0 200 0a100 100 0 1 0 -200 0Z',
  q: 'M50 -50A50 50 0 1 1 50 50A50 50 0 1 1 -50 50A50 50 0 1 1 -50 -50A50 50 0 1 1 50 -50Z',
  // barbed quatrefoil: a square with four lobes
  b: 'M-58 -58H-36A36 36 0 0 1 36 -58H58V-36A36 36 0 0 1 58 36V58H36A36 36 0 0 1 -36 58H-58V36A36 36 0 0 1 -58 -36Z',
  l: 'M0 -100L80 0L0 100L-80 0Z',
}
const shards = (cols, n) => {
  let s = `<rect x="-110" y="-110" width="220" height="220" fill="${cols[0]}"/>`
  for (let i = 0; i < n; i++) {
    const cx = -100 + rnd() * 200, cy = -100 + rnd() * 200, r = 30 + rnd() * 40, a = rnd() * 6.28
    s += `<path d="${P([0, 1, 2].map(k => [cx + r * Math.cos(a + k * 2.1 + rnd() * .5), cy + r * Math.sin(a + k * 2.1 + rnd() * .5)]))}" fill="${pick(cols)}"/>`
  }
  // a few lead lines through the ground glass
  let d = ''
  for (let i = 0; i < 4; i++) { const a = rnd() * 6.28, b = a + 1.4 + rnd() * 2; d += `M${f(110 * Math.cos(a))} ${f(110 * Math.sin(a))}L${f(110 * Math.cos(b))} ${f(110 * Math.sin(b))}` }
  return s + `<path d="${d}" stroke="${LEAD}" stroke-width="2" fill="none"/>`
}
// Non-figurative medallion fills: eight families of ornament, varied by count and colour,
// so no two medallions are the same.
let story = 0
const JEWEL = ['#2456c8', '#c22a3a', '#e8b021', '#2e9b5a', '#7b3fc4', '#ece6d6', '#3fb0e0', '#f08a24']
const ring = (n, r, fn) => Array.from({ length: n }, (_, k) => fn((k / n) * 6.2832 - 1.5708, k)).join('')
const pt = (a, r) => `${f(r * Math.cos(a))} ${f(r * Math.sin(a))}`
const L = `stroke="${LEAD}" stroke-width="2.6" stroke-linejoin="round"`

const FAMILIES = [
  // star in a ring
  (n, c) => `<circle r="86" fill="${c[3]}"/>` + `<path d="M${ring(n * 2, 0, (a, k) => pt(a, k % 2 ? 34 : 80) + 'L').slice(0, -1)}Z" fill="${c[0]}"/>` +
    ring(n, 0, a => `<path d="M0 0L${pt(a, 80)}"/>`) + `<circle r="26" fill="${c[1]}"/>` + `<circle r="10" fill="${c[2]}"/>`,
  // rosette of petals
  (n, c) => ring(n, 0, (a, k) => {
    const w = 0.5 * 6.2832 / n
    return `<path d="M0 0Q${pt(a - w, 60)} ${pt(a, 86)}Q${pt(a + w, 60)} 0 0Z" fill="${c[k % 2]}"/><circle cx="${f(70 * Math.cos(a + w))}" cy="${f(70 * Math.sin(a + w))}" r="7" fill="${c[3]}"/>`
  }) + `<circle r="20" fill="${c[2]}"/>`,
  // interlaced circles
  (n, c) => ring(n, 0, (a, k) => `<circle cx="${f(42 * Math.cos(a))}" cy="${f(42 * Math.sin(a))}" r="42" fill="${c[k % 3]}" fill-opacity=".8"/>`) +
    `<circle r="42" fill="none"/><circle r="18" fill="${c[3]}"/>` + ring(n, 0, a => `<circle cx="${f(84 * Math.cos(a))}" cy="${f(84 * Math.sin(a))}" r="6" fill="${c[2]}"/>`),
  // heraldic shield: fleur-de-lis or castle
  (n, c) => `<path d="M-48 -56H48V-4C48 34 20 54 0 70C-20 54 -48 34 -48 -4Z" fill="${n % 2 ? '#1a40a8' : '#a3122f'}"/>` +
    `<path transform="translate(0 2) scale(${n % 2 ? 4.4 : 3.6})" d="${n % 2 ? FLEUR : CASTLE}" fill="#e8b021" stroke="${LEAD}" stroke-width=".6"/>` +
    ring(n + 6, 0, (a, k) => `<circle cx="${f(84 * Math.cos(a))}" cy="${f(84 * Math.sin(a))}" r="8" fill="${c[k % 2 ? 2 : 5]}"/>`),
  // foliate cross
  (n, c) => ring(n, 0, (a, k) => `<path d="M0 0Q${pt(a - .5, 50)} ${pt(a, 88)}Q${pt(a + .5, 50)} 0 0Z" fill="${k % 2 ? '#3fa868' : '#2e9b5a'}"/><path d="M0 0L${pt(a, 80)}" stroke="${LEAD}" stroke-width="1.6"/>`) +
    ring(4, 0, a => `<path d="M${pt(a - .2, 0)}L${pt(a - .16, 74)}L${pt(a + .16, 74)}Z" fill="${c[0]}"/>`) + `<circle r="22" fill="${c[1]}"/><circle r="9" fill="${c[2]}"/>`,
  // concentric jewel rings
  (n, c) => [86, 62, 38].map((r, j) => ring(n + j * 2, 0, (a, k) => {
    const w = 6.2832 / (n + j * 2)
    return `<path d="M0 0L${pt(a, r)}A${r} ${r} 0 0 1 ${pt(a + w, r)}Z" fill="${c[(k + j) % 4]}"/>`
  })).join('') + `<circle r="16" fill="#ece6d6"/>`,
  // cross pattée in a ring of roundels
  (n, c) => ring(n + 4, 0, (a, k) => `<circle cx="${f(74 * Math.cos(a))}" cy="${f(74 * Math.sin(a))}" r="14" fill="${c[k % 2 ? 1 : 2]}"/>`) +
    ring(4, 0, a => `<path d="M0 0L${pt(a - .42, 64)}Q${pt(a, 52)} ${pt(a + .42, 64)}Z" fill="${c[0]}"/>`) + `<circle r="16" fill="${c[3]}"/>`,
  // sun with flame rays
  (n, c) => ring(n * 2, 0, (a, k) => `<path d="M${pt(a - .16, 40)}Q${pt(a + .12, 66)} ${pt(a, k % 2 ? 70 : 88)}Q${pt(a - .06, 62)} ${pt(a + .16, 40)}Z" fill="${k % 2 ? '#f08a24' : '#f6d24a'}"/>`) +
    `<circle r="40" fill="${c[1]}"/>` + ring(n, 0, a => `<path d="M0 0L${pt(a, 40)}" stroke="${LEAD}" stroke-width="1.6"/>`) + `<circle r="16" fill="#fff0b0"/>`,
]
const COUNTS = [6, 8, 5, 10, 7, 12]
const scene = red => {
  const k = story++
  const fam = k % 8, n = COUNTS[(Math.floor(k / 8) + fam) % COUNTS.length]
  const off = (k * 3) % JEWEL.length
  let c = [0, 1, 2, 3].map(j => JEWEL[(off + j * 2) % JEWEL.length])
  // keep the ornament from vanishing into its ground
  const ground = red ? '#c22a3a' : '#2456c8'
  c = c.map(x => (x === ground ? '#e8b021' : x))
  return shards(red ? RUBY : COBALT, 10) + `<g ${L}>` + FAMILIES[fam](n, c) + '</g>'
}

const medallion = (shape, cx, cy, r, red) => {
  const sc = r / 100
  return `<g transform="translate(${f(cx)} ${f(cy)}) scale(${f(sc * 1000) / 1000})">` +
    `<g clip-path="url(#m${shape})">${scene(red)}</g>` +
    `<use href="#R${shape}${red ? 'b' : 'r'}"/></g>`
}

// ---- grounds: fleurs-de-lis on blue, castles on red, lattices ----------
const PATS =
  `<pattern id="gF" width="34" height="34" patternUnits="userSpaceOnUse"><rect width="34" height="34" fill="#1a40a8"/><path d="M17 1L33 17L17 33L1 17Z" fill="#173a9e" stroke="${LEAD}" stroke-width="2"/><path transform="translate(17 16)" d="${FLEUR}" fill="#e8b021" stroke="${LEAD}" stroke-width="1"/><circle r="3" fill="#c22a3a" stroke="${LEAD}" stroke-width="1.2"/><circle cx="34" r="3" fill="#c22a3a" stroke="${LEAD}" stroke-width="1.2"/><circle cy="34" r="3" fill="#c22a3a" stroke="${LEAD}" stroke-width="1.2"/><circle cx="34" cy="34" r="3" fill="#c22a3a" stroke="${LEAD}" stroke-width="1.2"/></pattern>` +
  `<pattern id="gK" width="34" height="34" patternUnits="userSpaceOnUse"><rect width="34" height="34" fill="#a3122f"/><path d="M0 0H34V34" fill="none" stroke="${LEAD}" stroke-width="2"/><path transform="translate(17 17)" d="${CASTLE}" fill="#e8b021" stroke="${LEAD}" stroke-width="1.2"/><rect x="-3" y="-3" width="6" height="6" fill="#2456c8" stroke="${LEAD}" stroke-width="1"/><rect x="31" y="31" width="6" height="6" fill="#2456c8" stroke="${LEAD}" stroke-width="1"/><rect x="31" y="-3" width="6" height="6" fill="#2456c8" stroke="${LEAD}" stroke-width="1"/><rect x="-3" y="31" width="6" height="6" fill="#2456c8" stroke="${LEAD}" stroke-width="1"/></pattern>` +
  `<pattern id="gL" width="34" height="34" patternUnits="userSpaceOnUse"><rect width="34" height="34" fill="#1c3fa6"/><path d="M17 3L31 17L17 31L3 17Z" fill="#b0122f" stroke="${LEAD}" stroke-width="2.2"/><path d="M0 0L34 34M34 0L0 34" stroke="${LEAD}" stroke-width="1.4" opacity=".7"/><circle cx="17" cy="17" r="4" fill="#e8b021" stroke="${LEAD}" stroke-width="1.6"/></pattern>` +
  `<pattern id="gV" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#8a0b24"/><path d="M0 20C10 6 30 34 40 20" fill="none" stroke="#2e9b5a" stroke-width="5"/><path d="M0 20C10 6 30 34 40 20" fill="none" stroke="${LEAD}" stroke-width="1.4"/><circle cx="10" cy="10" r="5" fill="#2456c8" stroke="${LEAD}" stroke-width="1.4"/><circle cx="30" cy="30" r="5" fill="#e8b021" stroke="${LEAD}" stroke-width="1.4"/></pattern>` +
  // borders: castles on red, fleurs on blue, alternating with pearls
  `<pattern id="bK" width="15" height="40" patternUnits="userSpaceOnUse"><rect width="15" height="40" fill="#a3122f"/><path transform="translate(7.5 12) scale(.6)" d="${CASTLE}" fill="#e8b021" stroke="${LEAD}" stroke-width="1.4"/><rect y="24" width="15" height="16" fill="#1a40a8"/><circle cx="7.5" cy="32" r="3.5" fill="#ece6d6" stroke="${LEAD}" stroke-width="1.2"/><path d="M0 24H15M0 40H15" stroke="${LEAD}" stroke-width="1.6"/></pattern>` +
  `<pattern id="bF" width="15" height="40" patternUnits="userSpaceOnUse"><rect width="15" height="40" fill="#1a40a8"/><path transform="translate(7.5 11) scale(.62)" d="${FLEUR}" fill="#e8b021" stroke="${LEAD}" stroke-width="1.4"/><rect y="24" width="15" height="16" fill="#a3122f"/><circle cx="7.5" cy="32" r="3.5" fill="#ece6d6" stroke="${LEAD}" stroke-width="1.2"/><path d="M0 24H15M0 40H15" stroke="${LEAD}" stroke-width="1.6"/></pattern>`

// ---- a small rose in each lancet head ---------------------------------
const rosette = (cx, cy, r, i) => {
  // a rose drawn in the glass itself: petals and jewels in fine lead, the same pearl rim as the medallions
  const n = [6, 8, 10, 12, 10, 8, 6][i], red = i % 2 === 1
  const cols = red ? ['#2456c8', '#e8b021'] : ['#c22a3a', '#e8b021']
  const s = r / 100
  let g = `<g transform="translate(${cx} ${cy}) scale(${f(s * 1000) / 1000})"><circle r="100" fill="${red ? '#a3122f' : '#1a40a8'}"/><g stroke="${LEAD}" stroke-width="2.2" stroke-linejoin="round">`
  for (let k = 0; k < n; k++) {
    const a = (k / n) * 6.2832 - 1.5708, w = Math.PI / n
    const p = (t, rr) => `${f(rr * Math.cos(t))} ${f(rr * Math.sin(t))}`
    g += `<path d="M${p(a - w * .9, 24)}Q${p(a - w * 1.1, 70)} ${p(a, 90)}Q${p(a + w * 1.1, 70)} ${p(a + w * .9, 24)}Z" fill="${cols[k % 2]}"/>`
    g += `<circle cx="${f(58 * Math.cos(a))}" cy="${f(58 * Math.sin(a))}" r="${n > 8 ? 8 : 11}" fill="${k % 2 ? '#2e9b5a' : '#ece6d6'}"/>`
  }
  g += `<circle r="24" fill="${red ? '#7b3fc4' : '#2e9b5a'}"/><circle r="10" fill="#f2cc4a"/></g><use href="#Rc${red ? 'r' : 'b'}"/></g>`
  return { g }
}

// ---- the seven lancets, laid out exactly as the current theme -----------
const W = 178, GAP = 34, X0 = (1600 - (7 * W + 6 * GAP)) / 2
const PLAN = [
  { ground: 'gF', border: 'bK', shape: 'c', red: true },
  { ground: 'gK', border: 'bF', shape: 'q', red: false },
  { ground: 'gL', border: 'bK', shape: 'b', red: false },
  { ground: 'gF', border: 'bF', shape: 'c', red: true, pairs: true },
  { ground: 'gV', border: 'bF', shape: 'b', red: false },
  { ground: 'gK', border: 'bK', shape: 'q', red: false },
  { ground: 'gF', border: 'bF', shape: 'c', red: true },
]
let glass = '', clips = '', frames = ''
for (let i = 0; i < 7; i++) {
  const p = PLAN[i]
  const x = X0 + i * (W + GAP)
  const tall = i === 3 ? 0 : i === 2 || i === 4 ? 20 : i === 1 || i === 5 ? 40 : 60
  const y = 30 + tall, h = 950 - tall
  const d = arch(x, y, W, h)
  clips += `<clipPath id="c${i}"><path d="${d}"/></clipPath>`
  let inner = `<rect x="${x}" y="${y}" width="${W}" height="${h}" fill="url(#${p.ground})"/>`
  // medallions: one per level, or two small ones side by side, alternating
  const top = y + 205, R = 64
  let level = 0
  for (let cy = top; cy < y + h + 40; cy += 2 * R + 30, level++) {
    if (p.pairs && level % 2 === 1) {
      inner += medallion('c', x + W / 2 - 38, cy, 34, !p.red) + medallion('c', x + W / 2 + 38, cy, 34, !p.red)
      inner += medallion('l', x + W / 2, cy, 30, p.red)
    } else {
      inner += medallion(p.shape, x + W / 2, cy, R, (level % 2 === 0) === p.red)
    }
    // half-roundels against the border between levels
    const my = cy + R + 15
    inner += `<path d="M${x + 15} ${my - 16}a16 16 0 0 1 0 32Z M${x + W - 15} ${my - 16}a16 16 0 0 0 0 32Z" fill="${p.red ? '#2e9b5a' : '#e8b021'}" stroke="${LEAD}" stroke-width="2.4"/>`
  }
  inner += `<rect x="${x}" y="${y}" width="15" height="${h}" fill="url(#${p.border})"/><rect x="${x + W - 15}" y="${y}" width="15" height="${h}" fill="url(#${p.border})"/>`
  inner += `<path d="M${x + 15} ${y}V${y + h}M${x + W - 15} ${y}V${y + h}" stroke="${LEAD}" stroke-width="3"/>`
  // the rose in the head
  const ro = rosette(x + W / 2, y + 98, 46, i)
  inner += ro.g
  // iron saddle bars
  for (let by = y + 175; by < y + h; by += 158) inner += `<rect x="${x}" y="${by - 2}" width="${W}" height="5" fill="${LEAD}"/>`
  glass += `<g clip-path="url(#c${i})">${inner}</g>`
  frames += `<path class="surround" d="${d}" fill="none" stroke-width="12"/><path d="${d}" fill="none" stroke="${LEAD}" stroke-width="4"/>` +
    `<path class="surround" d="M${x} ${y + 155}H${x + W}" stroke-width="8"/>`
}

const RIMS = Object.entries(SH).map(([k, d]) => ['b', 'r'].map(c => `<g id="R${k}${c}" fill="none"><path d="${d}" stroke="${LEAD}" stroke-width="16"/><path d="${d}" stroke="${c === 'b' ? '#2456c8' : '#c22a3a'}" stroke-width="11"/><path d="${d}" stroke="#ece6d6" stroke-width="4"/><path d="${d}" stroke="${LEAD}" stroke-width="12" stroke-dasharray="2 14"/></g>`).join('')).join('')
const DEFS = PATS + RIMS +
  Object.entries(SH).map(([k, d]) => `<clipPath id="m${k}"><path d="${d}"/></clipPath>`).join('')

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" width="1600" height="1000">
<style>
.nave{fill:url(#nave)}.bloom{opacity:.75}.dim{fill:#07060b;opacity:.35}.surround{stroke:#1a1520}.veil{fill:#fff;opacity:0}.sky{fill:url(#skylight)}
@media (prefers-color-scheme: light){.nave{fill:url(#naveDay)}.bloom{opacity:.28}.dim{opacity:0}.surround{stroke:#b9ad98}.veil{opacity:.1}.sky{fill:url(#skylightDay)}}
</style>
<defs>
${DEFS}
${clips}
<filter id="tex" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.018 0.05" numOctaves="3" seed="11" result="n"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.4 0 0 0 -0.35" result="shade"/>
<feComposite in="shade" in2="SourceGraphic" operator="in" result="shadeIn"/>
<feComponentTransfer in="SourceGraphic" result="lit"><feFuncR type="linear" slope="1.35"/><feFuncG type="linear" slope="1.35"/><feFuncB type="linear" slope="1.35"/></feComponentTransfer>
<feMerge><feMergeNode in="lit"/><feMergeNode in="shadeIn"/></feMerge>
</filter>
<filter id="blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22"/></filter>
<linearGradient id="nave" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0912"/><stop offset=".7" stop-color="#120e1a"/><stop offset="1" stop-color="#07060b"/></linearGradient>
<linearGradient id="skylight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8e0" stop-opacity=".28"/><stop offset=".45" stop-color="#fff8e0" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
<linearGradient id="naveDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9d0bf"/><stop offset=".55" stop-color="#e9e2d4"/><stop offset="1" stop-color="#f1ebdf"/></linearGradient>
<linearGradient id="skylightDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe8" stop-opacity=".3"/><stop offset=".5" stop-color="#fffbe8" stop-opacity=".08"/><stop offset="1" stop-color="#fffbe8" stop-opacity=".12"/></linearGradient>
<clipPath id="allc">${clips.replace(/<clipPath id="c\d">|<\/clipPath>/g, '')}</clipPath>
<g id="glass">${glass}</g>
</defs>
<rect class="nave" x="-800" y="-400" width="3200" height="1800"/>
<use href="#glass" xlink:href="#glass" class="bloom" filter="url(#blur)"/>
<rect class="dim" x="-800" y="-400" width="3200" height="1800"/>
<g filter="url(#tex)"><use href="#glass" xlink:href="#glass"/></g>
<g clip-path="url(#allc)"><rect class="sky" width="1600" height="1000"/><rect class="veil" width="1600" height="1000"/></g>
${frames}
</svg>`

writeFileSync(new URL('../hooks/scene-cathedral.js', import.meta.url), '// Generated by scripts/cathedral.mjs: do not edit by hand.\nexport const CATHEDRAL = `' + SVG + '`\n')
if (OUT) {
  const prev = SVG.replace('xMidYMid slice', 'xMidYMid meet').replace('width="1600" height="1000"', 'width="1600" height="1600"')
  writeFileSync(`${OUT}/dark.svg`, prev.split('\n').filter(l => !l.startsWith('@media')).join('\n'))
  writeFileSync(`${OUT}/light.svg`, prev.split('\n').map(l => l.startsWith('@media') ? l.slice(l.indexOf('{') + 1, -1) : l).join('\n'))
}
console.log('backdrop', SVG.length, 'of 131072 characters,', story, 'medallions')
