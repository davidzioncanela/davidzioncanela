'use client';

import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Coin } from '../items/Coin';

export const TUNNEL_GAP = 1.0;

// Atalho de teto baixo: só passa quem engatinha (a Lara, pequenininha, passa em pé).
// Dentro sempre tem moedas de prêmio.
export function LowTunnel({ x1, x2, floor = 0.5, coins = 3 }: { x1: number; x2: number; floor?: number; coins?: number }) {
  const w = x2 - x1;
  const h = 1.6;
  const cy = floor + TUNNEL_GAP + h / 2;
  return (
    <group>
      <RigidBody type="fixed" position={[(x1 + x2) / 2, cy, 0]} colliders={false}>
        <CuboidCollider args={[w / 2, h / 2, 3]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, 6]} />
          <meshStandardMaterial color="#A8A29E" />
        </mesh>
        <mesh position={[0, h / 2 + 0.15, 0]}>
          <boxGeometry args={[w + 0.2, 0.3, 6.2]} />
          <meshStandardMaterial color="#4ADE80" />
        </mesh>
        {/* Placa: setinha para baixo indicando engatinhar */}
        <mesh position={[-w / 2 - 0.01, -h / 2 + 0.3, 3.05]}>
          <planeGeometry args={[0.6, 0.35]} />
          <meshBasicMaterial color="#FFC800" toneMapped={false} />
        </mesh>
      </RigidBody>
      {Array.from({ length: coins }, (_, i) => (
        <Coin key={i} position={[x1 + ((i + 1) * w) / (coins + 1), floor + 0.45, 0]} />
      ))}
    </group>
  );
}
