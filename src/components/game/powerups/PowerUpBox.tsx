'use client';

import { useRef, useState } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';

interface PowerUpBoxProps {
  position: [number, number, number];
  type: 'laser' | 'super-speed' | 'float' | 'fire-ball' | 'super-jump';
}

export function PowerUpBox({ position, type }: PowerUpBoxProps) {
  const meshRef = useRef<Mesh>(null);
  const [collected, setCollected] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y += 0.05;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <group position={position} visible={!collected}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.5, 0.5, 0.5]} />
        <mesh ref={meshRef} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
        </mesh>
      </RigidBody>
    </group>
  );
}
