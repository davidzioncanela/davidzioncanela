'use client';

import { useEffect } from 'react';
import { getSocket } from '@/lib/net';
import { useTownStore } from '@/store/townStore';
import { townAvatar } from './TownAvatar';

// Conecta a cidade ao servidor: presença das pessoas e chat
export function useTownNet() {
  const me = useTownStore((s) => s.me);

  useEffect(() => {
    if (!me) return;
    const socket = getSocket();
    const store = useTownStore.getState;

    const join = () => {
      store().setConnected(true);
      socket.emit('town:join', { name: me.name, character: me.character, x: townAvatar.position.x, z: townAvatar.position.z, rot: 0, anim: 'Idle' });
    };
    const onDisconnect = () => store().setConnected(false);

    socket.on('connect', join);
    socket.on('disconnect', onDisconnect);
    socket.on('town:presence', store().setPeople);
    socket.on('town:move', store().upsertPerson);
    socket.on('town:leave', store().removePerson);
    socket.on('chat:message', store().addMessage);
    socket.on('chat:history', store().setHistory);
    if (socket.connected) join();

    return () => {
      socket.off('connect', join);
      socket.off('disconnect', onDisconnect);
      socket.off('town:presence', store().setPeople);
      socket.off('town:move', store().upsertPerson);
      socket.off('town:leave', store().removePerson);
      socket.off('chat:message', store().addMessage);
      socket.off('chat:history', store().setHistory);
    };
  }, [me]);
}
