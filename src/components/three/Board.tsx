import { useMemo } from "react";
import { useBoard, useGameStore } from "../../store/useGameStore";
import type { Position } from "../../core/types";
import { BOARD_SIZE, toWorldPosition } from "../../constants";
import { Bed } from "./Bed";
import { Cell } from "./Cell";
import { Piece } from "./Piece";

export function Board() {
  const board = useBoard();
  const outgoing = useGameStore((s) => s.outgoingPieces);

  const cells = useMemo(() => {
    const result: {
      logicalPos: Position;
      worldPos: [number, number, number];
    }[] = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        result.push({ logicalPos: { x, y }, worldPos: toWorldPosition(x, y) });
      }
    }
    return result;
  }, []);

  return (
    <group>
      <Bed />

      {cells.map(({ logicalPos, worldPos }) => (
        <Cell
          key={`${logicalPos.x}-${logicalPos.y}`}
          position={logicalPos}
          worldPosition={worldPos}
          isOccupied={
            board !== null && board[logicalPos.y][logicalPos.x] !== null
          }
        />
      ))}

      {board !== null &&
        cells.map(({ logicalPos, worldPos }) => {
          const piece = board[logicalPos.y][logicalPos.x];
          if (!piece) return null;
          return (
            <Piece key={piece.id} piece={piece} worldPosition={worldPos} />
          );
        })}

      {outgoing.map(({ piece, position }) => (
        <Piece
          key={`out-${piece.id}`}
          piece={piece}
          worldPosition={toWorldPosition(position.x, position.y)}
        />
      ))}
    </group>
  );
}
