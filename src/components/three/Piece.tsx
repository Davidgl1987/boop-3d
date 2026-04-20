import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { type Piece as PieceType } from "../../core/types";
import { PIECE_SCALE, PIECE_HEIGHT_OFFSET } from "../../constants";
import { useAnimationState } from "../../hooks/AnimationContext";
import { easeInOut, easeOutBounce } from "../../hooks/useAnimationQueue";
import { Model } from "./Model";

interface PieceProps {
  piece: PieceType;
  worldPosition: [number, number, number];
}

export function Piece({ piece, worldPosition }: PieceProps) {
  const groupRef = useRef<Group>(null);
  const animCtxRef = useAnimationState();

  const restY = worldPosition[1] + PIECE_HEIGHT_OFFSET;

  const animatedPos = useRef(
    new THREE.Vector3(worldPosition[0], restY + 5, worldPosition[2]),
  );
  const animatedScale = useRef(PIECE_SCALE[piece.size] as number);

  useEffect(() => {
    const anim = animCtxRef.current?.animMap.get(piece.id);
    if (!anim) {
      animatedPos.current.set(worldPosition[0], restY, worldPosition[2]);
      animatedScale.current = PIECE_SCALE[piece.size];
    } else {
      animatedPos.current.set(...anim.startPos);
      // Para graduate: arrancar visualmente en tamaño pequeño
      animatedScale.current = anim.startScale ?? PIECE_SCALE[piece.size];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piece.id]);

  useFrame(() => {
    if (!groupRef.current) return;

    const now = performance.now() / 1000;
    const anim = animCtxRef.current?.animMap.get(piece.id);
    const baseScale = PIECE_SCALE[piece.size];
    const restPos = new THREE.Vector3(
      worldPosition[0],
      restY,
      worldPosition[2],
    );

    if (anim && now >= anim.startTime) {
      const t = Math.min(1, (now - anim.startTime) / anim.duration);
      const from = new THREE.Vector3(...anim.startPos);
      const to = new THREE.Vector3(...anim.endPos);

      if (anim.kind === "place") {
        animatedPos.current.lerpVectors(from, to, easeOutBounce(t));
        animatedScale.current = baseScale;
      } else if (anim.kind === "boop") {
        const eased = easeInOut(t);
        const x = from.x + (to.x - from.x) * eased;
        const z = from.z + (to.z - from.z) * eased;
        // off_board: arco solo en la primera mitad, luego cae
        const isOffBoard = anim.endPos[1] < PIECE_HEIGHT_OFFSET - 2;
        const arcT = isOffBoard
          ? Math.max(0, Math.sin((Math.PI * Math.min(t, 0.55)) / 0.55))
          : Math.sin(Math.PI * t);
        const y =
          from.y + (to.y - from.y) * eased + arcT * (anim.arcHeight ?? 0.5);
        animatedPos.current.set(x, y, z);
        animatedScale.current = baseScale;
      } else if (anim.kind === "graduate") {
        // Posición: sube con easeInOut
        animatedPos.current.lerpVectors(from, to, easeInOut(t));

        // Escala: crece hasta pico en t=0.45, luego encoge hasta 0
        const startScale = anim.startScale ?? PIECE_SCALE.small;
        const peakScale = startScale * 2.5;
        const PEAK = 0.45;
        let s: number;
        if (t < PEAK) {
          // Fase crecimiento
          s = startScale + (peakScale - startScale) * easeInOut(t / PEAK);
        } else {
          // Fase encogimiento
          s = peakScale * (1 - easeInOut((t - PEAK) / (1 - PEAK)));
        }
        animatedScale.current = Math.max(0, s);
      }
    } else if (!anim) {
      animatedPos.current.lerp(restPos, 0.18);
      animatedScale.current += (baseScale - animatedScale.current) * 0.18;
    }

    groupRef.current.position.copy(animatedPos.current);
    groupRef.current.scale.setScalar(Math.max(0, animatedScale.current));
  });

  return (
    <group ref={groupRef}>
      <Model path={piece.model} castShadow />
    </group>
  );
}
