import React, { useEffect, useState } from 'react';

interface AtmosphereProps {
  children: React.ReactNode;
}

export const DashboardAtmosphere: React.FC<AtmosphereProps> = ({ children }) => {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Determine time of day
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 17) setTimeOfDay('afternoon');
    else if (hour >= 17 && hour < 20) setTimeOfDay('evening');
    else setTimeOfDay('night');

    // Check reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const getBackgroundStyle = () => {
    switch (timeOfDay) {
      case 'morning':
        return 'radial-gradient(circle at top right, rgba(255,214,10,0.1), transparent 50%), radial-gradient(circle at bottom left, rgba(10,132,255,0.05), transparent 50%)';
      case 'afternoon':
        return 'radial-gradient(circle at top right, rgba(255,149,0,0.1), transparent 50%), radial-gradient(circle at bottom left, rgba(255,45,85,0.05), transparent 50%)';
      case 'evening':
        return 'radial-gradient(circle at top right, rgba(175,82,222,0.1), transparent 50%), radial-gradient(circle at bottom left, rgba(255,149,0,0.05), transparent 50%)';
      case 'night':
        return 'radial-gradient(circle at top right, rgba(94,92,230,0.1), transparent 50%), radial-gradient(circle at bottom left, rgba(10,132,255,0.05), transparent 50%)';
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%', width: '100%' }}>
      {/* Dynamic Background Atmosphere */}
      <div 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: getBackgroundStyle(),
          transition: 'background 2s ease',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      
      {/* Subtle Particles */}
      {!prefersReducedMotion && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div className="float" style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.02)', filter: 'blur(60px)', borderRadius: '50%' }} />
          <div className="drift" style={{ position: 'absolute', top: '60%', right: '10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.01)', filter: 'blur(80px)', borderRadius: '50%' }} />
        </div>
      )}

      {/* Content wrapper */}
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {children}
      </div>
    </div>
  );
};
