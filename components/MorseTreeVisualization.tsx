"use client";

import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { MorseNode, MorseSymbol } from "@/lib/morse";

// Node component for visualizing a single node in the tree
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

  // Determine colors based on active state
  const color =
    isActive || isCompleted ? "#FFD700" : isRoot ? "#FFDA4D" : "#666666";
  const emissiveColor = isActive || isCompleted ? color : "#000000";
  const emissiveIntensity = isActive ? 1 : isCompleted ? 0.8 : 0;

  // Determine size and shape based on symbol type
  const geometry = useMemo(() => {
    if (symbolType === "dot") {
      return (
        <cylinderGeometry args={[0.3 * scale, 0.3 * scale, 0.2 * scale, 32]} />
      );
    } else if (symbolType === "dash") {
      return <boxGeometry args={[0.8 * scale, 0.2 * scale, 0.3 * scale]} />;
    } else {
      // Root node - use a sphere for better visual
      return <sphereGeometry args={[0.5 * scale, 32, 32]} />;
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
      return <sphereGeometry args={[0.7 * scale, 32, 32]} />;
    }
  }, [symbolType, scale]);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }

    if (glowRef.current && (isActive || isCompleted)) {
      // Pulse glow for active nodes
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      glowRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group position={position}>
      {/* Hyperrealistic metallic effect */}
      <mesh
        ref={glowRef}
        position={[0, 0, 0]}
        rotation={symbolType !== "dash" ? [Math.PI / 2, 0, 0] : undefined}
      >
        {glowGeometry}
        <meshBasicMaterial
          color={isActive ? "#FFDA4D" : isCompleted ? "#FFB700" : "#333333"}
          transparent
          opacity={isActive ? 0.5 : isCompleted ? 0.3 : 0.15}
        />
      </mesh>

      {/* Main node with enhanced materials */}
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
  // Extract only the coordinates we need
  const startY = start[1];
  const endX = end[0];

  // Create midpoint with a right angle
  const midPoint: [number, number, number] = [endX, startY, end[2]];

  // Determine the color
  const color = isActive ? "#FFDA4D" : isCompleted ? "#FFB700" : "#333333";
  const glowColor = isActive ? "#FFDA4D" : isCompleted ? "#FFB700" : "#444444";
  const width = isActive ? 2.5 : isCompleted ? 2 : 1.5;
  const glowWidth = isActive ? 5 : isCompleted ? 4 : 0;
  const opacity = isActive ? 0.5 : isCompleted ? 0.3 : 0.1;

  return (
    <>
      {/* First segment (horizontal) - Outer glow */}
      <Line
        points={[start, midPoint]}
        color={glowColor}
        transparent
        opacity={opacity}
        lineWidth={width + 2}
      />

      {/* First segment (horizontal) - Inner line */}
      <Line points={[start, midPoint]} color={color} lineWidth={width} />

      {/* Second segment (vertical) - Outer glow */}
      <Line
        points={[midPoint, end]}
        color={glowColor}
        transparent
        opacity={opacity}
        lineWidth={width + 2}
      />

      {/* Second segment (vertical) - Inner line */}
      <Line points={[midPoint, end]} color={color} lineWidth={width} />

      {/* Extra glow effect for active connections */}
      {(isActive || isCompleted) && (
        <>
          <Line
            points={[start, midPoint]}
            color={glowColor}
            transparent
            opacity={opacity * 0.8}
            lineWidth={glowWidth}
          />
          <Line
            points={[midPoint, end]}
            color={glowColor}
            transparent
            opacity={opacity * 0.8}
            lineWidth={glowWidth}
          />
        </>
      )}
    </>
  );
};

// Tree visualization using recursion with flow-chart style
const TreeVisualization = ({
  root,
  activePath = [],
  letterCompleted = false,
  basePosition = [0, 4, 0],
  depth = 0,
  horizontalSpacing = 2.5,
  verticalSpacing = 1.8,
  pathSoFar = "",
}: {
  root: MorseNode;
  activePath?: MorseSymbol[];
  letterCompleted?: boolean;
  basePosition?: [number, number, number];
  depth?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  pathSoFar?: string;
}) => {
  const [x, y, z] = basePosition;
  const isActive = depth === activePath.length;

  // Check if this node is on the current active path by comparing the path so far
  // with the active path at each level - should match exactly
  const isOnActivePath =
    depth <= activePath.length &&
    pathSoFar === activePath.slice(0, depth).join("");

  const isCompleted = letterCompleted && isOnActivePath;

  // Calculate spread factor to widen the tree as we go deeper
  const spreadFactor = Math.pow(1.3, depth);
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
        isCompleted={isCompleted}
        scale={depth === 0 ? 1.5 : 1}
        isRoot={depth === 0}
        symbolType={getSymbolType()}
      />

      {/* Dot branch (left) */}
      {root.dot && (
        <>
          <NeonPipe
            start={[x, y, z]}
            end={[x - currentHorizontalSpacing, y - verticalSpacing, z]}
            isActive={activePath[depth] === "."}
            isCompleted={
              letterCompleted && activePath[depth] === "." && isOnActivePath
            }
          />
          <TreeVisualization
            root={root.dot}
            activePath={activePath}
            letterCompleted={letterCompleted}
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
          <NeonPipe
            start={[x, y, z]}
            end={[x + currentHorizontalSpacing, y - verticalSpacing, z]}
            isActive={activePath[depth] === "-"}
            isCompleted={
              letterCompleted && activePath[depth] === "-" && isOnActivePath
            }
          />
          <TreeVisualization
            root={root.dash}
            activePath={activePath}
            letterCompleted={letterCompleted}
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
const EntryArrow = ({
  isActive = false,
  isCompleted = false,
}: {
  isActive?: boolean;
  isCompleted?: boolean;
}) => {
  // Create an arrow-like shape
  const color = isActive ? "#FFDA4D" : isCompleted ? "#FFB700" : "#555555";
  const glowColor = isActive ? "#FFDA4D" : isCompleted ? "#FFB700" : "#222222";
  const emissiveIntensity = isActive ? 0.8 : isCompleted ? 0.6 : 0;

  return (
    <>
      {/* Main line */}
      <Line
        points={[
          [0, 7, 0],
          [0, 4.5, 0],
        ]}
        color={color}
        lineWidth={isActive || isCompleted ? 3 : 2}
      />

      {/* Glow effect */}
      <Line
        points={[
          [0, 7, 0],
          [0, 4.5, 0],
        ]}
        color={glowColor}
        transparent
        opacity={isActive || isCompleted ? 0.3 : 0.1}
        lineWidth={isActive || isCompleted ? 6 : 3}
      />

      {/* Arrow head */}
      <mesh position={[0, 4.2, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Glow effect for active entry */}
      {(isActive || isCompleted) && (
        <mesh position={[0, 4.2, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.3, 0.7, 8]} />
          <meshBasicMaterial color={glowColor} transparent opacity={0.3} />
        </mesh>
      )}
    </>
  );
};

// Background panel with grid lines for cyber look
const Background = () => {
  return (
    <group>
      {/* Main background */}
      <mesh position={[0, 0, -12]} receiveShadow>
        <planeGeometry args={[50, 40]} />
        <meshStandardMaterial
          color="#121212"
          metalness={0.8}
          roughness={0.4}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Grid lines */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Line
          key={`horizontal-${i}`}
          points={[
            [-25, -20 + i * 2, -11.9],
            [25, -20 + i * 2, -11.9],
          ]}
          color="#333333"
          transparent
          opacity={0.3}
          lineWidth={1}
        />
      ))}

      {Array.from({ length: 20 }).map((_, i) => (
        <Line
          key={`vertical-${i}`}
          points={[
            [-25 + i * 2.5, -20, -11.9],
            [-25 + i * 2.5, 20, -11.9],
          ]}
          color="#333333"
          transparent
          opacity={0.3}
          lineWidth={1}
        />
      ))}
    </group>
  );
};

// Camera controller with better defaults
const CameraController = () => {
  const { camera, size } = useThree();
  // Skip the type annotation for the ref to avoid type errors
  const controls = useRef(null);

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
  letterCompleted = false,
}: {
  morseTree: MorseNode;
  currentPath?: MorseSymbol[];
  isPlaying?: boolean;
  letterCompleted?: boolean;
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

        {/* Enhanced scene lighting for realistic look */}
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

        {/* Background with grid */}
        <Background />

        {/* Entry arrow at the top */}
        <EntryArrow
          isActive={isPlaying && !letterCompleted}
          isCompleted={letterCompleted}
        />

        {/* Morse tree visualization */}
        <TreeVisualization
          root={morseTree}
          activePath={currentPath}
          letterCompleted={letterCompleted}
        />

        {/* Enhanced post-processing effects */}
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

