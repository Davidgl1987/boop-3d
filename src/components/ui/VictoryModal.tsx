import { useEffect, useState } from "react";
import { useGameStore, useWinner } from "../../store/useGameStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { Button } from "./Button";
import { Panel } from "./Panel";
import { PieceMini } from "../three/PieceMini";
import { getModelDef } from "../../constants";

type PlayerColor = "red-400" | "blue-400";

interface VictoryModalProps {
  onHome: () => void;
  onChangeModel: () => void;
}

export function VictoryModal({ onHome, onChangeModel }: VictoryModalProps) {
  const winner = useWinner();
  const restartGame = useGameStore((s) => s.restartGame);
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (winner) {
      setRendered(true);
      const t = setTimeout(() => setVisible(true), 350);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
      const t = setTimeout(() => setRendered(false), 400);
      return () => clearTimeout(t);
    }
  }, [winner]);

  if (!rendered || !winner) return null;

  const playerIndex = winner.id === "player_0" ? 0 : 1;
  const playerConf = useSettingsStore.getState().players[playerIndex];
  const teamName =
    getModelDef(playerConf.model)?.name ?? `Jugador ${playerIndex + 1}`;
  const color: PlayerColor = playerIndex === 0 ? "red-400" : "blue-400";
  const btnClass = playerIndex === 0 ? "bg-red-400" : "bg-blue-400";

  const nav = (fn: () => void) => {
    setVisible(false);
    setTimeout(fn, 300);
  };

  return (
    <div
      className={`
      absolute inset-0 flex items-center justify-center z-50
      transition-all duration-300
      ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
    `}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div
        className={`
        relative z-10 transition-all duration-300
        ${visible ? "scale-100 translate-y-0" : "scale-90 translate-y-6"}
      `}
      >
        <Panel
          color={color}
          className="flex flex-col items-center gap-5 px-10 py-9 min-w-96"
        >
          <PieceMini
            modelPath={playerConf.model}
            size={96}
            className="border-4 border-black/20"
          />

          <div className="text-center">
            <p className="text-xs font-bold tracking-widest text-black/40 uppercase mb-1">
              ¡Partida terminada!
            </p>
            <h2 className="text-3xl font-black text-black">¡{teamName}!</h2>
            <p className="text-base font-bold text-black/60 mt-1">
              han ganado 🎉
            </p>
          </div>

          <div className={`w-12 h-1.5 rounded-full ${btnClass}`} />

          <div className="flex flex-col gap-3 w-full">
            <Button
              onClick={() => nav(restartGame)}
              className={`${btnClass} w-full`}
            >
              ¡Revancha!
            </Button>
            <Button
              onClick={() => nav(onChangeModel)}
              className="bg-yellow-300 w-full"
            >
              Cambiar equipo
            </Button>
            <Button
              onClick={() => nav(onHome)}
              className="bg-white w-full border-none shadow-none"
            >
              Inicio
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
