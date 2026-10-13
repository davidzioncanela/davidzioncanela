'use client';

import { useRef, useState } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { PowerUpType, useGameStore } from '@/store/gameStore';

interface PowerUpBoxProps {
  position: [number, number, number];
  type: PowerUpType;
}

const COLORS: Record<PowerUpType, string> = {
  laser: '#22D3EE',
  'super-speed': '#FACC15',
  float: '#A5B4FC',
  'fire-ball': '#F97316',
  'super-jump': '#4ADE80',
};

// Caixa flutuante: tocar nela ativa o power-up (substitui o atual)
export function PowerUpBox({ position, type }: PowerUpBoxProps) {
  const meshRef = useRef<Mesh>(null);
  const [collected, setCollected] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y += 0.04;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  if (collected) return null;

  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <CuboidCollider
        args={[0.4, 0.4, 0.4]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (!other.rigidBodyObject?.userData?.player) return;
          setCollected(true);
          useGameStore.getState().setActivePowerUp(type);
        }}
      />
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color={COLORS[type]} emissive={COLORS[type]} emissiveIntensity={0.5} />
      </mesh>
    </RigidBody>
  );
}
