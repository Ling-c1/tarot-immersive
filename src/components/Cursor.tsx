'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTarotStore } from '@/store/tarotStore';

export default function Cursor() {
  const cursor = useTarotStore((s) => s.cursor);
  const gestureState = useTarotStore((s) => s.gestureState);
  const isPinching = gestureState === 'PINCH_START' || gestureState === 'PINCH_HOLDING';

  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Always show cursor when hand is detected
  const visible = cursor !== null;

  useFrame(({ clock }) => {
    if (!visible || !cursor) return;
    const t = clock.elapsedTime;

    // Fix Y-axis: cursor.y positive = up, matches 3D world Y
    const worldX = cursor.x * 6;
    const worldY = cursor.y * 4;  // 去掉了负号 — Y轴修正
    const worldZ = 3;

    if (meshRef.current) {
      meshRef.current.position.set(worldX, worldY, worldZ);
      meshRef.current.visible = true;
      const pulse = 1 + Math.sin(t * 4) * 0.08;
      meshRef.current.scale.setScalar(isPinching ? 0.7 * pulse : pulse);
      (meshRef.current.material as THREE.MeshBasicMaterial).color.set(
        isPinching ? '#FF6B35' : '#FFD700',
      );
    }

    if (ringRef.current) {
      ringRef.current.position.copy(meshRef.current!.position);
      ringRef.current.position.z -= 0.05;
      ringRef.current.visible = true;
      ringRef.current.scale.setScalar(isPinching ? 1.3 : 1.0);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.3 + Math.sin(t * 3) * 0.15;
    }
  });

  return (
    <>
      <mesh ref={meshRef} visible={visible} renderOrder={999}>
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ringRef} visible={visible} renderOrder={998}>
        <ringGeometry args={[0.12, 0.16, 32]} />
        <meshBasicMaterial
          color="#D4A843"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
