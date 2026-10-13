'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { DoubleSide, Group, Quaternion, Vector3 } from 'three';
import { pipes } from '@/lib/traversal';
import { generateMaze, type MazeEdge, type MazeNode, type MazeReward } from '@/lib/pipeMaze';
import { useGameStore } from '@/store/gameStore';
import { POWER_COLORS } from '../effects/PowerEffects';

const RADIUS = 0.75;
const UP = new Vector3(0, 1, 0);

interface PipeMazeProps {
  id: string;
  origin: [number, number];
  cols: number;
  rows: number;
  entranceY: number;
  exitY: number;
  seed: number;
}

// Pedaço de cano "fatiado" (raio-X): só a metade de trás aparece, a frente é cortada
function PipeSegment({ a, b, kind }: { a: MazeNode; b: MazeNode; kind: MazeEdge['kind'] }) {
  const { mid, quat, len } = useMemo(() => {
    const va = new Vector3(a.x, a.y, 0);
    const vb = new Vector3(b.x, b.y, 0);
    const dir = vb.clone().sub(va);
    return { mid: va.clone().add(vb).multiplyScalar(0.5), quat: new Quaternion().setFromUnitVectors(UP, dir.clone().normalize()), len: dir.length() };
  }, [a, b]);

  return (
    <group position={mid} quaternion={quat}>
      {/* Metade de trás do cano (theta de 90° a 270° fica atrás, z < 0) */}
      <mesh>
        <cylinderGeometry args={[RADIUS, RADIUS, len, 20, 1, true, Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#22C55E" side={DoubleSide} roughness={0.5} />
      </mesh>
      {/* Bordas do corte, bem claras, para dar a ideia de fatia */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * RADIUS, 0, 0]}>
          <boxGeometry args={[0.08, len, 0.08]} />
          <meshBasicMaterial color="#BBF7D0" toneMapped={false} />
        </mesh>
      ))}
      {kind === 'escada' &&
        Array.from({ length: Math.max(1, Math.floor(len / 0.5)) }, (_, i) => (
          <mesh key={i} position={[0, -len / 2 + 0.25 + i * 0.5, -RADIUS * 0.6]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, RADIUS * 1.3, 6]} />
            <meshStandardMaterial color="#A16207" />
          </mesh>
        ))}
      {kind === 'diagonal' && (
        // Lâmina de água escorrendo no fundo do cano
        <mesh position={[0, 0, -RADIUS * 0.85]}>
          <planeGeometry args={[RADIUS * 1.2, len]} />
          <meshStandardMaterial color="#38BDF8" emissive="#0EA5E9" emissiveIntensity={0.6} transparent opacity={0.75} />
        </mesh>
      )}
    </group>
  );
}

// Junta nas curvas: meia esfera de trás
function Joint({ node }: { node: MazeNode }) {
  return (
    <mesh position={[node.x, node.y, 0]}>
      <sphereGeometry args={[RADIUS * 1.05, 18, 12, Math.PI / 2, Math.PI]} />
      <meshStandardMaterial color="#16A34A" side={DoubleSide} />
    </mesh>
  );
}

function PipeMouth({ x, y }: { x: number; y: number }) {
  return (
    <group position={[x, y, 0]}>
      <mesh position={[0, -0.6, 0]} castShadow>
        <cylinderGeometry args={[0.85, 0.85, 1.2, 20]} />
        <meshStandardMaterial color="#22C55E" />
      </mesh>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[1.05, 1.05, 0.3, 20]} />
        <meshStandardMaterial color="#16A34A" />
      </mesh>
    </group>
  );
}

// Recompensa num beco sem saída: some quando alguém chega lá
function Reward({ mazeId, reward, node }: { mazeId: string; reward: MazeReward; node: MazeNode }) {
  const ref = useRef<Group>(null);
  const picked = useGameStore((s) => s.pickedUp.includes(`maze:${mazeId}:${reward.node}`));
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 2;
      ref.current.position.y = node.y + 0.1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });
  if (picked) return null;
  const color = reward.kind === 'power' && reward.powerUp ? POWER_COLORS[reward.powerUp] : reward.kind === 'bonus' ? '#CE82FF' : '#FFD700';
  return (
    <group ref={ref} position={[node.x, node.y, 0]}>
      {reward.kind === 'power' ? (
        <mesh>
          <boxGeometry args={[0.45, 0.45, 0.45]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} />
        </mesh>
      ) : reward.kind === 'bonus' ? (
        <mesh>
          <octahedronGeometry args={[0.3]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
        </mesh>
      ) : (
        [-0.3, 0, 0.3].map((dx) => (
          <mesh key={dx} position={[dx, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.05, 14]} />
            <meshStandardMaterial color={color} emissive="#FFB800" emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
        ))
      )}
      <Sparkles count={12} scale={0.9} size={5} speed={1} color={color} />
      <pointLight color={color} intensity={2} distance={2.5} />
    </group>
  );
}

// Labirinto de canos aleatório em visão de raio-X, com fundo de terra cortada
export function PipeMaze({ id, origin, cols, rows, entranceY, exitY, seed }: PipeMazeProps) {
  const maze = useMemo(
    () => generateMaze({ id, origin: { x: origin[0], y: origin[1] }, cols, rows, entranceY, exitY, seed }),
    [id, origin, cols, rows, entranceY, exitY, seed]
  );

  useEffect(() => {
    pipes.set(id, maze);
    return () => {
      pipes.delete(id);
    };
  }, [id, maze]);

  const { x1, x2, y1, y2 } = maze.bounds;
  return (
    <group>
      {/* Terra cortada atrás do labirinto (como num corte de formigueiro) */}
      <mesh position={[(x1 + x2) / 2, (y1 + Math.min(y2, entranceY, exitY)) / 2 - 0.5, -1.4]}>
        <planeGeometry args={[x2 - x1 + 4, Math.min(y2, entranceY, exitY) - y1 + 3]} />
        <meshStandardMaterial color="#7C4A1E" />
      </mesh>
      {maze.edges.map((e, i) => (
        <PipeSegment key={i} a={maze.nodes[e.a]} b={maze.nodes[e.b]} kind={e.kind} />
      ))}
      {maze.nodes.filter((n) => !n.mouth).map((n) => (
        <Joint key={n.id} node={n} />
      ))}
      <PipeMouth x={maze.nodes[maze.entrance].x} y={maze.nodes[maze.entrance].y} />
      <PipeMouth x={maze.nodes[maze.exit].x} y={maze.nodes[maze.exit].y} />
      {maze.rewards.map((r) => (
        <Reward key={r.node} mazeId={id} reward={r} node={maze.nodes[r.node]} />
      ))}
    </group>
  );
}
