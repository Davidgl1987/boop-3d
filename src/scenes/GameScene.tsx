import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useAnimationQueue } from "../hooks/useAnimationQueue";
import { AnimationContext } from "../hooks/AnimationContext";
import { Board } from "../components/three/Board";
import { CameraRig } from "../components/three/CameraRig";

export function GameScene() {
  const { camera } = useThree();
  const animStateRef = useAnimationQueue();

  useEffect(() => {
    camera.position.set(0, 9, 8);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <AnimationContext.Provider value={animStateRef}>
      <Board />
      <CameraRig />
    </AnimationContext.Provider>
  );
}
