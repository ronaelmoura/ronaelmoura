// Busca os dados que alimentam a arte.
// Regra da casa: nada aqui pode derrubar a geracao. Se a fonte falhar, devolve
// null e os templates caem para um valor estatico.

const USER = 'ronaelmoura';
const TOKEN = process.env.GITHUB_TOKEN;

function headers() {
  const h = {
    Accept: 'application/vnd.github+json',
    'User-Agent': `${USER}-profile-art`,
  };
  if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
  return h;
}

async function rest(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers: headers() });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
}

async function safe(label, fn, fallback) {
  try {
    return await fn();
  } catch (err) {
    console.warn(`! ${label}: ${err.message} (usando fallback)`);
    return fallback;
  }
}

/**
 * Contribuicoes por semana no ultimo ano.
 *
 * Le o mesmo fragmento HTML que o GitHub usa para desenhar o quadro de
 * contribuicoes no perfil. Nao precisa de token, o que mantem a geracao
 * funcionando local e na Action sem depender de escopo extra.
 *
 * O id de cada celula (`contribution-day-component-<linha>-<coluna>`) ja diz a
 * qual semana o dia pertence, e o tooltip correspondente carrega a contagem
 * real — nao so o nivel de 0 a 4.
 */
export function contributions() {
  return safe(
    'contribuicoes',
    async () => {
      const res = await fetch(`https://github.com/users/${USER}/contributions`, {
        headers: { 'User-Agent': `${USER}-profile-art` },
      });
      if (!res.ok) throw new Error(`contributions -> ${res.status}`);
      const html = await res.text();

      const byWeek = new Map();
      const re = /<tool-tip[^>]*for="contribution-day-component-\d+-(\d+)"[^>]*>([^<]*)<\/tool-tip>/g;
      let match;
      while ((match = re.exec(html)) !== null) {
        const week = Number(match[1]);
        const count = /^\s*(\d+)\s+contribution/i.exec(match[2]);
        byWeek.set(week, (byWeek.get(week) ?? 0) + (count ? Number(count[1]) : 0));
      }
      if (!byWeek.size) throw new Error('nenhuma celula encontrada');

      const weeks = [...byWeek.entries()].sort((a, b) => a[0] - b[0]).map(([, sum]) => sum);
      const header = /([\d,.]+)\s+contributions?\s+in\s+the\s+last\s+year/i.exec(html);
      const total = header ? Number(header[1].replace(/[,.]/g, '')) : weeks.reduce((a, b) => a + b, 0);

      return { weeks, total };
    },
    null,
  );
}

/**
 * Ultimo push publico.
 * O feed de eventos so entrega o SHA do head, entao a mensagem vem de uma
 * segunda chamada no repositorio.
 */
export function latestCommit() {
  return safe(
    'ultimo commit',
    async () => {
      const events = await rest(`/users/${USER}/events/public?per_page=100`);
      const push = events.find((e) => e.type === 'PushEvent' && e.payload?.head);
      if (!push) return null;

      const [owner, repo] = push.repo.name.split('/');
      const commit = await rest(`/repos/${owner}/${repo}/commits/${push.payload.head}`);
      return {
        repo,
        message: commit.commit.message.split('\n')[0],
        at: push.created_at,
      };
    },
    null,
  );
}

/** Conclusao da ultima execucao do CI de um repositorio. */
export function ciStatus(repo, workflow = 'ci.yml') {
  return safe(
    `ci ${repo}`,
    async () => {
      const data = await rest(
        `/repos/${USER}/${repo}/actions/workflows/${workflow}/runs?per_page=1&branch=main`,
      );
      const run = data.workflow_runs?.[0];
      if (!run) return null;
      if (run.status !== 'completed') return 'rodando';
      return run.conclusion === 'success' ? 'ok' : 'falhou';
    },
    null,
  );
}

/** Tag da ultima release, se houver. */
export function latestRelease(repo) {
  return safe(
    `release ${repo}`,
    async () => {
      const data = await rest(`/repos/${USER}/${repo}/releases/latest`);
      return data.tag_name || null;
    },
    null,
  );
}

/** "ha 2h", "ha 3d" — texto curto para caber na arte. */
export function humanAge(iso) {
  if (!iso) return null;
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `ha ${Math.max(minutes, 1)}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `ha ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `ha ${days}d`;
  return `ha ${Math.floor(days / 30)} meses`;
}
