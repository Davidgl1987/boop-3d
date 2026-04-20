import { getModelDef } from "../../constants";
import { GamePhase, Size } from "../../core/types";
import {
  useGamePhase,
  useGameStore,
  usePlayerReserve,
} from "../../store/useGameStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { PieceMini } from "../three/PieceMini";
import { Panel } from "./Panel";

type PlayerColor = "red-400" | "blue-400";
const PLAYER_COLOR: [PlayerColor, PlayerColor] = ["red-400", "blue-400"];

export const PlayerPanel = ({ playerIndex }: { playerIndex: 0 | 1 }) => {
  const gameState = useGameStore((s) => s.gameState);
  const reserve = usePlayerReserve(playerIndex) ?? [];
  const phase = useGamePhase();
  const selectPiece = useGameStore((s) => s.selectPiece);
  const selected = useGameStore((s) => s.selectedPiece);
  const playerConf = useSettingsStore((s) => s.players[playerIndex]);

  const isCurrentTurn = gameState?.turn === playerIndex;
  const canInteract = isCurrentTurn && phase === GamePhase.Idle;
  const isSelectPiece = isCurrentTurn && phase === GamePhase.SelectPiece;

  const kittens = reserve.filter((p) => p.size === Size.Small);
  const cats = reserve.filter((p) => p.size === Size.Large);

  const selectedIsKitten =
    selected?.size === Size.Small &&
    selected?.idPlayer === `player_${playerIndex}`;
  const selectedIsCat =
    selected?.size === Size.Large &&
    selected?.idPlayer === `player_${playerIndex}`;

  const color = PLAYER_COLOR[playerIndex];
  const btnActive =
    playerIndex === 0 ? "bg-red-400 text-white" : "bg-blue-400 text-white";
  const teamName = getModelDef(playerConf.model)?.name ?? "Jugador";

  const selectSize = (size: "small" | "large") => {
    if (!canInteract) return;
    const piece = reserve.find((p) => p.size === size);
    if (piece) selectPiece(piece);
  };

  return (
    <Panel
      color={color}
      dim={!isCurrentTurn}
      className="min-w-44 flex flex-col gap-2"
    >
      {/* Avatar + nombre */}
      <div className="flex items-center gap-2 justify-evenly">
        <PieceMini
          modelPath={playerConf.model}
          size={48}
          className="border-2 border-black/10"
        />
        <div className="flex flex-col">
          <span className="font-black text-sm text-black leading-tight">
            {teamName}
          </span>
          {isCurrentTurn && !isSelectPiece && (
            <span className="text-[10px] font-bold text-black/40">
              tu turno ⭐
            </span>
          )}
          {isSelectPiece && (
            <span className="text-[10px] font-bold text-orange-500 animate-pulse">
              elige un mini ☝️
            </span>
          )}
        </div>
      </div>

      <div className="h-px bg-black/10" />

      {/* Selectores de tamaño */}
      <div className="flex gap-2">
        {/* Kittens */}
        <button
          onClick={() => selectSize("small")}
          disabled={!canInteract || kittens.length === 0}
          className={`
            flex-1 flex flex-col items-center gap-0.5
            py-1.5 px-2 rounded-xl border-2 border-black font-black text-black text-xs
            shadow-[0_3px_0_0_#000] transition-all duration-100
            ${selectedIsKitten ? `${btnActive} translate-y-0.5 shadow-[0_1px_0_0_#000]` : "bg-white"}
            ${
              canInteract && kittens.length > 0
                ? "hover:-translate-y-px cursor-pointer active:translate-y-0.5 active:shadow-none"
                : "opacity-40 cursor-not-allowed"
            }
          `}
        >
          <span>mini</span>
          <span
            className={`text-sm ${selectedIsKitten ? "text-white" : "text-black/60"}`}
          >
            ×{kittens.length}
          </span>
        </button>

        {/* Cats */}
        <button
          onClick={() => selectSize("large")}
          disabled={!canInteract || cats.length === 0}
          className={`
            flex-1 flex flex-col items-center gap-0.5
            py-1.5 px-2 rounded-xl border-2 border-black font-black text-black text-xs
            shadow-[0_3px_0_0_#000] transition-all duration-100
            ${selectedIsCat ? `${btnActive} translate-y-0.5 shadow-[0_1px_0_0_#000]` : "bg-white"}
            ${
              canInteract && cats.length > 0
                ? "hover:-translate-y-px cursor-pointer active:translate-y-0.5 active:shadow-none"
                : "opacity-40 cursor-not-allowed"
            }
          `}
        >
          <span>super</span>
          <span
            className={`text-sm ${selectedIsCat ? "text-white" : "text-black/60"}`}
          >
            ×{cats.length}
          </span>
        </button>
      </div>
    </Panel>
  );
};
