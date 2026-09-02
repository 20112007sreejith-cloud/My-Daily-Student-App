import React, { useEffect, useState } from 'react';
import { GlassCard } from './ui/GlassComponents';
import { BreakEvent } from '../models/types';
import { formatDuration, parseTimeString, getCurrentTime, formatTimeDisplay } from '../utils/timeUtils';
import { storageService } from '../services/storageService';
import { Coffee, Utensils } from 'lucide-react';
import { differenceInSeconds } from 'date-fns';

interface BreakCardProps {
  event: BreakEvent;
  isActive?: boolean;
}

export const BreakCard: React.FC<BreakCardProps> = ({ event, isActive = false }) => {
  const isLunch = event.type === 'LUNCH';
  const Icon = isLunch ? Utensils : Coffee;
  const color = isLunch ? 'var(--success-color)' : 'var(--break-color)';
  const format24h = storageService.getSettings().format24h;
  
  const [remainingSecs, setRemainingSecs] = useState<number>(0);

  useEffect(() => {
    if (!isActive) return;

    const updateTimer = () => {
      const now = getCurrentTime();
      const end = parseTimeString(event.endTime);
      const remaining = differenceInSeconds(end, now);
      if (remaining >= 0) {
        setRemainingSecs(remaining);
      } else {
        setRemainingSecs(0);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isActive, event]);

  const formatRemaining = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    
    const pad = (num: number) => num.toString().padStart(2, '0');
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  };

  return (
    <GlassCard elevated={isActive} style={{ 
      padding: '16px 20px', 
      marginBottom: '16px',
      borderLeft: `4px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          width: '40px', height: '40px', 
          borderRadius: '20px', 
          background: `${color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={20} color={color} />
        </div>
        <div>
          <h4 className="text-card-title" style={{ fontSize: '16px', marginBottom: '4px' }}>
            {isLunch ? 'Lunch Break' : 'Break'}
          </h4>
          <span className="text-metadata">
            {formatTimeDisplay(event.startTime, format24h)} — {formatTimeDisplay(event.endTime, format24h)} ({formatDuration(event.durationMinutes)})
          </span>
        </div>
      </div>
      
      {isActive && (
        <div style={{ textAlign: 'right' }}>
          <div className="text-timer" style={{ fontSize: '1.2rem', color }}>
            {formatRemaining(remainingSecs)}
          </div>
          <div className="text-metadata">remaining</div>
        </div>
      )}
    </GlassCard>
  );
};
