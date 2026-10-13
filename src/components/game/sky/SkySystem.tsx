'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, DirectionalLight } from 'three';

export function SkySystem() {
  const sunRef = useRef<Mesh>(null);
  const dirLightRef = useRef<DirectionalLight>(null);
  const cloud1Ref = useRef<Mesh>(null);
  const cloud2Ref = useRef<Mesh>(null);
  const cloud3Ref = useRef<Mesh>(null);
  const cycleDuration = 1440;
  // Começa ao meio-dia para a cena iniciar bem iluminada
  const time = useRef(cycleDuration / 4);

  useFrame((state, delta) => {
    time.current += delta;
    if (time.current > cycleDuration) time.current -= cycleDuration;
    const t = (time.current / cycleDuration) * Math.PI * 2;

    if (sunRef.current) {
      const x = Math.cos(t) * 40;
      const y = Math.sin(t) * 30 + 15;
      sunRef.current.position.set(x, y > -2 ? y : -2, -60);
    }
    if (dirLightRef.current) {
      const intensity = Math.max(0.15, Math.sin(t));
      dirLightRef.current.intensity = intensity;
      const pos = sunRef.current?.position;
      if (pos) dirLightRef.current.position.set(pos.x + 5, pos.y + 5, pos.z + 10);
    }
    if (cloud1Ref.current) cloud1Ref.current.position.x = (cloud1Ref.current.position.x + delta * 0.5 + 80) % 160 - 80;
    if (cloud2Ref.current) cloud2Ref.current.position.x = (cloud2Ref.current.position.x + delta * 0.3 + 80) % 160 - 80;
    if (cloud3Ref.current) cloud3Ref.current.position.x = (cloud3Ref.current.position.x + delta * 0.4 + 80) % 160 - 80;
  });

  return (
    <group>
      <directionalLight ref={dirLightRef} position={[20, 30, 10]} intensity={1} castShadow />
      <mesh ref={sunRef} position={[20, 30, -60]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial color="#FFF3B0" />
      </mesh>
      <mesh ref={cloud1Ref} position={[-30, 25, -50]}>
        <sphereGeometry args={[3, 12, 8]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85} />
      </mesh>
      <mesh ref={cloud2Ref} position={[10, 22, -48]}>
        <sphereGeometry args={[2.5, 12, 8]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85} />
      </mesh>
      <mesh ref={cloud3Ref} position={[40, 28, -52]}>
        <sphereGeometry args={[2.8, 12, 8]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}
