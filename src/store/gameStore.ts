import { create } from 'zustand';

export type PowerUpType = 'laser' | 'super-speed' | 'float' | 'fire-ball' | 'super-jump';

export const POWER_UP_DURATION = 15;

export interface EnemyHud {
  id: string;
  name: string;
  power: string;
  color: string;
  health: number;
  maxHealth: number;
}

export interface Projectile {
  id: number;
  kind: 'laser' | 'fire-ball';
  x: number;
  y: number;
  dir: 1 | -1;
  owner: 'player' | 'enemy';
}

interface GameState {
  score: number;
  lives: number;
  level: number;
  collectedCoins: number;
  activePowerUp: PowerUpType | null;
  powerUpTimeLeft: number;
  playerName: 'david' | 'yohann';
  // Inimigos vivos na onda atual (para o HUD)
  enemies: EnemyHud[];
  // Trava de tela durante uma onda: o jogador não passa destes limites
  screenLock: [number, number] | null;
  invulnerableUntil: number;
  projectiles: Projectile[];
}

interface GameActions {
  addScore: (points: number) => void;
  loseLife: () => void;
  gainLife: () => void;
  hurtPlayer: () => boolean;
  setActivePowerUp: (powerUp: PowerUpType | null) => void;
  tickPowerUp: (delta: number) => void;
  setLevel: (level: number) => void;
  addCoin: () => void;
  upsertEnemy: (enemy: EnemyHud) => void;
  removeEnemy: (id: string) => void;
  setScreenLock: (lock: [number, number] | null) => void;
  spawnProjectile: (p: Omit<Projectile, 'id'>) => void;
  removeProjectile: (id: number) => void;
  reset: () => void;
}

const initialState: GameState = {
  score: 0,
  lives: 5,
  level: 1,
  collectedCoins: 0,
  activePowerUp: null,
  powerUpTimeLeft: 0,
  playerName: 'david',
  enemies: [],
  screenLock: null,
  invulnerableUntil: 0,
  projectiles: [],
};

let nextProjectileId = 1;
// Tempo exato restante; o store guarda só o valor exibido no HUD
let powerUpRemaining = 0;

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,
  addScore: (points) => set((state) => ({ score: state.score + points })),
  loseLife: () => set((state) => ({ lives: Math.max(0, state.lives - 1) })),
  gainLife: () => set((state) => ({ lives: state.lives + 1 })),
  // Retorna true se o dano foi aplicado (respeita invencibilidade temporária)
  hurtPlayer: () => {
    const now = performance.now();
    if (now < get().invulnerableUntil) return false;
    set((state) => ({ lives: Math.max(0, state.lives - 1), invulnerableUntil: now + 2500 }));
    return true;
  },
  setActivePowerUp: (powerUp) => {
    powerUpRemaining = powerUp ? POWER_UP_DURATION : 0;
    set({ activePowerUp: powerUp, powerUpTimeLeft: powerUpRemaining });
  },
  tickPowerUp: (delta) => {
    if (!get().activePowerUp) return;
    powerUpRemaining -= delta;
    if (powerUpRemaining <= 0) set({ activePowerUp: null, powerUpTimeLeft: 0 });
    // Atualiza o HUD só quando o segundo inteiro muda
    else if (Math.ceil(powerUpRemaining) !== get().powerUpTimeLeft) set({ powerUpTimeLeft: Math.ceil(powerUpRemaining) });
  },
  setLevel: (level) => set({ level }),
  addCoin: () => set((state) => ({ collectedCoins: state.collectedCoins + 1, score: state.score + 100 })),
  upsertEnemy: (enemy) =>
    set((state) => ({
      enemies: state.enemies.some((e) => e.id === enemy.id) ? state.enemies.map((e) => (e.id === enemy.id ? enemy : e)) : [...state.enemies, enemy],
    })),
  removeEnemy: (id) => set((state) => ({ enemies: state.enemies.filter((e) => e.id !== id) })),
  setScreenLock: (lock) => set({ screenLock: lock }),
  spawnProjectile: (p) => set((state) => ({ projectiles: [...state.projectiles, { ...p, id: nextProjectileId++ }] })),
  removeProjectile: (id) => set((state) => ({ projectiles: state.projectiles.filter((p) => p.id !== id) })),
  reset: () => {
    powerUpRemaining = 0;
    set(initialState);
  },
}));
