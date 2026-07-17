'use client';

import { useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useCamera } from '@/hooks/useCamera';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useGesture } from '@/hooks/useGesture';
import { useTarotStore } from '@/store/tarotStore';
import Lighting from './Lighting';
import PostProcessing from './PostProcessing';
import Background from './Background';
import ParticleSystem from './ParticleSystem';
import TarotOrbit from './TarotOrbit';
import ReadingPanel from './ReadingPanel';
import DebugOverlay from './DebugOverlay';

const promptStyle: React.CSSProperties = {
  position: 'absolute',
  top: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 40,
};

const promptInner: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: 9999,
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  fontSize: 12,
  letterSpacing: '0.15em',
};

export default function TarotExperience() {
  const { videoRef, isReady: cameraReady, error: cameraError, startCamera } = useCamera({
    width: 640,
    height: 480,
    facingMode: 'user',
  });

  const [mediaPipeEnabled, setMediaPipeEnabled] = useState(false);
  const phase = useTarotStore((s) => s.phase);
  const setPhase = useTarotStore((s) => s.setPhase);

  // Start camera on mount
  useEffect(() => {
    setPhase('camera-request');
    startCamera();
  }, [startCamera, setPhase]);

  // Enable MediaPipe when camera is ready
  useEffect(() => {
    if (cameraReady) {
      const timer = setTimeout(() => {
        setMediaPipeEnabled(true);
        setPhase('running');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cameraReady, setPhase]);

  // Handle camera errors
  useEffect(() => {
    if (cameraError) {
      setPhase('camera-denied');
    }
  }, [cameraError, setPhase]);

  // Hand tracking
  const { hands } = useHandTracking(videoRef.current, { enabled: mediaPipeEnabled });

  // Gesture recognition
  useGesture(hands, { enabled: mediaPipeEnabled });

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    background: '#050510',
    overflow: 'hidden',
    margin: 0,
    padding: 0,
  };

  return (
    <div style={containerStyle}>
      {/* Hidden camera feed */}
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: 'none',
          width: 640,
          height: 480,
        }}
        playsInline
        muted
      />

      {/* Three.js Canvas */}
      <Canvas
        camera={{ fov: 65, near: 0.1, far: 60, position: [0, 0.5, 13] }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <color attach="background" args={['#050510']} />

        <Suspense fallback={null}>
          <Lighting />
          <PostProcessing />
          <Background />
          <ParticleSystem count={600} spread={12} />
          <TarotOrbit />
        </Suspense>
      </Canvas>

      {/* Camera permission prompt */}
      {phase === 'camera-request' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(5,5,16,0.9)',
            zIndex: 50,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 80,
                height: 80,
                margin: '0 auto 24px',
                borderRadius: '50%',
                border: '2px solid rgba(212,168,67,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s infinite',
              }}
            >
              <span style={{ fontSize: 32 }}>📷</span>
            </div>
            <h2 style={{ color: '#D4A843', fontSize: 20, fontWeight: 500, letterSpacing: '0.1em' }}>
              请求摄像头权限
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, letterSpacing: '0.05em', marginTop: 8 }}>
              Requesting Camera Access...
            </p>
          </div>
        </div>
      )}

      {/* Camera denied */}
      {phase === 'camera-denied' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(5,5,16,0.95)',
            zIndex: 50,
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 380, padding: '0 24px' }}>
            <div
              style={{
                width: 80,
                height: 80,
                margin: '0 auto 24px',
                borderRadius: '50%',
                border: '2px solid rgba(255,80,80,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 32 }}>⚠️</span>
            </div>
            <h2 style={{ color: '#f87171', fontSize: 18, fontWeight: 500, marginBottom: 12 }}>
              无法访问摄像头
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: 14,
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              {cameraError || '请在浏览器设置中允许摄像头访问，然后刷新页面。'}
            </p>
            <button
              onClick={() => {
                setPhase('camera-request');
                startCamera();
              }}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                background: 'rgba(212,168,67,0.1)',
                border: '1px solid rgba(212,168,67,0.3)',
                color: '#D4A843',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              重试 Retry
            </button>
          </div>
        </div>
      )}

      {/* No hand detected hint */}
      {phase === 'running' && hands.length === 0 && (
        <div style={promptStyle}>
          <div
            style={{
              ...promptInner,
              color: 'rgba(255,255,255,0.4)',
              background: 'linear-gradient(135deg, rgba(20,15,40,0.7), rgba(10,8,30,0.8))',
            }}
          >
            🖐️张手洗牌 · ✊握拳旋转 · 🤏捏合翻牌
          </div>
        </div>
      )}

      {/* Gesture hint when hand detected */}
      {phase === 'running' && hands.length > 0 && (
        <div style={promptStyle}>
          <div
            style={{
              ...promptInner,
              color: 'rgba(212,168,67,0.6)',
              border: '1px solid rgba(212,168,67,0.1)',
              background: 'linear-gradient(135deg, rgba(20,15,40,0.6), rgba(10,8,30,0.7))',
            }}
          >
            🖐️张手洗牌 · ✊握拳旋转 · 🤏捏合翻牌
          </div>
        </div>
      )}

      {/* Loading state */}
      {phase === 'loading' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#050510',
            zIndex: 50,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                margin: '0 auto 24px',
                borderRadius: '50%',
                border: '2px solid rgba(212,168,67,0.2)',
                borderTopColor: '#D4A843',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p style={{ color: 'rgba(212,168,67,0.6)', fontSize: 14, letterSpacing: '0.1em' }}>
              Loading...
            </p>
          </div>
        </div>
      )}

      <ReadingPanel />
      <DebugOverlay />
    </div>
  );
}
