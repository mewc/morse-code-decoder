"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

// Node component for visualizing a single node in the morse tree
const Node = ({
  position,
  letter,
  isActive = false,
  isCompleted = false,
  scale = 1,
  isRoot = false,
  symbolType = "dot", // 'dot', 'dash', or 'root'
  onClick = () => {},
}: {
  position: [number, number, number];
  letter?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  scale?: number;
  isRoot?: boolean;
  symbolType?: "dot" | "dash" | "root";
  onClick?: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Determine colors based on active state and symbol type
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

  // Determine geometry based on the symbol type
  const geometry = useMemo(() => {
    if (symbolType === "dot") {
      // Dot nodes are spheres
      return <sphereGeometry args={[0.3 * scale, 32, 32]} />;
    } else if (symbolType === "dash") {
      // Dash nodes are cylinders (horizontal)
      return (
        <cylinderGeometry args={[0.2 * scale, 0.2 * scale, 0.8 * scale, 32]} />
      );
    } else {
      // Root node - use a sphere for better visual
      return <sphereGeometry args={[0.5 * scale, 32, 32]} />;
    }
  }, [symbolType, scale]);

  // Orbital ring geometry
  const orbitalRing = useMemo(() => {
    const radius = symbolType === "root" ? 0.7 * scale : 0.5 * scale;
    const curve = new THREE.EllipseCurve(
      0,
      0, // Center x, y
      radius,
      radius, // xRadius, yRadius
      0,
      2 * Math.PI, // startAngle, endAngle
      false, // clockwise
      0 // rotation
    );

    const points = curve.getPoints(50);
    const ringGeometry = new THREE.BufferGeometry().setFromPoints(
      points.map((p) => new THREE.Vector3(p.x, p.y, 0))
    );

    return ringGeometry;
  }, [symbolType, scale]);

  // Pulsation effect for active nodes and orbit animation for hovered nodes
  useFrame((state) => {
    if (meshRef.current && glowRef.current) {
      if (isActive) {
        // Pulsating animation for active nodes
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

      // Orbital animation for hovered nodes
      if (orbitRef.current && isHovered) {
        const time = state.clock.getElapsedTime();
        orbitRef.current.rotation.z = time * 1.5;
        orbitRef.current.rotation.x = Math.sin(time) * 0.5;
        orbitRef.current.rotation.y = Math.cos(time) * 0.5;
      }
    }
  });

  return (
    <group position={position}>
      {/* The main node */}
      <mesh
        ref={meshRef}
        rotation={symbolType === "dash" ? [0, 0, Math.PI / 2] : [0, 0, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setIsHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        {geometry}
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={emissiveColor}
          emissiveIntensity={
            isHovered ? emissiveIntensity * 1.5 : emissiveIntensity
          }
        />
      </mesh>

      {/* Glow effect for the node */}
      <mesh
        ref={glowRef}
        scale={[1.2, 1.2, 1.2]}
        rotation={symbolType === "dash" ? [0, 0, Math.PI / 2] : [0, 0, 0]}
      >
        {geometry}
        <meshBasicMaterial
          color={color}
          transparent={true}
          opacity={isHovered ? 0.5 : isActive ? 0.4 : isCompleted ? 0.3 : 0.1}
        />
      </mesh>

      {/* Orbital ring for hover effect */}
      {isHovered && (
        <group ref={orbitRef}>
          <line>
            <bufferGeometry attach="geometry" {...orbitalRing} />
            <lineBasicMaterial
              attach="material"
              color={isActive || isCompleted ? "#FFD700" : "#4080FF"}
              linewidth={2}
              transparent
              opacity={0.7}
            />
          </line>
        </group>
      )}

      {/* Letter label if provided */}
      {letter && (
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.4}
          color={
            isActive || isCompleted
              ? "#FFFFFF"
              : isHovered
              ? "#FFFFFF"
              : "#AAAAAA"
          }
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {letter}
        </Text>
      )}
    </group>
  );
};

export default Node;
