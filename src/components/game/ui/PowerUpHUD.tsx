'use client';

import { useGameStore } from '@/store/gameStore';
import { Zap, Flame, Wind, Gauge, ArrowUp } from 'lucide-react';

const powerUpIcons: Record<string, any> = {
  laser: Zap,
  'super-speed': Gauge,
  float: Wind,
  'fire-ball': Flame,
  'super-jump': ArrowUp,
};

export function PowerUpHUD() {
  const { activePowerUp } = useGameStore();

  if (!activePowerUp) return null;

  const Icon = powerUpIcons[activePowerUp] || Zap;

  return (
    <div className="absolute top-6 right-6 z-50">
      <div className="flex items-center gap-2 rounded-xl border-4 border-yellow-500 bg-black/90 px-4 py-2 shadow-2xl">
        <Icon className="text-yellow-400" size={20} />
        <span className="text-sm font-bold uppercase text-white">{activePowerUp.replace('-', ' ')}</span>
      </div>
    </div>
  );
}
