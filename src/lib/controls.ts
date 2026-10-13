import type { InputScheme } from './characters';

export type Action = 'left' | 'right' | 'jump' | 'crouch' | 'attack' | 'help';

// Teclas de cada esquema. O controle de toque envia as mesmas teclas do esquema "solo".
const P1: Record<Action, string[]> = {
  left: ['a', 'A'],
  right: ['d', 'D'],
  jump: ['w', 'W'],
  crouch: ['s', 'S'],
  attack: ['f', 'F'],
  help: ['g', 'G'],
};

const P2: Record<Action, string[]> = {
  left: ['ArrowLeft'],
  right: ['ArrowRight'],
  jump: ['ArrowUp'],
  crouch: ['ArrowDown'],
  attack: ['k', 'K', 'Enter'],
  help: ['l', 'L'],
};

const SOLO: Record<Action, string[]> = {
  left: [...P1.left, ...P2.left],
  right: [...P1.right, ...P2.right],
  jump: [...P1.jump, ...P2.jump, ' '],
  crouch: [...P1.crouch, ...P2.crouch, 'Control', 'c', 'C'],
  attack: [...P1.attack, ...P2.attack, 'j', 'J'],
  help: [...P1.help, ...P2.help, 'e', 'E'],
};

export const SCHEMES: Record<InputScheme, Record<Action, string[]>> = { p1: P1, p2: P2, solo: SOLO };

export function isPressed(keys: Record<string, boolean>, scheme: InputScheme, action: Action) {
  return SCHEMES[scheme][action].some((k) => keys[k]);
}
