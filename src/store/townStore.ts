import { create } from 'zustand';
import type { CharacterId, ChatMessage, TownPerson } from '@/lib/protocol';

export interface TownMe {
  name: string;
  character: CharacterId;
}

interface TownState {
  me: TownMe | null;
  connected: boolean;
  people: Record<string, TownPerson>;
  messages: ChatMessage[];
  // Balões de fala acima de pessoas e NPCs (id -> texto e quando apareceu)
  bubbles: Record<string, { text: string; at: number }>;
  setMe: (me: TownMe | null) => void;
  setConnected: (connected: boolean) => void;
  setPeople: (people: TownPerson[]) => void;
  upsertPerson: (person: TownPerson) => void;
  removePerson: (id: string) => void;
  addMessage: (msg: ChatMessage) => void;
  setHistory: (msgs: ChatMessage[]) => void;
  say: (id: string, text: string) => void;
}

const MAX_MESSAGES = 80;

export const useTownStore = create<TownState>((set) => ({
  me: null,
  connected: false,
  people: {},
  messages: [],
  bubbles: {},
  setMe: (me) => set({ me }),
  setConnected: (connected) => set({ connected }),
  setPeople: (list) => set({ people: Object.fromEntries(list.map((p) => [p.id, p])) }),
  upsertPerson: (person) => set((s) => ({ people: { ...s.people, [person.id]: person } })),
  removePerson: (id) =>
    set((s) => {
      const people = { ...s.people };
      delete people[id];
      return { people };
    }),
  addMessage: (msg) =>
    set((s) => ({
      messages: [...s.messages, msg].slice(-MAX_MESSAGES),
      bubbles: { ...s.bubbles, [msg.from]: { text: msg.text, at: Date.now() } },
    })),
  setHistory: (messages) => set({ messages: messages.slice(-MAX_MESSAGES) }),
  say: (id, text) => set((s) => ({ bubbles: { ...s.bubbles, [id]: { text, at: Date.now() } } })),
}));

export const BUBBLE_MS = 5000;

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as { __town: typeof useTownStore }).__town = useTownStore;
}
