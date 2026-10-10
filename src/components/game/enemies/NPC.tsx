'use client';

import { forwardRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { Mesh } from 'three';
import { GameState } from '../GameCanvas';

interface NPCProps {
  position: [number, number, number];
  name: string;
  health: number;
  gameState: GameState;
  setGameState: (state: GameState) => void;
}

export const NPC = forwardRef<any, NPCProps>(function NPC(
  { position, name, health = 100, gameState, setGameState },
  ref
) {
  const bodyRef = useRef<any>(null);
  const meshRef = useRef<Mesh>(null);
  const [currentHealth, setCurrentHealth] = useState(health);
  const [inDuel, setInDuel] = useState(false);
  const [playerNear, setPlayerNear] = useState(false);

  useFrame(() => {
    // Simulate player detection - Metal Slug style duel trigger
    if (!inDuel && playerNear) {
      setInDuel(true);
      setGameState('duel');
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={position}
      colliders={false}
      mass={1}
      lockRotations
      type="dynamic"
    >
      <CapsuleCollider args={[0.5, 0.5]} position={[0, 1, 0]} />
      <mesh ref={meshRef} castShadow position={[0, 1, 0]}>
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
      {/* Health bar display above */}
      {inDuel && (
        <group position={[0, 2.5, 0]}>
          <mesh>
            <planeGeometry args={[2, 0.2]} />
            <meshBasicMaterial color="#333" />
          </mesh>
          <mesh position={[-(2 - (currentHealth / health) * 2) / 2, 0, 0.01]}>
            <planeGeometry args={[(currentHealth / health) * 2, 0.18]} />
            <meshBasicMaterial color="#FF0000" />
          </mesh>
        </group>
      )}
    </RigidBody>
  );
});
