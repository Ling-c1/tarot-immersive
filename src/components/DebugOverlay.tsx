'use client';

import { useTarotStore } from '@/store/tarotStore';

export default function DebugOverlay() {
  const gestureState = useTarotStore((s) => s.gestureState);
  const confidence = useTarotStore((s) => s.gestureConfidence);
  const selectedCardId = useTarotStore((s) => s.selectedCardId);
  const revealedCardId = useTarotStore((s) => s.revealedCardId);

  const stateLabels: Record<string, string> = {
    IDLE: '待机',
    HOVERING: '检测到手',
    PINCH_START: '✊ 握拳旋转',
    PINCH_HOLDING: '✊ 旋转中',
    CARD_FLYING: '已选牌',
    CARD_REVEALING: '🤏 捏合翻牌',
    REVEALED: '📖 解读',
    SHUFFLING: '🖐️ 洗牌中',
  };
  const stateColors: Record<string, string> = {
    IDLE: '#888',
    HOVERING: '#aaa',
    PINCH_START: '#FF6B35',
    PINCH_HOLDING: '#FF4444',
    CARD_FLYING: '#44AAFF',
    CARD_REVEALING: '#AA44FF',
    REVEALED: '#44FF44',
    SHUFFLING: '#FF44FF',
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 100,
        background: 'rgba(0,0,0,0.8)',
        borderRadius: 12,
        padding: '12px 16px',
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#ccc',
        border: '1px solid rgba(255,255,255,0.15)',
        minWidth: 200,
        lineHeight: 1.7,
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 13 }}>
        <span style={{ color: stateColors[gestureState] || '#fff' }}>
          {stateLabels[gestureState] || gestureState}
        </span>
      </div>
      <div style={{ color: '#666', fontSize: 10, marginBottom: 6 }}>
        conf: {confidence.toFixed(2)} · {gestureState}
      </div>

      <div style={{ fontSize: 10 }}>
        <span style={{ color: '#888' }}>选牌: </span>
        {selectedCardId ? (
          <span style={{ color: '#FF6B35' }}>{selectedCardId}</span>
        ) : (
          <span style={{ color: '#555' }}>—</span>
        )}
      </div>
      <div style={{ fontSize: 10 }}>
        <span style={{ color: '#888' }}>翻牌: </span>
        {revealedCardId ? (
          <span style={{ color: '#44FF44' }}>{revealedCardId}</span>
        ) : (
          <span style={{ color: '#555' }}>—</span>
        )}
      </div>
      <div style={{ marginTop: 6, color: '#555', fontSize: 9 }}>
        🖐️洗牌 · ✊旋转 · 🤏翻牌
      </div>
    </div>
  );
}
