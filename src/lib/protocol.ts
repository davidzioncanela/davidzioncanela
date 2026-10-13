// Protocolo de tempo real compartilhado entre o jogo (Next.js) e o servidor Socket.io.
// Não importe nada do cliente aqui: o servidor também compila este arquivo.

export type CharacterId = 'david' | 'yohann' | 'laura' | 'lara';

// Letras e números sem ambiguidade (sem 0/O, 1/I/L)
export const ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LENGTH = 4;
export const MAX_ROOM_PLAYERS = 4;

export interface RoomMember {
  id: string;
  // Nome de quem entrou pela cidade (party)
  name?: string;
  character: CharacterId | null;
  host: boolean;
}

// Quem entra na sala já com nome e personagem (vindo da cidade)
export interface MemberProfile {
  name: string;
  character: CharacterId;
}

export interface RoomState {
  code: string;
  members: RoomMember[];
  started: boolean;
}

// Estado de um jogador enviado ~15 vezes por segundo
export interface NetPlayerState {
  id: CharacterId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  anim: string;
  powerUp: string | null;
}

// Foto dos inimigos enviada pelo host ~10 vezes por segundo
export interface NetEnemy {
  id: string;
  name: string;
  power: string;
  color: string;
  height: number;
  // Modelo 3D e tom de cor do monstro
  model: string;
  tint: string;
  // Monstrinho de patrulha (não entra no HUD da horda)
  field: boolean;
  x: number;
  y: number;
  facing: 1 | -1;
  anim: string;
  health: number;
  maxHealth: number;
  emerge: number;
  dead: boolean;
}

export interface NetWorld {
  enemies: NetEnemy[];
  lock: [number, number] | null;
  lives: number;
  score: number;
  coins: number;
  gameState: string;
  cageOpen: boolean;
  // Fase atual (índice); o host avança e os convidados acompanham
  level: number;
  seed: number;
}

export type NetEvent =
  | { type: 'hit'; enemyId: string; damage: number; fromX: number }
  | { type: 'hurt'; target: CharacterId; kx: number; ky: number }
  | { type: 'projectile'; kind: 'laser' | 'fire-ball'; x: number; y: number; dir: 1 | -1; owner: 'player' | 'enemy' }
  | { type: 'pickup'; key: string; by: CharacterId; powerUp?: string }
  | { type: 'help'; from: CharacterId; power: string; x: number; y: number }
  // Mudanças no placar do time pedidas por convidados (o host aplica e devolve no NetWorld)
  | { type: 'life'; delta: number }
  | { type: 'coin' }
  | { type: 'rescued' };

export interface ServerToClient {
  'room:state': (room: RoomState) => void;
  'room:error': (message: string) => void;
  // Convite para a party recebido na cidade
  'party:invited': (invite: { fromId: string; fromName: string; code: string }) => void;
  'game:start': (payload: { slots: { character: CharacterId; memberId: string }[] }) => void;
  'game:player': (state: NetPlayerState) => void;
  'game:world': (world: NetWorld) => void;
  'game:event': (event: NetEvent) => void;
  'chat:message': (msg: ChatMessage) => void;
  'chat:history': (msgs: ChatMessage[]) => void;
  'town:presence': (people: TownPerson[]) => void;
  'town:move': (person: TownPerson) => void;
  'town:leave': (id: string) => void;
}

export interface ClientToServer {
  'room:create': (profile: MemberProfile | null, ack: (res: { ok: true; room: RoomState } | { ok: false; error: string }) => void) => void;
  'room:join': (code: string, profile: MemberProfile | null, ack: (res: { ok: true; room: RoomState } | { ok: false; error: string }) => void) => void;
  'room:pick': (character: CharacterId) => void;
  'room:start': () => void;
  'room:leave': () => void;
  'party:invite': (targetId: string) => void;
  'game:player': (state: NetPlayerState) => void;
  'game:world': (world: NetWorld) => void;
  'game:event': (event: NetEvent) => void;
  'town:join': (person: Omit<TownPerson, 'id'>) => void;
  'town:move': (pos: { x: number; z: number; anim: string; rot: number }) => void;
  'chat:send': (text: string) => void;
}

// Mundo aberto (cidade): presença e chat
export interface TownPerson {
  id: string;
  name: string;
  character: CharacterId;
  x: number;
  z: number;
  rot: number;
  anim: string;
}

export interface ChatMessage {
  id: string;
  from: string;
  name: string;
  character: CharacterId;
  text: string;
  at: number;
}

export const CHAT_MAX_LENGTH = 200;
