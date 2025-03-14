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
  const orbitRef1 = useRef<THREE.Group>(null);
  const orbitRef2 = useRef<THREE.Group>(null);
  const orbitRef3 = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Determine colors based on active state and symbol type
  const color =
    isActive || isCompleted
      ? "#FFD700"
      : isRoot
      ? isActive
        ? "#FFD700"
        : "#FFDA4D" // Root is only bright yellow when active
      : symbolType === "dot"
      ? "#A0A0A0"
      : "#909090";

  const emissiveColor =
    isActive || isCompleted
      ? "#FFD700"
      : isRoot
      ? isActive
        ? "#FFD700"
        : "#FFDA4D"
      : "#303030";

  const emissiveIntensity = isActive
    ? 1
    : isCompleted
    ? 0.8
    : isRoot
    ? isActive
      ? 1
      : 0.5
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

  // Create particle points for orbital rings
  const createParticleRing = (
    radius: number,
    numParticles: number,
    offset: number = 0
  ) => {
    const particles: THREE.Vector3[] = [];
    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2 + offset;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      particles.push(new THREE.Vector3(x, y, 0));
    }
    return particles;
  };

  // Orbital ring geometries (now with 3 rings and particles)
  const orbitalRings = useMemo(() => {
    const baseRadius = symbolType === "root" ? 0.7 * scale : 0.5 * scale;

    return [
      createParticleRing(baseRadius, 20, 0),
      createParticleRing(baseRadius * 1.3, 25, Math.PI / 3),
      createParticleRing(baseRadius * 1.6, 30, Math.PI / 6),
    ];
  }, [symbolType, scale]);

  // Orbital ring color (now orange)
  const orbitalColor = isActive || isCompleted ? "#FFAA00" : "#FF7700";

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
      if (isHovered && !isRoot) {
        const time = state.clock.getElapsedTime();

        if (orbitRef1.current) {
          orbitRef1.current.rotation.z = time * 1.0;
          orbitRef1.current.rotation.x = Math.sin(time * 0.7) * 0.5;
          orbitRef1.current.rotation.y = Math.cos(time * 0.7) * 0.5;
        }

        if (orbitRef2.current) {
          orbitRef2.current.rotation.z = -time * 0.8;
          orbitRef2.current.rotation.x = Math.sin(time * 0.5 + 1) * 0.4;
          orbitRef2.current.rotation.y = Math.cos(time * 0.5 + 1) * 0.4;
        }

        if (orbitRef3.current) {
          orbitRef3.current.rotation.z = time * 1.2;
          orbitRef3.current.rotation.x = Math.sin(time * 0.9 + 2) * 0.3;
          orbitRef3.current.rotation.y = Math.cos(time * 0.9 + 2) * 0.3;
        }
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
          // Only allow hover on non-root nodes
          if (!isRoot) {
            setIsHovered(true);
            document.body.style.cursor = "pointer";
          }
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
            isHovered && !isRoot ? emissiveIntensity * 1.5 : emissiveIntensity
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
          opacity={
            isHovered && !isRoot
              ? 0.5
              : isActive
              ? 0.4
              : isCompleted
              ? 0.3
              : 0.1
          }
        />
      </mesh>

      {/* Orbital rings for hover effect - now with 3 rings of particles */}
      {isHovered && !isRoot && (
        <>
          <group ref={orbitRef1}>
            <points>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  array={
                    new Float32Array(
                      orbitalRings[0].flatMap((v) => [v.x, v.y, v.z])
                    )
                  }
                  count={orbitalRings[0].length}
                  itemSize={3}
                  args={[
                    new Float32Array(
                      orbitalRings[0].flatMap((v) => [v.x, v.y, v.z])
                    ),
                    3,
                  ]}
                />
              </bufferGeometry>
              <pointsMaterial
                size={0.05}
                color={orbitalColor}
                transparent
                opacity={0.8}
              />
            </points>
          </group>

          <group ref={orbitRef2}>
            <points>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  array={
                    new Float32Array(
                      orbitalRings[1].flatMap((v) => [v.x, v.y, v.z])
                    )
                  }
                  count={orbitalRings[1].length}
                  itemSize={3}
                  args={[
                    new Float32Array(
                      orbitalRings[1].flatMap((v) => [v.x, v.y, v.z])
                    ),
                    3,
                  ]}
                />
              </bufferGeometry>
              <pointsMaterial
                size={0.04}
                color={orbitalColor}
                transparent
                opacity={0.7}
              />
            </points>
          </group>

          <group ref={orbitRef3}>
            <points>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  array={
                    new Float32Array(
                      orbitalRings[2].flatMap((v) => [v.x, v.y, v.z])
                    )
                  }
                  count={orbitalRings[2].length}
                  itemSize={3}
                  args={[
                    new Float32Array(
                      orbitalRings[2].flatMap((v) => [v.x, v.y, v.z])
                    ),
                    3,
                  ]}
                />
              </bufferGeometry>
              <pointsMaterial
                size={0.03}
                color={orbitalColor}
                transparent
                opacity={0.6}
              />
            </points>
          </group>
        </>
      )}

      {/* Letter label if provided */}
      {letter && (
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.4}
          color={
            isActive || isCompleted
              ? "#FFFFFF"
              : isHovered && !isRoot
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
