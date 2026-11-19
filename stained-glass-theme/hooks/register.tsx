import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Stained glass: sunlit limestone by day, candlelit stone at night,
// with jewel-toned glass for every accent.
const { theme, problems } = makeColors({
  label: 'Stained Glass',
  roles: {
    accent: '#2a6fe0', // cobalt
    danger: '#c8283c', // ruby
    success: '#2e9b5a', // emerald
    warning: '#e0a526', // gold
    pro: '#7b3fc4', // violet
  },
  light: {
    gray: {
      anchors: {
        'surface-0': '#e9e3d6',
        'surface-1': '#efeadf',
        'surface-2': '#f7f3eb',
        'surface-3': '#f7f3eb',
        'text-primary': '#1d1a24',
        'text-secondary': '#433d4c',
        'text-muted': '#5a5363',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#150f2a',
        'surface-1': '#1a1332',
        'surface-2': '#1f1739',
        'surface-3': '#251c42',
        'text-primary': '#f3ecdf',
        'text-secondary': '#d2c8b8',
        'text-muted': '#aca293',
      },
    },
  },
})

// ---- The scene: a wall of tall leaded-glass lancets in a dark nave ---------
// Built from patterns and reused symbols so it stays small, then given a glass
// texture (fractal noise) and a bloom of light spilling onto the stone.

const LEAD = '#0a0810'

// Pointed (equilateral) arch outline.
const arch = (x: number, y: number, w: number, h: number) => {
  const s = w * 0.866
  return `M${x} ${y + h}V${y + s}A${w} ${w} 0 0 1 ${x + w / 2} ${y}A${w} ${w} 0 0 1 ${x + w} ${y + s}V${y + h}Z`
}

// Diamond-lattice grounds: small lozenges of glass with a jewel at each crossing.
const lattice = (id: string, ground: string, diamond: string, dot: string) =>
  `<pattern id="${id}" width="34" height="34" patternUnits="userSpaceOnUse">` +
  `<rect width="34" height="34" fill="${ground}"/>` +
  `<path d="M17 3L31 17L17 31L3 17Z" fill="${diamond}" stroke="${LEAD}" stroke-width="2.2"/>` +
  `<path d="M0 0L34 34M34 0L0 34" stroke="${LEAD}" stroke-width="1.4" opacity=".7"/>` +
  `<circle cx="17" cy="17" r="4" fill="${dot}" stroke="${LEAD}" stroke-width="1.6"/>` +
  `<circle cx="0" cy="0" r="3" fill="${dot}" stroke="${LEAD}" stroke-width="1.4"/><circle cx="34" cy="0" r="3" fill="${dot}" stroke="${LEAD}" stroke-width="1.4"/>` +
  `<circle cx="0" cy="34" r="3" fill="${dot}" stroke="${LEAD}" stroke-width="1.4"/><circle cx="34" cy="34" r="3" fill="${dot}" stroke="${LEAD}" stroke-width="1.4"/>` +
  `</pattern>`

// A beaded border strip down each side of a window.
const BORDER =
  `<pattern id="bead" width="16" height="22" patternUnits="userSpaceOnUse">` +
  `<rect width="16" height="22" fill="#a1122c"/><rect y="0" width="16" height="11" fill="#d9a21e"/>` +
  `<circle cx="8" cy="16.5" r="3.4" fill="#f4ecd2"/><path d="M0 11H16M0 22H16" stroke="${LEAD}" stroke-width="1.6"/></pattern>`

// A quatrefoil medallion: four lobes ringed in lead around a sunburst of glass.
const quatrefoil = (id: string, lobe: string, field: string, a: string, b: string, core: string) => {
  let rays = ''
  const n = 12
  for (let k = 0; k < n; k++) {
    const t0 = (k / n) * Math.PI * 2
    const t1 = ((k + 1) / n) * Math.PI * 2
    const p = (t: number, r: number) => `${(r * Math.cos(t)).toFixed(1)} ${(r * Math.sin(t)).toFixed(1)}`
    rays += `<path d="M0 0L${p(t0, 34)}L${p((t0 + t1) / 2, 40)}L${p(t1, 34)}Z" fill="${k % 2 ? a : b}"/>`
  }
  return (
    `<symbol id="${id}" viewBox="-62 -62 124 124">` +
    `<g stroke="${LEAD}" stroke-width="2.4" stroke-linejoin="round">` +
    `<circle cx="-27" cy="0" r="31" fill="${lobe}"/><circle cx="27" cy="0" r="31" fill="${lobe}"/>` +
    `<circle cx="0" cy="-27" r="31" fill="${lobe}"/><circle cx="0" cy="27" r="31" fill="${lobe}"/>` +
    `<circle r="42" fill="${field}"/>${rays}` +
    `<circle r="14" fill="${core}"/><circle r="6" fill="#fff3c4"/>` +
    `</g>` +
    `<g fill="none" stroke="${LEAD}" stroke-width="5">` +
    `<path d="M-27 -31A31 31 0 0 0 -27 31M27 -31A31 31 0 0 1 27 31M-31 -27A31 31 0 0 1 31 -27M-31 27A31 31 0 0 0 31 27"/>` +
    `<circle r="42"/></g></symbol>`
  )
}

const DEFS =
  lattice('latA', '#1c3fa6', '#b0122f', '#e8b021') +
  lattice('latB', '#a10f2c', '#2153c4', '#f2cc4a') +
  lattice('latC', '#3a1f86', '#1f4fc0', '#e04a5a') +
  BORDER +
  quatrefoil('qA', '#2458c9', '#a3122f', '#e8b021', '#1f8a4c', '#d42a3c') +
  quatrefoil('qB', '#b3122e', '#1d4fb8', '#3f8ff0', '#e8b021', '#7a3fc4') +
  quatrefoil('qC', '#5b2ca0', '#1f8a4c', '#f2cc4a', '#d42a3c', '#2a6fe0')

// Seven lancets, edge to edge, like a wall of glass.
const W = 178
const GAP = 34
const X0 = (1600 - (7 * W + 6 * GAP)) / 2
const LATS = ['latA', 'latB', 'latC', 'latA', 'latB', 'latC', 'latA']
const QS = ['qA', 'qB', 'qC']

let glass = ''
let clips = ''
let frames = ''
for (let i = 0; i < 7; i++) {
  const x = X0 + i * (W + GAP)
  const tall = i === 3 ? 0 : i === 2 || i === 4 ? 20 : i === 1 || i === 5 ? 40 : 60
  const y = 30 + tall
  const h = 950 - tall
  const d = arch(x, y, W, h)
  clips += `<clipPath id="c${i}"><path d="${d}"/></clipPath>`
  let inner = `<rect x="${x}" y="${y}" width="${W}" height="${h}" fill="url(#${LATS[i]})"/>`
  inner += `<rect x="${x}" y="${y}" width="15" height="${h}" fill="url(#bead)"/><rect x="${x + W - 15}" y="${y}" width="15" height="${h}" fill="url(#bead)"/>`
  inner += `<path d="M${x + 15} ${y}V${y + h}M${x + W - 15} ${y}V${y + h}" stroke="${LEAD}" stroke-width="3"/>`
  // medallions stacked down the lancet
  const size = W - 26
  for (let k = 0, cy = y + W * 0.95; cy < y + h - size / 2; k++, cy += size + 26) {
    inner += `<use href="#${QS[(i + k) % 3]}" x="${x + 13}" y="${(cy - size / 2).toFixed(0)}" width="${size}" height="${size}"/>`
  }
  // iron saddle bars
  for (let by = y + W; by < y + h; by += 126) {
    inner += `<rect x="${x}" y="${by}" width="${W}" height="5" fill="${LEAD}"/>`
  }
  glass += `<g clip-path="url(#c${i})">${inner}</g>`
  frames += `<path class="surround" d="${d}" fill="none" stroke-width="12"/><path d="${d}" fill="none" stroke="${LEAD}" stroke-width="4"/>`
}

const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<style>
  /* Night: a dark nave, the glass glowing and spilling light on the stone. */
  .nave{fill:url(#nave)}
  .bloom{opacity:.75}
  .dim{fill:#07060b;opacity:.35}
  .surround{stroke:#1a1520}
  .veil{fill:#fff;opacity:0}
  .sky{fill:url(#skylight)}
  /* Day: sunlit limestone, the glass bright and clear, only a faint glow. */
  @media (prefers-color-scheme: light){
    .nave{fill:url(#naveDay)}
    .bloom{opacity:.28}
    .dim{opacity:0}
    .surround{stroke:#b9ad98}
    .veil{opacity:.1}
    .sky{fill:url(#skylightDay)}
  }
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
  <filter id="soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="5"/></filter>
  <linearGradient id="nave" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0b0912"/><stop offset=".7" stop-color="#120e1a"/><stop offset="1" stop-color="#07060b"/>
  </linearGradient>
  <linearGradient id="skylight" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff8e0" stop-opacity=".28"/><stop offset=".45" stop-color="#fff8e0" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".25"/>
  </linearGradient>
  <linearGradient id="naveDay" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#d9d0bf"/><stop offset=".55" stop-color="#e9e2d4"/><stop offset="1" stop-color="#f1ebdf"/>
  </linearGradient>
  <linearGradient id="skylightDay" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fffbe8" stop-opacity=".3"/><stop offset=".5" stop-color="#fffbe8" stop-opacity=".08"/><stop offset="1" stop-color="#fffbe8" stop-opacity=".12"/>
  </linearGradient>
  <clipPath id="allc">${clips.replace(/<clipPath id="c\d">|<\/clipPath>/g, '')}</clipPath>
  <g id="glass">${glass}</g>
</defs>
<rect class="nave" x="-800" y="-400" width="3200" height="1800"/>
<use href="#glass" xlink:href="#glass" class="bloom" filter="url(#blur)"/>
<rect class="dim" x="-800" y="-400" width="3200" height="1800"/>
<g filter="url(#tex)"><use href="#glass" xlink:href="#glass"/></g>
<g clip-path="url(#allc)">
  <rect class="sky" x="0" y="0" width="1600" height="1000"/>
  <rect class="veil" x="0" y="0" width="1600" height="1000"/>
</g>
${frames}
</svg>`

// Three modes, switched with /glass and remembered across sessions:
//   on    the full look: colours plus the stained-glass windows
//   calm  colours only, no windows (lightest on the Mac)
//   off   the app's own look
type Mode = 'on' | 'calm' | 'off'
const MODES: readonly Mode[] = ['on', 'calm', 'off']

const LOOKS: Record<'on' | 'calm', ThemeSetArgs> = {
  on: { colors: theme, backdrop: { scene: 'stained-glass', glass: { blur: 12, opacity: 0.66 } } },
  calm: { colors: theme },
}

const HELP =
  'Stained Glass theme. /glass on: colours and windows. /glass calm: colours only, no windows. /glass off: the app’s own look. Your choice is remembered.'

type Dollar = EngineInterface

const apply = async ($: Dollar, mode: Mode) => {
  if (mode === 'off') {
    await $.theme.clear()
  } else {
    await $.theme.set(LOOKS[mode])
  }
}

const readMode = async ($: Dollar): Promise<Mode> => {
  const saved = await $.store.get('mode')
  return MODES.includes(saved as Mode) ? (saved as Mode) : 'on'
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    await $.command.register({
      name: 'glass',
      description: 'Stained Glass theme: on, calm (colours only) or off',
      argumentHint: 'on | calm | off',
    })
    await apply($, await readMode($))
    $.ui.status(undefined)

    return next(e)
  })

  on('command.run', { command: 'glass' }, async ($, e) => {
    const want = e.args.trim().toLowerCase()

    if (!MODES.includes(want as Mode)) {
      return { text: `${HELP} Now: ${await readMode($)}.` }
    }
    await $.store.set('mode', want)
    await apply($, want as Mode)

    return {
      text:
        want === 'on'
          ? 'Stained Glass is on.'
          : want === 'calm'
            ? 'Stained Glass colours are on, without the windows.'
            : 'Stained Glass is off. Type /glass on to bring it back.',
    }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    if (e.props.scene !== 'stained-glass') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt="A wall of tall Gothic stained-glass lancets glowing cobalt, ruby and gold in a dark nave" isInteractive />
  })
}
