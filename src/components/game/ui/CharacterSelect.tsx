'use client';

import { useState } from 'react';
import { Gamepad2, Users, Wifi, ArrowLeft } from 'lucide-react';
import { CHARACTERS, CHARACTER_ORDER, CharacterId, PlayerSlot } from '@/lib/characters';

interface CharacterSelectProps {
  isTouch: boolean;
  onStart: (slots: PlayerSlot[]) => void;
  onOnline: () => void;
  // Volta para a cidade
  onBack: () => void;
}

const CARD_COLORS: Record<CharacterId, string> = {
  david: 'from-sky-400 to-blue-600',
  yohann: 'from-amber-400 to-orange-600',
  laura: 'from-fuchsia-400 to-purple-600',
  lara: 'from-emerald-400 to-green-600',
};

// Escolha do modo (1 ou 2 jogadores no mesmo teclado, ou online) e dos personagens
export function CharacterSelect({ isTouch, onStart, onOnline, onBack }: CharacterSelectProps) {
  const [mode, setMode] = useState<1 | 2 | null>(null);
  const [picked, setPicked] = useState<CharacterId[]>([]);

  const pick = (id: CharacterId) => {
    if (picked.includes(id) || mode === null) return;
    const next = [...picked, id];
    if (next.length < mode) return setPicked(next);
    onStart(mode === 1 ? [{ character: next[0], input: 'solo' }] : [{ character: next[0], input: 'p1' }, { character: next[1], input: 'p2' }]);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-sky-900/40 p-4 backdrop-blur-sm">
      <h1 className="title-game mb-2 text-center text-5xl sm:text-7xl">Super Zion Brothers</h1>

      {mode === null ? (
        <>
          <p className="mb-6 text-center text-xl font-extrabold text-white drop-shadow">Como vocês vão jogar?</p>
          <div className="flex w-full max-w-md flex-col gap-3">
            <button className="btn-duo btn-green w-full" onClick={() => setMode(1)}>
              <Gamepad2 size={22} /> 1 jogador
            </button>
            {!isTouch && (
              <button className="btn-duo btn-blue w-full" onClick={() => setMode(2)}>
                <Users size={22} /> 2 jogadores no teclado
              </button>
            )}
            <button className="btn-duo btn-purple w-full" onClick={onOnline}>
              <Wifi size={22} /> Jogar online (até 4)
            </button>
            <button className="btn-duo btn-white w-full" onClick={onBack}>
              <ArrowLeft size={18} /> Voltar para a cidade
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-1 text-center text-xl font-extrabold text-white drop-shadow">
            {mode === 1 ? 'Escolha seu personagem' : `Jogador ${picked.length + 1}: escolha seu personagem`}
          </p>
          {mode === 2 && (
            <p className="mb-4 text-center text-sm font-bold text-white/90">{picked.length === 0 ? 'Jogador 1 usa W A S D' : 'Jogador 2 usa as setas'}</p>
          )}
          <div className="mt-2 grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {CHARACTER_ORDER.map((id) => {
              const c = CHARACTERS[id];
              const taken = picked.includes(id);
              return (
                <button
                  key={id}
                  disabled={taken}
                  onClick={() => pick(id)}
                  className="card-duo flex flex-col items-start p-3 text-left transition hover:-translate-y-1 disabled:opacity-40"
                >
                  <div className={`mb-2 flex h-20 w-full items-center justify-center rounded-2xl bg-gradient-to-br ${CARD_COLORS[id]} font-title text-4xl font-bold text-white`}>
                    {c.name[0]}
                  </div>
                  <div className="font-title text-xl font-bold">{c.name}</div>
                  <div className="text-xs font-bold text-gray-400">{c.age}</div>
                  <div className="mt-2 text-xs font-extrabold text-[#1CB0F6]">{c.help.name}</div>
                  <div className="text-xs font-bold text-gray-500">{c.help.description}</div>
                  {taken && <div className="mt-1 text-xs font-extrabold text-[#58CC02]">Jogador {picked.indexOf(id) + 1}</div>}
                </button>
              );
            })}
          </div>
          <button className="btn-duo btn-white mt-6" onClick={() => (setMode(null), setPicked([]))}>
            <ArrowLeft size={18} /> Voltar
          </button>
        </>
      )}
    </div>
  );
}
