'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { GameState } from './GameCanvas';
import { playerRuntime } from '@/lib/gameRuntime';

interface CameraControllerProps {
  gameState: GameState;
}

// Limites horizontais da fase (restrição de avanço de tela)
const MIN_X = -12;
const MAX_X = 54;

// Câmera lateral estilo Metal Slug: segue o jogador, olha à frente e aproxima em diálogo/duelo
export function CameraController({ gameState }: CameraControllerProps) {
  const camera = useThree((state) => state.camera);
  const target = useRef(new THREE.Vector3(-12, 14, 12));
  const lookAt = useRef(new THREE.Vector3(-12, 12, 0));

  useFrame((_, delta) => {
    const { x: px, y: py } = playerRuntime.position;
    const vx = playerRuntime.velocity.x;
    const lookAhead = THREE.MathUtils.clamp(vx * 0.4, -2.5, 2.5);
    const cx = THREE.MathUtils.clamp(px + lookAhead, MIN_X, MAX_X);

    let distance = 9;
    let height = 2;
    if (gameState === 'duel') {
      distance = 7.5;
      height = 1.8;
    } else if (gameState === 'dialog') {
      distance = 8;
      height = 2;
    }

    target.current.set(cx, py + height, distance);
    const t = 1 - Math.pow(0.02, delta);
    camera.position.lerp(target.current, t);
    lookAt.current.lerp(new THREE.Vector3(cx, py + 1, 0), t);
    camera.lookAt(lookAt.current);
  });

  return null;
}
