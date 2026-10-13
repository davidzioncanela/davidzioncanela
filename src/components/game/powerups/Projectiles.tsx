'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Projectile as ProjectileData, useGameStore } from '@/store/gameStore';
import { findEnemyNear } from '@/lib/gameRuntime';

const CONFIG = {
  laser: { speed: 28, damage: 25, ttl: 0.6 },
  'fire-ball': { speed: 11, damage: 20, ttl: 1.6 },
} as const;

function Projectile({ data }: { data: ProjectileData }) {
  const ref = useRef<Mesh>(null);
  const s = useRef({ x: data.x, y: data.y, vy: 3, age: 0, done: false });
  const cfg = CONFIG[data.kind];

  useFrame((_, delta) => {
    const p = s.current;
    if (p.done || !ref.current) return;
    p.age += delta;
    p.x += data.dir * cfg.speed * delta;
    if (data.kind === 'fire-ball') {
      // Bola de fogo quica em arco
      p.vy -= 18 * delta;
      p.y += p.vy * delta;
      if (p.y < data.y - 0.8) p.vy = 5;
    }
    ref.current.position.set(p.x, p.y, 0);
    ref.current.rotation.z += delta * 10;
    const enemy = findEnemyNear(p.x, p.y, 0.6);
    if (enemy) enemy.hit(cfg.damage, p.x - data.dir);
    if (enemy || p.age > cfg.ttl) {
      p.done = true;
      useGameStore.getState().removeProjectile(data.id);
    }
  });

  return data.kind === 'laser' ? (
    <mesh ref={ref} position={[data.x, data.y, 0]}>
      <boxGeometry args={[1.2, 0.08, 0.08]} />
      <meshBasicMaterial color="#22D3EE" />
    </mesh>
  ) : (
    <mesh ref={ref} position={[data.x, data.y, 0]}>
      <icosahedronGeometry args={[0.22, 0]} />
      <meshBasicMaterial color="#F97316" />
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
