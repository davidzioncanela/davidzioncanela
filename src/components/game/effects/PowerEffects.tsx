'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { AdditiveBlending, Group, Mesh, MeshBasicMaterial } from 'three';
import type { PowerUpType } from '@/store/gameStore';
import type { HelpPowerId } from '@/lib/characters';

export const POWER_COLORS: Record<PowerUpType, string> = {
  laser: '#22D3EE',
  'super-speed': '#FACC15',
  float: '#A5B4FC',
  'fire-ball': '#F97316',
  'super-jump': '#4ADE80',
};

const HELP_COLORS: Record<HelpPowerId, string> = {
  escudo: '#60A5FA',
  coragem: '#F43F5E',
  lancamento: '#FBBF24',
  cura: '#F472B6',
};

// Aura permanente enquanto o power-up está ativo: brilho, anéis girando, faíscas e luz
export function PowerAura({ powerUp, height, shielded }: { powerUp: PowerUpType | null; height: number; shielded: boolean }) {
  const ring1 = useRef<Mesh>(null);
  const ring2 = useRef<Mesh>(null);
  const glow = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1.current) ring1.current.rotation.z = t * 3;
    if (ring2.current) ring2.current.rotation.z = -t * 2;
    if (glow.current) glow.current.scale.setScalar(1 + Math.sin(t * 6) * 0.08);
  });

  return (
    <>
      {powerUp && (
        <group position={[0, height / 2, 0]}>
          <mesh ref={glow}>
            <sphereGeometry args={[height * 0.75, 24, 24]} />
            <meshBasicMaterial color={POWER_COLORS[powerUp]} transparent opacity={0.18} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]} position={[0, -height / 2 + 0.05, 0]}>
            <torusGeometry args={[0.6, 0.04, 8, 48]} />
            <meshBasicMaterial color={POWER_COLORS[powerUp]} toneMapped={false} />
          </mesh>
          <mesh ref={ring2} rotation={[Math.PI / 2.4, 0.3, 0]}>
            <torusGeometry args={[0.7, 0.025, 8, 48]} />
            <meshBasicMaterial color={POWER_COLORS[powerUp]} toneMapped={false} transparent opacity={0.8} />
          </mesh>
          <Sparkles count={40} scale={[1.6, height * 1.6, 1.6]} size={6} speed={1.5} color={POWER_COLORS[powerUp]} />
          <pointLight color={POWER_COLORS[powerUp]} intensity={4} distance={4} />
        </group>
      )}
      {shielded && (
        <mesh position={[0, height / 2, 0]}>
          <icosahedronGeometry args={[height * 0.8, 1]} />
          <meshBasicMaterial color="#60A5FA" wireframe transparent opacity={0.7} toneMapped={false} />
        </mesh>
      )}
    </>
  );
}

// Explosão temporária ao usar o poder de ajuda: onda de choque + faíscas
export function HelpBurst({ trigger, power }: { trigger: number; power: HelpPowerId }) {
  return trigger > 0 ? <Burst key={trigger} color={HELP_COLORS[power]} radius={4} /> : null;
}

// Onda de choque que se expande e some (usada na coleta de power-ups e nos poderes de ajuda)
export function Burst({ color, radius = 3, duration = 1.2 }: { color: string; radius?: number; duration?: number }) {
  const group = useRef<Group>(null);
  const age = useRef(0);
  const [done, setDone] = useState(false);

  useFrame((_, delta) => {
    if (done || !group.current) return;
    age.current += delta;
    const k = Math.min(1, age.current / duration);
    group.current.scale.setScalar(0.2 + k * radius);
    group.current.children.forEach((child) => {
      const mat = (child as Mesh).material as MeshBasicMaterial | undefined;
      if (mat) mat.opacity = 1 - k;
    });
    if (k >= 1) setDone(true);
  });

  if (done) return null;

  return (
    <group ref={group} position={[0, 0.8, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.08, 8, 48]} />
        <meshBasicMaterial color={color} transparent toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.8, 24, 24]} />
        <meshBasicMaterial color={color} transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <Sparkles count={60} scale={2.5} size={10} speed={3} color={color} />
    </group>
  );
}
