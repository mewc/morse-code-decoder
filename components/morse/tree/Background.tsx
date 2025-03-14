"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

// Background component with improved lighting and atmosphere
const Background = () => {
  const lightsRef = useRef<THREE.PointLight>(null);

  // Subtle animation for lights
  useFrame((state) => {
    if (lightsRef.current) {
      // Subtle pulsing effect for the accent light
      const time = state.clock.getElapsedTime();
      const intensity = 0.7 + Math.sin(time * 0.5) * 0.3;
      lightsRef.current.intensity = intensity;
    }
  });

  return (
    <>
      {/* Ambient light for general illumination */}
      <ambientLight intensity={0.5} />

      {/* Main directional light from top-right */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Fill light from opposite direction */}
      <directionalLight position={[-5, 5, -5]} intensity={0.7} />

      {/* Bottom accent light with animation */}
      <pointLight
        ref={lightsRef}
        position={[0, -15, 0]}
        intensity={0.7}
        color="#6A7A8A"
      />

      {/* Subtle fog for depth */}
      <fog attach="fog" args={["#10131f", 25, 50]} />

      {/* Background gradient plane */}
      <mesh position={[0, 0, -15]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#0F1524" transparent opacity={0.8} />
      </mesh>

      {/* Subtle grid lines for reference (more visible now) */}
      <group>
        {/* Horizontal lines */}
        {Array.from({ length: 15 }).map((_, i) => (
          <Line
            key={`h-line-${i}`}
            points={[
              [-15, -10 + i * 2, -10],
              [15, -10 + i * 2, -10],
            ]}
            color="#2A3A4A"
            lineWidth={1}
            opacity={0.3}
            transparent
          />
        ))}

        {/* Vertical lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Line
            key={`v-line-${i}`}
            points={[
              [-14 + i * 4, -10, -10],
              [-14 + i * 4, 20, -10],
            ]}
            color="#2A3A4A"
            lineWidth={1}
            opacity={0.3}
            transparent
          />
        ))}
      </group>
    </>
  );
};

export default Background;
