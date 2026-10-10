'use client';

export function GameOverScreen() {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white">
      <h1 className="mb-4 text-6xl font-bold text-red-500">GAME OVER</h1>
      <p className="mb-8 text-xl">Não foi desta vez... Tente novamente!</p>
      <button
        className="rounded-lg bg-red-500 px-8 py-4 text-xl font-bold hover:bg-red-600"
        onClick={() => window.location.reload()}
      >
        REINICIAR
      </button>
    </div>
  );
}
