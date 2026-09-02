export type EventType = 'CLASS' | 'BREAK' | 'LUNCH';
export type ClassType = 'THEORY' | 'LAB';
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface TimetableEvent {
  id: string;
  day: DayOfWeek;
  type: EventType;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  durationMinutes: number;
}

export interface ClassEvent extends TimetableEvent {
  type: 'CLASS';
  classType: ClassType;
  rawText: string;
  slotCode?: string;
  courseCode?: string;
  subject?: string;
  building?: string;
  room?: string;
  section?: string;
  faculty?: string;
}

export interface BreakEvent extends TimetableEvent {
  type: 'BREAK' | 'LUNCH';
}

export interface Meal {
  type: 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER';
  items: string[];
}

export interface MessDay {
  date: string; // YYYY-MM-DD
  vegNonVeg: Meal[];
  special: Meal[];
}

export type TaskPriority = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate?: string; // ISO date string
  dueTime?: string; // HH:mm format
  reminder?: string; // ISO datetime
  recurrence?: 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM' | 'NONE';
  listId?: string;
  tags: string[];
  subtasks: Subtask[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  courseCode?: string;
}

export interface TodoList {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  format24h: boolean;
  notificationsEnabled: boolean;
  reducedMotion: boolean;
  geminiApiKey?: string;
}

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string; // ISO string
  read: boolean;
  actionUrl?: string; // Optional URL or route to navigate to on click
}
