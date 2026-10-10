import { create } from 'zustand';

interface GameState {
  score: number;
  lives: number;
  level: number;
  collectedCoins: number;
  activePowerUp: string | null;
  playerName: 'david' | 'yohann';
  isDuelActive: boolean;
  currentNPC: {
    name: string;
    health: number;
    maxHealth: number;
  } | null;
}

interface GameActions {
  addScore: (points: number) => void;
  loseLife: () => void;
  gainLife: () => void;
  setActivePowerUp: (powerUp: string | null) => void;
  setLevel: (level: number) => void;
  addCoin: () => void;
  startDuel: (npc: { name: string; health: number; maxHealth: number }) => void;
  endDuel: () => void;
  damageNPC: (damage: number) => void;
  reset: () => void;
}

const initialState: GameState = {
  score: 0,
  lives: 3,
  level: 1,
  collectedCoins: 0,
  activePowerUp: null,
  playerName: 'david',
  isDuelActive: false,
  currentNPC: null,
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,
  addScore: (points) => set((state) => ({ score: state.score + points })),
  loseLife: () => set((state) => ({ lives: Math.max(0, state.lives - 1) })),
  gainLife: () => set((state) => ({ lives: state.lives + 1 })),
  setActivePowerUp: (powerUp) => set({ activePowerUp: powerUp }),
  setLevel: (level) => set({ level }),
  addCoin: () => set((state) => ({ collectedCoins: state.collectedCoins + 1, score: state.score + 100 })),
  startDuel: (npc) => set({ isDuelActive: true, currentNPC: npc }),
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
  reset: () => set(initialState),
}));
