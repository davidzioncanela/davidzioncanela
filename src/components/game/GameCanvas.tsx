'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useState } from 'react';
import { Physics } from '@react-three/rapier';
import { GameHUD } from './ui/GameHUD';
import { DialogBox } from './ui/DialogBox';
import { CameraController } from './CameraController';
import { Level1 } from './levels/Level1';
import { GameOverScreen } from './ui/GameOverScreen';
import { VictoryScreen } from './ui/VictoryScreen';
import { TeamSelect } from './ui/TeamSelect';
import { InputProvider } from '@/contexts/InputContext';
import { DeviceDetector } from './ui/DeviceDetector';
import { DuelHUD } from './ui/DuelHUD';
import { PowerUpHUD } from './ui/PowerUpHUD';
import { SkySystem } from './sky/SkySystem';
import { TeamId } from '@/lib/characters';
import { useGameStore } from '@/store/gameStore';
import { playerRuntime } from '@/lib/gameRuntime';

export type GameState = 'playing' | 'paused' | 'dialog' | 'duel' | 'gameOver' | 'victory';

export default function GameCanvas() {
  const [team, setTeam] = useState<TeamId | null>(null);
  // Muda a cada partida para remontar a fase do zero
  const [runId, setRunId] = useState(0);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [dialogText, setDialogText] = useState<string[]>([]);

  const startGame = useCallback((next: TeamId) => {
    useGameStore.getState().reset();
    playerRuntime.position = { x: -12, y: 16, z: 0 };
    playerRuntime.velocity = { x: 0, y: 0, z: 0 };
    setGameState('playing');
    setTeam(next);
    setRunId((id) => id + 1);
  }, []);

  return (
    <InputProvider>
      <div className="relative h-screen w-screen">
        <Canvas shadows camera={{ position: [-12, 14, 12], fov: 60 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <hemisphereLight args={['#E0F2FE', '#4ADE80', 0.4]} />
            <SkySystem />
            {team && (
              <Physics key={runId} gravity={[0, -25, 0]}>
                <Level1 team={team} gameState={gameState} setGameState={setGameState} setDialogText={setDialogText} />
              </Physics>
            )}
            <CameraController gameState={gameState} />
          </Suspense>
        </Canvas>
        {!team && <TeamSelect onSelect={startGame} />}
        {team && (
          <>
            <GameHUD team={team} onSwitchTeam={() => startGame(team === 'brothers' ? 'sisters' : 'brothers')} />
            <DuelHUD />
            <PowerUpHUD />
          </>
        )}
        {gameState === 'dialog' && <DialogBox text={dialogText} onClose={() => setGameState('playing')} />}
        {team && gameState === 'gameOver' && <GameOverScreen onRestart={() => startGame(team)} onSelectTeam={() => setTeam(null)} />}
        {team && gameState === 'victory' && <VictoryScreen team={team} onRestart={() => startGame(team)} onSelectTeam={() => setTeam(null)} />}
        <DeviceDetector />
      </div>
    </InputProvider>
  );
}
