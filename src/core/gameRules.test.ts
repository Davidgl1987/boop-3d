/**
 * gameRules.test.ts
 *
 * Tests de la lógica pura del juego Boop usando Vitest.
 * Patrón: estado inicial → movimiento → estado esperado.
 *
 * Ejecutar: npx vitest run
 */
import { describe, test, expect } from "vitest";
import {
  applyTurn,
  applyBoop,
  applyGraduation,
  applySelectPiece,
  checkWin,
  findAllThreeInLine,
  isInsideBoard,
} from "./gameRules";
import {
  GamePhase,
  Size,
  type Board,
  type GameState,
  type Piece,
  type Player,
  type Position,
} from "./types";
import { BOARD_SIZE } from "../constants";

// ─── Helpers de construcción de estado ────────────────────────────────────────

function makePiece(
  id: string,
  playerId: string,
  size: Size = Size.Small,
): Piece {
  return { id, model: "/models/animal-cat.glb", size, idPlayer: playerId };
}

function emptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function makePlayer(id: string, reserve: Piece[] = []): Player {
  return { id, reserve };
}

function makeState(
  overrides: Partial<{
    board: Board;
    turn: number;
    p0Reserve: Piece[];
    p1Reserve: Piece[];
  }>,
): GameState {
  const board = overrides.board ?? emptyBoard();
  const p0Reserve =
    overrides.p0Reserve ??
    Array.from({ length: 8 }, (_, i) => makePiece(`p0_${i}`, "player_0"));
  const p1Reserve =
    overrides.p1Reserve ??
    Array.from({ length: 8 }, (_, i) => makePiece(`p1_${i}`, "player_1"));

  return {
    board,
    players: [
      makePlayer("player_0", p0Reserve),
      makePlayer("player_1", p1Reserve),
    ],
    turn: overrides.turn ?? 0,
    phase: GamePhase.Idle,
    winner: null,
  };
}

// ─── isInsideBoard ────────────────────────────────────────────────────────────

describe("isInsideBoard", () => {
  test("esquinas válidas", () => {
    expect(isInsideBoard({ x: 0, y: 0 })).toBe(true);
    expect(isInsideBoard({ x: 5, y: 5 })).toBe(true);
  });
  test("fuera del tablero", () => {
    expect(isInsideBoard({ x: -1, y: 0 })).toBe(false);
    expect(isInsideBoard({ x: 6, y: 0 })).toBe(false);
    expect(isInsideBoard({ x: 0, y: 6 })).toBe(false);
  });
});

// ─── applyBoop ────────────────────────────────────────────────────────────────

describe("applyBoop", () => {
  test("boop básico: pieza adyacente se mueve una casilla", () => {
    const board = emptyBoard();
    const mover = makePiece("mover", "player_0");
    const target = makePiece("target", "player_1");
    board[2][2] = mover; // pieza que acaba de colocarse
    board[2][3] = target; // pieza a la derecha

    const state = makeState({ board, p0Reserve: [], p1Reserve: [] });
    const { state: result, events } = applyBoop(state, { x: 2, y: 2 });

    // target debería haberse movido a (4,2)
    expect(result.board[2][4]).toEqual(
      expect.objectContaining({ id: "target" }),
    );
    expect(result.board[2][3]).toBeNull();
    expect(events).toContainEqual(
      expect.objectContaining({ type: "boop", piece: target }),
    );
  });

  test("kitten no puede bopear un cat", () => {
    const board = emptyBoard();
    const kitten = makePiece("k", "player_0", Size.Small);
    const cat = makePiece("c", "player_1", Size.Large);
    board[3][3] = kitten;
    board[3][4] = cat;

    const state = makeState({ board, p0Reserve: [], p1Reserve: [] });
    const { state: result, events } = applyBoop(state, { x: 3, y: 3 });

    // el cat no se mueve
    expect(result.board[3][4]).toEqual(expect.objectContaining({ id: "c" }));
    expect(events.filter((e) => e.type === "boop")).toHaveLength(0);
  });

  test("boop fuera del tablero: pieza vuelve a la reserva", () => {
    const board = emptyBoard();
    const mover = makePiece("m", "player_0");
    const target = makePiece("t", "player_1");
    board[0][1] = mover; // junto al borde izquierdo
    board[0][0] = target; // en el borde

    const state = makeState({ board, p0Reserve: [], p1Reserve: [] });
    const { state: result, events } = applyBoop(state, { x: 1, y: 0 });

    expect(result.board[0][0]).toBeNull();
    // target vuelve a la reserva de player_1
    expect(result.players[1].reserve).toContainEqual(
      expect.objectContaining({ id: "t" }),
    );
    expect(events).toContainEqual(
      expect.objectContaining({ type: "off_board", piece: target }),
    );
  });

  test("una línea de 2 bloquea el boop en esa dirección", () => {
    const board = emptyBoard();
    const mover = makePiece("m", "player_0");
    const piece1 = makePiece("p1", "player_1");
    const piece2 = makePiece("p2", "player_1"); // bloquea
    board[2][2] = mover;
    board[2][3] = piece1;
    board[2][4] = piece2; // hay pieza en el destino de piece1 → bloqueo

    const state = makeState({ board, p0Reserve: [], p1Reserve: [] });
    const { state: result } = applyBoop(state, { x: 2, y: 2 });

    // piece1 no se mueve porque piece2 bloquea
    expect(result.board[2][3]).toEqual(expect.objectContaining({ id: "p1" }));
  });

  test("boop en las 8 direcciones", () => {
    const board = emptyBoard();
    const center = makePiece("center", "player_0");
    board[2][2] = center;

    // Rodear con piezas del oponente en las 8 diagonales/rectas
    const dirs = [
      [1, 2],
      [3, 2],
      [2, 1],
      [2, 3],
      [1, 1],
      [3, 3],
      [1, 3],
      [3, 1],
    ] as const;
    dirs.forEach(([x, y], i) => {
      board[y][x] = makePiece(`adj_${i}`, "player_1");
    });

    const state = makeState({ board, p0Reserve: [], p1Reserve: [] });
    const { events } = applyBoop(state, { x: 2, y: 2 });

    const boopEvents = events.filter(
      (e) => e.type === "boop" || e.type === "off_board",
    );
    expect(boopEvents.length).toBe(8);
  });
});

// ─── findAllThreeInLine ───────────────────────────────────────────────────────

describe("findAllThreeInLine", () => {
  test("detecta línea horizontal", () => {
    const board = emptyBoard();
    board[0][0] = makePiece("a", "player_0");
    board[0][1] = makePiece("b", "player_0");
    board[0][2] = makePiece("c", "player_0");

    const lines = findAllThreeInLine(board, "player_0");
    expect(lines).toHaveLength(1);
  });

  test("detecta línea vertical", () => {
    const board = emptyBoard();
    board[0][0] = makePiece("a", "player_0");
    board[1][0] = makePiece("b", "player_0");
    board[2][0] = makePiece("c", "player_0");

    const lines = findAllThreeInLine(board, "player_0");
    expect(lines).toHaveLength(1);
  });

  test("no cuenta celdas vacías como match", () => {
    const board = emptyBoard();
    board[0][0] = makePiece("a", "player_0");
    // null en [0][1]
    board[0][2] = makePiece("c", "player_0");

    const lines = findAllThreeInLine(board, "player_0");
    expect(lines).toHaveLength(0);
  });

  test("no mezcla jugadores", () => {
    const board = emptyBoard();
    board[0][0] = makePiece("a", "player_0");
    board[0][1] = makePiece("b", "player_1"); // diferente jugador
    board[0][2] = makePiece("c", "player_0");

    const lines = findAllThreeInLine(board, "player_0");
    expect(lines).toHaveLength(0);
  });
});

// ─── checkWin ─────────────────────────────────────────────────────────────────

describe("checkWin", () => {
  test("3 cats en fila horizontal → victoria", () => {
    const board = emptyBoard();
    board[0][0] = makePiece("a", "player_0", Size.Large);
    board[0][1] = makePiece("b", "player_0", Size.Large);
    board[0][2] = makePiece("c", "player_0", Size.Large);

    const state = makeState({ board });
    const result = checkWin(state);
    expect(result?.winner.id).toBe("player_0");
    expect(result?.winningLine).toHaveLength(3);
  });

  test("3 kittens en fila NO es victoria", () => {
    const board = emptyBoard();
    board[0][0] = makePiece("a", "player_0", Size.Small);
    board[0][1] = makePiece("b", "player_0", Size.Small);
    board[0][2] = makePiece("c", "player_0", Size.Small);

    const state = makeState({ board });
    expect(checkWin(state)).toBeNull();
  });

  test("8 cats en tablero → victoria", () => {
    const board = emptyBoard();
    for (let i = 0; i < 8; i++) {
      board[Math.floor(i / 6)][i % 6] = makePiece(
        `c${i}`,
        "player_0",
        Size.Large,
      );
    }

    const state = makeState({ board, p0Reserve: [] });
    const result = checkWin(state);
    expect(result?.winner.id).toBe("player_0");
  });

  test("mezcla cat+kitten en fila no es victoria", () => {
    const board = emptyBoard();
    board[0][0] = makePiece("a", "player_0", Size.Large);
    board[0][1] = makePiece("b", "player_0", Size.Small); // kitten
    board[0][2] = makePiece("c", "player_0", Size.Large);

    const state = makeState({ board });
    expect(checkWin(state)).toBeNull();
  });
});

// ─── applyTurn (turno completo) ───────────────────────────────────────────────

describe("applyTurn", () => {
  test("colocar una pieza la pone en el tablero", () => {
    const state = makeState({});
    const piece = state.players[0].reserve[0];
    const { state: result } = applyTurn(state, { x: 2, y: 2 }, piece);

    expect(result.board[2][2]).toEqual(
      expect.objectContaining({ id: piece.id }),
    );
  });

  test("tras colocar, la pieza sale de la reserva", () => {
    const state = makeState({});
    const piece = state.players[0].reserve[0];
    const { state: result } = applyTurn(state, { x: 0, y: 0 }, piece);

    expect(result.players[0].reserve).not.toContainEqual(
      expect.objectContaining({ id: piece.id }),
    );
  });

  test("el turno avanza al oponente", () => {
    const state = makeState({ turn: 0 });
    const piece = state.players[0].reserve[0];
    const { state: result } = applyTurn(state, { x: 0, y: 0 }, piece);

    expect(result.turn).toBe(1);
  });

  test("3 kittens en línea se gradúan automáticamente", () => {
    const board = emptyBoard();
    // Jugador 0 ya tiene 2 kittens en fila, va a colocar el tercero
    const k1 = makePiece("k1", "player_0", Size.Small);
    const k2 = makePiece("k2", "player_0", Size.Small);
    board[0][0] = k1;
    board[0][1] = k2;

    const k3 = makePiece("k3", "player_0", Size.Small);
    const state = makeState({ board, p0Reserve: [k3] });
    const { state: result, events } = applyTurn(state, { x: 2, y: 0 }, k3);

    // Los 3 kittens se retiran del tablero
    expect(result.board[0][0]).toBeNull();
    expect(result.board[0][1]).toBeNull();
    expect(result.board[0][2]).toBeNull();

    // Pasan a la reserva como cats
    const newCats = result.players[0].reserve.filter(
      (p) => p.size === Size.Large,
    );
    expect(newCats).toHaveLength(3);

    // Evento graduate emitido
    expect(events).toContainEqual(
      expect.objectContaining({ type: "graduate" }),
    );
  });

  test("3 cats en línea → victoria inmediata (no se gradúan)", () => {
    const board = emptyBoard();
    const c1 = makePiece("c1", "player_0", Size.Large);
    const c2 = makePiece("c2", "player_0", Size.Large);
    board[0][0] = c1;
    board[0][1] = c2;

    const c3 = makePiece("c3", "player_0", Size.Large);
    const state = makeState({ board, p0Reserve: [c3], p1Reserve: [] });
    const { state: result, events } = applyTurn(state, { x: 2, y: 0 }, c3);

    // Hay ganador
    expect(result.winner?.id).toBe("player_0");
    expect(result.phase).toBe(GamePhase.GameOver);

    // Las piezas NO se graduaron (no deben retirarse del tablero)
    expect(result.board[0][0]).not.toBeNull();
    expect(result.board[0][1]).not.toBeNull();
    expect(result.board[0][2]).not.toBeNull();

    expect(events).toContainEqual(expect.objectContaining({ type: "win" }));
    expect(events).not.toContainEqual(
      expect.objectContaining({ type: "graduate" }),
    );
  });

  test("SelectPiece: si el siguiente jugador tiene reserva vacía + kittens en tablero", () => {
    const board = emptyBoard();
    // Jugador 1 tiene 8 kittens en el tablero, reserva vacía
    for (let i = 0; i < 8; i++) {
      board[i < 6 ? 0 : 1][i < 6 ? i : i - 6] = makePiece(
        `p1k${i}`,
        "player_1",
        Size.Small,
      );
    }

    const piece = makePiece("p0_x", "player_0", Size.Small);
    const state = makeState({ board, p0Reserve: [piece], p1Reserve: [] });
    const { state: result } = applyTurn(state, { x: 5, y: 5 }, piece);

    expect(result.phase).toBe(GamePhase.SelectPiece);
    expect(result.turn).toBe(1); // es el turno del jugador 1
  });

  test("no hay doble boop en cadena (boop no propaga)", () => {
    const board = emptyBoard();
    const mover = makePiece("m", "player_0");
    const piece1 = makePiece("p1", "player_1");
    const piece2 = makePiece("p2", "player_1");
    board[2][2] = mover;
    board[2][3] = piece1;
    // piece2 está en (4,2): piece1 no puede empujarlo (no hay cadena)
    board[2][4] = piece2;

    const state = makeState({ board, p0Reserve: [], p1Reserve: [] });
    const { state: result } = applyBoop(state, { x: 2, y: 2 });

    // piece1 no se mueve porque piece2 bloquea
    expect(result.board[2][3]).toEqual(expect.objectContaining({ id: "p1" }));
    // piece2 no se mueve tampoco
    expect(result.board[2][4]).toEqual(expect.objectContaining({ id: "p2" }));
  });
});

// ─── applySelectPiece ─────────────────────────────────────────────────────────

describe("applySelectPiece", () => {
  test("gradúa el kitten elegido del tablero", () => {
    const board = emptyBoard();
    const kitten = makePiece("k", "player_0", Size.Small);
    board[1][1] = kitten;

    const state = makeState({ board, p0Reserve: [] });
    const { state: result, events } = applySelectPiece(state, { x: 1, y: 1 });

    // El kitten se retira del tablero
    expect(result.board[1][1]).toBeNull();

    // Va a la reserva como cat
    const cats = result.players[0].reserve.filter((p) => p.size === Size.Large);
    expect(cats).toHaveLength(1);

    // Fase vuelve a Idle
    expect(result.phase).toBe(GamePhase.Idle);
    expect(events).toContainEqual(
      expect.objectContaining({ type: "graduate" }),
    );
  });

  test("ignora si se elige un cat o pieza del rival", () => {
    const board = emptyBoard();
    const cat = makePiece("c", "player_0", Size.Large);
    const rival = makePiece("r", "player_1", Size.Small);
    board[0][0] = cat;
    board[0][1] = rival;

    const state = makeState({ board });
    const { state: r1 } = applySelectPiece(state, { x: 0, y: 0 }); // cat propio
    const { state: r2 } = applySelectPiece(state, { x: 1, y: 0 }); // pieza del rival

    expect(r1.board[0][0]).not.toBeNull(); // no se movió
    expect(r2.board[0][1]).not.toBeNull(); // no se movió
  });
});

// ─── applyGraduation ─────────────────────────────────────────────────────────

describe("applyGraduation", () => {
  test("kittens se convierten en cats en la reserva", () => {
    const board = emptyBoard();
    const line: [Position, Position, Position] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ];
    line.forEach((pos, i) => {
      board[pos.y][pos.x] = makePiece(`k${i}`, "player_0", Size.Small);
    });

    const state = makeState({ board, p0Reserve: [] });
    const { state: result } = applyGraduation(state, line);

    line.forEach((pos) => expect(result.board[pos.y][pos.x]).toBeNull());
    expect(
      result.players[0].reserve.filter((p) => p.size === Size.Large),
    ).toHaveLength(3);
  });

  test("cats mixtos se retiran y kittens se convierten en cats", () => {
    const board = emptyBoard();
    const line: [Position, Position, Position] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ];
    board[0][0] = makePiece("cat", "player_0", Size.Large);
    board[0][1] = makePiece("kit", "player_0", Size.Small);
    board[0][2] = makePiece("kit2", "player_0", Size.Small);

    const state = makeState({ board, p0Reserve: [] });
    const { state: result } = applyGraduation(state, line);

    // Todos los 3 están en reserva como Large
    expect(
      result.players[0].reserve.filter((p) => p.size === Size.Large),
    ).toHaveLength(3);
  });
});
