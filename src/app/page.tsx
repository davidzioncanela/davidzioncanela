'use client';

import dynamic from 'next/dynamic';

const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-sky-200">
      <div className="text-2xl font-bold text-gray-800">Carregando jogo...</div>
    </div>
  ),
});

export default function Home() {
  return <GameCanvas />;
}
