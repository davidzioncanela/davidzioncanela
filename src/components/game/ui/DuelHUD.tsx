'use client';

import { useGameStore } from '@/store/gameStore';
import { Heart } from 'lucide-react';

export function DuelHUD() {
  const { isDuelActive, currentNPC } = useGameStore();

  if (!isDuelActive || !currentNPC) return null;

  const healthPercent = (currentNPC.health / currentNPC.maxHealth) * 100;

  return (
    <div className="absolute top-20 left-1/2 z-50 -translate-x-1/2 transform">
      <div className="rounded-xl border-4 border-red-600 bg-black/90 px-8 py-4 shadow-2xl">
        <div className="mb-2 text-center text-sm font-bold uppercase tracking-widest text-red-400">
          DUEL - {currentNPC.name}
        </div>
        <div className="flex items-center gap-3">
          <Heart className="fill-red-500 text-red-500" size={20} />
          <div className="h-4 w-64 overflow-hidden rounded-full bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-300"
              style={{ width: `${healthPercent}%` }}
            />
          </div>
          <span className="text-sm font-bold text-white">
            {currentNPC.health}/{currentNPC.maxHealth}
          </span>
        </div>
      </div>
    </div>
  );
}
