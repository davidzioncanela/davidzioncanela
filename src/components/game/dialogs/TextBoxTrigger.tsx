'use client';

import { useState } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { GameState } from '../GameCanvas';

interface TextBoxTriggerProps {
  position: [number, number, number];
  text: string[];
  setGameState: (state: GameState) => void;
  setDialogText: (text: string[]) => void;
  oneTime?: boolean;
}

export function TextBoxTrigger({ position, text, setGameState, setDialogText, oneTime = true }: TextBoxTriggerProps) {
  const [triggered, setTriggered] = useState(false);

  const handleTrigger = () => {
    if (oneTime && triggered) return;
    setTriggered(true);
    setDialogText(text);
    setGameState('dialog');
  };

  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <CuboidCollider
        args={[2, 2, 2]}
        sensor
        onIntersectionEnter={({ other }) => other.rigidBodyObject?.userData?.player && handleTrigger()}
      />
      <mesh visible={!triggered}>
        <boxGeometry args={[0.5, 0.3, 0.5]} />
        <meshStandardMaterial color="#00FF88" emissive="#00FF88" emissiveIntensity={0.6} />
      </mesh>
    </RigidBody>
  );
}
