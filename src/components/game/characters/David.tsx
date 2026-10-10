'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';
import { Mesh, Vector3, Ray } from 'three';
import { useInput } from '@/contexts/InputContext';

interface DavidProps {
  position?: [number, number, number];
  onPowerUpChange?: (powerUp: string | null) => void;
  onPositionChange?: (pos: [number, number, number], vel: [number, number, number]) => void;
}

export function David({ position = [0, 1, 0], onPowerUpChange, onPositionChange }: DavidProps) {
  const bodyRef = useRef<any>(null);
  const meshRef = useRef<Mesh>(null);
  const [isGrounded, setIsGrounded] = useState(false);
  const [crouchTimer, setCrouchTimer] = useState(0);
  const [isCrouching, setIsCrouching] = useState(false);
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const { world } = useRapier();
  const { keys } = useInput();

  useFrame((state, delta) => {
    const body = bodyRef.current;
    if (!body) return;

    let moveX = 0;
    let moveZ = 0;
    const speed = activePowerUp === 'super-speed' ? 10 : 6;

    if (keys.current['ArrowLeft'] || keys.current['a'] || keys.current['A']) moveX -= 1;
    if (keys.current['ArrowRight'] || keys.current['d'] || keys.current['D']) moveX += 1;
    if (keys.current['ArrowUp'] || keys.current['w'] || keys.current['W']) moveZ -= 1;
    if (keys.current['ArrowDown'] || keys.current['s'] || keys.current['S']) moveZ += 1;

    const impulse = new Vector3(moveX * speed * delta, 0, moveZ * speed * delta);
    body.applyImpulse(impulse, true);

    const origin = body.translation();
    const ray = new Ray(origin, new Vector3(0, -1, 0));
    const hit = world.castRay(ray, 1.2, true);
    setIsGrounded(hit !== null);

    if ((keys.current[' '] || keys.current['ArrowUp']) && isGrounded) {
      body.applyImpulse(new Vector3(0, 8, 0), true);
    }

    if (keys.current['Control'] || keys.current['Shift'] || keys.current['c'] || keys.current['C']) {
      setIsCrouching(true);
      setCrouchTimer((prev) => prev + delta);
    } else {
      if (isCrouching && crouchTimer > 2) {
        body.applyImpulse(new Vector3(0, 15, 0), true);
        const newPowerUp = null;
        setActivePowerUp(newPowerUp);
        onPowerUpChange?.(newPowerUp);
      }
      setIsCrouching(false);
      setCrouchTimer(0);
    }

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
      <CapsuleCollider args={[0.4, 0.4]} position={[0, isCrouching ? 0.6 : 1, 0]} />
      <mesh ref={meshRef} castShadow position={[0, isCrouching ? 0.6 : 1, 0]} scale={isCrouching ? [1, 0.7, 1] : [1, 1, 1]}>
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
        <meshStandardMaterial color="#4A9FD5" />
      </mesh>
      <group position={[0.3, isCrouching ? 0.8 : 1.2, 0]}>
        <mesh>
          <boxGeometry args={[0.2, 0.2, 0.6]} />
          <meshStandardMaterial color="#1a365d" />
        </mesh>
      </group>
    </RigidBody>
  );
}
