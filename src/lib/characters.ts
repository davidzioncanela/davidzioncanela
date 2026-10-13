import type { ModelName } from '@/components/game/characters/CharacterModel';
import type { CharacterId } from './protocol';

export type { CharacterId };

export type HelpPowerId = 'escudo' | 'coragem' | 'lancamento' | 'cura';

export interface CharacterInfo {
  id: CharacterId;
  name: string;
  age: string;
  model: ModelName;
  gear: string[];
  // Altura em unidades do mundo, proporcional à idade
  height: number;
  attack: string;
  // Irmão(ã) que vira companheiro automático quando só uma pessoa joga
  sibling: CharacterId;
  help: { id: HelpPowerId; name: string; description: string; cooldown: number };
}

export const CHARACTERS: Record<CharacterId, CharacterInfo> = {
  laura: {
    id: 'laura', name: 'Laura', age: '10 anos', model: 'mage', gear: ['1H_Wand', 'Mage_Hat'], height: 1.45, attack: 'Spellcast_Shoot', sibling: 'lara',
    help: { id: 'escudo', name: 'Escudo mágico', description: 'protege os aliados próximos de 1 golpe', cooldown: 10 },
  },
  david: {
    id: 'david', name: 'Dávid', age: '7 anos', model: 'knight', gear: ['1H_Sword', 'Knight_Helmet', 'Knight_Cape'], height: 1.25, attack: '1H_Melee_Attack_Slice_Diagonal', sibling: 'yohann',
    help: { id: 'coragem', name: 'Grito de coragem', description: 'todos causam o dobro de dano por 6s', cooldown: 12 },
  },
  yohann: {
    id: 'yohann', name: 'Yohann', age: '3 anos e meio', model: 'barbarian', gear: ['1H_Axe', 'Barbarian_Hat'], height: 1.0, attack: '1H_Melee_Attack_Chop', sibling: 'david',
    help: { id: 'lancamento', name: 'Lançamento', description: 'joga os aliados próximos para o alto', cooldown: 6 },
  },
  lara: {
    id: 'lara', name: 'Lara', age: '2 anos e meio', model: 'rogue', gear: [], height: 0.85, attack: 'Unarmed_Melee_Attack_Punch_A', sibling: 'laura',
    help: { id: 'cura', name: 'Abraço que cura', description: 'devolve 1 vida ao time', cooldown: 20 },
  },
};

export const CHARACTER_ORDER: CharacterId[] = ['david', 'yohann', 'laura', 'lara'];

// Esquemas de controle: p1 = WASD, p2 = setas, solo = os dois juntos (e controles de toque)
export type InputScheme = 'p1' | 'p2' | 'solo';

export interface PlayerSlot {
  character: CharacterId;
  input: InputScheme;
  // Jogador de outro aparelho na sessão online
  remote?: boolean;
}

// Personagens fora do jogo ficam presos na gaiola; com 1 jogador o irmão vira companheiro automático
export function teamSetup(slots: PlayerSlot[]) {
  const playing = slots.map((s) => s.character);
  const companion = slots.length === 1 && !playing.includes(CHARACTERS[playing[0]].sibling) ? CHARACTERS[playing[0]].sibling : null;
  const taken = companion ? [...playing, companion] : playing;
  const captives = CHARACTER_ORDER.filter((id) => !taken.includes(id)).map((id) => CHARACTERS[id]);
  return { companion: companion ? CHARACTERS[companion] : null, captives };
}

// Cápsula de colisão que cabe na altura do personagem
export function capsuleFor(height: number) {
  const radius = height < 1.1 ? 0.25 : 0.3;
  const halfHeight = Math.max(0.05, height / 2 - radius);
  return { radius, halfHeight, centerY: halfHeight + radius };
}
