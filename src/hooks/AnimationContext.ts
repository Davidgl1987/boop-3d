import { createContext, useContext } from "react";
import type { RefObject } from "react";

export type AnimKind = "place" | "boop" | "graduate";

export type PieceAnim = {
  startPos: [number, number, number];
  endPos: [number, number, number];
  startTime: number;
  duration: number;
  kind: AnimKind;
  arcHeight?: number;
  startScale?: number;
};

export type AnimState = {
  animMap: Map<string, PieceAnim>;
};

export const AnimationContext = createContext<RefObject<AnimState> | null>(
  null,
);

export const useAnimationState = (): RefObject<AnimState> => {
  const ctx = useContext(AnimationContext);
  if (!ctx)
    throw new Error(
      "useAnimationState debe usarse dentro de <AnimationContext.Provider>",
    );
  return ctx;
};
