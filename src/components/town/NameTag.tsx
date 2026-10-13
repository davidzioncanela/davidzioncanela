'use client';

import { useEffect, useState } from 'react';
import { Html } from '@react-three/drei';
import { BUBBLE_MS, useTownStore } from '@/store/townStore';

// Nome acima da cabeça + balão de fala com a última mensagem (some depois de alguns segundos)
export function NameTag({ id, name, height, self = false, npc = false }: { id: string; name: string; height: number; self?: boolean; npc?: boolean }) {
  const bubble = useTownStore((s) => s.bubbles[id]);
  const [, force] = useState(0);
  const visible = bubble && Date.now() - bubble.at < BUBBLE_MS;

  // Re-renderiza quando o balão expira
  useEffect(() => {
    if (!bubble) return;
    const left = BUBBLE_MS - (Date.now() - bubble.at);
    if (left <= 0) return;
    const t = setTimeout(() => force((n) => n + 1), left);
    return () => clearTimeout(t);
  }, [bubble]);

  return (
    <Html position={[0, height + 0.5, 0]} center distanceFactor={28} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className="flex flex-col items-center gap-1">
        {visible && (
          <div className="relative max-w-[220px] rounded-2xl border-2 border-b-4 border-[#E5E5E5] bg-white px-3 py-1.5 text-center text-sm font-bold leading-snug text-[#4B4B4B] shadow-lg">
            {bubble.text}
            <div className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-[#E5E5E5] bg-white" />
          </div>
        )}
        <div
          className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-extrabold shadow ${
            self ? 'bg-[#58CC02] text-white' : npc ? 'bg-[#FFC800] text-[#4B3500]' : 'bg-[#1CB0F6] text-white'
          }`}
        >
          {name}
        </div>
      </div>
    </Html>
  );
}
