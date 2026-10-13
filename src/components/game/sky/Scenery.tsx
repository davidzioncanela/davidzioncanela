'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Clone, Sparkles, useGLTF } from '@react-three/drei';
import { AdditiveBlending, BackSide, Color, Group, Mesh, MeshStandardMaterial } from 'three';

// Peças do KayKit Medieval Hexagon Pack (CC0) - ver public/assets/scenery/LICENSE-KayKit.txt
const S = (name: string) => `/assets/scenery/${name}.gltf`;
const PIECES = {
  cloudBig: S('cloud_big'),
  cloudSmall: S('cloud_small'),
  mountainA: S('mountain_A_grass_trees'),
  mountainB: S('mountain_B_grass_trees'),
  mountainC: S('mountain_C_grass'),
  hillsA: S('hills_A_trees'),
  hillsB: S('hills_B_trees'),
  hillsC: S('hills_C_trees'),
  treesA: S('trees_A_large'),
  treesB: S('trees_B_large'),
  treesM: S('trees_A_medium'),
  treeA: S('tree_single_A'),
  treeB: S('tree_single_B'),
  rockA: S('rock_single_A'),
  castle: S('building_castle_blue'),
  windmill: S('building_windmill_green'),
  watermill: S('building_watermill_green'),
};
type Piece = keyof typeof PIECES;

// Nuvens do pacote vêm acinzentadas: deixa branquinhas e levemente luminosas
export function useWhiteCloud(url: string) {
  const { scene } = useGLTF(url);
  useMemo(() => {
    scene.traverse((o) => {
      const m = (o as Mesh).material as MeshStandardMaterial | undefined;
      if (m && !m.userData.white) {
        m.userData.white = true;
        m.map = null;
        m.color.set('#FFFFFF');
        m.emissive.set('#DCEFFF');
        m.emissiveIntensity = 0.35;
        m.needsUpdate = true;
      }
    });
  }, [scene]);
  return scene;
}

function Prop({ piece, position, scale = 1, rotation = 0 }: { piece: Piece; position: [number, number, number]; scale?: number; rotation?: number }) {
  const { scene } = useGLTF(PIECES[piece]);
  return <Clone object={scene} position={position} scale={scale} rotation={[0, rotation, 0]} />;
}

// Gerador simples e determinístico para espalhar o cenário sempre igual
function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

// Céu em degradê: azul no alto, rosa claro no horizonte
function SkyDome() {
  const uniforms = useMemo(() => ({ top: { value: new Color('#38BDF8') }, bottom: { value: new Color('#FDE2F3') } }), []);
  return (
    <mesh scale={400}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial
        side={BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader="varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }"
        fragmentShader="uniform vec3 top; uniform vec3 bottom; varying vec3 vPos; void main(){ float h = clamp(vPos.y * 1.6 + 0.25, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, h), 1.0); }"
      />
    </mesh>
  );
}

// Sol com brilho pulsante e raios girando (o bloom faz o resto)
function Sun() {
  const rays = useRef<Group>(null);
  const halo = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (rays.current) rays.current.rotation.z += delta * 0.15;
    if (halo.current) halo.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.06);
  });
  return (
    <group position={[40, 38, -140]}>
      <mesh>
        <circleGeometry args={[9, 48]} />
        <meshBasicMaterial color="#FFF7AE" toneMapped={false} />
      </mesh>
      <mesh ref={halo} position={[0, 0, -0.5]}>
        <circleGeometry args={[16, 48]} />
        <meshBasicMaterial color="#FDE68A" transparent opacity={0.35} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <group ref={rays} position={[0, 0, -1]}>
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i} rotation={[0, 0, (i / 12) * Math.PI * 2]} position={[0, 0, 0]}>
            <planeGeometry args={[2.2, 48]} />
            <meshBasicMaterial color="#FEF3C7" transparent opacity={0.18} blending={AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

const RAINBOW = ['#FF5E5E', '#FFA552', '#FFE066', '#7BE07B', '#5CC8FF', '#7B8CFF', '#C77DFF'];

function Rainbow() {
  return (
    <group position={[10, -25, -170]}>
      {RAINBOW.map((c, i) => (
        <mesh key={c}>
          <torusGeometry args={[80 - i * 2.4, 1.2, 8, 96, Math.PI]} />
          <meshBasicMaterial color={c} transparent opacity={0.45} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// Nuvens que passeiam devagar pelo fundo
function DriftingClouds({ from, to }: { from: number; to: number }) {
  const group = useRef<Group>(null);
  useWhiteCloud(PIECES.cloudBig);
  useWhiteCloud(PIECES.cloudSmall);
  const clouds = useMemo(() => {
    const rnd = seeded(7);
    return Array.from({ length: 26 }, () => ({
      x: from + rnd() * (to - from),
      y: 4 + rnd() * 26,
      z: -18 - rnd() * 70,
      s: 2 + rnd() * 4,
      speed: 0.3 + rnd() * 0.8,
      big: rnd() > 0.4,
    }));
  }, [from, to]);

  useFrame((_, delta) => {
    group.current?.children.forEach((child, i) => {
      child.position.x += clouds[i].speed * delta;
      if (child.position.x > to + 20) child.position.x = from - 20;
    });
  });

  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]}>
          <Prop piece={c.big ? 'cloudBig' : 'cloudSmall'} position={[0, 0, 0]} scale={c.s} />
        </group>
      ))}
    </group>
  );
}

// Cenário lúdico em camadas (parallax natural da câmera perspectiva)
// skyOnly: só céu, sol, arco-íris e nuvens (usado na cidade)
export function Scenery({ from = -60, to = 140, skyOnly = false, groundY = -6 }: { from?: number; to?: number; skyOnly?: boolean; groundY?: number }) {
  const layers = useMemo(() => {
    // groundY: altura do chão de fundo (alinhada com a base dos blocos de terra das fases)
    const rnd = seeded(42);
    const far: { piece: Piece; x: number; s: number; r: number }[] = [];
    for (let x = from; x < to; x += 16 + rnd() * 10) far.push({ piece: (['mountainA', 'mountainB', 'mountainC'] as Piece[])[Math.floor(rnd() * 3)], x, s: 9 + rnd() * 6, r: rnd() * 6 });
    const mid: typeof far = [];
    for (let x = from; x < to; x += 9 + rnd() * 6) mid.push({ piece: (['hillsA', 'hillsB', 'hillsC'] as Piece[])[Math.floor(rnd() * 3)], x, s: 4 + rnd() * 2.5, r: rnd() * 6 });
    const near: typeof far = [];
    for (let x = from; x < to; x += 5 + rnd() * 4) near.push({ piece: (['treesA', 'treesB', 'treesM', 'treeA', 'treeB', 'rockA'] as Piece[])[Math.floor(rnd() * 6)], x, s: 3 + rnd() * 2, r: rnd() * 6 });
    return { far, mid, near };
  }, [from, to]);

  if (skyOnly)
    return (
      <group>
        <SkyDome />
        <Sun />
        <Rainbow />
        <group position={[0, 20, 0]}>
          <DriftingClouds from={from} to={to} />
        </group>
      </group>
    );

  return (
    <group>
      <SkyDome />
      <Sun />
      <Rainbow />
      {/* Chão lá embaixo, visto de cima das nuvens */}
      {/* Só atrás da cena (z < -3), para não tampar o que fica abaixo do chão, como os canos */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, groundY, -73]} receiveShadow>
        <planeGeometry args={[600, 140]} />
        <meshStandardMaterial color="#7ED957" />
      </mesh>
      {layers.far.map((p, i) => (
        <Prop key={`f${i}`} piece={p.piece} position={[p.x, groundY, -110]} scale={p.s} rotation={p.r} />
      ))}
      {layers.mid.map((p, i) => (
        <Prop key={`m${i}`} piece={p.piece} position={[p.x, groundY, -60]} scale={p.s} rotation={p.r} />
      ))}
      {layers.near.map((p, i) => (
        <Prop key={`n${i}`} piece={p.piece} position={[p.x, groundY, -22 - (i % 3) * 4]} scale={p.s} rotation={p.r} />
      ))}
      {/* Castelo do Bowser Jr. no fim da fase e moinhos pelo caminho */}
      <Prop piece="castle" position={[92, groundY, -30]} scale={9} />
      <Prop piece="windmill" position={[20, groundY, -38]} scale={7} />
      <Prop piece="watermill" position={[55, groundY, -34]} scale={6} rotation={1} />
      <DriftingClouds from={from} to={to} />
      {/* Poeira mágica flutuando pelo céu */}
      <Sparkles count={160} scale={[200, 40, 40]} position={[40, 10, -20]} size={6} speed={0.4} color="#FFF7AE" opacity={0.8} />
      <Sparkles count={60} scale={[200, 30, 10]} position={[40, 6, -6]} size={10} speed={0.3} color="#F9A8D4" opacity={0.6} />
    </group>
  );
}

Object.values(PIECES).forEach((url) => useGLTF.preload(url));
