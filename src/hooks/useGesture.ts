'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Vec3 } from '@/types';
import { GestureStateMachine } from '@/lib/gestures/stateMachine';
import { detectAll } from '@/lib/gestures/detectors';
import { DEFAULT_CONFIG } from '@/lib/gestures/types';
import { useTarotStore } from '@/store/tarotStore';

interface UseGestureOptions {
  enabled: boolean;
}

export function useGesture(hands: Vec3[][], options: UseGestureOptions = { enabled: false }) {
  const { enabled } = options;
  const fsmRef = useRef(new GestureStateMachine());
  const prevHandsRef = useRef<Vec3[][] | null>(null);

  const processGestures = useCallback(() => {
    if (!enabled) return;

    const fsm = fsmRef.current;
    const store = useTarotStore.getState();

    const detection = detectAll({
      hands,
      prevHands: prevHandsRef.current,
      config: DEFAULT_CONFIG,
      currentGesture: fsm.getState(),
    });

    const prevState = fsm.getState();
    const newState = fsm.update(detection);

    store.setGesture(newState, detection?.confidence ?? 0);

    // ✊ Fist → select random card (card spins in place)
    if (newState === 'PINCH_START' && prevState !== 'PINCH_START') {
      const cards = useTarotStore.getState().cards;
      if (cards.length > 0 && !store.selectedCardId) {
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        store.setSelectedCardId(randomCard.id);
      }
    }

    // ✊ Fist confirmed → card continues spinning
    if (newState === 'PINCH_HOLDING' && !store.selectedCardId) {
      const cards = useTarotStore.getState().cards;
      if (cards.length > 0) {
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        store.setSelectedCardId(randomCard.id);
      }
    }

    // 🤏 Pinch → reveal the spinning card
    if (newState === 'CARD_REVEALING' && !store.revealedCardId && store.selectedCardId) {
      store.setRevealedCardId(store.selectedCardId);
    }

    // 🖐️ Open palm → shuffle
    if (newState === 'SHUFFLING' && prevState !== 'SHUFFLING') {
      store.shuffleCards();
      store.setSelectedCardId(null);
      store.setRevealedCardId(null);
      store.setHoveredCardId(null);
    }

    prevHandsRef.current = hands;
  }, [enabled, hands]);

  useEffect(() => {
    if (enabled) processGestures();
  }, [enabled, hands, processGestures]);

  useEffect(() => {
    fsmRef.current.setOnStateChange((from, to) => {
      console.log(`Gesture: ${from} → ${to}`);
    });
  }, []);

  return { fsm: fsmRef.current };
}
