'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Clone, Sparkles, useGLTF } from '@react-three/drei';
import { Group } from 'three';
import { TILE, TOWN_CELLS, TOWN_SIZE, cellCenter } from '@/lib/town';

const city = (name: string) => `/assets/city/${name}.gltf`;
const SCALE = TILE / 2;

function Piece({ name, position, rot = 0, scale = SCALE }: { name: string; position: [number, number, number]; rot?: number; scale?: number }) {
  const { scene } = useGLTF(city(name));
  return <Clone object={scene} position={position} rotation={[0, (rot * Math.PI) / 2, 0]} scale={scale} castShadow receiveShadow />;
}

function Tree({ position, scale = 2.5 }: { position: [number, number, number]; scale?: number }) {
  const { scene } = useGLTF('/assets/scenery/tree_single_A.gltf');
  return <Clone object={scene} position={position} scale={scale} castShadow />;
}

// Chafariz da pracinha com água brilhando
function Fountain() {
  return (
    <group position={[0, 0.3, 0]}>
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[2.6, 2.9, 0.6, 32]} />
        <meshStandardMaterial color="#E7E5E4" />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[2.3, 2.3, 0.1, 32]} />
        <meshStandardMaterial color="#38BDF8" emissive="#0EA5E9" emissiveIntensity={0.4} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 1.6, 16]} />
        <meshStandardMaterial color="#D6D3D1" />
      </mesh>
      <Sparkles count={50} scale={[1.6, 2.5, 1.6]} position={[0, 2, 0]} size={8} speed={1.5} color="#BAE6FD" />
    </group>
  );
}

// Carrinhos dando voltas no quarteirão
function Car({ name, offset, speed }: { name: string; offset: number; speed: number }) {
  const ref = useRef<Group>(null);
  const loop = useMemo(() => {
    const a = cellCenter(2) + 1.2;
    const b = cellCenter(6) - 1.2;
    return [
      [a, a],
      [b, a],
      [b, b],
      [a, b],
    ] as [number, number][];
  }, []);
  const perimeter = 4 * (loop[1][0] - loop[0][0]);

  useFrame((state) => {
    if (!ref.current) return;
    const side = perimeter / 4;
    const d = ((state.clock.elapsedTime * speed + offset) % perimeter + perimeter) % perimeter;
    const k = Math.floor(d / side);
    const f = (d % side) / side;
    const [x0, z0] = loop[k];
    const [x1, z1] = loop[(k + 1) % 4];
    ref.current.position.set(x0 + (x1 - x0) * f, 0.1, z0 + (z1 - z0) * f);
    ref.current.rotation.y = Math.atan2(x1 - x0, z1 - z0);
  });

  return (
    <group ref={ref}>
      <Piece name={name} position={[0, 0, 0]} scale={SCALE * 1.3} />
    </group>
  );
}

export function TownMap() {
  const half = (TOWN_SIZE * TILE) / 2;
  return (
    <group>
      {/* Gramado em volta da cidade */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[half * 6, half * 6]} />
        <meshStandardMaterial color="#86D96B" />
      </mesh>

      {TOWN_CELLS.map((c) => (
        <group key={`${c.i}-${c.j}`}>
          {c.kind !== 'plaza' && c.kind !== 'park' && <Piece name={c.kind === 'building' ? 'base' : c.piece} position={[c.x, 0, c.z]} rot={c.rot} />}
          {c.kind === 'building' && <Piece name={c.piece} position={[c.x, 0.3, c.z]} rot={c.rot} scale={SCALE * 0.75} />}
          {(c.kind === 'plaza' || c.kind === 'park') && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[c.x, 0.02, c.z]} receiveShadow>
              <planeGeometry args={[TILE, TILE]} />
              <meshStandardMaterial color={c.kind === 'plaza' ? '#A3E635' : '#4ADE80'} />
            </mesh>
          )}
          {c.kind === 'park' && (
            <>
              <Tree position={[c.x - 1.2, 0, c.z - 1]} />
              <Tree position={[c.x + 1.4, 0, c.z + 1]} scale={2} />
              <Piece name="bush" position={[c.x, 0, c.z + 2]} scale={SCALE * 1.2} />
            </>
          )}
          {c.kind === 'junction' && <Piece name="streetlight" position={[c.x + 2.6, 0, c.z + 2.6]} />}
        </group>
      ))}

      {/* Pracinha: chafariz, bancos, árvores e arbustos */}
      <Fountain />
      {[
        [-5, -5],
        [5, -5],
        [-5, 5],
        [5, 5],
      ].map(([x, z]) => (
        <Tree key={`t${x}${z}`} position={[x, 0, z]} />
      ))}
      {[
        [0, -6, 0],
        [0, 6, 2],
        [-6, 0, 1],
        [6, 0, 3],
      ].map(([x, z, r]) => (
        <Piece key={`b${x}${z}`} name="bench" position={[x, 0, z]} rot={r} scale={SCALE * 1.6} />
      ))}
      <Piece name="watertower" position={[cellCenter(8), 0, cellCenter(0)]} scale={SCALE * 1.2} />

      <Car name="car_taxi" offset={0} speed={4} />
      <Car name="car_police" offset={30} speed={4.5} />
      <Car name="car_sedan" offset={60} speed={3.5} />
    </group>
  );
}

['base', 'bench', 'bush', 'car_police', 'car_sedan', 'car_taxi', 'road_junction', 'road_straight', 'road_straight_crossing', 'streetlight', 'watertower', ...Array.from('ABCDEFGH', (l) => `building_${l}`)].forEach((n) =>
  useGLTF.preload(city(n))
);
