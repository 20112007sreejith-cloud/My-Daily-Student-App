import React, { useRef, useState, MouseEvent } from 'react';
import { GlassCard } from './GlassComponents';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevated?: boolean;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({ children, elevated, className = '', style, ...props }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPosition({ x, y });
  };

  return (
    <GlassCard
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      elevated={elevated}
      className={`spotlight-card ${className}`}
      style={{
        ...style,
        ...(isHovered ? {
          '--mouse-x': `${position.x}px`,
          '--mouse-y': `${position.y}px`
        } as React.CSSProperties : {})
      }}
      {...props}
    >
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {children}
      </div>
    </GlassCard>
  );
};
