'use client';

import { RigidBody, CuboidCollider } from '@react-three/rapier';

interface CloudPlatformProps {
  position: [number, number, number];
  scale: [number, number, number];
}

export function CloudPlatform({ position, scale }: CloudPlatformProps) {
  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <CuboidCollider args={[scale[0] / 2, scale[1] / 2, scale[2] / 2]} />
      <mesh castShadow receiveShadow>
        <boxGeometry args={scale} />
        <meshStandardMaterial color="#FFFFFF" opacity={0.9} transparent />
      </mesh>
    </RigidBody>
  );
}
