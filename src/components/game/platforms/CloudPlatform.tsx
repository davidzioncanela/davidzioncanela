'use client';

import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface CloudPlatformProps {
  position: [number, number, number];
  scale: [number, number, number];
  animated?: boolean;
  speed?: number;
  targetY?: number;
  delay?: number;
}

export function CloudPlatform({ position, scale, animated = false, speed = 0.5, targetY, delay = 0 }: CloudPlatformProps) {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<any>(null);
  const startTime = useRef(delay);
  const started = useRef(false);

  useFrame((state, delta) => {
    if (!animated || !groupRef.current) return;
    if (!started.current) {
      startTime.current -= delta;
      if (startTime.current <= 0) started.current = true;
      return;
    }
    if (targetY !== undefined && groupRef.current.position.y > targetY) {
      groupRef.current.position.y -= speed * delta;
      if (groupRef.current.position.y < targetY) {
        groupRef.current.position.y = targetY;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[scale[0] / 2, scale[1] / 2, scale[2] / 2]} />
        <mesh ref={meshRef} castShadow receiveShadow>
          <boxGeometry args={scale} />
          <meshStandardMaterial color="#FFFFFF" opacity={0.95} transparent />
        </mesh>
      </RigidBody>
    </group>
  );
}
