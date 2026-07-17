'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTarotStore } from '@/store/tarotStore';
import { getCardById } from '@/lib/tarot/data';

const panelContainerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 32,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 'min(90vw, 672px)',
  maxWidth: 672,
};

const cardStyle: React.CSSProperties = {
  borderRadius: 16,
  padding: '24px 32px',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'linear-gradient(135deg, rgba(20,15,40,0.75), rgba(10,8,30,0.85))',
  boxShadow:
    '0 8px 60px rgba(212,168,67,0.15), 0 0 120px rgba(212,168,67,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
};

const symbolBoxStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 28,
  background: 'linear-gradient(135deg, rgba(212,168,67,0.25), rgba(212,168,67,0.08))',
  border: '1px solid rgba(212,168,67,0.3)',
  boxShadow: '0 0 30px rgba(212,168,67,0.2)',
};

const keywordChipStyle: React.CSSProperties = {
  padding: '4px 12px',
  borderRadius: 9999,
  fontSize: 12,
  fontWeight: 500,
  color: '#D4A843',
  border: '1px solid rgba(212,168,67,0.2)',
  background: 'rgba(212,168,67,0.08)',
};

const sectionStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.05)',
  background: 'rgba(255,255,255,0.02)',
};

const overallSectionStyle: React.CSSProperties = {
  ...sectionStyle,
  border: '1px solid rgba(212,168,67,0.3)',
  background: 'rgba(212,168,67,0.05)',
};

export default function ReadingPanel() {
  const revealedCardId = useTarotStore((s) => s.revealedCardId);
  const gestureState = useTarotStore((s) => s.gestureState);
  const [visible, setVisible] = useState(false);

  const cardData = revealedCardId ? getCardById(revealedCardId) : undefined;

  useEffect(() => {
    if (gestureState === 'REVEALED' && revealedCardId) {
      const timer = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [gestureState, revealedCardId]);

  return (
    <AnimatePresence>
      {visible && cardData && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={panelContainerStyle}
        >
          <div style={cardStyle}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={symbolBoxStyle}>{cardData.symbol}</div>
              <div>
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    background: 'linear-gradient(180deg, #FFD700, #D4A843)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {cardData.nameZh}
                </h2>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 13,
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                  }}
                >
                  {cardData.name}
                </p>
              </div>
            </div>

            {/* Keywords */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {cardData.keywords.map((kw) => (
                <span key={kw} style={keywordChipStyle}>
                  {kw}
                </span>
              ))}
            </div>

            {/* Reading sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ReadingSection icon="💕" title="爱情 Love" content={cardData.love} />
              <ReadingSection icon="💼" title="事业 Career" content={cardData.career} />
              <ReadingSection icon="🌿" title="健康 Health" content={cardData.health} />
              <ReadingSection icon="🌟" title="整体解读 Overall" content={cardData.overall} isOverall />
            </div>
          </div>

          <p
            style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 12,
              marginTop: 16,
              letterSpacing: '0.1em',
            }}
          >
            👐 双手展开重新抽牌 | Spread Both Hands to Reshuffle
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ReadingSection({
  icon,
  title,
  content,
  isOverall,
}: {
  icon: string;
  title: string;
  content: string;
  isOverall?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: isOverall ? 0.6 : 0.3 }}
      style={isOverall ? overallSectionStyle : sectionStyle}
    >
      <h3
        style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: 14,
          fontWeight: 500,
          marginBottom: 8,
        }}
      >
        {icon} {title}
      </h3>
      <p
        style={{
          color: 'rgba(255,255,255,0.55)',
          fontSize: 14,
          lineHeight: 1.7,
        }}
      >
        {content}
      </p>
    </motion.div>
  );
}
