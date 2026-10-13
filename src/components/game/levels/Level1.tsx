'use client';

import { CloudPlatform } from '../platforms/CloudPlatform';
import { PowerUpBox } from '../powerups/PowerUpBox';
import { Coin } from '../items/Coin';
import { LowTunnel } from '../traversal/LowTunnel';
import { Rope } from '../traversal/Rope';
import { Wave } from '@/lib/enemies';
import { Ground, LevelProps, LevelShell } from './LevelShell';

export const LEVEL1_BOUNDS: [number, number] = [-10, 134];

const WAVES: Wave[] = [
  {
    triggerX: 70,
    arena: { left: 68.5, right: 81.5, floorY: 14.3 },
    groups: [
      { delay: 0, from: 'left', count: 1 },
      { delay: 0, from: 'right', count: 2 },
      { delay: 4, from: 'sky', count: 3 },
      { delay: 9, from: 'right', count: 2 },
    ],
  },
  {
    triggerX: 118,
    arena: { left: 116.5, right: 133.5, floorY: 18.3 },
    groups: [
      { delay: 0, from: 'left', count: 2 },
      { delay: 0, from: 'right', count: 2 },
      { delay: 4, from: 'sky', count: 4 },
      { delay: 8, from: 'ground', count: 2 },
      { delay: 12, from: 'right', count: 1, power: 'gigante' },
    ],
  },
];

// Fase 1 — Da Terra às Nuvens. Ênfase: nuvens com física (afundam com o peso e se
// estabilizam, quicam como cama elástica, passeiam à deriva). Pitada: uma corda no fim.
export function Level1(props: LevelProps) {
  return (
    <LevelShell
      {...props}
      spawn={[-7, 2]}
      waves={WAVES}
      monsters={[[13, 0.5], [23, 3.5], [75, 14.3]]}
      cage={[131, 18.3]}
      intro={[
        'Fase 1: Da Terra às Nuvens!',
        'Vamos subir até as nuvens, onde o Bowser Jr. esconde a gaiola.',
        'As nuvens têm vida própria: algumas afundam com o peso (e afundam mais com mais gente em cima!), as rosas são elásticas e outras passeiam.',
        'Segure ↓ por 2 segundos e solte para dar um Super Pulo!',
      ]}
    >
      {/* Na terra: chão e degraus de grama subindo */}
      <Ground x1={-12} x2={12} />
      <Ground x1={15} x2={19} top={2} />
      <Ground x1={21} x2={25} top={3.5} />
      <Ground x1={27} x2={30} top={5} />
      <Coin position={[17, 3.5, 0]} />
      <Coin position={[23, 5, 0]} />
      <PowerUpBox position={[5, 2.5, 0]} type="super-jump" />
      {/* Atalho baixo: só engatinhando */}
      <LowTunnel x1={7} x2={11} />

      {/* Subindo pelas nuvens: firme, que afunda, elástica e à deriva */}
      <CloudPlatform position={[34, 6.5, 0]} scale={[4, 0.5, 3]} kind="firme" />
      <CloudPlatform position={[40, 8, 0]} scale={[3.5, 0.5, 3]} kind="afunda" />
      <CloudPlatform position={[45, 6.5, 0]} scale={[3, 0.5, 3]} kind="elastica" />
      <CloudPlatform position={[50, 13, 0]} scale={[4, 0.5, 3]} kind="firme" />
      <CloudPlatform position={[57, 13.5, 0]} scale={[4, 0.5, 3]} kind="deriva" driftRange={2.5} />
      <CloudPlatform position={[63.5, 14, 0]} scale={[3.5, 0.5, 3]} kind="afunda" />
      <Coin position={[40, 10, 0]} />
      <Coin position={[45, 12, 0]} />
      <Coin position={[57, 15.5, 0]} />

      {/* Arena 1: ilha de nuvem firme */}
      <CloudPlatform position={[75, 14, 0]} scale={[14, 0.6, 4]} kind="firme" />
      <PowerUpBox position={[75, 17, 0]} type="fire-ball" />

      {/* Mais alto: deriva, elástica, afunda e uma corda até a ilha final */}
      <CloudPlatform position={[88, 15, 0]} scale={[4, 0.5, 3]} kind="deriva" driftRange={2} />
      <CloudPlatform position={[94, 13, 0]} scale={[3, 0.5, 3]} kind="elastica" />
      <CloudPlatform position={[100, 19, 0]} scale={[4, 0.5, 3]} kind="firme" />
      <CloudPlatform position={[106, 19, 0]} scale={[3.5, 0.5, 3]} kind="afunda" />
      <Rope id="rope-l1" anchor={[111, 25]} segments={7} />
      <PowerUpBox position={[100, 22, 0]} type="laser" />
      <Coin position={[94, 17, 0]} />
      <Coin position={[106, 21, 0]} />

      {/* Arena final: ilha de nuvem com a gaiola */}
      <CloudPlatform position={[125, 18, 0]} scale={[18, 0.6, 4]} kind="firme" />
    </LevelShell>
  );
}
