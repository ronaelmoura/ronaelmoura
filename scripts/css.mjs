// Animacao em CSS, nao em SMIL.
//
// Motivo: SMIL (<animate>) ignora `prefers-reduced-motion`. Nao existe media
// query capaz de deslidar SMIL. Com @keyframes o navegador respeita quem pediu
// menos movimento — e SVG carregado via <img> roda CSS normalmente.
//
// Duas regras que valem para tudo aqui:
//
// 1. O estado ESTATICO de cada elemento e o estado BOM. A animacao so afasta o
//    elemento desse estado e volta. Assim, com o movimento desligado, a cena
//    continua legivel: o texto aparece inteiro, a linha aparece desenhada, o
//    navio aparece no meio do mar. Nada some.
// 2. Transform e opacity na frente de tudo. Propriedades de geometria (x, width,
//    height) tem suporte irregular em SVG, entao ficam de fora.
//
// O interruptor vai por ultimo e usa !important de proposito: regra de folha de
// estilo com !important vence style inline sem !important, que e como as
// duracoes variaveis sao aplicadas elemento a elemento.

const KEYFRAMES = `
  @keyframes twinkle { 0%,100% { opacity:.15 } 50% { opacity:.7 } }
  @keyframes blink { 0%,49% { opacity:1 } 50%,100% { opacity:0 } }
  @keyframes breathe { 0%,100% { transform:translateY(0) } 50% { transform:translateY(2px) } }
  @keyframes glow { 0%,100% { opacity:.18 } 50% { opacity:.46 } }
  @keyframes softGlow { 0%,100% { opacity:.55 } 50% { opacity:1 } }
  @keyframes rim { 0%,100% { opacity:.2 } 50% { opacity:.5 } }

  @keyframes driftRight { from { transform:translateX(-1720px) } to { transform:translateX(0) } }
  @keyframes driftLeft { from { transform:translateX(0) } to { transform:translateX(-1760px) } }

  @keyframes scrollCode { from { transform:translateY(0) } to { transform:translateY(-130px) } }
  @keyframes sweep { 0% { opacity:.9; transform:translateY(-18px) } 100% { opacity:.9; transform:translateY(130px) } }
  @keyframes scanline { 0% { opacity:.85; transform:translateY(-8px) } 100% { opacity:.85; transform:translateY(210px) } }
  @keyframes shineX { 0% { opacity:1; transform:translateX(-220px) } 100% { opacity:1; transform:translateX(560px) } }

  @keyframes drawLine { 0% { stroke-dashoffset:180 } 35%,80% { stroke-dashoffset:0 } 100% { stroke-dashoffset:180 } }
  @keyframes drawChart { 0% { stroke-dashoffset:180 } 70%,100% { stroke-dashoffset:0 } }

  @keyframes bar { 0%,100% { transform:scaleY(1) } 25% { transform:scaleY(.45) } 60% { transform:scaleY(1.18) } }
  @keyframes eq { 0%,100% { transform:scaleY(.5) } 30% { transform:scaleY(1) } 65% { transform:scaleY(.72) } }

  @keyframes steam { 0% { opacity:0; transform:translateY(0) } 40% { opacity:.5 } 100% { opacity:0; transform:translateY(-17px) } }
  @keyframes rise { 0% { opacity:0; transform:translateY(0) } 30% { opacity:.42 } 100% { opacity:0; transform:translateY(-180px) } }
  @keyframes fall { from { transform:translate(0,0) } to { transform:translate(-18px,80px) } }
  @keyframes flash { 0%,100% { opacity:0 } 1% { opacity:.16 } 2.6% { opacity:.02 } 4% { opacity:.11 } 6.5% { opacity:0 } }

  @keyframes flag { 0%,100% { transform:rotate(-7deg) } 50% { transform:rotate(6deg) } }`;

const BASE = `
  .twk { animation:twinkle 6s ease-in-out infinite }
  .blink { animation:blink 1.1s steps(1,end) infinite }
  .breathe { animation:breathe 6.5s ease-in-out infinite }
  .glow { opacity:.3; animation:glow 4.5s ease-in-out infinite }
  .soft { animation:softGlow 5.5s ease-in-out infinite }
  .rim { opacity:.35; animation:rim 5.5s ease-in-out infinite }
  .cloud-a { animation:driftRight 80s linear infinite }
  .cloud-b { animation:driftLeft 104s linear infinite }
  .code-scroll { animation:scrollCode 11s linear infinite }
  .sweep { opacity:0; animation:sweep 6s linear infinite }
  .scan { opacity:0; animation:scanline 9s linear infinite }
  .shine { opacity:0; animation:shineX 8s linear infinite }
  .draw-line { stroke-dashoffset:0; animation:drawLine 7s ease-in-out infinite }
  .draw-chart { stroke-dashoffset:0; animation:drawChart 5s ease-out infinite }
  .bar { animation:bar 3.4s ease-in-out infinite }
  .eq { animation:eq 1.6s ease-in-out infinite }
  .steam { opacity:0; animation:steam 4.6s ease-out infinite }
  .rise { opacity:0; animation:rise 16s linear infinite }
  .fall { animation:fall .95s linear infinite }
  .flash { opacity:0; animation:flash 19s linear infinite }
  .flag { animation:flag 1.5s ease-in-out infinite }`;

const KILL_SWITCH = `
  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; }
  }`;

/** Bloco <style> completo. `extra` recebe keyframes gerados por render. */
export function styleBlock(extra = '') {
  return `<style>${KEYFRAMES}${BASE}${extra}${KILL_SWITCH}</style>`;
}
