import { create } from 'zustand';
import { TarotStore, CardInstanceState, AppPhase, GestureState } from '@/types';
import { defaultSpreadCards } from '@/lib/tarot/data';

const ORBIT_RADIUS = 5.5;
const CARD_COUNT = 12;

function createInitialCards(): CardInstanceState[] {
  return defaultSpreadCards.map((card, i) => {
    const angle = (i / CARD_COUNT) * Math.PI * 2;
    return {
      id: card.id,
      orbitAngle: angle,
      orbitRadius: ORBIT_RADIUS,
      targetAngle: angle,
      targetY: 0,
      scale: 1,
      opacity: 1,
      glowIntensity: 0,
      rotationY: 0,
      spinAngle: 0,
      spinSpeed: 0,
      isRevealed: false,
    };
  });
}

function shuffleCardsArray(cards: CardInstanceState[]): CardInstanceState[] {
  const count = cards.length;
  const angles = cards.map((_, i) => (i / count) * Math.PI * 2);
  // Fisher-Yates shuffle
  for (let i = angles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [angles[i], angles[j]] = [angles[j], angles[i]];
  }
  return cards.map((card, i) => ({
    ...card,
    targetAngle: angles[i],
    targetY: 2,
    scale: 1,
    opacity: 1,
    glowIntensity: 0,
    rotationY: 0,
    spinAngle: 0,
    spinSpeed: 0,
    isRevealed: false,
  }));
}

export const useTarotStore = create<TarotStore>((set, get) => ({
  phase: 'loading',
  setPhase: (phase: AppPhase) => set({ phase }),

  gestureState: 'IDLE',
  prevGestureState: 'IDLE',
  gestureConfidence: 0,
  setGesture: (state: GestureState, confidence: number) =>
    set({
      prevGestureState: get().gestureState,
      gestureState: state,
      gestureConfidence: confidence,
    }),

  cursor: null,
  setCursor: (cursor) => set({ cursor }),

  cards: createInitialCards(),
  initCards: () => set({ cards: createInitialCards() }),
  updateCard: (id, partial) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? { ...c, ...partial } : c)),
    })),
  shuffleCards: () => set((state) => ({ cards: shuffleCardsArray(state.cards) })),

  hoveredCardId: null,
  selectedCardId: null,
  revealedCardId: null,
  setHoveredCardId: (id) => set({ hoveredCardId: id }),
  setSelectedCardId: (id) => set({ selectedCardId: id }),
  setRevealedCardId: (id) => set({ revealedCardId: id }),

  pinchStartTime: null,
  setPinchStartTime: (t) => set({ pinchStartTime: t }),

  pushVelocity: 0,
  setPushVelocity: (v) => set({ pushVelocity: v }),
}));
