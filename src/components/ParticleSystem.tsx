'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createParticleTexture } from '@/lib/three/materials';

interface ParticleSystemProps {
  count?: number;
  spread?: number;
}

export default function ParticleSystem({ count = 500, spread = 8 }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, sizes, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = spread * (0.3 + Math.random() * 0.7);

      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      pos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius;
      pos[i * 3 + 2] = Math.cos(phi) * radius * 0.6;

      siz[i] = Math.random() * 0.08 + 0.02;
      spd[i] = 0.2 + Math.random() * 0.8;
    }

    return { positions: pos, sizes: siz, speeds: spd };
  }, [count, spread]);

  const texture = useMemo(() => createParticleTexture(), []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.elapsedTime;
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Gentle floating motion
      const i3 = i * 3;
      const baseX = positions[i3];
      const baseY = positions[i3 + 1];
      const baseZ = positions[i3 + 2];

      posArray[i3] = baseX + Math.sin(t * speeds[i] + i) * 0.3;
      posArray[i3 + 1] = baseY + Math.cos(t * speeds[i] * 0.7 + i) * 0.3;
      posArray[i3 + 2] = baseZ + Math.sin(t * speeds[i] * 0.5 + i * 2) * 0.2;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += 0.0002;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(positions), 3]}
          count={count}
          array={new Float32Array(positions)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[new Float32Array(sizes), 1]}
          count={count}
          array={new Float32Array(sizes)}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        color="#D4A843"
        size={0.15}
        sizeAttenuation
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
