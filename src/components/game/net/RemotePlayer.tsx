'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils } from 'three';
import { CharacterInfo } from '@/lib/characters';
import { players, registerPlayer } from '@/lib/gameRuntime';
import type { NetPlayerState } from '@/lib/protocol';
import { CharacterModel } from '../characters/CharacterModel';
import { PowerAura } from '../effects/PowerEffects';
import type { PowerUpType } from '@/store/gameStore';

// Últimos estados recebidos da rede, por personagem
export const remoteStates = new Map<string, NetPlayerState>();

// Jogador de outro aparelho: segue suavemente a posição recebida pela rede
export function RemotePlayer({ character, position }: { character: CharacterInfo; position: [number, number, number] }) {
  const group = useRef<Group>(null);
  const [view, setView] = useState({ anim: 'Idle', facing: 1 as 1 | -1, powerUp: null as string | null });

  useEffect(() => {
    const runtime = registerPlayer(character.id, false, { x: position[0], y: position[1], z: 0 });
    return () => {
      if (players.get(character.id) === runtime) players.delete(character.id);
    };
  }, [character.id, position]);

  useFrame((_, delta) => {
    const net = remoteStates.get(character.id);
    const g = group.current;
    const me = players.get(character.id);
    if (!net || !g || !me) return;
    // Interpola para esconder a diferença entre os pacotes (~15 por segundo)
    const t = 1 - Math.pow(0.0005, delta);
    g.position.x = MathUtils.lerp(g.position.x, net.x, t);
    g.position.y = MathUtils.lerp(g.position.y, net.y, t);
    me.position = { x: g.position.x, y: g.position.y, z: 0 };
    me.velocity = { x: net.vx, y: net.vy, z: 0 };
    me.facing = net.facing;
    if (net.anim !== view.anim || net.facing !== view.facing || net.powerUp !== view.powerUp) setView({ anim: net.anim, facing: net.facing, powerUp: net.powerUp });
  });

  return (
    <group ref={group} position={position}>
      <CharacterModel model={character.model} animation={view.anim} accessories={character.gear} facing={view.facing} height={character.height} />
      <PowerAura powerUp={view.powerUp as PowerUpType | null} height={character.height} shielded={false} />
    </group>
  );
}
