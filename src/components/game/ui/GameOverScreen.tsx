'use client';

import { RotateCcw, Users } from 'lucide-react';

interface GameOverScreenProps {
  onRestart: () => void;
  onSelectTeam: () => void;
}

export function GameOverScreen({ onRestart, onSelectTeam }: GameOverScreenProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="card-duo w-full max-w-md p-8 text-center">
        <h1 className="font-title text-5xl font-bold text-[#FF4B4B]">Game Over</h1>
        <p className="mb-6 mt-2 text-lg font-bold text-gray-500">Não foi desta vez... Tentem de novo!</p>
        <div className="flex flex-col gap-3">
          <button className="btn-duo btn-green w-full" onClick={onRestart}>
            <RotateCcw size={18} /> Tentar de novo
          </button>
          <button className="btn-duo btn-white w-full" onClick={onSelectTeam}>
            <Users size={18} /> Trocar personagens
          </button>
        </div>
      </div>
    </div>
  );
}
