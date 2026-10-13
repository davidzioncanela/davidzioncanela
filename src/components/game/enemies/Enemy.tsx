'use client';

import { useEffect, useRef, useState } from 'react';
import { Group } from 'three';
import { Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, RapierRigidBody, useRapier } from '@react-three/rapier';
import { useGameStore } from '@/store/gameStore';
import { enemyRegistry, nearestPlayer } from '@/lib/gameRuntime';
import { EnemySpawn } from '@/lib/enemies';
import { capsuleFor } from '@/lib/characters';
import { CharacterModel } from '../characters/CharacterModel';
import { sendEvent } from '@/lib/net';

interface EnemyProps {
  spawn: EnemySpawn;
  onDefeated: (id: string) => void;
}

const MELEE_RANGE = 1.2;
const RANGED_MIN = 3;
const RANGED_MAX = 9;

// Inimigo com nome e poder próprios. Aparece durante uma onda e luta até ser derrotado.
export function Enemy({ spawn, onDefeated }: EnemyProps) {
  const { id, name, power, entry } = spawn;
  const maxHealth = Math.round(power.health * spawn.healthScale);
  const cooldown = power.attackCooldown / spawn.attackSpeed;
  // Quem sai do chão emerge devagar; os outros já chegam lutando
  const modelRef = useRef<Group>(null);
  const bodyRef = useRef<RapierRigidBody>(null);
  const { world, rapier } = useRapier();
  const [animation, setAnimation] = useState('Idle');
  const [facing, setFacing] = useState<1 | -1>(-1);
  const [dead, setDead] = useState(false);
  const capsule = capsuleFor(power.height);
  const state = useRef({ patrol: -1 as 1 | -1, anim: 'Idle', facing: -1 as 1 | -1, dead: false, health: maxHealth, attackTimer: 2 + Math.random(), hurtTimer: 0, actionAnim: 0, emerge: entry === 'ground' ? 1 : 0 });

  useEffect(() => {
    const s = state.current;
    const hud = { id, name, power: power.label, color: power.color, maxHealth };
    if (!spawn.field) useGameStore.getState().upsertEnemy({ ...hud, health: s.health });
    enemyRegistry.set(id, {
      getPosition: () => bodyRef.current?.translation() ?? { x: spawn.position[0], y: spawn.position[1], z: 0 },
      alive: () => s.health > 0,
      snapshot: () => {
        const p = bodyRef.current?.translation() ?? { x: spawn.position[0], y: spawn.position[1] };
        return { id, name, power: power.label, color: power.color, height: power.height, model: power.model, tint: spawn.tint, field: !!spawn.field, x: p.x, y: p.y, facing: s.facing, anim: s.anim, health: s.health, maxHealth, emerge: s.emerge, dead: s.dead };
      },
      hit: (damage, fromX) => {
        if (s.health <= 0) return;
        s.health = Math.max(0, s.health - damage);
        s.hurtTimer = 0.3;
        const body = bodyRef.current;
        if (body) {
          const dir = Math.sign(body.translation().x - fromX) || 1;
          body.setLinvel({ x: dir * 3, y: 3, z: 0 }, true);
        }
        if (!spawn.field) useGameStore.getState().upsertEnemy({ ...hud, health: s.health });
      },
    });
    return () => {
      enemyRegistry.delete(id);
      useGameStore.getState().removeEnemy(id);
    };
  }, [id, name, power, maxHealth, spawn.position, spawn.field]);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    const s = state.current;
    if (!body || dead) return;
    const pos = body.translation();
    const vel = body.linvel();

    if (s.health <= 0 || pos.y < -12) {
      // Cair da fase não dá pontos; só derrotar
      const defeated = s.health <= 0;
      s.health = 0;
      s.dead = true;
      s.anim = 'Death_A';
      setDead(true);
      setAnimation('Death_A');
      const store = useGameStore.getState();
      if (defeated) store.addScore(power.id === 'gigante' ? 500 : power.id === 'monstrinho' ? 100 : 200);
      store.removeEnemy(id);
      setTimeout(() => onDefeated(id), 1200);
      return;
    }

    // Saindo do chão: sobe aos poucos e ainda não ataca
    if (s.emerge > 0) {
      s.emerge = Math.max(0, s.emerge - delta * 1.2);
      if (modelRef.current) modelRef.current.position.y = -power.height * s.emerge;
      body.setLinvel({ x: 0, y: vel.y, z: 0 }, true);
      return;
    }

    const target = nearestPlayer(pos.x, pos.y);
    if (!target) return;
    const player = target.position;
    const dx = player.x - pos.x;
    const dist = Math.hypot(dx, player.y - pos.y);

    // Pisão na cabeça (estilo Mario): quem cai em cima derrota o monstrinho e quica
    if (target.local && target.velocity.y < -2 && Math.abs(dx) < 0.7 && player.y > pos.y + power.height * 0.6 && player.y < pos.y + power.height + 0.6) {
      enemyRegistry.get(id)?.hit(spawn.field ? 999 : 15, player.x);
      target.pendingImpulse = { x: 0, y: 11, z: 0 };
    }

    // Monstrinho de patrulha: anda de um lado para o outro até alguém chegar perto
    const chasing = !spawn.field || dist < 6;
    if (!chasing) {
      const out = Math.abs(pos.x - spawn.position[0]) > 3;
      if (out) s.patrol = pos.x > spawn.position[0] ? -1 : 1;
    }
    const dir = (chasing ? Math.sign(dx) || 1 : s.patrol) as 1 | -1;
    s.facing = dir;
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
        s.attackTimer = cooldown;
        s.actionAnim = 0.5;
        const shot = { kind: power.ranged, x: pos.x + dir * 0.6, y: pos.y + power.height * 0.6, dir, owner: 'enemy' } as const;
        useGameStore.getState().spawnProjectile(shot);
        sendEvent({ type: 'projectile', ...shot });
      }
    } else {
      // Corpo a corpo: persegue e golpeia (ou patrulha devagar)
      if (!chasing) {
        if (groundAhead) vx = dir * power.speed * 0.5;
        else s.patrol = -s.patrol as 1 | -1;
      } else if (Math.abs(dx) > MELEE_RANGE * 0.8 && groundAhead) vx = dir * power.speed;
      if (power.jumps && grounded && s.attackTimer <= 0 && dist < 6) {
        vy = 9;
        vx = dir * power.speed * 1.5;
        s.attackTimer = cooldown;
      }
      if (dist < MELEE_RANGE + (power.height - 1.2) * 0.5 && s.attackTimer <= 0) {
        s.attackTimer = cooldown;
        s.actionAnim = 0.5;
        // Jogador de outro aparelho: avisa para ele aplicar o golpe em si mesmo
        if (!target.local) sendEvent({ type: 'hurt', target: target.id, kx: dir * 7, ky: 6 });
        else if (useGameStore.getState().hurtPlayer(target.id)) target.pendingImpulse = { x: dir * 7, y: 6, z: 0 };
      }
    }
    if (power.jumps && !grounded) vx = vel.x;
    body.setLinvel({ x: vx, y: vy, z: 0 }, true);

    let next = 'Idle';
    if (s.hurtTimer > 0) next = 'Hit_A';
    else if (s.actionAnim > 0) next = power.ranged ? 'Spellcast_Shoot' : '1H_Melee_Attack_Stab';
    else if (!grounded) next = 'Jump_Idle';
    else if (Math.abs(vx) > 0.3) next = power.speed > 3 ? 'Running_A' : 'Walking_A';
    s.anim = next;
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
      <group ref={modelRef} position={[0, entry === 'ground' ? -power.height : 0, 0]}>
        <CharacterModel model={power.model} animation={animation} facing={facing} height={power.height} showAll tint={spawn.tint} glow={power.color} />
      </group>
      {/* Efeito de entrada: poeira saindo do chão ou rastro caindo do céu */}
      {entry === 'ground' && !dead && <Sparkles count={30} scale={[1.5, 0.6, 1.5]} position={[0, 0.2, 0]} size={8} speed={2} color="#A16207" />}
      {entry === 'sky' && !dead && <Sparkles count={20} scale={[0.6, 2.5, 0.6]} position={[0, 1.5, 0]} size={6} speed={3} color={power.color} />}
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

