'use client';

import { Heart, Star, Trophy, Users, Shield, Flame, Lock } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { CHARACTERS, PlayerSlot } from '@/lib/characters';
import { SCHEMES } from '@/lib/controls';
import { POWER_COLORS } from '../effects/PowerEffects';
import { ABILITIES } from '@/lib/abilities';
import { useProfileStore } from '@/store/profileStore';

interface GameHUDProps {
  slots: PlayerSlot[];
  compact?: boolean;
  levelNumber: number;
  levelName: string;
  onSwitch: () => void;
}

const POWER_LABELS: Record<string, string> = {
  laser: 'Laser',
  'super-speed': 'Super velocidade',
  float: 'Flutuar',
  'fire-ball': 'Bolas de fogo',
  'super-jump': 'Super pulo',
};

const keyLabel = (k: string) => (k === ' ' ? 'Espaço' : k.length === 1 ? k.toUpperCase() : k);

export function GameHUD({ slots, onSwitch, compact = false, levelNumber, levelName }: GameHUDProps) {
  // Cada aparelho mostra só os cartões dos próprios jogadores
  const localSlots = slots.filter((s) => !s.remote);
  const lives = useGameStore((s) => s.lives);
  const coins = useGameStore((s) => s.collectedCoins);
  const score = useGameStore((s) => s.score);
  const players = useGameStore((s) => s.players);
  const boost = useGameStore((s) => s.damageBoostUntil > performance.now());
  const unlocked = useProfileStore((s) => s.unlocked);
  const profilePoints = useProfileStore((s) => s.points);
  const profileCoins = useProfileStore((s) => s.coins);

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex flex-col justify-between p-3 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <div className="hud-pill text-lg">
            <Heart className="fill-[#FF4B4B] text-[#FF4B4B]" size={22} /> {lives}
          </div>
          <div className="hud-pill text-lg">
            <Star className="fill-[#FFC800] text-[#FFC800]" size={22} /> {coins}
          </div>
          <div className="hud-pill text-lg">
            <Trophy className="text-[#CE82FF]" size={20} /> {score}
          </div>
          {boost && (
            <div className="hud-pill animate-pulse text-sm text-[#F43F5E]">
              <Flame size={18} /> Coragem: dano x2
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="hud-pill flex-col !gap-0 text-center">
            <span className="text-[10px] uppercase tracking-widest text-gray-400">Fase {levelNumber}</span>
            <span className="font-title text-base">{levelName}</span>
          </div>
          <button onClick={onSwitch} className="btn-duo btn-yellow pointer-events-auto !px-3 !py-1.5 text-xs">
            <Users size={16} /> Trocar
          </button>
        </div>
      </div>

      <div className={compact ? 'absolute left-3 top-16 flex flex-col gap-2' : 'flex flex-wrap items-end justify-center gap-3'}>
        {localSlots.map((slot, i) => {
          const c = CHARACTERS[slot.character];
          const hud = players[slot.character];
          const ready = (hud?.helpCooldownLeft ?? 0) <= 0;
          const scheme = SCHEMES[slot.input];
          return (
            <div key={slot.character} className={`card-duo px-3 py-2 shadow-xl ${compact ? 'min-w-[150px] scale-90 origin-top-left' : 'min-w-[210px]'}`}>
              <div className="flex items-center justify-between">
                <span className="font-title text-lg font-bold">
                  {localSlots.length > 1 && <span className="mr-1 text-xs text-gray-400">J{i + 1}</span>}
                  {c.name}
                </span>
                {(hud?.shieldUntil ?? 0) > performance.now() && <Shield size={16} className="text-[#1CB0F6]" />}
              </div>
              <div className={`mt-1 flex items-center justify-between rounded-xl px-2 py-1 text-xs font-extrabold ${ready ? 'bg-[#D7FFB8] text-[#58A700]' : 'bg-gray-100 text-gray-400'}`}>
                <span>
                  {c.help.name} {!compact && `[${keyLabel(scheme.help[0])}]`}
                </span>
                <span>{ready ? 'PRONTO' : `${hud?.helpCooldownLeft}s`}</span>
              </div>
              {/* Ações-prêmio: desbloqueadas aparecem coloridas; as outras mostram quanto falta */}
              <div className="mt-1 flex flex-wrap gap-1">
                {ABILITIES.map((a) => {
                  const ok = unlocked.includes(a.id);
                  const need = a.need.coins ? `${Math.max(0, a.need.coins - profileCoins)} moedas` : `${Math.max(0, (a.need.points ?? 0) - profilePoints)} pts`;
                  return (
                    <span
                      key={a.id}
                      title={`${a.name}: ${a.meaning}`}
                      className={`flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 text-[10px] font-extrabold ${ok ? 'bg-[#DDF4FF] text-[#1899D6]' : 'bg-gray-100 text-gray-400'}`}
                    >
                      {!ok && <Lock size={10} />}
                      {ok ? `${a.name} ${compact ? '' : `(${a.how})`}` : `${a.name}: faltam ${need}`}
                    </span>
                  );
                })}
              </div>
              {hud?.powerUp && (
                <div
                  className="mt-1 flex items-center justify-between rounded-xl px-2 py-1 text-xs font-extrabold text-white"
                  style={{ backgroundColor: POWER_COLORS[hud.powerUp], boxShadow: `0 0 16px ${POWER_COLORS[hud.powerUp]}` }}
                >
                  <span>{POWER_LABELS[hud.powerUp]}</span>
                  <span>{hud.powerUpTimeLeft}s</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
