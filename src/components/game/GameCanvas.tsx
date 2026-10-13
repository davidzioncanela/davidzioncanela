'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { GameHUD } from './ui/GameHUD';
import { DialogBox } from './ui/DialogBox';
import { CameraController } from './CameraController';
import { SplitScreen } from './SplitScreen';
import { LEVELS } from './levels/levels';
import { GameOverScreen } from './ui/GameOverScreen';
import { VictoryScreen } from './ui/VictoryScreen';
import { CharacterSelect } from './ui/CharacterSelect';
import { OnlineLobby } from './ui/OnlineLobby';
import { getSocket, netSession } from '@/lib/net';
import { usePartyStore } from '@/store/partyStore';
import { InputProvider } from '@/contexts/InputContext';
import { DeviceDetector, useIsTouch } from './ui/DeviceDetector';
import { DuelHUD } from './ui/DuelHUD';
import { PipeMinimap } from './ui/PipeMinimap';
import { FadeOverlay } from './ui/FadeOverlay';
import { UnlockToast } from './ui/UnlockToast';
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
  const [levelIndex, setLevelIndex] = useState(0);
  // Semente das partes aleatórias (canos); no online vem do host
  const [seed, setSeed] = useState(1);
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

  const startGame = useCallback((next: PlayerSlot[], level = 0, nextSeed = Math.floor(Math.random() * 1e6) + 1) => {
    players.clear();
    setLevelIndex(level);
    setSeed(nextSeed);
    netSession.level = level;
    netSession.seed = nextSeed;
    useGameStore.getState().reset(next.map((s) => s.character));
    setGameState('playing');
    setSlots(next);
    setRunId((id) => id + 1);
  }, []);

  // Voltou ao menu: limpa jogadores e sai da sala online
  useEffect(() => {
    if (slots) return;
    players.clear();
    // A party/sala acaba quando a aventura termina
    usePartyStore.getState().setRoom(null);
    if (netSession.active) {
      getSocket().emit('room:leave');
      netSession.active = false;
      netSession.isHost = false;
    }
  }, [slots]);

  const level = LEVELS[levelIndex];
  const Level = level.Component;
  const hasNext = levelIndex + 1 < LEVELS.length;
  // Online: só o host avança de fase; os convidados seguem quando a foto do mundo muda de fase
  const canAdvance = !netSession.active || netSession.isHost;

  useEffect(() => {
    if (!slots || !netSession.active || netSession.isHost) return;
    const socket = getSocket();
    const onWorld = (w: { level: number; seed: number }) => {
      if (w.level !== levelIndex || w.seed !== seed) startGame(slots, w.level, w.seed);
    };
    socket.on('game:world', onWorld);
    return () => {
      socket.off('game:world', onWorld);
    };
  }, [slots, levelIndex, seed, startGame]);

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
                  <Level slots={slots} gameState={gameState} setGameState={setGameState} setDialogText={setDialogText} seed={seed} />
                </Physics>
                <CameraController gameState={gameState} bounds={level.bounds} />
                <SplitScreen bounds={level.bounds} onSplitChange={setSplitCount} />
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
        {!slots && !lobby && !choosing && <TownHUD onAdventure={() => setChoosing(true)} onRecenter={() => setRecenter((n) => n + 1)} onPartyStart={startGame} />}
        {!slots && !lobby && choosing && (
          <CharacterSelect
            isTouch={isTouch}
            onStart={(next) => {
              setChoosing(false);
              // ?fase=N começa direto numa fase (útil para testar)
              const fase = Number(new URLSearchParams(window.location.search).get('fase'));
              startGame(next, fase >= 1 && fase <= LEVELS.length ? fase - 1 : 0);
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
            <GameHUD slots={slots} onSwitch={() => setSlots(null)} compact={isTouch} levelNumber={levelIndex + 1} levelName={level.name} />
            <DuelHUD />
            <PipeMinimap />
            <FadeOverlay />
            <UnlockToast />
          </>
        )}
        {gameState === 'dialog' && <DialogBox text={dialogText} onClose={() => setGameState('playing')} />}
        {slots && gameState === 'gameOver' && <GameOverScreen onRestart={canAdvance ? () => startGame(slots, levelIndex) : undefined} onSelectTeam={() => setSlots(null)} />}
        {slots && gameState === 'victory' && <VictoryScreen slots={slots} onNext={hasNext && canAdvance ? () => startGame(slots, levelIndex + 1) : undefined} waiting={hasNext && !canAdvance} onRestart={canAdvance ? () => startGame(slots, levelIndex) : undefined} onSelectTeam={() => setSlots(null)} />}
        {slots && slots.filter((s) => !s.remote).length === 1 && <DeviceDetector />}
      </div>
    </InputProvider>
  );
}
