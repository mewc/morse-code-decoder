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
      <ambientLight intensity={0.6} />

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

      {/* Point light near the top for better highlighting */}
      <pointLight position={[0, 10, 5]} intensity={0.8} color="#4A6A8A" />

      {/* Subtle fog for depth */}
      <fog attach="fog" args={["#10131f", 30, 60]} />

      {/* Background gradient plane */}
      <mesh position={[0, 0, -15]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#0F1524" transparent opacity={0.8} />
      </mesh>

      {/* Subtle grid lines for reference (more vertical) */}
      <group>
        {/* Horizontal lines - more spread out */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Line
            key={`h-line-${i}`}
            points={[
              [-15, -10 + i * 3, -10],
              [15, -10 + i * 3, -10],
            ]}
            color="#2A3A4A"
            lineWidth={1}
            opacity={0.3}
            transparent
          />
        ))}

        {/* Vertical lines - fewer and more spaced */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Line
            key={`v-line-${i}`}
            points={[
              [-12 + i * 5, -12, -10],
              [-12 + i * 5, 12, -10],
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
