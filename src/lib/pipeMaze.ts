import { seeded, type Vec2 } from './traversal';

// Labirinto de canos gerado aleatoriamente (sempre diferente, mas simples).
// Nós numa grade; ligações: retas (rastejar), escadas (verticais) e diagonais
// (escorregador com água para baixo / rampa escorregadia para cima).

export type EdgeKind = 'reto' | 'escada' | 'diagonal';

export interface MazeNode {
  id: number;
  x: number;
  y: number;
  // Boca do cano na superfície (entrada ou saída)
  mouth?: 'entrada' | 'saida';
}

export interface MazeEdge {
  a: number;
  b: number;
  kind: EdgeKind;
  length: number;
}

export type RewardKind = 'moedas' | 'bonus' | 'power';

export interface MazeReward {
  node: number;
  kind: RewardKind;
  powerUp?: 'laser' | 'super-speed' | 'float' | 'fire-ball' | 'super-jump';
}

export interface PipeMaze {
  id: string;
  nodes: MazeNode[];
  edges: MazeEdge[];
  // Para cada nó, as ligações que saem dele
  links: number[][];
  entrance: number;
  exit: number;
  rewards: MazeReward[];
  bounds: { x1: number; x2: number; y1: number; y2: number };
}

interface MazeOptions {
  id: string;
  // Canto superior esquerdo da grade subterrânea
  origin: Vec2;
  cols: number;
  rows: number;
  cellW?: number;
  cellH?: number;
  // Altura da superfície onde ficam as bocas
  entranceY: number;
  exitY: number;
  seed: number;
}

const POWERS: MazeReward['powerUp'][] = ['laser', 'super-speed', 'float', 'fire-ball', 'super-jump'];

export function generateMaze({ id, origin, cols, rows, cellW = 4.5, cellH = 3, entranceY, exitY, seed }: MazeOptions): PipeMaze {
  const rnd = seeded(seed);
  const nodes: MazeNode[] = [];
  const at = (i: number, j: number) => j * cols + i;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) nodes.push({ id: at(i, j), x: origin.x + i * cellW, y: origin.y - j * cellH });

  // Árvore geradora por busca em profundidade aleatória (todo ponto é alcançável, com becos sem saída)
  const edges: MazeEdge[] = [];
  const visited = new Set<number>([at(0, 0)]);
  const usedDiagonalBlocks = new Set<string>();
  const stack: [number, number][] = [[0, 0]];
  while (stack.length) {
    const [i, j] = stack[stack.length - 1];
    const options: { i: number; j: number; kind: EdgeKind; block?: string }[] = [];
    const push = (ni: number, nj: number, kind: EdgeKind, block?: string) => {
      if (ni < 0 || nj < 0 || ni >= cols || nj >= rows || visited.has(at(ni, nj))) return;
      if (block && usedDiagonalBlocks.has(block)) return;
      options.push({ i: ni, j: nj, kind, block });
    };
    push(i + 1, j, 'reto');
    push(i - 1, j, 'reto');
    push(i, j + 1, 'escada');
    push(i, j - 1, 'escada');
    // Diagonais (um só por bloco 2x2, para os canos não se cruzarem)
    push(i + 1, j + 1, 'diagonal', `${i},${j}`);
    push(i - 1, j + 1, 'diagonal', `${i - 1},${j}`);
    push(i + 1, j - 1, 'diagonal', `${i},${j - 1}`);
    push(i - 1, j - 1, 'diagonal', `${i - 1},${j - 1}`);
    if (!options.length) {
      stack.pop();
      continue;
    }
    const next = options[Math.floor(rnd() * options.length)];
    if (next.block) usedDiagonalBlocks.add(next.block);
    visited.add(at(next.i, next.j));
    const a = nodes[at(i, j)];
    const b = nodes[at(next.i, next.j)];
    edges.push({ a: a.id, b: b.id, kind: next.kind, length: Math.hypot(b.x - a.x, b.y - a.y) });
    stack.push([next.i, next.j]);
  }

  // Bocas: entrada acima do primeiro nó; saída acima do nó mais distante na última coluna
  const links = () => {
    const l: number[][] = nodes.map(() => []);
    edges.forEach((e, k) => {
      l[e.a].push(k);
      l[e.b].push(k);
    });
    return l;
  };
  const dist = distances(nodes.length, edges, at(0, 0));
  const lastCol = Array.from({ length: rows }, (_, j) => at(cols - 1, j));
  const exitNode = lastCol.reduce((best, n) => (dist[n] > dist[best] ? n : best), lastCol[0]);

  const entrance: MazeNode = { id: nodes.length, x: nodes[at(0, 0)].x, y: entranceY, mouth: 'entrada' };
  const exit: MazeNode = { id: nodes.length + 1, x: nodes[exitNode].x, y: exitY, mouth: 'saida' };
  nodes.push(entrance, exit);
  edges.push({ a: entrance.id, b: at(0, 0), kind: 'escada', length: Math.abs(entranceY - nodes[at(0, 0)].y) });
  edges.push({ a: exitNode, b: exit.id, kind: 'escada', length: Math.abs(exitY - nodes[exitNode].y) });

  const finalLinks = links();
  // Recompensas nos becos sem saída (pontos remotos)
  const rewards: MazeReward[] = [];
  finalLinks.forEach((l, n) => {
    if (l.length !== 1 || nodes[n].mouth) return;
    const r = rnd();
    if (r < 0.4) rewards.push({ node: n, kind: 'moedas' });
    else if (r < 0.7) rewards.push({ node: n, kind: 'bonus' });
    else rewards.push({ node: n, kind: 'power', powerUp: POWERS[Math.floor(rnd() * POWERS.length)] });
  });

  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  return {
    id,
    nodes,
    edges,
    links: finalLinks,
    entrance: entrance.id,
    exit: exit.id,
    rewards,
    bounds: { x1: Math.min(...xs), x2: Math.max(...xs), y1: Math.min(...ys), y2: Math.max(...ys) },
  };
}

function distances(n: number, edges: MazeEdge[], from: number) {
  const adj: number[][] = Array.from({ length: n }, () => []);
  edges.forEach((e) => {
    adj[e.a].push(e.b);
    adj[e.b].push(e.a);
  });
  const d = Array(n).fill(Infinity);
  d[from] = 0;
  const q = [from];
  while (q.length) {
    const cur = q.shift()!;
    for (const nb of adj[cur]) if (d[nb] === Infinity) (d[nb] = d[cur] + 1), q.push(nb);
  }
  return d;
}

// Direção de um nó para o outro numa ligação
export function edgeDir(maze: PipeMaze, edgeIndex: number, from: number) {
  const e = maze.edges[edgeIndex];
  const to = e.a === from ? e.b : e.a;
  const a = maze.nodes[from];
  const b = maze.nodes[to];
  return { to, dx: (b.x - a.x) / e.length, dy: (b.y - a.y) / e.length };
}
