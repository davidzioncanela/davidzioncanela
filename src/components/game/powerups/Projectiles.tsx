'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Projectile as ProjectileData, useGameStore } from '@/store/gameStore';
import { findEnemyNear, players } from '@/lib/gameRuntime';

const CONFIG = {
  laser: { speed: 28, damage: 25, ttl: 0.6 },
  'fire-ball': { speed: 11, damage: 20, ttl: 1.6 },
} as const;

// Tiros inimigos são mais lentos para dar tempo de desviar
const ENEMY_SPEED = 0.45;

function Projectile({ data }: { data: ProjectileData }) {
  const ref = useRef<Mesh>(null);
  const s = useRef({ x: data.x, y: data.y, vy: 3, age: 0, done: false });
  const cfg = CONFIG[data.kind];

  useFrame((_, delta) => {
    const p = s.current;
    if (p.done || !ref.current) return;
    p.age += delta;
    p.x += data.dir * cfg.speed * (data.owner === 'enemy' ? ENEMY_SPEED : 1) * delta;
    if (data.kind === 'fire-ball') {
      // Bola de fogo quica em arco
      p.vy -= 18 * delta;
      p.y += p.vy * delta;
      if (p.y < data.y - 0.8) p.vy = 5;
    }
    ref.current.position.set(p.x, p.y, 0);
    ref.current.rotation.z += delta * 10;
    let hit = false;
    if (data.owner === 'player' && !data.visual) {
      const enemy = findEnemyNear(p.x, p.y, 0.6);
      const boost = useGameStore.getState().damageBoostUntil > performance.now() ? 2 : 1;
      if (enemy) enemy.hit(cfg.damage * boost, p.x - data.dir);
      hit = !!enemy;
    } else if (data.owner === 'enemy') {
      players.forEach((pl) => {
        if (hit || !pl.local) return;
        // Agachado ou engatinhando o tiro passa por cima
        const top = pl.position.y + (pl.low || pl.lying ? 0.55 : 1.4);
        if (Math.abs(pl.position.x - p.x) < 0.5 && p.y > pl.position.y && p.y < top) {
          hit = true;
          if (useGameStore.getState().hurtPlayer(pl.id)) pl.pendingImpulse = { x: data.dir * 6, y: 5, z: 0 };
        }
      });
    }
    if (hit || p.age > cfg.ttl * (data.owner === 'enemy' ? 2 : 1)) {
      p.done = true;
      useGameStore.getState().removeProjectile(data.id);
    }
  });

  return data.kind === 'laser' ? (
    <mesh ref={ref} position={[data.x, data.y, 0]}>
      <boxGeometry args={[1.2, 0.08, 0.08]} />
      <meshBasicMaterial color={data.owner === 'enemy' ? '#E879F9' : '#22D3EE'} />
    </mesh>
  ) : (
    <mesh ref={ref} position={[data.x, data.y, 0]}>
      <icosahedronGeometry args={[0.22, 0]} />
      <meshBasicMaterial color={data.owner === 'enemy' ? '#DC2626' : '#F97316'} />
    </mesh>
  );
}

export function Projectiles() {
  const projectiles = useGameStore((s) => s.projectiles);
  return (
    <>
      {projectiles.map((p) => (
        <Projectile key={p.id} data={p} />
      ))}
    </>
  );
}
