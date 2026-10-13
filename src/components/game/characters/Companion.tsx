'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier, RapierRigidBody } from '@react-three/rapier';
import { playerRuntime } from '@/lib/gameRuntime';
import { CharacterModel } from './CharacterModel';
import { CharacterInfo, capsuleFor } from '@/lib/characters';

interface CompanionProps {
  character: CharacterInfo;
  position?: [number, number, number];
  frozen?: boolean;
}

const FOLLOW_DISTANCE = 1.6;
const SPEED = 6.5;
const JUMP_VELOCITY = 11;
const TELEPORT_DISTANCE = 9;

// Companheiro do time: segue o líder, pula junto e reaparece ao lado dele se ficar para trás
export function Companion({ character, position = [1, 1, 0], frozen = false }: CompanionProps) {
  const capsule = capsuleFor(character.height);
  const bodyRef = useRef<RapierRigidBody>(null);
  const { world, rapier } = useRapier();
  const [animation, setAnimation] = useState('Idle');
  const [facing, setFacing] = useState<1 | -1>(1);

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) return;
    const pos = body.translation();
    const vel = body.linvel();
    const target = playerRuntime.position;

    const ray = new rapier.Ray({ x: pos.x, y: pos.y + 0.1, z: 0 }, { x: 0, y: -1, z: 0 });
    const grounded = !!world.castRay(ray, 0.2, true, undefined, undefined, undefined, body) && vel.y <= 0.5;

    const dx = target.x - playerRuntime.facing * FOLLOW_DISTANCE - pos.x;
    const tooFar = Math.hypot(target.x - pos.x, target.y - pos.y) > TELEPORT_DISTANCE || pos.y < -10;
    if (tooFar && playerRuntime.grounded) {
      body.setTranslation({ x: target.x - playerRuntime.facing, y: target.y + 0.5, z: 0 }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    let vx = frozen || Math.abs(dx) < 0.3 ? 0 : Math.sign(dx) * Math.min(SPEED, Math.abs(dx) * 4);
    let vy = vel.y;
    if (!frozen && grounded) {
      // Pula quando o Dávid está mais alto ou quando não há chão à frente
      const ahead = new rapier.Ray({ x: pos.x + Math.sign(vx) * 0.8, y: pos.y + 0.1, z: 0 }, { x: 0, y: -1, z: 0 });
      const gapAhead = vx !== 0 && !world.castRay(ahead, 3, true, undefined, undefined, undefined, body);
      if (target.y - pos.y > 1 || gapAhead) vy = JUMP_VELOCITY;
    }
    if (!grounded && Math.abs(vx) < 0.1) vx = vel.x;
    body.setLinvel({ x: vx, y: vy, z: 0 }, true);

    if (vx > 0.3 && facing !== 1) setFacing(1);
    if (vx < -0.3 && facing !== -1) setFacing(-1);
    const next = !grounded ? 'Jump_Idle' : Math.abs(vx) > 0.5 ? 'Running_A' : 'Idle';
    if (next !== animation) setAnimation(next);
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={position}
      colliders={false}
      mass={0.8}
      lockRotations
      enabledTranslations={[true, true, false]}
      friction={0}
      userData={{ companion: true }}
    >
      <CapsuleCollider args={[capsule.halfHeight, capsule.radius]} position={[0, capsule.centerY, 0]} />
      <CharacterModel model={character.model} animation={animation} accessories={character.gear} facing={facing} height={character.height} />
    </RigidBody>
  );
}
