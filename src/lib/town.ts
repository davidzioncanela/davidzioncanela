// Planta da cidade (mundo aberto) montada com peças do KayKit City Builder Bits (CC0)

export const TILE = 6; // cada peça 2x2 do pacote escalada 3x
export const TOWN_SIZE = 9; // 9 x 9 peças

export type CellKind = 'road' | 'junction' | 'plaza' | 'building' | 'park';

export interface TownCell {
  i: number;
  j: number;
  kind: CellKind;
  // Peça do pacote e rotação em múltiplos de 90°
  piece: string;
  rot: number;
  x: number;
  z: number;
}

const ROADS = [2, 6];
const BUILDINGS = ['building_A', 'building_B', 'building_C', 'building_D', 'building_E', 'building_F', 'building_G', 'building_H'];

// Gerador determinístico: todo mundo vê a mesma cidade
function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

export const cellCenter = (i: number) => (i - (TOWN_SIZE - 1) / 2) * TILE;

export function buildTown(): TownCell[] {
  const rnd = seeded(2024);
  const cells: TownCell[] = [];
  for (let i = 0; i < TOWN_SIZE; i++) {
    for (let j = 0; j < TOWN_SIZE; j++) {
      const roadI = ROADS.includes(i);
      const roadJ = ROADS.includes(j);
      const base = { i, j, x: cellCenter(i), z: cellCenter(j) };
      if (roadI && roadJ) cells.push({ ...base, kind: 'junction', piece: 'road_junction', rot: 0 });
      else if (roadI) cells.push({ ...base, kind: 'road', piece: j === 4 ? 'road_straight_crossing' : 'road_straight', rot: 0 });
      else if (roadJ) cells.push({ ...base, kind: 'road', piece: i === 4 ? 'road_straight_crossing' : 'road_straight', rot: 1 });
      else if (i >= 3 && i <= 5 && j >= 3 && j <= 5) cells.push({ ...base, kind: 'plaza', piece: 'base', rot: 0 });
      else if ((i === 0 || i === 8) && (j === 0 || j === 8)) cells.push({ ...base, kind: 'park', piece: 'base', rot: 0 });
      else cells.push({ ...base, kind: 'building', piece: BUILDINGS[Math.floor(rnd() * BUILDINGS.length)], rot: Math.floor(rnd() * 4) });
    }
  }
  return cells;
}

export const TOWN_CELLS = buildTown();
const HALF = (TOWN_SIZE * TILE) / 2;

// Pode andar aqui? Prédios bloqueiam; ruas, praça e parques são livres
export function isWalkable(x: number, z: number) {
  if (Math.abs(x) > HALF - 1 || Math.abs(z) > HALF - 1) return false;
  const i = Math.round(x / TILE + (TOWN_SIZE - 1) / 2);
  const j = Math.round(z / TILE + (TOWN_SIZE - 1) / 2);
  const cell = TOWN_CELLS.find((c) => c.i === i && c.j === j);
  if (!cell || cell.kind !== 'building') return true;
  // Calçada em volta do prédio
  const dx = Math.abs(x - cell.x);
  const dz = Math.abs(z - cell.z);
  return dx > TILE * 0.36 || dz > TILE * 0.36;
}

export const PLAZA_SPAWN = { x: 0, z: 2 };

export interface TownNpc {
  id: string;
  name: string;
  model: 'knight' | 'barbarian' | 'mage' | 'rogue' | 'rogueHooded';
  height: number;
  gear: string[];
  lines: string[];
  home: { x: number; z: number };
}

// Moradores da cidade que passeiam e puxam conversa
export const TOWN_NPCS: TownNpc[] = [
  { id: 'npc-padeiro', name: 'Seu Joaquim, o padeiro', model: 'barbarian', height: 1.6, gear: ['Mug', 'Barbarian_Hat'], home: { x: -6, z: -6 }, lines: ['Pão quentinho saindo agora!', 'Dizem que o Bowser Jr. adora sonho de creme...', 'Bom dia, criançada!'] },
  { id: 'npc-maga', name: 'Dona Celeste, a maga', model: 'mage', height: 1.6, gear: ['2H_Staff', 'Mage_Hat'], home: { x: 6, z: -6 }, lines: ['As caixas brilhantes dão poderes especiais!', 'Segure para baixo 2 segundos e pule bem alto.', 'O arco-íris aparece depois da chuva de estrelas.'] },
  { id: 'npc-guarda', name: 'Sargento Bento', model: 'knight', height: 1.7, gear: ['1H_Sword', 'Round_Shield', 'Knight_Helmet'], home: { x: 0, z: -12 }, lines: ['Cuidado com as hordas nas nuvens!', 'Trabalhem juntos: um protege, o outro ataca.', 'A cidade está segura enquanto vocês estiverem aqui.'] },
  { id: 'npc-vendedora', name: 'Tia Rosa, a sorveteira', model: 'rogue', height: 1.5, gear: [], home: { x: 6, z: 6 }, lines: ['Sorvete de morango para quem vencer a horda!', 'Já viram a pracinha hoje? Está linda!', 'Tem brinquedo novo no parque.'] },
  { id: 'npc-explorador', name: 'Zeca, o explorador', model: 'rogueHooded', height: 1.5, gear: ['1H_Crossbow'], home: { x: -6, z: 6 }, lines: ['Achei um cano que leva a um labirinto secreto!', 'Lá no castelo tem uma gaiola enorme...', 'Psiu! Tem moeda escondida atrás da nuvem grande.'] },
  { id: 'npc-vovo', name: 'Vovó Lurdes', model: 'mage', height: 1.35, gear: [], home: { x: 12, z: 0 }, lines: ['Meus netinhos, venham tomar um lanche!', 'No meu tempo a gente pulava corda o dia todo.', 'Juízo, hein!'] },
];
