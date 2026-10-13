'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { playerRuntime } from '@/lib/gameRuntime';
import { CharacterModel } from './CharacterModel';
import { CharacterInfo } from '@/lib/characters';

interface CaptiveProps {
  characters: [CharacterInfo, CharacterInfo];
  position?: [number, number, number];
  // Só podem ser resgatadas depois que o guarda for derrotado
  canRescue: boolean;
  onRescued: () => void;
}

const RESCUE_DISTANCE = 2;

// A dupla do outro time espera o resgate numa gaiola no fim da fase
export function Captive({ characters, position = [0, 0, 0], canRescue, onRescued }: CaptiveProps) {
  const [rescued, setRescued] = useState(false);
  const cageRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (rescued) {
      if (cageRef.current && cageRef.current.position.y < 8) cageRef.current.position.y += delta * 3;
      return;
    }
    const p = playerRuntime.position;
    if (canRescue && Math.hypot(p.x - position[0], p.y - position[1]) < RESCUE_DISTANCE) {
      setRescued(true);
      onRescued();
    }
  });

  const animation = rescued ? 'Cheer' : 'Idle';

  return (
    <group position={position}>
      {characters.map((c, i) => (
        <group key={c.id} position={[i === 0 ? -0.35 : 0.4, 0, i * 0.1]}>
          <CharacterModel model={c.model} animation={animation} accessories={c.gear} facing={-1} height={c.height} />
        </group>
      ))}
      <group ref={cageRef}>
        {[-0.9, -0.45, 0, 0.45, 0.9].map((x) =>
          [-0.6, 0.6].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 1.1, z]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 2.2]} />
              <meshStandardMaterial color={canRescue ? '#D1D5DB' : '#4B5563'} metalness={0.6} />
            </mesh>
          ))
        )}
        <mesh position={[0, 2.2, 0]} castShadow>
          <boxGeometry args={[2, 0.1, 1.4]} />
          <meshStandardMaterial color="#4B5563" metalness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
