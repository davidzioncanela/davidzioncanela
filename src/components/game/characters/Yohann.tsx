'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { Mesh, Vector3 } from 'three';

interface YohannProps {
  position?: [number, number, number];
}

export function Yohann({ position = [1, 1, 0] }: YohannProps) {
  const bodyRef = useRef<any>(null);
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    const body = bodyRef.current;
    if (!body) return;
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={position}
      colliders={false}
      mass={1}
      lockRotations
      type="dynamic"
    >
      <CapsuleCollider args={[0.5, 0.5]} position={[0, 1, 0]} />
      <mesh ref={meshRef} castShadow position={[0, 1, 0]}>
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <group position={[0.3, 1.2, 0]}>
        <mesh>
          <boxGeometry args={[0.2, 0.2, 0.6]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      </group>
    </RigidBody>
  );
}
