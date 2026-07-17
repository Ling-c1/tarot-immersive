'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Lighting() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const t = clock.elapsedTime * 0.4;
      lightRef.current.intensity = 4 + Math.sin(t * 1.3) * 1.5;
    }
  });

  return (
    <>
      {/* Deep ambient */}
      <ambientLight color="#1a1030" intensity={0.5} />

      {/* Key golden light from above */}
      <directionalLight position={[5, 10, 5]} color="#ffd700" intensity={1.2} />

      {/* Cool fill from below */}
      <directionalLight position={[-3, -2, 2]} color="#3a2a6a" intensity={0.6} />

      {/* Warm accent from side */}
      <directionalLight position={[-5, 3, -3]} color="#8a6030" intensity={0.5} />

      {/* Animated central point light */}
      <pointLight ref={lightRef} position={[0, 1, 4]} color="#D4A843" intensity={4} distance={18} decay={2} />

      {/* Subtle rim light */}
      <pointLight position={[0, 3, -8]} color="#1a0a2e" intensity={2} distance={15} decay={2} />
    </>
  );
}
