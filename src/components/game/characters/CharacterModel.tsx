'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import { Box3, Color, Group, LoopOnce, Mesh, MeshStandardMaterial, Vector3 } from 'three';

// Modelos KayKit Adventurers (CC0) - ver public/assets/models/LICENSE-KayKit.txt
export const MODELS = {
  knight: '/assets/models/Knight.glb',
  barbarian: '/assets/models/Barbarian.glb',
  mage: '/assets/models/Mage.glb',
  rogue: '/assets/models/Rogue.glb',
  rogueHooded: '/assets/models/Rogue_Hooded.glb',
  // Monstros: KayKit Skeletons (CC0) - ver public/assets/monsters/LICENSE-KayKit.txt
  minion: '/assets/monsters/Skeleton_Minion.glb',
  skWarrior: '/assets/monsters/Skeleton_Warrior.glb',
  skMage: '/assets/monsters/Skeleton_Mage.glb',
  skRogue: '/assets/monsters/Skeleton_Rogue.glb',
} as const;

export type ModelName = keyof typeof MODELS;

// Animações que tocam uma vez e ficam paradas no último quadro
const ONE_SHOT = new Set(['Jump_Start', 'Death_A', 'Hit_A', 'Unarmed_Melee_Attack_Punch_A', '1H_Melee_Attack_Slice_Diagonal', 'Spellcast_Shoot', 'Throw']);

interface CharacterModelProps {
  model: ModelName;
  animation: string;
  // Meshes de acessórios que devem aparecer (o resto dos acessórios é escondido)
  accessories?: string[];
  // Altura final em unidades do mundo (usada para refletir a idade de cada personagem)
  height?: number;
  facing?: 1 | -1;
  blink?: boolean;
  // Mostra todas as peças do modelo (monstros)
  showAll?: boolean;
  // Tom de cor da roupa/corpo (variedade entre monstros iguais)
  tint?: string;
  // Cor do brilho (olhos dos monstros)
  glow?: string;
}

export function CharacterModel({ model, animation, accessories = [], height = 1.25, facing = 1, blink = false, showAll = false, tint, glow }: CharacterModelProps) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(MODELS[model]);
  // Cada instância precisa do próprio esqueleto
  const clone = useMemo(() => SkeletonUtils.clone(scene) as Group, [scene]);
  const { actions } = useAnimations(animations, group);
  const scale = useMemo(() => height / new Box3().setFromObject(clone).getSize(new Vector3()).y, [clone, height]);

  useEffect(() => {
    clone.traverse((obj) => {
      if ((obj as Mesh).isMesh) {
        obj.castShadow = true;
        const isBodyPart = obj.name.includes('_Body') || obj.name.includes('_Head') || obj.name.includes('_Arm') || obj.name.includes('_Leg');
        if (!isBodyPart && !showAll) obj.visible = accessories.includes(obj.name);
      }
    });
  }, [clone, accessories, showAll]);

  // Cores próprias desta instância (materiais copiados para não afetar os outros)
  useEffect(() => {
    if (!tint && !glow) return;
    clone.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      const mat = (mesh.material as MeshStandardMaterial).clone();
      if (mat.name === 'Glow' && glow) {
        mat.color.set(glow);
        mat.emissive = new Color(glow);
        mat.emissiveIntensity = 2.5;
        mat.toneMapped = false;
      } else if (mat.name !== 'Glow' && tint) {
        mat.color.multiply(new Color(tint));
      }
      mesh.material = mat;
    });
  }, [clone, tint, glow]);

  useEffect(() => {
    const action = actions[animation];
    if (!action) return;
    action.reset();
    if (ONE_SHOT.has(animation)) {
      action.setLoop(LoopOnce, 1);
      action.clampWhenFinished = true;
    }
    action.fadeIn(0.15).play();
    return () => {
      action.fadeOut(0.15);
    };
  }, [actions, animation]);

  useEffect(() => {
    if (!blink || !group.current) return;
    const g = group.current;
    const id = setInterval(() => (g.visible = !g.visible), 100);
    return () => {
      clearInterval(id);
      g.visible = true;
    };
  }, [blink]);

  return (
    <group ref={group} scale={scale} rotation={[0, facing === 1 ? Math.PI / 2 : -Math.PI / 2, 0]}>
      <primitive object={clone} />
    </group>
  );
}

Object.values(MODELS).forEach((url) => useGLTF.preload(url));

