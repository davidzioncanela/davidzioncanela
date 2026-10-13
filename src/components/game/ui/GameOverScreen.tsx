'use client';

interface GameOverScreenProps {
  onRestart: () => void;
  onSelectTeam: () => void;
}

export function GameOverScreen({ onRestart, onSelectTeam }: GameOverScreenProps) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4 text-white">
      <h1 className="mb-4 text-5xl font-bold text-red-500 sm:text-6xl">GAME OVER</h1>
      <p className="mb-8 text-xl">Não foi desta vez... Tente novamente!</p>
      <div className="flex gap-4">
        <button className="rounded-lg bg-red-500 px-6 py-3 text-lg font-bold hover:bg-red-600" onClick={onRestart}>
          REINICIAR
        </button>
        <button className="rounded-lg bg-gray-600 px-6 py-3 text-lg font-bold hover:bg-gray-500" onClick={onSelectTeam}>
          TROCAR TIME
        </button>
      </div>
    </div>
  );
}
