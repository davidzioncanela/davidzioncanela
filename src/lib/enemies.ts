import { generateRandomNPCName } from './npcNames';

export type EnemyPowerId = 'fogo' | 'raio' | 'veloz' | 'saltador' | 'gigante';

export interface EnemyPower {
  id: EnemyPowerId;
  label: string;
  color: string;
  health: number;
  speed: number;
  height: number;
  // Projétil disparado à distância (se houver)
  ranged?: 'fire-ball' | 'laser';
  attackCooldown: number;
  // Saltador pula em direção ao jogador
  jumps?: boolean;
}

export const ENEMY_POWERS: Record<EnemyPowerId, EnemyPower> = {
  fogo: { id: 'fogo', label: 'Bola de fogo', color: '#F97316', health: 40, speed: 1.8, height: 1.3, ranged: 'fire-ball', attackCooldown: 2.2 },
  raio: { id: 'raio', label: 'Raio laser', color: '#22D3EE', health: 35, speed: 1.5, height: 1.3, ranged: 'laser', attackCooldown: 2.6 },
  veloz: { id: 'veloz', label: 'Super veloz', color: '#FACC15', health: 30, speed: 5, height: 1.2, attackCooldown: 1.2 },
  saltador: { id: 'saltador', label: 'Saltador', color: '#4ADE80', health: 35, speed: 2.5, height: 1.2, attackCooldown: 1.4, jumps: true },
  gigante: { id: 'gigante', label: 'Gigante', color: '#EF4444', health: 120, speed: 1.6, height: 2, attackCooldown: 1.6 },
};

export type EnemyEntry = 'left' | 'right' | 'sky' | 'ground';

export interface EnemySpawn {
  id: string;
  name: string;
  power: EnemyPower;
  position: [number, number, number];
  entry: EnemyEntry;
  // Multiplicadores da dificuldade da sessão
  healthScale: number;
  attackSpeed: number;
}

const RANDOM_POWERS: EnemyPowerId[] = ['fogo', 'raio', 'veloz', 'saltador'];

export function randomPower(): EnemyPowerId {
  return RANDOM_POWERS[Math.floor(Math.random() * RANDOM_POWERS.length)];
}

// Cria um inimigo com nome e poder sorteados (ou poder fixo, ex.: chefe gigante)
export function makeEnemy(
  id: string,
  position: [number, number, number],
  entry: EnemyEntry,
  powerId: EnemyPowerId,
  scale: { health: number; attackSpeed: number }
): EnemySpawn {
  return { id, name: generateRandomNPCName(), power: ENEMY_POWERS[powerId], position, entry, healthScale: scale.health, attackSpeed: scale.attackSpeed };
}

// Uma leva da horda: vários inimigos chegando juntos por um mesmo lugar
export interface WaveGroup {
  // Segundos após o início da onda
  delay: number;
  from: EnemyEntry;
  count: number;
  power?: EnemyPowerId;
}

export interface Wave {
  // A onda começa quando o primeiro jogador passa deste X
  triggerX: number;
  // Arena onde a tela trava (estilo Metal Slug): limites X e altura do chão
  arena: { left: number; right: number; floorY: number };
  groups: WaveGroup[];
}
