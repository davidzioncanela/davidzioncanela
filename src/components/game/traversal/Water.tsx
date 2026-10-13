'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { Mesh } from 'three';
import { waters } from '@/lib/traversal';

// Lago para nadar: superfície ondulando, fundo de areia e bolhas
export function Water({ id, x1, x2, bottom, surface }: { id: string; x1: number; x2: number; bottom: number; surface: number }) {
  const top = useRef<Mesh>(null);
  useEffect(() => {
    waters.set(id, { id, x1, x2, bottom, surface });
    return () => {
      waters.delete(id);
    };
  }, [id, x1, x2, bottom, surface]);

  useFrame((state) => {
    if (top.current) top.current.position.y = surface + Math.sin(state.clock.elapsedTime * 2) * 0.05;
  });

  const w = x2 - x1;
  const h = surface - bottom;
  const cx = (x1 + x2) / 2;
  return (
    <group>
      <mesh position={[cx, bottom + h / 2, 0]}>
        <boxGeometry args={[w, h, 3]} />
        <meshStandardMaterial color="#0EA5E9" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      <mesh ref={top} position={[cx, surface, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, 3]} />
        <meshStandardMaterial color="#7DD3FC" emissive="#38BDF8" emissiveIntensity={0.5} transparent opacity={0.7} />
      </mesh>
      <mesh position={[cx, bottom - 0.25, 0]} receiveShadow>
        <boxGeometry args={[w, 0.5, 3]} />
        <meshStandardMaterial color="#FDE68A" />
      </mesh>
      <Sparkles count={50} scale={[w, h, 2]} position={[cx, bottom + h / 2, 0]} size={5} speed={0.6} color="#E0F2FE" />
    </group>
  );
}
