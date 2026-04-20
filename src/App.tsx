/**
 * App.tsx
 *
 * - SceneLoader: esferas de colores que botan (más estético que el cubo wireframe)
 * - La lógica de navegación de modelos está aquí y se pasa al Hud
 * - ModelSelectorScene ya no tiene botones Html, solo los modelos 3D
 */
import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { MODELS } from "./constants";
import { Lights } from "./components/three/Lights";
import { VictoryModal } from "./components/ui/VictoryModal";
import { Hud } from "./components/ui/Hud";
import { HomeScene } from "./scenes/HomeScene";
import { ModelSelectorScene } from "./scenes/ModelSelectorScene";
import { GameScene } from "./scenes/GameScene";
import { useGameStore } from "./store/useGameStore";
import { useSettingsStore } from "./store/useSettingsStore";
import { Loading } from "./components/three/Loading";

type Scene = "home" | "modelSelector" | "game";

function App() {
  const [scene, setScene] = useState<Scene>("home");
  const startGame = useGameStore((s) => s.startGame);
  const setPlayerModel = useSettingsStore((s) => s.setPlayerModel);
  const players = useSettingsStore((s) => s.players);

  const goHome = () => setScene("home");
  const goModelSelector = () => setScene("modelSelector");
  const goGame = () => setScene("game");

  // Lógica de navegación de modelos (compartida con Hud)
  const navigateModel = (playerIndex: 0 | 1, direction: 1 | -1) => {
    const paths = MODELS.map((m) => m.path);
    const curr = paths.indexOf(players[playerIndex].model);
    let next = (curr + direction + paths.length) % paths.length;
    const other = players[playerIndex === 0 ? 1 : 0].model;
    if (paths[next] === other)
      next = (next + direction + paths.length) % paths.length;
    setPlayerModel(playerIndex, paths[next]);
  };

  const modelSelectorProps = {
    onPrev: (i: 0 | 1) => navigateModel(i, -1),
    onNext: (i: 0 | 1) => navigateModel(i, 1),
    onConfirm: () => {
      startGame();
      goGame();
    },
  };

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ near: 0.1, far: 60 }}
      >
        <color attach="background" args={["#a8d8ea"]} />
        <Lights />
        <Suspense fallback={<Loading />}>
          {scene === "home" && <HomeScene onStart={goModelSelector} />}
          {scene === "modelSelector" && <ModelSelectorScene />}
          {scene === "game" && <GameScene />}
        </Suspense>
      </Canvas>

      <Hud
        scene={scene}
        onHome={goHome}
        modelSelectorProps={
          scene === "modelSelector" ? modelSelectorProps : undefined
        }
      />

      <VictoryModal onHome={goHome} onChangeModel={goModelSelector} />
    </>
  );
}

MODELS.forEach((model) => useGLTF.preload(model.path));

export default App;
