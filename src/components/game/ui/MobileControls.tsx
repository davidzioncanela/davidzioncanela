'use client';

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronDown, Sword, Zap } from 'lucide-react';

interface MobileControlsProps {
  onPress: (key: string, pressed: boolean) => void;
}

export function MobileControls({ onPress }: MobileControlsProps) {
  const handleTouchStart = (e: React.TouchEvent, key: string) => {
    e.preventDefault();
    onPress(key, true);
  };

  const handleTouchEnd = (e: React.TouchEvent, key: string) => {
    e.preventDefault();
    onPress(key, false);
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 z-40 select-none"
      style={{ touchAction: 'none' }}
    >
      {/* D-Pad - Lado Esquerdo */}
      <div className="absolute bottom-8 left-6 grid grid-cols-3 gap-1">
        {/* Linha 1 */}
        <div></div>
        <button
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/30 p-2 shadow-lg backdrop-blur-sm transition active:scale-95 active:bg-white/40"
          onTouchStart={(e) => handleTouchStart(e, 'ArrowUp')}
          onTouchEnd={(e) => handleTouchEnd(e, 'ArrowUp')}
          onTouchCancel={(e) => handleTouchEnd(e, 'ArrowUp')}
        >
          <ArrowUp size={28} className="text-gray-800" />
        </button>
        <div></div>
        {/* Linha 2 */}
        <button
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/30 p-2 shadow-lg backdrop-blur-sm transition active:scale-95 active:bg-white/40"
          onTouchStart={(e) => handleTouchStart(e, 'ArrowLeft')}
          onTouchEnd={(e) => handleTouchEnd(e, 'ArrowLeft')}
          onTouchCancel={(e) => handleTouchEnd(e, 'ArrowLeft')}
        >
          <ArrowLeft size={28} className="text-gray-800" />
        </button>
        <button
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/30 p-2 shadow-lg backdrop-blur-sm transition active:scale-95 active:bg-white/40"
          onTouchStart={(e) => handleTouchStart(e, 'Control')}
          onTouchEnd={(e) => handleTouchEnd(e, 'Control')}
          onTouchCancel={(e) => handleTouchEnd(e, 'Control')}
        >
          <ChevronDown size={24} className="text-gray-800" />
        </button>
        <button
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/30 p-2 shadow-lg backdrop-blur-sm transition active:scale-95 active:bg-white/40"
          onTouchStart={(e) => handleTouchStart(e, 'ArrowRight')}
          onTouchEnd={(e) => handleTouchEnd(e, 'ArrowRight')}
          onTouchCancel={(e) => handleTouchEnd(e, 'ArrowRight')}
        >
          <ArrowRight size={28} className="text-gray-800" />
        </button>
        {/* Linha 3 */}
        <div></div>
        <button
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/30 p-2 shadow-lg backdrop-blur-sm transition active:scale-95 active:bg-white/40"
          onTouchStart={(e) => handleTouchStart(e, 'ArrowDown')}
          onTouchEnd={(e) => handleTouchEnd(e, 'ArrowDown')}
          onTouchCancel={(e) => handleTouchEnd(e, 'ArrowDown')}
        >
          <ArrowDown size={28} className="text-gray-800" />
        </button>
        <div></div>
      </div>

      {/* Botões de Ação - Lado Direito */}
      <div className="absolute bottom-8 right-6 flex flex-col items-end gap-4">
        {/* Ação Especial (Topo) */}
        <button
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/70 p-2 shadow-lg backdrop-blur-sm transition active:scale-95 active:bg-blue-500/80"
          onTouchStart={(e) => handleTouchStart(e, 'e')}
          onTouchEnd={(e) => handleTouchEnd(e, 'e')}
          onTouchCancel={(e) => handleTouchEnd(e, 'e')}
        >
          <Zap size={22} className="text-white" />
        </button>

        {/* Ataque (Meio) */}
        <button
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/70 p-2 shadow-lg backdrop-blur-sm transition active:scale-95 active:bg-red-500/80"
          onTouchStart={(e) => handleTouchStart(e, 'f')}
          onTouchEnd={(e) => handleTouchEnd(e, 'f')}
          onTouchCancel={(e) => handleTouchEnd(e, 'f')}
        >
          <Sword size={24} className="text-white" />
        </button>

        {/* Pulo (Baixo - Maior) */}
        <button
          className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/70 p-2 shadow-lg backdrop-blur-sm transition active:scale-95 active:bg-green-500/80"
          onTouchStart={(e) => handleTouchStart(e, ' ')}
          onTouchEnd={(e) => handleTouchEnd(e, ' ')}
          onTouchCancel={(e) => handleTouchEnd(e, ' ')}
        >
          <ArrowUp size={32} className="text-white" />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/70">
        Toque para jogar
      </div>
    </div>
  );
}
