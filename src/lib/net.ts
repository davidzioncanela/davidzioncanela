'use client';

import { io, Socket } from 'socket.io-client';
import type { ClientToServer, NetEvent, ServerToClient } from './protocol';

export type GameSocket = Socket<ServerToClient, ClientToServer>;

// Endereço do servidor Socket.io (Render/Railway). Em desenvolvimento usa a porta 3002 local.
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3002` : '');

let socket: GameSocket | null = null;

export function getSocket(): GameSocket {
  if (!socket) socket = io(SERVER_URL, { transports: ['websocket', 'polling'], autoConnect: true });
  return socket;
}

// Sessão online ativa (null = jogo local). Lida pelos componentes do loop de jogo sem re-render.
export const netSession = {
  active: false,
  isHost: false,
  code: '',
};

// Envia um evento da partida para os outros aparelhos (não faz nada fora do modo online)
export function sendEvent(event: NetEvent) {
  if (netSession.active) getSocket().emit('game:event', event);
}

export function isGuest() {
  return netSession.active && !netSession.isHost;
}

// Link compartilhável que abre o jogo já entrando na sala
export function shareLink(code: string) {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}?sala=${code}`;
}

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as { __net: typeof netSession; __socket: typeof getSocket }).__net = netSession;
  (window as unknown as { __socket: typeof getSocket }).__socket = getSocket;
}
