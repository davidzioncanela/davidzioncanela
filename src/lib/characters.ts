import type { ModelName } from '@/components/game/characters/CharacterModel';

export interface CharacterInfo {
  id: 'david' | 'yohann' | 'laura' | 'lara';
  name: string;
  age: string;
  model: ModelName;
  gear: string[];
  // Altura em unidades do mundo, proporcional à idade
  height: number;
  attack: string;
}

export const CHARACTERS: Record<CharacterInfo['id'], CharacterInfo> = {
  david: { id: 'david', name: 'Dávid', age: '7 anos', model: 'knight', gear: ['1H_Sword', 'Knight_Helmet', 'Knight_Cape'], height: 1.25, attack: '1H_Melee_Attack_Slice_Diagonal' },
  yohann: { id: 'yohann', name: 'Yohann', age: '3 anos e meio', model: 'barbarian', gear: ['1H_Axe', 'Barbarian_Hat'], height: 1.0, attack: '1H_Melee_Attack_Chop' },
  laura: { id: 'laura', name: 'Laura', age: '10 anos', model: 'mage', gear: ['1H_Wand', 'Mage_Hat'], height: 1.45, attack: 'Spellcast_Shoot' },
  lara: { id: 'lara', name: 'Lara', age: '2 anos e meio', model: 'rogue', gear: [], height: 0.85, attack: 'Unarmed_Melee_Attack_Punch_A' },
};

export type TeamId = 'brothers' | 'sisters';

export const TEAMS: Record<TeamId, { label: string; leader: CharacterInfo; partner: CharacterInfo; captives: [CharacterInfo, CharacterInfo] }> = {
  brothers: { label: 'Irmãos Dávid & Yohann', leader: CHARACTERS.david, partner: CHARACTERS.yohann, captives: [CHARACTERS.laura, CHARACTERS.lara] },
  sisters: { label: 'Irmãs Laura & Lara', leader: CHARACTERS.laura, partner: CHARACTERS.lara, captives: [CHARACTERS.david, CHARACTERS.yohann] },
};

// Cápsula de colisão que cabe na altura do personagem
export function capsuleFor(height: number) {
  const radius = height < 1.1 ? 0.25 : 0.3;
  const halfHeight = Math.max(0.05, height / 2 - radius);
  return { radius, halfHeight, centerY: halfHeight + radius };
}
