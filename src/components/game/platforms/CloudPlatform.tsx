'use client';

import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface CloudPlatformProps {
  position: [number, number, number];
  scale?: [number, number, number];
  animated?: boolean;
  speed?: number;
  targetY?: number;
  delay?: number;
  float?: boolean;
  floatSpeed?: number;
  floatRange?: number;
}

export function CloudPlatform({ position, scale = [3, 0.4, 3], animated = false, speed = 0.5, targetY, delay = 0, float = false, floatSpeed = 0.6, floatRange = 0.4 }: CloudPlatformProps) {
  const groupRef = useRef<any>(null);
  const startY = useRef(position[1]);
  const startTime = useRef(delay);
  const started = useRef(!animated);

  useFrame((state, delta) => {
    if (animated && groupRef.current) {
      if (!started.current) {
        startTime.current -= delta;
        if (startTime.current <= 0) started.current = true;
        return;
      }
      if (targetY !== undefined && groupRef.current.position.y > targetY) {
        groupRef.current.position.y -= speed * delta;
        if (groupRef.current.position.y < targetY) {
          groupRef.current.position.y = targetY;
          startY.current = targetY;
        }
      }
    }
    if (float && groupRef.current && started.current) {
      groupRef.current.position.y = startY.current + Math.sin(state.clock.elapsedTime * floatSpeed + position[0]) * floatRange;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[scale[0] / 2, scale[1] / 2, scale[2] / 2]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={scale} />
          <meshStandardMaterial color="#F8FAFC" opacity={0.95} transparent emissive="#E0F2FE" emissiveIntensity={0.2} />
        </mesh>
        {/* Detalhe de nuvem/ilhas flutuantes estilo DBZ */}
        <mesh position={[scale[0]*0.15, scale[1]/2, -scale[2]*0.2]} scale={[0.4, 0.3, 0.4]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#FFFFFF" opacity={0.9} transparent />
        </mesh>
        <mesh position={[-scale[0]*0.2, scale[1]/2, scale[2]*0.15]} scale={[0.5, 0.35, 0.5]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#FFFFFF" opacity={0.9} transparent />
        </mesh>
      </RigidBody>
    </group>
  );
}
