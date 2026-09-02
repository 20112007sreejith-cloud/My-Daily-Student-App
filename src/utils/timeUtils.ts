import { format, parse, differenceInMinutes, startOfDay, addMinutes, isAfter, isBefore, isValid } from 'date-fns';
import { TimetableEvent, DayOfWeek, ClassEvent, BreakEvent } from '../models/types';

export const getCurrentTime = () => new Date();

export const parseTimeString = (timeStr: string): Date => {
  const baseDate = startOfDay(new Date());
  const parsed = parse(timeStr, 'HH:mm', baseDate);
  if (!isValid(parsed)) {
    // try h:mm
    return parse(timeStr, 'H:mm', baseDate);
  }
  return parsed;
};

export const getMinutesBetween = (startStr: string, endStr: string): number => {
  const start = parseTimeString(startStr);
  const end = parseTimeString(endStr);
  return differenceInMinutes(end, start);
};

export const formatTimeDisplay = (timeStr: string, format24h: boolean = false): string => {
  const parsed = parseTimeString(timeStr);
  return format(parsed, format24h ? 'HH:mm' : 'h:mm a');
};

export const formatDuration = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`.trim();
  }
  return `${mins}m`;
};

// Given a list of events for a day, inject breaks and lunch
export const injectBreaksAndLunch = (events: ClassEvent[]): TimetableEvent[] => {
  if (events.length === 0) return [];
  
  // Sort chronologically
  const sorted = [...events].sort((a, b) => {
    return parseTimeString(a.startTime).getTime() - parseTimeString(b.startTime).getTime();
  });

  const completeDay: TimetableEvent[] = [];
  const lunchStart = '12:50';
  const lunchEnd = '14:00';
  let lunchAdded = false;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    completeDay.push(current);

    // If Lunch happens between current and next class
    if (i < sorted.length - 1) {
      const next = sorted[i+1];
      const gapMinutes = getMinutesBetween(current.endTime, next.startTime);

      // In VIT-AP, there's often a 1-minute slot boundary. e.g. 09:50 to 09:51.
      // We DO NOT treat gaps <= 2 minutes as a break.
      if (gapMinutes > 2) {
        // Is it lunch?
        const isLunchGap = parseTimeString(current.endTime).getTime() <= parseTimeString(lunchStart).getTime() && 
                           parseTimeString(next.startTime).getTime() >= parseTimeString(lunchEnd).getTime();
        
        if (isLunchGap && !lunchAdded) {
          completeDay.push({
            id: `lunch-${current.day}`,
            day: current.day,
            type: 'LUNCH',
            startTime: lunchStart,
            endTime: lunchEnd,
            durationMinutes: getMinutesBetween(lunchStart, lunchEnd)
          });
          lunchAdded = true;

          // Check if there's still a gap before or after lunch
          const preLunchGap = getMinutesBetween(current.endTime, lunchStart);
          if (preLunchGap > 2) {
            completeDay.splice(completeDay.length - 1, 0, {
              id: `break-prelunch-${current.id}`,
              day: current.day,
              type: 'BREAK',
              startTime: current.endTime,
              endTime: lunchStart,
              durationMinutes: preLunchGap
            });
          }

          const postLunchGap = getMinutesBetween(lunchEnd, next.startTime);
          if (postLunchGap > 2) {
            completeDay.push({
              id: `break-postlunch-${current.id}`,
              day: current.day,
              type: 'BREAK',
              startTime: lunchEnd,
              endTime: next.startTime,
              durationMinutes: postLunchGap
            });
          }

        } else {
          // Standard Break
          completeDay.push({
            id: `break-${current.id}`,
            day: current.day,
            type: 'BREAK',
            startTime: current.endTime,
            endTime: next.startTime,
            durationMinutes: gapMinutes
          });
        }
      }
    }
  }

  return completeDay;
};

// Given a list of events and current time, figure out current and next event
export const getEventStates = (events: TimetableEvent[], now: Date) => {
  const currentTotalMins = now.getHours() * 60 + now.getMinutes();
  
  let currentEvent: TimetableEvent | null = null;
  let nextEvent: TimetableEvent | null = null;
  
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const startMins = parseTimeString(ev.startTime).getHours() * 60 + parseTimeString(ev.startTime).getMinutes();
    const endMins = parseTimeString(ev.endTime).getHours() * 60 + parseTimeString(ev.endTime).getMinutes();

    if (currentTotalMins >= startMins && currentTotalMins < endMins) {
      currentEvent = ev;
      if (i + 1 < events.length) {
        nextEvent = events[i+1];
      }
      break;
    } else if (currentTotalMins < startMins && !currentEvent) {
      nextEvent = ev;
      break;
    }
  }

  return { currentEvent, nextEvent };
};
