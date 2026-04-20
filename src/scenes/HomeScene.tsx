import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Button } from "../components/ui/Button";
import { BoopTitle } from "../components/three/BoopTitle";

type Props = { onStart: () => void };

export const HomeScene = ({ onStart }: Props) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 6);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <group>
      <BoopTitle />

      <Html center position={[0, -2, 0]}>
        <Button onClick={onStart} className="bg-pink-400">
          Empezar
        </Button>
      </Html>
    </group>
  );
};
