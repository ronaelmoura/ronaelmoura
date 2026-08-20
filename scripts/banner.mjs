// Banner do topo do perfil: cena lofi de desenvolvimento.
// Tudo que muda (hora do dia, tema, dados vivos) entra por parametro.

const FONT = "'JetBrains Mono','Courier New',monospace";

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
 * Efeito maquina de escrever em SMIL: um clipPath cresce em passos discretos,
 * uma letra por vez, e o cursor acompanha. Sem servico de terceiro.
 */
function typewriter({ id, text, x, y, size, fill, dur }) {
  const charW = size * 0.6;
  const n = text.length;
  const full = n * charW;
  const values = [];
  const keyTimes = [];
  for (let i = 0; i <= n; i++) {
    values.push((i * charW).toFixed(1));
    keyTimes.push(((i / n) * 0.62).toFixed(4));
  }
  values.push(full.toFixed(1));
  keyTimes.push('1');

  const cursorValues = values.map((w) => (x + Number(w) + 2).toFixed(1)).join(';');

  return `
    <clipPath id="${id}">
      <rect x="${x}" y="${y - size}" width="0" height="${size * 1.4}">
        <animate attributeName="width" values="${values.join(';')}"
                 keyTimes="${keyTimes.join(';')}" calcMode="discrete"
                 dur="${dur}s" repeatCount="indefinite"/>
      </rect>
    </clipPath>
    <text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" fill="${fill}"
          clip-path="url(#${id})">${esc(text)}</text>
    <rect x="${x}" y="${y - size + 1}" width="${(size * 0.55).toFixed(1)}" height="${size}" fill="${fill}">
      <animate attributeName="x" values="${cursorValues}" keyTimes="${keyTimes.join(';')}"
               calcMode="discrete" dur="${dur}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite"/>
    </rect>`;
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

function rain(p) {
  if (!p.rain) return '';
  let drops = '';
  for (let i = 0; i < 26; i++) {
    const x = -40 + i * 50;
    drops += `<line x1="${x}" y1="-34" x2="${x - 8}" y2="2"/>`;
  }
  const sheet = (begin, dur, opacity) => `
    <g stroke="${p.accentSoft}" stroke-width="1" stroke-opacity="${opacity}" stroke-linecap="round">
      ${drops}
      <animateTransform attributeName="transform" type="translate" values="0 0;-84 366"
                        dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>
    </g>`;
  return sheet(0, 0.95, 0.32) + sheet(0.32, 1.15, 0.2) + sheet(0.64, 0.78, 0.26);
}

function lightning(p) {
  if (!p.rain) return '';
  return `
    <rect width="1200" height="320" fill="#FFFFFF" opacity="0">
      <animate attributeName="opacity" values="0;0.16;0.02;0.11;0;0"
               keyTimes="0;0.010;0.026;0.040;0.065;1" dur="19s" repeatCount="indefinite"/>
    </rect>`;
}

function stars(p) {
  if (!p.starOpacity) return '';
  const seeds = [
    [150, 44, 1.2, 6], [368, 30, 1, 7.4], [596, 46, 1.1, 5.2],
    [836, 36, 1, 8], [1058, 28, 1.2, 6.6], [1160, 58, 1, 5.8], [470, 66, 1, 9],
  ];
  const dots = seeds
    .map(([cx, cy, r, dur], i) => {
      const from = i % 2 ? 0.55 : 0.12;
      const to = i % 2 ? 0.12 : 0.6;
      return `<circle cx="${cx}" cy="${cy}" r="${r}">
        <animate attributeName="opacity" values="${from};${to};${from}" dur="${dur}s" repeatCount="indefinite"/>
      </circle>`;
    })
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
    .map(([x, y, dur], i) => {
      const a = i % 2 ? '0.18' : '0.7';
      const b = i % 2 ? '0.7' : '0.14';
      return `<rect x="${x}" y="${y}" width="3" height="4">
        <animate attributeName="opacity" values="${a};${b};${a}" dur="${dur}s" repeatCount="indefinite"/>
      </rect>`;
    })
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

export function renderBanner({ palette: p, live }) {
  const version = live.version || 'v1.0.0';
  const ci = live.ci ? `ci ${live.ci}` : 'online';
  const screenLabel = `ronas desk · ${version} · ${ci}`;

  const commitLine = live.commit
    ? `ultimo commit · ${live.age} · ${clip(live.commit.repo, 22)}`
    : 'react · node · express · mysql';

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="320" viewBox="0 0 1200 320" role="img" aria-labelledby="t d">
  <title id="t">Ronael Moura — Full Stack Developer</title>
  <desc id="d">Cena de desenvolvimento (${p.label}) com monitores, codigo em movimento e cidade ao fundo.</desc>

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
  </defs>

  <g clip-path="url(#frame)">
    <rect width="1200" height="320" fill="url(#sky)"/>
    ${celestial(p)}
    ${stars(p)}

    <g opacity="0.5">
      <ellipse cx="300" cy="230" rx="220" ry="24" fill="${p.city}">
        <animate attributeName="cx" values="-260;1460" dur="80s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="900" cy="244" rx="280" ry="20" fill="${p.city}">
        <animate attributeName="cx" values="1460;-300" dur="104s" repeatCount="indefinite"/>
      </ellipse>
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
        <g fill="${p.dim}">
          <rect x="796" y="147" width="46" height="3"/>
          <rect x="796" y="156" width="72" height="3"/>
          <rect x="796" y="165" width="34" height="3"/>
          <rect x="796" y="174" width="60" height="3"/>
          <rect x="796" y="183" width="44" height="3"/>
          <animate attributeName="opacity" values="0.75;1;0.75" dur="3.4s" repeatCount="indefinite"/>
        </g>
        <rect x="796" y="192" width="28" height="3" fill="${p.accent}"/>
        <rect x="828" y="190" width="5" height="6" fill="${p.accentSoft}">
          <animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite"/>
        </rect>
        <g fill="${p.accent}" opacity="0.85">
          <rect x="798" y="212" width="5" height="10"><animate attributeName="height" values="6;16;9;14;6" dur="1.6s" repeatCount="indefinite"/><animate attributeName="y" values="216;206;213;208;216" dur="1.6s" repeatCount="indefinite"/></rect>
          <rect x="808" y="212" width="5" height="10"><animate attributeName="height" values="14;7;16;10;14" dur="1.9s" repeatCount="indefinite"/><animate attributeName="y" values="208;215;206;212;208" dur="1.9s" repeatCount="indefinite"/></rect>
          <rect x="818" y="212" width="5" height="10"><animate attributeName="height" values="9;15;6;13;9" dur="1.4s" repeatCount="indefinite"/><animate attributeName="y" values="213;207;216;209;213" dur="1.4s" repeatCount="indefinite"/></rect>
          <rect x="828" y="212" width="5" height="10"><animate attributeName="height" values="16;8;12;7;16" dur="2.1s" repeatCount="indefinite"/><animate attributeName="y" values="206;214;210;215;206" dur="2.1s" repeatCount="indefinite"/></rect>
          <rect x="838" y="212" width="5" height="10"><animate attributeName="height" values="7;13;16;9;7" dur="1.7s" repeatCount="indefinite"/><animate attributeName="y" values="215;209;206;213;215" dur="1.7s" repeatCount="indefinite"/></rect>
        </g>
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
      <text x="974" y="116" font-family="${FONT}" font-size="8.5" fill="${p.accent}">${esc(clip(screenLabel, 34))}</text>

      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -130" dur="11s" repeatCount="indefinite"/>
        ${codeBlock(p, 0)}
        ${codeBlock(p, 130)}
      </g>

      <line x1="1030" y1="121" x2="1030" y2="234" stroke="${p.deskLine}" stroke-width="1"/>

      <path d="M1040 186 L1052 174 L1064 180 L1076 158 L1088 166 L1100 144 L1112 152 L1124 136 L1136 130 L1136 190 L1040 190 Z" fill="url(#chartFill)">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="4.5s" repeatCount="indefinite"/>
      </path>
      <polyline points="1040,186 1052,174 1064,180 1076,158 1088,166 1100,144 1112,152 1124,136 1136,130"
                fill="none" stroke="${p.accentSoft}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                stroke-dasharray="180" stroke-dashoffset="180">
        <animate attributeName="stroke-dashoffset" values="180;0;0" keyTimes="0;0.7;1" dur="5s" repeatCount="indefinite"/>
      </polyline>
      <circle cx="1136" cy="130" r="2.5" fill="${p.accentSoft}">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite"/>
      </circle>

      <g fill="${p.accent}" opacity="0.75">
        <rect x="1040" y="212" width="8" height="18"><animate attributeName="height" values="18;9;22;14;18" dur="3.2s" repeatCount="indefinite"/><animate attributeName="y" values="212;221;208;216;212" dur="3.2s" repeatCount="indefinite"/></rect>
        <rect x="1054" y="206" width="8" height="24"><animate attributeName="height" values="24;14;10;20;24" dur="3.8s" repeatCount="indefinite"/><animate attributeName="y" values="206;216;220;210;206" dur="3.8s" repeatCount="indefinite"/></rect>
        <rect x="1068" y="216" width="8" height="14"><animate attributeName="height" values="14;22;12;18;14" dur="2.9s" repeatCount="indefinite"/><animate attributeName="y" values="216;208;218;212;216" dur="2.9s" repeatCount="indefinite"/></rect>
        <rect x="1082" y="204" width="8" height="26"><animate attributeName="height" values="26;12;20;9;26" dur="4.2s" repeatCount="indefinite"/><animate attributeName="y" values="204;218;210;221;204" dur="4.2s" repeatCount="indefinite"/></rect>
        <rect x="1096" y="214" width="8" height="16"><animate attributeName="height" values="16;24;11;19;16" dur="3.4s" repeatCount="indefinite"/><animate attributeName="y" values="214;206;219;211;214" dur="3.4s" repeatCount="indefinite"/></rect>
        <rect x="1110" y="210" width="8" height="20"><animate attributeName="height" values="20;10;24;13;20" dur="3.6s" repeatCount="indefinite"/><animate attributeName="y" values="210;220;206;217;210" dur="3.6s" repeatCount="indefinite"/></rect>
      </g>

      <rect x="936" y="106" width="208" height="26" fill="url(#shine)">
        <animate attributeName="y" values="90;234" dur="6s" repeatCount="indefinite"/>
      </rect>
    </g>

    <g>
      <path d="M1004 268 L1136 262 L1146 278 L1010 284 Z" fill="${p.screenPanel}" stroke="${p.deskLine}" stroke-width="1"/>
      <g fill="${p.dim}">
        <rect x="1016" y="270" width="9" height="3"><animate attributeName="opacity" values="0.4;1;0.4" dur="0.9s" repeatCount="indefinite"/></rect>
        <rect x="1032" y="269" width="9" height="3"><animate attributeName="opacity" values="1;0.4;1" dur="1.3s" repeatCount="indefinite"/></rect>
        <rect x="1048" y="268" width="9" height="3"/>
        <rect x="1064" y="267" width="9" height="3"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.1s" repeatCount="indefinite"/></rect>
        <rect x="1080" y="266" width="9" height="3"/>
        <rect x="1096" y="265" width="9" height="3"><animate attributeName="opacity" values="1;0.35;1" dur="0.75s" repeatCount="indefinite"/></rect>
        <rect x="1022" y="277" width="9" height="3"/>
        <rect x="1038" y="276" width="9" height="3"><animate attributeName="opacity" values="0.35;1;0.35" dur="1.5s" repeatCount="indefinite"/></rect>
        <rect x="1054" y="275" width="9" height="3"/>
        <rect x="1070" y="274" width="9" height="3"><animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/></rect>
        <rect x="1086" y="273" width="9" height="3"/>
      </g>
      <ellipse cx="1168" cy="272" rx="10" ry="7" fill="${p.screenPanel}" stroke="${p.deskLine}" stroke-width="1"/>
    </g>

    <g>
      <g fill="none" stroke="${p.accent}" stroke-width="1.2" stroke-linecap="round">
        <path d="M606 258 C601 250 611 246 606 238">
          <animate attributeName="opacity" values="0;0.55;0" dur="4.6s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -16" dur="4.6s" repeatCount="indefinite"/>
        </path>
        <path d="M616 256 C611 248 621 244 616 236">
          <animate attributeName="opacity" values="0;0.45;0" dur="5.4s" begin="1.6s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -18" dur="5.4s" begin="1.6s" repeatCount="indefinite"/>
        </path>
        <path d="M625 259 C620 251 630 247 625 239">
          <animate attributeName="opacity" values="0;0.4;0" dur="5s" begin="3s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -17" dur="5s" begin="3s" repeatCount="indefinite"/>
        </path>
      </g>
      <path d="M598 264 H634 V286 Q634 293 627 293 H605 Q598 293 598 286 Z" fill="${p.screenPanel}" stroke="${p.accent}" stroke-width="1.3"/>
      <path d="M634 270 Q646 272 644 280 Q642 287 634 286" fill="none" stroke="${p.accent}" stroke-width="1.3"/>
      <ellipse cx="616" cy="264" rx="18" ry="3.4" fill="${p.deskLine}"/>
    </g>

    <ellipse cx="1030" cy="180" rx="230" ry="150" fill="url(#screenGlow)">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="5.5s" repeatCount="indefinite"/>
    </ellipse>

    <path d="M762 306 Q762 292 782 292 H1038 Q1058 292 1058 306 V330 H762 Z" fill="${p.body}" stroke="${p.deskLine}" stroke-width="1"/>

    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0;0 2;0 0" dur="6.5s" repeatCount="indefinite"/>
      <path d="M780 330 C784 296 812 282 838 274 C830 236 856 208 910 208 C964 208 990 236 982 274 C1008 282 1036 296 1040 330 Z" fill="${p.body}"/>
      <path d="M780 330 C784 296 812 282 838 274 C830 236 856 208 910 208 C964 208 990 236 982 274 C1008 282 1036 296 1040 330" fill="none" stroke="${p.accent}" stroke-width="1.8" opacity="0.35">
        <animate attributeName="opacity" values="0.2;0.5;0.2" dur="5.5s" repeatCount="indefinite"/>
      </path>
      <path d="M838 256 C838 192 982 192 982 256" fill="none" stroke="${p.metal}" stroke-width="7" stroke-linecap="round"/>
      <path d="M838 256 C838 192 982 192 982 256" fill="none" stroke="${p.accent}" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>
      <rect x="825" y="246" width="21" height="36" rx="10" fill="${p.metal}" stroke="${p.accent}" stroke-width="1"/>
      <rect x="974" y="246" width="21" height="36" rx="10" fill="${p.metal}" stroke="${p.accent}" stroke-width="1"/>
      <circle cx="984" cy="264" r="2.4" fill="${p.accentSoft}">
        <animate attributeName="opacity" values="1;0.15;1" dur="2.4s" repeatCount="indefinite"/>
      </circle>
    </g>

    <g fill="${p.accentSoft}">
      <circle cx="672" cy="300" r="1.2">
        <animate attributeName="cy" values="308;120" dur="16s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.45;0" dur="16s" repeatCount="indefinite"/>
      </circle>
      <circle cx="744" cy="300" r="1">
        <animate attributeName="cy" values="312;140" dur="21s" begin="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.4;0" dur="21s" begin="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="1104" cy="300" r="1.1">
        <animate attributeName="cy" values="306;130" dur="18s" begin="6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.4;0" dur="18s" begin="6s" repeatCount="indefinite"/>
      </circle>
      <circle cx="1178" cy="300" r="1">
        <animate attributeName="cy" values="310;150" dur="24s" begin="9s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.35;0" dur="24s" begin="9s" repeatCount="indefinite"/>
      </circle>
    </g>

    ${rain(p)}
    ${lightning(p)}

    <g font-family="${FONT}">
      <text x="70" y="126" font-size="38" font-weight="700" fill="${p.accent}" filter="url(#soft)" opacity="0.3">RONAEL MOURA
        <animate attributeName="opacity" values="0.16;0.46;0.16" dur="4.5s" repeatCount="indefinite"/>
      </text>

      <text x="70" y="74" font-size="12" fill="${p.accent}" letter-spacing="3">RONAS // BUILD LOG</text>
      <text x="70" y="126" font-size="38" font-weight="700" fill="${p.ink}">RONAEL MOURA</text>

      <line x1="70" y1="140" x2="250" y2="140" stroke="${p.accent}" stroke-width="1.5" stroke-dasharray="180" stroke-dashoffset="180">
        <animate attributeName="stroke-dashoffset" values="180;0;0;180" keyTimes="0;0.35;0.8;1" dur="7s" repeatCount="indefinite"/>
      </line>

      <text x="70" y="166" font-size="16" fill="${p.muted}" letter-spacing="1">full stack developer</text>
      <text x="70" y="192" font-size="11" fill="${p.dim}" letter-spacing="1">react · node · express · mysql</text>

      ${typewriter({
        id: 'tw',
        text: 'problema -> produto -> testes -> deploy',
        x: 70,
        y: 220,
        size: 13,
        fill: p.accent,
        dur: 11,
      })}

      <text x="70" y="242" font-size="10.5" fill="${p.dim}">${esc(clip(commitLine, 52))}</text>

      <g clip-path="url(#titleBox)">
        <rect x="60" y="46" width="520" height="3" fill="${p.accentSoft}" opacity="0.1">
          <animate attributeName="y" values="40;254" dur="9s" repeatCount="indefinite"/>
        </rect>
        <rect x="-160" y="46" width="160" height="212" fill="url(#shine)">
          <animate attributeName="x" values="-160;580" dur="8s" repeatCount="indefinite"/>
        </rect>
      </g>
    </g>

    <rect width="1200" height="320" rx="18" fill="#000" filter="url(#grain)"/>
  </g>
</svg>
`;
}
