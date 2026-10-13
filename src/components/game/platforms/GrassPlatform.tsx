'use client';

import { RigidBody, CuboidCollider } from '@react-three/rapier';

interface GrassPlatformProps {
  position: [number, number, number];
  scale: [number, number, number];
}

const GRASS = 0.3;

// Bloco de terra com uma camada fina de grama no topo (o topo visual coincide com o colisor)
export function GrassPlatform({ position, scale }: GrassPlatformProps) {
  const [w, h, d] = scale;
  const grass = Math.min(GRASS, h / 2);
  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <CuboidCollider args={[w / 2, h / 2, d / 2]} />
      <mesh castShadow receiveShadow position={[0, -grass / 2, 0]}>
        <boxGeometry args={[w, h - grass, d]} />
        <meshStandardMaterial color="#8B5A2B" />
      </mesh>
      <mesh castShadow receiveShadow position={[0, h / 2 - grass / 2, 0]}>
        <boxGeometry args={[w + 0.1, grass, d + 0.1]} />
        <meshStandardMaterial color="#4ADE80" />
      </mesh>
    </RigidBody>
  );
}
