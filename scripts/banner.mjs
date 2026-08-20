// Banner do topo do perfil: cena lofi de desenvolvimento.
// Tudo que muda (hora do dia, tema, dados vivos) entra por parametro.
// Animacao em CSS — ver scripts/css.mjs para o porque.

import { styleBlock } from './css.mjs';

// SVG carregado via <img> nao baixa webfont — so existe o que ja esta na
// maquina de quem olha. JetBrains Mono quase nunca esta, e cair direto em
// Courier New (fina e datada) desperdicava Consolas, Cascadia e SF Mono, que
// vem instaladas e sao bem melhores. A ordem abaixo tenta as boas antes.
const FONT =
  "'JetBrains Mono',ui-monospace,'Cascadia Mono','Segoe UI Mono',Consolas,Menlo," +
  "'DejaVu Sans Mono','Liberation Mono','Courier New',monospace";

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clip(text, max) {
  const s = String(text);
  return s.length <= max ? s : `${s.slice(0, max - 1)}...`;
}

/**
 * Maquina de escrever: um clipPath que cresce em passos discretos, uma letra
 * por vez, com o cursor acompanhando. Sem servico de terceiro.
 *
 * Parado, o texto aparece inteiro e o cursor fica no fim — que e exatamente o
 * que alguem com movimento reduzido precisa ver.
 */
function typewriter({ id, text, x, y, size, fill, dur }) {
  const n = text.length;
  const full = n * size * 0.6;
  const caretW = size * 0.55;
  const timing = `${dur}s steps(${n},end) infinite`;

  return {
    keyframes: `
  @keyframes type-${id} { 0% { transform:scaleX(0) } 62%,100% { transform:scaleX(1) } }
  @keyframes caret-${id} { 0% { transform:translateX(-${full.toFixed(1)}px) } 62%,100% { transform:translateX(0) } }`,
    defs: `
    <clipPath id="clip-${id}">
      <rect x="${x}" y="${y - size}" width="${full.toFixed(1)}" height="${(size * 1.4).toFixed(1)}"
            style="transform-origin:${x}px ${y}px;animation:type-${id} ${timing}"/>
    </clipPath>`,
    // textLength trava a largura real do texto na largura que o clip e o cursor
    // assumem. Sem isso, cada fonte do stack tem um avanco diferente e o cursor
    // flutua longe do fim da frase.
    body: `
      <text x="${x}" y="${y}" font-size="${size}" fill="${fill}" clip-path="url(#clip-${id})"
            textLength="${full.toFixed(1)}" lengthAdjust="spacing">${esc(text)}</text>
      <rect x="${(x + full + 3).toFixed(1)}" y="${y - size + 1}" width="${caretW.toFixed(1)}" height="${size}" fill="${fill}"
            style="animation:caret-${id} ${timing},blink 1.2s steps(1,end) infinite"/>`,
  };
}

function celestial(p) {
  if (p.celestialType === 'sun') {
    return `
    <circle cx="700" cy="82" r="58" fill="url(#celGlow)"/>
    <circle cx="700" cy="82" r="22" fill="${p.celestial}"/>`;
  }
  return `
    <circle cx="700" cy="82" r="52" fill="url(#celGlow)"/>
    <circle cx="700" cy="82" r="20" fill="${p.celestial}"/>
    <circle cx="692" cy="74" r="16" fill="${p.bgMid}" opacity="0.85"/>`;
}

/**
 * Uma folha de chuva cobrindo toda a altura, reusada por <use>.
 * O deslocamento da animacao e exatamente o espacamento entre as gotas, entao
 * o ciclo fecha sem salto — e parado ainda parece chuva, nao uma faixa vazia.
 */
function rainDefs(p) {
  if (!p.rain) return '';
  let lines = '';
  for (let col = 0; col < 26; col++) {
    const x = -50 + col * 50;
    for (let row = 0; row < 5; row++) {
      const y = -34 + row * 80;
      lines += `<line x1="${x}" y1="${y}" x2="${x - 8}" y2="${y + 36}"/>`;
    }
  }
  return `
    <g id="rainSheet" stroke="${p.accentSoft}" stroke-width="1" stroke-linecap="round">${lines}</g>`;
}

function rain(p) {
  if (!p.rain) return '';
  const sheet = (dur, delay, opacity, dx, dy) => `
    <g class="fall" style="animation-duration:${dur}s;animation-delay:-${delay}s">
      <use href="#rainSheet" xlink:href="#rainSheet" transform="translate(${dx},${dy})" opacity="${opacity}"/>
    </g>`;
  return sheet(0.95, 0, 0.32, 0, 0) + sheet(1.15, 0.4, 0.2, 17, 26) + sheet(0.78, 0.2, 0.26, 33, 53);
}

function lightning(p) {
  return p.rain ? `<rect class="flash" width="1200" height="320" fill="#FFFFFF"/>` : '';
}

function stars(p) {
  if (!p.starOpacity) return '';
  const seeds = [
    [150, 44, 1.2, 6], [368, 30, 1, 7.4], [596, 46, 1.1, 5.2],
    [836, 36, 1, 8], [1058, 28, 1.2, 6.6], [1160, 58, 1, 5.8], [470, 66, 1, 9],
  ];
  const dots = seeds
    .map(([cx, cy, r, dur], i) =>
      `<circle cx="${cx}" cy="${cy}" r="${r}" class="twk" style="animation-duration:${dur}s;animation-delay:-${i * 0.9}s"/>`)
    .join('');
  return `<g fill="${p.accentSoft}" opacity="${p.starOpacity}">${dots}</g>`;
}

function cityWindows(p) {
  const spots = [
    [18, 240, 4.2], [112, 234, 5.6], [166, 244, 6.8], [262, 242, 4.8],
    [318, 236, 7.2], [372, 228, 5.1], [470, 234, 6.2], [530, 244, 4.6],
    [618, 204, 7.8], [632, 222, 5.0], [664, 232, 5.4], [712, 212, 6.4],
    [748, 240, 6.0], [798, 220, 4.4], [890, 208, 8.2], [978, 198, 5.9],
    [1024, 230, 6.9], [1112, 222, 4.9], [1166, 226, 7.6],
  ];
  const rects = spots
    .map(([x, y, dur], i) =>
      `<rect x="${x}" y="${y}" width="3" height="4" class="twk" style="animation-duration:${dur}s;animation-delay:-${i * 0.7}s"/>`)
    .join('');
  return `<g fill="${p.accent}" opacity="${p.windowOpacity}">${rects}</g>`;
}

function codeBlock(p, offsetY) {
  const lines = [
    [942, 128, 16, p.accent], [962, 128, 42, p.dim],
    [942, 138, 58, p.dim], [1004, 138, 18, p.accentSoft],
    [948, 148, 30, p.dim],
    [948, 158, 66, p.deskLine],
    [942, 168, 22, p.accent], [968, 168, 36, p.dim],
    [948, 178, 48, p.dim],
    [948, 188, 26, p.accentSoft],
    [942, 198, 70, p.dim],
    [942, 208, 34, p.accent],
    [948, 218, 54, p.dim],
    [948, 228, 28, p.deskLine],
    [942, 238, 62, p.dim],
  ];
  const rects = lines
    .map(([x, y, w, fill]) => `<rect x="${x}" y="${y}" width="${w}" height="3" fill="${fill}"/>`)
    .join('');
  return `<g transform="translate(0 ${offsetY})">${rects}</g>`;
}

/** Barra que cresce a partir da base, via scaleY com origem no pe da barra. */
function growBar({ x, y, w, h, cls, dur, delay }) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls}"
      style="transform-origin:${x + w / 2}px ${y + h}px;animation-duration:${dur}s;animation-delay:-${delay}s"/>`;
}

export function renderBanner({ palette: p, live }) {
  const version = live.version || 'v1.0.0';
  const ci = live.ci ? `ci ${live.ci}` : 'online';
  const screenLabel = `ronas desk · ${version} · ${ci}`;

  const commitLine = live.commit
    ? `último commit · ${live.age} · ${clip(live.commit.repo, 22)}`
    : 'react · node · express · mysql';

  const tw = typewriter({
    id: 'flow',
    text: 'problema → produto → testes → deploy',
    x: 70,
    y: 220,
    size: 13,
    fill: p.accent,
    dur: 11,
  });

  const eqBars = [798, 808, 818, 828, 838]
    .map((x, i) => growBar({ x, y: 206, w: 5, h: 16, cls: 'eq', dur: [1.6, 1.9, 1.4, 2.1, 1.7][i], delay: i * 0.4 }))
    .join('');

  const chartBars = [1040, 1054, 1068, 1082, 1096, 1110]
    .map((x, i) => growBar({ x, y: 204, w: 8, h: 26, cls: 'bar', dur: [3.2, 3.8, 2.9, 4.2, 3.4, 3.6][i], delay: i * 0.6 }))
    .join('');

  const keys = [
    [1016, 270, 0.9], [1032, 269, 1.3], [1048, 268, 0], [1064, 267, 1.1],
    [1080, 266, 0], [1096, 265, 0.75], [1022, 277, 0], [1038, 276, 1.5],
    [1054, 275, 0], [1070, 274, 1], [1086, 273, 0],
  ]
    .map(([x, y, dur], i) =>
      dur
        ? `<rect x="${x}" y="${y}" width="9" height="3" class="blink" style="animation-duration:${dur}s;animation-delay:-${i * 0.3}s"/>`
        : `<rect x="${x}" y="${y}" width="9" height="3"/>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="320" viewBox="0 0 1200 320" role="img" aria-labelledby="t d">
  <title id="t">Ronael Moura — Full Stack Developer</title>
  <desc id="d">Cena de desenvolvimento (${p.label}) com monitores, código em movimento e cidade ao fundo.</desc>

  ${styleBlock(tw.keyframes)}

  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.bgTop}"/>
      <stop offset="0.55" stop-color="${p.bgMid}"/>
      <stop offset="1" stop-color="${p.horizon}"/>
    </linearGradient>
    <linearGradient id="scrim" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${p.bgMid}" stop-opacity="0.95"/>
      <stop offset="0.6" stop-color="${p.bgMid}" stop-opacity="0.72"/>
      <stop offset="1" stop-color="${p.bgMid}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.haze}" stop-opacity="0"/>
      <stop offset="1" stop-color="${p.haze}" stop-opacity="0.18"/>
    </linearGradient>
    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.accent}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${p.accent}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${p.accentSoft}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${p.accentSoft}" stop-opacity="0.11"/>
      <stop offset="1" stop-color="${p.accentSoft}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="screenGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${p.accent}" stop-opacity="0.3"/>
      <stop offset="1" stop-color="${p.accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="deskGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${p.accent}" stop-opacity="0.2"/>
      <stop offset="1" stop-color="${p.accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="celGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${p.celestial}" stop-opacity="0.3"/>
      <stop offset="1" stop-color="${p.celestial}" stop-opacity="0"/>
    </radialGradient>

    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.04 0"/>
    </filter>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>

    <clipPath id="frame"><rect width="1200" height="320" rx="18"/></clipPath>
    <clipPath id="mainScreen"><rect x="936" y="106" width="208" height="128"/></clipPath>
    <clipPath id="sideScreen"><rect x="790" y="140" width="110" height="88"/></clipPath>
    <clipPath id="titleBox"><rect x="60" y="46" width="520" height="212"/></clipPath>
    ${tw.defs}
    ${rainDefs(p)}
  </defs>

  <g clip-path="url(#frame)" font-family="${FONT}">
    <rect width="1200" height="320" fill="url(#sky)"/>
    ${celestial(p)}
    ${stars(p)}

    <g opacity="0.5">
      <ellipse class="cloud-a" cx="1460" cy="230" rx="220" ry="24" fill="${p.city}"/>
      <ellipse class="cloud-b" cx="1460" cy="244" rx="280" ry="20" fill="${p.city}"/>
    </g>

    <path d="M0 252 V232 H48 V240 H96 V226 H150 V238 H196 V222 H248 V236 H300 V228 H352 V218 H404 V234 H456 V224 H508 V238 H556 V216 H600 V192 H646 V220 H690 V200 H736 V230 H780 V208 H824 V226 H868 V196 H914 V224 H960 V186 H1006 V218 H1050 V206 H1096 V230 H1140 V210 H1200 V252 Z"
          fill="${p.city}"/>
    <rect x="0" y="184" width="1200" height="68" fill="url(#haze)"/>
    ${cityWindows(p)}

    <rect x="0" y="252" width="1200" height="68" fill="${p.desk}"/>
    <line x1="0" y1="252" x2="1200" y2="252" stroke="${p.deskLine}" stroke-width="1"/>
    <ellipse cx="1000" cy="266" rx="230" ry="26" fill="url(#deskGlow)"/>

    <rect x="0" y="0" width="660" height="320" fill="url(#scrim)"/>

    <g transform="rotate(-5 845 184)">
      <rect x="784" y="134" width="122" height="100" rx="5" fill="${p.screenPanel}" stroke="${p.deskLine}" stroke-width="1.4"/>
      <rect x="790" y="140" width="110" height="88" fill="${p.screenBg}"/>
      <g clip-path="url(#sideScreen)">
        <g fill="${p.dim}" class="soft">
          <rect x="796" y="147" width="46" height="3"/>
          <rect x="796" y="156" width="72" height="3"/>
          <rect x="796" y="165" width="34" height="3"/>
          <rect x="796" y="174" width="60" height="3"/>
          <rect x="796" y="183" width="44" height="3"/>
        </g>
        <rect x="796" y="192" width="28" height="3" fill="${p.accent}"/>
        <rect x="828" y="190" width="5" height="6" fill="${p.accentSoft}" class="blink"/>
        <g fill="${p.accent}" opacity="0.85">${eqBars}</g>
      </g>
    </g>

    <rect x="1032" y="240" width="16" height="14" fill="${p.deskLine}"/>
    <ellipse cx="1040" cy="256" rx="34" ry="4" fill="${p.deskLine}"/>
    <rect x="926" y="96" width="228" height="148" rx="6" fill="${p.screenPanel}" stroke="${p.deskLine}" stroke-width="1.6"/>
    <rect x="936" y="106" width="208" height="128" fill="${p.screenBg}"/>
    <g clip-path="url(#mainScreen)">
      <rect x="936" y="106" width="208" height="15" fill="${p.screenPanel}"/>
      <g fill="${p.dim}">
        <circle cx="945" cy="113" r="2.2"/><circle cx="954" cy="113" r="2.2"/><circle cx="963" cy="113" r="2.2"/>
      </g>
      <text x="974" y="116" font-size="8.5" fill="${p.accent}">${esc(clip(screenLabel, 34))}</text>

      <g class="code-scroll">
        ${codeBlock(p, 0)}
        ${codeBlock(p, 130)}
      </g>

      <line x1="1030" y1="121" x2="1030" y2="234" stroke="${p.deskLine}" stroke-width="1"/>

      <path class="soft" d="M1040 186 L1052 174 L1064 180 L1076 158 L1088 166 L1100 144 L1112 152 L1124 136 L1136 130 L1136 190 L1040 190 Z" fill="url(#chartFill)"/>
      <polyline class="draw-chart" points="1040,186 1052,174 1064,180 1076,158 1088,166 1100,144 1112,152 1124,136 1136,130"
                fill="none" stroke="${p.accentSoft}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                stroke-dasharray="180"/>
      <circle cx="1136" cy="130" r="2.5" fill="${p.accentSoft}" class="soft" style="animation-duration:1.8s"/>

      <g fill="${p.accent}" opacity="0.75">${chartBars}</g>

      <rect class="sweep" x="936" y="106" width="208" height="26" fill="url(#shine)"/>
    </g>

    <g>
      <path d="M1004 268 L1136 262 L1146 278 L1010 284 Z" fill="${p.screenPanel}" stroke="${p.deskLine}" stroke-width="1"/>
      <g fill="${p.dim}">${keys}</g>
      <ellipse cx="1168" cy="272" rx="10" ry="7" fill="${p.screenPanel}" stroke="${p.deskLine}" stroke-width="1"/>
    </g>

    <g>
      <g fill="none" stroke="${p.accent}" stroke-width="1.2" stroke-linecap="round">
        <path class="steam" d="M606 258 C601 250 611 246 606 238"/>
        <path class="steam" style="animation-duration:5.4s;animation-delay:-1.6s" d="M616 256 C611 248 621 244 616 236"/>
        <path class="steam" style="animation-duration:5s;animation-delay:-3s" d="M625 259 C620 251 630 247 625 239"/>
      </g>
      <path d="M598 264 H634 V286 Q634 293 627 293 H605 Q598 293 598 286 Z" fill="${p.screenPanel}" stroke="${p.accent}" stroke-width="1.3"/>
      <path d="M634 270 Q646 272 644 280 Q642 287 634 286" fill="none" stroke="${p.accent}" stroke-width="1.3"/>
      <ellipse cx="616" cy="264" rx="18" ry="3.4" fill="${p.deskLine}"/>
    </g>

    <ellipse class="soft" cx="1030" cy="180" rx="230" ry="150" fill="url(#screenGlow)"/>

    <path d="M762 306 Q762 292 782 292 H1038 Q1058 292 1058 306 V330 H762 Z" fill="${p.body}" stroke="${p.deskLine}" stroke-width="1"/>

    <g class="breathe">
      <path d="M780 330 C784 296 812 282 838 274 C830 236 856 208 910 208 C964 208 990 236 982 274 C1008 282 1036 296 1040 330 Z" fill="${p.body}"/>
      <path class="rim" d="M780 330 C784 296 812 282 838 274 C830 236 856 208 910 208 C964 208 990 236 982 274 C1008 282 1036 296 1040 330" fill="none" stroke="${p.accent}" stroke-width="1.8"/>
      <path d="M838 256 C838 192 982 192 982 256" fill="none" stroke="${p.metal}" stroke-width="7" stroke-linecap="round"/>
      <path d="M838 256 C838 192 982 192 982 256" fill="none" stroke="${p.accent}" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>
      <rect x="825" y="246" width="21" height="36" rx="10" fill="${p.metal}" stroke="${p.accent}" stroke-width="1"/>
      <rect x="974" y="246" width="21" height="36" rx="10" fill="${p.metal}" stroke="${p.accent}" stroke-width="1"/>
      <circle cx="984" cy="264" r="2.4" fill="${p.accentSoft}" class="blink" style="animation-duration:2.4s"/>
    </g>

    <g fill="${p.accentSoft}">
      <circle class="rise" cx="672" cy="300" r="1.2"/>
      <circle class="rise" cx="744" cy="300" r="1" style="animation-duration:21s;animation-delay:-3s"/>
      <circle class="rise" cx="1104" cy="300" r="1.1" style="animation-duration:18s;animation-delay:-6s"/>
      <circle class="rise" cx="1178" cy="300" r="1" style="animation-duration:24s;animation-delay:-9s"/>
    </g>

    ${rain(p)}
    ${lightning(p)}

    <g>
      <text class="glow" x="70" y="126" font-size="38" font-weight="700" fill="${p.accent}" filter="url(#soft)">RONAEL MOURA</text>

      <text x="70" y="74" font-size="12" fill="${p.accent}" letter-spacing="3">RONAS // BUILD LOG</text>
      <text x="70" y="126" font-size="38" font-weight="700" fill="${p.ink}">RONAEL MOURA</text>

      <line class="draw-line" x1="70" y1="140" x2="250" y2="140" stroke="${p.accent}" stroke-width="1.5" stroke-dasharray="180"/>

      <text x="70" y="166" font-size="16" fill="${p.muted}" letter-spacing="1">full stack developer</text>
      <text x="70" y="192" font-size="11" fill="${p.dim}" letter-spacing="1">react · node · express · mysql</text>
      ${tw.body}
      <text x="70" y="242" font-size="10.5" fill="${p.dim}">${esc(clip(commitLine, 52))}</text>

      <g clip-path="url(#titleBox)">
        <rect class="scan" x="60" y="46" width="520" height="3" fill="${p.accentSoft}" opacity="0.1"/>
        <rect class="shine" x="60" y="46" width="160" height="212" fill="url(#shine)"/>
      </g>
    </g>

    <rect width="1200" height="320" rx="18" fill="#000" filter="url(#grain)"/>
  </g>
</svg>
`;
}
