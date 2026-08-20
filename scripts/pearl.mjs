// Perola Negra navegando sobre o grafico de contribuicoes.
// A linha do mar NAO e decorativa: cada ponto e uma semana do ultimo ano.
//
// O navio nao tem animacao escrita a mao. Os keyframes de posicao e angulo sao
// calculados a partir da mesma curva, entao ele sobe de verdade nas semanas
// cheias. (A versao anterior usava animateMotion; virou CSS para respeitar
// prefers-reduced-motion. `offset-path` faria o mesmo, mas transform tem suporte
// mais amplo e o calculo ja esta aqui de qualquer jeito.)

import { styleBlock } from './css.mjs';

const FONT = "'JetBrains Mono','Courier New',monospace";

const WIDTH = 1200;
const HEIGHT = 260;
const BASE_Y = 196;
const AMPLITUDE = 22;
const SWELL = 6;

/** Curva suave passando pelos pontos, com quadraticas nos pontos medios. */
function smoothPath(points) {
  const [first] = points;
  let d = `M ${first[0].toFixed(1)} ${first[1].toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [cx, cy] = points[i];
    const [nx, ny] = points[i + 1];
    d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${((cx + nx) / 2).toFixed(1)} ${((cy + ny) / 2).toFixed(1)}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
  return d;
}

function seaPoints(weeks) {
  const values = weeks?.length ? weeks : new Array(52).fill(0);
  const max = Math.max(...values, 1);

  // Raiz quadrada: uma semana de pico nao achata todas as outras.
  const scaled = values.map((v) => Math.sqrt(v / max));

  // Uma passada de media movel para o navio subir a onda em vez de bater num degrau.
  const smooth = scaled.map((v, i) => {
    const prev = scaled[i - 1] ?? v;
    const next = scaled[i + 1] ?? v;
    return (prev + 2 * v + next) / 4;
  });

  const n = smooth.length;
  return smooth.map((value, i) => {
    const x = -40 + ((WIDTH + 80) * i) / (n - 1);
    // Marulho de base + contribuicao: o mar nunca fica morto, mas as semanas
    // cheias levantam ondas de verdade.
    const y = BASE_Y - (Math.sin(i * 0.7) * SWELL + value * AMPLITUDE);
    return [x, y];
  });
}

/** Um keyframe por semana, com o angulo tirado da inclinacao local da curva. */
function sailKeyframes(points) {
  const n = points.length;
  const steps = points.map(([x, y], i) => {
    const [px, py] = points[Math.max(i - 1, 0)];
    const [nx, ny] = points[Math.min(i + 1, n - 1)];
    const angle = (Math.atan2(ny - py, nx - px) * 180) / Math.PI;
    const pct = ((i / (n - 1)) * 100).toFixed(2);
    return `${pct}%{transform:translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${angle.toFixed(2)}deg)}`;
  });
  return `\n  @keyframes sail{${steps.join('')}}`;
}

/** Navio desenhado ao redor da origem: (0,0) e a linha d'agua. */
function ship(p, restingTransform) {
  return `
  <g class="sail" style="transform:${restingTransform}">
    <path d="M -86 -8 C -88 6 -72 18 -48 21 L 52 21 C 76 18 92 4 98 -12 L 72 -6 L 40 -4 L -40 -4 L -72 -6 Z"
          fill="${p.body}" stroke="${p.metal}" stroke-width="1.4"/>
    <path d="M -80 -4 L 92 -4 L 86 4 L -76 4 Z" fill="${p.hullBand}" opacity="0.65"/>

    <path d="M -56 -6 L -90 -10 L -90 -40 C -90 -50 -78 -56 -62 -56 L -56 -56 Z"
          fill="${p.body}" stroke="${p.metal}" stroke-width="1.2"/>
    <rect x="-84" y="-40" width="9" height="12" rx="1.5" fill="${p.lamp}" opacity="0.9"/>
    <rect x="-71" y="-40" width="9" height="12" rx="1.5" fill="${p.lamp}" opacity="0.7"/>

    <line x1="94" y1="-12" x2="140" y2="-24" stroke="${p.metal}" stroke-width="2.6"/>
    <line x1="122" y1="-19" x2="118" y2="-6" stroke="${p.metal}" stroke-width="1.4"/>

    <line x1="48" y1="-4" x2="48" y2="-110" stroke="${p.metal}" stroke-width="2.6"/>
    <line x1="12" y1="-100" x2="84" y2="-100" stroke="${p.metal}" stroke-width="1.8"/>
    <path d="M 12 -98 L 84 -98 Q 86 -74 76 -62 Q 48 -54 20 -62 Q 10 -74 12 -98 Z"
          fill="${p.sail}" stroke="${p.sailEdge}" stroke-width="0.8"/>

    <line x1="-4" y1="-4" x2="-4" y2="-152" stroke="${p.metal}" stroke-width="3.2"/>
    <line x1="-44" y1="-132" x2="40" y2="-132" stroke="${p.metal}" stroke-width="2.2"/>
    <line x1="-40" y1="-84" x2="36" y2="-84" stroke="${p.metal}" stroke-width="2"/>
    <path d="M -42 -130 L 38 -130 Q 40 -102 28 -88 Q -4 -78 -34 -88 Q -44 -102 -42 -130 Z"
          fill="${p.sail}" stroke="${p.sailEdge}" stroke-width="0.9"/>
    <path d="M -38 -82 L 34 -82 Q 36 -56 24 -44 Q -4 -35 -32 -44 Q -40 -56 -38 -82 Z"
          fill="${p.sail}" stroke="${p.sailEdge}" stroke-width="0.9"/>

    <line x1="-56" y1="-6" x2="-56" y2="-98" stroke="${p.metal}" stroke-width="2.4"/>
    <line x1="-90" y1="-88" x2="-22" y2="-88" stroke="${p.metal}" stroke-width="1.7"/>
    <path d="M -88 -86 L -24 -86 Q -22 -64 -32 -53 Q -56 -46 -80 -53 Q -90 -64 -88 -86 Z"
          fill="${p.sail}" stroke="${p.sailEdge}" stroke-width="0.8"/>

    <g stroke="${p.metal}" stroke-width="0.7" opacity="0.55">
      <line x1="-4" y1="-150" x2="-84" y2="-10"/>
      <line x1="-4" y1="-150" x2="90" y2="-14"/>
      <line x1="48" y1="-108" x2="94" y2="-12"/>
      <line x1="-56" y1="-96" x2="-88" y2="-12"/>
    </g>

    <g class="flag" style="transform-origin:-4px -152px">
      <path d="M -4 -152 Q -32 -160 -42 -150 Q -32 -140 -4 -146 Z" fill="${p.body}" stroke="${p.sailEdge}" stroke-width="0.6"/>
      <g transform="translate(-24,-150) scale(0.5)" fill="${p.ink}">
        <circle cx="0" cy="0" r="4.2"/>
        <path d="M -6 6 L -2 3 L 0 6 L 2 3 L 6 6 L 3 1 L 6 -1 L 2 -1 L 3 -5 L 0 -2 L -3 -5 L -2 -1 L -6 -1 L -3 1 Z"/>
      </g>
    </g>

    <g class="flag" style="transform-origin:48px -110px;animation-duration:1.7s;animation-delay:-.5s">
      <path d="M 48 -110 Q 26 -117 18 -108 Q 26 -100 48 -105 Z" fill="${p.body}" stroke="${p.sailEdge}" stroke-width="0.6"/>
      <g transform="translate(32,-108) scale(0.4)" fill="${p.ink}">
        <circle cx="0" cy="0" r="4.2"/>
        <path d="M -6 6 L -2 3 L 0 6 L 2 3 L 6 6 L 3 1 L 6 -1 L 2 -1 L 3 -5 L 0 -2 L -3 -5 L -2 -1 L -6 -1 L -3 1 Z"/>
      </g>
    </g>

    <g fill="${p.lamp}">
      <circle class="blink" cx="-88" cy="-14" r="1.8" style="animation-duration:2.4s"/>
      <circle class="blink" cx="92" cy="-16" r="1.8" style="animation-duration:2.8s;animation-delay:-1.4s"/>
    </g>
  </g>`;
}

function rainDefs(p) {
  if (!p.rain) return '';
  let lines = '';
  for (let col = 0; col < 24; col++) {
    const x = -50 + col * 54;
    for (let row = 0; row < 4; row++) {
      const y = -30 + row * 80;
      lines += `<line x1="${x}" y1="${y}" x2="${x - 7}" y2="${y + 34}"/>`;
    }
  }
  return `<g id="rainSheet" stroke="${p.accentSoft}" stroke-width="1" stroke-linecap="round">${lines}</g>`;
}

function rain(p) {
  if (!p.rain) return '';
  const sheet = (dur, delay, opacity, dx, dy) => `
    <g class="fall" style="animation-duration:${dur}s;animation-delay:-${delay}s">
      <use href="#rainSheet" xlink:href="#rainSheet" transform="translate(${dx},${dy})" opacity="${opacity}"/>
    </g>`;
  return sheet(0.9, 0, 0.28, 0, 0) + sheet(1.1, 0.35, 0.18, 19, 28);
}

/**
 * Espuma: uma onda longa deslizando na horizontal.
 * Deslocar e mais confiavel que interpolar `d`, que ainda tem suporte irregular.
 */
function foam(p, y, dur, opacity, stroke, delay) {
  const period = 160;
  const points = [];
  for (let i = 0; i <= 12; i++) points.push([-200 + i * period, y + (i % 2 ? 6 : -6)]);
  return `
    <g class="drift" style="animation-duration:${dur}s;animation-delay:-${delay}s">
      <path d="${smoothPath(points)}" fill="none" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="1.8"/>
    </g>`;
}

export function renderPearl({ palette: base, weeks, total }) {
  const p = {
    ...base,
    sail: base.theme === 'light' ? '#2B3F58' : '#101A28',
    sailEdge: base.accent,
    hullBand: base.deskLine,
    lamp: '#FFB347',
  };

  const points = seaPoints(weeks);
  const line = smoothPath(points);
  const fill = `${line} L ${WIDTH + 40} ${HEIGHT} L -40 ${HEIGHT} Z`;

  // Parado, o navio fica no meio do mar em vez de fora do quadro.
  const mid = points[Math.floor(points.length / 2)];
  const resting = `translate(${mid[0].toFixed(1)}px,${mid[1].toFixed(1)}px)`;

  const legend = total
    ? `altura das ondas = contribuicoes por semana · ${total} no ultimo ano`
    : 'altura das ondas = contribuicoes por semana';

  const extra = `${sailKeyframes(points)}
  @keyframes drift { from { transform:translateX(0) } to { transform:translateX(-320px) } }
  .sail { animation:sail 30s linear infinite }
  .drift { animation:drift 4s linear infinite }`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="t d">
  <title id="t">Perola Negra navegando sobre o grafico de contribuicoes</title>
  <desc id="d">A altura das ondas vem do total de contribuicoes de cada semana do ultimo ano. O navio percorre essa curva.</desc>

  ${styleBlock(extra)}

  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.bgTop}"/>
      <stop offset="0.6" stop-color="${p.bgMid}"/>
      <stop offset="1" stop-color="${p.horizon}"/>
    </linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.horizon}"/>
      <stop offset="0.5" stop-color="${p.bgMid}"/>
      <stop offset="1" stop-color="${p.bgTop}"/>
    </linearGradient>
    <radialGradient id="celGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${p.celestial}" stop-opacity="0.32"/>
      <stop offset="1" stop-color="${p.celestial}" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.035 0"/>
    </filter>
    <clipPath id="frame"><rect width="${WIDTH}" height="${HEIGHT}" rx="16"/></clipPath>
    ${rainDefs(p)}
  </defs>

  <g clip-path="url(#frame)">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>

    <circle cx="1010" cy="66" r="76" fill="url(#celGlow)"/>
    <circle cx="1010" cy="66" r="26" fill="${p.celestial}"/>
    ${p.celestialType === 'moon' ? `<circle cx="998" cy="56" r="20" fill="${p.bgMid}" opacity="0.85"/>` : ''}

    <g fill="${p.accentSoft}" opacity="${p.starOpacity}">
      <circle class="twk" cx="120" cy="40" r="1.3"/>
      <circle class="twk" cx="330" cy="66" r="1" style="animation-duration:7.2s;animation-delay:-1.1s"/>
      <circle class="twk" cx="560" cy="34" r="1.2" style="animation-duration:5.4s;animation-delay:-2.3s"/>
      <circle class="twk" cx="760" cy="58" r="1" style="animation-duration:8s;animation-delay:-3.4s"/>
      <circle class="twk" cx="1150" cy="44" r="1.1" style="animation-duration:6.6s;animation-delay:-4.2s"/>
    </g>

    ${rain(p)}
    ${ship(p, resting)}

    <path d="${fill}" fill="url(#water)"/>
    <path d="${line}" fill="none" stroke="${p.accent}" stroke-width="2" stroke-opacity="0.65"/>

    ${foam(p, 214, 3.6, 0.3, p.accentSoft, 0)}
    ${foam(p, 232, 4.8, 0.22, p.accent, 1.2)}
    ${foam(p, 248, 4.2, 0.16, p.accentSoft, 2.4)}

    <text x="24" y="${HEIGHT - 14}" font-family="${FONT}" font-size="9" fill="${p.dim}" opacity="0.8">${legend}</text>

    <rect width="${WIDTH}" height="${HEIGHT}" rx="16" fill="#000" filter="url(#grain)"/>
  </g>
</svg>
`;
}
