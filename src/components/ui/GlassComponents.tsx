import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, elevated = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          elevated ? 'glass-panel-elevated' : 'glass-panel',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = 'GlassCard';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    
    // We will use inline styles or CSS classes for buttons. Let's add basic styles here
    // But better to add them to index.css and reference them here.
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px 24px',
      borderRadius: '20px',
      border: '1px solid var(--glass-border-strong)',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all 0.2s ease',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    };
    
    const variants = {
      primary: {
        background: 'rgba(0, 122, 255, 0.2)',
        color: 'var(--accent-color)',
      },
      secondary: {
        background: 'var(--glass-bg-2)',
        color: 'var(--text-primary)',
      },
      danger: {
        background: 'rgba(255, 59, 48, 0.2)',
        color: 'var(--danger-color)',
      }
    };

    return (
      <button
        ref={ref}
        className={className}
        style={{ ...baseStyle, ...variants[variant], ...(props.style || {}) }}
        {...props}
      />
    );
  }
);
GlassButton.displayName = 'GlassButton';

export const GlassBadge: React.FC<{ children: React.ReactNode; variant?: 'live' | 'upcoming' | 'completed' | 'break' | 'lunch' }> = ({ children, variant = 'upcoming' }) => {
  const getColors = () => {
    switch (variant) {
      case 'live': return { bg: 'rgba(255, 59, 48, 0.15)', color: 'var(--danger-color)' };
      case 'break': return { bg: 'rgba(175, 82, 222, 0.15)', color: 'var(--break-color)' };
      case 'lunch': return { bg: 'rgba(52, 199, 89, 0.15)', color: 'var(--success-color)' };
      case 'completed': return { bg: 'rgba(142, 142, 147, 0.15)', color: 'var(--text-secondary)' };
      case 'upcoming': default: return { bg: 'var(--glass-bg-2)', color: 'var(--accent-color)' };
    }
  };
  
  const { bg, color } = getColors();
  
  return (
    <span style={{
      background: bg,
      color: color,
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 700,
      letterSpacing: '0.5px',
      display: 'inline-flex',
      alignItems: 'center',
      border: `1px solid ${color}33`,
      backdropFilter: 'blur(10px)',
    }}>
      {variant === 'live' && <span className="status-dot live" style={{ width: 6, height: 6, marginRight: 6 }}></span>}
      {children}
    </span>
  );
};
