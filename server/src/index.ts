import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { Server } from 'socket.io';
import {
  CHAT_MAX_LENGTH,
  type ClientToServer,
  type ServerToClient,
  type TownPerson,
  type CharacterId,
} from '../../src/lib/protocol.js';
import { createRoom, joinRoom, leaveRoom, pickCharacter, publicState, roomOf, sweepRooms } from './rooms.js';
import { initChat, recentMessages, saveMessage } from './chat.js';

const PORT = Number(process.env.PORT ?? 3002);
// Origens permitidas separadas por vírgula (ex.: https://super-zion.vercel.app). Vazio = qualquer origem.
const ORIGINS = (process.env.CORS_ORIGIN ?? '').split(',').map((o) => o.trim()).filter(Boolean);
const CHARACTERS: CharacterId[] = ['david', 'yohann', 'laura', 'lara'];
const TOWN = 'town';

const http = createServer((req, res) => {
  // Health check para o Render/Railway
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('Super Zion Brothers - servidor online');
});

const io = new Server<ClientToServer, ServerToClient>(http, {
  cors: { origin: ORIGINS.length ? ORIGINS : true },
});

const town = new Map<string, TownPerson>();

io.on('connection', (socket) => {
  const roomChannel = (code: string) => `room:${code}`;

  // ---------- Salas da partida online ----------
  socket.on('room:create', (profile, ack) => {
    if (typeof ack !== 'function') return;
    leaveCurrentRoom();
    const room = createRoom(socket.id, cleanProfile(profile));
    socket.join(roomChannel(room.code));
    ack({ ok: true, room: publicState(room) });
  });

  socket.on('room:join', (code, profile, ack) => {
    if (typeof ack !== 'function') return;
    if (typeof code !== 'string') return ack({ ok: false, error: 'Código inválido.' });
    const current = roomOf(socket.id);
    if (current && current.code !== code.toUpperCase()) leaveCurrentRoom();
    const result = joinRoom(code, socket.id, cleanProfile(profile));
    if (typeof result === 'string') return ack({ ok: false, error: result });
    socket.join(roomChannel(result.code));
    ack({ ok: true, room: publicState(result) });
    socket.to(roomChannel(result.code)).emit('room:state', publicState(result));
  });

  socket.on('room:pick', (character) => {
    const room = roomOf(socket.id);
    if (!room || room.started || !CHARACTERS.includes(character)) return;
    const error = pickCharacter(room, socket.id, character);
    if (error) return socket.emit('room:error', error);
    io.to(roomChannel(room.code)).emit('room:state', publicState(room));
  });

  socket.on('room:start', () => {
    const room = roomOf(socket.id);
    if (!room || room.started) return;
    if (!room.members.find((m) => m.id === socket.id)?.host) return;
    if (room.members.some((m) => !m.character)) return socket.emit('room:error', 'Todos precisam escolher um personagem.');
    room.started = true;
    io.to(roomChannel(room.code)).emit('room:state', publicState(room));
    io.to(roomChannel(room.code)).emit('game:start', { slots: room.members.map((m) => ({ character: m.character!, memberId: m.id })) });
  });

  socket.on('room:leave', () => leaveCurrentRoom());

  // Party na cidade: convida outra pessoa para a sala de quem convida
  socket.on('party:invite', (targetId) => {
    const room = roomOf(socket.id);
    const me = town.get(socket.id);
    if (!room || !me || room.started || typeof targetId !== 'string' || !town.has(targetId)) return;
    io.to(targetId).emit('party:invited', { fromId: socket.id, fromName: me.name, code: room.code });
  });

  // Durante a partida o servidor só repassa as mensagens para a sala
  socket.on('game:player', (state) => {
    const room = roomOf(socket.id);
    if (room) socket.volatile.to(roomChannel(room.code)).emit('game:player', state);
  });
  socket.on('game:world', (world) => {
    const room = roomOf(socket.id);
    if (room && room.members.find((m) => m.id === socket.id)?.host) socket.to(roomChannel(room.code)).emit('game:world', world);
  });
  socket.on('game:event', (event) => {
    const room = roomOf(socket.id);
    if (room) socket.to(roomChannel(room.code)).emit('game:event', event);
  });

  // ---------- Cidade (mundo aberto) e chat ----------
  socket.on('town:join', async (person) => {
    if (!CHARACTERS.includes(person.character)) return;
    const name = String(person.name ?? '').trim().slice(0, 20) || 'Visitante';
    const me: TownPerson = { ...person, name, id: socket.id };
    town.set(socket.id, me);
    socket.join(TOWN);
    socket.emit('town:presence', [...town.values()]);
    socket.emit('chat:history', await recentMessages());
    socket.to(TOWN).emit('town:move', me);
  });

  socket.on('town:move', (pos) => {
    const me = town.get(socket.id);
    if (!me) return;
    Object.assign(me, { x: Number(pos.x) || 0, z: Number(pos.z) || 0, rot: Number(pos.rot) || 0, anim: String(pos.anim).slice(0, 40) });
    socket.volatile.to(TOWN).emit('town:move', me);
  });

  socket.on('chat:send', async (text) => {
    const me = town.get(socket.id);
    const clean = String(text ?? '').trim().slice(0, CHAT_MAX_LENGTH);
    if (!me || !clean) return;
    const msg = { id: randomUUID(), from: socket.id, name: me.name, character: me.character, text: clean, at: Date.now() };
    io.to(TOWN).emit('chat:message', msg);
    await saveMessage(msg);
  });

  socket.on('disconnect', () => {
    leaveCurrentRoom();
    if (town.delete(socket.id)) io.to(TOWN).emit('town:leave', socket.id);
  });

  function cleanProfile(p: unknown) {
    const profile = p as { name?: unknown; character?: unknown } | null;
    if (!profile || !CHARACTERS.includes(profile.character as CharacterId)) return null;
    return { name: String(profile.name ?? '').trim().slice(0, 20) || 'Jogador', character: profile.character as CharacterId };
  }

  function leaveCurrentRoom() {
    const room = roomOf(socket.id);
    if (!room) return;
    socket.leave(roomChannel(room.code));
    const after = leaveRoom(socket.id);
    if (after) io.to(roomChannel(after.code)).emit('room:state', publicState(after));
  }
});

setInterval(sweepRooms, 10 * 60 * 1000);

initChat()
  .catch((err) => console.error('[chat] Turso indisponível, usando memória', err))
  .finally(() => http.listen(PORT, () => console.log(`Servidor do Super Zion Brothers na porta ${PORT}`)));
