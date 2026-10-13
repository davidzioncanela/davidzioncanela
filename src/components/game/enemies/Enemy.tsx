'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, RapierRigidBody, useRapier } from '@react-three/rapier';
import { useGameStore } from '@/store/gameStore';
import { enemyRegistry, playerRuntime } from '@/lib/gameRuntime';
import { EnemySpawn } from '@/lib/enemies';
import { capsuleFor } from '@/lib/characters';
import { CharacterModel } from '../characters/CharacterModel';

interface EnemyProps {
  spawn: EnemySpawn;
  onDefeated: (id: string) => void;
}

const MELEE_RANGE = 1.2;
const RANGED_MIN = 3;
const RANGED_MAX = 9;

// Inimigo com nome e poder próprios. Aparece durante uma onda e luta até ser derrotado.
export function Enemy({ spawn, onDefeated }: EnemyProps) {
  const { id, name, power } = spawn;
  const bodyRef = useRef<RapierRigidBody>(null);
  const { world, rapier } = useRapier();
  const [animation, setAnimation] = useState('Idle');
  const [facing, setFacing] = useState<1 | -1>(-1);
  const [dead, setDead] = useState(false);
  const capsule = capsuleFor(power.height);
  const state = useRef({ health: power.health, attackTimer: 2 + Math.random(), hurtTimer: 0, actionAnim: 0 });

  useEffect(() => {
    const s = state.current;
    const hud = { id, name, power: power.label, color: power.color, maxHealth: power.health };
    useGameStore.getState().upsertEnemy({ ...hud, health: s.health });
    enemyRegistry.set(id, {
      getPosition: () => bodyRef.current?.translation() ?? { x: spawn.position[0], y: spawn.position[1], z: 0 },
      alive: () => s.health > 0,
      hit: (damage, fromX) => {
        if (s.health <= 0) return;
        s.health = Math.max(0, s.health - damage);
        s.hurtTimer = 0.3;
        const body = bodyRef.current;
        if (body) {
          const dir = Math.sign(body.translation().x - fromX) || 1;
          body.setLinvel({ x: dir * 3, y: 3, z: 0 }, true);
        }
        useGameStore.getState().upsertEnemy({ ...hud, health: s.health });
      },
    });
    return () => {
      enemyRegistry.delete(id);
      useGameStore.getState().removeEnemy(id);
    };
  }, [id, name, power, spawn.position]);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    const s = state.current;
    if (!body || dead) return;
    const pos = body.translation();
    const vel = body.linvel();

    if (s.health <= 0 || pos.y < -12) {
      s.health = 0;
      setDead(true);
      setAnimation('Death_A');
      const store = useGameStore.getState();
      store.addScore(power.id === 'gigante' ? 500 : 200);
      store.removeEnemy(id);
      setTimeout(() => onDefeated(id), 1200);
      return;
    }

    const player = playerRuntime.position;
    const dx = player.x - pos.x;
    const dist = Math.hypot(dx, player.y - pos.y);
    const dir = (Math.sign(dx) || 1) as 1 | -1;
    if (dir !== facing) setFacing(dir);

    const ray = new rapier.Ray({ x: pos.x, y: pos.y + 0.1, z: 0 }, { x: 0, y: -1, z: 0 });
    const grounded = !!world.castRay(ray, 0.2, true, undefined, undefined, undefined, body);
    // Não anda para fora da plataforma
    const ahead = new rapier.Ray({ x: pos.x + dir * 0.7, y: pos.y + 0.1, z: 0 }, { x: 0, y: -1, z: 0 });
    const groundAhead = !!world.castRay(ahead, 1.5, true, undefined, undefined, undefined, body);

    s.attackTimer -= delta;
    s.hurtTimer -= delta;
    s.actionAnim -= delta;
    let vx = 0;
    let vy = vel.y;

    if (s.hurtTimer > 0) {
      vx = vel.x;
    } else if (power.ranged) {
      // Atirador: mantém distância e dispara
      if (Math.abs(dx) < RANGED_MIN && groundAhead) vx = -dir * power.speed;
      else if (Math.abs(dx) > RANGED_MAX - 2 && groundAhead) vx = dir * power.speed;
      if (dist < RANGED_MAX && s.attackTimer <= 0) {
        s.attackTimer = power.attackCooldown;
        s.actionAnim = 0.5;
        useGameStore.getState().spawnProjectile({ kind: power.ranged, x: pos.x + dir * 0.6, y: pos.y + power.height * 0.6, dir, owner: 'enemy' });
      }
    } else {
      // Corpo a corpo: persegue e golpeia
      if (Math.abs(dx) > MELEE_RANGE * 0.8 && groundAhead) vx = dir * power.speed;
      if (power.jumps && grounded && s.attackTimer <= 0 && dist < 6) {
        vy = 9;
        vx = dir * power.speed * 1.5;
        s.attackTimer = power.attackCooldown;
      }
      if (dist < MELEE_RANGE + (power.height - 1.2) * 0.5 && s.attackTimer <= 0) {
        s.attackTimer = power.attackCooldown;
        s.actionAnim = 0.5;
        if (useGameStore.getState().hurtPlayer()) playerRuntime.pendingKnockback = { x: dir * 7, y: 6, z: 0 };
      }
    }
    if (power.jumps && !grounded) vx = vel.x;
    body.setLinvel({ x: vx, y: vy, z: 0 }, true);

    let next = 'Idle';
    if (s.hurtTimer > 0) next = 'Hit_A';
    else if (s.actionAnim > 0) next = power.ranged ? 'Spellcast_Shoot' : '1H_Melee_Attack_Stab';
    else if (!grounded) next = 'Jump_Idle';
    else if (Math.abs(vx) > 0.3) next = power.speed > 3 ? 'Running_A' : 'Walking_A';
    if (next !== animation) setAnimation(next);
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={spawn.position}
      colliders={false}
      mass={1}
      lockRotations
      enabledTranslations={[true, true, false]}
      friction={0}
    >
      {!dead && <CapsuleCollider args={[capsule.halfHeight, capsule.radius]} position={[0, capsule.centerY, 0]} />}
      {dead && <CapsuleCollider args={[0.05, 0.2]} position={[0, 0.2, 0]} />}
      <CharacterModel model="rogueHooded" animation={animation} accessories={ROGUE_GEAR} facing={facing} height={power.height} />
      {/* Aura com a cor do poder */}
      {!dead && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.5, 24]} />
          <meshBasicMaterial color={power.color} transparent opacity={0.8} />
        </mesh>
      )}
    </RigidBody>
  );
}

const ROGUE_GEAR = ['Knife', 'Rogue_Cape'];
