import type { ComponentType } from 'react';
import type { LevelProps } from './LevelShell';
import { Level1, LEVEL1_BOUNDS } from './Level1';
import { Level2, LEVEL2_BOUNDS } from './Level2';
import { Level3, LEVEL3_BOUNDS } from './Level3';
import { Level4, LEVEL4_BOUNDS } from './Level4';

export interface LevelInfo {
  name: string;
  emphasis: string;
  Component: ComponentType<LevelProps>;
  bounds: [number, number];
}

// Ordem das fases: cada uma começa na terra, sobe até as nuvens e dá ênfase a um elemento
export const LEVELS: LevelInfo[] = [
  { name: 'Da Terra às Nuvens', emphasis: 'Nuvens com física', Component: Level1, bounds: LEVEL1_BOUNDS },
  { name: 'Floresta das Cordas', emphasis: 'Cordas', Component: Level2, bounds: LEVEL2_BOUNDS },
  { name: 'Lago e Trepa-trepa', emphasis: 'Natação e barras', Component: Level3, bounds: LEVEL3_BOUNDS },
  { name: 'Encanamento', emphasis: 'Canos e portas', Component: Level4, bounds: LEVEL4_BOUNDS },
];
