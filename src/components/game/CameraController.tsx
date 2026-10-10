'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { GameState } from './GameCanvas';

interface CameraControllerProps {
  gameState: GameState;
  playerPosition?: [number, number, number];
  playerVelocity?: [number, number, number];
}

export function CameraController({ gameState, playerPosition = [0, 5, 10], playerVelocity = [0, 0, 0] }: CameraControllerProps) {
  const camera = useThree((state) => state.camera);
  const targetPosition = useRef(new THREE.Vector3(0, 5, 10));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const [px, py, pz] = playerPosition;
    const [vx, vy, vz] = playerVelocity;
    const velocityX = Math.abs(vx);

    if (gameState === 'duel') {
      // Metal Slug style - zoom focado no duelo
      targetPosition.current.set(px, py + 2, pz + 6);
      targetLookAt.current.set(px, py + 1, pz);
    } else if (gameState === 'dialog') {
      // Zoom suave durante diálogo
      targetPosition.current.set(px, py + 3, pz + 7);
      targetLookAt.current.set(px, py + 1, pz);
    } else {
      // Modo normal - follow lateral estilo Metal Slug
      const offsetX = vx > 0.5 ? 3 : vx < -0.5 ? -3 : 0;
      const lookAheadX = vx * 0.5;
      targetPosition.current.set(px + offsetX, py + 3, px > 0 ? px / 2 + 8 : 8);
      targetLookAt.current.set(px + lookAheadX, py, pz);
    }

    camera.position.lerp(targetPosition.current, 0.08);
    camera.lookAt(targetLookAt.current.lerp(new THREE.Vector3(px + (vx > 0 ? 2 : vx < 0 ? -2 : 0), py, pz), 0.05));
  });

  return null;
}
