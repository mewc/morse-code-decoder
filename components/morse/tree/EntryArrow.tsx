"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Entry arrow component pointing to the root of the morse tree
const EntryArrow = ({
  isActive = false,
  isCompleted = false,
}: {
  isActive?: boolean;
  isCompleted?: boolean;
}) => {
  const arrowRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Colors based on state
  const color = isActive ? "#FFD700" : isCompleted ? "#E5C100" : "#888888";
  const emissiveColor = isActive
    ? "#FFD700"
    : isCompleted
    ? "#E5C100"
    : "#505050";
  const emissiveIntensity = isActive ? 1 : isCompleted ? 0.8 : 0.3;

  // Animation for the arrow
  useFrame((state) => {
    if (arrowRef.current && glowRef.current) {
      if (isActive) {
        // Pulsating animation for active state
        const time = state.clock.getElapsedTime();
        const pulse = Math.sin(time * 4) * 0.1 + 0.9;
        arrowRef.current.scale.set(pulse, pulse, pulse);
        glowRef.current.scale.set(pulse * 1.3, pulse * 1.3, pulse * 1.3);

        // Increase intensity during pulse
        if (arrowRef.current.material instanceof THREE.MeshStandardMaterial) {
          arrowRef.current.material.emissiveIntensity =
            emissiveIntensity * (pulse + 0.2);
        }
      }
    }
  });

  return (
    <group position={[0, 10.5, 0]}>
      {/* Main arrow */}
      <mesh ref={arrowRef} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.3, 0.8, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Glow effect */}
      <mesh ref={glowRef} rotation={[0, 0, Math.PI]} scale={[1.3, 1.3, 1.3]}>
        <coneGeometry args={[0.3, 0.8, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isActive ? 0.4 : isCompleted ? 0.3 : 0.1}
        />
      </mesh>

      {/* Vertical line extending down from the arrow */}
      <mesh position={[0, -0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2, 16]} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity * 0.8}
        />
      </mesh>
    </group>
  );
};

export default EntryArrow;
