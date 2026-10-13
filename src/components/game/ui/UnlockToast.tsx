'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useProfileStore } from '@/store/profileStore';

const SHOW_MS = 5000;

// Aviso grande quando uma ação nova é desbloqueada
export function UnlockToast() {
  const toast = useProfileStore((s) => s.toast);
  const [, force] = useState(0);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => force((n) => n + 1), SHOW_MS);
    return () => clearTimeout(t);
  }, [toast]);
  if (!toast || Date.now() - toast.at > SHOW_MS) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/3 z-50 -translate-x-1/2 animate-bounce">
      <div className="card-duo flex items-center gap-3 border-[#FFC800] px-5 py-3 shadow-2xl">
        <Sparkles className="text-[#FFC800]" size={28} />
        <span className="font-title text-lg font-bold text-[#4B4B4B]">{toast.text}</span>
      </div>
    </div>
  );
}
