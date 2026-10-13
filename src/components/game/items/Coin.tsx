'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, BallCollider } from '@react-three/rapier';
import { Mesh } from 'three';
import { useGameStore } from '@/store/gameStore';
import { sendEvent } from '@/lib/net';

export function Coin({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  const key = `coin:${position[0]},${position[1]}`;
  const collected = useGameStore((s) => s.pickedUp.includes(key));

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
          const store = useGameStore.getState();
          if (store.pickedUp.includes(key)) return;
          store.markPicked(key);
          store.addCoin();
          sendEvent({ type: 'pickup', key, by: other.rigidBodyObject.userData.player });
        }}
      />
      <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.08, 20]} />
        <meshStandardMaterial color="#FFD700" metalness={0.3} roughness={0.25} emissive="#FFB800" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
    </RigidBody>
  );
}
