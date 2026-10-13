'use client';

import { useEffect } from 'react';
import { Clone, useGLTF } from '@react-three/drei';
import { bars } from '@/lib/traversal';

function useBar(id: string, x1: number, x2: number, y: number) {
  useEffect(() => {
    bars.set(id, { id, x1, x2, y });
    return () => {
      bars.delete(id);
    };
  }, [id, x1, x2, y]);
}

// Barra horizontal (trepa-trepa): pendura e atravessa mão a mão
export function MonkeyBars({ id, x1, x2, y }: { id: string; x1: number; x2: number; y: number }) {
  useBar(id, x1, x2, y);
  const rungs = Math.floor((x2 - x1) / 0.8);
  return (
    <group>
      <mesh position={[(x1 + x2) / 2, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, x2 - x1, 8]} />
        <meshStandardMaterial color="#F43F5E" metalness={0.4} roughness={0.3} />
      </mesh>
      {Array.from({ length: rungs + 1 }, (_, i) => (
        <mesh key={i} position={[x1 + i * 0.8, y, 0]} castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#FACC15" />
        </mesh>
      ))}
      {/* Postes nas pontas */}
      {[x1, x2].map((x) => (
        <mesh key={x} position={[x, y / 2 - 3, -0.4]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, y + 6, 8]} />
          <meshStandardMaterial color="#38BDF8" />
        </mesh>
      ))}
    </group>
  );
}

// Árvore com galhos alternados para subir pendurando
export function BranchTree({ id, x, baseY, branches }: { id: string; x: number; baseY: number; branches: { side: 1 | -1; y: number; length?: number }[] }) {
  const { scene } = useGLTF('/assets/scenery/tree_single_B.gltf');
  const top = Math.max(...branches.map((b) => b.y)) + 2;
  return (
    <group>
      <mesh position={[x, (baseY + top) / 2, -0.6]} castShadow>
        <cylinderGeometry args={[0.45, 0.6, top - baseY, 10]} />
        <meshStandardMaterial color="#8B5A2B" />
      </mesh>
      <Clone object={scene} position={[x, top - 2, -0.6]} scale={4} />
      {branches.map((b, i) => (
        <Branch key={i} id={`${id}-${i}`} x={x} y={b.y} side={b.side} length={b.length ?? 2.6} />
      ))}
    </group>
  );
}

function Branch({ id, x, y, side, length }: { id: string; x: number; y: number; side: 1 | -1; length: number }) {
  const x1 = side === 1 ? x + 0.4 : x - 0.4 - length;
  const x2 = side === 1 ? x + 0.4 + length : x - 0.4;
  useBar(id, x1, x2, y);
  return (
    <group>
      <mesh position={[(x1 + x2) / 2, y, 0]} rotation={[0, 0, Math.PI / 2 + side * 0.06]} castShadow>
        <cylinderGeometry args={[0.1, 0.16, length, 8]} />
        <meshStandardMaterial color="#7C4A1E" />
      </mesh>
      <mesh position={[side === 1 ? x2 : x1, y + 0.2, 0]}>
        <sphereGeometry args={[0.45, 8, 8]} />
        <meshStandardMaterial color="#4ADE80" />
      </mesh>
    </group>
  );
}

useGLTF.preload('/assets/scenery/tree_single_B.gltf');
