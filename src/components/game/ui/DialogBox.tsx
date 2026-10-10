'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface DialogBoxProps {
  text: string[];
  onClose: () => void;
}

export function DialogBox({ text, onClose }: DialogBoxProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [text]);

  const handleNext = () => {
    if (currentIndex < text.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="absolute bottom-10 left-1/2 z-50 w-full max-w-4xl -translate-x-1/2 transform px-4">
      <div
        className="cursor-pointer rounded-lg border-4 border-yellow-400 bg-black/90 p-6 text-white shadow-xl"
        onClick={handleNext}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-yellow-400">Diálogo</span>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }}>
            <X size={20} />
          </button>
        </div>
        <p className="text-lg leading-relaxed">{text[currentIndex]}</p>
        <div className="mt-4 text-right text-sm text-gray-400">
          {currentIndex < text.length - 1 ? 'Clique para continuar...' : 'Clique para fechar'}
        </div>
      </div>
    </div>
  );
}
