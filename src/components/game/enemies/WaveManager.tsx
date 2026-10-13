'use client';

import { useCallback, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';
import { playerRuntime } from '@/lib/gameRuntime';
import { EnemySpawn, Wave, randomEnemy } from '@/lib/enemies';
import { GameState } from '../GameCanvas';
import { Enemy } from './Enemy';

interface WaveManagerProps {
  waves: Wave[];
  setGameState: (state: GameState) => void;
  onAllCleared: () => void;
}

// Inimigos surgem conforme o jogador avança; a tela trava até a onda ser vencida (estilo Metal Slug)
export function WaveManager({ waves, setGameState, onAllCleared }: WaveManagerProps) {
  const [current, setCurrent] = useState(0);
  const [alive, setAlive] = useState<EnemySpawn[]>([]);
  const active = useRef(false);
  // Só considera a onda vencida depois que os inimigos realmente apareceram
  const populated = useRef(false);

  useFrame(() => {
    if (active.current || current >= waves.length) return;
    const wave = waves[current];
    if (playerRuntime.position.x < wave.triggerX) return;
    active.current = true;
    setAlive(wave.spawns.map((sp, i) => randomEnemy(`w${current}-${i}`, sp.position, sp.power)));
    useGameStore.getState().setScreenLock(wave.lock);
    setGameState('duel');
  });

  const handleDefeated = useCallback((id: string) => {
    setAlive((list) => list.filter((e) => e.id !== id));
  }, []);

  // Onda vencida: destrava a tela e prepara a próxima
  useFrame(() => {
    if (alive.length > 0) populated.current = true;
    if (!active.current || !populated.current || alive.length > 0) return;
    active.current = false;
    populated.current = false;
    useGameStore.getState().setScreenLock(null);
    setGameState('playing');
    if (current + 1 >= waves.length) onAllCleared();
    setCurrent(current + 1);
  });

  return (
    <>
      {alive.map((spawn) => (
        <Enemy key={spawn.id} spawn={spawn} onDefeated={handleDefeated} />
      ))}
    </>
  );
}
