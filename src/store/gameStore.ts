import { create } from 'zustand';

export type PowerUpType = 'laser' | 'super-speed' | 'float' | 'fire-ball' | 'super-jump';

export const POWER_UP_DURATION = 15;

export interface Projectile {
  id: number;
  kind: 'laser' | 'fire-ball';
  x: number;
  y: number;
  dir: 1 | -1;
}

interface GameState {
  score: number;
  lives: number;
  level: number;
  collectedCoins: number;
  activePowerUp: PowerUpType | null;
  powerUpTimeLeft: number;
  playerName: 'david' | 'yohann';
  isDuelActive: boolean;
  currentNPC: {
    name: string;
    health: number;
    maxHealth: number;
  } | null;
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
  startDuel: (npc: { name: string; health: number; maxHealth: number }) => void;
  updateDuelHealth: (health: number) => void;
  endDuel: () => void;
  damageNPC: (damage: number) => void;
  spawnProjectile: (p: Omit<Projectile, 'id'>) => void;
  removeProjectile: (id: number) => void;
  reset: () => void;
}

const initialState: GameState = {
  score: 0,
  lives: 3,
  level: 1,
  collectedCoins: 0,
  activePowerUp: null,
  powerUpTimeLeft: 0,
  playerName: 'david',
  isDuelActive: false,
  currentNPC: null,
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
    set((state) => ({ lives: Math.max(0, state.lives - 1), invulnerableUntil: now + 1500 }));
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
  startDuel: (npc) => set({ isDuelActive: true, currentNPC: npc }),
  updateDuelHealth: (health) => {
    const currentNPC = get().currentNPC;
    if (currentNPC) set({ currentNPC: { ...currentNPC, health } });
  },
  endDuel: () => set({ isDuelActive: false, currentNPC: null }),
  damageNPC: (damage) => {
    const currentNPC = get().currentNPC;
    if (currentNPC) {
      const newHealth = Math.max(0, currentNPC.health - damage);
      if (newHealth === 0) {
        set({ currentNPC: { ...currentNPC, health: 0 }, isDuelActive: false });
      } else {
        set({ currentNPC: { ...currentNPC, health: newHealth } });
      }
    }
  },
  spawnProjectile: (p) => set((state) => ({ projectiles: [...state.projectiles, { ...p, id: nextProjectileId++ }] })),
  removeProjectile: (id) => set((state) => ({ projectiles: state.projectiles.filter((p) => p.id !== id) })),
  reset: () => {
    powerUpRemaining = 0;
    set(initialState);
  },
}));
