'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { useInput } from '@/contexts/InputContext';
import { CHARACTERS } from '@/lib/characters';
import { isWalkable, PLAZA_SPAWN } from '@/lib/town';
import { getSocket } from '@/lib/net';
import { useTownStore } from '@/store/townStore';
import { isPressed } from '@/lib/controls';
import { CharacterModel } from '../game/characters/CharacterModel';
import { NameTag } from './NameTag';

const SPEED = 6;
const SEND_RATE = 1 / 8;

// Posição do personagem local e destino do clique (lidos pela câmera e pelo chão)
export const townAvatar = {
  position: { x: PLAZA_SPAWN.x, z: PLAZA_SPAWN.z },
  target: null as { x: number; z: number } | null,
};

// Personagem do jogador na cidade: anda com clique/toque no chão (estilo Ragnarok) ou teclado
export function TownAvatar() {
  const me = useTownStore((s) => s.me);
  const myId = getSocket().id ?? 'me';
  const group = useRef<Group>(null);
  const { keys } = useInput();
  const [moving, setMoving] = useState(false);
  const rot = useRef(0);
  const sendTimer = useRef(0);
  const wasMoving = useRef(false);

  useEffect(() => {
    townAvatar.target = null;
  }, []);

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g || !me) return;
    const delta = Math.min(rawDelta, 1 / 20);
    const k = keys.current;
    // Não anda enquanto digita no chat
    const typing = typeof document !== 'undefined' && document.activeElement?.tagName === 'INPUT';

    // Teclado relativo à câmera
    let ix = 0;
    let iz = 0;
    if (!typing) {
      if (isPressed(k, 'solo', 'left')) ix -= 1;
      if (isPressed(k, 'solo', 'right')) ix += 1;
      if (isPressed(k, 'solo', 'jump')) iz -= 1;
      if (isPressed(k, 'solo', 'crouch')) iz += 1;
    }
    let mx = 0;
    let mz = 0;
    if (ix || iz) {
      townAvatar.target = null;
      const yaw = Math.atan2(state.camera.position.x - townAvatar.position.x, state.camera.position.z - townAvatar.position.z);
      const len = Math.hypot(ix, iz);
      mx = ((ix * Math.cos(yaw) + iz * Math.sin(yaw)) / len) * SPEED * delta;
      mz = ((-ix * Math.sin(yaw) + iz * Math.cos(yaw)) / len) * SPEED * delta;
    } else if (townAvatar.target) {
      const dx = townAvatar.target.x - townAvatar.position.x;
      const dz = townAvatar.target.z - townAvatar.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.15) townAvatar.target = null;
      else {
        const step = Math.min(dist, SPEED * delta);
        mx = (dx / dist) * step;
        mz = (dz / dist) * step;
      }
    }

    const p = townAvatar.position;
    // Desliza pelas paredes dos prédios
    if (mx && isWalkable(p.x + mx, p.z)) p.x += mx;
    else if (mx) townAvatar.target = null;
    if (mz && isWalkable(p.x, p.z + mz)) p.z += mz;
    else if (mz) townAvatar.target = null;

    const isMoving = !!(mx || mz);
    if (isMoving) rot.current = Math.atan2(mx, mz);
    g.position.set(p.x, 0.1, p.z);
    g.rotation.y = rot.current;
    if (isMoving !== moving) setMoving(isMoving);

    // Envia a posição para quem está online (mais rápido enquanto anda)
    sendTimer.current += delta;
    if ((isMoving && sendTimer.current > SEND_RATE) || (wasMoving.current && !isMoving) || sendTimer.current > 2) {
      sendTimer.current = 0;
      const socket = getSocket();
      if (socket.connected) socket.emit('town:move', { x: p.x, z: p.z, rot: rot.current, anim: isMoving ? 'Running_A' : 'Idle' });
    }
    wasMoving.current = isMoving;
  });

  if (!me) return null;
  const c = CHARACTERS[me.character];
  return (
    <group ref={group} position={[townAvatar.position.x, 0.1, townAvatar.position.z]}>
      {/* O modelo já olha para +X; gira para olhar para +Z, que é a frente no mapa */}
      <group rotation={[0, -Math.PI / 2, 0]}>
        <CharacterModel model={c.model} animation={moving ? 'Running_A' : 'Idle'} accessories={c.gear} facing={1} height={c.height * 1.4} />
      </group>
      <NameTag id={myId} name={me.name} height={c.height * 1.4} self />
    </group>
  );
}
