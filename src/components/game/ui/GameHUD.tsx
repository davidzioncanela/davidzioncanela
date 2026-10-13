'use client';

import { Heart, Star, Users } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { TeamId, TEAMS } from '@/lib/characters';

interface GameHUDProps {
  team: TeamId;
  onSwitchTeam: () => void;
}

export function GameHUD({ team, onSwitchTeam }: GameHUDProps) {
  const lives = useGameStore((s) => s.lives);
  const coins = useGameStore((s) => s.collectedCoins);
  const score = useGameStore((s) => s.score);
  const { leader, partner, captives } = TEAMS[team];

  return (
    <div className="pointer-events-none absolute left-0 top-0 z-40 flex h-full w-full flex-col justify-between p-4 text-white sm:p-6">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-2 rounded-lg bg-black/50 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Heart className="fill-red-500 text-red-500" size={22} />
            <span className="text-xl font-bold">{lives}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="fill-yellow-400 text-yellow-400" size={22} />
            <span className="text-xl font-bold">{coins}</span>
          </div>
          <div className="text-xs text-gray-300">{score} pts</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="rounded-lg bg-black/50 p-3 text-center backdrop-blur-sm">
            <div className="text-sm">FASE</div>
            <div className="text-2xl font-bold">1</div>
            <div className="text-xs">NAS NUVENS</div>
          </div>
          <button
            onClick={onSwitchTeam}
            className="pointer-events-auto flex items-center gap-2 rounded-lg bg-yellow-400 px-3 py-2 text-sm font-bold text-gray-900 shadow hover:bg-yellow-300"
          >
            <Users size={16} /> Trocar time
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="rounded-lg bg-black/50 px-4 py-2 text-center text-sm backdrop-blur-sm sm:text-lg">
          <span className="font-bold text-yellow-300">Super Zion Brothers</span> | <span className="font-bold">{leader.name}</span> &{' '}
          <span className="font-bold">{partner.name}</span> | {captives[0].name} e {captives[1].name} precisam ser resgatados!
        </div>
      </div>
    </div>
  );
}
