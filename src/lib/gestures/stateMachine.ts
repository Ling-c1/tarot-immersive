import { GestureState, Vec2, Vec3 } from '@/types';
import { DetectionResult, StateMachineConfig, DEFAULT_CONFIG } from './types';

interface FrameVote {
  state: GestureState;
  confidence: number;
}

export class GestureStateMachine {
  private config: StateMachineConfig;
  private currentState: GestureState = 'IDLE';
  private cursor: Vec2 | null = null;
  private velocity: Vec3 | null = null;
  private pinchDistance: number = 1;
  private handCount: number = 0;
  private fistStartTime: number | null = null;
  private revealStartTime: number | null = null;
  private shuffleStartTime: number | null = null;

  private onStateChange: ((from: GestureState, to: GestureState) => void) | null = null;
  private onCursorMove: ((cursor: Vec2) => void) | null = null;

  constructor(config: Partial<StateMachineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  setOnStateChange(cb: (from: GestureState, to: GestureState) => void) {
    this.onStateChange = cb;
  }

  setOnCursorMove(cb: (cursor: Vec2) => void) {
    this.onCursorMove = cb;
  }

  getState() { return this.currentState; }
  getCursor() { return this.cursor; }
  getVelocity() { return this.velocity; }
  getPinchDistance() { return this.pinchDistance; }
  getHandCount() { return this.handCount; }

  getFistHoldDuration(): number {
    if (this.fistStartTime === null) return 0;
    return Date.now() - this.fistStartTime;
  }

  isFistConfirmed(): boolean {
    return this.currentState === 'PINCH_START' && this.getFistHoldDuration() >= this.config.pinchHoldMs;
  }

  update(detection: DetectionResult | null): GestureState {
    const now = Date.now();

    // No hands → back to IDLE
    if (!detection || detection.handCount === 0) {
      this.cursor = null;
      this.fistStartTime = null;
      if (this.currentState !== 'REVEALED' && this.currentState !== 'SHUFFLING') {
        this.transitionTo('IDLE');
      }
      return this.currentState;
    }

    // Track cursor
    if (detection.cursor) {
      this.cursor = detection.cursor;
      this.onCursorMove?.(detection.cursor);
    }
    this.velocity = detection.velocity || null;
    this.pinchDistance = detection.pinchDistance ?? 1;
    this.handCount = detection.handCount;

    const gesture = detection.gesture;

    switch (this.currentState) {
      // ── IDLE: waiting for fist ──
      case 'IDLE':
        if (gesture === 'PINCH_START') {
          // ✊ Fist detected → start selecting
          this.fistStartTime = now;
          this.transitionTo('PINCH_START');
        } else if (gesture === 'SHUFFLING') {
          // 🖐️ Open palm → shuffle
          this.transitionTo('SHUFFLING');
        } else if (gesture === 'HOVERING') {
          this.transitionTo('HOVERING');
        }
        break;

      // ── HOVERING: hand is there, waiting for fist or palm ──
      case 'HOVERING':
        if (gesture === 'PINCH_START') {
          // ✊ Fist → select
          this.fistStartTime = now;
          this.transitionTo('PINCH_START');
        } else if (gesture === 'SHUFFLING') {
          // 🖐️ Open palm → shuffle
          this.transitionTo('SHUFFLING');
        }
        break;

      // ── PINCH_START: fist made, waiting for hold duration ──
      case 'PINCH_START':
        if (gesture === 'SHUFFLING') {
          // 🖐️ Open palm → cancel fist, shuffle
          this.fistStartTime = null;
          this.transitionTo('SHUFFLING');
        } else if (this.isFistConfirmed()) {
          // ✊ Fist held long enough → confirm!
          this.transitionTo('PINCH_HOLDING');
        } else if (gesture !== 'PINCH_START') {
          // Fist released too early → back to hover
          this.fistStartTime = null;
          this.transitionTo('HOVERING');
        }
        break;

      // ── PINCH_HOLDING: fist confirmed → auto-fly ──
      case 'PINCH_HOLDING':
        // Auto-transition to flying
        this.transitionTo('CARD_FLYING');
        break;

      // ── CARD_FLYING: card flies to center, waiting for pinch ──
      case 'CARD_FLYING':
        if (gesture === 'CARD_REVEALING') {
          // 🤏 Pinch → flip!
          this.transitionTo('CARD_REVEALING');
        } else if (gesture === 'SHUFFLING') {
          // 🖐️ Palm → cancel, shuffle
          this.fistStartTime = null;
          this.transitionTo('SHUFFLING');
        }
        break;

      // ── CARD_REVEALING: card flipping, auto-complete after 2s ──
      case 'CARD_REVEALING':
        if (this.revealStartTime === null) {
          this.revealStartTime = now;
        }
        if (now - this.revealStartTime > 2000) {
          // Auto-complete flip animation
          this.revealStartTime = null;
          this.transitionTo('REVEALED');
        } else if (gesture === 'SHUFFLING') {
          this.revealStartTime = null;
          this.transitionTo('SHUFFLING');
        }
        break;

      // ── REVEALED: reading visible ──
      case 'REVEALED':
        if (gesture === 'SHUFFLING') {
          // 🖐️ Open palm → reshuffle
          this.transitionTo('SHUFFLING');
        }
        break;

      // ── SHUFFLING: auto-complete after 1.5s ──
      case 'SHUFFLING':
        if (this.shuffleStartTime === null) {
          this.shuffleStartTime = now;
        }
        if (now - this.shuffleStartTime > 1500) {
          this.shuffleStartTime = null;
          this.transitionTo('IDLE');
        } else if (gesture === 'HOVERING') {
          this.transitionTo('IDLE');
        }
        break;
    }

    return this.currentState;
  }

  completeReveal() {
    if (this.currentState === 'CARD_REVEALING') {
      this.transitionTo('REVEALED');
    }
  }

  completeShuffle() {
    if (this.currentState === 'SHUFFLING') {
      this.fistStartTime = null;
      this.transitionTo('IDLE');
    }
  }

  private transitionTo(newState: GestureState) {
    if (newState === this.currentState) return;
    const from = this.currentState;
    this.currentState = newState;
    // Reset timers when entering new state
    if (newState === 'CARD_REVEALING') this.revealStartTime = Date.now();
    if (newState === 'SHUFFLING') this.shuffleStartTime = Date.now();
    this.onStateChange?.(from, newState);
  }

  reset() {
    this.currentState = 'IDLE';
    this.fistStartTime = null;
    this.cursor = null;
  }
}
