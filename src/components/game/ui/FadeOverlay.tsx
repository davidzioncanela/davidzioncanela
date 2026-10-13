'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

// Escurece rapidamente a tela ao atravessar uma porta
export function FadeOverlay() {
  const fadeAt = useGameStore((s) => s.fadeAt);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!fadeAt) return;
    setOn(true);
    const t = setTimeout(() => setOn(false), 250);
    return () => clearTimeout(t);
  }, [fadeAt]);
  return <div className={`pointer-events-none absolute inset-0 z-[45] bg-black transition-opacity duration-300 ${on ? 'opacity-80' : 'opacity-0'}`} />;
}
