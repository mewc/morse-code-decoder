"use client";

import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// Camera controller with better defaults for our custom tree layout
const CameraController = () => {
  const { camera, size } = useThree();
  // Skip the type annotation for the ref to avoid type errors
  const controls = useRef(null);
  const initialPositionSet = useRef(false);

  useEffect(() => {
    // Only set initial camera position once
    if (!initialPositionSet.current) {
      // Position camera to see the full vertical layout
      camera.position.set(0, 2, 24);
      camera.lookAt(0, 2, 0);

      // Adjust for smaller screens
      if (size.width < 768) {
        camera.position.z = 28;
      }

      initialPositionSet.current = true;
    }
  }, [camera, size]);

  return (
    <OrbitControls
      ref={controls}
      enableDamping
      dampingFactor={0.1}
      minDistance={16}
      maxDistance={36}
      maxPolarAngle={Math.PI / 2} // Limit rotation to not go below the horizon
      enablePan={false}
      rotateSpeed={0.5}
      makeDefault
    />
  );
};

export default CameraController;
