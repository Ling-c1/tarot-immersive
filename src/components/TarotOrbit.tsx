'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import TarotCard from './TarotCard';
import { useTarotStore } from '@/store/tarotStore';
import { createRingMaterial } from '@/lib/three/materials';

export default function TarotOrbit() {
  const groupRef = useRef<THREE.Group>(null);
  const cards = useTarotStore((s) => s.cards);
  const selectedCardId = useTarotStore((s) => s.selectedCardId);
  const gestureState = useTarotStore((s) => s.gestureState);

  const ringMat1 = useMemo(() => createRingMaterial(), []);
  const ringMat2 = useMemo(() => createRingMaterial(), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    let speed = 0.12;
    if (selectedCardId && gestureState === 'PINCH_START') speed = 0.5;
    if (gestureState === 'SHUFFLING') speed = 3.0;
    if (gestureState === 'CARD_REVEALING' || gestureState === 'REVEALED') speed = 0.03;

    groupRef.current.rotation.y += speed * 0.016;
    ringMat1.uniforms.uTime.value = clock.elapsedTime;
    ringMat2.uniforms.uTime.value = clock.elapsedTime + 1;
  });

  return (
    <group ref={groupRef}>
      {/* Outer energy ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <torusGeometry args={[5.8, 0.03, 16, 160]} />
        <primitive object={ringMat1} attach="material" />
      </mesh>

      {/* Inner energy ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <torusGeometry args={[5.2, 0.02, 16, 128]} />
        <primitive object={ringMat2} attach="material" />
      </mesh>

      {/* Track indicator */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
        <ringGeometry args={[5.45, 5.55, 160]} />
        <meshBasicMaterial color="#D4A843" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Cards */}
      {cards.map((card, i) => (
        <TarotCard key={card.id} cardState={card} index={i} />
      ))}
    </group>
  );
}
