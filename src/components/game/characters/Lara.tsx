'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';
import { Mesh, Vector3, Ray } from 'three';
import { useInput } from '@/contexts/InputContext';

interface LaraProps {
  position?: [number, number, number];
  onPositionChange?: (pos: [number, number, number], vel: [number, number, number]) => void;
}

export function Lara({ position = [2, 1, 0], onPositionChange }: LaraProps) {
  const bodyRef = useRef<any>(null);
  const { world } = useRapier();
  const { keys } = useInput();

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) return;

    const origin = body.translation();
    const ray = new Ray(origin, new Vector3(0, -1, 0));
    const hit = (world as any).castRay(ray as any, 0.9, true);

    const pos = body.translation();
    const vel = body.linvel();
    onPositionChange?.([pos.x, pos.y, pos.z], [vel.x, vel.y, vel.z]);
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={position}
      colliders={false}
      mass={0.6}
      lockRotations
      type="dynamic"
    >
      <CapsuleCollider args={[0.2, 0.2]} position={[0, 0.55, 0]} />
      <mesh castShadow position={[0, 0.55, 0]} scale={[0.7, 0.55, 0.7]}>
        <capsuleGeometry args={[0.26, 0.55, 8, 16]} />
        <meshStandardMaterial color="#D8B4FE" />
      </mesh>
      <group position={[0.16, 0.7, 0]}>
        <mesh>
          <boxGeometry args={[0.1, 0.1, 0.35]} />
          <meshBasicMaterial color="#A78BFA" />
        </mesh>
      </group>
    </RigidBody>
  );
}
