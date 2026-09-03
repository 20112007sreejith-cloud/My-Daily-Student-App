import React, { useEffect, useState } from 'react';
import { GlassCard, GlassBadge } from './ui/GlassComponents';
import { ClassEvent } from '../models/types';
import { formatDuration, parseTimeString, getMinutesBetween, getCurrentTime, formatTimeDisplay } from '../utils/timeUtils';
import { MapPin, DoorOpen, Clock, Users, Edit2 } from 'lucide-react';
import { differenceInSeconds } from 'date-fns';
import { storageService } from '../services/storageService';

interface ClassCardProps {
  event: ClassEvent;
  isActive?: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = ({ event, isActive = false }) => {
  const [remainingSecs, setRemainingSecs] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [courseName, setCourseName] = useState<string | null>(null);
  
  const format24h = storageService.getSettings().format24h;

  useEffect(() => {
    const loadMapping = () => {
      if (event.courseCode) {
        const mappings = storageService.getCourseMappings();
        setCourseName(mappings[event.courseCode] || event.subject || null);
      }
    };
    loadMapping();
    window.addEventListener('mappingsUpdated', loadMapping);
    return () => window.removeEventListener('mappingsUpdated', loadMapping);
  }, [event.courseCode]);

  const handleEditCourseName = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!event.courseCode) return;
    const currentName = storageService.getCourseMappings()[event.courseCode] || '';
    const newName = window.prompt(`Enter Full Course Name for ${event.courseCode}:`, currentName);
    if (newName !== null) {
      const mappings = storageService.getCourseMappings();
      mappings[event.courseCode] = newName.trim();
      storageService.saveCourseMappings(mappings);
    }
  };

  useEffect(() => {
    if (!isActive) return;

    const updateTimer = () => {
      const now = getCurrentTime();
      const end = parseTimeString(event.endTime);
      const start = parseTimeString(event.startTime);
      
      const remaining = differenceInSeconds(end, now);
      if (remaining >= 0) {
        setRemainingSecs(remaining);
        
        const totalDurationSecs = event.durationMinutes * 60;
        const elapsedSecs = totalDurationSecs - remaining;
        setProgress((elapsedSecs / totalDurationSecs) * 100);
      } else {
        setRemainingSecs(0);
        setProgress(100);
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

  const getStatusVariant = () => {
    if (isActive) return 'live';
    const now = getCurrentTime();
    
    const todayIndex = now.getDay();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const eventDayIndex = days.indexOf(event.day);
    
    if (eventDayIndex !== -1) {
      if (todayIndex === 0) {
        return 'upcoming';
      }
      if (eventDayIndex < todayIndex) return 'ended';
      if (eventDayIndex > todayIndex) return 'upcoming';
    }

    const end = parseTimeString(event.endTime);
    if (now > end) return 'ended';
    return 'upcoming';
  };

  return (
    <GlassCard elevated={isActive} style={{ padding: '24px', marginBottom: '16px', position: 'relative' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{
          background: event.classType === 'THEORY' ? 'rgba(0, 122, 255, 0.15)' : 'rgba(255, 149, 0, 0.15)',
          color: event.classType === 'THEORY' ? '#0A84FF' : '#FF9F0A',
          padding: '6px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '0.5px',
          border: `1px solid ${event.classType === 'THEORY' ? '#0A84FF' : '#FF9F0A'}40`,
        }}>
          {event.classType} · {isActive ? 'LIVE' : getStatusVariant().toUpperCase()}
        </span>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          {courseName ? (
            <h3 className="text-card-title" style={{ fontSize: '1.25rem' }}>{courseName}</h3>
          ) : (
            <button 
              onClick={handleEditCourseName}
              style={{ background: 'transparent', border: '1px dashed var(--glass-border-strong)', color: 'var(--text-secondary)', padding: '4px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              [ Add Course Name ]
            </button>
          )}
          {courseName && (
            <button onClick={handleEditCourseName} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
              <Edit2 size={14} />
            </button>
          )}
        </div>
        <p className="text-body" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{event.courseCode || event.rawText}</p>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
        <Clock size={16} />
        <span className="text-body" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
          {formatTimeDisplay(event.startTime, format24h)} — {formatTimeDisplay(event.endTime, format24h)}
        </span>
        <span className="text-metadata">({formatDuration(event.durationMinutes)})</span>
      </div>

      {(event.building || event.room) && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          {event.building && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} color="var(--accent-color)" />
              <span className="text-body">{event.building}</span>
            </div>
          )}
          {event.room && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DoorOpen size={16} color="var(--accent-color)" />
              <span className="text-body">{event.room}</span>
            </div>
          )}
        </div>
      )}

      {event.section && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <Users size={16} color="var(--text-tertiary)" />
          <span className="text-metadata">{event.section}</span>
        </div>
      )}

      {isActive && (
        <div className="fade-in" style={{ marginTop: '24px', padding: '16px', background: 'var(--glass-bg-2)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px' }}>
            <span className="text-timer">{formatRemaining(remainingSecs)}</span>
            <span className="text-metadata">remaining</span>
          </div>
          <div className="progress-bar-container" style={{ position: 'relative', overflow: 'visible', height: '2px', background: 'var(--glass-border)' }}>
            <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.max(0, progress))}%`, transition: 'width 1s linear', height: '100%', background: 'var(--text-primary)', boxShadow: '0 0 8px var(--text-primary)' }}></div>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: `${Math.min(100, Math.max(0, progress))}%`,
              transform: 'translate(-50%, -50%)',
              width: '4px',
              height: '16px',
              borderRadius: '2px',
              background: '#fff',
              boxShadow: '0 0 10px #fff',
              transition: 'left 1s linear'
            }} />
          </div>
        </div>
      )}
    </GlassCard>
  );
};
