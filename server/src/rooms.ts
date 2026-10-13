import { MAX_ROOM_PLAYERS, ROOM_ALPHABET, ROOM_CODE_LENGTH, type CharacterId, type RoomState } from '../../src/lib/protocol.js';

interface Room extends RoomState {
  createdAt: number;
}

const rooms = new Map<string, Room>();

function newCode(): string {
  for (let attempt = 0; attempt < 1000; attempt++) {
    let code = '';
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) code += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)];
    if (!rooms.has(code)) return code;
  }
  throw new Error('Sem códigos de sala disponíveis');
}

export function normalizeCode(code: string) {
  return code.trim().toUpperCase().slice(0, ROOM_CODE_LENGTH);
}

export function createRoom(hostId: string): Room {
  const room: Room = { code: newCode(), members: [{ id: hostId, character: null, host: true }], started: false, createdAt: Date.now() };
  rooms.set(room.code, room);
  return room;
}

export function joinRoom(code: string, memberId: string): Room | string {
  const room = rooms.get(normalizeCode(code));
  if (!room) return 'Sala não encontrada. Confira o código.';
  if (room.members.some((m) => m.id === memberId)) return room;
  if (room.started) return 'A partida desta sala já começou.';
  if (room.members.length >= MAX_ROOM_PLAYERS) return 'A sala já tem 4 jogadores.';
  room.members.push({ id: memberId, character: null, host: false });
  return room;
}

export function pickCharacter(room: Room, memberId: string, character: CharacterId): string | null {
  const taken = room.members.find((m) => m.character === character && m.id !== memberId);
  if (taken) return 'Esse personagem já foi escolhido por outro jogador.';
  const me = room.members.find((m) => m.id === memberId);
  if (me) me.character = character;
  return null;
}

// Sai da sala; se o host sair, o próximo vira host. Sala vazia é apagada.
export function leaveRoom(memberId: string): Room | null {
  for (const room of rooms.values()) {
    const idx = room.members.findIndex((m) => m.id === memberId);
    if (idx === -1) continue;
    const [gone] = room.members.splice(idx, 1);
    if (room.members.length === 0) {
      rooms.delete(room.code);
      return null;
    }
    if (gone.host) room.members[0].host = true;
    return room;
  }
  return null;
}

export function roomOf(memberId: string): Room | null {
  for (const room of rooms.values()) if (room.members.some((m) => m.id === memberId)) return room;
  return null;
}

export function publicState(room: Room): RoomState {
  return { code: room.code, members: room.members, started: room.started };
}

// Limpa salas abandonadas há mais de 6 horas
export function sweepRooms() {
  const limit = Date.now() - 6 * 60 * 60 * 1000;
  for (const [code, room] of rooms) if (room.createdAt < limit) rooms.delete(code);
}
