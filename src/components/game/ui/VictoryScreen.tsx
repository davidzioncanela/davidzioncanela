'use client';

export function VictoryScreen() {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-green-400/80 to-blue-500/80 text-white">
      <h1 className="mb-4 text-6xl font-bold">PARABÉNS!</h1>
      <p className="mb-4 text-3xl">Laura foi resgatada!</p>
      <p className="mb-8 text-xl">Dávid e Yohann podem brincar juntos na pracinha!</p>
      <button
        className="rounded-lg bg-yellow-500 px-8 py-4 text-xl font-bold hover:bg-yellow-600"
        onClick={() => window.location.reload()}
      >
        JOGAR NOVAMENTE
      </button>
    </div>
  );
}
