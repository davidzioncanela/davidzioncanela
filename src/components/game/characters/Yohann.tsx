'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';
import { Mesh, Vector3 } from 'three';
import { useInput } from '@/contexts/InputContext';

interface YohannProps {
  position?: [number, number, number];
  onPositionChange?: (pos: [number, number, number], vel: [number, number, number]) => void;
}

export function Yohann({ position = [1, 1, 0], onPositionChange }: YohannProps) {
  const bodyRef = useRef<any>(null);
  const { world, rapier } = useRapier();
  const { keys } = useInput();

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) return;

    const origin = body.translation();
    const ray = new rapier.Ray(origin, { x: 0, y: -1, z: 0 });
    const hit = world.castRay(ray, 1.1, true, undefined, undefined, undefined, body);

    const pos = body.translation();
    const vel = body.linvel();
    onPositionChange?.([pos.x, pos.y, pos.z], [vel.x, vel.y, vel.z]);
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={position}
      colliders={false}
      mass={0.8}
      lockRotations
      type="dynamic"
    >
      <CapsuleCollider args={[0.25, 0.25]} position={[0, 0.65, 0]} />
      <mesh castShadow position={[0, 0.65, 0]} scale={[0.8, 0.65, 0.8]}>
        <capsuleGeometry args={[0.32, 0.65, 8, 16]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <group position={[0.2, 0.8, 0]}>
        <mesh>
          <boxGeometry args={[0.12, 0.12, 0.4]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      </group>
    </RigidBody>
  );
}
