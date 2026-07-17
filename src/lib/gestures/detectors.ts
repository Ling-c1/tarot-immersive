import { Vec3 } from '@/types';
import { DetectionResult, StateMachineConfig, LANDMARK } from './types';
import { isFingerExtended, checkFist, checkPinch, toScreenSpace } from './landmarks';

interface DetectorInput {
  hands: Vec3[][];
  prevHands: Vec3[][] | null;
  config: StateMachineConfig;
  currentGesture: string;
}

// Last logged values for throttling (avoid flooding console)
let lastFistLog = 0;
let lastPinchLog = 0;

function countExtendedFingers(hand: Vec3[]): number {
  let c = 0;
  if (isFingerExtended(hand, LANDMARK.INDEX_TIP, LANDMARK.INDEX_PIP)) c++;
  if (isFingerExtended(hand, LANDMARK.MIDDLE_TIP, LANDMARK.MIDDLE_PIP)) c++;
  if (isFingerExtended(hand, LANDMARK.RING_TIP, LANDMARK.RING_PIP)) c++;
  if (isFingerExtended(hand, LANDMARK.PINKY_TIP, LANDMARK.PINKY_PIP)) c++;
  return c;
}

/**
 * 🖐️ 张手 → 洗牌
 */
export function detectOpenPalm(input: DetectorInput): DetectionResult | null {
  const hand = input.hands[0];
  if (!hand) return null;

  const ext = countExtendedFingers(hand);
  const confidence = ext >= 4 ? 0.9 : ext >= 3 ? 0.65 : 0;
  if (confidence < input.config.minConfidence) return null;

  return { gesture: 'SHUFFLING', confidence, handCount: input.hands.length };
}

/**
 * ✊ 握拳 → 抽牌 (ratio-based)
 */
export function detectFist(input: DetectorInput): DetectionResult | null {
  const hand = input.hands[0];
  if (!hand) return null;

  const { isFist, details } = checkFist(hand);

  // Log every 1s
  const now = Date.now();
  if (now - lastFistLog > 1000) {
    console.log(`✊ fist: ${isFist ? 'YES' : 'no'} | ${details}`);
    lastFistLog = now;
  }

  if (!isFist) return null;

  return {
    gesture: 'PINCH_START',
    confidence: 0.85,
    handCount: input.hands.length,
  };
}

/**
 * 🤏 捏合 → 翻牌 (ratio-based)
 */
export function detectPinch(input: DetectorInput): DetectionResult | null {
  const hand = input.hands[0];
  if (!hand) return null;

  const { isPinching, ratio } = checkPinch(hand);

  const now = Date.now();
  if (now - lastPinchLog > 1000) {
    console.log(`🤏 pinch: ${isPinching ? 'YES' : 'no'} | ratio: ${ratio.toFixed(3)} (need <0.5)`);
    lastPinchLog = now;
  }

  if (!isPinching) return null;

  return {
    gesture: 'CARD_REVEALING',
    confidence: ratio < 0.3 ? 0.9 : 0.75,
    pinchDistance: getPinchDistanceForDetection(hand),
    handCount: input.hands.length,
  };
}

function getPinchDistanceForDetection(hand: Vec3[]): number {
  const dx = hand[LANDMARK.THUMB_TIP].x - hand[LANDMARK.INDEX_TIP].x;
  const dy = hand[LANDMARK.THUMB_TIP].y - hand[LANDMARK.INDEX_TIP].y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Default: hand detected */
export function detectDefaultHovering(input: DetectorInput): DetectionResult | null {
  const hand = input.hands[0];
  if (!hand) return null;

  return {
    gesture: 'HOVERING',
    confidence: 0.5,
    cursor: toScreenSpace(hand[LANDMARK.INDEX_TIP]),
    handCount: input.hands.length,
  };
}

export function detectAll(input: DetectorInput): DetectionResult | null {
  const detectors = [detectPinch, detectOpenPalm, detectFist, detectDefaultHovering];
  for (const detector of detectors) {
    const result = detector(input);
    if (result && result.confidence >= input.config.minConfidence) return result;
  }
  return null;
}
