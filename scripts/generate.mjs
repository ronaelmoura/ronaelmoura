// Gera a arte do perfil: banner + Perola Negra, em tema claro e escuro.
// Rodado de hora em hora pela Action, ou localmente com `node scripts/generate.mjs`.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { periodOf, paletteFor } from './palette.mjs';
import { contributions, latestCommit, ciStatus, latestRelease, humanAge } from './data.mjs';
import { renderBanner } from './banner.mjs';
import { renderPearl } from './pearl.mjs';

const assets = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');

async function main() {
  const period = periodOf();
  console.log(`periodo: ${period}`);

  const [contrib, commit, ci, version] = await Promise.all([
    contributions(),
    latestCommit(),
    ciStatus('ronas-desk'),
    latestRelease('ronas-desk'),
  ]);

  const weeks = contrib?.weeks ?? null;
  const total = contrib?.total ?? null;
  const live = { commit, ci, version, age: humanAge(commit?.at) };
  console.log(
    `dados: ${weeks ? `${weeks.length} semanas / ${total} contribuicoes` : 'sem contribuicoes'} | ` +
      `${commit ? `${commit.repo} ${live.age}` : 'sem commit'} | ci ${ci ?? 'n/d'}`,
  );

  await mkdir(assets, { recursive: true });

  const files = [
    ['ronas-motion.svg', renderBanner({ palette: paletteFor(period, 'dark'), live })],
    ['ronas-motion-light.svg', renderBanner({ palette: paletteFor(period, 'light'), live })],
    ['black-pearl-sailing.svg', renderPearl({ palette: paletteFor(period, 'dark'), weeks, total })],
    ['black-pearl-sailing-light.svg', renderPearl({ palette: paletteFor(period, 'light'), weeks, total })],
  ];

  for (const [name, svg] of files) {
    await writeFile(join(assets, name), svg, 'utf8');
    console.log(`escrito: assets/${name} (${(svg.length / 1024).toFixed(1)} KB)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
