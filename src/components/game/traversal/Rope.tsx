'use client';

import { createRef, useEffect, useMemo, RefObject } from 'react';
import { RigidBody, BallCollider, RapierRigidBody, useSphericalJoint } from '@react-three/rapier';
import { ropes } from '@/lib/traversal';

interface RopeProps {
  id: string;
  anchor: [number, number];
  segments?: number;
  segmentLength?: number;
}

function Link({ a, b, half }: { a: RefObject<RapierRigidBody>; b: RefObject<RapierRigidBody>; half: number }) {
  useSphericalJoint(a, b, [
    [0, -half, 0],
    [0, half, 0],
  ]);
  return null;
}

// Corda pendurada com física real (segmentos ligados por juntas esféricas).
// O jogador se agarra num segmento e empurra a corda para balançar.
export function Rope({ id, anchor, segments = 9, segmentLength = 0.7 }: RopeProps) {
  const half = segmentLength / 2;
  const refs = useMemo(() => Array.from({ length: segments + 1 }, () => createRef<RapierRigidBody>()), [segments]);

  useEffect(() => {
    // Espera os corpos existirem antes de registrar
    const t = setTimeout(() => {
      const bodies = refs.slice(1).map((r) => r.current).filter(Boolean) as RapierRigidBody[];
      ropes.set(id, { id, segments: bodies, segmentLength });
    }, 0);
    return () => {
      clearTimeout(t);
      ropes.delete(id);
    };
  }, [id, refs, segmentLength]);

  return (
    <group>
      {/* Ponto fixo no alto (galho/viga) */}
      <RigidBody ref={refs[0]} type="fixed" position={[anchor[0], anchor[1] + half, 0]} colliders={false}>
        <mesh>
          <boxGeometry args={[1.2, 0.3, 0.6]} />
          <meshStandardMaterial color="#7C4A1E" />
        </mesh>
      </RigidBody>
      {refs.slice(1).map((ref, i) => (
        <RigidBody
          key={i}
          ref={ref}
          position={[anchor[0], anchor[1] - i * segmentLength - half, 0]}
          colliders={false}
          enabledTranslations={[true, true, false]}
          linearDamping={0.3}
          angularDamping={0.6}
        >
          {/* Sensor: a corda não empurra ninguém, só serve para agarrar */}
          <BallCollider args={[0.12]} sensor mass={0.3} />
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.07, segmentLength, 6]} />
            <meshStandardMaterial color={i % 2 ? '#D6A35C' : '#C08A45'} />
          </mesh>
        </RigidBody>
      ))}
      {refs.slice(1).map((ref, i) => (
        <Link key={i} a={refs[i]} b={ref} half={half} />
      ))}
    </group>
  );
}
