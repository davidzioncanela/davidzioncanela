'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils } from 'three';
import { CHARACTERS } from '@/lib/characters';
import { getSocket } from '@/lib/net';
import { useTownStore } from '@/store/townStore';
import type { TownPerson } from '@/lib/protocol';
import { CharacterModel } from '../game/characters/CharacterModel';
import { NameTag } from './NameTag';

// Outra pessoa conectada na cidade, andando suavemente até a posição recebida
function Person({ person }: { person: TownPerson }) {
  const g = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!g.current) return;
    const t = 1 - Math.pow(0.001, delta);
    g.current.position.x = MathUtils.lerp(g.current.position.x, person.x, t);
    g.current.position.z = MathUtils.lerp(g.current.position.z, person.z, t);
    g.current.rotation.y = person.rot;
  });
  const c = CHARACTERS[person.character];
  return (
    <group ref={g} position={[person.x, 0.1, person.z]}>
      <group rotation={[0, -Math.PI / 2, 0]}>
        <CharacterModel model={c.model} animation={person.anim} accessories={c.gear} facing={1} height={c.height * 1.4} />
      </group>
      <NameTag id={person.id} name={person.name} height={c.height * 1.4} />
    </group>
  );
}

export function TownPeople() {
  const people = useTownStore((s) => s.people);
  const myId = getSocket().id;
  return (
    <>
      {Object.values(people)
        .filter((p) => p.id !== myId)
        .map((p) => (
          <Person key={p.id} person={p} />
        ))}
    </>
  );
}
