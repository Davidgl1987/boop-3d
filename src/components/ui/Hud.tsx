import {
  useGamePhase,
  useCurrentPlayer,
  useGameStore,
} from "../../store/useGameStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { GamePhase } from "../../core/types";
import { getModelDef } from "../../constants";
import { Button } from "./Button";
import { Panel } from "./Panel";
import { PlayerPanel } from "./PlayerPanel";

// ── Selector de modelo (modelSelector scene) ──────────────────────────────────

function ModelSelectorPanel({
  playerIndex,
  onPrev,
  onNext,
}: {
  playerIndex: 0 | 1;
  onPrev: () => void;
  onNext: () => void;
}) {
  const playerConf = useSettingsStore((s) => s.players[playerIndex]);
  const modelName = getModelDef(playerConf.model)?.name ?? "—";
  const color =
    playerIndex === 0 ? ("red-400" as const) : ("blue-400" as const);
  const btnClass = playerIndex === 0 ? "bg-red-300" : "bg-blue-300";

  return (
    <Panel color={color} className="flex flex-col items-center gap-2 ">
      <span className="font-black text-xs text-black/40 uppercase tracking-wider">
        {playerIndex === 0 ? "Jugador 1" : "Jugador 2"}
      </span>
      <span className="font-black text-2xl text-black">{modelName}</span>
      <div className="flex gap-2">
        <Button onClick={onPrev} className={btnClass}>
          ◀
        </Button>
        <Button onClick={onNext} className={btnClass}>
          ▶
        </Button>
      </div>
    </Panel>
  );
}

// ── Banner de estado centrado (SelectLine / SelectPiece) ──────────────────────

function StatusBanner() {
  const phase = useGamePhase();
  const pendingLines = useGameStore((s) => s.pendingGraduationLines);
  const resolveGrad = useGameStore((s) => s.resolveGraduation);

  if (phase === GamePhase.SelectPiece) {
    return (
      <div className="pointer-events-auto mx-auto mt-2">
        <Panel color="yellow-300" className="px-5 py-2 text-center">
          <p className="font-black text-sm text-black">
            🐣 Elige un mini del tablero para que crezca
          </p>
          <p className="text-xs text-black/50 mt-0.5">
            Tu reserva está vacía — haz clic en uno de tus kittens
          </p>
        </Panel>
      </div>
    );
  }

  if (phase === GamePhase.SelectLine && pendingLines.length > 1) {
    return (
      <div className="pointer-events-auto mx-auto mt-2">
        <Panel
          color="green-400"
          className="px-5 py-2 text-center flex flex-col items-center gap-2"
        >
          <p className="font-black text-sm text-black">
            🎓 Tienes {pendingLines.length} líneas graduables — elige una
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            {pendingLines.map((line, i) => (
              <Button
                key={i}
                onClick={() => resolveGrad(line)}
                className="bg-green-400 text-sm px-3 py-1"
              >
                Línea {i + 1}
              </Button>
            ))}
          </div>
          <p className="text-xs text-black/50">
            O haz clic en cualquier pieza de la línea en el tablero
          </p>
        </Panel>
      </div>
    );
  }

  return null;
}

// ── HUD principal ─────────────────────────────────────────────────────────────

interface HudProps {
  scene: "home" | "modelSelector" | "game";
  onHome: () => void;
  modelSelectorProps?: {
    onPrev: (i: 0 | 1) => void;
    onNext: (i: 0 | 1) => void;
    onConfirm: () => void;
  };
}

export function Hud({ scene, onHome, modelSelectorProps }: HudProps) {
  const phase = useGamePhase();
  const current = useCurrentPlayer();
  const { soundEnabled, toggleSound } = useSettingsStore();

  const statusText =
    phase === GamePhase.Animating
      ? "⏳ Animando…"
      : phase === GamePhase.GameOver
        ? "🏆 ¡Fin de la partida!"
        : current
          ? `Turno de ${current.id === "player_0" ? "Jugador 1" : "Jugador 2"}`
          : "";

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col p-4 select-none">
      {/* ── Barra superior ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between pointer-events-auto">
        <div className="flex flex-col">
          <h1
            className="text-3xl font-black text-black leading-none tracking-tight cursor-pointer"
            onClick={onHome}
          >
            boop<span className="text-pink-400">.</span>
          </h1>
          {scene === "game" && statusText && (
            <p className="text-xs font-bold text-black/50 mt-0.5">
              {statusText}
            </p>
          )}
          {scene === "modelSelector" && (
            <p className="text-xs font-bold text-black/50 mt-0.5">
              Elige tu equipo
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={toggleSound} className="bg-yellow-300">
            <img
              className="h-6"
              src={
                soundEnabled ? "/icons/speaker.svg" : "/icons/speaker-off.svg"
              }
              alt="sound"
            />
          </Button>
          <Button onClick={() => {}} className="bg-yellow-300">
            <img className="h-6" src="/icons/help.svg" alt="help" />
          </Button>
          <Button
            onClick={() =>
              window.open("https://github.com/Davidgl1987/boop-js", "_blank")
            }
            className="bg-yellow-300"
          >
            <img className="h-6" src="/icons/github.svg" alt="github" />
          </Button>
        </div>
      </div>

      {/* ── Banner de estado SelectLine / SelectPiece ─────────────────── */}
      {scene === "game" && <StatusBanner />}

      {/* ── Spacer ────────────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Panel inferior ────────────────────────────────────────────── */}
      {scene === "game" && (
        <div className="flex items-end justify-between gap-4 pointer-events-auto">
          <PlayerPanel playerIndex={0} />
          <PlayerPanel playerIndex={1} />
        </div>
      )}

      {scene === "modelSelector" && modelSelectorProps && (
        <>
          <div className="flex justify-between gap-4 pointer-events-auto">
            <ModelSelectorPanel
              playerIndex={0}
              onPrev={() => modelSelectorProps.onPrev(0)}
              onNext={() => modelSelectorProps.onNext(0)}
            />
            <ModelSelectorPanel
              playerIndex={1}
              onPrev={() => modelSelectorProps.onPrev(1)}
              onNext={() => modelSelectorProps.onNext(1)}
            />
          </div>
          <div className="text-center mt-8 mb-4">
            <Button
              onClick={modelSelectorProps.onConfirm}
              className="bg-pink-400 self-end"
            >
              ¡Jugar! 🎮
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
