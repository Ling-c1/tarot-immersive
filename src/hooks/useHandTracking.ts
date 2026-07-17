'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarker } from '@mediapipe/tasks-vision';
import { Vec3 } from '@/types';
import { initHandLandmarker, closeHandLandmarker } from '@/lib/mediapipe/hands';

interface UseHandTrackingOptions {
  enabled: boolean;
}

interface UseHandTrackingReturn {
  hands: Vec3[][];
  isTracking: boolean;
  error: string | null;
}

export function useHandTracking(
  video: HTMLVideoElement | null,
  options: UseHandTrackingOptions = { enabled: false },
): UseHandTrackingReturn {
  const { enabled } = options;
  const [hands, setHands] = useState<Vec3[][]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid recreating the animation loop
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const enabledRef = useRef(enabled);
  const animFrameRef = useRef<number>(0);

  // Keep refs in sync
  useEffect(() => {
    videoRef.current = video;
  }, [video]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Stable processFrame — uses refs
  const processFrame = useCallback(() => {
    const landmarker = landmarkerRef.current;
    const vid = videoRef.current;

    if (!landmarker || !vid || !enabledRef.current) {
      animFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    try {
      const result = landmarker.detectForVideo(vid, performance.now());

      if (result && result.landmarks && result.landmarks.length > 0) {
        const parsedHands: Vec3[][] = result.landmarks.map((lm) =>
          lm.map((l) => ({ x: l.x, y: l.y, z: l.z })),
        );
        setHands(parsedHands);
        setIsTracking(true);
        setError(null);
      } else {
        setHands([]);
        setIsTracking(true);
      }
    } catch {
      // Skip frames that fail
    }

    animFrameRef.current = requestAnimationFrame(processFrame);
  }, []); // stable — no dependencies

  // Initialize MediaPipe
  useEffect(() => {
    if (!enabled) {
      setHands([]);
      setIsTracking(false);
      return;
    }

    let cancelled = false;

    async function setup() {
      try {
        const landmarker = await initHandLandmarker();
        if (cancelled) return;
        landmarkerRef.current = landmarker;
        animFrameRef.current = requestAnimationFrame(processFrame);
      } catch (err) {
        if (!cancelled) {
          setError(
            `Failed to load hand detection: ${err instanceof Error ? err.message : 'Unknown'}`,
          );
        }
      }
    }

    setup();

    return () => {
      cancelled = true;
    };
  }, [enabled, processFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      closeHandLandmarker();
    };
  }, []);

  return { hands, isTracking, error };
}
