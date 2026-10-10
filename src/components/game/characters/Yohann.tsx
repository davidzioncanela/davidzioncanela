'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';
import { Mesh, Vector3, Ray } from 'three';

interface YohannProps {
  position?: [number, number, number];
  onPositionChange?: (pos: [number, number, number], vel: [number, number, number]) => void;
}

export function Yohann({ position = [1, 1, 0], onPositionChange }: YohannProps) {
  const bodyRef = useRef<any>(null);
  const [isGrounded, setIsGrounded] = useState(false);
  const { rapier, world } = useRapier();

  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const body = bodyRef.current;
    if (!body) return;

    // Ground detection
    const origin = body.translation();
    const ray = new Ray(origin, new Vector3(0, -1, 0));
    const hit = world.castRay(ray, 1.2, true);
    setIsGrounded(hit !== null);

    const pos = body.translation();
    const vel = body.linvel();
    onPositionChange?.([pos.x, pos.y, pos.z], [vel.x, vel.y, vel.z]);
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
      <CapsuleCollider args={[0.4, 0.4]} position={[0, 1, 0]} />
      <mesh castShadow position={[0, 1, 0]}>
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
