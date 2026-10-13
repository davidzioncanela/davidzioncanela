'use client';

import { useGameStore } from '@/store/gameStore';
import { Zap, Flame, Wind, Gauge, ArrowUp } from 'lucide-react';

const POWER_UPS: Record<string, { icon: typeof Zap; label: string; hint: string }> = {
  laser: { icon: Zap, label: 'Laser', hint: 'F para atirar' },
  'super-speed': { icon: Gauge, label: 'Super velocidade', hint: 'corra!' },
  float: { icon: Wind, label: 'Flutuar', hint: 'segure Espaço caindo' },
  'fire-ball': { icon: Flame, label: 'Bolas de fogo', hint: 'F para lançar' },
  'super-jump': { icon: ArrowUp, label: 'Super pulo', hint: 'pulos mais altos' },
};

export function PowerUpHUD() {
  const activePowerUp = useGameStore((s) => s.activePowerUp);
  const timeLeft = useGameStore((s) => s.powerUpTimeLeft);

  if (!activePowerUp) return null;

  const { icon: Icon, label, hint } = POWER_UPS[activePowerUp];

  return (
    <div className="absolute left-1/2 top-4 z-40 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-xl border-4 border-yellow-500 bg-black/90 px-4 py-2 shadow-2xl">
        <Icon className="text-yellow-400" size={20} />
        <span className="text-sm font-bold uppercase text-white">{label}</span>
        <span className="text-xs text-gray-300">{hint}</span>
        <span className="ml-2 text-sm font-bold text-yellow-300">{Math.ceil(timeLeft)}s</span>
      </div>
    </div>
  );
}
