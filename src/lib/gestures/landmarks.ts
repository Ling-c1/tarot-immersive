import { Vec3 } from '@/types';
import { LANDMARK } from './types';

export function distance3D(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function distance2D(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function isFingerExtended(landmarks: Vec3[], tipIdx: number, pipIdx: number): boolean {
  const tip = landmarks[tipIdx];
  const pip = landmarks[pipIdx];
  return tip.y < pip.y + 0.02;
}

export function isFingerCurled(landmarks: Vec3[], tipIdx: number, pipIdx: number): boolean {
  return !isFingerExtended(landmarks, tipIdx, pipIdx);
}

export function isThumbOpen(landmarks: Vec3[]): boolean {
  return distance3D(landmarks[LANDMARK.THUMB_TIP], landmarks[LANDMARK.INDEX_MCP]) > 0.15;
}

/**
 * ✊ Fist detection — simple Y-coordinate check with generous threshold.
 * tip.y > pip.y + 0.08 = finger is curled (substantially below PIP)
 * Logs each finger state for debugging.
 */
export function checkFist(landmarks: Vec3[]): { isFist: boolean; details: string } {
  const fingers = [
    { name: 'index', tip: LANDMARK.INDEX_TIP, pip: LANDMARK.INDEX_PIP },
    { name: 'mid', tip: LANDMARK.MIDDLE_TIP, pip: LANDMARK.MIDDLE_PIP },
    { name: 'ring', tip: LANDMARK.RING_TIP, pip: LANDMARK.RING_PIP },
    { name: 'pinky', tip: LANDMARK.PINKY_TIP, pip: LANDMARK.PINKY_PIP },
  ];

  let curled = 0;
  const states: string[] = [];

  for (const f of fingers) {
    const tipY = landmarks[f.tip].y;
    const pipY = landmarks[f.pip].y;
    const isCurled = tipY > pipY + 0.08; // tip substantially below PIP = curled
    if (isCurled) curled++;
    states.push(`${f.name}:${isCurled ? 'C' : 'E'}`);
  }

  return {
    isFist: curled >= 2,  // 降低：3→2，只要2根手指弯曲就算握拳
    details: states.join(' ') + ` (curled:${curled}/4)`,
  };
}

/**
 * 🤏 Pinch detection using RATIO.
 * thumbTip-to-indexTip / thumbTip-to-indexMcp
 * Pinching: ratio < 0.5 (tips touch, but thumb base is far)
 * Not pinching: ratio > 0.8
 */
export function checkPinch(landmarks: Vec3[]): { isPinching: boolean; ratio: number } {
  const tipDist = distance3D(landmarks[LANDMARK.THUMB_TIP], landmarks[LANDMARK.INDEX_TIP]);
  const refDist = distance3D(landmarks[LANDMARK.THUMB_TIP], landmarks[LANDMARK.INDEX_MCP]);
  const ratio = refDist > 0.001 ? tipDist / refDist : 1;

  return {
    isPinching: ratio < 0.5 && tipDist < 0.1, // both ratio AND absolute check
    ratio,
  };
}

export function getPinchDistance(landmarks: Vec3[]): number {
  return distance3D(landmarks[LANDMARK.THUMB_TIP], landmarks[LANDMARK.INDEX_TIP]);
}

export function getFingerSpread(landmarks: Vec3[]): number {
  return distance3D(landmarks[LANDMARK.THUMB_TIP], landmarks[LANDMARK.PINKY_TIP]);
}

export function getWristVelocity(current: Vec3[], previous: Vec3[] | null): number {
  if (!previous) return 0;
  return previous[LANDMARK.WRIST].z - current[LANDMARK.WRIST].z;
}

export function toScreenSpace(landmark: Vec3): { x: number; y: number } {
  return {
    x: -(landmark.x - 0.5) * 2,
    y: -(landmark.y - 0.5) * 2,
  };
}

export function getHandCenter(landmarks: Vec3[]): Vec3 {
  const keys = [LANDMARK.THUMB_TIP, LANDMARK.INDEX_TIP, LANDMARK.MIDDLE_TIP, LANDMARK.RING_TIP, LANDMARK.PINKY_TIP];
  const sum = keys.reduce(
    (acc, i) => ({ x: acc.x + landmarks[i].x, y: acc.y + landmarks[i].y, z: acc.z + landmarks[i].z }),
    { x: 0, y: 0, z: 0 },
  );
  return { x: sum.x / 5, y: sum.y / 5, z: sum.z / 5 };
}

export function areAllFingersExtended(landmarks: Vec3[]): boolean {
  return (
    isThumbOpen(landmarks) &&
    isFingerExtended(landmarks, LANDMARK.INDEX_TIP, LANDMARK.INDEX_PIP) &&
    isFingerExtended(landmarks, LANDMARK.MIDDLE_TIP, LANDMARK.MIDDLE_PIP) &&
    isFingerExtended(landmarks, LANDMARK.RING_TIP, LANDMARK.RING_PIP) &&
    isFingerExtended(landmarks, LANDMARK.PINKY_TIP, LANDMARK.PINKY_PIP)
  );
}
