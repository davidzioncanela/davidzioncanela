'use client';

import { useRef } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { PowerUpType, useGameStore } from '@/store/gameStore';
import type { CharacterId } from '@/lib/characters';
import { Burst, POWER_COLORS } from '../effects/PowerEffects';
import { sendEvent } from '@/lib/net';

interface PowerUpBoxProps {
  position: [number, number, number];
  type: PowerUpType;
}

// Caixa flutuante brilhante: tocar nela ativa o power-up de quem tocou (substitui o atual)
export function PowerUpBox({ position, type }: PowerUpBoxProps) {
  const ref = useRef<Group>(null);
  const key = `power:${position[0]},${position[1]}`;
  const collected = useGameStore((s) => s.pickedUp.includes(key));
  const color = POWER_COLORS[type];

  useFrame((state) => {
    if (ref.current && !collected) {
      ref.current.rotation.y += 0.04;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      {!collected && (
        <CuboidCollider
          args={[0.45, 0.45, 0.45]}
          sensor
          onIntersectionEnter={({ other }) => {
            const who = other.rigidBodyObject?.userData?.player as CharacterId | undefined;
            if (!who) return;
            const store = useGameStore.getState();
            if (store.pickedUp.includes(key)) return;
            store.markPicked(key);
            store.setPowerUp(who, type);
            sendEvent({ type: 'pickup', key, by: who, powerUp: type });
          }}
        />
      )}
      {collected ? (
        <Burst color={color} radius={5} duration={0.9} />
      ) : (
        <>
          <group ref={ref}>
            <mesh castShadow>
              <boxGeometry args={[0.7, 0.7, 0.7]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.95, 0.95, 0.95]} />
              <meshBasicMaterial color={color} wireframe toneMapped={false} />
            </mesh>
          </group>
          <Sparkles count={25} scale={1.8} size={5} speed={0.8} color={color} />
          <pointLight color={color} intensity={6} distance={5} />
        </>
      )}
    </RigidBody>
  );
}
