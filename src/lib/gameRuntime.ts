// Estado mutável compartilhado entre componentes do loop de jogo.
// Fica fora do React para não causar re-render a cada frame.

export type Vec3 = { x: number; y: number; z: number };

export const playerRuntime = {
  position: { x: 0, y: 0, z: 0 } as Vec3,
  velocity: { x: 0, y: 0, z: 0 } as Vec3,
  facing: 1 as 1 | -1,
  grounded: false,
  // Empurrão vindo de golpes inimigos, aplicado pelo próprio jogador
  pendingKnockback: null as Vec3 | null,
};

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
  (window as unknown as { __player: typeof playerRuntime }).__player = playerRuntime;
}
