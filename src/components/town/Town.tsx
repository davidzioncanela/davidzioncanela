'use client';

import { useRef } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { isWalkable } from '@/lib/town';
import { Scenery } from '../game/sky/Scenery';
import { TownMap } from './TownMap';
import { TownAvatar, townAvatar } from './TownAvatar';
import { TownPeople } from './TownPeople';
import { TownNPCs } from './TownNPCs';
import { TownCamera } from './TownCamera';

const TAP_PIXELS = 8;

// Cidade em mundo aberto (menu principal): toque/clique rápido no chão anda até o ponto;
// arrastar fica para a câmera (girar, zoom e mover)
export function Town({ recenter }: { recenter: number }) {
  const down = useRef<{ x: number; y: number } | null>(null);

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    down.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
  };
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    const d = down.current;
    down.current = null;
    if (!d || Math.hypot(e.nativeEvent.clientX - d.x, e.nativeEvent.clientY - d.y) > TAP_PIXELS) return;
    if (isWalkable(e.point.x, e.point.z)) townAvatar.target = { x: e.point.x, z: e.point.z };
  };

  return (
    <group>
      <ambientLight intensity={0.7} />
      <hemisphereLight args={['#E0F2FE', '#86EFAC', 0.6]} />
      <directionalLight
        position={[20, 35, 15]}
        intensity={1.6}
        color="#FFF4D6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
      />
      <Scenery skyOnly from={-80} to={80} />
      <TownMap />
      {/* Chão invisível que recebe os toques para andar */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} onPointerDown={onDown} onPointerUp={onUp}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <TownAvatar />
      <TownPeople />
      <TownNPCs />
      <TownCamera recenter={recenter} />
    </group>
  );
}
