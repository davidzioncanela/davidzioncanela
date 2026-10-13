'use client';

import { useGameStore } from '@/store/gameStore';
import { Swords } from 'lucide-react';

// Lista os inimigos vivos da onda atual com nome, poder e vida
export function DuelHUD() {
  const enemies = useGameStore((s) => s.enemies);
  if (enemies.length === 0) return null;

  return (
    <div className="absolute left-1/2 top-20 z-40 flex -translate-x-1/2 flex-col gap-2">
      <div className="flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-widest text-white drop-shadow">
        <Swords size={16} /> Derrote os inimigos!
      </div>
      {enemies.map((e) => (
        <div key={e.id} className="w-72 rounded-2xl border-2 border-b-4 border-gray-900 bg-white px-3 py-2 shadow">
          <div className="flex items-center justify-between text-xs font-extrabold text-gray-800">
            <span>{e.name}</span>
            <span className="rounded-full px-2 py-0.5 text-white" style={{ backgroundColor: e.color }}>
              {e.power}
            </span>
          </div>
          <div className="mt-1 h-3 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-red-500 transition-all duration-300" style={{ width: `${(e.health / e.maxHealth) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
