'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { doors } from '@/lib/traversal';

// Porta ligada a outra porta: perto dela, ↑ entra e sai na porta de destino
export function Door({ id, x, y, target, color = '#A16207' }: { id: string; x: number; y: number; target: string; color?: string }) {
  const arrow = useRef<Mesh>(null);
  useEffect(() => {
    doors.set(id, { id, x, y, target });
    return () => {
      doors.delete(id);
    };
  }, [id, x, y, target]);

  useFrame((state) => {
    if (arrow.current) arrow.current.position.y = y + 2.6 + Math.sin(state.clock.elapsedTime * 3) * 0.12;
  });

  return (
    <group>
      <mesh position={[x, y + 1.05, -0.3]} castShadow>
        <boxGeometry args={[1.5, 2.3, 0.2]} />
        <meshStandardMaterial color="#78350F" />
      </mesh>
      <mesh position={[x, y + 1, -0.15]}>
        <boxGeometry args={[1.15, 2, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[x + 0.38, y + 1, -0.05]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#FACC15" emissive="#FACC15" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      <mesh ref={arrow} position={[x, y + 2.6, 0]}>
        <coneGeometry args={[0.22, 0.4, 3]} />
        <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
      </mesh>
    </group>
  );
}
