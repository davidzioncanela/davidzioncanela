'use client';

import { forwardRef, useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { Mesh, Vector3 } from 'three';
import { GameState } from '../GameCanvas';
import { generateRandomNPCName } from '@/lib/npcNames';
import { useGameStore } from '@/store/gameStore';

interface NPCProps {
  position: [number, number, number];
  name?: string;
  health?: number;
  maxHealth?: number;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  playerPosition?: [number, number, number];
}

export const NPC = forwardRef<any, NPCProps>(function NPC(
  { position, name, health = 100, maxHealth = health, gameState, setGameState, playerPosition = [0,0,0] },
  ref
) {
  const bodyRef = useRef<any>(null);
  const meshRef = useRef<Mesh>(null);
  const [currentHealth, setCurrentHealth] = useState(health);
  const [inDuel, setInDuel] = useState(false);
  const [npcName] = useState(name || generateRandomNPCName());
  const { startDuel, endDuel, isDuelActive, currentNPC } = useGameStore();
  const duelTriggered = useRef(false);

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) return;

    const npcPos = body.translation();
    const dist = Math.sqrt(
      Math.pow(npcPos.x - playerPosition[0], 2) + 
      Math.pow(npcPos.y - playerPosition[1], 2)
    );

    if (dist < 5 && !duelTriggered.current && !inDuel) {
      duelTriggered.current = true;
      setInDuel(true);
      setGameState('duel');
      startDuel({ name: npcName, health: currentHealth, maxHealth });
    }
  });

  useEffect(() => {
    if (isDuelActive && currentNPC?.name === npcName) {
      setCurrentHealth(currentNPC.health);
    }
    if (!isDuelActive && inDuel) {
      setInDuel(false);
    }
  }, [isDuelActive, currentNPC, inDuel, npcName]);

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
      {inDuel && (
        <group position={[0, 2.5, 0]}>
          <mesh>
            <planeGeometry args={[2, 0.2]} />
            <meshBasicMaterial color="#333" />
          </mesh>
          <mesh position={[-(2 - (currentHealth / maxHealth) * 2) / 2, 0, 0.01]}>
            <planeGeometry args={[(currentHealth / maxHealth) * 2, 0.18]} />
            <meshBasicMaterial color="#FF0000" />
          </mesh>
        </group>
      )}
      <group position={[0, 2.8, 0]} visible={inDuel}>
        <sprite>
          <spriteMaterial transparent opacity={0.01} />
        </sprite>
      </group>
    </RigidBody>
  );
});

NPC.displayName = 'NPC';
