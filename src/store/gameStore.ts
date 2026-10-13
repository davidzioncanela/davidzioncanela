import { create } from 'zustand';
import type { CharacterId } from '@/lib/characters';
import type { NetWorld } from '@/lib/protocol';
import { isGuest, sendEvent } from '@/lib/net';

export type PowerUpType = 'laser' | 'super-speed' | 'float' | 'fire-ball' | 'super-jump';

export const POWER_UP_DURATION = 15;
export const MAX_LIVES = 9;
const INVULNERABLE_MS = 2500;

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
  // Projétil de outro aparelho: só aparece, quem calcula o dano é quem atirou
  visual?: boolean;
}

// Estado de cada jogador exibido no HUD
export interface PlayerHud {
  powerUp: PowerUpType | null;
  powerUpTimeLeft: number;
  helpCooldownLeft: number;
  invulnerableUntil: number;
  shieldUntil: number;
  // Fôlego embaixo d'água (0 a 1)
  breath: number;
}

const emptyPlayer = (): PlayerHud => ({ powerUp: null, powerUpTimeLeft: 0, helpCooldownLeft: 0, invulnerableUntil: 0, shieldUntil: 0, breath: 1 });

interface GameState {
  score: number;
  // Vidas compartilhadas pelo time
  lives: number;
  level: number;
  collectedCoins: number;
  playerCount: number;
  players: Partial<Record<CharacterId, PlayerHud>>;
  // Grito de coragem do Dávid: dano dobrado até este instante
  damageBoostUntil: number;
  // Inimigos vivos na onda atual (para o HUD)
  enemies: EnemyHud[];
  // Trava de tela durante uma onda: ninguém passa destes limites
  screenLock: [number, number] | null;
  projectiles: Projectile[];
  // Escurece a tela ao passar por uma porta
  fadeAt: number;
  // Nós já descobertos em cada labirinto de canos (para o minimapa)
  discovered: Record<string, number[]>;
  // Moedas e caixas já pegas (somem em todos os aparelhos da sessão)
  pickedUp: string[];
}

interface GameActions {
  addScore: (points: number) => void;
  loseLife: () => void;
  gainLife: () => void;
  // Retorna true se o dano foi aplicado (respeita invencibilidade e escudo)
  hurtPlayer: (id: CharacterId) => boolean;
  setPowerUp: (id: CharacterId, powerUp: PowerUpType | null) => void;
  // Atualiza temporizadores do jogador (só re-renderiza quando o segundo inteiro muda)
  tickPlayer: (id: CharacterId, delta: number) => void;
  startHelpCooldown: (id: CharacterId, seconds: number) => void;
  giveShield: (id: CharacterId, seconds: number) => void;
  boostDamage: (seconds: number) => void;
  addCoin: () => void;
  upsertEnemy: (enemy: EnemyHud) => void;
  removeEnemy: (id: string) => void;
  setScreenLock: (lock: [number, number] | null) => void;
  spawnProjectile: (p: Omit<Projectile, 'id'>) => void;
  removeProjectile: (id: number) => void;
  markPicked: (key: string) => void;
  setBreath: (id: CharacterId, breath: number) => void;
  fade: () => void;
  // Marca um nó do labirinto como descoberto; retorna true se era novo
  discover: (maze: string, node: number) => boolean;
  // Convidado online: copia o placar e a horda enviados pelo host
  applyWorld: (world: NetWorld) => void;
  reset: (playerIds: CharacterId[]) => void;
}

const initialState: GameState = {
  score: 0,
  lives: 5,
  level: 1,
  collectedCoins: 0,
  playerCount: 1,
  players: {},
  damageBoostUntil: 0,
  enemies: [],
  screenLock: null,
  projectiles: [],
  pickedUp: [],
  fadeAt: 0,
  discovered: {},
};

let nextProjectileId = 1;
// Tempos exatos; o store guarda só o valor arredondado exibido no HUD
const timers: Partial<Record<CharacterId, { powerUp: number; help: number }>> = {};

export const useGameStore = create<GameState & GameActions>((set, get) => {
  const patchPlayer = (id: CharacterId, patch: Partial<PlayerHud>) =>
    set((state) => ({ players: { ...state.players, [id]: { ...(state.players[id] ?? emptyPlayer()), ...patch } } }));

  return {
    ...initialState,
    addScore: (points) => set((state) => ({ score: state.score + points })),
    loseLife: () => {
      if (isGuest()) sendEvent({ type: 'life', delta: -1 });
      set((state) => ({ lives: Math.max(0, state.lives - 1) }));
    },
    gainLife: () => {
      if (isGuest()) sendEvent({ type: 'life', delta: 1 });
      set((state) => ({ lives: Math.min(MAX_LIVES, state.lives + 1) }));
    },
    hurtPlayer: (id) => {
      const now = performance.now();
      const p = get().players[id] ?? emptyPlayer();
      if (now < p.invulnerableUntil) return false;
      if (now < p.shieldUntil) {
        patchPlayer(id, { shieldUntil: 0, invulnerableUntil: now + 800 });
        return false;
      }
      patchPlayer(id, { invulnerableUntil: now + INVULNERABLE_MS });
      get().loseLife();
      return true;
    },
    setPowerUp: (id, powerUp) => {
      timers[id] = { help: timers[id]?.help ?? 0, powerUp: powerUp ? POWER_UP_DURATION : 0 };
      patchPlayer(id, { powerUp, powerUpTimeLeft: powerUp ? POWER_UP_DURATION : 0 });
    },
    tickPlayer: (id, delta) => {
      const t = timers[id];
      const p = get().players[id];
      if (!t || !p) return;
      const patch: Partial<PlayerHud> = {};
      if (p.powerUp) {
        t.powerUp -= delta;
        if (t.powerUp <= 0) Object.assign(patch, { powerUp: null, powerUpTimeLeft: 0 });
        else if (Math.ceil(t.powerUp) !== p.powerUpTimeLeft) patch.powerUpTimeLeft = Math.ceil(t.powerUp);
      }
      if (t.help > 0) {
        t.help = Math.max(0, t.help - delta);
        if (Math.ceil(t.help) !== p.helpCooldownLeft) patch.helpCooldownLeft = Math.ceil(t.help);
      }
      if (Object.keys(patch).length) patchPlayer(id, patch);
    },
    startHelpCooldown: (id, seconds) => {
      timers[id] = { powerUp: timers[id]?.powerUp ?? 0, help: seconds };
      patchPlayer(id, { helpCooldownLeft: seconds });
    },
    giveShield: (id, seconds) => patchPlayer(id, { shieldUntil: performance.now() + seconds * 1000 }),
    boostDamage: (seconds) => set({ damageBoostUntil: performance.now() + seconds * 1000 }),
    addCoin: () => {
      if (isGuest()) sendEvent({ type: 'coin' });
      set((state) => ({ collectedCoins: state.collectedCoins + 1, score: state.score + 100 }));
    },
    // Só re-renderiza o HUD a cada 10% de fôlego
    setBreath: (id, breath) => {
      const old = get().players[id]?.breath ?? 1;
      if (Math.round(old * 10) !== Math.round(breath * 10)) patchPlayer(id, { breath });
    },
    fade: () => set({ fadeAt: performance.now() }),
    discover: (maze, node) => {
      const known = get().discovered[maze] ?? [];
      if (known.includes(node)) return false;
      set((state) => ({ discovered: { ...state.discovered, [maze]: [...known, node] } }));
      return true;
    },
    markPicked: (key) => set((state) => (state.pickedUp.includes(key) ? state : { pickedUp: [...state.pickedUp, key] })),
    applyWorld: (world) =>
      set({
        lives: world.lives,
        score: world.score,
        collectedCoins: world.coins,
        screenLock: world.lock,
        enemies: world.enemies
          .filter((e) => !e.dead)
          .map((e) => ({ id: e.id, name: e.name, power: e.power, color: e.color, health: e.health, maxHealth: e.maxHealth })),
      }),
    upsertEnemy: (enemy) =>
      set((state) => ({
        enemies: state.enemies.some((e) => e.id === enemy.id) ? state.enemies.map((e) => (e.id === enemy.id ? enemy : e)) : [...state.enemies, enemy],
      })),
    removeEnemy: (id) => set((state) => ({ enemies: state.enemies.filter((e) => e.id !== id) })),
    setScreenLock: (lock) => set({ screenLock: lock }),
    spawnProjectile: (p) => set((state) => ({ projectiles: [...state.projectiles, { ...p, id: nextProjectileId++ }] })),
    removeProjectile: (id) => set((state) => ({ projectiles: state.projectiles.filter((p) => p.id !== id) })),
    reset: (playerIds) => {
      const players: GameState['players'] = {};
      playerIds.forEach((id) => {
        players[id] = emptyPlayer();
        timers[id] = { powerUp: 0, help: 0 };
      });
      set({ ...initialState, playerCount: playerIds.length, players });
    },
  };
});

// Multiplicadores de dificuldade conforme o número de jogadores na sessão
export function difficulty(playerCount: number) {
  const extra = Math.max(0, playerCount - 1);
  return { health: 1 + 0.5 * extra, extraEnemies: extra, attackSpeed: 1 + 0.1 * extra };
}

// Acesso de depuração pelo console do navegador (só em desenvolvimento)
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as { __store: typeof useGameStore }).__store = useGameStore;
}
