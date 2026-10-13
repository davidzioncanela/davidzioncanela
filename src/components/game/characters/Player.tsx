'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier, RapierRigidBody } from '@react-three/rapier';
import { useInput } from '@/contexts/InputContext';
import { useGameStore } from '@/store/gameStore';
import { players, registerPlayer, findEnemyNear } from '@/lib/gameRuntime';
import { applyHelpPower } from '@/lib/helpPowers';
import { sendEvent } from '@/lib/net';
import { CharacterInfo, InputScheme, capsuleFor } from '@/lib/characters';
import { isPressed } from '@/lib/controls';
import { CharacterModel } from './CharacterModel';
import { newTraversalState, updateTraversal } from './traversal';
import { Sparkles } from '@react-three/drei';
import { useProfileStore } from '@/store/profileStore';
import { DANCES, DANCE_RECHARGE, LIE_COOLDOWN, LIE_MAX_SECONDS } from '@/lib/abilities';
import { PowerAura, HelpBurst } from '../effects/PowerEffects';

interface PlayerProps {
  character: CharacterInfo;
  input: InputScheme;
  position?: [number, number, number];
  frozen?: boolean;
}

// Ajustes de física (gravidade do mundo: -25)
// Anda devagar no começo e corre depois de segurar a direção um pouquinho
const WALK_SPEED = 6;
const STROLL_SPEED = 3.8;
const RUN_AFTER = 0.4;
const CRAWL_SPEED = 2.5;
const FAST_SPEED = 10;
const JUMP_VELOCITY = 11;
const SUPER_JUMP_VELOCITY = 16;
const CROUCH_JUMP_VELOCITY = 18;
const CROUCH_CHARGE_TIME = 2;
const COYOTE_TIME = 0.1;
const JUMP_BUFFER = 0.12;
const ATTACK_COOLDOWN = 0.35;
const FALL_LIMIT = -12;
const BASE_DAMAGE = 10;

// Personagem controlado por uma pessoa neste aparelho
export function Player({ character, input, position = [0, 1, 0], frozen = false }: PlayerProps) {
  const id = character.id;
  const bodyRef = useRef<RapierRigidBody>(null);
  const capsule = capsuleFor(character.height);
  const { world, rapier } = useRapier();
  const { keys } = useInput();
  const [animation, setAnimation] = useState('Idle');
  const [facing, setFacing] = useState<1 | -1>(1);
  const [crouchState, setCrouchState] = useState<'none' | 'charging' | 'charged'>('none');
  const [blinking, setBlinking] = useState(false);
  const [helpBurst, setHelpBurst] = useState(0);
  const power = useGameStore((st) => st.players[id]?.powerUp ?? null);
  const [shielded, setShielded] = useState(false);
  // Postura: em pé, baixa (agachado/engatinhando) ou deitado — muda o tamanho do colisor
  const [pose, setPose] = useState<'stand' | 'low' | 'lie'>('stand');
  const [dancing, setDancing] = useState(false);

  const t = useRef({
    sinceGrounded: 0,
    sinceJumpPressed: 99,
    jumpHeld: false,
    helpHeld: false,
    crouchHeld: false,
    crouchTime: 0,
    attackCooldown: 0,
    attackAnim: 0,
    helpAnim: 0,
    holdTime: 0,
    lieTime: 0,
    lieCooldown: 0,
    // Último ponto em chão firme, usado para reaparecer após uma queda
    safe: { x: position[0], y: position[1] },
  });
  // Corda, barra, cano, água e portas
  const trav = useRef(newTraversalState());

  useEffect(() => {
    const runtime = registerPlayer(id, true, { x: position[0], y: position[1], z: 0 });
    // Teletransporte para testes pelo console (só em desenvolvimento)
    if (process.env.NODE_ENV !== 'production') {
      const w = window as unknown as { __teleport?: Record<string, (x: number, y: number) => void> };
      w.__teleport = { ...w.__teleport, [id]: (x, y) => bodyRef.current?.setTranslation({ x, y, z: 0 }, true) };
    }
    return () => {
      if (players.get(id) === runtime) players.delete(id);
    };
  }, [id, position]);

  useFrame((_, rawDelta) => {
    const body = bodyRef.current;
    const me = players.get(id);
    if (!body || !me) return;
    const delta = Math.min(rawDelta, 1 / 30);
    const k = keys.current;
    const s = t.current;
    const store = useGameStore.getState();
    const hud = store.players[id];
    const powerUp = hud?.powerUp ?? null;
    store.tickPlayer(id, delta);

    const isBlinking = (hud?.invulnerableUntil ?? 0) > performance.now();
    if (isBlinking !== blinking) setBlinking(isBlinking);
    const isShielded = (hud?.shieldUntil ?? 0) > performance.now();
    if (isShielded !== shielded) setShielded(isShielded);

    if (me.pendingTeleport) {
      body.setTranslation(me.pendingTeleport, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      me.pendingTeleport = null;
    }

    const pos = body.translation();
    const vel = body.linvel();

    if (pos.y < FALL_LIMIT) {
      store.loseLife();
      body.setTranslation({ x: s.safe.x, y: s.safe.y + 2, z: 0 }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    // Chão: raio curto saindo dos pés
    const ray = new rapier.Ray({ x: pos.x, y: pos.y + 0.1, z: 0 }, { x: 0, y: -1, z: 0 });
    const hit = world.castRay(ray, 0.2, true, undefined, undefined, undefined, body);
    // Velocidade da plataforma embaixo (nuvens se mexem): o personagem anda junto com ela
    const ground = hit?.collider.parent();
    const plat = ground && ground.isDynamic() ? ground.linvel() : { x: 0, y: 0 };
    const grounded = !!hit && vel.y - plat.y <= 0.5;
    s.sinceGrounded = grounded ? 0 : s.sinceGrounded + delta;
    me.position = { x: pos.x, y: pos.y, z: pos.z };
    me.grounded = grounded;
    if (grounded && s.sinceJumpPressed > 0.5) s.safe = { x: pos.x - me.facing * 0.8, y: pos.y };

    if (frozen) {
      // Evita pular sozinho ao fechar o diálogo
      s.jumpHeld = true;
      body.setLinvel({ x: 0, y: Math.min(vel.y, 0), z: 0 }, true);
      const idle = grounded ? 'Idle' : 'Jump_Idle';
      if (idle !== animation) setAnimation(idle);
      return;
    }

    const left = isPressed(k, input, 'left');
    const right = isPressed(k, input, 'right');
    const jump = isPressed(k, input, 'jump');
    const crouch = isPressed(k, input, 'crouch');
    const attack = isPressed(k, input, 'attack');
    const help = isPressed(k, input, 'help');
    const dirInput = (right ? 1 : 0) - (left ? 1 : 0);

    // Modos especiais de travessia controlam o personagem por conta própria
    const special = updateTraversal({
      body,
      me,
      t: trav.current,
      input: { dir: dirInput, jump, jumpEdge: jump && !s.jumpHeld, crouch, crouchEdge: crouch && !s.crouchHeld },
      delta,
      grounded,
      height: character.height,
      onDrown: () => {
        store.loseLife();
        me.pendingTeleport = { x: s.safe.x, y: s.safe.y + 2, z: 0 };
      },
    });
    s.crouchHeld = crouch;
    if (special) {
      s.jumpHeld = jump;
      if (crouchState !== 'none') setCrouchState('none');
      if (dirInput !== 0 && dirInput !== facing) setFacing(dirInput as 1 | -1);
      me.velocity = { x: special.vx ?? 0, y: special.vy ?? 0, z: 0 };
      me.grounded = false;
      me.animation = special.anim;
      if (special.anim !== animation) setAnimation(special.anim);
      return;
    }

    const profile = useProfileStore.getState();
    const lieKey = isPressed(k, input, 'lie');
    const danceKey = isPressed(k, input, 'dance');

    // Teto baixo em cima (atalhos): não dá para ficar em pé
    const headRay = new rapier.Ray({ x: pos.x, y: pos.y + 0.7, z: 0 }, { x: 0, y: 1, z: 0 });
    const ceiling = !!world.castRay(headRay, Math.max(0.05, character.height - 0.6), true, undefined, undefined, undefined, body);

    // Deitar (prêmio): imune a dano por até 3s, depois precisa levantar
    s.lieCooldown -= delta;
    const lying = lieKey && grounded && profile.has('deitar') && s.lieCooldown <= 0 && s.lieTime < LIE_MAX_SECONDS;
    if (lying) s.lieTime += delta;
    else if (s.lieTime > 0) {
      s.lieCooldown = s.lieTime >= LIE_MAX_SECONDS ? LIE_COOLDOWN : 0.5;
      s.lieTime = 0;
    }
    me.lying = lying;

    // Dançar (prêmio): dança própria de cada personagem; recarrega o poder de ajuda mais rápido
    const isDancing = !lying && danceKey && grounded && dirInput === 0 && profile.has('dancar');
    if (isDancing) store.rechargeHelp(id, delta * (DANCE_RECHARGE - 1));
    if (isDancing !== dancing) setDancing(isDancing);

    // Engatinhar (prêmio): ↓ + andar, bem baixinho, passa pelos atalhos
    const crawling = grounded && (crouch || ceiling) && dirInput !== 0 && (profile.has('engatinhar') || ceiling);
    const low = grounded && (crouch || ceiling) && !lying;
    me.low = low;
    const nextPose = lying ? 'lie' : low ? 'low' : 'stand';
    if (nextPose !== pose) setPose(nextPose);

    // Agachar: carrega o super pulo (2s agachado, solta para pular)
    const crouching = crouch && grounded && !crawling;
    if (crouching) s.crouchTime += delta;
    let vy = vel.y;
    if (!crouching && s.crouchTime >= CROUCH_CHARGE_TIME && grounded) vy = CROUCH_JUMP_VELOCITY;
    if (!crouching) s.crouchTime = 0;
    const nextCrouch = !crouching ? 'none' : s.crouchTime >= CROUCH_CHARGE_TIME ? 'charged' : 'charging';
    if (nextCrouch !== crouchState) setCrouchState(nextCrouch);

    // Movimento horizontal com aceleração rápida (sensação de plataforma)
    const dir = dirInput;
    s.holdTime = dir !== 0 ? s.holdTime + delta : 0;
    const speed = crawling ? CRAWL_SPEED : powerUp === 'super-speed' ? FAST_SPEED : s.holdTime > RUN_AFTER || !grounded ? WALK_SPEED : STROLL_SPEED;
    const targetVx = (crouching || lying || isDancing ? 0 : dir * speed) + (grounded ? plat.x : 0);
    const accel = grounded ? 40 : 20;
    let vx = vel.x + Math.sign(targetVx - vel.x) * Math.min(Math.abs(targetVx - vel.x), accel * delta);
    if (dir !== 0 && dir !== facing) setFacing(dir as 1 | -1);

    // Pulo com buffer, coyote time e altura variável
    if (jump && !s.jumpHeld) s.sinceJumpPressed = 0;
    else s.sinceJumpPressed += delta;
    if (s.sinceJumpPressed < JUMP_BUFFER && s.sinceGrounded < COYOTE_TIME && !crouching && !lying && !ceiling) {
      vy = powerUp === 'super-jump' ? SUPER_JUMP_VELOCITY : JUMP_VELOCITY;
      s.sinceJumpPressed = 99;
      s.sinceGrounded = 99;
    }
    if (!jump && s.jumpHeld && vy > 0) vy *= 0.5;
    s.jumpHeld = jump;

    // Flutuar: segurando pulo enquanto cai, a queda fica lenta
    if (powerUp === 'float' && jump && vy < -2) vy = -2;

    // Trava de tela durante a horda (longe uns dos outros, a tela se divide)
    const lock = store.screenLock;
    if (lock && ((pos.x <= lock[0] && vx < 0) || (pos.x >= lock[1] && vx > 0))) vx = 0;

    // Golpe recebido ou lançamento do Yohann
    if (me.pendingImpulse) {
      const imp = me.pendingImpulse;
      me.pendingImpulse = null;
      body.setLinvel({ x: imp.x || vx, y: imp.y, z: 0 }, true);
    } else {
      body.setLinvel({ x: vx, y: vy, z: 0 }, true);
    }

    // Ataque: laser / bola de fogo / golpe corpo a corpo
    s.attackCooldown -= delta;
    s.attackAnim -= delta;
    s.helpAnim -= delta;
    const face = dir !== 0 ? (dir as 1 | -1) : facing;
    if (attack && s.attackCooldown <= 0 && !lying) {
      s.attackCooldown = ATTACK_COOLDOWN;
      s.attackAnim = 0.3;
      if (powerUp === 'laser' || powerUp === 'fire-ball') {
        const shot = { kind: powerUp, x: pos.x + face * 0.6, y: pos.y + character.height * 0.6, dir: face, owner: 'player' } as const;
        store.spawnProjectile(shot);
        sendEvent({ type: 'projectile', ...shot });
      } else {
        const boost = store.damageBoostUntil > performance.now() ? 2 : 1;
        findEnemyNear(pos.x + face * 0.9, pos.y + 0.8, 1.2)?.hit(BASE_DAMAGE * boost, pos.x);
      }
    }

    // Poder de ajuda próprio do personagem
    if (help && !s.helpHeld && (hud?.helpCooldownLeft ?? 0) <= 0) {
      store.startHelpCooldown(id, character.help.cooldown);
      applyHelpPower(character.help.id, id, pos.x, pos.y, false);
      sendEvent({ type: 'help', from: id, power: character.help.id, x: pos.x, y: pos.y });
      s.helpAnim = 0.6;
      setHelpBurst((n) => n + 1);
    }
    s.helpHeld = help;

    me.velocity = { x: vx, y: vy, z: 0 };
    me.facing = face;

    let next = 'Idle';
    if (s.helpAnim > 0) next = 'Spellcast_Raise';
    else if (s.attackAnim > 0) next = powerUp === 'laser' || powerUp === 'fire-ball' ? 'Spellcast_Shoot' : character.attack;
    else if (!grounded) next = 'Jump_Idle';
    else if (lying) next = 'Lie_Idle';
    else if (isDancing) next = DANCES[id];
    else if (crawling) next = 'Walking_C';
    else if (crouching || low) next = 'Sit_Floor_Pose';
    else if (Math.abs(vx - (grounded ? plat.x : 0)) > 0.5) {
      const v = Math.abs(vx - (grounded ? plat.x : 0));
      next = v > WALK_SPEED + 1 ? 'Running_B' : v > STROLL_SPEED + 0.5 ? 'Running_A' : 'Walking_A';
    }
    if (next !== animation) setAnimation(next);
    me.animation = next;
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={position}
      colliders={false}
      lockRotations
      enabledTranslations={[true, true, false]}
      friction={0}
      ccd
      userData={{ player: id }}
    >
      {/* Peso proporcional ao tamanho: afunda mais as nuvens */}
      {pose === 'stand' ? (
        <CapsuleCollider key="stand" args={[capsule.halfHeight, capsule.radius]} position={[0, capsule.centerY, 0]} mass={character.height * 0.8} />
      ) : (
        // Baixinho: cabe nos atalhos de teto baixo
        <CapsuleCollider key="low" args={[0.05, 0.27]} position={[0, 0.32, 0]} mass={character.height * 0.8} />
      )}
      <group scale={[1, animation === 'Walking_C' ? 0.6 : 1, 1]}>
        <CharacterModel model={character.model} animation={animation} accessories={character.gear} facing={facing} height={character.height} blink={blinking} />
      </group>
      {dancing && <Sparkles count={30} scale={[1.6, character.height * 1.6, 1.6]} position={[0, character.height / 2, 0]} size={9} speed={2} color="#F472B6" />}
      <PowerAura powerUp={power} height={character.height} shielded={shielded} />
      <HelpBurst trigger={helpBurst} power={character.help.id} />
      {crouchState !== 'none' && (
        <mesh position={[0, character.height + 0.3, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color={crouchState === 'charged' ? '#FACC15' : '#FFFFFF'} toneMapped={false} />
        </mesh>
      )}
    </RigidBody>
  );
}
