'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { Mesh, Vector3 } from 'three';

interface DavidProps {
  position?: [number, number, number];
  onPowerUpChange?: (powerUp: string | null) => void;
}

export function David({ position = [0, 1, 0], onPowerUpChange }: DavidProps) {
  const bodyRef = useRef<any>(null);
  const meshRef = useRef<Mesh>(null);
  const [isGrounded, setIsGrounded] = useState(false);
  const [crouchTimer, setCrouchTimer] = useState(0);
  const [isCrouching, setIsCrouching] = useState(false);
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);

  const keys = useRef<{ [key: string]: boolean }>({});

  useFrame((state, delta) => {
    const body = bodyRef.current;
    if (!body) return;

    let moveX = 0;
    let moveZ = 0;
    const speed = activePowerUp === 'super-speed' ? 10 : 6;

    if (keys.current['ArrowLeft'] || keys.current['a']) moveX -= 1;
    if (keys.current['ArrowRight'] || keys.current['d']) moveX += 1;
    if (keys.current['ArrowUp'] || keys.current['w']) moveZ -= 1;
    if (keys.current['ArrowDown'] || keys.current['s']) moveZ += 1;

    const impulse = new Vector3(moveX * speed * delta, 0, moveZ * speed * delta);
    body.applyImpulse(impulse, true);

    if ((keys.current[' '] || keys.current['ArrowUp']) && isGrounded) {
      body.applyImpulse(new Vector3(0, 8, 0), true);
    }

    if (keys.current['Control'] || keys.current['Shift'] || keys.current['c']) {
      setIsCrouching(true);
      setCrouchTimer((prev) => prev + delta);
    } else {
      if (isCrouching && crouchTimer > 2) {
        body.applyImpulse(new Vector3(0, 15, 0), true);
        setActivePowerUp(null);
        onPowerUpChange?.(null);
      }
      setIsCrouching(false);
      setCrouchTimer(0);
    }
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
        <meshStandardMaterial color="#4A9FD5" />
      </mesh>
      <group position={[0.3, 1.2, 0]}>
        <mesh>
          <boxGeometry args={[0.2, 0.2, 0.6]} />
          <meshStandardMaterial color="#1a365d" />
        </mesh>
      </group>
    </RigidBody>
  );
}
