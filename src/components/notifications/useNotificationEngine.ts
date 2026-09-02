import { useEffect, useRef } from 'react';
import { useClock } from '../../contexts/ClockContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { storageService } from '../../services/storageService';
import { ClassEvent } from '../../models/types';
import { isSameDay } from 'date-fns';

export const useNotificationEngine = () => {
  const { currentTime, nextEvent } = useClock();
  const { addNotification } = useNotifications();
  
  // Keep track of notified items to prevent spamming
  const notifiedEvents = useRef<Set<string>>(new Set());
  const notifiedTasks = useRef<Set<string>>(new Set());
  const lastDay = useRef<number>(currentTime.getDate());

  // Clear cache if the day changes
  useEffect(() => {
    if (currentTime.getDate() !== lastDay.current) {
      notifiedEvents.current.clear();
      notifiedTasks.current.clear();
      lastDay.current = currentTime.getDate();
    }
  }, [currentTime]);

  // 1. Timetable Reminders (25 mins before)
  useEffect(() => {
    if (!nextEvent || !nextEvent.startTime) return;

    try {
      // Parse the start time (e.g. "08:00")
      const [hours, minutes] = nextEvent.startTime.split(':').map(Number);
      const eventTime = new Date(currentTime);
      eventTime.setHours(hours, minutes, 0, 0);

      // Calculate difference in minutes
      const diffMs = eventTime.getTime() - currentTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      // Notify exactly at 25 minutes (or if we wake up and it's between 20-25 mins and we haven't notified)
      if (diffMins <= 25 && diffMins > 0 && !notifiedEvents.current.has(nextEvent.id)) {
        if (nextEvent.type === 'CLASS') {
          const classEv = nextEvent as ClassEvent;
          addNotification(
            'Upcoming Class',
            `${classEv.subject ?? classEv.courseCode ?? 'Class'} starts in ${diffMins} minutes${classEv.room ? ` at ${classEv.room}` : ''}`,
            'WARNING'
          );
        } else {
          addNotification(
            'Upcoming Break',
            `Your break starts in ${diffMins} minutes`,
            'INFO'
          );
        }
        notifiedEvents.current.add(nextEvent.id);
      }
    } catch (err) {
      console.error('Error scheduling notification for next event', err);
    }
  }, [currentTime, nextEvent, addNotification]);

  // 2. Task Reminders (Due Today)
  useEffect(() => {
    // Check once on mount or when the day changes
    const todos = storageService.getTodos().filter(t => !t.completed && t.dueDate);
    
    let tasksDueToday = 0;
    todos.forEach(todo => {
      if (todo.dueDate && !notifiedTasks.current.has(todo.id)) {
        const dueDate = new Date(todo.dueDate);
        if (isSameDay(dueDate, currentTime)) {
          tasksDueToday++;
          notifiedTasks.current.add(todo.id);
        }
      }
    });

    if (tasksDueToday > 0) {
      addNotification(
        'Tasks Due Today',
        `You have ${tasksDueToday} task${tasksDueToday > 1 ? 's' : ''} due today. Let's get them done!`,
        'INFO'
      );
    }
  }, [currentTime.getDate(), addNotification]); // Re-run when the day of the month changes
};
