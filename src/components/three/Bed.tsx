import { BOARD_SIZE, CELL_SIZE, GAP, BOARD_MARGIN } from "../../constants";

const boardWidth =
  BOARD_SIZE * CELL_SIZE + (BOARD_SIZE - 1) * GAP + BOARD_MARGIN;

export function Bed() {
  return (
    <group>
      {/* Plataforma principal de madera */}
      <mesh position={[0, -0.16, 0]} receiveShadow castShadow>
        <boxGeometry args={[boardWidth, 0.22, boardWidth]} />
        <meshStandardMaterial color="#c8956c" roughness={0.75} metalness={0} />
      </mesh>

      {/* Bisel inferior — borde más oscuro */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[boardWidth + 0.12, 0.06, boardWidth + 0.12]} />
        <meshStandardMaterial color="#a0714a" roughness={0.9} />
      </mesh>

      {/* Tapiz / colcha */}
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[boardWidth - 0.08, 0.04, boardWidth - 0.08]} />
        <meshStandardMaterial color="#e8d5b0" roughness={0.95} />
      </mesh>
    </group>
  );
}
