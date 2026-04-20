import { useRef, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";
import {
  toWorldPosition,
  PIECE_HEIGHT_OFFSET,
  PIECE_SCALE,
} from "../constants";
import type { AnimState } from "./AnimationContext";

const START_DELAY = 0.08;
const PLACE_DURATION = 0.38;
const BOOP_DELAY = 0.1;
const BOOP_DURATION = 0.4;
const OFFBOARD_DURATION = 0.55;
const GRADUATE_DELAY = 0.12;
const GRADUATE_DURATION = 0.55;
const SETTLE_BUFFER = 0.15;

export const easeInOut = (t: number): number =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export const easeOutBounce = (t: number): number => {
  const n1 = 7.5625,
    d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};

export function useAnimationQueue() {
  const stateRef = useRef<AnimState>({ animMap: new Map() });

  useEffect(() => {
    const unsubscribe = useGameStore.subscribe(
      (s) => s.pendingEvents,
      (events) => {
        if (!events.length) return;
        const now = performance.now() / 1000;
        const t0 = now + START_DELAY;
        let maxEnd = t0;

        for (const ev of events) {
          if (ev.type === "place") {
            const [wx, , wz] = toWorldPosition(ev.position.x, ev.position.y);
            stateRef.current.animMap.set(ev.piece.id, {
              startPos: [wx, PIECE_HEIGHT_OFFSET + 5, wz],
              endPos: [wx, PIECE_HEIGHT_OFFSET, wz],
              startTime: t0,
              duration: PLACE_DURATION,
              kind: "place",
            });
            maxEnd = Math.max(maxEnd, t0 + PLACE_DURATION);
          }

          if (ev.type === "boop") {
            const [fromX, , fromZ] = toWorldPosition(ev.from.x, ev.from.y);
            const [toX, , toZ] = toWorldPosition(ev.to.x, ev.to.y);
            const dx = toX - fromX,
              dz = toZ - fromZ;
            const arcHeight = Math.max(0.5, Math.sqrt(dx * dx + dz * dz) * 0.4);
            stateRef.current.animMap.set(ev.piece.id, {
              startPos: [fromX, PIECE_HEIGHT_OFFSET, fromZ],
              endPos: [toX, PIECE_HEIGHT_OFFSET, toZ],
              startTime: t0 + BOOP_DELAY,
              duration: BOOP_DURATION,
              kind: "boop",
              arcHeight,
            });
            maxEnd = Math.max(maxEnd, t0 + BOOP_DELAY + BOOP_DURATION);
          }

          if (ev.type === "off_board") {
            const [fromX, , fromZ] = toWorldPosition(ev.from.x, ev.from.y);
            const [toX, , toZ] = toWorldPosition(ev.to.x, ev.to.y);
            const dirX = toX - fromX,
              dirZ = toZ - fromZ;
            stateRef.current.animMap.set(ev.piece.id, {
              startPos: [fromX, PIECE_HEIGHT_OFFSET, fromZ],
              endPos: [
                fromX + dirX * 4,
                PIECE_HEIGHT_OFFSET - 6,
                fromZ + dirZ * 4,
              ],
              startTime: t0 + BOOP_DELAY,
              duration: OFFBOARD_DURATION,
              kind: "boop",
              arcHeight: 1.5,
            });
            maxEnd = Math.max(maxEnd, t0 + BOOP_DELAY + OFFBOARD_DURATION);
          }

          if (ev.type === "graduate") {
            const gs = t0 + BOOP_DELAY + BOOP_DURATION + GRADUATE_DELAY;
            for (let i = 0; i < ev.pieces.length; i++) {
              const [wx, , wz] = toWorldPosition(
                ev.positions[i].x,
                ev.positions[i].y,
              );
              stateRef.current.animMap.set(ev.pieces[i].id, {
                startPos: [wx, PIECE_HEIGHT_OFFSET, wz],
                endPos: [wx, PIECE_HEIGHT_OFFSET + 8, wz],
                startTime: gs,
                duration: GRADUATE_DURATION,
                kind: "graduate",
                // La pieza ya tiene size=Large en el store, pero visualmente
                // debe ARRANCAR en tamaño pequeño (su tamaño antes de graduar)
                startScale: PIECE_SCALE.small,
              });
            }
            maxEnd = Math.max(maxEnd, gs + GRADUATE_DURATION);
          }
        }

        setTimeout(
          () => {
            useGameStore.getState().consumeEvents();
            stateRef.current.animMap.clear();
          },
          (maxEnd - now + SETTLE_BUFFER) * 1000,
        );
      },
    );
    return unsubscribe;
  }, []);

  return stateRef;
}
