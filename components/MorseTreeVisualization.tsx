"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Line,
  useTexture,
  MeshReflectorMaterial,
  MeshTransmissionMaterial,
  Effects,
  EffectComposer,
  Bloom,
} from "@react-three/drei";
import * as THREE from "three";
import { MorseNode, MorseSymbol } from "@/lib/morse";

// Node component for visualizing a single node in the tree
const Node = ({
  position,
  letter,
  isActive = false,
  scale = 1,
  isRoot = false,
  symbolType = "dot", // 'dot', 'dash', or 'root'
}: {
  position: [number, number, number];
  letter?: string;
  isActive?: boolean;
  scale?: number;
  isRoot?: boolean;
  symbolType?: "dot" | "dash" | "root";
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Determine colors based on active state
  const color = isActive ? "#FFD700" : isRoot ? "#FFDA4D" : "#666666";
  const emissiveColor = isActive ? color : "#000000";
  const emissiveIntensity = isActive ? 1 : 0;

  // Determine size and shape based on symbol type
  const geometry = useMemo(() => {
    if (symbolType === "dot") {
      return (
        <cylinderGeometry args={[0.3 * scale, 0.3 * scale, 0.2 * scale, 32]} />
      );
    } else if (symbolType === "dash") {
      return <boxGeometry args={[0.8 * scale, 0.2 * scale, 0.3 * scale]} />;
    } else {
      // Root node
      return (
        <cylinderGeometry args={[0.5 * scale, 0.5 * scale, 0.2 * scale, 32]} />
      );
    }
  }, [symbolType, scale]);

  // Glow geometry
  const glowGeometry = useMemo(() => {
    if (symbolType === "dot") {
      return (
        <cylinderGeometry args={[0.4 * scale, 0.4 * scale, 0.3 * scale, 32]} />
      );
    } else if (symbolType === "dash") {
      return <boxGeometry args={[1 * scale, 0.3 * scale, 0.4 * scale]} />;
    } else {
      // Root node
      return (
        <cylinderGeometry args={[0.7 * scale, 0.7 * scale, 0.3 * scale, 32]} />
      );
    }
  }, [symbolType, scale]);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }

    if (glowRef.current && isActive) {
      // Pulse glow for active nodes
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      glowRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group position={position}>
      {/* Glow effect */}
      <mesh
        ref={glowRef}
        position={[0, 0, 0]}
        rotation={symbolType !== "dash" ? [Math.PI / 2, 0, 0] : undefined}
      >
        {glowGeometry}
        <meshBasicMaterial
          color={isActive ? "#FFDA4D" : "#333333"}
          transparent
          opacity={isActive ? 0.5 : 0.15}
        />
      </mesh>

      {/* Main node */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        rotation={symbolType !== "dash" ? [Math.PI / 2, 0, 0] : undefined}
      >
        {geometry}
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Letter label */}
      {letter && (
        <Text
          position={[0, 0, 0.3]}
          fontSize={0.3 * scale}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
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
  const ref = useRef<any>();

  useFrame((state) => {
    if (ref.current && isActive) {
      // Animated color for active connections
      ref.current.material.color.setHSL(
        0.14,
        1,
        0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.1
      );
    }
  });

  return (
    <>
      {/* Main connection line */}
      <Line
        ref={ref}
        points={[start, end]}
        color={isActive ? "#FFDA4D" : "#444444"}
        lineWidth={isActive ? 2.5 : 1.5}
      />

      {/* Glow effect for active connections */}
      {isActive && (
        <Line
          points={[start, end]}
          color="#FFDA4D"
          transparent
          opacity={0.3}
          lineWidth={5}
        />
      )}
    </>
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
  pathSoFar = "",
}: {
  root: MorseNode;
  activePath?: MorseSymbol[];
  basePosition?: [number, number, number];
  depth?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  pathSoFar?: string;
}) => {
  const [x, y, z] = basePosition;
  const isActive = depth === activePath.length;

  // Calculate spread factor to widen the tree as we go deeper
  const spreadFactor = Math.pow(1.5, depth);
  const currentHorizontalSpacing = horizontalSpacing * spreadFactor;

  // Determine symbol type from path
  const getSymbolType = () => {
    if (depth === 0) return "root";
    // Get the last character of the path
    const lastSymbol = pathSoFar.charAt(pathSoFar.length - 1);
    return lastSymbol === "." ? "dot" : "dash";
  };

  return (
    <group>
      {/* Current node */}
      <Node
        position={[x, y, z]}
        letter={root.letter}
        isActive={isActive}
        scale={depth === 0 ? 1.5 : 1}
        isRoot={depth === 0}
        symbolType={getSymbolType()}
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
            pathSoFar={pathSoFar + "."}
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
            pathSoFar={pathSoFar + "-"}
          />
        </>
      )}
    </group>
  );
};

// Entry arrow at the top of the diagram
const EntryArrow = ({ isActive = false }: { isActive?: boolean }) => {
  const ref = useRef<any>();

  useFrame((state) => {
    if (ref.current && isActive) {
      // Animated color for active entry
      ref.current.material.color.setHSL(
        0.14,
        1,
        0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.1
      );
    }
  });

  // Create an arrow-like shape
  return (
    <>
      {/* Main line */}
      <Line
        ref={ref}
        points={[
          [0, 7, 0],
          [0, 4.5, 0],
        ]}
        color={isActive ? "#FFDA4D" : "#555555"}
        lineWidth={isActive ? 3 : 2}
      />

      {/* Arrow head */}
      <mesh position={[0, 4.2, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshStandardMaterial
          color={isActive ? "#FFDA4D" : "#555555"}
          emissive={isActive ? "#FFDA4D" : "#000000"}
          emissiveIntensity={isActive ? 0.8 : 0}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Glow effect for active entry */}
      {isActive && (
        <>
          <Line
            points={[
              [0, 7, 0],
              [0, 4.5, 0],
            ]}
            color="#FFDA4D"
            transparent
            opacity={0.3}
            lineWidth={6}
          />
          <mesh position={[0, 4.2, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.3, 0.7, 8]} />
            <meshBasicMaterial color="#FFDA4D" transparent opacity={0.3} />
          </mesh>
        </>
      )}
    </>
  );
};

// Background panel with metallic texture
const Background = () => {
  return (
    <mesh position={[0, 0, -12]} receiveShadow>
      <planeGeometry args={[50, 40]} />
      <meshStandardMaterial color="#121212" metalness={0.8} roughness={0.4} />
    </mesh>
  );
};

// Camera controller with better defaults
const CameraController = () => {
  const { camera, size } = useThree();
  const controls = useRef<any>();

  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 0, 14);
    camera.lookAt(0, 2, 0);

    // Adjust for smaller screens
    if (size.width < 768) {
      camera.position.z = 18;
    }
  }, [camera, size]);

  return (
    <OrbitControls
      ref={controls}
      enableDamping
      dampingFactor={0.1}
      minDistance={8}
      maxDistance={20}
      enablePan={false}
      rotateSpeed={0.5}
    />
  );
};

// Main component for the Morse tree visualization
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
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5,
        }}
        camera={{ fov: 45 }}
      >
        <color attach="background" args={["#111111"]} />

        <CameraController />

        {/* Scene lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} castShadow />
        <pointLight position={[-10, -10, 5]} intensity={0.4} />
        <spotLight
          position={[0, 15, 5]}
          angle={0.5}
          penumbra={0.8}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* Scene fog for depth */}
        <fog attach="fog" args={["#000000", 12, 40]} />

        {/* Background */}
        <Background />

        {/* Entry arrow at the top */}
        <EntryArrow isActive={isPlaying} />

        {/* Morse tree visualization */}
        <TreeVisualization root={morseTree} activePath={currentPath} />

        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            intensity={0.8}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default MorseTreeVisualization;

