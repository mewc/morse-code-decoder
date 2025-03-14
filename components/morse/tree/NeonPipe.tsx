"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";

// NeonPipe component for creating right-angled, neon-like connections
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
  // Create a right-angled path using three points
  // Extract coordinates we need
  const [, startY, startZ] = start;
  const [endX, ,] = end;

  // Create midpoint with a right angle
  const midPoint: [number, number, number] = [endX, startY, startZ];

  // Define colors based on state
  const baseColor = isActive ? "#FFD700" : isCompleted ? "#E5C100" : "#555555";
  const glowColor = isActive ? "#FFD700" : isCompleted ? "#E5C100" : "#444444";

  // Define line properties
  const mainLineWidth = isActive ? 3 : isCompleted ? 2.5 : 1.8;
  const glowLineWidth = isActive ? 6 : isCompleted ? 5 : 3;
  const mainOpacity = isActive ? 1 : isCompleted ? 0.9 : 0.7;
  const glowOpacity = isActive ? 0.4 : isCompleted ? 0.3 : 0.1;

  // Create points arrays for the two segments
  const horizontalPoints = useMemo(() => {
    return [new THREE.Vector3(...start), new THREE.Vector3(...midPoint)];
  }, [start, midPoint]);

  const verticalPoints = useMemo(() => {
    return [new THREE.Vector3(...midPoint), new THREE.Vector3(...end)];
  }, [midPoint, end]);

  return (
    <>
      {/* Horizontal segment (first part of the path) */}
      <group>
        {/* Main line */}
        <Line
          points={horizontalPoints}
          color={baseColor}
          lineWidth={mainLineWidth}
          opacity={mainOpacity}
        />

        {/* Glow effect */}
        <Line
          points={horizontalPoints}
          color={glowColor}
          lineWidth={glowLineWidth}
          transparent
          opacity={glowOpacity}
        />
      </group>

      {/* Vertical segment (second part of the path) */}
      <group>
        {/* Main line */}
        <Line
          points={verticalPoints}
          color={baseColor}
          lineWidth={mainLineWidth}
          opacity={mainOpacity}
        />

        {/* Glow effect */}
        <Line
          points={verticalPoints}
          color={glowColor}
          lineWidth={glowLineWidth}
          transparent
          opacity={glowOpacity}
        />
      </group>
    </>
  );
};

export default NeonPipe;
