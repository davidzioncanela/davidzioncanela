'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier, RapierRigidBody } from '@react-three/rapier';
import { useInput } from '@/contexts/InputContext';
import { useGameStore } from '@/store/gameStore';
import { playerRuntime, findEnemyNear } from '@/lib/gameRuntime';
import { CharacterModel } from './CharacterModel';
import { CharacterInfo, capsuleFor } from '@/lib/characters';

interface PlayerProps {
  character: CharacterInfo;
  position?: [number, number, number];
  frozen?: boolean;
  onFall?: () => void;
}

// Ajustes de física (gravidade do mundo: -25)
const WALK_SPEED = 6;
const FAST_SPEED = 10;
const JUMP_VELOCITY = 11;
const SUPER_JUMP_VELOCITY = 16;
const CROUCH_JUMP_VELOCITY = 18;
const CROUCH_CHARGE_TIME = 2;
const COYOTE_TIME = 0.1;
const JUMP_BUFFER = 0.12;
const ATTACK_COOLDOWN = 0.35;
const FALL_LIMIT = -12;

const pressed = (keys: Record<string, boolean>, ...names: string[]) => names.some((k) => keys[k]);

// Personagem controlado pelo jogador (líder do time escolhido)
export function Player({ character, position = [0, 1, 0], frozen = false, onFall }: PlayerProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const capsule = capsuleFor(character.height);
  const { world, rapier } = useRapier();
  const { keys } = useInput();
  const [animation, setAnimation] = useState('Idle');
  const [facing, setFacing] = useState<1 | -1>(1);
  const [crouchState, setCrouchState] = useState<'none' | 'charging' | 'charged'>('none');
  const [blinking, setBlinking] = useState(false);

  const t = useRef({
    sinceGrounded: 0,
    sinceJumpPressed: 99,
    jumpHeld: false,
    crouchTime: 0,
    attackCooldown: 0,
    attackAnim: 0,
    // Último ponto em chão firme, usado para reaparecer após uma queda
    safe: { x: position[0], y: position[1] },
  });

  useFrame((_, rawDelta) => {
    const body = bodyRef.current;
    if (!body) return;
    const delta = Math.min(rawDelta, 1 / 30);
    const k = keys.current;
    const s = t.current;
    const store = useGameStore.getState();
    const power = store.activePowerUp;
    store.tickPowerUp(delta);

    const isBlinking = store.invulnerableUntil > performance.now();
    if (isBlinking !== blinking) setBlinking(isBlinking);

    const pos = body.translation();
    const vel = body.linvel();

    if (pos.y < FALL_LIMIT) {
      onFall?.();
      body.setTranslation({ x: s.safe.x, y: s.safe.y + 2, z: 0 }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    // Chão: raio curto saindo dos pés
    const ray = new rapier.Ray({ x: pos.x, y: pos.y + 0.1, z: 0 }, { x: 0, y: -1, z: 0 });
    const hit = world.castRay(ray, 0.2, true, undefined, undefined, undefined, body);
    const grounded = !!hit && vel.y <= 0.5;
    s.sinceGrounded = grounded ? 0 : s.sinceGrounded + delta;
    playerRuntime.position = { x: pos.x, y: pos.y, z: pos.z };
    playerRuntime.grounded = grounded;
    if (grounded && s.sinceJumpPressed > 0.5) s.safe = { x: pos.x - playerRuntime.facing * 0.8, y: pos.y };

    if (frozen) {
      // Evita pular sozinho ao fechar o diálogo com Espaço
      s.jumpHeld = true;
      body.setLinvel({ x: 0, y: Math.min(vel.y, 0), z: 0 }, true);
      const idle = grounded ? 'Idle' : 'Jump_Idle';
      if (idle !== animation) setAnimation(idle);
      return;
    }

    const left = pressed(k, 'ArrowLeft', 'a', 'A');
    const right = pressed(k, 'ArrowRight', 'd', 'D');
    const jump = pressed(k, ' ', 'ArrowUp', 'w', 'W');
    const crouch = pressed(k, 'ArrowDown', 's', 'S', 'Control', 'c', 'C');
    const attack = pressed(k, 'f', 'F', 'j', 'J', 'e', 'E');

    // Agachar: carrega o super pulo (2s agachado, solta para pular)
    const crouching = crouch && grounded;
    if (crouching) s.crouchTime += delta;
    let vy = vel.y;
    if (!crouching && s.crouchTime >= CROUCH_CHARGE_TIME && grounded) vy = CROUCH_JUMP_VELOCITY;
    if (!crouching) s.crouchTime = 0;
    const nextCrouch = !crouching ? 'none' : s.crouchTime >= CROUCH_CHARGE_TIME ? 'charged' : 'charging';
    if (nextCrouch !== crouchState) setCrouchState(nextCrouch);

    // Movimento horizontal com aceleração rápida (sensação de plataforma)
    const dir = (right ? 1 : 0) - (left ? 1 : 0);
    const speed = power === 'super-speed' ? FAST_SPEED : WALK_SPEED;
    const targetVx = crouching ? 0 : dir * speed;
    const accel = grounded ? 40 : 20;
    const vx = vel.x + Math.sign(targetVx - vel.x) * Math.min(Math.abs(targetVx - vel.x), accel * delta);
    if (dir !== 0 && dir !== facing) setFacing(dir as 1 | -1);

    // Pulo com buffer, coyote time e altura variável
    if (jump && !s.jumpHeld) s.sinceJumpPressed = 0;
    else s.sinceJumpPressed += delta;
    if (s.sinceJumpPressed < JUMP_BUFFER && s.sinceGrounded < COYOTE_TIME && !crouching) {
      vy = power === 'super-jump' ? SUPER_JUMP_VELOCITY : JUMP_VELOCITY;
      s.sinceJumpPressed = 99;
      s.sinceGrounded = 99;
    }
    if (!jump && s.jumpHeld && vy > 0) vy *= 0.5;
    s.jumpHeld = jump;

    // Flutuar: segurando pulo enquanto cai, a queda fica lenta
    if (power === 'float' && jump && vy < -2) vy = -2;

    // Trava de tela durante uma onda de inimigos
    const lock = store.screenLock;
    let lockedVx = vx;
    if (lock && ((pos.x <= lock[0] && vx < 0) || (pos.x >= lock[1] && vx > 0))) lockedVx = 0;

    // Golpe recebido
    if (playerRuntime.pendingKnockback) {
      const kb = playerRuntime.pendingKnockback;
      playerRuntime.pendingKnockback = null;
      body.setLinvel({ x: kb.x, y: kb.y, z: 0 }, true);
    } else {
      body.setLinvel({ x: lockedVx, y: vy, z: 0 }, true);
    }

    // Ataque: laser / bola de fogo / espadada
    s.attackCooldown -= delta;
    s.attackAnim -= delta;
    const face = dir !== 0 ? (dir as 1 | -1) : facing;
    if (attack && s.attackCooldown <= 0) {
      s.attackCooldown = ATTACK_COOLDOWN;
      s.attackAnim = 0.3;
      if (power === 'laser' || power === 'fire-ball') {
        store.spawnProjectile({ kind: power, x: pos.x + face * 0.6, y: pos.y + 0.9, dir: face, owner: 'player' });
      } else {
        findEnemyNear(pos.x + face * 0.9, pos.y + 0.8, 1.1)?.hit(10, pos.x);
      }
    }

    playerRuntime.velocity = { x: vx, y: vy, z: 0 };
    playerRuntime.facing = face;

    let next = 'Idle';
    if (s.attackAnim > 0) next = power === 'laser' || power === 'fire-ball' ? 'Spellcast_Shoot' : character.attack;
    else if (!grounded) next = 'Jump_Idle';
    else if (crouching) next = 'Sit_Floor_Pose';
    else if (Math.abs(vx) > 0.5) next = Math.abs(vx) > WALK_SPEED + 1 ? 'Running_B' : 'Running_A';
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
      ccd
      userData={{ player: true }}
    >
      <CapsuleCollider args={[capsule.halfHeight, capsule.radius]} position={[0, capsule.centerY, 0]} />
      <CharacterModel model={character.model} animation={animation} accessories={character.gear} facing={facing} height={character.height} blink={blinking} />
      {crouchState !== 'none' && (
        <mesh position={[0, character.height + 0.3, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color={crouchState === 'charged' ? '#FACC15' : '#FFFFFF'} />
        </mesh>
      )}
    </RigidBody>
  );
}
