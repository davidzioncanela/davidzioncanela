'use client';

import { useCallback, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { difficulty, useGameStore } from '@/store/gameStore';
import { playerSpan, players } from '@/lib/gameRuntime';
import { EnemySpawn, Wave, makeEnemy, randomPower } from '@/lib/enemies';
import { GameState } from '../GameCanvas';
import { Enemy } from './Enemy';

interface WaveManagerProps {
  waves: Wave[];
  setGameState: (state: GameState) => void;
  onAllCleared: () => void;
}

// Posição de nascimento de cada inimigo da leva conforme a entrada
function spawnPosition(wave: Wave, from: EnemySpawn['entry'], i: number, count: number): [number, number, number] {
  const { left, right, floorY } = wave.arena;
  const spread = (right - left - 2) / Math.max(1, count);
  switch (from) {
    case 'left':
      return [left + 0.5 + (i % 2) * 0.8, floorY + 0.5 + i * 0.3, 0];
    case 'right':
      return [right - 0.5 - (i % 2) * 0.8, floorY + 0.5 + i * 0.3, 0];
    case 'sky':
      return [left + 1 + spread * (i + 0.5), floorY + 10 + i * 1.5, 0];
    case 'ground':
      return [left + 1 + spread * (i + 0.5), floorY, 0];
  }
}

// Em pontos da fase a tela trava e chega uma horda em levas:
// pelos dois lados, caindo do céu e saindo do chão (estilo Metal Slug)
export function WaveManager({ waves, setGameState, onAllCleared }: WaveManagerProps) {
  const [current, setCurrent] = useState(0);
  const [alive, setAlive] = useState<EnemySpawn[]>([]);
  const wave = useRef({ active: false, elapsed: 0, nextGroup: 0, spawned: 0, defeated: 0 });

  const handleDefeated = useCallback((id: string) => {
    wave.current.defeated++;
    setAlive((list) => list.filter((e) => e.id !== id));
  }, []);

  useFrame((_, delta) => {
    const w = wave.current;
    if (current >= waves.length) return;
    const def = waves[current];
    const span = playerSpan(false);

    if (!w.active) {
      if (!span || span.maxX < def.triggerX) return;
      Object.assign(w, { active: true, elapsed: 0, nextGroup: 0, spawned: 0, defeated: 0 });
      useGameStore.getState().setScreenLock([def.arena.left, def.arena.right]);
      // Quem ficou para trás é puxado para dentro da arena
      let k = 0;
      players.forEach((p) => {
        if (p.local && (p.position.x < def.arena.left || p.position.x > def.arena.right)) {
          p.pendingTeleport = { x: def.arena.left + 1.5 + k++ * 0.8, y: def.arena.floorY + 2, z: 0 };
        }
      });
      setGameState('duel');
      return;
    }

    // Solta as levas no tempo certo, com inimigos extras conforme o número de jogadores
    w.elapsed += delta;
    const scale = difficulty(useGameStore.getState().playerCount);
    while (w.nextGroup < def.groups.length && def.groups[w.nextGroup].delay <= w.elapsed) {
      const g = def.groups[w.nextGroup];
      // Inimigos extras por jogador a mais, em levas alternadas (para não lotar a arena)
      const extra = g.power === 'gigante' || w.nextGroup % 2 === 1 ? 0 : scale.extraEnemies;
      const count = g.count + extra;
      const batch = Array.from({ length: count }, (_, i) =>
        makeEnemy(`w${current}-g${w.nextGroup}-${i}`, spawnPosition(def, g.from, i, count), g.from, g.power ?? randomPower(), scale)
      );
      w.spawned += batch.length;
      setAlive((list) => [...list, ...batch]);
      w.nextGroup++;
    }

    // Onda vencida quando todas as levas saíram e todos foram derrotados
    if (w.nextGroup >= def.groups.length && w.defeated >= w.spawned) {
      w.active = false;
      useGameStore.getState().setScreenLock(null);
      setGameState('playing');
      if (current + 1 >= waves.length) onAllCleared();
      setCurrent(current + 1);
    }
  });

  return (
    <>
      {alive.map((spawn) => (
        <Enemy key={spawn.id} spawn={spawn} onDefeated={handleDefeated} />
      ))}
    </>
  );
}
