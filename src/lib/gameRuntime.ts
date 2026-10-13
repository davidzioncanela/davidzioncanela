// Estado mutável compartilhado entre componentes do loop de jogo.
// Fica fora do React para não causar re-render a cada frame.
import type { CharacterId } from './characters';

export type Vec3 = { x: number; y: number; z: number };

export interface PlayerRuntime {
  id: CharacterId;
  position: Vec3;
  velocity: Vec3;
  facing: 1 | -1;
  grounded: boolean;
  // Controlado neste aparelho (false = jogador remoto da sessão online)
  local: boolean;
  // Empurrão vindo de golpes ou de poderes, aplicado pelo próprio jogador
  pendingImpulse: Vec3 | null;
  // Reposicionamento pedido pelo jogo (ex.: puxar para dentro da arena da horda)
  pendingTeleport: Vec3 | null;
  animation: string;
}

export const players = new Map<CharacterId, PlayerRuntime>();

export function registerPlayer(id: CharacterId, local: boolean, position: Vec3): PlayerRuntime {
  const p: PlayerRuntime = { id, position, velocity: { x: 0, y: 0, z: 0 }, facing: 1, grounded: false, local, pendingImpulse: null, pendingTeleport: null, animation: 'Idle' };
  players.set(id, p);
  return p;
}

export function nearestPlayer(x: number, y: number): PlayerRuntime | null {
  let best: PlayerRuntime | null = null;
  let bestDist = Infinity;
  players.forEach((p) => {
    const d = Math.hypot(p.position.x - x, p.position.y - y);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  });
  return best;
}

export function playerSpan(localOnly: boolean) {
  let minX = Infinity;
  let maxX = -Infinity;
  let sumY = 0;
  let n = 0;
  players.forEach((p) => {
    if (localOnly && !p.local) return;
    minX = Math.min(minX, p.position.x);
    maxX = Math.max(maxX, p.position.x);
    sumY += p.position.y;
    n++;
  });
  if (n === 0) return null;
  return { minX, maxX, centerX: (minX + maxX) / 2, avgY: sumY / n };
}

export interface EnemyEntry {
  getPosition: () => Vec3;
  hit: (damage: number, fromX: number) => void;
  alive: () => boolean;
}

export const enemyRegistry = new Map<string, EnemyEntry>();

export function findEnemyNear(x: number, y: number, radius: number): EnemyEntry | null {
  let best: EnemyEntry | null = null;
  let bestDist = radius;
  enemyRegistry.forEach((enemy) => {
    if (!enemy.alive()) return;
    const p = enemy.getPosition();
    // Corpo do inimigo tem ~1.6 de altura a partir dos pés
    const dy = Math.max(0, Math.abs(y - (p.y + 0.8)) - 0.8);
    const dist = Math.hypot(p.x - x, dy);
    if (dist < bestDist) {
      bestDist = dist;
      best = enemy;
    }
  });
  return best;
}

// Acesso de depuração pelo console do navegador (só em desenvolvimento)
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as { __players: typeof players }).__players = players;
}
