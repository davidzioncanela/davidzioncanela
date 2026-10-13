'use client';

import { TeamId, TEAMS } from '@/lib/characters';

interface TeamSelectProps {
  onSelect: (team: TeamId) => void;
}

export function TeamSelect({ onSelect }: TeamSelectProps) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 p-4 text-white backdrop-blur-sm">
      <h1 className="mb-2 text-center text-4xl font-black text-yellow-300 drop-shadow-lg sm:text-6xl">Super Zion Brothers</h1>
      <p className="mb-8 text-center text-lg">Quem vai jogar?</p>
      <div className="flex w-full max-w-3xl flex-col gap-4 sm:flex-row">
        {(Object.keys(TEAMS) as TeamId[]).map((id) => {
          const t = TEAMS[id];
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className="flex-1 rounded-2xl border-4 border-yellow-400 bg-black/70 p-6 text-left transition hover:scale-105 hover:bg-black/90"
            >
              <div className="mb-3 text-2xl font-bold text-yellow-300">{t.label}</div>
              <div className="text-base">
                {t.leader.name} <span className="text-gray-400">({t.leader.age})</span> e {t.partner.name} <span className="text-gray-400">({t.partner.age})</span>
              </div>
              <div className="mt-3 text-sm text-gray-300">
                Missão: resgatar {t.captives[0].name} e {t.captives[1].name}
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-8 text-center text-sm text-gray-300">← → andar · Espaço pular · F atacar · segure ↓ 2s para Super Pulo</p>
    </div>
  );
}
