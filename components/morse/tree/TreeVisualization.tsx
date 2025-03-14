"use client";

import { MorseNode, MorseSymbol } from "@/lib/morse";
import Node from "./Node";
import NeonPipe from "./NeonPipe";

// Predefined positions for nodes to create a more compact, vertical layout
// Format: [letter, x, y, z]
const NODE_POSITIONS: Record<string, [number, number, number]> = {
  // Top row
  "ROOT": [0, 8, 0],
  "E": [-2, 6, 0],
  "T": [2, 6, 0],
  "I": [-4, 6, 0],
  "S": [-6, 6, 0], 
  "H": [-8, 6, 0],
  "M": [4, 6, 0],
  "O": [6, 6, 0],
  
  // Second row
  "A": [-3, 4, 0],
  "N": [1, 4, 0],
  "U": [-5, 4, 0],
  "V": [-7, 4, 0],
  "G": [3, 4, 0],
  "Q": [5, 4, 0],
  
  // Third row
  "R": [-2, 2, 0],
  "W": [-4, 2, 0],
  "F": [-6, 2, 0],
  "Z": [0, 2, 0],
  
  // Fourth row
  "L": [-1, 0, 0],
  "P": [-3, 0, 0],
  "D": [1, 0, 0],
  "B": [3, 0, 0],
  "K": [5, 0, 0],
  
  // Fifth row
  "J": [-2, -2, 0],
  "X": [2, -2, 0],
  "C": [4, -2, 0],
  "Y": [6, -2, 0],
};

// Tree visualization with custom positioning for a more vertical layout
const TreeVisualization = ({
  root,
  activePath = [],
  letterCompleted = false,
  pathSoFar = "",
  onNodeClick = (letter: string) => {},
}: {
  root: MorseNode;
  activePath?: MorseSymbol[];
  letterCompleted?: boolean;
  pathSoFar?: string;
  onNodeClick?: (letter: string) => void;
}) => {
  // Recursive function to build the entire tree with custom node positioning
  const renderNode = (
    node: MorseNode,
    path: string = "",
    parentPosition: [number, number, number] | null = null
  ) => {
    if (!node) return null;

    // Get position for this node - either from predefined positions or place it dynamically
    let position: [number, number, number];

    if (path === "") {
      // Root node
      position = NODE_POSITIONS["ROOT"];
    } else if (node.letter && NODE_POSITIONS[node.letter]) {
      // Use predefined position for known letters
      position = NODE_POSITIONS[node.letter];
    } else {
      // Fallback for unknown nodes
      const offset = path.endsWith(".") ? -1 : 1;
      position = parentPosition
        ? [parentPosition[0] + offset, parentPosition[1] - 2, 0]
        : [0, 0, 0];
    }

    // To check if this specific node is active
    const isActive =
      path === activePath.join("") && path.length === activePath.length;

    // Check if this node is on the current active path
    const isOnActivePath = path === activePath.slice(0, path.length).join("");

    // Only show as completed if this is the final target letter and path is completed
    const isCompleted = letterCompleted && path === activePath.join("");

    // Determine symbol type from path
    const symbolType =
      path === ""
        ? "root"
        : path.charAt(path.length - 1) === "."
        ? "dot"
        : "dash";

    // Handle node click
    const handleNodeClick = () => {
      if (node.letter) {
        onNodeClick(node.letter);
      }
    };

    return (
      <group key={path || "root"}>
        {/* Draw node */}
        <Node
          position={position}
          letter={node.letter}
          isActive={isActive}
          isCompleted={isCompleted}
          scale={path === "" ? 1.5 : 1}
          isRoot={path === ""}
          symbolType={symbolType}
          onClick={handleNodeClick}
        />

        {/* Connect to parent if not root */}
        {parentPosition && (
          <NeonPipe
            start={parentPosition}
            end={position}
            isActive={
              isOnActivePath &&
              activePath.length >= path.length &&
              path === activePath.slice(0, path.length).join("")
            }
            isCompleted={
              letterCompleted &&
              isOnActivePath &&
              path === activePath.slice(0, path.length).join("")
            }
          />
        )}

        {/* Recursively render children */}
        {node.dot && renderNode(node.dot, path + ".", position)}
        {node.dash && renderNode(node.dash, path + "-", position)}
      </group>
    );
  };

  // Start rendering from the root
  return renderNode(root);
};

export default TreeVisualization;
