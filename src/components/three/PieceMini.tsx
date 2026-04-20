/**
 * PieceMini.tsx
 *
 * Miniatura 3D del modelo en un Canvas propio para el HUD.
 * Solo muestra la animación idle. Reutiliza Model.tsx.
 */
import { Canvas } from "@react-three/fiber";
import { Model } from "./Model";

interface PieceMiniProps {
  modelPath: string;
  size?: number;
  className?: string;
}

export function PieceMini({
  modelPath,
  size = 52,
  className = "",
}: PieceMiniProps) {
  return (
    <div
      style={{ width: size, height: size, flexShrink: 0 }}
      className={`rounded-xl overflow-hidden ${className}`}
    >
      <Canvas
        camera={{ position: [0, 0.6, 2.2], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        shadows={false}
      >
        <ambientLight intensity={1.6} color="#fff5e0" />
        <directionalLight
          position={[2, 4, 2]}
          intensity={1.6}
          color="#ffe8c0"
        />
        <Model
          path={modelPath}
          scale={0.72}
          position={[0, -0.35, 0]}
          castShadow={false}
        />
      </Canvas>
    </div>
  );
}
