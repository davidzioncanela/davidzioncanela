'use client';

import { useEffect, useState } from 'react';
import { Player } from '../characters/Player';
import { Companion } from '../characters/Companion';
import { Captive } from '../characters/Captive';
import { WaveManager } from '../enemies/WaveManager';
import { CloudPlatform } from '../platforms/CloudPlatform';
import { GrassPlatform } from '../platforms/GrassPlatform';
import { PowerUpBox } from '../powerups/PowerUpBox';
import { Projectiles } from '../powerups/Projectiles';
import { Coin } from '../items/Coin';
import { TextBoxTrigger } from '../dialogs/TextBoxTrigger';
import { GameState } from '../GameCanvas';
import { useGameStore } from '@/store/gameStore';
import { CHARACTERS, PlayerSlot, teamSetup } from '@/lib/characters';
import { Wave } from '@/lib/enemies';
import { isGuest, netSession, sendEvent } from '@/lib/net';
import { NetSync } from '../net/NetSync';
import { RemotePlayer } from '../net/RemotePlayer';

interface Level1Props {
  slots: PlayerSlot[];
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setDialogText: (text: string[]) => void;
}

export const LEVEL1_BOUNDS: [number, number] = [-12, 80];

// Pontos de nascimento: cada jogador começa numa das primeiras nuvens
const SPAWNS: [number, number, number][] = [
  [-12, 16, 0],
  [-13, 16, 0],
  [-11, 16, 0],
  [-12.5, 17, 0],
];

// Hordas estilo Metal Slug: a tela trava na arena e os inimigos chegam em levas
const WAVES: Wave[] = [
  {
    triggerX: 17,
    arena: { left: 15, right: 27, floorY: 1.75 },
    groups: [
      { delay: 0, from: 'left', count: 1 },
      { delay: 0, from: 'right', count: 2 },
      { delay: 4, from: 'sky', count: 3 },
      { delay: 9, from: 'ground', count: 2 },
    ],
  },
  {
    triggerX: 43,
    arena: { left: 41, right: 55, floorY: 3.25 },
    groups: [
      { delay: 0, from: 'right', count: 3 },
      { delay: 3, from: 'sky', count: 3 },
      { delay: 7, from: 'left', count: 2 },
      { delay: 11, from: 'ground', count: 3 },
    ],
  },
  {
    triggerX: 66,
    arena: { left: 64, right: 80, floorY: 0.5 },
    groups: [
      { delay: 0, from: 'left', count: 2 },
      { delay: 0, from: 'right', count: 2 },
      { delay: 4, from: 'ground', count: 3 },
      { delay: 8, from: 'sky', count: 3 },
      { delay: 12, from: 'right', count: 1, power: 'gigante' },
    ],
  },
];

export function Level1({ slots, gameState, setGameState, setDialogText }: Level1Props) {
  const [cageOpen, setCageOpen] = useState(false);
  const { companion, captives } = teamSetup(slots);
  const team = slots.map((s) => CHARACTERS[s.character]);
  const frozen = gameState === 'dialog' || gameState === 'gameOver' || gameState === 'victory';
  const names = (list: { name: string }[]) => list.map((c) => c.name).join(' e ');

  const lives = useGameStore((s) => s.lives);
  useEffect(() => {
    if (lives <= 0) setGameState('gameOver');
  }, [lives, setGameState]);

  const heroes = companion ? [...team, companion] : team;

  return (
    <group>
      {/* Nuvens descendo para a Terra */}
      <CloudPlatform position={[-12, 14, 0]} scale={[4, 0.5, 3]} animated targetY={10} delay={0.3} speed={1.3} float floatSpeed={0.5} floatRange={0.3} />
      <CloudPlatform position={[-6, 12, 0]} scale={[4, 0.5, 3]} animated targetY={8} delay={0.6} speed={1.3} float floatSpeed={0.6} floatRange={0.25} />
      <CloudPlatform position={[0, 10, 0]} scale={[4, 0.5, 3]} animated targetY={6} delay={0.9} speed={1.3} float floatSpeed={0.7} floatRange={0.3} />
      <CloudPlatform position={[6, 8, 0]} scale={[4, 0.5, 3]} animated targetY={4} delay={1.2} speed={1.3} float floatSpeed={0.55} floatRange={0.25} />
      <CloudPlatform position={[11, 6, 0]} scale={[4, 0.5, 3]} animated targetY={2.5} delay={1.5} speed={1.3} float floatSpeed={0.65} floatRange={0.3} />

      <TextBoxTrigger
        position={[-12, 12, 0]}
        text={[
          `${names(heroes)}: Precisamos resgatar ${captives.length ? names(captives) : 'a chave da pracinha'}!`,
          captives.length
            ? `Bowser Jr. prendeu ${captives.map((c) => `${c.name} (${c.age})`).join(' e ')} numa gaiola no fim da fase!`
            : 'Bowser Jr. trancou a chave da pracinha numa gaiola no fim da fase!',
          'Em alguns pontos a tela trava e chega uma horda: inimigos pelos lados, do céu e do chão!',
          slots.length > 1
            ? 'Jogador 1: W A S D, F ataca, G poder de ajuda. Jogador 2: setas, K ataca, L poder de ajuda.'
            : 'Setas ou A/D andam, Espaço pula, F ataca e G usa o poder de ajuda.',
          'Segure ↓ por 2 segundos e solte para dar um Super Pulo!',
        ]}
        setGameState={setGameState}
        setDialogText={setDialogText}
      />

      <Coin position={[-6, 9.5, 0]} />
      <Coin position={[0, 7.5, 0]} />
      <Coin position={[6, 5.5, 0]} />
      <PowerUpBox position={[3, 9, 0]} type="super-jump" />

      {/* Arena 1: ilha de nuvem */}
      <CloudPlatform position={[21, 1.5, 0]} scale={[14, 0.5, 4]} />
      <PowerUpBox position={[21, 4.5, 0]} type="super-speed" />
      <Coin position={[18, 3, 0]} />
      <Coin position={[24, 3, 0]} />

      <CloudPlatform position={[32, 3, 0]} scale={[3.5, 0.5, 3]} float floatSpeed={0.6} floatRange={0.3} />
      <CloudPlatform position={[37, 4, 0]} scale={[3.5, 0.5, 3]} float floatSpeed={0.7} floatRange={0.25} />
      <PowerUpBox position={[34.5, 7, 0]} type="float" />
      <Coin position={[32, 4.5, 0]} />
      <Coin position={[37, 5.5, 0]} />

      {/* Arena 2: ilha de nuvem mais alta */}
      <CloudPlatform position={[48, 3, 0]} scale={[16, 0.5, 4]} />
      <PowerUpBox position={[48, 6, 0]} type="fire-ball" />

      <CloudPlatform position={[59.5, 2, 0]} scale={[3.5, 0.5, 3]} float floatSpeed={0.6} floatRange={0.25} />
      <PowerUpBox position={[59.5, 5, 0]} type="laser" />

      <TextBoxTrigger
        position={[59.5, 3.5, 0]}
        text={['Chegamos em Terra firme!', 'O capanga Gigante guarda a gaiola. Usem os poderes de ajuda juntos!']}
        setGameState={setGameState}
        setDialogText={setDialogText}
      />

      {/* Arena final: chão de grama com a gaiola */}
      <GrassPlatform position={[74, 0, 0]} scale={[22, 1, 6]} />

      {/* No modo online só o host simula as hordas; os convidados veem os bonecos sincronizados */}
      {!isGuest() && <WaveManager waves={WAVES} setGameState={setGameState} onAllCleared={() => setCageOpen(true)} />}

      <Captive characters={captives} position={[82, 0.5, 0]} canRescue={cageOpen}
        onRescued={() => {
          sendEvent({ type: 'rescued' });
          setGameState('victory');
        }}
      />

      {slots.map((slot, i) =>
        slot.remote ? (
          <RemotePlayer key={slot.character} character={CHARACTERS[slot.character]} position={SPAWNS[i]} />
        ) : (
          <Player key={slot.character} character={CHARACTERS[slot.character]} input={slot.input} position={SPAWNS[i]} frozen={frozen} />
        )
      )}
      {companion && <Companion character={companion} leader={slots[0].character} position={SPAWNS[1]} frozen={frozen} />}
      <Projectiles />
      {netSession.active && <NetSync gameState={gameState} setGameState={setGameState} cageOpen={cageOpen} setCageOpen={setCageOpen} />}
    </group>
  );
}
