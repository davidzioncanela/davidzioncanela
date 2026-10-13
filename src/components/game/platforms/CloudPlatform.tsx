'use client';

import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Clone } from '@react-three/drei';
import { useWhiteCloud } from '../sky/Scenery';

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
  const cloud = useWhiteCloud('/assets/scenery/cloud_big.gltf');
  const currentY = useRef(position[1]);
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
      if (targetY !== undefined && startY.current > targetY) {
        startY.current = Math.max(targetY, startY.current - speed * delta);
      }
    }
    currentY.current = startY.current;
    if (float && started.current) {
      currentY.current += Math.sin(state.clock.elapsedTime * floatSpeed + position[0]) * floatRange;
    }
    // Move o corpo cinemático para que colisor e visual andem juntos
    groupRef.current?.setNextKinematicTranslation({ x: position[0], y: currentY.current, z: position[2] });
  });

  return (
    <RigidBody ref={groupRef} type="kinematicPosition" position={position} colliders={false}>
      <CuboidCollider args={[scale[0] / 2, scale[1] / 2, scale[2] / 2]} />
      {/* Visual: nuvem fofinha do KayKit esticada no tamanho da plataforma */}
      <Clone object={cloud} scale={[scale[0] / 3.4, 0.55, scale[2] / 2.1]} position={[0, scale[1] / 2 - 0.58, 0]} castShadow receiveShadow />
    </RigidBody>
  );
}
