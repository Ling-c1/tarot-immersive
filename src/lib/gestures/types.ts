import { Vec2, Vec3, GestureState } from '@/types';

export interface HandLandmarks {
  landmarks: Vec3[];
}

export interface DetectionResult {
  gesture: GestureState;
  confidence: number;
  cursor?: Vec2;
  velocity?: Vec3;
  pinchDistance?: number;
  handCount: number;
  swipeDirection?: 'left' | 'right' | null;
}

export const LANDMARK = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
} as const;

export interface StateMachineConfig {
  minConfidence: number;
  debounceFrames: number;
  pinchCooldownMs: number;
  pinchHoldMs: number;
  pinchThreshold: number;
  pushVelocityThreshold: number;
  hoverDistanceThreshold: number;
}

export const DEFAULT_CONFIG: StateMachineConfig = {
  minConfidence: 0.2,            // 极低门槛
  debounceFrames: 1,             // 即时响应
  pinchCooldownMs: 100,          // 快速冷却
  pinchHoldMs: 400,
  pinchThreshold: 0.12,          // 更宽松的捏合距离
  pushVelocityThreshold: 0.004,  // 极敏感前推
  hoverDistanceThreshold: 1.8,   // 超大悬停范围
};
