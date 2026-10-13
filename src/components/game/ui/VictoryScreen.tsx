'use client';

import { TeamId, TEAMS } from '@/lib/characters';
import { useGameStore } from '@/store/gameStore';

interface VictoryScreenProps {
  team: TeamId;
  onRestart: () => void;
  onSelectTeam: () => void;
}

export function VictoryScreen({ team, onRestart, onSelectTeam }: VictoryScreenProps) {
  const { leader, partner, captives } = TEAMS[team];
  const score = useGameStore((s) => s.score);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-green-400/80 to-blue-500/80 p-4 text-center text-white">
      <h1 className="mb-4 text-5xl font-bold sm:text-6xl">PARABÉNS!</h1>
      <p className="mb-4 text-2xl sm:text-3xl">
        {captives[0].name} e {captives[1].name} foram resgatados!
      </p>
      <p className="mb-2 text-xl">
        {leader.name}, {partner.name}, {captives[0].name} e {captives[1].name} podem brincar juntos na pracinha!
      </p>
      <p className="mb-8 text-lg">Pontuação: {score}</p>
      <div className="flex gap-4">
        <button className="rounded-lg bg-yellow-500 px-6 py-3 text-lg font-bold hover:bg-yellow-600" onClick={onRestart}>
          JOGAR NOVAMENTE
        </button>
        <button className="rounded-lg bg-white/30 px-6 py-3 text-lg font-bold hover:bg-white/40" onClick={onSelectTeam}>
          TROCAR TIME
        </button>
      </div>
    </div>
  );
}
