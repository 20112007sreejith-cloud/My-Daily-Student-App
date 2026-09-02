import React, { useEffect, useState } from 'react';

interface ParticleBurstProps {
  x: number;
  y: number;
  color?: string;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  duration: number;
}

export const ParticleBurst: React.FC<ParticleBurstProps> = ({ 
  x, 
  y, 
  color = 'var(--accent-color)', 
  onComplete 
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate 5-8 particles
    const numParticles = Math.floor(Math.random() * 4) + 5;
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < numParticles; i++) {
      newParticles.push({
        id: i,
        angle: (360 / numParticles) * i + (Math.random() * 20 - 10),
        distance: 20 + Math.random() * 30,
        size: 3 + Math.random() * 4,
        duration: 400 + Math.random() * 300,
      });
    }
    
    setParticles(newParticles);
    
    // Auto-cleanup
    const maxDuration = Math.max(...newParticles.map(p => p.duration));
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, maxDuration + 100);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      left: x,
      top: y,
      pointerEvents: 'none',
      zIndex: 9999
    }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: color,
            borderRadius: '50%',
            opacity: 0,
            transformOrigin: 'center center',
            animation: `particleOut ${p.duration}ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`,
            '--angle': `${p.angle}deg`,
            '--distance': `${p.distance}px`
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
