"use client";

import { MorseNode, MorseSymbol } from "@/lib/morse";
import Node from "./Node";
import NeonPipe from "./NeonPipe";

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
  // with the active path at each level
  // Convert the activePath array to a string for direct comparison
  const activePathString = activePath.slice(0, depth).join("");
  const isOnActivePath = pathSoFar === activePathString;
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

  // Used for debugging
  console.log(
    `Node at depth ${depth}, path "${pathSoFar}", isOnActivePath: ${isOnActivePath}, activePath: "${activePathString}"`
  );

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

export default TreeVisualization;
