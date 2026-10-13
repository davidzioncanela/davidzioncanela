'use client';

// Luz do sol: ilumina a fase inteira e projeta sombras
export function SkySystem() {
  return (
    <directionalLight
      position={[50, 40, 25]}
      intensity={1.6}
      color="#FFF4D6"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-70}
      shadow-camera-right={70}
      shadow-camera-top={30}
      shadow-camera-bottom={-30}
      shadow-camera-far={150}
    >
      <object3D attach="target" position={[30, 0, 0]} />
    </directionalLight>
  );
}
