'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, BallCollider } from '@react-three/rapier';
import { Mesh } from 'three';
import { useGameStore } from '@/store/gameStore';

export function Coin({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  const [collected, setCollected] = useState(false);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 3;
  });

  if (collected) return null;

  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <BallCollider
        args={[0.35]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (!other.rigidBodyObject?.userData?.player) return;
          setCollected(true);
          useGameStore.getState().addCoin();
        }}
      />
      <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.08, 20]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} emissive="#B8860B" emissiveIntensity={0.3} />
      </mesh>
    </RigidBody>
  );
}
