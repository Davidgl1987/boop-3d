export const Size = {
  Small: "small",
  Large: "large",
} as const;
export type Size = (typeof Size)[keyof typeof Size];

export const GamePhase = {
  Idle: "idle",
  Animating: "animating",
  SelectLine: "select_line",
  SelectPiece: "select_piece",
  GameOver: "game_over",
} as const;
export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase];

export type Piece = {
  id: string;
  model: string;
  size: Size;
  idPlayer: string;
};

export type Player = {
  id: string;
  reserve: Piece[];
};

export type Board = (Piece | null)[][];

export type Position = {
  x: number;
  y: number;
};

export type GameState = {
  board: Board;
  players: [Player, Player];
  turn: number;
  phase: GamePhase;
  winner: Player | null;
};

export type PlaceEvent = { type: "place"; piece: Piece; position: Position };
export type BoopEvent = {
  type: "boop";
  piece: Piece;
  from: Position;
  to: Position;
};
export type OffBoardEvent = {
  type: "off_board";
  piece: Piece;
  from: Position;
  to: Position;
  returnedToPlayer: string;
};
export type GraduateEvent = {
  type: "graduate";
  pieces: Piece[];
  positions: Position[];
  player: Player;
};
export type WinEvent = {
  type: "win";
  player: Player;
  winningLine?: Position[];
};

export type GameEvent =
  | PlaceEvent
  | BoopEvent
  | OffBoardEvent
  | GraduateEvent
  | WinEvent;
