'use client';

import { useEffect, useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { pipes } from '@/lib/traversal';
import { players } from '@/lib/gameRuntime';
import { useGameStore } from '@/store/gameStore';
import type { PipeMaze } from '@/lib/pipeMaze';

const PLAYER_COLORS: Record<string, string> = { david: '#1CB0F6', yohann: '#FF9600', laura: '#CE82FF', lara: '#58CC02' };

// Minimapa do labirinto de canos: mostra só o que já foi descoberto, para achar a saída
export function PipeMinimap() {
  const discovered = useGameStore((s) => s.discovered);
  const picked = useGameStore((s) => s.pickedUp);
  const [view, setView] = useState<{ maze: PipeMaze; dots: { id: string; x: number; y: number }[] } | null>(null);

  // Atualiza a posição dos jogadores e escolhe o labirinto mais próximo de quem está aqui
  useEffect(() => {
    const id = setInterval(() => {
      let chosen: PipeMaze | null = null;
      players.forEach((p) => {
        if (!p.local) return;
        pipes.forEach((m) => {
          const { x1, x2, y1 } = m.bounds;
          if (p.position.x > x1 - 3 && p.position.x < x2 + 3 && p.position.y > y1 - 3 && p.position.y < 3) chosen = m;
        });
      });
      if (!chosen) return setView(null);
      const dots = [...players.values()].map((p) => ({ id: p.id, x: p.position.x, y: p.position.y + 0.45 }));
      setView({ maze: chosen, dots });
    }, 150);
    return () => clearInterval(id);
  }, []);

  if (!view) return null;
  const { maze, dots } = view;
  const known = new Set(discovered[maze.id] ?? []);
  if (!known.size) return null;

  const pad = 1.5;
  const { x1, x2, y1 } = maze.bounds;
  const y2 = Math.max(...maze.nodes.map((n) => n.y));
  const w = x2 - x1 + pad * 2;
  const h = y2 - y1 + pad * 2;
  // Coordenadas do jogo (y para cima) para o SVG (y para baixo)
  const sx = (x: number) => x - x1 + pad;
  const sy = (y: number) => y2 - y + pad;

  return (
    <div className="card-duo pointer-events-none absolute right-3 top-28 z-40 w-[min(46vw,260px)] p-2">
      <div className="mb-1 flex items-center gap-1 text-xs font-extrabold uppercase text-gray-400">
        <MapIcon size={14} /> Canos descobertos
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full rounded-xl bg-[#3F2A14]">
        {maze.edges.map((e, i) => {
          const a = maze.nodes[e.a];
          const b = maze.nodes[e.b];
          const both = known.has(e.a) && known.has(e.b);
          const one = known.has(e.a) || known.has(e.b);
          if (!one) return null;
          const color = e.kind === 'diagonal' ? '#38BDF8' : e.kind === 'escada' ? '#FACC15' : '#4ADE80';
          return (
            <line
              key={i}
              x1={sx(a.x)}
              y1={sy(a.y)}
              x2={sx(b.x)}
              y2={sy(b.y)}
              stroke={color}
              strokeWidth={both ? 0.7 : 0.4}
              strokeDasharray={both ? undefined : '0.5 0.5'}
              strokeOpacity={both ? 1 : 0.5}
              strokeLinecap="round"
            />
          );
        })}
        {maze.rewards
          .filter((r) => known.has(r.node) || maze.links[r.node].some((l) => known.has(maze.edges[l].a) || known.has(maze.edges[l].b)))
          .map((r) => {
            const n = maze.nodes[r.node];
            const taken = picked.includes(`maze:${maze.id}:${r.node}`);
            return <circle key={`r${r.node}`} cx={sx(n.x)} cy={sy(n.y)} r={0.45} fill={taken ? '#78716C' : '#FFD700'} />;
          })}
        {[maze.entrance, maze.exit]
          .filter((m) => known.has(m) || maze.links[m].some((l) => known.has(maze.edges[l].a === m ? maze.edges[l].b : maze.edges[l].a)))
          .map((m) => {
            const n = maze.nodes[m];
            return (
              <text key={`m${m}`} x={sx(n.x)} y={sy(n.y) - 0.3} fontSize={1.1} textAnchor="middle" fill="#FFFFFF" fontWeight="bold">
                {n.mouth === 'saida' ? 'SAÍDA' : 'ENTRADA'}
              </text>
            );
          })}
        {dots.map((d) => (
          <circle key={d.id} cx={sx(d.x)} cy={sy(d.y)} r={0.55} fill={PLAYER_COLORS[d.id]} stroke="#FFFFFF" strokeWidth={0.15} />
        ))}
      </svg>
    </div>
  );
}
