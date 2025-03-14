"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

// Node component for visualizing a single node in the morse tree
const Node = ({
  position,
  letter,
  isActive = false,
  isCompleted = false,
  scale = 1,
  isRoot = false,
  symbolType = "dot", // 'dot', 'dash', or 'root'
}: {
  position: [number, number, number];
  letter?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  scale?: number;
  isRoot?: boolean;
  symbolType?: "dot" | "dash" | "root";
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Determine colors based on active state and symbol type
  const color =
    isActive || isCompleted
      ? "#FFD700"
      : isRoot
      ? "#FFDA4D"
      : symbolType === "dot"
      ? "#A0A0A0"
      : "#909090";

  const emissiveColor =
    isActive || isCompleted ? "#FFD700" : isRoot ? "#FFDA4D" : "#303030";

  const emissiveIntensity = isActive
    ? 1
    : isCompleted
    ? 0.8
    : isRoot
    ? 0.5
    : 0.2;

  // Determine geometry based on the symbol type
  const geometry = useMemo(() => {
    if (symbolType === "dot") {
      // Dot nodes are cylinders (like in the reference image)
      return (
        <cylinderGeometry args={[0.3 * scale, 0.3 * scale, 0.2 * scale, 32]} />
      );
    } else if (symbolType === "dash") {
      // Dash nodes are rectangles (like in the reference image)
      return <boxGeometry args={[0.8 * scale, 0.2 * scale, 0.3 * scale]} />;
    } else {
      // Root node - use a sphere for better visual
      return <sphereGeometry args={[0.5 * scale, 32, 32]} />;
    }
  }, [symbolType, scale]);

  // Pulsation effect for active nodes
  useFrame((state) => {
    if (meshRef.current && glowRef.current) {
      if (isActive) {
        // Pulsating animation for active nodes
        const time = state.clock.getElapsedTime();
        const pulse = Math.sin(time * 4) * 0.1 + 0.9;
        meshRef.current.scale.set(pulse, pulse, pulse);
        glowRef.current.scale.set(pulse * 1.2, pulse * 1.2, pulse * 1.2);

        // Increase intensity during pulse
        if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
          meshRef.current.material.emissiveIntensity =
            emissiveIntensity * (pulse + 0.2);
        }
      } else if (isCompleted) {
        // Static glow for completed nodes
        if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
          meshRef.current.material.emissiveIntensity = emissiveIntensity;
        }
      }
    }
  });

  return (
    <group position={position}>
      {/* The main node */}
      <mesh
        ref={meshRef}
        rotation={symbolType === "dot" ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
        castShadow
        receiveShadow
      >
        {geometry}
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Glow effect for the node */}
      <mesh
        ref={glowRef}
        scale={[1.2, 1.2, 1.2]}
        rotation={symbolType === "dot" ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
      >
        {geometry}
        <meshBasicMaterial
          color={color}
          transparent={true}
          opacity={isActive ? 0.4 : isCompleted ? 0.3 : 0.1}
        />
      </mesh>

      {/* Letter label if provided */}
      {letter && (
        <Text
          position={[0, symbolType === "dot" ? -0.3 : -0.3, 0]}
          fontSize={0.35}
          color={isActive || isCompleted ? "#FFFFFF" : "#AAAAAA"}
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {letter}
        </Text>
      )}
    </group>
  );
};

export default Node;
