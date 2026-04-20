export function Lights() {
  return (
    <>
      {/* Luz ambiente suave — ilumina todo uniformemente */}
      <ambientLight intensity={0.6} color="#fff5e0" />

      {/* Luz principal desde arriba-izquierda — da volumen a las piezas */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.4}
        color="#ffe8c0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.001}
      />

      {/* Luz de relleno desde abajo-derecha — suaviza sombras duras */}
      <directionalLight
        position={[-4, 3, -4]}
        intensity={0.4}
        color="#c8d8ff"
      />

      {/* Luz puntual frontal — brillo en las piezas al mirarlas */}
      <pointLight
        position={[0, 6, 6]}
        intensity={0.6}
        color="#fff0d0"
        distance={20}
      />
    </>
  );
}
