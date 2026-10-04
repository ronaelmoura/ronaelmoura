import { mkdir, readFile, writeFile } from 'node:fs/promises';

const USERNAME = process.env.GITHUB_USERNAME || 'ronaelmoura';
const TOKEN = process.env.GH_TRAFFIC_TOKEN;
const HISTORY_PATH = 'data/traffic-history.json';
const README_PATH = 'README.md';
const API_VERSION = '2026-03-10';

if (!TOKEN) {
  throw new Error('GH_TRAFFIC_TOKEN nao configurado. Crie o secret TRAFFIC_TOKEN no repositorio.');
}

const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${TOKEN}`,
  'X-GitHub-Api-Version': API_VERSION,
  'User-Agent': `${USERNAME}-profile-traffic`,
};

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = body?.message ? `: ${body.message}` : '';
    } catch {}
    throw new Error(`GitHub API ${response.status} em ${path}${detail}`);
  }
  return response.json();
}

async function listPublicOwnedRepositories() {
  const repositories = [];

  for (let page = 1; ; page += 1) {
    const batch = await github(
      `/user/repos?affiliation=owner&visibility=public&sort=full_name&direction=asc&per_page=100&page=${page}`,
    );

    repositories.push(
      ...batch.filter(
        (repo) =>
          repo.owner?.login?.toLowerCase() === USERNAME.toLowerCase() &&
          !repo.archived &&
          !repo.disabled &&
          !repo.fork,
      ),
    );

    if (batch.length < 100) break;
  }

  return repositories;
}

async function loadHistory() {
  try {
    return JSON.parse(await readFile(HISTORY_PATH, 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    return {
      version: 1,
      startedAt: new Date().toISOString(),
      updatedAt: null,
      repositories: {},
    };
  }
}

function utcDay(timestamp) {
  return timestamp.slice(0, 10);
}

function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(value || 0);
}

function formatDateTime(timestamp) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Fortaleza',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function sumRecordedViews(repoHistory) {
  return Object.values(repoHistory.daily || {}).reduce((sum, day) => sum + (day.views || 0), 0);
}

function updateDaily(historyEntry, views, clones) {
  historyEntry.daily ||= {};

  for (const item of views.views || []) {
    const day = utcDay(item.timestamp);
    historyEntry.daily[day] = {
      ...(historyEntry.daily[day] || {}),
      views: item.count,
      uniqueVisitorsDaily: item.uniques,
    };
  }

  for (const item of clones.clones || []) {
    const day = utcDay(item.timestamp);
    historyEntry.daily[day] = {
      ...(historyEntry.daily[day] || {}),
      clones: item.count,
      uniqueClonersDaily: item.uniques,
    };
  }
}

function buildRanking(history, activeRepoNames) {
  return activeRepoNames
    .map((name) => {
      const repo = history.repositories[name];
      return {
        name,
        url: repo.url,
        views14d: repo.latest14Days?.views || 0,
        uniqueVisitors14d: repo.latest14Days?.uniqueVisitors || 0,
        clones14d: repo.latest14Days?.clones || 0,
        uniqueCloners14d: repo.latest14Days?.uniqueCloners || 0,
        recordedViews: sumRecordedViews(repo),
      };
    })
    .sort(
      (a, b) =>
        b.views14d - a.views14d ||
        b.uniqueVisitors14d - a.uniqueVisitors14d ||
        b.clones14d - a.clones14d ||
        a.name.localeCompare(b.name),
    );
}

function renderTrafficSection(history, ranking) {
  const top = ranking.slice(0, 8);
  const collectedAt = history.updatedAt;
  const startedAt = history.startedAt;

  const rows = top.length
    ? top
        .map(
          (repo, index) =>
            `| ${index + 1} | [\`${repo.name}\`](${repo.url}) | **${formatNumber(repo.views14d)}** | ${formatNumber(repo.uniqueVisitors14d)} | ${formatNumber(repo.clones14d)} | ${formatNumber(repo.recordedViews)} |`,
        )
        .join('\n')
    : '| — | Nenhum dado disponível ainda | — | — | — | — |';

  const totalRecordedViews = ranking.reduce((sum, repo) => sum + repo.recordedViews, 0);

  return `## Repositórios mais acessados\n\n<!-- TRAFFIC-STATS:START -->\n<p align="center"><sub>Dados reais do GitHub Traffic · janela móvel de 14 dias · atualização automática a cada 6 horas</sub></p>\n\n| # | Repositório | Visualizações · 14d | Visitantes únicos · 14d | Clones · 14d | Views registradas |\n| :---: | --- | ---: | ---: | ---: | ---: |\n${rows}\n\n<p align="center"><sub>Última coleta: ${formatDateTime(collectedAt)} · histórico iniciado em ${formatDateTime(startedAt)} · ${formatNumber(totalRecordedViews)} visualizações acumuladas no histórico local.</sub></p>\n\n<details>\n<summary><code>$ como-o-ranking-funciona</code></summary>\n\n<br />\n\nO ranking usa a contagem real de visualizações do GitHub Traffic dos últimos 14 dias. O GitHub só fornece essa janela móvel, então este repositório salva os totais diários em <code>data/traffic-history.json</code> para preservar um histórico próprio. Visitantes únicos e clonadores únicos são exibidos apenas para a janela atual de 14 dias, porque somar valores únicos de dias diferentes causaria dupla contagem.\n\n</details>\n<!-- TRAFFIC-STATS:END -->`;
}

async function updateReadme(history, ranking) {
  const readme = await readFile(README_PATH, 'utf8');
  const section = renderTrafficSection(history, ranking);
  const markerPattern = /## Repositórios mais acessados\n\n<!-- TRAFFIC-STATS:START -->[\s\S]*?<!-- TRAFFIC-STATS:END -->/;
  const legacyPattern = /## Repositórios em destaque\n[\s\S]*?(?=\n## Atividade\n)/;

  let next;
  if (markerPattern.test(readme)) {
    next = readme.replace(markerPattern, section);
  } else if (legacyPattern.test(readme)) {
    next = readme.replace(legacyPattern, `${section}\n`);
  } else {
    throw new Error('Nao encontrei a secao de repositorios no README para atualizar com seguranca.');
  }

  if (next !== readme) await writeFile(README_PATH, next, 'utf8');
}

async function main() {
  const history = await loadHistory();
  const repositories = await listPublicOwnedRepositories();
  const activeRepoNames = [];
  const capturedAt = new Date().toISOString();

  console.log(`Coletando trafego de ${repositories.length} repositorios publicos ativos de ${USERNAME}...`);

  for (const repo of repositories) {
    try {
      const [views, clones] = await Promise.all([
        github(`/repos/${USERNAME}/${repo.name}/traffic/views?per=day`),
        github(`/repos/${USERNAME}/${repo.name}/traffic/clones?per=day`),
      ]);

      const entry = (history.repositories[repo.name] ||= {
        url: repo.html_url,
        firstSeenAt: capturedAt,
        daily: {},
      });

      entry.url = repo.html_url;
      entry.active = true;
      entry.lastCollectedAt = capturedAt;
      entry.latest14Days = {
        views: views.count || 0,
        uniqueVisitors: views.uniques || 0,
        clones: clones.count || 0,
        uniqueCloners: clones.uniques || 0,
      };
      updateDaily(entry, views, clones);
      activeRepoNames.push(repo.name);

      console.log(`${repo.name}: ${entry.latest14Days.views} views / ${entry.latest14Days.uniqueVisitors} visitantes unicos (14d)`);
    } catch (error) {
      console.error(`Falha em ${repo.name}: ${error.message}`);
    }
  }

  if (activeRepoNames.length === 0) {
    throw new Error('Nenhum repositorio teve o trafego coletado. Verifique as permissoes do TRAFFIC_TOKEN.');
  }

  for (const [name, entry] of Object.entries(history.repositories)) {
    entry.active = activeRepoNames.includes(name);
  }

  history.updatedAt = capturedAt;
  history.repositoriesCollected = activeRepoNames.length;

  const ranking = buildRanking(history, activeRepoNames);
  await mkdir('data', { recursive: true });
  await writeFile(HISTORY_PATH, `${JSON.stringify(history, null, 2)}\n`, 'utf8');
  await updateReadme(history, ranking);

  console.log('Historico e README atualizados.');
}

await main();
