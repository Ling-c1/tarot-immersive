'use client';

import dynamic from 'next/dynamic';

const TarotExperience = dynamic(() => import('@/components/TarotExperience'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#050510',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 64,
            height: 64,
            margin: '0 auto 24px',
            borderRadius: '50%',
            border: '2px solid rgba(212, 168, 67, 0.2)',
            borderTopColor: '#D4A843',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p
          style={{
            color: 'rgba(212, 168, 67, 0.6)',
            fontSize: 14,
            letterSpacing: '0.1em',
          }}
        >
          Loading Tarot...
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <TarotExperience />;
}
