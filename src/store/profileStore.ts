import { create } from 'zustand';
import { ABILITIES, type AbilityId } from '@/lib/abilities';
import { useGameStore } from './gameStore';

// Perfil deste aparelho: pontos e moedas somados entre partidas e as ações desbloqueadas
interface ProfileState {
  points: number;
  coins: number;
  unlocked: AbilityId[];
  // Aviso de desbloqueio (some sozinho)
  toast: { text: string; at: number } | null;
  add: (points: number, coins: number) => void;
  has: (id: AbilityId) => boolean;
}

const KEY = 'szb:profile';

function load(): Pick<ProfileState, 'points' | 'coins' | 'unlocked'> {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {
    // sem armazenamento: começa do zero
  }
  return { points: 0, coins: 0, unlocked: [] };
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  ...load(),
  toast: null,
  add: (points, coins) => {
    const s = get();
    const next = { points: s.points + points, coins: s.coins + coins };
    const newly = ABILITIES.filter(
      (a) => !s.unlocked.includes(a.id) && next.points >= (a.need.points ?? 0) && next.coins >= (a.need.coins ?? 0)
    );
    const unlocked = [...s.unlocked, ...newly.map((a) => a.id)];
    const toast = newly.length ? { text: `Nova ação: ${newly.map((a) => `${a.name} (${a.how})`).join(', ')}!`, at: Date.now() } : s.toast;
    set({ ...next, unlocked, toast });
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...next, unlocked }));
    } catch {
      // ignora
    }
  },
  has: (id) => get().unlocked.includes(id),
}));

// Soma no perfil tudo que o time ganha na partida (funciona no local, no host e no convidado)
let last = { score: 0, coins: 0 };
if (typeof window !== 'undefined') {
  useGameStore.subscribe((state) => {
    const dp = state.score - last.score;
    const dc = state.collectedCoins - last.coins;
    last = { score: state.score, coins: state.collectedCoins };
    if (dp > 0 || dc > 0) useProfileStore.getState().add(Math.max(0, dp), Math.max(0, dc));
  });
}
