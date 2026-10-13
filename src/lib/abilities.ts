import type { CharacterId } from './protocol';

// Ações que viram prêmio conforme o jogador acumula pontos/moedas (somados entre partidas)
export type AbilityId = 'engatinhar' | 'deitar' | 'dancar';

export interface Ability {
  id: AbilityId;
  name: string;
  how: string;
  meaning: string;
  need: { coins?: number; points?: number };
}

export const ABILITIES: Ability[] = [
  { id: 'engatinhar', name: 'Engatinhar', how: '↓ + andar', meaning: 'passa pelos atalhos baixos do mapa', need: { coins: 10 } },
  { id: 'deitar', name: 'Deitar', how: 'Z (J2: .)', meaning: 'não recebe dano por até 3 segundos', need: { points: 800 } },
  { id: 'dancar', name: 'Dançar', how: 'V (J2: ,)', meaning: 'recarrega o poder de ajuda 3x mais rápido', need: { points: 1500 } },
];

// Cada personagem tem uma dança diferente (animações do KayKit)
export const DANCES: Record<CharacterId, string> = {
  david: 'Cheer',
  yohann: 'Dualwield_Melee_Attack_Chop',
  laura: 'Spellcasting',
  lara: 'Jump_Full_Short',
};

export const LIE_MAX_SECONDS = 3;
export const LIE_COOLDOWN = 4;
export const DANCE_RECHARGE = 3;
