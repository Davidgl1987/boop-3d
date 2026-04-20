import { useRef, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { useGameStore, useGamePhase } from "../../store/useGameStore";
import { GamePhase, Size, type Position } from "../../core/types";
import { CELL_SIZE } from "../../constants";

interface CellProps {
  position: Position;
  worldPosition: [number, number, number];
  isOccupied: boolean;
}

const COLOR_LIGHT = "white";
const COLOR_DARK = "lightblue";
const COLOR_HOVER = "#ffe020";
const COLOR_SELECT_PIECE = "#ffb347"; // naranja al hover de SelectPiece
const COLOR_SELECT_LINE = "#90ee90"; // verde al hover de SelectLine

export function Cell({ position, worldPosition, isOccupied }: CellProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const phase = useGamePhase();
  const gameState = useGameStore((s) => s.gameState);
  const placePiece = useGameStore((s) => s.placePiece);
  const selectedPiece = useGameStore((s) => s.selectedPiece);
  const selectPieceFromBoard = useGameStore((s) => s.selectPieceFromBoard);
  const resolveGraduation = useGameStore((s) => s.resolveGraduation);
  const pendingLines = useGameStore((s) => s.pendingGraduationLines);

  const currentTurn = gameState?.turn ?? 0;
  const pieceHere = gameState?.board[position.y][position.x] ?? null;

  // ── Interactividad según fase ──────────────────────────────────────────────
  const isPlaceable =
    phase === GamePhase.Idle && !isOccupied && !!selectedPiece;
  const isSelectablePiece =
    phase === GamePhase.SelectPiece &&
    pieceHere?.idPlayer === `player_${currentTurn}` &&
    pieceHere?.size === Size.Small;

  const graduationLineIndex =
    phase === GamePhase.SelectLine
      ? pendingLines.findIndex((line) =>
          line.some((p) => p.x === position.x && p.y === position.y),
        )
      : -1;
  const isSelectableLine = graduationLineIndex >= 0;

  const isInteractive = isPlaceable || isSelectablePiece || isSelectableLine;

  // ── Color ────────────────────────────────────────────────────────────────
  const isLight = (position.x + position.y) % 2 === 0;
  const baseColor = isLight ? COLOR_LIGHT : COLOR_DARK;
  let activeColor = baseColor;
  if (hovered && isInteractive) {
    if (isSelectablePiece) activeColor = COLOR_SELECT_PIECE;
    else if (isSelectableLine) activeColor = COLOR_SELECT_LINE;
    else activeColor = COLOR_HOVER;
  }

  // ── Hover elevation ──────────────────────────────────────────────────────
  const targetY =
    isInteractive && hovered ? worldPosition[1] + 0.05 : worldPosition[1];
  const currentY = useRef(worldPosition[1]);
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    currentY.current += (targetY - currentY.current) * Math.min(1, delta * 14);
    meshRef.current.position.y = currentY.current;
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    if (isPlaceable) {
      placePiece(position);
      return;
    }
    if (isSelectablePiece) {
      selectPieceFromBoard(position);
      return;
    }
    if (isSelectableLine) {
      resolveGraduation(pendingLines[graduationLineIndex]);
    }
  }, [
    isPlaceable,
    isSelectablePiece,
    isSelectableLine,
    placePiece,
    selectPieceFromBoard,
    resolveGraduation,
    position,
    pendingLines,
    graduationLineIndex,
  ]);

  const handlePointerEnter = useCallback(() => {
    if (isInteractive) {
      setHovered(true);
      document.body.style.cursor = "pointer";
    }
  }, [isInteractive]);

  const handlePointerLeave = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = "default";
  }, []);

  return (
    <mesh
      ref={meshRef}
      position={worldPosition}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      receiveShadow
    >
      <boxGeometry args={[CELL_SIZE, 0.12, CELL_SIZE]} />
      <meshStandardMaterial
        color={activeColor}
        roughness={0.85}
        metalness={0}
      />
    </mesh>
  );
}
