import { Float } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import { Model } from "../components/three/Model";

export const ModelSelectorScene = () => {
  const players = useSettingsStore((s) => s.players);
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0.5, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <group>
      {/* Jugador 1 — izquierda */}
      <group position={[-1, 0, 0]}>
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
          {/* key={path} fuerza remount al cambiar modelo → idle se reinicia */}
          <Model
            key={players[0].model}
            path={players[0].model}
            scale={0.55}
            position={[0, -0.3, 0]}
          />
        </Float>
      </group>

      {/* Jugador 2 — derecha */}
      <group position={[1, 0, 0]}>
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
          <Model
            key={players[1].model}
            path={players[1].model}
            scale={0.55}
            position={[0, -0.3, 0]}
          />
        </Float>
      </group>
    </group>
  );
};
