import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { TimetableEvent, DayOfWeek } from '../models/types';
import { getEventStates } from '../utils/timeUtils';
import { storageService } from '../services/storageService';

interface ClockContextType {
  currentTime: Date;
  currentDayStr: DayOfWeek;
  formattedTime: string;
  formattedDate: string;
  currentEvent: TimetableEvent | null;
  nextEvent: TimetableEvent | null;
}

const ClockContext = createContext<ClockContextType | null>(null);

export const useClock = () => {
  const context = useContext(ClockContext);
  if (!context) {
    throw new Error('useClock must be used within a ClockProvider');
  }
  return context;
};

export const ClockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentEvent, setCurrentEvent] = useState<TimetableEvent | null>(null);
  const [nextEvent, setNextEvent] = useState<TimetableEvent | null>(null);

  // Cache storage lookups to prevent parsing JSON every single second
  const lastFetch = useRef(0);
  const cache = useRef({ settings: storageService.getSettings(), timetable: storageService.getTimetable() });

  useEffect(() => {
    // 1-second precision tick
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Determine current/next event whenever time updates
    const dayIndex = currentTime.getDay();
    const days: DayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const currentDayStr = days[dayIndex];

    // Refresh cache every 10 seconds to avoid GC thrashing from JSON.parse
    if (Date.now() - lastFetch.current > 10000) {
      cache.current.settings = storageService.getSettings();
      cache.current.timetable = storageService.getTimetable();
      lastFetch.current = Date.now();
    }

    const allEvents = cache.current.timetable;
    const todayEvents = allEvents.filter(e => e.day === currentDayStr);
    
    // Time-based filtering (util function getEventStates)
    const { currentEvent: curEv, nextEvent: nextEv } = getEventStates(todayEvents, currentTime);
    
    // Only trigger state updates if references change significantly to avoid deep re-renders
    setCurrentEvent(prev => prev?.id === curEv?.id ? prev : curEv);
    setNextEvent(prev => prev?.id === nextEv?.id ? prev : nextEv);
  }, [currentTime]);

  const dayIndex = currentTime.getDay();
  const days: DayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  return (
    <ClockContext.Provider value={{
      currentTime,
      currentDayStr: days[dayIndex],
      formattedTime: format(currentTime, cache.current.settings.format24h ? 'HH:mm:ss' : 'hh:mm:ss a'),
      formattedDate: format(currentTime, 'EEEE, MMMM d'),
      currentEvent,
      nextEvent
    }}>
      {children}
    </ClockContext.Provider>
  );
};
