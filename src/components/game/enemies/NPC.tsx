'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, RapierRigidBody } from '@react-three/rapier';
import { GameState } from '../GameCanvas';
import { generateRandomNPCName } from '@/lib/npcNames';
import { useGameStore } from '@/store/gameStore';
import { enemyRegistry, playerRuntime } from '@/lib/gameRuntime';
import { CharacterModel } from '../characters/CharacterModel';

interface NPCProps {
  position: [number, number, number];
  name?: string;
  health?: number;
  maxHealth?: number;
  setGameState: (state: GameState) => void;
  onDefeated?: () => void;
}

const DUEL_DISTANCE = 6;
const ATTACK_RANGE = 1.3;
const ATTACK_COOLDOWN = 1.4;
const PATROL_RANGE = 2;
const SPEED = 2.5;

export function NPC({ position, name, health = 100, maxHealth = health, setGameState, onDefeated }: NPCProps) {
  const id = useId();
  const bodyRef = useRef<RapierRigidBody>(null);
  const [npcName] = useState(() => name || generateRandomNPCName());
  const [animation, setAnimation] = useState('Idle');
  const [facing, setFacing] = useState<1 | -1>(-1);
  const [dead, setDead] = useState(false);
  const state = useRef({ health, inDuel: false, attackTimer: 1, hurtTimer: 0, patrolDir: -1 as 1 | -1, removed: false });

  useEffect(() => {
    const s = state.current;
    enemyRegistry.set(id, {
      getPosition: () => bodyRef.current?.translation() ?? { x: position[0], y: position[1], z: 0 },
      alive: () => s.health > 0,
      hit: (damage, fromX) => {
        if (s.health <= 0) return;
        s.health = Math.max(0, s.health - damage);
        s.hurtTimer = 0.35;
        const body = bodyRef.current;
        if (body) {
          const dir = Math.sign(body.translation().x - fromX) || 1;
          body.setLinvel({ x: dir * 4, y: 3, z: 0 }, true);
        }
        const store = useGameStore.getState();
        if (!s.inDuel) {
          s.inDuel = true;
          store.startDuel({ name: npcName, health: s.health, maxHealth });
          setGameState('duel');
        }
        store.updateDuelHealth(s.health);
      },
    });
    return () => {
      enemyRegistry.delete(id);
    };
  }, [id, npcName, maxHealth, position, setGameState]);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    const s = state.current;
    if (!body || s.removed) return;
    const pos = body.translation();
    const vel = body.linvel();
    const player = playerRuntime.position;
    const dx = player.x - pos.x;
    const dist = Math.hypot(dx, player.y - pos.y);

    if (s.health <= 0) {
      if (!dead) {
        setDead(true);
        setAnimation('Death_A');
        const store = useGameStore.getState();
        store.endDuel();
        store.addScore(500);
        setGameState('playing');
        onDefeated?.();
        setTimeout(() => {
          s.removed = true;
          setAnimation('Death_A_Pose');
        }, 1200);
      }
      body.setLinvel({ x: 0, y: vel.y, z: 0 }, true);
      return;
    }

    // Duelo começa por proximidade
    if (!s.inDuel && dist < DUEL_DISTANCE) {
      s.inDuel = true;
      useGameStore.getState().startDuel({ name: npcName, health: s.health, maxHealth });
      setGameState('duel');
    }

    s.attackTimer -= delta;
    s.hurtTimer -= delta;
    let vx = 0;
    let next = 'Idle';
    if (s.hurtTimer > 0) {
      next = 'Hit_A';
      vx = vel.x;
    } else if (s.inDuel) {
      const dir = (Math.sign(dx) || 1) as 1 | -1;
      if (dir !== facing) setFacing(dir);
      if (Math.abs(dx) > ATTACK_RANGE * 0.8) {
        vx = dir * SPEED;
        next = 'Walking_A';
      }
      if (dist < ATTACK_RANGE && s.attackTimer <= 0) {
        s.attackTimer = ATTACK_COOLDOWN;
        next = '1H_Melee_Attack_Stab';
        const store = useGameStore.getState();
        if (store.hurtPlayer()) {
          playerRuntime.pendingKnockback = { x: dir * 7, y: 6, z: 0 };
          if (store.lives <= 1) setGameState('gameOver');
        }
      } else if (s.attackTimer > ATTACK_COOLDOWN - 0.4) {
        next = '1H_Melee_Attack_Stab';
      }
    } else {
      // Patrulha simples
      if (pos.x > position[0] + PATROL_RANGE) s.patrolDir = -1;
      if (pos.x < position[0] - PATROL_RANGE) s.patrolDir = 1;
      vx = s.patrolDir * SPEED * 0.5;
      next = 'Walking_A';
      if (s.patrolDir !== facing) setFacing(s.patrolDir);
    }
    body.setLinvel({ x: vx, y: vel.y, z: 0 }, true);
    if (next !== animation) setAnimation(next);
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={position}
      colliders={false}
      mass={1}
      lockRotations
      enabledTranslations={[true, true, false]}
      friction={0}
    >
      {!dead && <CapsuleCollider args={[0.35, 0.35]} position={[0, 0.7, 0]} />}
      {dead && <CapsuleCollider args={[0.05, 0.2]} position={[0, 0.2, 0]} />}
      <CharacterModel model="rogueHooded" animation={animation} accessories={ROGUE_GEAR} facing={facing} height={1.4} />
    </RigidBody>
  );
}

const ROGUE_GEAR = ['Knife', 'Rogue_Cape'];
