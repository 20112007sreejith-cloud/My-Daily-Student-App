import React, { useEffect, useState } from 'react';

export const KatanaSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [shouldSkip, setShouldSkip] = useState(false);

  useEffect(() => {
    // 1. Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setShouldSkip(true);
      onComplete();
      return;
    }

    // Sequence timing
    // 0: Init
    // 1: Strike
    // 2: Logo + Text + Petals
    // 3: Exit/Expand
    const t1 = setTimeout(() => setStage(1), 200);
    const t2 = setTimeout(() => setStage(2), 600);
    const t3 = setTimeout(() => {
      setStage(3);
      sessionStorage.setItem('katana_splashed', 'true');
    }, 2000);
    const t4 = setTimeout(() => onComplete(), 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  if (shouldSkip) return null;

  // Time based background
  const hour = new Date().getHours();
  let bgStyle: React.CSSProperties = { backgroundColor: 'var(--bg-color)' };
  if (hour >= 6 && hour < 12) {
    bgStyle = { background: 'linear-gradient(to bottom, #f7f5f2, #e8dfd5)' }; // Morning
  } else if (hour >= 12 && hour < 17) {
    bgStyle = { background: '#f7f5f2' }; // Afternoon
  } else if (hour >= 17 && hour < 20) {
    bgStyle = { background: 'linear-gradient(to bottom, #2d2b2a, #4a3434)' }; // Evening
  } else {
    bgStyle = { background: '#111111' }; // Night
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      ...bgStyle,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      opacity: stage === 3 ? 0 : 1,
      transition: 'opacity 0.4s cubic-bezier(0.8, 0, 0.2, 1)',
      pointerEvents: 'none'
    }}>
      {/* Noise/Grain Texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'var(--washi-overlay)',
        opacity: 0.5,
        zIndex: 0
      }} />

      <div style={{ position: 'relative', width: '300px', height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        
        {/* Cinematic Blade Strike */}
        {stage >= 1 && stage < 3 && (
          <div style={{
            position: 'absolute',
            top: '50px',
            height: '2px',
            width: '200%',
            background: 'linear-gradient(90deg, transparent, var(--katana-silver), #ffffff, var(--katana-silver), transparent)',
            boxShadow: '0 0 15px var(--katana-silver)',
            animation: 'bladeStrike 0.4s cubic-bezier(0.19, 1, 0.22, 1) forwards'
          }} />
        )}
        
        {/* Katana Logo Mark */}
        {stage >= 2 && (
          <div style={{
            marginBottom: '16px',
            animation: 'fadeIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards'
          }}>
             <svg width="48" height="48" viewBox="0 0 100 100" style={{ transform: 'rotate(-45deg)' }}>
                {/* Handle */}
                <rect x="46" y="70" width="8" height="25" rx="2" fill="var(--text-secondary)" />
                <line x1="46" y1="75" x2="54" y2="75" stroke="var(--bg-color)" strokeWidth="1" />
                <line x1="46" y1="80" x2="54" y2="80" stroke="var(--bg-color)" strokeWidth="1" />
                <line x1="46" y1="85" x2="54" y2="85" stroke="var(--bg-color)" strokeWidth="1" />
                
                {/* Tsuba (Guard) */}
                <rect x="42" y="66" width="16" height="4" rx="1" fill="var(--text-primary)" />
                
                {/* Blade */}
                <path d="M 48 66 L 48 15 Q 50 5 50 5 Q 50 5 52 15 L 52 66 Z" fill="var(--katana-silver)" />
                {/* Blade edge highlight */}
                <path d="M 50 15 Q 50 5 50 5 Q 50 5 52 15 L 52 66 L 50 66 Z" fill="#ffffff" opacity="0.6" />
             </svg>
          </div>
        )}

        {/* Text */}
        <h1 style={{
          fontFamily: 'var(--font-family)',
          color: 'var(--text-primary)',
          fontSize: '36px',
          fontWeight: 800,
          margin: 0,
          textTransform: 'uppercase',
          animation: stage >= 2 ? 'textForge 0.8s cubic-bezier(0.19, 1, 0.22, 1) backwards' : 'none',
          opacity: stage >= 2 ? 1 : 0
        }}>
          KATANA
        </h1>
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '12px',
          letterSpacing: '2px',
          marginTop: '12px',
          textTransform: 'uppercase',
          animation: stage >= 2 ? 'textForgeLight 0.8s cubic-bezier(0.19, 1, 0.22, 1) backwards 0.2s' : 'none',
          opacity: stage >= 2 ? 1 : 0
        }}>
          VIT-AP Student Companion
        </p>
      </div>

      {/* Cinematic Petals (4 petals) */}
      {stage >= 2 && (
        <>
          <div className="sakura-petal" style={{ top: '35%', left: '40%', animation: 'sakuraDrift 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' }} />
          <div className="sakura-petal" style={{ top: '25%', left: '55%', animation: 'sakuraDrift 2.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 0.1s' }} />
          <div className="sakura-petal" style={{ top: '45%', left: '45%', animation: 'sakuraDrift 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 0.2s', width: '8px', height: '6px' }} />
          <div className="sakura-petal" style={{ top: '30%', left: '60%', animation: 'sakuraDrift 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 0.3s', width: '14px', height: '9px' }} />
        </>
      )}
    </div>
  );
};
