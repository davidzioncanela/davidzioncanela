'use client';

import { CloudPlatform } from '../platforms/CloudPlatform';
import { PowerUpBox } from '../powerups/PowerUpBox';
import { Coin } from '../items/Coin';
import { LowTunnel } from '../traversal/LowTunnel';
import { Rope } from '../traversal/Rope';
import { MonkeyBars } from '../traversal/Bars';
import { Water } from '../traversal/Water';
import { Wave } from '@/lib/enemies';
import { Ground, LevelProps, LevelShell } from './LevelShell';

export const LEVEL3_BOUNDS: [number, number] = [-8, 106];

const WAVES: Wave[] = [
  {
    triggerX: 28,
    arena: { left: 26.5, right: 33.5, floorY: 0.5 },
    groups: [
      { delay: 0, from: 'left', count: 1 },
      { delay: 0, from: 'right', count: 1 },
      { delay: 4, from: 'sky', count: 2 },
    ],
  },
  {
    triggerX: 92,
    arena: { left: 90.5, right: 105.5, floorY: 11.3 },
    groups: [
      { delay: 0, from: 'left', count: 2 },
      { delay: 0, from: 'right', count: 2 },
      { delay: 4, from: 'ground', count: 3 },
      { delay: 9, from: 'right', count: 1, power: 'gigante' },
    ],
  },
];

// Fase 3 — Lago e Trepa-trepa. Ênfase: natação (braçadas e fôlego) e barras horizontais.
// Pitada: uma corda e nuvens elásticas para subir até a arena.
export function Level3(props: LevelProps) {
  return (
    <LevelShell
      {...props}
      spawn={[-6, 2]}
      waves={WAVES}
      monsters={[[3, 0.5], [30, 0.5], [68, 3]]}
      cage={[103, 11.3]}
      intro={[
        'Fase 3: Lago e Trepa-trepa!',
        'Atravesse pendurado no trepa-trepa: encoste as mãos, ← → anda, ↓ solta.',
        'Caiu na água? Nade! ↑ dá braçadas. Olhe o fôlego e volte à superfície para respirar.',
      ]}
    >
      <Ground x1={-10} x2={10} />

      {/* Lago 1 com trepa-trepa por cima */}
      <Water id="l3-lake1" x1={10} x2={26} bottom={-5} surface={0.2} />
      <MonkeyBars id="l3-bars1" x1={11} x2={25} y={3.6} />
      <Coin position={[14, 2, 0]} />
      <Coin position={[18, -2.5, 0]} />
      <Coin position={[22, 2, 0]} />

      <Ground x1={26} x2={34} />
      <PowerUpBox position={[30, 3.5, 0]} type="super-speed" />

      {/* Lago 2: fundo, com moedas lá embaixo e trepa-trepa curto */}
      <Water id="l3-lake2" x1={34} x2={54} bottom={-5.5} surface={0.2} />
      <MonkeyBars id="l3-bars2" x1={38} x2={44} y={3.6} />
      {[37, 41, 45, 49].map((x) => (
        <Coin key={x} position={[x, -4, 0]} />
      ))}
      <PowerUpBox position={[51, -3.5, 0]} type="float" />

      <Ground x1={54} x2={60} />
      <LowTunnel x1={55} x2={59} />

      {/* Corda sobre o vão até o pilar */}
      <Rope id="l3-rope" anchor={[63, 9]} segments={8} />
      <Ground x1={66} x2={70} top={3} />

      {/* Nuvens elásticas lançam para o alto */}
      <CloudPlatform position={[73, 3, 0]} scale={[3, 0.5, 3]} kind="elastica" />
      <CloudPlatform position={[78, 10, 0]} scale={[4, 0.5, 3]} kind="firme" />
      <CloudPlatform position={[84, 11, 0]} scale={[4, 0.5, 3]} kind="deriva" driftRange={2} />
      <PowerUpBox position={[78, 13, 0]} type="laser" />
      <Coin position={[73, 8, 0]} />

      {/* Arena final */}
      <CloudPlatform position={[98, 11, 0]} scale={[16, 0.6, 4]} kind="firme" />
    </LevelShell>
  );
}
