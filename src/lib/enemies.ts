import { generateRandomNPCName } from './npcNames';

import type { ModelName } from '@/components/game/characters/CharacterModel';

export type EnemyPowerId = 'fogo' | 'raio' | 'veloz' | 'saltador' | 'gigante' | 'monstrinho';

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
  model: ModelName;
}

export const ENEMY_POWERS: Record<EnemyPowerId, EnemyPower> = {
  // Nos desafios (hordas) os monstros são maiores
  fogo: { id: 'fogo', label: 'Bola de fogo', color: '#F97316', health: 40, speed: 1.8, height: 1.7, ranged: 'fire-ball', attackCooldown: 2.2, model: 'skMage' },
  raio: { id: 'raio', label: 'Raio laser', color: '#22D3EE', health: 35, speed: 1.5, height: 1.7, ranged: 'laser', attackCooldown: 2.6, model: 'skMage' },
  veloz: { id: 'veloz', label: 'Super veloz', color: '#FACC15', health: 30, speed: 5, height: 1.6, attackCooldown: 1.2, model: 'skRogue' },
  saltador: { id: 'saltador', label: 'Saltador', color: '#4ADE80', health: 35, speed: 2.5, height: 1.6, attackCooldown: 1.4, jumps: true, model: 'skRogue' },
  gigante: { id: 'gigante', label: 'Gigante', color: '#EF4444', health: 120, speed: 1.6, height: 2.8, attackCooldown: 1.6, model: 'skWarrior' },
  // Durante a fase: monstrinhos pequenos que patrulham (pulando na cabeça eles caem)
  monstrinho: { id: 'monstrinho', label: 'Monstrinho', color: '#A3E635', health: 15, speed: 2, height: 0.95, attackCooldown: 1.5, model: 'minion' },
};

export type EnemyEntry = 'left' | 'right' | 'sky' | 'ground';

export interface EnemySpawn {
  id: string;
  name: string;
  power: EnemyPower;
  position: [number, number, number];
  entry: EnemyEntry;
  // Tom de cor sorteado (variedade entre monstros iguais)
  tint: string;
  // Monstrinho de patrulha (fora das hordas)
  field?: boolean;
  // Multiplicadores da dificuldade da sessão
  healthScale: number;
  attackSpeed: number;
}

const RANDOM_POWERS: EnemyPowerId[] = ['fogo', 'raio', 'veloz', 'saltador'];

// Tons para variar a cor dos monstros
const TINTS = ['#FFFFFF', '#C7F9CC', '#FFD6E0', '#D0E1FF', '#FFE5B4', '#E0C3FC', '#B8F2E6'];

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
  const tint = TINTS[Math.floor(Math.random() * TINTS.length)];
  return { id, name: generateRandomNPCName(), power: ENEMY_POWERS[powerId], position, entry, tint, healthScale: scale.health, attackSpeed: scale.attackSpeed, field: powerId === 'monstrinho' };
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
