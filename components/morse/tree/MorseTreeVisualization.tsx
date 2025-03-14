"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { MorseNode, MorseSymbol } from "@/lib/morse";

import TreeVisualization from "./TreeVisualization";
import EntryArrow from "./EntryArrow";
import Background from "./Background";
import CameraController from "./CameraController";

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
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.8, // Increased exposure for better visibility
        }}
      >
        <color attach="background" args={["#10131f"]} />
        <CameraController />

        {/* Background with improved lighting */}
        <Background />

        {/* Entry arrow pointing to the root of the tree */}
        <EntryArrow
          isActive={isPlaying && currentPath.length === 0}
          isCompleted={isPlaying && currentPath.length > 0 && letterCompleted}
        />

        {/* Morse tree visualization */}
        <TreeVisualization
          root={morseTree}
          activePath={currentPath}
          letterCompleted={letterCompleted}
        />

        {/* Post-processing effects for better glow */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.1} // Lower threshold to catch more elements
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
