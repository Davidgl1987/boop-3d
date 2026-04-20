import {
  GamePhase,
  Size,
  type Board,
  type GameEvent,
  type GameState,
  type Piece,
  type Player,
  type Position,
} from "./types";
import { BOARD_SIZE, DIRECTIONS } from "../constants";

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const isInsideBoard = (p: Position): boolean =>
  p.x >= 0 && p.x < BOARD_SIZE && p.y >= 0 && p.y < BOARD_SIZE;

export const isOccupied = (board: Board, p: Position): boolean =>
  board[p.y][p.x] !== null;

export const getPiece = (board: Board, p: Position): Piece | null =>
  board[p.y][p.x];

export const cloneState = (s: GameState): GameState =>
  JSON.parse(JSON.stringify(s)) as GameState;

export const createInitialBoard = (): Board =>
  Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

export const createInitialGameState = (
  players: [Player, Player],
): GameState => ({
  board: createInitialBoard(),
  players,
  turn: 0,
  phase: GamePhase.Idle,
  winner: null,
});

export const findAllThreeInLine = (
  board: Board,
  playerId?: string,
): [Position, Position, Position][] => {
  const results: [Position, Position, Position][] = [];
  const seen = new Set<string>();

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const piece = board[y][x];
      if (!piece) continue;
      if (playerId && piece.idPlayer !== playerId) continue;
      for (const { dx, dy } of DIRECTIONS) {
        const positions: [Position, Position, Position] = [
          { x, y },
          { x: x + dx, y: y + dy },
          { x: x + dx * 2, y: y + dy * 2 },
        ];
        if (!positions.every(isInsideBoard)) continue;
        const [, p2, p3] = positions;
        const pc2 = board[p2.y][p2.x],
          pc3 = board[p3.y][p3.x];
        if (!pc2 || !pc3) continue;
        if (
          pc2.idPlayer === piece.idPlayer &&
          pc3.idPlayer === piece.idPlayer
        ) {
          const key = positions
            .map((p) => `${p.x},${p.y}`)
            .sort()
            .join("|");
          if (!seen.has(key)) {
            seen.add(key);
            results.push(positions);
          }
        }
      }
    }
  }
  return results;
};

export const findWinningLine = (
  board: Board,
  playerId: string,
): [Position, Position, Position] | null =>
  findAllThreeInLine(board, playerId).find((line) =>
    line.every((pos) => board[pos.y][pos.x]?.size === Size.Large),
  ) ?? null;

export const checkWin = (
  state: GameState,
): { winner: Player; winningLine?: Position[] } | null => {
  for (const player of state.players) {
    const line = findWinningLine(state.board, player.id);
    if (line) return { winner: player, winningLine: line };
    const catsOnBoard = state.board
      .flat()
      .filter((p) => p?.idPlayer === player.id && p.size === Size.Large).length;
    if (catsOnBoard === 8) return { winner: player };
  }
  return null;
};

export const applyBoop = (
  state: GameState,
  placed: Position,
): { state: GameState; events: GameEvent[] } => {
  const game = cloneState(state);
  const placedPiece = game.board[placed.y][placed.x] as Piece;
  const events: GameEvent[] = [];

  const dirs = [
    { dx: -1, dy: -1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 1 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
  ];

  for (const { dx, dy } of dirs) {
    const from: Position = { x: placed.x + dx, y: placed.y + dy };
    const to: Position = { x: placed.x + dx * 2, y: placed.y + dy * 2 };
    if (!isInsideBoard(from)) continue;
    const target = game.board[from.y][from.x];
    if (!target) continue;
    if (placedPiece.size === Size.Small && target.size === Size.Large) continue;
    const behind: Position = { x: from.x + dx, y: from.y + dy };
    if (isInsideBoard(behind) && game.board[behind.y][behind.x]) continue;

    if (isInsideBoard(to) && !isOccupied(game.board, to)) {
      game.board[to.y][to.x] = target;
      game.board[from.y][from.x] = null;
      events.push({ type: "boop", piece: target, from, to });
    } else if (!isInsideBoard(to)) {
      game.players.find((p) => p.id === target.idPlayer)?.reserve.push(target);
      game.board[from.y][from.x] = null;
      events.push({
        type: "off_board",
        piece: target,
        from,
        to,
        returnedToPlayer: target.idPlayer,
      });
    }
  }
  return { state: game, events };
};

export const applyGraduation = (
  state: GameState,
  chosenLine: [Position, Position, Position],
): { state: GameState; events: GameEvent[] } => {
  const game = cloneState(state);
  const currentPlayer = game.players[game.turn];
  const graduatedPieces: Piece[] = [],
    positions: Position[] = [];

  for (const pos of chosenLine) {
    const piece = game.board[pos.y][pos.x];
    if (!piece) continue;
    if (piece.size === Size.Small) piece.size = Size.Large;
    game.board[pos.y][pos.x] = null;
    currentPlayer.reserve.push(piece);
    graduatedPieces.push(piece);
    positions.push(pos);
  }
  return {
    state: game,
    events: [
      {
        type: "graduate",
        pieces: graduatedPieces,
        positions,
        player: currentPlayer,
      },
    ],
  };
};

export const applySelectPiece = (
  state: GameState,
  position: Position,
): { state: GameState; events: GameEvent[] } => {
  const game = cloneState(state);
  const piece = game.board[position.y][position.x];
  if (
    !piece ||
    piece.size !== Size.Small ||
    piece.idPlayer !== game.players[game.turn].id
  ) {
    return { state: game, events: [] };
  }
  piece.size = Size.Large;
  game.board[position.y][position.x] = null;
  game.players[game.turn].reserve.push(piece);
  game.phase = GamePhase.Idle;
  return {
    state: game,
    events: [
      {
        type: "graduate",
        pieces: [piece],
        positions: [position],
        player: game.players[game.turn],
      },
    ],
  };
};

export const applyTurn = (
  state: GameState,
  position: Position,
  piece: Piece,
): {
  state: GameState;
  events: GameEvent[];
  pendingGraduation: [Position, Position, Position][];
} => {
  let game = cloneState(state);
  const allEvents: GameEvent[] = [];

  // 1. Colocar
  game.board[position.y][position.x] = piece;
  const player = game.players[game.turn];
  const idx = player.reserve.findIndex((p) => p.id === piece.id);
  if (idx !== -1) player.reserve.splice(idx, 1);
  allEvents.push({ type: "place", piece, position });

  // 2. Boop
  const boopResult = applyBoop(game, position);
  game = boopResult.state;
  allEvents.push(...boopResult.events);

  // 3. Victoria antes de graduar
  const winResult = checkWin(game);
  if (winResult) {
    game.winner = winResult.winner;
    game.phase = GamePhase.GameOver;
    allEvents.push({
      type: "win",
      player: winResult.winner,
      winningLine: winResult.winningLine,
    });
    return { state: game, events: allEvents, pendingGraduation: [] };
  }

  // 4. Líneas graduables
  const allLines = findAllThreeInLine(game.board, player.id);
  const graduationLines = allLines.filter((line) =>
    line.some((pos) => game.board[pos.y][pos.x]?.size === Size.Small),
  );

  if (graduationLines.length === 1) {
    const { state: g, events: ge } = applyGraduation(game, graduationLines[0]);
    game = g;
    allEvents.push(...ge);
  }

  // 5. Avanzar turno
  game.turn = (game.turn + 1) % 2;

  // 6. Comprobar si el SIGUIENTE jugador necesita SelectPiece
  const nextPlayer = game.players[game.turn];
  if (nextPlayer.reserve.length === 0) {
    const boardPieces = game.board
      .flat()
      .filter((p) => p?.idPlayer === nextPlayer.id);
    const hasKittens = boardPieces.some((p) => p?.size === Size.Small);
    if (hasKittens) {
      game.phase = GamePhase.SelectPiece;
    } else {
      // Todos cats en tablero → victoria (debería haber sido capturada por checkWin)
      // doble seguridad:
      if (boardPieces.length === 8) {
        game.winner = nextPlayer;
        game.phase = GamePhase.GameOver;
        allEvents.push({ type: "win", player: nextPlayer });
      } else {
        game.phase =
          graduationLines.length > 1 ? GamePhase.SelectLine : GamePhase.Idle;
      }
    }
  } else {
    game.phase =
      graduationLines.length > 1 ? GamePhase.SelectLine : GamePhase.Idle;
  }

  return { state: game, events: allEvents, pendingGraduation: graduationLines };
};

export const applyManualGraduation = (
  state: GameState,
  chosenLine: [Position, Position, Position],
): { state: GameState; events: GameEvent[] } => {
  let game = cloneState(state);
  const { state: graduated, events } = applyGraduation(game, chosenLine);
  game = graduated;

  // Victoria tras graduación manual
  const winResult = checkWin(game);
  if (winResult) {
    game.winner = winResult.winner;
    game.phase = GamePhase.GameOver;
    events.push({
      type: "win",
      player: winResult.winner,
      winningLine: winResult.winningLine,
    });
    return { state: game, events };
  }

  // Avanzar turno + comprobar SelectPiece
  game.turn = (game.turn + 1) % 2;
  const nextPlayer = game.players[game.turn];
  if (nextPlayer.reserve.length === 0) {
    const boardPieces = game.board
      .flat()
      .filter((p) => p?.idPlayer === nextPlayer.id);
    if (boardPieces.some((p) => p?.size === Size.Small)) {
      game.phase = GamePhase.SelectPiece;
    } else {
      game.phase = GamePhase.Idle;
    }
  } else {
    game.phase = GamePhase.Idle;
  }

  return { state: game, events };
};
