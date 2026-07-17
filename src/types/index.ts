// ─── 3D Vector ───────────────────────────────────────────
export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

// ─── Gesture ─────────────────────────────────────────────
export type GestureState =
  | 'IDLE'
  | 'HOVERING'
  | 'PINCH_START'
  | 'PINCH_HOLDING'
  | 'CARD_FLYING'
  | 'CARD_REVEALING'
  | 'REVEALED'
  | 'SHUFFLING';

export interface GestureEvent {
  state: GestureState;
  confidence: number;
  timestamp: number;
  cursor?: Vec2;
  velocity?: Vec3;
  pinchDistance?: number;
  handCount?: number;
  swipeDirection?: 'left' | 'right' | null;
}

export interface LandmarkResult {
  landmarks: Vec3[][]; // up to 2 hands, each 21 landmarks
  timestamp: number;
}

// ─── Tarot Card ──────────────────────────────────────────
export type ArcanaCategory = 'major' | 'minor';

export type TarotSuit = 'cups' | 'pentacles' | 'swords' | 'wands';

export interface TarotCardData {
  id: string;
  name: string;
  nameZh: string;
  arcana: ArcanaCategory;
  suit?: TarotSuit;
  number: number;
  keywords: string[];
  love: string;
  career: string;
  health: string;
  overall: string;
  symbol: string; // emoji/unicode symbol
  reversed?: boolean;
}

// ─── Card State ──────────────────────────────────────────
export interface CardInstanceState {
  id: string;
  orbitAngle: number;    // current angle on orbit (radians)
  orbitRadius: number;
  targetAngle: number;
  targetY: number;
  scale: number;
  opacity: number;
  glowIntensity: number;
  rotationY: number;     // flip animation (0 = front, PI = back)
  spinAngle: number;     // self-spin rotation (radians)
  spinSpeed: number;     // current spin speed
  isRevealed: boolean;
}

// ─── App Phase ───────────────────────────────────────────
export type AppPhase =
  | 'loading'
  | 'camera-request'
  | 'camera-denied'
  | 'running'
  | 'reading';

// ─── Store ───────────────────────────────────────────────
export interface TarotStore {
  // App
  phase: AppPhase;
  setPhase: (phase: AppPhase) => void;

  // Gesture
  gestureState: GestureState;
  prevGestureState: GestureState;
  gestureConfidence: number;
  setGesture: (state: GestureState, confidence: number) => void;

  // Cursor
  cursor: Vec2 | null;
  setCursor: (cursor: Vec2 | null) => void;

  // Cards
  cards: CardInstanceState[];
  initCards: () => void;
  updateCard: (id: string, partial: Partial<CardInstanceState>) => void;
  shuffleCards: () => void;

  // Selection
  hoveredCardId: string | null;
  selectedCardId: string | null;
  revealedCardId: string | null;
  setHoveredCardId: (id: string | null) => void;
  setSelectedCardId: (id: string | null) => void;
  setRevealedCardId: (id: string | null) => void;

  // Pinch hold duration tracking
  pinchStartTime: number | null;
  setPinchStartTime: (t: number | null) => void;

  // Push detection
  pushVelocity: number;
  setPushVelocity: (v: number) => void;
}
