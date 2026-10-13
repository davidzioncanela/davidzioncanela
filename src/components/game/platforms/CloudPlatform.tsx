'use client';

import { useRef } from 'react';
import { RigidBody, CuboidCollider, RapierRigidBody, useBeforePhysicsStep } from '@react-three/rapier';
import { Clone } from '@react-three/drei';
import { useWhiteCloud } from '../sky/Scenery';
import { players } from '@/lib/gameRuntime';
import type { CharacterId } from '@/lib/characters';

export type CloudKind = 'firme' | 'afunda' | 'elastica' | 'deriva';

interface CloudPlatformProps {
  position: [number, number, number];
  scale?: [number, number, number];
  kind?: CloudKind;
  // Nuvem à deriva: quanto anda para os lados e em que velocidade
  driftRange?: number;
  driftSpeed?: number;
}

// Rigidez da "mola" que segura cada tipo de nuvem no lugar (quanto menor, mais afunda com o peso)
const STIFFNESS: Record<CloudKind, number> = { firme: 140, afunda: 9, elastica: 45, deriva: 60 };
const BOUNCE_VELOCITY = 16;

// Nuvem com física própria: é um corpo dinâmico preso por uma mola ao ponto de descanso.
// O peso de quem pisa afunda a nuvem, ela balança e volta; a elástica arremessa para cima.
export function CloudPlatform({ position, scale = [3, 0.5, 3], kind = 'firme', driftRange = 3, driftSpeed = 0.5 }: CloudPlatformProps) {
  const body = useRef<RapierRigidBody>(null);
  const cloud = useWhiteCloud('/assets/scenery/cloud_big.gltf');
  const mass = Math.max(1.5, scale[0] * scale[2] * 0.15);
  const k = STIFFNESS[kind] * mass;
  const damping = 2 * Math.sqrt(k * mass) * 0.35;

  const clock = useRef(0);
  // A mola age a cada passo da física (como a gravidade), então funciona igual em qualquer FPS
  useBeforePhysicsStep((world) => {
    const b = body.current;
    if (!b) return;
    const dt = world.timestep;
    clock.current += dt;
    const t = clock.current;
    // Ponto de descanso: flutua de leve; a nuvem à deriva passeia para os lados
    const restX = position[0] + (kind === 'deriva' ? Math.sin(t * driftSpeed + position[0]) * driftRange : 0);
    const restY = position[1] + Math.sin(t * 0.8 + position[0]) * 0.15;
    const p = b.translation();
    const v = b.linvel();
    const fx = k * (restX - p.x) - damping * v.x;
    const fy = k * (restY - p.y) - damping * v.y;
    b.applyImpulse({ x: fx * dt, y: fy * dt, z: 0 }, true);
  });

  return (
    <RigidBody
      ref={body}
      position={position}
      colliders={false}
      gravityScale={0}
      lockRotations
      enabledTranslations={[true, true, false]}
      linearDamping={0.5}
      userData={{ cloud: kind }}
      onCollisionEnter={({ other }) => {
        if (kind !== 'elastica') return;
        const who = other.rigidBodyObject?.userData?.player as CharacterId | undefined;
        const p = who && players.get(who);
        if (p) p.pendingImpulse = { x: 0, y: BOUNCE_VELOCITY, z: 0 };
      }}
    >
      <CuboidCollider args={[scale[0] / 2, scale[1] / 2, scale[2] / 2]} mass={mass} friction={1} />
      {/* Visual: nuvem fofinha do KayKit esticada no tamanho da plataforma */}
      <Clone object={cloud} scale={[scale[0] / 3.4, 0.55, scale[2] / 2.1]} position={[0, scale[1] / 2 - 0.58, 0]} castShadow receiveShadow />
      {kind === 'elastica' && (
        <mesh position={[0, scale[1] / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, Math.min(scale[0], scale[2]) * 0.35, 24]} />
          <meshBasicMaterial color="#F472B6" transparent opacity={0.7} toneMapped={false} />
        </mesh>
      )}
      {kind === 'afunda' && (
        <mesh position={[0, scale[1] / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.35, 16]} />
          <meshBasicMaterial color="#94A3B8" transparent opacity={0.6} />
        </mesh>
      )}
    </RigidBody>
  );
}
