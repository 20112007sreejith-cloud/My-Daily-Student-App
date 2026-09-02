import React, { useEffect, useState } from 'react';
import { Sun, Moon, Cloud, Stars } from 'lucide-react';
import { ParticleBurst } from './ParticleBurst';

type TimeOfDay = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';

export const AmbientEnvironment: React.FC<{ children: React.ReactNode, showCelestial?: boolean }> = ({ children, showCelestial = true }) => {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('MORNING');
  const [isHovered, setIsHovered] = useState(false);
  const [clickParticles, setClickParticles] = useState<{ id: number, x: number, y: number }[]>([]);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) setTimeOfDay('MORNING');
      else if (hour >= 12 && hour < 17) setTimeOfDay('AFTERNOON');
      else if (hour >= 17 && hour < 20) setTimeOfDay('EVENING');
      else setTimeOfDay('NIGHT');
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    setClickParticles(prev => [...prev, { id: clickCount, x: e.clientX, y: e.clientY }]);
    setClickCount(c => c + 1);
  };

  const getCelestialStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      bottom: '150px',
      right: '40px',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      zIndex: 0,
      transform: isHovered ? 'scale(1.1) translateY(-5px)' : 'scale(1) translateY(0)',
    };

    switch (timeOfDay) {
      case 'MORNING':
        return { ...baseStyle, background: 'rgba(255, 204, 0, 0.2)', color: '#FFB300', filter: isHovered ? 'drop-shadow(0 0 30px rgba(255, 204, 0, 0.6))' : 'drop-shadow(0 0 15px rgba(255, 204, 0, 0.3))' };
      case 'AFTERNOON':
        return { ...baseStyle, bottom: '120px', background: 'rgba(255, 235, 59, 0.2)', color: '#FDD835', filter: isHovered ? 'drop-shadow(0 0 40px rgba(255, 235, 59, 0.8))' : 'drop-shadow(0 0 20px rgba(255, 235, 59, 0.4))' };
      case 'EVENING':
        return { ...baseStyle, bottom: '180px', background: 'rgba(255, 112, 67, 0.2)', color: '#FF7043', filter: isHovered ? 'drop-shadow(0 0 30px rgba(255, 112, 67, 0.6))' : 'drop-shadow(0 0 15px rgba(255, 112, 67, 0.3))' };
      case 'NIGHT':
        return { ...baseStyle, background: 'rgba(144, 202, 249, 0.1)', color: '#90CAF9', filter: isHovered ? 'drop-shadow(0 0 20px rgba(144, 202, 249, 0.4))' : 'drop-shadow(0 0 10px rgba(144, 202, 249, 0.2))' };
    }
  };

  return (
    <div className={`app-environment env-${timeOfDay.toLowerCase()}`}>
      {/* Background gradients managed by CSS via classes */}
      <div className="ambient-background" />

      {/* Subtle Torii Silhouette */}
      <div style={{
        position: 'fixed', bottom: '10vh', right: '5vw', opacity: 0.03, zIndex: -1, pointerEvents: 'none',
        transition: 'opacity 2s ease'
      }}>
        <svg width="200" height="150" viewBox="0 0 200 150" fill="currentColor" color="var(--text-primary)">
          <path d="M10,20 L190,20 L190,30 L10,30 Z" />
          <path d="M20,10 L180,10 L180,15 L20,15 Z" />
          <path d="M40,30 L40,150 L60,150 L60,30 Z" />
          <path d="M140,30 L140,150 L160,150 L160,30 Z" />
          <path d="M40,50 L160,50 L160,60 L40,60 Z" />
        </svg>
      </div>

      {/* Removed celestial object as per user request */}

      {/* Tiny clouds/stars for atmosphere */}
      {timeOfDay === 'NIGHT' && (
        <div className="stars-container" style={{ position: 'fixed', top: 0, right: 0, width: '300px', height: '200px', zIndex: -1, pointerEvents: 'none', opacity: 0.5 }}>
          <Stars size={16} color="var(--text-secondary)" style={{ position: 'absolute', top: '20%', left: '30%', animation: 'float 4s ease-in-out infinite' }} />
          <Stars size={12} color="var(--text-tertiary)" style={{ position: 'absolute', top: '60%', left: '70%', animation: 'float 5s ease-in-out infinite' }} />
        </div>
      )}
      {(timeOfDay === 'MORNING' || timeOfDay === 'AFTERNOON') && (
        <div className="clouds-container" style={{ position: 'fixed', top: 0, right: 0, width: '400px', height: '200px', zIndex: -1, pointerEvents: 'none', opacity: 0.15 }}>
          {/* Zen clouds */}
          <div style={{ position: 'absolute', top: '30%', left: '20%', width: '100px', height: '4px', background: 'var(--text-secondary)', borderRadius: '4px', animation: 'float 12s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '34%', left: '25%', width: '60px', height: '4px', background: 'var(--text-secondary)', borderRadius: '4px', animation: 'float 14s ease-in-out infinite reverse' }} />
        </div>
      )}

      {/* Static Cherry Blossoms in the background */}
      {(timeOfDay === 'MORNING' || timeOfDay === 'AFTERNOON') && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1, opacity: 0.15 }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <g fill="var(--sakura-pink, #ffb7c5)">
              <circle cx="15%" cy="20%" r="4" />
              <circle cx="16%" cy="19%" r="3" />
              <circle cx="14%" cy="21%" r="5" />
              
              <circle cx="80%" cy="15%" r="6" />
              <circle cx="82%" cy="14%" r="4" />
              <circle cx="79%" cy="17%" r="5" />
              
              <circle cx="50%" cy="8%" r="4" />
              <circle cx="51%" cy="9%" r="3" />
            </g>
          </svg>
        </div>
      )}

      {clickParticles.map(p => (
        <ParticleBurst 
          key={p.id} 
          x={p.x} 
          y={p.y} 
          color={timeOfDay === 'NIGHT' ? '#f0ece1' : 'var(--sakura-pink)'}
          onComplete={() => setClickParticles(prev => prev.filter(particle => particle.id !== p.id))}
        />
      ))}

      {children}
    </div>
  );
};
