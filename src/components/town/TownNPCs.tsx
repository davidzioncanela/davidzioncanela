'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { TOWN_NPCS, TownNpc, isWalkable } from '@/lib/town';
import { useTownStore } from '@/store/townStore';
import { CharacterModel } from '../game/characters/CharacterModel';
import { NameTag } from './NameTag';
import { townAvatar } from './TownAvatar';

const WANDER_RADIUS = 4;
const SPEED = 1.6;

// Morador que passeia perto de casa e de vez em quando fala algo; clicar nele puxa conversa
function Npc({ npc }: { npc: TownNpc }) {
  const g = useRef<Group>(null);
  const [walking, setWalking] = useState(false);
  const s = useRef({ x: npc.home.x, z: npc.home.z, target: null as null | { x: number; z: number }, wait: Math.random() * 3, talk: 3 + Math.random() * 8, line: 0 });
  const say = useTownStore((st) => st.say);

  const talk = () => {
    const st = s.current;
    say(npc.id, npc.lines[st.line % npc.lines.length]);
    st.line++;
    st.talk = 8 + Math.random() * 8;
  };

  useFrame((_, rawDelta) => {
    const st = s.current;
    const delta = Math.min(rawDelta, 1 / 20);
    st.talk -= delta;
    // Fala sozinho quando alguém está por perto
    const near = Math.hypot(townAvatar.position.x - st.x, townAvatar.position.z - st.z) < 7;
    if (st.talk <= 0 && near) talk();

    if (!st.target) {
      st.wait -= delta;
      if (st.wait <= 0) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * WANDER_RADIUS;
        const t = { x: npc.home.x + Math.cos(a) * r, z: npc.home.z + Math.sin(a) * r };
        if (isWalkable(t.x, t.z)) st.target = t;
        st.wait = 2 + Math.random() * 4;
      }
    } else {
      const dx = st.target.x - st.x;
      const dz = st.target.z - st.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.1) st.target = null;
      else {
        st.x += (dx / d) * Math.min(d, SPEED * delta);
        st.z += (dz / d) * Math.min(d, SPEED * delta);
        if (g.current) g.current.rotation.y = Math.atan2(dx, dz);
      }
    }
    if (g.current) g.current.position.set(st.x, 0.1, st.z);
    if (!!st.target !== walking) setWalking(!!st.target);
  });

  return (
    <group
      ref={g}
      position={[npc.home.x, 0.1, npc.home.z]}
      onClick={(e) => {
        e.stopPropagation();
        talk();
      }}
    >
      <group rotation={[0, -Math.PI / 2, 0]}>
        <CharacterModel model={npc.model} animation={walking ? 'Walking_A' : 'Idle'} accessories={npc.gear} facing={1} height={npc.height * 1.4} />
      </group>
      <NameTag id={npc.id} name={npc.name} height={npc.height * 1.4} npc />
    </group>
  );
}

export function TownNPCs() {
  return (
    <>
      {TOWN_NPCS.map((n) => (
        <Npc key={n.id} npc={n} />
      ))}
    </>
  );
}
