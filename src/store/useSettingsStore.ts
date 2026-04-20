import { create } from "zustand";

type PlayerConfig = {
  type: "human" | "cpu";
  model: string;
};

type SettingsStore = {
  soundEnabled: boolean;
  players: [PlayerConfig, PlayerConfig];
  toggleSound: () => void;
  setPlayerType: (playerIndex: number, type: "human" | "cpu") => void;
  setPlayerModel: (playerIndex: number, model: string) => void;
  getPlayerModel: (playerIndex: number) => string;
};

const DEFAULT_PLAYERS: [PlayerConfig, PlayerConfig] = [
  { type: "human", model: "/models/animal-cat.glb" },
  { type: "cpu", model: "/models/animal-dog.glb" },
];

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
  soundEnabled: true,
  players: DEFAULT_PLAYERS,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setPlayerType: (playerIndex, type) =>
    set((state) => {
      const newPlayers = [...state.players] as [PlayerConfig, PlayerConfig];
      newPlayers[playerIndex].type = type;
      return { players: newPlayers };
    }),
  setPlayerModel: (playerIndex, model) =>
    set((state) => {
      const newPlayers = [...state.players] as [PlayerConfig, PlayerConfig];
      newPlayers[playerIndex].model = model;
      return { players: newPlayers };
    }),
  getPlayerModel: (playerIndex) => get().players[playerIndex].model,
}));
