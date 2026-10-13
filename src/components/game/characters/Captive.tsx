'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { players } from '@/lib/gameRuntime';
import { CharacterModel } from './CharacterModel';
import { CharacterInfo } from '@/lib/characters';

interface CaptiveProps {
  characters: CharacterInfo[];
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
    const near = [...players.values()].some((p) => Math.hypot(p.position.x - position[0], p.position.y - position[1]) < RESCUE_DISTANCE);
    if (canRescue && near) {
      setRescued(true);
      onRescued();
    }
  });

  const animation = rescued ? 'Cheer' : 'Idle';

  return (
    <group position={position}>
      {characters.map((c, i) => (
        <group key={c.id} position={[(i - (characters.length - 1) / 2) * 0.75, 0, i * 0.1]}>
          <CharacterModel model={c.model} animation={animation} accessories={c.gear} facing={-1} height={c.height} />
        </group>
      ))}
      {/* Com os quatro jogando, a gaiola guarda a chave da pracinha */}
      {characters.length === 0 && (
        <mesh position={[0, 0.9, 0]} rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[0.25, 0.08, 12, 24]} />
          <meshStandardMaterial color="#FACC15" emissive="#FACC15" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      )}
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
