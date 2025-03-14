"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";

// NeonPipe component for creating direct connections with neon-like glow
const NeonPipe = ({
  start,
  end,
  isActive = false,
  isCompleted = false,
}: {
  start: [number, number, number];
  end: [number, number, number];
  isActive?: boolean;
  isCompleted?: boolean;
}) => {
  // Create a direct line between points
  const points = useMemo(() => {
    return [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  }, [start, end]);

  // Define colors based on state
  const baseColor = isActive ? "#FFD700" : isCompleted ? "#E5C100" : "#555555";
  const glowColor = isActive ? "#FFD700" : isCompleted ? "#E5C100" : "#444444";

  // Define line properties
  const mainLineWidth = isActive ? 3 : isCompleted ? 2.5 : 1.8;
  const glowLineWidth = isActive ? 6 : isCompleted ? 5 : 3;
  const mainOpacity = isActive ? 1 : isCompleted ? 0.9 : 0.7;
  const glowOpacity = isActive ? 0.4 : isCompleted ? 0.3 : 0.1;

  return (
    <>
      {/* Main line */}
      <Line
        points={points}
        color={baseColor}
        lineWidth={mainLineWidth}
        opacity={mainOpacity}
      />

      {/* Glow effect */}
      <Line
        points={points}
        color={glowColor}
        lineWidth={glowLineWidth}
        transparent
        opacity={glowOpacity}
      />
    </>
  );
};

export default NeonPipe;
