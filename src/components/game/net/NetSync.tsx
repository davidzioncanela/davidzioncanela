'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { getSocket, netSession } from '@/lib/net';
import { enemyRegistry, players } from '@/lib/gameRuntime';
import { applyHelpPower } from '@/lib/helpPowers';
import type { HelpPowerId } from '@/lib/characters';
import type { NetEnemy, NetEvent, NetWorld } from '@/lib/protocol';
import { useGameStore } from '@/store/gameStore';
import { GameState } from '../GameCanvas';
import { remoteStates } from './RemotePlayer';
import { EnemyPuppet, enemySnapshots } from './EnemyPuppet';

const PLAYER_RATE = 1 / 15;
const WORLD_RATE = 1 / 10;

interface NetSyncProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  cageOpen: boolean;
  setCageOpen: (open: boolean) => void;
}

// Liga a partida local ao servidor: envia o próprio jogador, recebe os outros,
// e no host envia a foto da horda e do placar para os convidados
export function NetSync({ gameState, setGameState, cageOpen, setCageOpen }: NetSyncProps) {
  const timers = useRef({ player: 0, world: 0 });
  const [puppets, setPuppets] = useState<string[]>([]);
  const live = useRef({ gameState, cageOpen, lockWas: null as [number, number] | null });
  live.current.gameState = gameState;
  live.current.cageOpen = cageOpen;

  useEffect(() => {
    const socket = getSocket();
    const store = useGameStore.getState;

    const onPlayer = (state: Parameters<typeof remoteStates.set>[1]) => remoteStates.set(state.id, state);

    const onEvent = (e: NetEvent) => {
      switch (e.type) {
        case 'hit':
          if (netSession.isHost) enemyRegistry.get(e.enemyId)?.hit(e.damage, e.fromX);
          break;
        case 'hurt': {
          const me = players.get(e.target);
          if (me?.local && store().hurtPlayer(e.target)) me.pendingImpulse = { x: e.kx, y: e.ky, z: 0 };
          break;
        }
        case 'projectile':
          store().spawnProjectile({ kind: e.kind, x: e.x, y: e.y, dir: e.dir, owner: e.owner, visual: e.owner === 'player' });
          break;
        case 'pickup':
          store().markPicked(e.key);
          break;
        case 'help':
          applyHelpPower(e.power as HelpPowerId, e.from, e.x, e.y, true);
          break;
        case 'life':
          if (netSession.isHost) (e.delta > 0 ? store().gainLife() : store().loseLife());
          break;
        case 'coin':
          if (netSession.isHost) store().addCoin();
          break;
        case 'rescued':
          if (netSession.isHost) setGameState('victory');
          break;
      }
    };

    const onWorld = (world: NetWorld) => {
      if (netSession.isHost) return;
      world.enemies.forEach((e) => enemySnapshots.set(e.id, e));
      const ids = world.enemies.map((e) => e.id);
      for (const id of enemySnapshots.keys()) if (!ids.includes(id)) enemySnapshots.delete(id);
      setPuppets((prev) => (prev.length === ids.length && prev.every((id, i) => id === ids[i]) ? prev : ids));
      store().applyWorld(world);
      if (world.cageOpen !== live.current.cageOpen) setCageOpen(world.cageOpen);
      // Segue o estado do host, sem interromper um diálogo aberto aqui
      const hostState = world.gameState as GameState;
      if (hostState !== live.current.gameState && live.current.gameState !== 'dialog' && hostState !== 'dialog') setGameState(hostState);
    };

    socket.on('game:player', onPlayer);
    socket.on('game:event', onEvent);
    socket.on('game:world', onWorld);
    return () => {
      socket.off('game:player', onPlayer);
      socket.off('game:event', onEvent);
      socket.off('game:world', onWorld);
      remoteStates.clear();
      enemySnapshots.clear();
    };
  }, [setGameState, setCageOpen]);

  useFrame((_, delta) => {
    const socket = getSocket();
    const t = timers.current;
    t.player += delta;
    t.world += delta;

    if (t.player >= PLAYER_RATE) {
      t.player = 0;
      const hud = useGameStore.getState().players;
      players.forEach((p) => {
        if (!p.local) return;
        socket.volatile.emit('game:player', {
          id: p.id,
          x: p.position.x,
          y: p.position.y,
          vx: p.velocity.x,
          vy: p.velocity.y,
          facing: p.facing,
          anim: p.animation,
          powerUp: hud[p.id]?.powerUp ?? null,
        });
      });
    }

    const store = useGameStore.getState();
    if (netSession.isHost && t.world >= WORLD_RATE) {
      t.world = 0;
      const enemies: NetEnemy[] = [];
      enemyRegistry.forEach((e) => e.snapshot && enemies.push(e.snapshot()));
      // Sem volatile: a foto do mundo não pode ser descartada (vidas, horda, vitória)
      socket.emit('game:world', {
        enemies,
        lock: store.screenLock,
        lives: store.lives,
        score: store.score,
        coins: store.collectedCoins,
        gameState: live.current.gameState === 'dialog' ? 'playing' : live.current.gameState,
        cageOpen: live.current.cageOpen,
      });
    }

    // Convidado: ao começar uma horda, quem está fora da arena é puxado para dentro
    if (!netSession.isHost) {
      const lock = store.screenLock;
      if (lock && !live.current.lockWas) {
        players.forEach((p) => {
          if (p.local && (p.position.x < lock[0] || p.position.x > lock[1])) p.pendingTeleport = { x: lock[0] + 2, y: p.position.y + 6, z: 0 };
        });
      }
      live.current.lockWas = lock;
    }
  });

  return (
    <>
      {puppets.map((id) => (
        <EnemyPuppet key={id} id={id} />
      ))}
    </>
  );
}
