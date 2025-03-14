"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";

// NeonPipe component for visualizing the connections between nodes
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
  const startY = start[1];
  const endX = end[0];

  // Create midpoint with a right angle
  const midPoint: [number, number, number] = [endX, startY, end[2]];

  // Define colors based on state
  const baseColor = isActive ? "#FFD700" : isCompleted ? "#E5C100" : "#555555";
  const glowColor = isActive ? "#FFD700" : isCompleted ? "#E5C100" : "#444444";

  // Define line properties
  const mainLineWidth = isActive ? 2.5 : isCompleted ? 2 : 1.5;
  const glowLineWidth = isActive ? 5 : isCompleted ? 4 : 2;
  const mainOpacity = isActive ? 1 : isCompleted ? 0.9 : 0.6;
  const glowOpacity = isActive ? 0.3 : isCompleted ? 0.2 : 0.05;

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
