import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  GamePhase,
  type GameEvent,
  type GameState,
  type Piece,
  type Player,
  type Position,
} from "../core/types";
import {
  applyManualGraduation,
  applySelectPiece,
  applyTurn,
  createInitialGameState,
} from "../core/gameRules";
import { useSettingsStore } from "./useSettingsStore";

export type OutgoingPiece = { piece: Piece; position: Position };

type GameStore = {
  gameState: GameState | null;
  phase: GamePhase;
  pendingEvents: GameEvent[];
  pendingGraduationLines: [Position, Position, Position][];
  selectedPiece: Piece | null;
  outgoingPieces: OutgoingPiece[];

  startGame: () => void;
  placePiece: (position: Position) => void;
  resolveGraduation: (line: [Position, Position, Position]) => void;
  selectPieceFromBoard: (position: Position) => void;
  consumeEvents: () => void;
  selectPiece: (piece: Piece | null) => void;
  restartGame: () => void;
};

function extractOutgoing(events: GameEvent[]): OutgoingPiece[] {
  const out: OutgoingPiece[] = [];
  for (const ev of events) {
    if (ev.type === "graduate") {
      ev.pieces.forEach((piece, i) =>
        out.push({ piece, position: ev.positions[i] }),
      );
    }
    if (ev.type === "off_board") {
      out.push({ piece: ev.piece, position: ev.from });
    }
  }
  return out;
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    gameState: null,
    phase: GamePhase.Idle,
    pendingEvents: [],
    pendingGraduationLines: [],
    selectedPiece: null,
    outgoingPieces: [],

    startGame: () => {
      const { players } = useSettingsStore.getState();
      const gamePlayers: [Player, Player] = players.map((config, i) => ({
        id: `player_${i}`,
        reserve: Array.from({ length: 8 }, (_, j) => ({
          id: `piece_${i}_${j}`,
          model: config.model,
          size: "small" as const,
          idPlayer: `player_${i}`,
        })),
      })) as [Player, Player];

      set({
        gameState: createInitialGameState(gamePlayers),
        phase: GamePhase.Idle,
        pendingEvents: [],
        pendingGraduationLines: [],
        selectedPiece: gamePlayers[0].reserve[0],
        outgoingPieces: [],
      });
    },

    placePiece: (position) => {
      const { gameState, phase, selectedPiece } = get();
      if (!gameState || phase !== GamePhase.Idle || !selectedPiece) return;
      if (gameState.board[position.y][position.x] !== null) return;
      const currentPlayer = gameState.players[gameState.turn];
      const pieceInReserve = currentPlayer.reserve.find(
        (p) => p.id === selectedPiece.id,
      );
      if (!pieceInReserve) return;

      const { state, events, pendingGraduation } = applyTurn(
        gameState,
        position,
        pieceInReserve,
      );
      const nextPhase =
        state.phase === GamePhase.GameOver
          ? GamePhase.GameOver
          : state.phase === GamePhase.SelectPiece
            ? GamePhase.SelectPiece
            : pendingGraduation.length > 1
              ? GamePhase.SelectLine
              : GamePhase.Animating;

      const nextPlayer = state.players[state.turn];

      set({
        gameState: state,
        phase: nextPhase,
        pendingEvents: events,
        pendingGraduationLines:
          pendingGraduation.length > 1 ? pendingGraduation : [],
        outgoingPieces: extractOutgoing(events),
        selectedPiece: [GamePhase.SelectLine, GamePhase.SelectPiece].includes(
          nextPhase as never,
        )
          ? selectedPiece
          : (nextPlayer?.reserve[0] ?? null),
      });
    },

    resolveGraduation: (line) => {
      const { gameState } = get();
      if (!gameState) return;
      const { state, events } = applyManualGraduation(gameState, line);
      const nextPlayer = state.players[state.turn];
      const nextPhase =
        state.phase === GamePhase.GameOver
          ? GamePhase.GameOver
          : state.phase === GamePhase.SelectPiece
            ? GamePhase.SelectPiece
            : GamePhase.Animating;

      set({
        gameState: state,
        phase: nextPhase,
        pendingEvents: events,
        pendingGraduationLines: [],
        outgoingPieces: extractOutgoing(events),
        selectedPiece: nextPlayer?.reserve[0] ?? null,
      });
    },

    selectPieceFromBoard: (position) => {
      const { gameState, phase } = get();
      if (!gameState || phase !== GamePhase.SelectPiece) return;

      const { state, events } = applySelectPiece(gameState, position);
      const nextPlayer = state.players[state.turn];

      set({
        gameState: state,
        phase:
          state.phase === GamePhase.Idle ? GamePhase.Animating : state.phase,
        pendingEvents: events,
        pendingGraduationLines: [],
        outgoingPieces: extractOutgoing(events),
        selectedPiece: nextPlayer?.reserve[0] ?? null,
      });
    },

    consumeEvents: () =>
      set((s) => ({
        pendingEvents: [],
        outgoingPieces: [],
        phase: s.phase === GamePhase.Animating ? GamePhase.Idle : s.phase,
      })),

    selectPiece: (piece) => set({ selectedPiece: piece }),
    restartGame: () => get().startGame(),
  })),
);

export const useCurrentPlayer = () =>
  useGameStore((s) =>
    s.gameState ? s.gameState.players[s.gameState.turn] : null,
  );
export const useBoard = () => useGameStore((s) => s.gameState?.board ?? null);
export const useGamePhase = () => useGameStore((s) => s.phase);
export const useWinner = () => useGameStore((s) => s.gameState?.winner ?? null);
export const usePlayerReserve = (playerIndex: 0 | 1) =>
  useGameStore((s) => s.gameState?.players[playerIndex]?.reserve ?? null);
