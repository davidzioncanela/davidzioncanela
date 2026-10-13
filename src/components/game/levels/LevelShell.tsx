'use client';

import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Enemy } from '../enemies/Enemy';
import { Player } from '../characters/Player';
import { Companion } from '../characters/Companion';
import { Captive } from '../characters/Captive';
import { WaveManager } from '../enemies/WaveManager';
import { GrassPlatform } from '../platforms/GrassPlatform';
import { Projectiles } from '../powerups/Projectiles';
import { TextBoxTrigger } from '../dialogs/TextBoxTrigger';
import { GameState } from '../GameCanvas';
import { useGameStore } from '@/store/gameStore';
import { CHARACTERS, PlayerSlot, teamSetup } from '@/lib/characters';
import { EnemySpawn, Wave, makeEnemy } from '@/lib/enemies';
import { isGuest, netSession, sendEvent } from '@/lib/net';
import { NetSync } from '../net/NetSync';
import { RemotePlayer } from '../net/RemotePlayer';

export interface LevelProps {
  slots: PlayerSlot[];
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setDialogText: (text: string[]) => void;
  // Semente para partes aleatórias (igual para todos na sessão online)
  seed: number;
}

interface LevelShellProps extends LevelProps {
  spawn: [number, number];
  waves: Wave[];
  cage: [number, number];
  intro: string[];
  // Monstrinhos que patrulham pelo caminho (fora das hordas)
  monsters?: [number, number][];
  children: ReactNode;
}

// Tudo que toda fase tem: jogadores, companheiro, hordas, gaiola do resgate, projéteis e rede
export function LevelShell({ slots, gameState, setGameState, setDialogText, spawn, waves, cage, intro, monsters = [], children }: LevelShellProps) {
  const [cageOpen, setCageOpen] = useState(false);
  const { companion, captives } = teamSetup(slots);
  const frozen = gameState === 'dialog' || gameState === 'gameOver' || gameState === 'victory';
  const [sx, sy] = spawn;
  // Memoizado: um array novo a cada render reiniciaria a posição registrada dos jogadores
  const spawns = useMemo<[number, number, number][]>(() => [0, -1, 1, -1.5].map((dx, i) => [sx + dx, sy + (i === 3 ? 1 : 0), 0]), [sx, sy]);

  const lives = useGameStore((s) => s.lives);
  useEffect(() => {
    if (lives <= 0) setGameState('gameOver');
  }, [lives, setGameState]);

  const controls =
    slots.filter((s) => !s.remote).length > 1
      ? 'Jogador 1: W A S D, F ataca, G poder de ajuda. Jogador 2: setas, K ataca, L poder de ajuda.'
      : 'Setas ou A/D andam, Espaço pula, F ataca e G usa o poder de ajuda.';

  return (
    <group>
      {children}
      <TextBoxTrigger position={[spawn[0] + 2, spawn[1], 0]} text={[...intro, controls]} setGameState={setGameState} setDialogText={setDialogText} />

      {/* No modo online só o host simula as hordas; os convidados veem os bonecos sincronizados */}
      {!isGuest() && <FieldMonsters positions={monsters} />}
      {!isGuest() && <WaveManager waves={waves} setGameState={setGameState} onAllCleared={() => setCageOpen(true)} />}

      <Captive
        characters={captives}
        position={[cage[0], cage[1], 0]}
        canRescue={cageOpen}
        onRescued={() => {
          sendEvent({ type: 'rescued' });
          setGameState('victory');
        }}
      />

      {slots.map((slot, i) =>
        slot.remote ? (
          <RemotePlayer key={slot.character} character={CHARACTERS[slot.character]} position={spawns[i]} />
        ) : (
          <Player key={slot.character} character={CHARACTERS[slot.character]} input={slot.input} position={spawns[i]} frozen={frozen} />
        )
      )}
      {companion && <Companion character={companion} leader={slots[0].character} position={spawns[1]} frozen={frozen} />}
      <Projectiles />
      {netSession.active && <NetSync gameState={gameState} setGameState={setGameState} cageOpen={cageOpen} setCageOpen={setCageOpen} />}
    </group>
  );
}

// Bloco de terra/grama do chão: vai de x1 a x2 com o topo na altura indicada
// bottom: base do bloco (padrão: chão fundo); use uma laje fina por cima de áreas subterrâneas
export function Ground({ x1, x2, top = 0.5, bottom = -6 }: { x1: number; x2: number; top?: number; bottom?: number }) {
  const h = top - bottom;
  return <GrassPlatform position={[(x1 + x2) / 2, bottom + h / 2, 0]} scale={[x2 - x1, h, 6]} />;
}

// Monstrinhos pequenos espalhados pela fase; cada um tem cor e nome sorteados
function FieldMonsters({ positions }: { positions: [number, number][] }) {
  const [alive, setAlive] = useState<EnemySpawn[]>(() =>
    positions.map(([x, y], i) => makeEnemy(`campo-${i}`, [x, y + 0.5, 0], 'left', 'monstrinho', { health: 1, attackSpeed: 1 }))
  );
  const onDefeated = useCallback((id: string) => setAlive((list) => list.filter((e) => e.id !== id)), []);
  return (
    <>
      {alive.map((spawn) => (
        <Enemy key={spawn.id} spawn={spawn} onDefeated={onDefeated} />
      ))}
    </>
  );
}
