import React, { useState, useEffect } from 'react';
import { GlassCard, GlassButton } from '../components/ui/GlassComponents';
import { ClassCard } from '../components/ClassCard';
import { BreakCard } from '../components/BreakCard';
import { storageService } from '../services/storageService';
import { TimetableEvent, DayOfWeek, ClassEvent } from '../models/types';
import { injectBreaksAndLunch } from '../utils/timeUtils';
import { geminiService } from '../services/geminiService';
import { FileText } from 'lucide-react';
import { FreeDayExperience } from '../features/timetable/FreeDayExperience';
import { useClock } from '../contexts/ClockContext';

const DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export const TimetableView: React.FC = () => {
  const { currentEvent, currentDayStr } = useClock();
  const [events, setEvents] = useState<TimetableEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => {
    const dayIndex = new Date().getDay();
    const map: Record<number, DayOfWeek> = { 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI', 6: 'SAT' };
    return map[dayIndex] || 'MON'; // fallback to Monday on Sundays
  });
  const [isUploading, setIsUploading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'THEORY' | 'LAB'>('ALL');
  const [rawText, setRawText] = useState('');

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = () => {
    const data = storageService.getTimetable();
    setEvents(data);
  };

  const handleTextImport = async () => {
    if (!rawText.trim()) {
      setProgressMsg('Please paste your timetable text first.');
      setIsUploading(true);
      setTimeout(() => setIsUploading(false), 3000);
      return;
    }

    const apiKey = storageService.getSettings().geminiApiKey;
    if (!apiKey) {
      setProgressMsg('Gemini API Key missing. Please add your free API key in the Settings tab to use AI import.');
      setIsUploading(true);
      setTimeout(() => setIsUploading(false), 5000);
      return;
    }

    setIsUploading(true);
    setProgressMsg('Initializing text parser...');
    
    try {
      const extractedClasses = await geminiService.extractTimetableFromText(rawText, apiKey, setProgressMsg);
      const fullTimetable: TimetableEvent[] = [];
      const currentMappings = storageService.getCourseMappings();
      let mappingsUpdated = false;
      
      for (const day of DAYS) {
        const dayClasses = extractedClasses.filter(c => c.day === day);
        
        // Auto-save any subjects extracted by AI into our course mappings
        dayClasses.forEach(c => {
          if (c.courseCode && c.subject && !currentMappings[c.courseCode]) {
            currentMappings[c.courseCode] = c.subject;
            mappingsUpdated = true;
          }
        });

        const completeDay = injectBreaksAndLunch(dayClasses);
        fullTimetable.push(...completeDay);
      }
      
      if (mappingsUpdated) {
        storageService.saveCourseMappings(currentMappings);
      }
      
      storageService.saveTimetable(fullTimetable);
      setEvents(fullTimetable);
      setIsUploading(false);
      setRawText('');
    } catch (err: any) {
      console.error(err);
      setProgressMsg(`Error: ${err?.message || JSON.stringify(err)}`);
      setTimeout(() => setIsUploading(false), 10000);
    }
  };

  const dayEvents = events.filter(e => e.day === selectedDay).sort((a,b) => a.startTime.localeCompare(b.startTime));
  const filteredEvents = dayEvents.filter(e => filter === 'ALL' || (e.type === 'CLASS' && (e as ClassEvent).classType === filter));

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 className="text-large-title">Timetable</h2>
        {events.length > 0 && (
          <GlassButton variant="secondary" onClick={() => {
            if (window.confirm("Are you sure you want to clear your current timetable?")) {
              storageService.saveTimetable([]);
              setEvents([]);
            }
          }}>
            Clear
          </GlassButton>
        )}
      </header>

      {isUploading && (
        <GlassCard elevated style={{ padding: '32px', textAlign: 'center', marginBottom: '32px' }}>
          <div className="status-dot live" style={{ width: 12, height: 12, marginBottom: '16px' }}></div>
          <h3 className="text-card-title">{progressMsg}</h3>
        </GlassCard>
      )}

      {events.length === 0 && !isUploading ? (
        <GlassCard style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 className="text-section-title">No timetable yet</h3>
          <p className="text-body text-secondary">
            Paste your raw VIT-AP timetable text below. The AI will instantly parse the classes, rooms, and times.
          </p>
          <textarea 
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste raw timetable text here..."
            style={{
              width: '100%',
              height: '200px',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg-2)',
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
              resize: 'vertical'
            }}
          />
          <GlassButton onClick={handleTextImport} style={{ alignSelf: 'flex-end' }}>
            <FileText size={16} style={{ marginRight: '8px' }} />
            Extract Timetable
          </GlassButton>
        </GlassCard>
      ) : (
        <>
          <div className="glass-panel" style={{ display: 'flex', padding: '8px', marginBottom: '24px', overflowX: 'auto' }}>
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  background: selectedDay === day ? 'var(--glass-bg-3)' : 'transparent',
                  borderRadius: '16px',
                  color: selectedDay === day ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: selectedDay === day ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '60px',
                  boxShadow: selectedDay === day ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {day}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {(['ALL', 'THEORY', 'LAB'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: filter === f ? 'var(--accent-color)' : 'var(--glass-border)',
                  background: filter === f ? 'rgba(0,122,255,0.1)' : 'transparent',
                  color: filter === f ? 'var(--accent-color)' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="fade-in">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => {
                const isActive = currentEvent?.id === event.id && selectedDay === currentDayStr;
                return event.type === 'CLASS' ? (
                  <ClassCard key={event.id} event={event as ClassEvent} isActive={isActive} />
                ) : (
                  <BreakCard key={event.id} event={event as any} isActive={isActive} />
                );
              })
            ) : (
              <FreeDayExperience />
            )}
          </div>
        </>
      )}
    </div>
  );
};
