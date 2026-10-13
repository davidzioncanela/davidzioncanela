'use client';

import { CloudPlatform } from '../platforms/CloudPlatform';
import { PowerUpBox } from '../powerups/PowerUpBox';
import { Coin } from '../items/Coin';
import { LowTunnel } from '../traversal/LowTunnel';
import { Rope } from '../traversal/Rope';
import { BranchTree } from '../traversal/Bars';
import { Wave } from '@/lib/enemies';
import { Ground, LevelProps, LevelShell } from './LevelShell';

export const LEVEL2_BOUNDS: [number, number] = [-8, 104];

const WAVES: Wave[] = [
  {
    triggerX: 30,
    arena: { left: 28.5, right: 35.5, floorY: 0.5 },
    groups: [
      { delay: 0, from: 'right', count: 2 },
      { delay: 3, from: 'ground', count: 2 },
    ],
  },
  {
    triggerX: 90,
    arena: { left: 88.5, right: 103.5, floorY: 12.3 },
    groups: [
      { delay: 0, from: 'left', count: 2 },
      { delay: 0, from: 'right', count: 2 },
      { delay: 4, from: 'sky', count: 3 },
      { delay: 9, from: 'right', count: 1, power: 'gigante' },
    ],
  },
];

// Fase 2 — Floresta das Cordas. Ênfase: cordas com física para balançar sobre os abismos.
// Pitada: uma árvore de galhos para subir até as nuvens.
export function Level2(props: LevelProps) {
  return (
    <LevelShell
      {...props}
      spawn={[-6, 2]}
      waves={WAVES}
      monsters={[[32, 0.5], [58, 2], [96, 12.3]]}
      cage={[101, 12.3]}
      intro={[
        'Fase 2: Floresta das Cordas!',
        'Pule e agarre as cordas. ← → balançam, ↑ ↓ sobem e descem, pular solta com o embalo.',
        'Na árvore, encoste as mãos nos galhos para se pendurar e subir.',
      ]}
    >
      <Ground x1={-10} x2={10} />
      <LowTunnel x1={3} x2={7} />

      {/* Abismo 1: três cordas */}
      <Rope id="r2-1" anchor={[14, 8]} />
      <Rope id="r2-2" anchor={[19.5, 8]} />
      <Rope id="r2-3" anchor={[25, 8]} />
      <Coin position={[17, 5, 0]} />
      <Coin position={[22, 5, 0]} />

      <Ground x1={28} x2={36} />
      <PowerUpBox position={[32, 3.5, 0]} type="fire-ball" />

      {/* Abismo 2: cordas mais longas e mais altas (precisa balançar bem) */}
      <Rope id="r2-4" anchor={[40, 9]} segments={10} />
      <Rope id="r2-5" anchor={[46.5, 9.5]} segments={10} />
      <Rope id="r2-6" anchor={[53, 10]} segments={9} />
      <Coin position={[43, 6, 0]} />
      <Coin position={[50, 7, 0]} />
      <PowerUpBox position={[46.5, 2.5, 0]} type="float" />

      <Ground x1={56} x2={62} top={2} />

      {/* Árvore de galhos até as nuvens */}
      <BranchTree
        id="t2"
        x={64}
        baseY={2}
        branches={[
          { side: -1, y: 4.7 },
          { side: 1, y: 6.2 },
          { side: -1, y: 7.7 },
          { side: 1, y: 9.2 },
        ]}
      />
      <Coin position={[66, 9, 0]} />

      <CloudPlatform position={[69.5, 10, 0]} scale={[4, 0.5, 3]} kind="firme" />
      <CloudPlatform position={[75.5, 11, 0]} scale={[3.5, 0.5, 3]} kind="afunda" />
      <CloudPlatform position={[81.5, 12, 0]} scale={[4, 0.5, 3]} kind="deriva" driftRange={2} />
      <PowerUpBox position={[75.5, 14, 0]} type="laser" />

      {/* Arena final nas nuvens */}
      <CloudPlatform position={[96, 12, 0]} scale={[16, 0.6, 4]} kind="firme" />
    </LevelShell>
  );
}
