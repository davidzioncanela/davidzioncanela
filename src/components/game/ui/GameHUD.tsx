'use client';

import { Heart, Star, Zap } from 'lucide-react';

export function GameHUD() {
  return (
    <div className="absolute left-0 top-0 z-50 flex h-full w-full flex-col justify-between p-6 text-white">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2 rounded-lg bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Heart className="fill-red-500 text-red-500" size={24} />
            <span className="text-xl font-bold">3</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="fill-yellow-400 text-yellow-400" size={24} />
            <span className="text-xl font-bold">0</span>
          </div>
        </div>
        <div className="rounded-lg bg-black/50 p-4 text-center backdrop-blur-sm">
          <div className="text-sm">FASE</div>
          <div className="text-2xl font-bold">1</div>
          <div className="text-xs">NAS NUVENS</div>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="rounded-lg bg-black/50 px-6 py-3 text-lg backdrop-blur-sm">
          <span className="font-bold">Dávid</span> & <span className="font-bold">Yohann</span> | Laura precisa ser resgatada!
        </div>
      </div>
    </div>
  );
}
