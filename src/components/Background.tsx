'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Background() {
  const starsRef = useRef<THREE.Points>(null);
  const orbitGroupRef = useRef<THREE.Group>(null);

  // ── Stars ──
  const { starPos, starColors } = useMemo(() => {
    const count = 1000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 15 + Math.random() * 16;
      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
      pos[i * 3 + 2] = Math.cos(phi) * r;
      const t = Math.random();
      col[i * 3] = t < 0.6 ? 0.7 : t < 0.85 ? 1 : 0.3;
      col[i * 3 + 1] = t < 0.6 ? 0.6 : t < 0.85 ? 1 : 0.3;
      col[i * 3 + 2] = t < 0.6 ? 0.3 : t < 0.85 ? 1 : 0.9;
    }
    return { starPos: pos, starColors: col };
  }, []);

  useFrame(({ clock }) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.00006;
    }
    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.y += 0.0003;
    }
  });

  return (
    <>
      <fog attach="fog" args={['#050510', 10, 40]} />

      {/* Stars */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPos, 3]} count={1000} array={starPos} itemSize={3} />
          <bufferAttribute attach="attributes-color" args={[starColors, 3]} count={1000} array={starColors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.05} vertexColors sizeAttenuation transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* ═══ SOLID ORBITAL LINES ═══ */}
      <group ref={orbitGroupRef}>

        {/* Orbit 1 — large, nearly flat, gold */}
        <mesh rotation={[-Math.PI / 2.2, 0.15, 0.1]}>
          <torusGeometry args={[7, 0.015, 8, 200]} />
          <meshBasicMaterial color="#C8A040" transparent opacity={0.25} depthWrite={false} />
        </mesh>

        {/* Orbit 2 — medium, tilted, gold */}
        <mesh rotation={[-Math.PI / 3.5, -0.2, -0.15]}>
          <torusGeometry args={[8.5, 0.012, 8, 200]} />
          <meshBasicMaterial color="#B89030" transparent opacity={0.2} depthWrite={false} />
        </mesh>

        {/* Orbit 3 — large, steep angle, purple */}
        <mesh rotation={[-Math.PI / 5, 0.3, 0.2]}>
          <torusGeometry args={[9.5, 0.01, 8, 200]} />
          <meshBasicMaterial color="#4a3080" transparent opacity={0.18} depthWrite={false} />
        </mesh>

        {/* Orbit 4 — small, tight, bright gold */}
        <mesh rotation={[-Math.PI / 1.8, -0.1, 0.05]}>
          <torusGeometry args={[5.5, 0.02, 8, 160]} />
          <meshBasicMaterial color="#D4A843" transparent opacity={0.3} depthWrite={false} />
        </mesh>

        {/* Orbit 5 — medium, crossed angle, purple */}
        <mesh rotation={[-Math.PI / 4, 0.4, -0.25]}>
          <torusGeometry args={[6.5, 0.01, 8, 180]} />
          <meshBasicMaterial color="#5a40a0" transparent opacity={0.15} depthWrite={false} />
        </mesh>

        {/* Orbit 6 — outer, very flat, faint gold */}
        <mesh rotation={[-Math.PI / 2.1, -0.05, 0.02]}>
          <torusGeometry args={[11, 0.008, 8, 220]} />
          <meshBasicMaterial color="#C8A040" transparent opacity={0.12} depthWrite={false} />
        </mesh>

      </group>

      {/* Subtle ground glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial color="#080420" transparent opacity={0.15} depthWrite={false} />
      </mesh>
    </>
  );
}
