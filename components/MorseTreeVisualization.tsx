"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { MorseNode, MorseSymbol } from "@/lib/morse";

// Node component for visualizing a single node in the tree
const Node = ({
  position,
  letter,
  isActive = false,
  scale = 1,
}: {
  position: [number, number, number];
  letter?: string;
  isActive?: boolean;
  scale?: number;
}) => {
  return (
    <group position={position}>
      <mesh scale={scale}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          color={isActive ? "#FFD700" : "#555555"}
          emissive={isActive ? "#FFD700" : "#000000"}
          emissiveIntensity={isActive ? 0.8 : 0}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
      {letter && (
        <Text
          position={[0, 0, 0.45]}
          fontSize={0.3 * scale}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          {letter}
        </Text>
      )}
    </group>
  );
};

// Line component for connecting nodes
const NodeConnection = ({
  start,
  end,
  isActive = false,
}: {
  start: [number, number, number];
  end: [number, number, number];
  isActive?: boolean;
}) => {
  return (
    <Line
      points={[start, end]}
      color={isActive ? "#FFD700" : "#777777"}
      lineWidth={isActive ? 2 : 1}
    />
  );
};

// Tree visualization using recursion
const TreeVisualization = ({
  root,
  activePath = [],
  basePosition = [0, 4, 0],
  depth = 0,
  horizontalSpacing = 2,
  verticalSpacing = 1.5,
}: {
  root: MorseNode;
  activePath?: MorseSymbol[];
  basePosition?: [number, number, number];
  depth?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
}) => {
  const [x, y, z] = basePosition;
  const isActive = depth === activePath.length;

  // Calculate spread factor to widen the tree as we go deeper
  const spreadFactor = Math.pow(1.5, depth);
  const currentHorizontalSpacing = horizontalSpacing * spreadFactor;

  // Recursively render children
  return (
    <group>
      {/* Current node */}
      <Node
        position={[x, y, z]}
        letter={root.letter}
        isActive={isActive}
        scale={depth === 0 ? 1.5 : 1}
      />

      {/* Dot branch (left) */}
      {root.dot && (
        <>
          <NodeConnection
            start={[x, y, z]}
            end={[x - currentHorizontalSpacing, y - verticalSpacing, z]}
            isActive={activePath[depth] === "."}
          />
          <TreeVisualization
            root={root.dot}
            activePath={activePath}
            basePosition={[
              x - currentHorizontalSpacing,
              y - verticalSpacing,
              z,
            ]}
            depth={depth + 1}
            horizontalSpacing={horizontalSpacing}
            verticalSpacing={verticalSpacing}
          />
        </>
      )}

      {/* Dash branch (right) */}
      {root.dash && (
        <>
          <NodeConnection
            start={[x, y, z]}
            end={[x + currentHorizontalSpacing, y - verticalSpacing, z]}
            isActive={activePath[depth] === "-"}
          />
          <TreeVisualization
            root={root.dash}
            activePath={activePath}
            basePosition={[
              x + currentHorizontalSpacing,
              y - verticalSpacing,
              z,
            ]}
            depth={depth + 1}
            horizontalSpacing={horizontalSpacing}
            verticalSpacing={verticalSpacing}
          />
        </>
      )}
    </group>
  );
};

// Entry line at the top of the diagram
const EntryLine = ({ isActive = false }: { isActive?: boolean }) => {
  return (
    <Line
      points={[
        [0, 7, 0],
        [0, 4, 0],
      ]}
      color={isActive ? "#FFD700" : "#777777"}
      lineWidth={isActive ? 3 : 2}
    />
  );
};

// Camera controller to auto position the view
const CameraController = () => {
  const { camera, size } = useThree();
  const controls = useRef<any>();

  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 0, 12);
    camera.lookAt(0, 0, 0);

    // Adjust for smaller screens
    if (size.width < 768) {
      camera.position.z = 16;
    }
  }, [camera, size]);

  return <OrbitControls ref={controls} enableDamping dampingFactor={0.1} />;
};

// Main component that can be used in the app
const MorseTreeVisualization = ({
  morseTree,
  currentPath = [],
  isPlaying = false,
}: {
  morseTree: MorseNode;
  currentPath?: MorseSymbol[];
  isPlaying?: boolean;
}) => {
  return (
    <div className="w-full h-[60vh] bg-neutral-900 rounded-lg overflow-hidden">
      <Canvas shadows>
        <CameraController />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {/* Entry line at the top */}
        <EntryLine isActive={isPlaying} />

        {/* Morse tree visualization */}
        <TreeVisualization root={morseTree} activePath={currentPath} />
      </Canvas>
    </div>
  );
};

export default MorseTreeVisualization;
