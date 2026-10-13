// Elementos de travessia registrados pela fase e lidos pelo jogador a cada frame
import type { RapierRigidBody } from '@react-three/rapier';
import type { PipeMaze } from './pipeMaze';

export type Vec2 = { x: number; y: number };

// Barra horizontal ou galho: o personagem se pendura e atravessa mão a mão
export interface Bar {
  id: string;
  x1: number;
  x2: number;
  y: number;
}

// Água: dentro dela o personagem nada (gravidade menor, braçadas e fôlego)
export interface Water {
  id: string;
  x1: number;
  x2: number;
  bottom: number;
  surface: number;
}

// Corda com física: corrente de segmentos ligados por juntas
export interface Rope {
  id: string;
  segments: RapierRigidBody[];
  segmentLength: number;
}

// Porta ligada a outra porta (como num labirinto)
export interface Door {
  id: string;
  x: number;
  y: number;
  target: string;
  label?: string;
}

export const bars = new Map<string, Bar>();
export const waters = new Map<string, Water>();
export const ropes = new Map<string, Rope>();
// Labirintos de canos da fase (ver pipeMaze.ts)
export const pipes = new Map<string, PipeMaze>();
export const doors = new Map<string, Door>();

// Gerador determinístico (mesmo labirinto em todos os aparelhos da sessão)
export function seeded(seed: number) {
  let s = Math.abs(Math.floor(seed)) % 2147483646 || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
