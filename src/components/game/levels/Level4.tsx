'use client';

import { CloudPlatform } from '../platforms/CloudPlatform';
import { PowerUpBox } from '../powerups/PowerUpBox';
import { Coin } from '../items/Coin';
import { LowTunnel } from '../traversal/LowTunnel';
import { PipeMaze } from '../traversal/PipeMaze';
import { Door } from '../traversal/Door';
import { MonkeyBars } from '../traversal/Bars';
import { Wave } from '@/lib/enemies';
import { Ground, LevelProps, LevelShell } from './LevelShell';

export const LEVEL4_BOUNDS: [number, number] = [-8, 214];

const WAVES: Wave[] = [
  {
    triggerX: 34,
    arena: { left: 31, right: 45.5, floorY: 0.5 },
    groups: [
      { delay: 0, from: 'right', count: 2 },
      { delay: 3, from: 'ground', count: 3 },
    ],
  },
  {
    triggerX: 79,
    arena: { left: 77.5, right: 92.5, floorY: 12.3 },
    groups: [
      { delay: 0, from: 'left', count: 2 },
      { delay: 0, from: 'right', count: 2 },
      { delay: 4, from: 'sky', count: 3 },
      { delay: 9, from: 'right', count: 1, power: 'gigante' },
    ],
  },
];

// Fase 4 — Encanamento. Ênfase: labirintos de canos aleatórios em raio-X (escadas,
// escorregadores com água, rampas escorregadias, becos com prêmios) e portas para a sala secreta.
// Pitada: trepa-trepa curto.
export function Level4(props: LevelProps) {
  const { seed } = props;
  return (
    <LevelShell
      {...props}
      spawn={[-6, 2]}
      waves={WAVES}
      monsters={[[20, 0.5], [40, 0.5], [55, 0.5], [66, 8.5]]}
      cage={[90, 12.3]}
      intro={[
        'Fase 4: Encanamento!',
        'Fique em cima da boca do cano verde e aperte ↓ para entrar. Lá dentro, use as setas para escolher o caminho.',
        'Escadas sobem e descem; os escorregadores com água descem sozinhos; para subir as rampas molhadas, continue empurrando!',
        'Cada canto do labirinto vale pontos, e os becos sem saída escondem prêmios. O minimapa mostra o que já foi descoberto.',
        'Os canos mudam a cada partida. Nas portas, aperte ↑ para atravessar.',
      ]}
    >
      <Ground x1={-10} x2={4.5} />
      <LowTunnel x1={-1} x2={3} />
      {/* Laje fina por cima do labirinto 1, que fica no subsolo */}
      <Ground x1={4.5} x2={30} bottom={-0.5} />
      <PipeMaze id="l4-a" origin={[6, -3]} cols={6} rows={3} entranceY={0.5} exitY={0.5} seed={seed} />
      {/* Por cima, um trepa-trepa curto leva a moedas */}
      <Ground x1={11} x2={13} top={1.5} bottom={0.5} />
      <MonkeyBars id="l4-bars" x1={12} x2={24} y={4.5} />
      <Coin position={[16, 3, 0]} />
      <Coin position={[20, 3, 0]} />

      <Ground x1={30} x2={46.5} />
      <Door id="l4-door-a" x={36} y={0.5} target="l4-door-b" />
      <Door id="l4-door-c" x={42} y={0.5} target="l4-door-d" color="#7C3AED" />

      {/* Sala secreta: só se chega pela porta */}
      <Ground x1={196} x2={212} />
      <Door id="l4-door-b" x={198} y={0.5} target="l4-door-a" />
      <Door id="l4-door-d" x={210} y={0.5} target="l4-door-c" color="#7C3AED" />
      <PowerUpBox position={[204, 2.5, 0]} type="laser" />
      {[200, 202, 206, 208].map((x) => (
        <Coin key={`s${x}`} position={[x, 1.5, 0]} />
      ))}
      <mesh position={[204, 4, -2]}>
        <boxGeometry args={[16, 8, 0.5]} />
        <meshStandardMaterial color="#44403C" />
      </mesh>

      {/* Labirinto 2: a saída sobe por dentro da torre */}
      <Ground x1={46.5} x2={62} bottom={-0.5} />
      <PipeMaze id="l4-b" origin={[48, -3]} cols={5} rows={3} entranceY={0.5} exitY={8.5} seed={seed + 7} />
      <Ground x1={62} x2={70} top={8.5} />
      <PowerUpBox position={[68, 11, 0]} type="fire-ball" />

      <CloudPlatform position={[73.5, 10.5, 0]} scale={[3.5, 0.5, 3]} kind="afunda" />

      {/* Arena final nas nuvens */}
      <CloudPlatform position={[85, 12, 0]} scale={[16, 0.6, 4]} kind="firme" />
    </LevelShell>
  );
}
