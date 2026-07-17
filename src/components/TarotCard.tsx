'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CardInstanceState } from '@/types';
import { useTarotStore } from '@/store/tarotStore';
import { getCardById } from '@/lib/tarot/data';
import { createCardBackTexture, createCardFrontTexture } from '@/lib/three/textures';

interface TarotCardProps {
  cardState: CardInstanceState;
  index: number;
}

const CARD_W = 1.35;
const CARD_H = 2.05;
const CARD_D = 0.05;

type AnimPhase = 'orbit' | 'moving' | 'spinning' | 'flipping';

export default function TarotCard({ cardState }: TarotCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const faceGroupRef = useRef<THREE.Group>(null);

  const gestureState = useTarotStore((s) => s.gestureState);
  const selectedCardId = useTarotStore((s) => s.selectedCardId);
  const revealedCardId = useTarotStore((s) => s.revealedCardId);

  const isSelected = selectedCardId === cardState.id;
  const isRevealed = revealedCardId === cardState.id;
  const [phase, setPhase] = useState<AnimPhase>('orbit');

  useEffect(() => {
    if (isRevealed) setPhase('flipping');
    else if (isSelected) setPhase('moving');
    else setPhase('orbit');
  }, [isSelected, isRevealed]);

  const cardData = getCardById(cardState.id);

  // ── Textures ──
  const { frontTex, backTex, edgeMat } = useMemo(() => {
    const backCanvas = createCardBackTexture();
    const backTex = new THREE.CanvasTexture(backCanvas);
    backTex.colorSpace = THREE.SRGBColorSpace;
    backTex.minFilter = THREE.LinearMipmapLinearFilter;
    backTex.magFilter = THREE.LinearFilter;

    let frontTex: THREE.CanvasTexture | null = null;
    if (cardData) {
      const frontCanvas = createCardFrontTexture(cardData.symbol, cardData.number, cardData.nameZh);
      frontTex = new THREE.CanvasTexture(frontCanvas);
      frontTex.colorSpace = THREE.SRGBColorSpace;
      frontTex.minFilter = THREE.LinearMipmapLinearFilter;
      frontTex.magFilter = THREE.LinearFilter;
    }

    const edgeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#C8A040'),
      metalness: 0.95,
      roughness: 0.15,
    });

    return { frontTex, backTex, edgeMat };
  }, [cardData]);

  // ── Materials ──
  const materials = useMemo(() => {
    const frontFace = new THREE.MeshStandardMaterial({
      map: frontTex,
      metalness: 0.15,
      roughness: 0.45,
      color: new THREE.Color('#ffffff'),
    });
    const backFace = new THREE.MeshStandardMaterial({
      map: backTex,
      metalness: 0.05,
      roughness: 0.55,
      color: new THREE.Color('#ffffff'),
    });
    return { frontFace, backFace };
  }, [frontTex, backTex]);

  // ── Orbit ──
  const orbitX = Math.cos(cardState.orbitAngle) * cardState.orbitRadius;
  const orbitZ = Math.sin(cardState.orbitAngle) * cardState.orbitRadius;
  const orbitRY = -cardState.orbitAngle + Math.PI / 2;

  const posRef = useRef({ x: orbitX, y: 0, z: orbitZ });
  const rotYRef = useRef(orbitRY);
  const spinRef = useRef(0);
  const flipRef = useRef(0);
  const floatRef = useRef(0);
  const hasReachedCenter = useRef(false);

  useEffect(() => { if (phase === 'orbit') { hasReachedCenter.current = false; flipRef.current = 0; } }, [phase]);

  useFrame((_, delta) => {
    if (!groupRef.current || !faceGroupRef.current) return;
    const dt = Math.min(delta, 0.1);
    const speed = 4;
    const p = posRef.current;

    const otherSelected = selectedCardId !== null && !isSelected && !isRevealed;
    materials.frontFace.opacity = otherSelected ? 0.2 : 1;
    materials.frontFace.transparent = true;
    materials.backFace.opacity = otherSelected ? 0.2 : 1;
    materials.backFace.transparent = true;

    switch (phase) {
      case 'orbit': {
        p.x += (orbitX - p.x) * speed * dt;
        p.y += (0 - p.y) * speed * dt;
        p.z += (orbitZ - p.z) * speed * dt;
        rotYRef.current += (orbitRY - rotYRef.current) * speed * dt;
        groupRef.current.position.set(p.x, p.y, p.z);
        groupRef.current.rotation.y = rotYRef.current;
        faceGroupRef.current.rotation.y = 0;
        spinRef.current = 0;
        break;
      }
      case 'moving': {
        const tx = 0, ty = 2.5, tz = 2;
        p.x += (tx - p.x) * speed * dt;
        p.y += (ty - p.y) * speed * dt;
        p.z += (tz - p.z) * speed * dt;
        groupRef.current.position.set(p.x, p.y, p.z);
        rotYRef.current += (0 - rotYRef.current) * speed * dt;
        groupRef.current.rotation.y = rotYRef.current;
        faceGroupRef.current.rotation.y = 0;
        const dist = Math.sqrt((tx-p.x)**2 + (ty-p.y)**2 + (tz-p.z)**2);
        if (dist < 0.15) { hasReachedCenter.current = true; setPhase('spinning'); }
        break;
      }
      case 'spinning': {
        p.x += (0 - p.x) * speed * dt;
        p.y = 2.5 + Math.sin(floatRef.current) * 0.12;
        p.z += (2 - p.z) * speed * dt;
        floatRef.current += dt * 1.5;
        groupRef.current.position.set(p.x, p.y, p.z);
        groupRef.current.rotation.y = 0;
        spinRef.current += 5.5 * dt;
        faceGroupRef.current.rotation.y = spinRef.current;
        break;
      }
      case 'flipping': {
        p.x += (0 - p.x) * speed * dt;
        p.y += (2.5 - p.y) * speed * dt;
        p.z += (2 - p.z) * speed * dt;
        groupRef.current.position.set(p.x, p.y, p.z);
        groupRef.current.rotation.y = 0;
        flipRef.current += (Math.PI - flipRef.current) * 3 * dt;
        faceGroupRef.current.rotation.y = flipRef.current;
        break;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={faceGroupRef}>
        {/* Front face */}
        <mesh position={[0, 0, CARD_D / 2]}>
          <planeGeometry args={[CARD_W, CARD_H]} />
          <primitive object={materials.frontFace} attach="material" />
        </mesh>

        {/* Gold border overlay — front */}
        <mesh position={[0, 0, CARD_D / 2 + 0.001]}>
          <planeGeometry args={[CARD_W - 0.04, CARD_H - 0.04]} />
          <meshBasicMaterial color="#C8A040" transparent opacity={0.08} side={THREE.DoubleSide} depthTest={false} />
        </mesh>

        {/* Back face */}
        <mesh position={[0, 0, -CARD_D / 2]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[CARD_W, CARD_H]} />
          <primitive object={materials.backFace} attach="material" />
        </mesh>

        {/* Gold border overlay — back */}
        <mesh position={[0, 0, -CARD_D / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[CARD_W - 0.04, CARD_H - 0.04]} />
          <meshBasicMaterial color="#C8A040" transparent opacity={0.08} side={THREE.DoubleSide} depthTest={false} />
        </mesh>

        {/* Edge */}
        <mesh>
          <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
          <primitive object={edgeMat} attach="material" />
        </mesh>
      </group>
    </group>
  );
}
