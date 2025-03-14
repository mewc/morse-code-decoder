"use client";

import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// Camera controller with better defaults
const CameraController = () => {
  const { camera, size } = useThree();
  // Skip the type annotation for the ref to avoid type errors
  const controls = useRef(null);
  const initialPositionSet = useRef(false);

  useEffect(() => {
    // Only set initial camera position once
    if (!initialPositionSet.current) {
      // Set initial camera position
      camera.position.set(0, 0, 18);
      camera.lookAt(0, 2, 0);

      // Adjust for smaller screens
      if (size.width < 768) {
        camera.position.z = 24;
      }

      initialPositionSet.current = true;
    }
  }, [camera, size]);

  return (
    <OrbitControls
      ref={controls}
      enableDamping
      dampingFactor={0.1}
      minDistance={10}
      maxDistance={30}
      enablePan={false}
      rotateSpeed={0.5}
      makeDefault
    />
  );
};

export default CameraController;
