'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { MOUSE, TOUCH, Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { townAvatar } from './TownAvatar';

// Câmera de cima estilo Ragnarok que acompanha o personagem.
// Gestos: arrastar gira, pinça/roda dá zoom, dois dedos/botão direito movem a câmera.
export function TownCamera({ recenter }: { recenter: number }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera);
  const last = useRef(new Vector3());

  // Posição inicial e botão "recentralizar"
  useEffect(() => {
    const p = townAvatar.position;
    camera.position.set(p.x, 20, p.z + 16);
    controls.current?.target.set(p.x, 0.5, p.z);
    last.current.set(p.x, 0, p.z);
    controls.current?.update();
  }, [camera, recenter]);

  // Quando o personagem anda, câmera e alvo andam junto (mantendo o giro/zoom/deslocamento do jogador)
  useFrame(() => {
    const c = controls.current;
    if (!c) return;
    const p = townAvatar.position;
    const dx = p.x - last.current.x;
    const dz = p.z - last.current.z;
    if (dx || dz) {
      c.target.x += dx;
      c.target.z += dz;
      camera.position.x += dx;
      camera.position.z += dz;
      last.current.set(p.x, 0, p.z);
    }
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.12}
      minDistance={7}
      maxDistance={50}
      minPolarAngle={0.35}
      maxPolarAngle={1.25}
      screenSpacePanning={false}
      mouseButtons={{ LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }}
      touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
    />
  );
}
