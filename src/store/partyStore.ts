import { create } from 'zustand';
import type { RoomState } from '@/lib/protocol';

export interface PartyInvite {
  fromId: string;
  fromName: string;
  code: string;
}

// Party na cidade: é uma sala online formada por convites
interface PartyState {
  room: RoomState | null;
  invites: PartyInvite[];
  // Pessoa da cidade selecionada (para convidar)
  selected: string | null;
  error: string;
  setRoom: (room: RoomState | null) => void;
  addInvite: (invite: PartyInvite) => void;
  dropInvite: (fromId: string) => void;
  select: (id: string | null) => void;
  setError: (error: string) => void;
}

export const usePartyStore = create<PartyState>((set) => ({
  room: null,
  invites: [],
  selected: null,
  error: '',
  setRoom: (room) => set({ room }),
  addInvite: (invite) => set((s) => ({ invites: [...s.invites.filter((i) => i.fromId !== invite.fromId), invite] })),
  dropInvite: (fromId) => set((s) => ({ invites: s.invites.filter((i) => i.fromId !== fromId) })),
  select: (selected) => set({ selected }),
  setError: (error) => set({ error }),
}));

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as { __party: typeof usePartyStore }).__party = usePartyStore;
}
