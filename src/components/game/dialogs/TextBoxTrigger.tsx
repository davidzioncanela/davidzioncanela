'use client';

import { useState } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { GameState } from '../GameCanvas';

interface TextBoxTriggerProps {
  position: [number, number, number];
  text: string[];
  setGameState: (state: GameState) => void;
  setDialogText: (text: string[]) => void;
}

export function TextBoxTrigger({ position, text, setGameState, setDialogText }: TextBoxTriggerProps) {
  const [triggered, setTriggered] = useState(false);

  const handleTrigger = () => {
    if (!triggered) {
      setTriggered(true);
      setDialogText(text);
      setGameState('dialog');
    }
  };

  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <CuboidCollider
        args={[2, 2, 2]}
        sensor
        onIntersectionEnter={() => handleTrigger()}
      />
      <mesh visible={!triggered}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.5} />
      </mesh>
    </RigidBody>
  );
}
