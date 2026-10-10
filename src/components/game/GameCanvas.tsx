'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { GameHUD } from './ui/GameHUD';
import { DialogBox } from './ui/DialogBox';
import { CameraController } from './CameraController';
import { Level1 } from './levels/Level1';
import { GameOverScreen } from './ui/GameOverScreen';
import { VictoryScreen } from './ui/VictoryScreen';

export type GameState = 'playing' | 'paused' | 'dialog' | 'duel' | 'gameOver' | 'victory';

export default function GameCanvas() {
  const [gameState, setGameState] = useState<GameState>('playing');
  const [dialogText, setDialogText] = useState<string[]>([]);

  return (
    <div className="relative h-screen w-screen">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={75} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <Physics gravity={[0, -9.81, 0]}>
            <Level1
              gameState={gameState}
              setGameState={setGameState}
              setDialogText={setDialogText}
            />
          </Physics>
          <CameraController gameState={gameState} />
          <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
        </Suspense>
      </Canvas>
      <GameHUD />
      {gameState === 'dialog' && (
        <DialogBox
          text={dialogText}
          onClose={() => setGameState('playing')}
        />
      )}
      {gameState === 'gameOver' && <GameOverScreen />}
      {gameState === 'victory' && <VictoryScreen />}
    </div>
  );
}
