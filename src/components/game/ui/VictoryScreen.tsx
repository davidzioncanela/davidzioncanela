'use client';

import { PartyPopper, RotateCcw, Users } from 'lucide-react';
import { CHARACTERS, PlayerSlot, teamSetup } from '@/lib/characters';
import { useGameStore } from '@/store/gameStore';

interface VictoryScreenProps {
  slots: PlayerSlot[];
  onRestart: () => void;
  onSelectTeam: () => void;
}

export function VictoryScreen({ slots, onRestart, onSelectTeam }: VictoryScreenProps) {
  const score = useGameStore((s) => s.score);
  const { captives } = teamSetup(slots);
  const everyone = Object.values(CHARACTERS).map((c) => c.name);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-sky-500/50 p-4 backdrop-blur-sm">
      <div className="card-duo w-full max-w-lg p-8 text-center">
        <PartyPopper className="mx-auto text-[#FFC800]" size={56} />
        <h1 className="font-title text-5xl font-bold text-[#58CC02]">Parabéns!</h1>
        <p className="mt-3 text-xl font-extrabold">
          {captives.length ? `${captives.map((c) => c.name).join(' e ')} ${captives.length > 1 ? 'foram resgatados' : 'foi resgatado(a)'}!` : 'A chave da pracinha foi recuperada!'}
        </p>
        <p className="mt-2 font-bold text-gray-500">{everyone.join(', ').replace(/, ([^,]*)$/, ' e $1')} vão brincar juntos na pracinha!</p>
        <p className="mb-6 mt-4 font-title text-2xl text-[#CE82FF]">{score} pontos</p>
        <div className="flex flex-col gap-3">
          <button className="btn-duo btn-green w-full" onClick={onRestart}>
            <RotateCcw size={18} /> Jogar de novo
          </button>
          <button className="btn-duo btn-white w-full" onClick={onSelectTeam}>
            <Users size={18} /> Trocar personagens
          </button>
        </div>
      </div>
    </div>
  );
}
