'use client';

import { RigidBody, CuboidCollider } from '@react-three/rapier';

interface GrassPlatformProps {
  position: [number, number, number];
  scale: [number, number, number];
}

export function GrassPlatform({ position, scale }: GrassPlatformProps) {
  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <CuboidCollider args={[scale[0] / 2, scale[1] / 2, scale[2] / 2]} />
      <group>
        <mesh castShadow receiveShadow position={[0, scale[1] / 4, 0]}>
          <boxGeometry args={[scale[0], scale[1] / 2, scale[2]]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh castShadow receiveShadow position={[0, scale[1] / 2, 0]}>
          <boxGeometry args={[scale[0], scale[1] / 2, scale[2]]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      </group>
    </RigidBody>
  );
}
