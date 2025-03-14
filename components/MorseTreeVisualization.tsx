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

  // Pulsation effect for active nodes
  useFrame((state) => {
    if (meshRef.current && glowRef.current) {
      if (isActive) {
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
      {/* The node itself */}
      <mesh
        ref={meshRef}
        rotation={symbolType === "dot" ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
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
  const points = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    return [startVec, endVec];
  }, [start, end]);

  const baseColor = isActive ? "#FFD700" : isCompleted ? "#E5C100" : "#555555";
  const lineWidth = isActive ? 3 : isCompleted ? 2.5 : 1.5;
  const lineOpacity = isActive ? 1 : isCompleted ? 0.9 : 0.6;
  
  return (
    <>
      {/* Main line */}
      <Line
        points={points}
        color={baseColor}
        lineWidth={lineWidth}
        opacity={lineOpacity}
      />

      {/* Glow effect */}
      <Line
        points={points}
        color={baseColor}
        lineWidth={lineWidth * 2}
        transparent
        opacity={isActive ? 0.3 : isCompleted ? 0.2 : 0.05}
      />
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
    <>
      {/* Ambient light for general illumination */}
      <ambientLight intensity={0.5} />

      {/* Main directional light */}
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />

      {/* Fill light from opposite direction */}
      <directionalLight position={[-5, 5, -5]} intensity={0.7} />

      {/* Bottom light for added dimension */}
      <pointLight position={[0, -10, 0]} intensity={0.5} color="#4A4A6A" />

      {/* Subtle background gradient */}
      <mesh position={[0, 0, -15]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#0F1524" transparent opacity={0.8} />
      </mesh>
    </>
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
    <div className="h-[600px] rounded-lg overflow-hidden shadow-xl border border-slate-700">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 12], fov: 50 }}>
        <color attach="background" args={["#10131f"]} />
        <CameraController />
        <Background />

        {/* Entry arrow pointing to the root of the tree */}
        <EntryArrow
          isActive={isPlaying && currentPath.length === 0}
          isCompleted={isPlaying && currentPath.length > 0 && letterCompleted}
        />

        {/* Render the morse tree */}
        <TreeVisualization
          root={morseTree}
          activePath={currentPath}
          letterCompleted={letterCompleted}
        />

        {/* Post-processing effects for glow */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            height={300}
            intensity={0.8}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default MorseTreeVisualization;

