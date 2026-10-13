'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { players } from '@/lib/gameRuntime';
import { useGameStore } from '@/store/gameStore';

// Distâncias (com folga) para dividir e juntar a tela
const SPLIT_AT = 15;
const MERGE_AT = 10;

interface SplitScreenProps {
  bounds: [number, number];
  onSplitChange: (count: number) => void;
}

// Quando os jogadores deste aparelho se afastam, cada um ganha sua parte da tela:
// 2 lado a lado, 3 ou 4 em quadrantes. Ao se reaproximarem volta a ser uma tela só.
export function SplitScreen({ bounds, onSplitChange }: SplitScreenProps) {
  const { gl, scene, size } = useThree();
  const split = useRef(0);
  const cameras = useMemo(() => Array.from({ length: 4 }, () => new THREE.PerspectiveCamera(60, 1, 0.1, 500)), []);
  const looks = useMemo(() => cameras.map(() => new THREE.Vector3()), [cameras]);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => () => onSplitChange(0), [onSplitChange]);

  useFrame((_, delta) => {
    const local = [...players.values()].filter((p) => p.local);
    const lock = useGameStore.getState().screenLock;
    let spread = 0;
    if (local.length > 1) {
      const xs = local.map((p) => p.position.x);
      const ys = local.map((p) => p.position.y);
      spread = Math.max(Math.max(...xs) - Math.min(...xs), (Math.max(...ys) - Math.min(...ys)) * 1.5);
    }
    const shouldSplit = !lock && local.length > 1 && (split.current ? spread > MERGE_AT : spread > SPLIT_AT);
    const next = shouldSplit ? local.length : 0;
    if (next !== split.current) {
      // Ao dividir, cada câmera começa perto do seu jogador
      if (next) local.forEach((p, i) => cameras[i].position.set(p.position.x, p.position.y + 2, 9));
      split.current = next;
      onSplitChange(next);
    }
    if (!split.current) return;

    // Cada jogador tem sua própria câmera lateral
    const t = 1 - Math.pow(0.02, delta);
    local.forEach((p, i) => {
      const cam = cameras[i];
      const cx = THREE.MathUtils.clamp(p.position.x + THREE.MathUtils.clamp(p.velocity.x * 0.4, -2, 2), bounds[0], bounds[1]);
      cam.position.lerp(tmp.set(cx, p.position.y + 2, 9), t);
      looks[i].lerp(tmp.set(cx, p.position.y + 1, 0), t);
      cam.lookAt(looks[i]);
    });

    // Desenha cada parte da tela com sua câmera
    const n = split.current;
    const cols = 2;
    const rows = n === 2 ? 1 : 2;
    const w = size.width / cols;
    const h = size.height / rows;
    gl.autoClear = false;
    gl.setScissorTest(true);
    gl.clear();
    for (let i = 0; i < n; i++) {
      const col = i % cols;
      const row = rows - 1 - Math.floor(i / cols);
      const cam = cameras[i];
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      gl.setViewport(col * w, row * h, w, h);
      gl.setScissor(col * w, row * h, w, h);
      gl.clear();
      gl.render(scene, cam);
    }
    gl.setScissorTest(false);
    gl.setViewport(0, 0, size.width, size.height);
    gl.autoClear = true;
  }, 1);

  return null;
}
