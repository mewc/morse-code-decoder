"use client";

import { MorseNode, MorseSymbol } from "@/lib/morse";
import Node from "./Node";
import NeonPipe from "./NeonPipe";

// Tree visualization using recursion with flow-chart style
const TreeVisualization = ({
  root,
  activePath = [],
  letterCompleted = false,
  basePosition = [0, 8, 0],
  depth = 0,
  horizontalSpacing = 2,
  verticalSpacing = 3,
  pathSoFar = "",
  onNodeClick = (letter: string) => {},
}: {
  root: MorseNode;
  activePath?: MorseSymbol[];
  letterCompleted?: boolean;
  basePosition?: [number, number, number];
  depth?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  pathSoFar?: string;
  onNodeClick?: (letter: string) => void;
}) => {
  const [x, y, z] = basePosition;

  // To check if this specific node is active (exactly at the current depth of the active path)
  const isActive =
    depth === activePath.length && pathSoFar === activePath.join("");

  // Check if this node is on the current active path
  const isOnActivePath =
    pathSoFar === activePath.slice(0, depth).join("") &&
    depth <= activePath.length;

  // Only show as completed if this is the final target letter and path is completed
  const isCompleted = letterCompleted && pathSoFar === activePath.join("");

  // Calculate spread factor to widen the tree slightly as we go deeper
  // But with less horizontal spreading than before
  const spreadFactor = Math.pow(1.2, depth);
  const currentHorizontalSpacing = horizontalSpacing * spreadFactor;

  // Determine symbol type from path
  const getSymbolType = () => {
    if (depth === 0) return "root";
    // Get the last character of the path
    const lastSymbol = pathSoFar.charAt(pathSoFar.length - 1);
    return lastSymbol === "." ? "dot" : "dash";
  };

  // Handle node click - play morse code for the letter if it has one
  const handleNodeClick = () => {
    if (root.letter) {
      onNodeClick(root.letter);
    }
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
        onClick={handleNodeClick}
      />

      {/* Dot branch (left) */}
      {root.dot && (
        <>
          <NeonPipe
            start={[x, y, z]}
            end={[x - currentHorizontalSpacing, y - verticalSpacing, z]}
            isActive={activePath[depth] === "." && isOnActivePath}
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
            onNodeClick={onNodeClick}
          />
        </>
      )}

      {/* Dash branch (right) */}
      {root.dash && (
        <>
          <NeonPipe
            start={[x, y, z]}
            end={[x + currentHorizontalSpacing, y - verticalSpacing, z]}
            isActive={activePath[depth] === "-" && isOnActivePath}
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
            onNodeClick={onNodeClick}
          />
        </>
      )}
    </group>
  );
};

export default TreeVisualization;
