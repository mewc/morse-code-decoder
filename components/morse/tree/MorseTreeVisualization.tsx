"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { MorseNode, MorseSymbol } from "@/lib/morse";
import { useCallback } from "react";

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
  onPlayLetter,
}: {
  morseTree: MorseNode;
  currentPath?: MorseSymbol[];
  isPlaying?: boolean;
  letterCompleted?: boolean;
  onPlayLetter?: (letter: string) => void;
}) => {
  // Handle node clicks - only play if not already playing
  const handleNodeClick = useCallback(
    (letter: string) => {
      if (!isPlaying && letter && onPlayLetter) {
        console.log(`Node clicked: ${letter}`);
        onPlayLetter(letter);
      }
    },
    [isPlaying, onPlayLetter]
  );

  // Check if we're at the start of the path (first entry)
  const isAtPathStart = isPlaying && currentPath.length === 0;

  return (
    <div className="h-[800px] rounded-lg overflow-hidden shadow-xl border border-slate-700">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 2, 24], fov: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 2.0, // Increased exposure for better visibility
        }}
      >
        <color attach="background" args={["#10131f"]} />
        <CameraController />

        {/* Background with improved lighting */}
        <Background />

        {/* Entry arrow pointing to the root of the tree - only active at path start */}
        <EntryArrow
          isActive={isAtPathStart}
          isCompleted={isPlaying && currentPath.length > 0 && letterCompleted}
        />

        {/* Morse tree visualization */}
        <TreeVisualization
          root={morseTree}
          activePath={currentPath}
          letterCompleted={letterCompleted}
          onNodeClick={handleNodeClick}
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
