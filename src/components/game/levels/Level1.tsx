'use client';

import { useCallback, useEffect, useState } from 'react';
import { Player } from '../characters/Player';
import { Companion } from '../characters/Companion';
import { Captive } from '../characters/Captive';
import { WaveManager } from '../enemies/WaveManager';
import { Wave } from '@/lib/enemies';
import { CloudPlatform } from '../platforms/CloudPlatform';
import { GrassPlatform } from '../platforms/GrassPlatform';
import { PowerUpBox } from '../powerups/PowerUpBox';
import { Projectiles } from '../powerups/Projectiles';
import { Coin } from '../items/Coin';
import { TextBoxTrigger } from '../dialogs/TextBoxTrigger';
import { GameState } from '../GameCanvas';
import { useGameStore } from '@/store/gameStore';
import { TeamId, TEAMS } from '@/lib/characters';

interface Level1Props {
  team: TeamId;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setDialogText: (text: string[]) => void;
}

const SPAWN: [number, number, number] = [-12, 16, 0];

// Ondas de inimigos ao longo da jornada (posições de nascimento acima das plataformas)
const WAVES: Wave[] = [
  { triggerX: -1, lock: [-3, 8], spawns: [{ position: [6, 7, 0] }] },
  { triggerX: 13, lock: [10, 20], spawns: [{ position: [18, 6, 0] }, { position: [12, 6, 0] }] },
  { triggerX: 29, lock: [27, 38], spawns: [{ position: [36, 5, 0] }, { position: [24, 6, 0] }] },
  { triggerX: 42, lock: [41, 54], spawns: [{ position: [48, 3, 0] }, { position: [52, 3, 0] }, { position: [50, 4, 0], power: 'gigante' }] },
];

export function Level1({ team, gameState, setGameState, setDialogText }: Level1Props) {
  const [guardDefeated, setGuardDefeated] = useState(false);
  const { leader, partner, captives } = TEAMS[team];
  const frozen = gameState === 'dialog' || gameState === 'gameOver' || gameState === 'victory';

  const lives = useGameStore((s) => s.lives);
  useEffect(() => {
    if (lives <= 0) setGameState('gameOver');
  }, [lives, setGameState]);

  const handleFall = useCallback(() => useGameStore.getState().loseLife(), []);

  return (
    <group>
      {/* Nuvens descendo para a Terra */}
      <CloudPlatform position={[-12, 14, 0]} scale={[4, 0.5, 3]} animated targetY={10} delay={0.3} speed={1.3} float floatSpeed={0.5} floatRange={0.3} />
      <CloudPlatform position={[-6, 12, 0]} scale={[4, 0.5, 3]} animated targetY={8} delay={0.6} speed={1.3} float floatSpeed={0.6} floatRange={0.25} />
      <CloudPlatform position={[0, 10, 0]} scale={[4, 0.5, 3]} animated targetY={6} delay={0.9} speed={1.3} float floatSpeed={0.7} floatRange={0.3} />
      <CloudPlatform position={[6, 8, 0]} scale={[4, 0.5, 3]} animated targetY={4} delay={1.2} speed={1.3} float floatSpeed={0.55} floatRange={0.25} />
      <CloudPlatform position={[12, 6, 0]} scale={[4, 0.5, 3]} animated targetY={2} delay={1.5} speed={1.3} float floatSpeed={0.65} floatRange={0.3} />

      <TextBoxTrigger
        position={[-12, 12, 0]}
        text={[
          `${leader.name} (${leader.age}) e ${partner.name} (${partner.age}): Precisamos resgatar ${captives[0].name} e ${captives[1].name}!`,
          `Bowser Jr. prendeu ${captives[0].name} (${captives[0].age}) e ${captives[1].name} (${captives[1].age}) numa gaiola!`,
          'Use as setas (ou A/D) para andar, Espaço para pular e F para atacar.',
          'Segure ↓ por 2 segundos e solte para dar um Super Pulo!',
        ]}
        setGameState={setGameState}
        setDialogText={setDialogText}
      />

      <Coin position={[-6, 9.5, 0]} />
      <Coin position={[0, 7.5, 0]} />
      <Coin position={[6, 5.5, 0]} />
      <Coin position={[12, 3.5, 0]} />
      <PowerUpBox position={[3, 8.5, 0]} type="super-jump" />

      <CloudPlatform position={[18, 3, 0]} scale={[3.5, 0.5, 3]} float floatSpeed={0.6} floatRange={0.3} />
      <CloudPlatform position={[24, 3.5, 0]} scale={[3.5, 0.5, 3]} float floatSpeed={0.7} floatRange={0.25} />
      <CloudPlatform position={[30, 2.5, 0]} scale={[3.5, 0.5, 3]} float floatSpeed={0.5} floatRange={0.3} />
      <CloudPlatform position={[36, 1.5, 0]} scale={[3.5, 0.5, 3]} float floatSpeed={0.65} floatRange={0.28} />

      <Coin position={[18, 4.5, 0]} />
      <Coin position={[24, 5, 0]} />
      <Coin position={[30, 4, 0]} />
      <PowerUpBox position={[21, 6, 0]} type="super-speed" />
      <PowerUpBox position={[27, 6, 0]} type="float" />
      <PowerUpBox position={[33, 5, 0]} type="fire-ball" />

      <TextBoxTrigger
        position={[36, 3, 0]}
        text={[
          'Cuidado! Estamos chegando em Terra firme...',
          'Bowser Jr. deixou o capanga Gigante guardando a gaiola!',
          'Preparem-se! Pegue o Laser para atacar de longe.',
        ]}
        setGameState={setGameState}
        setDialogText={setDialogText}
      />

      <GrassPlatform position={[50, 0, 0]} scale={[18, 1, 6]} />
      <PowerUpBox position={[42.5, 2, 0]} type="laser" />

      <WaveManager waves={WAVES} setGameState={setGameState} onAllCleared={() => setGuardDefeated(true)} />

      <Captive characters={captives} position={[56, 0.5, 0]} canRescue={guardDefeated} onRescued={() => setGameState('victory')} />

      <Player character={leader} position={SPAWN} frozen={frozen} onFall={handleFall} />
      <Companion character={partner} position={[-13.5, 16, 0]} frozen={frozen} />
      <Projectiles />
    </group>
  );
}
