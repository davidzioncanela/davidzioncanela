'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { GameState } from './GameCanvas';
import { playerSpan, players } from '@/lib/gameRuntime';
import { useGameStore } from '@/store/gameStore';

interface CameraControllerProps {
  gameState: GameState;
  // Limites horizontais da fase (restrição de avanço de tela)
  bounds: [number, number];
}

// Câmera lateral estilo Metal Slug: enquadra os jogadores deste aparelho,
// olha à frente, trava na arena durante as hordas e aproxima nos diálogos
export function CameraController({ gameState, bounds }: CameraControllerProps) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const target = useRef(new THREE.Vector3(-12, 14, 12));
  const lookAt = useRef(new THREE.Vector3(-12, 12, 0));
  const desiredLook = useRef(new THREE.Vector3());
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') (window as unknown as { __camera: THREE.Camera }).__camera = camera;

  useFrame((_, delta) => {
    const span = playerSpan(true);
    if (!span) return;
    const lock = useGameStore.getState().screenLock;

    let vx = 0;
    players.forEach((p) => {
      if (p.local) vx += p.velocity.x;
    });
    const lookAhead = THREE.MathUtils.clamp(vx * 0.4, -2.5, 2.5);
    const spread = span.maxX - span.minX;

    let cx = THREE.MathUtils.clamp(span.centerX + lookAhead, bounds[0], bounds[1]);
    let distance = 9 + spread * 0.55;
    let height = 2;
    if (lock) {
      // Na horda a câmera mostra a arena inteira
      cx = (lock[0] + lock[1]) / 2;
      distance = Math.max(9, (lock[1] - lock[0]) * 0.8);
      height = 3;
    } else if (gameState === 'dialog') {
      distance = 8;
    }

    // Tela em pé (celular): afasta a câmera para caber a mesma largura de cena
    const aspect = size.width / Math.max(1, size.height);
    distance *= THREE.MathUtils.clamp(1.3 / aspect, 1, 2.2);

    target.current.set(cx, span.avgY + height, distance);
    const t = 1 - Math.pow(0.02, delta);
    camera.position.lerp(target.current, t);
    lookAt.current.lerp(desiredLook.current.set(cx, span.avgY + 1, 0), t);
    camera.lookAt(lookAt.current);
  });

  return null;
}
