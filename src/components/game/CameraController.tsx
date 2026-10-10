'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { GameState } from './GameCanvas';

interface CameraControllerProps {
  gameState: GameState;
}

export function CameraController({ gameState }: CameraControllerProps) {
  const camera = useThree((state) => state.camera);
  const targetPosition = useRef(new THREE.Vector3(0, 5, 10));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    // Metal Slug style - smooth camera following
    camera.position.lerp(targetPosition.current, 0.1);
    camera.lookAt(targetLookAt.current);
  });

  return null;
}
