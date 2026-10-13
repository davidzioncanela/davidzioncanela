import { useGameStore } from '@/store/gameStore';
import { players } from './gameRuntime';
import type { CharacterId, HelpPowerId } from './characters';

export const HELP_RADIUS = 4;

// Aplica um poder de ajuda nos jogadores deste aparelho que estão perto de (x, y).
// Chamado por quem usou o poder e, no modo online, por cada aparelho ao receber o evento.
export function applyHelpPower(power: HelpPowerId, from: CharacterId, x: number, y: number, remote: boolean) {
  const store = useGameStore.getState();
  const near = [...players.values()].filter((p) => p.local && Math.hypot(p.position.x - x, p.position.y - y) < HELP_RADIUS);
  switch (power) {
    case 'escudo':
      near.forEach((p) => store.giveShield(p.id, 8));
      break;
    case 'coragem':
      store.boostDamage(6);
      break;
    case 'lancamento':
      near.filter((p) => p.id !== from).forEach((p) => (p.pendingImpulse = { x: 0, y: 17, z: 0 }));
      break;
    case 'cura':
      // A vida é do time: só quem usou aplica (no convidado o store avisa o host)
      if (!remote) store.gainLife();
      break;
  }
}
