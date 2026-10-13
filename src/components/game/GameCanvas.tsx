'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { GameHUD } from './ui/GameHUD';
import { DialogBox } from './ui/DialogBox';
import { CameraController } from './CameraController';
import { SplitScreen } from './SplitScreen';
import { Level1, LEVEL1_BOUNDS } from './levels/Level1';
import { GameOverScreen } from './ui/GameOverScreen';
import { VictoryScreen } from './ui/VictoryScreen';
import { CharacterSelect } from './ui/CharacterSelect';
import { OnlineLobby } from './ui/OnlineLobby';
import { getSocket, netSession } from '@/lib/net';
import { InputProvider } from '@/contexts/InputContext';
import { DeviceDetector, useIsTouch } from './ui/DeviceDetector';
import { DuelHUD } from './ui/DuelHUD';
import { SkySystem } from './sky/SkySystem';
import { Scenery } from './sky/Scenery';
import { Town } from '../town/Town';
import { TownHUD } from '../town/TownHUD';
import { PlayerSlot } from '@/lib/characters';
import { useGameStore } from '@/store/gameStore';
import { players } from '@/lib/gameRuntime';

export type GameState = 'playing' | 'paused' | 'dialog' | 'duel' | 'gameOver' | 'victory';

export default function GameCanvas() {
  const isTouch = useIsTouch();
  const [slots, setSlots] = useState<PlayerSlot[] | null>(null);
  // Muda a cada partida para remontar a fase do zero
  const [runId, setRunId] = useState(0);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [dialogText, setDialogText] = useState<string[]>([]);
  const [splitCount, setSplitCount] = useState(0);
  const [lobby, setLobby] = useState<{ code?: string } | null>(null);
  // Menu principal é a cidade; "Aventura" abre a escolha do modo de jogo
  const [choosing, setChoosing] = useState(false);
  const [recenter, setRecenter] = useState(0);

  // Entrou pelo link compartilhado (?sala=CODE): abre direto a sala online
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('sala');
    if (code) setLobby({ code: code.toUpperCase() });
  }, []);

  const startGame = useCallback((next: PlayerSlot[]) => {
    players.clear();
    useGameStore.getState().reset(next.map((s) => s.character));
    setGameState('playing');
    setSlots(next);
    setRunId((id) => id + 1);
  }, []);

  // Voltou ao menu: limpa jogadores e sai da sala online
  useEffect(() => {
    if (slots) return;
    players.clear();
    if (netSession.active) {
      getSocket().emit('room:leave');
      netSession.active = false;
      netSession.isHost = false;
    }
  }, [slots]);

  return (
    <InputProvider>
      <div className="relative h-[100dvh] w-screen">
        <Canvas shadows camera={{ position: [-12, 14, 12], fov: 60 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            {slots ? (
              <>
                <ambientLight intensity={0.7} />
                <hemisphereLight args={['#E0F2FE', '#86EFAC', 0.6]} />
                <SkySystem />
                <Scenery />
                <Physics key={runId} gravity={[0, -25, 0]}>
                  <Level1 slots={slots} gameState={gameState} setGameState={setGameState} setDialogText={setDialogText} />
                </Physics>
                <CameraController gameState={gameState} bounds={LEVEL1_BOUNDS} />
                <SplitScreen bounds={LEVEL1_BOUNDS} onSplitChange={setSplitCount} />
              </>
            ) : (
              <Town recenter={recenter} />
            )}
            {splitCount === 0 && (
              <EffectComposer>
                <Bloom intensity={1.2} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur />
              </EffectComposer>
            )}
          </Suspense>
        </Canvas>
        {splitCount > 0 && (
          <div className="pointer-events-none absolute inset-0 z-30">
            <div className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgba(0,0,0,0.4)]" />
            {splitCount > 2 && <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 bg-white shadow-[0_0_12px_rgba(0,0,0,0.4)]" />}
          </div>
        )}
        {!slots && !lobby && !choosing && <TownHUD onAdventure={() => setChoosing(true)} onRecenter={() => setRecenter((n) => n + 1)} />}
        {!slots && !lobby && choosing && (
          <CharacterSelect
            isTouch={isTouch}
            onStart={(next) => {
              setChoosing(false);
              startGame(next);
            }}
            onOnline={() => (setChoosing(false), setLobby({}))}
            onBack={() => setChoosing(false)}
          />
        )}
        {!slots && lobby && (
          <OnlineLobby
            initialCode={lobby.code}
            onStart={(next) => {
              setLobby(null);
              startGame(next);
            }}
            onBack={() => {
              setLobby(null);
              window.history.replaceState(null, '', window.location.pathname);
            }}
          />
        )}
        {slots && (
          <>
            <GameHUD slots={slots} onSwitch={() => setSlots(null)} compact={isTouch} />
            <DuelHUD />
          </>
        )}
        {gameState === 'dialog' && <DialogBox text={dialogText} onClose={() => setGameState('playing')} />}
        {slots && gameState === 'gameOver' && <GameOverScreen onRestart={() => (netSession.active ? setSlots(null) : startGame(slots))} onSelectTeam={() => setSlots(null)} />}
        {slots && gameState === 'victory' && <VictoryScreen slots={slots} onRestart={() => (netSession.active ? setSlots(null) : startGame(slots))} onSelectTeam={() => setSlots(null)} />}
        {slots && slots.filter((s) => !s.remote).length === 1 && <DeviceDetector />}
      </div>
    </InputProvider>
  );
}
