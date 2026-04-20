import { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import type { Group } from "three";

export interface ModelProps {
  path: string;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  castShadow?: boolean;
  animation?: string;
}

export function Model({
  path,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  castShadow = true,
  animation,
}: ModelProps) {
  const groupRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(path);

  const clone = useMemo(() => {
    const c = SkeletonUtils.clone(scene);
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = castShadow;
        (child as THREE.Mesh).receiveShadow = false;
      }
    });
    return c;
  }, [scene, castShadow]);

  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    if (!actions) return;
    Object.values(actions).forEach((a) => a?.stop());

    const target = animation
      ? (actions[animation] ?? actions["idle"] ?? actions["static"])
      : (actions["idle"] ?? actions["static"]);

    target?.reset().fadeIn(0.25).play();
    return () => {
      target?.stop();
    };
  }, [actions, animation]);

  const scaleArr: [number, number, number] = Array.isArray(scale)
    ? scale
    : [scale, scale, scale];

  return (
    <group
      ref={groupRef}
      scale={scaleArr}
      position={position}
      rotation={rotation}
    >
      <primitive object={clone} />
    </group>
  );
}
