'use client';

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BedDouble, ChevronDown, Music, Sword, Zap } from 'lucide-react';

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
      style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* D-Pad - Esquerdo */}
      <div className="absolute bottom-8 left-6 grid grid-cols-3 gap-2">
        <div></div>
        <button
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-gray-800 bg-white shadow-[0_4px_0_0_rgba(0,0,0,1)] transition active:translate-y-1 active:shadow-[0_0_0_0_rgba(0,0,0,1)]"
          onTouchStart={(e) => handleTouchStart(e, 'ArrowUp')}
          onTouchEnd={(e) => handleTouchEnd(e, 'ArrowUp')}
          onTouchCancel={(e) => handleTouchEnd(e, 'ArrowUp')}
        >
          <ArrowUp size={26} className="text-gray-800" />
        </button>
        <div></div>
        <button
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-gray-800 bg-white shadow-[0_4px_0_0_rgba(0,0,0,1)] transition active:translate-y-1 active:shadow-[0_0_0_0_rgba(0,0,0,1)]"
          onTouchStart={(e) => handleTouchStart(e, 'ArrowLeft')}
          onTouchEnd={(e) => handleTouchEnd(e, 'ArrowLeft')}
          onTouchCancel={(e) => handleTouchEnd(e, 'ArrowLeft')}
        >
          <ArrowLeft size={26} className="text-gray-800" />
        </button>
        <button
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-gray-800 bg-yellow-400 shadow-[0_4px_0_0_rgba(0,0,0,1)] transition active:translate-y-1 active:shadow-[0_0_0_0_rgba(0,0,0,1)]"
          onTouchStart={(e) => handleTouchStart(e, 'Control')}
          onTouchEnd={(e) => handleTouchEnd(e, 'Control')}
          onTouchCancel={(e) => handleTouchEnd(e, 'Control')}
        >
          <ChevronDown size={22} className="text-gray-800" />
        </button>
        <button
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-gray-800 bg-white shadow-[0_4px_0_0_rgba(0,0,0,1)] transition active:translate-y-1 active:shadow-[0_0_0_0_rgba(0,0,0,1)]"
          onTouchStart={(e) => handleTouchStart(e, 'ArrowRight')}
          onTouchEnd={(e) => handleTouchEnd(e, 'ArrowRight')}
          onTouchCancel={(e) => handleTouchEnd(e, 'ArrowRight')}
        >
          <ArrowRight size={26} className="text-gray-800" />
        </button>
        <div></div>
        <button
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-gray-800 bg-white shadow-[0_4px_0_0_rgba(0,0,0,1)] transition active:translate-y-1 active:shadow-[0_0_0_0_rgba(0,0,0,1)]"
          onTouchStart={(e) => handleTouchStart(e, 'ArrowDown')}
          onTouchEnd={(e) => handleTouchEnd(e, 'ArrowDown')}
          onTouchCancel={(e) => handleTouchEnd(e, 'ArrowDown')}
        >
          <ArrowDown size={26} className="text-gray-800" />
        </button>
        <div></div>
      </div>

      {/* Ações - Direito */}
      <div className="absolute bottom-8 right-6 flex flex-col items-end gap-4">
        {/* Ações-prêmio: deitar e dançar */}
        <div className="flex gap-3">
          <button
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-800 bg-violet-400 shadow-[0_4px_0_0_rgba(0,0,0,1)] transition active:translate-y-1 active:shadow-[0_0_0_0_rgba(0,0,0,1)]"
            onTouchStart={(e) => handleTouchStart(e, 'x')}
            onTouchEnd={(e) => handleTouchEnd(e, 'x')}
            onTouchCancel={(e) => handleTouchEnd(e, 'x')}
            aria-label="Deitar"
          >
            <BedDouble size={18} className="text-white" />
          </button>
          <button
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-800 bg-pink-400 shadow-[0_4px_0_0_rgba(0,0,0,1)] transition active:translate-y-1 active:shadow-[0_0_0_0_rgba(0,0,0,1)]"
            onTouchStart={(e) => handleTouchStart(e, 'b')}
            onTouchEnd={(e) => handleTouchEnd(e, 'b')}
            onTouchCancel={(e) => handleTouchEnd(e, 'b')}
            aria-label="Dançar"
          >
            <Music size={18} className="text-white" />
          </button>
        </div>
        <button
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-800 bg-blue-400 shadow-[0_4px_0_0_rgba(0,0,0,1)] transition active:translate-y-1 active:shadow-[0_0_0_0_rgba(0,0,0,1)]"
          onTouchStart={(e) => handleTouchStart(e, 'e')}
          onTouchEnd={(e) => handleTouchEnd(e, 'e')}
          onTouchCancel={(e) => handleTouchEnd(e, 'e')}
        >
          <Zap size={20} className="text-white" />
        </button>
        <button
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-800 bg-red-500 shadow-[0_4px_0_0_rgba(0,0,0,1)] transition active:translate-y-1 active:shadow-[0_0_0_0_rgba(0,0,0,1)]"
          onTouchStart={(e) => handleTouchStart(e, 'f')}
          onTouchEnd={(e) => handleTouchEnd(e, 'f')}
          onTouchCancel={(e) => handleTouchEnd(e, 'f')}
        >
          <Sword size={22} className="text-white" />
        </button>
        <button
          className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-800 bg-green-500 shadow-[0_4px_0_0_rgba(0,0,0,1)] transition active:translate-y-1 active:shadow-[0_0_0_0_rgba(0,0,0,1)]"
          onTouchStart={(e) => handleTouchStart(e, ' ')}
          onTouchEnd={(e) => handleTouchEnd(e, ' ')}
          onTouchCancel={(e) => handleTouchEnd(e, ' ')}
        >
          <ArrowUp size={28} className="text-white" />
        </button>
      </div>
    </div>
  );
}
