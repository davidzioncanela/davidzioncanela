'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils } from 'three';
import type { NetEnemy } from '@/lib/protocol';
import { enemyRegistry } from '@/lib/gameRuntime';
import { sendEvent } from '@/lib/net';
import { CharacterModel } from '../characters/CharacterModel';

// Últimas fotos dos inimigos recebidas do host
export const enemySnapshots = new Map<string, NetEnemy>();

// Inimigo simulado no host e mostrado aqui: golpes acertados viram mensagens para o host
export function EnemyPuppet({ id }: { id: string }) {
  const group = useRef<Group>(null);
  const model = useRef<Group>(null);
  const first = enemySnapshots.get(id);
  const [view, setView] = useState({ anim: first?.anim ?? 'Idle', facing: first?.facing ?? (-1 as 1 | -1) });

  useEffect(() => {
    enemyRegistry.set(id, {
      getPosition: () => {
        const g = group.current;
        return g ? { x: g.position.x, y: g.position.y, z: 0 } : { x: 0, y: -100, z: 0 };
      },
      alive: () => {
        const e = enemySnapshots.get(id);
        return !!e && !e.dead && e.health > 0 && e.emerge <= 0;
      },
      hit: (damage, fromX) => sendEvent({ type: 'hit', enemyId: id, damage, fromX }),
    });
    return () => {
      enemyRegistry.delete(id);
    };
  }, [id]);

  useFrame((_, delta) => {
    const e = enemySnapshots.get(id);
    const g = group.current;
    if (!e || !g) return;
    const t = 1 - Math.pow(0.0005, delta);
    g.position.x = MathUtils.lerp(g.position.x, e.x, t);
    g.position.y = MathUtils.lerp(g.position.y, e.y, t);
    if (model.current) model.current.position.y = -e.height * e.emerge;
    if (e.anim !== view.anim || e.facing !== view.facing) setView({ anim: e.anim, facing: e.facing });
  });

  if (!first) return null;
  return (
    <group ref={group} position={[first.x, first.y, 0]}>
      <group ref={model}>
        <CharacterModel model="rogueHooded" animation={view.anim} accessories={['Knife', 'Rogue_Cape']} facing={view.facing} height={first.height} />
      </group>
      {!first.dead && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.5, 24]} />
          <meshBasicMaterial color={first.color} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}
