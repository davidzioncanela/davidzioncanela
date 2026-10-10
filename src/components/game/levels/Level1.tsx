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
  playerPosition?: [number, number, number];
}

export function Level1({ gameState, setGameState, setDialogText, onPlayerPositionChange, playerPosition = [0,0,0] }: Level1Props) {
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);

  return (
    <group>
      <CloudPlatform position={[-12, 14, 0]} scale={[4, 0.5, 4]} animated targetY={10} delay={0.3} speed={1.3} float floatSpeed={0.5} floatRange={0.3} />
      <CloudPlatform position={[-6, 12, 0]} scale={[4, 0.5, 4]} animated targetY={8} delay={0.6} speed={1.3} float floatSpeed={0.6} floatRange={0.25} />
      <CloudPlatform position={[0, 10, 0]} scale={[4, 0.5, 4]} animated targetY={6} delay={0.9} speed={1.3} float floatSpeed={0.7} floatRange={0.3} />
      <CloudPlatform position={[6, 8, 0]} scale={[4, 0.5, 4]} animated targetY={4} delay={1.2} speed={1.3} float floatSpeed={0.55} floatRange={0.25} />
      <CloudPlatform position={[12, 6, 0]} scale={[4, 0.5, 4]} animated targetY={2} delay={1.5} speed={1.3} float floatSpeed={0.65} floatRange={0.3} />
      
      <TextBoxTrigger
        position={[0, 7, 0]}
        text={[
          'Dávid e Yohann: Precisamos resgatar a Laura!',
          'Ela foi raptada pelo terrível Bowser Jr.!',
          'Estamos nas nuvens, pulando entre ilhas flutuantes!',
          'Vamos avançar para resgatá-la!',
        ]}
        setGameState={setGameState}
        setDialogText={setDialogText}
      />

      <CloudPlatform position={[18, 4, 0]} scale={[3.5, 0.5, 3.5]} float floatSpeed={0.6} floatRange={0.3} />
      <CloudPlatform position={[24, 3, 0]} scale={[3.5, 0.5, 3.5]} float floatSpeed={0.7} floatRange={0.25} />
      <CloudPlatform position={[30, 2.5, 0]} scale={[3.5, 0.5, 3.5]} float floatSpeed={0.5} floatRange={0.3} />
      <CloudPlatform position={[36, 2, 0]} scale={[3.5, 0.5, 3.5]} float floatSpeed={0.65} floatRange={0.28} />
      
      <GrassPlatform position={[48, 0, 0]} scale={[12, 1, 6]} />
      
      <TextBoxTrigger
        position={[24, 4, 0]}
        text={[
          'Cuidado! Estamos nos aproximando...',
          'Bowser Jr. deixou seus capangas guardando o caminho!',
          'Preparem-se para um duelo!',
        ]}
        setGameState={setGameState}
        setDialogText={setDialogText}
      />
      
      <PowerUpBox position={[24, 4.5, 0]} type="super-speed" />
      <PowerUpBox position={[36, 3, 0]} type="laser" />
      
      <NPC
        position={[30, 4, 0]}
        name="Goomba Malandro"
        health={100}
        maxHealth={100}
        gameState={gameState}
        setGameState={setGameState}
        playerPosition={playerPosition}
      />

      <David position={[-12, 11, 0]} onPowerUpChange={setActivePowerUp} onPositionChange={onPlayerPositionChange} />
      <Yohann position={[-9, 11, 0]} onPositionChange={onPlayerPositionChange} />
    </group>
  );
}
