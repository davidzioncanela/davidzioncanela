'use client';

import { useRef, useState } from 'react';
import { David } from '../characters/David';
import { Yohann } from '../characters/Yohann';
import { NPC } from '../enemies/NPC';
import { CloudPlatform } from '../platforms/CloudPlatform';
import { GrassPlatform } from '../platforms/GrassPlatform';
import { PowerUpBox } from '../powerups/PowerUpBox';
import { TextBoxTrigger } from '../dialogs/TextBoxTrigger';
import { GameState } from '../GameCanvas';

interface Level1Props {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setDialogText: (text: string[]) => void;
  onPlayerPositionChange?: (pos: [number, number, number], vel: [number, number, number]) => void;
}

export function Level1({ gameState, setGameState, setDialogText, onPlayerPositionChange }: Level1Props) {
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);

  return (
    <group>
      {/* Fase 1: Nas Nuvens - Início */}
      <CloudPlatform position={[-10, 12, 0]} scale={[3, 0.5, 3]} animated targetY={8} delay={0.5} speed={1.2} />
      <CloudPlatform position={[-5, 10, 0]} scale={[3, 0.5, 3]} animated targetY={6} delay={0.8} speed={1.2} />
      <CloudPlatform position={[0, 8, 0]} scale={[3, 0.5, 3]} animated targetY={4} delay={1.1} speed={1.2} />
      <CloudPlatform position={[5, 6, 0]} scale={[3, 0.5, 3]} animated targetY={2} delay={1.4} speed={1.2} />
      
      <TextBoxTrigger
        position={[0, 5, 0]}
        text={[
          'Dávid e Yohann: Precisamos resgatar a Laura!',
          'Ela foi raptada pelo terrível Bowser Jr.!',
          'Vamos descer das nuvens e iniciar nossa missão na pracinha!',
        ]}
        setGameState={setGameState}
        setDialogText={setDialogText}
      />

      {/* Descendo para Terra */}
      <CloudPlatform position={[10, 4, 0]} scale={[3, 0.5, 3]} animated targetY={0} delay={1.8} speed={1.2} />
      
      {/* Terra - Pracinha */}
      <GrassPlatform position={[0, -1, 0]} scale={[20, 1, 5]} />
      <GrassPlatform position={[25, 1, 0]} scale={[8, 0.5, 3]} />
      <GrassPlatform position={[40, 2, 0]} scale={[6, 0.5, 3]} />
      
      {/* Diálogos de progressão */}
      <TextBoxTrigger
        position={[15, 1, 0]}
        text={[
          'Cuidado! Estamos chegando na área perigosa...',
          'Bowser Jr. deixou alguns guardas para proteger o caminho!',
        ]}
        setGameState={setGameState}
        setDialogText={setDialogText}
      />
      
      {/* Power-ups */}
      <PowerUpBox position={[25, 2, 0]} type="super-speed" />
      <PowerUpBox position={[40, 3, 0]} type="laser" />
      
      {/* NPC inimigo com duelo - Metal Slug style */}
      <NPC
        position={[30, 0.5, 0]}
        name="Goomba Malandro"
        health={100}
        maxHealth={100}
        gameState={gameState}
        setGameState={setGameState}
      />

      {/* Personagens principais */}
      <David position={[-5, 10, 0]} onPowerUpChange={setActivePowerUp} onPositionChange={onPlayerPositionChange} />
      <Yohann position={[-3, 10, 0]} onPositionChange={onPlayerPositionChange} />
    </group>
  );
}
