'use client';

import { useGameStore } from '@/store/gameStore';
import { Swords } from 'lucide-react';

const MAX_SHOWN = 6;

// Contador da horda + mini barras de vida dos inimigos mais próximos de acabar
export function DuelHUD() {
  const enemies = useGameStore((s) => s.enemies);
  const locked = useGameStore((s) => s.screenLock !== null);
  if (!locked && enemies.length === 0) return null;

  const shown = [...enemies].sort((a, b) => a.health / a.maxHealth - b.health / b.maxHealth).slice(0, MAX_SHOWN);

  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-40 flex w-[min(92vw,560px)] -translate-x-1/2 flex-col items-center gap-2">
      <div className="hud-pill animate-pulse bg-[#FF4B4B]/90 text-sm text-white">
        <Swords size={16} /> HORDA! {enemies.length} {enemies.length === 1 ? 'inimigo' : 'inimigos'}
      </div>
      <div className="grid w-full grid-cols-2 gap-1.5 sm:grid-cols-3">
        {shown.map((e) => (
          <div key={e.id} className="rounded-xl border-2 border-b-4 border-white/70 bg-white/85 px-2 py-1 backdrop-blur">
            <div className="flex items-center justify-between gap-1 text-[10px] font-extrabold text-gray-700">
              <span className="truncate">{e.name}</span>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: e.color }} title={e.power} />
            </div>
            <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-[#FF4B4B] transition-all duration-300" style={{ width: `${(e.health / e.maxHealth) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
