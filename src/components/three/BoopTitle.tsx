/**
 * BoopTitle.tsx — Título 3D estilo cartoon.
 *
 * Técnica outline cartoon: renderizamos el texto dos veces.
 *  1. Versión negra ligeramente más grande con side=BackSide (solo cara trasera)
 *     → crea el borde negro al asomarse por los bordes
 *  2. Versión coloreada normal encima
 *
 * El texto flota con una animación de entrada desde el fondo.
 */
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Center, Float, Text3D } from "@react-three/drei";
import { useRef } from "react";

const FONT = "/fonts/Inter_Bold.json";
const TEXT_PROPS = {
  curveSegments: 32,
  bevelEnabled: true,
  bevelSize: 0.04,
  bevelThickness: 0.04,
  height: 0.5,
  lineHeight: 0.5,
  letterSpacing: -0.06,
  size: 1.1,
  font: FONT,
} as const;

export const BoopTitle = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      0,
      0.08,
    );
  });

  return (
    <Center ref={groupRef} rotation={[-0.15, -0.1, 0]} position={[0, 1.2, -60]}>
      <Float>
        <group>
          {/* Outline: misma malla, levemente más grande, cara trasera negra */}
          <Text3D
            {...TEXT_PROPS}
            scale={[1.06, 1.06, 1.06]}
            position={[-0.03, -0.03, -0.03]}
          >
            boop.
            <meshStandardMaterial
              color="#111111"
              side={THREE.BackSide}
              roughness={1}
            />
          </Text3D>

          {/* Texto principal: color vivo */}
          <Text3D {...TEXT_PROPS} letterSpacing={-0.005}>
            boop.
            <meshStandardMaterial
              color="#ff6b9d"
              roughness={0.3}
              metalness={0.1}
            />
          </Text3D>
        </group>
      </Float>
    </Center>
  );
};
