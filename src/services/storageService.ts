import { TimetableEvent, MessDay, Todo, UserSettings } from '../models/types';

const STORAGE_KEYS = {
  TIMETABLE: 'vitap_timetable',
  MESS_MENU: 'vitap_mess_menu',
  TODOS: 'vitap_todos',
  SETTINGS: 'vitap_settings',
  COURSE_MAPPINGS: 'vitap_course_mappings',
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  format24h: false,
  notificationsEnabled: true,
  reducedMotion: false,
  geminiApiKey: ''
};

export const storageService = {
  getTimetable: (): TimetableEvent[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTimetable: (events: TimetableEvent[]): void => {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(events));
  },

  getMessMenu: (): MessDay[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESS_MENU);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveMessMenu: (menu: MessDay[]): void => {
    localStorage.setItem(STORAGE_KEYS.MESS_MENU, JSON.stringify(menu));
  },

  getTodos: (): Todo[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TODOS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTodos: (todos: Todo[]): void => {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  },

  getSettings: (): UserSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: UserSettings): void => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  clearAllData: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },

  getCourseMappings: (): Record<string, string> => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COURSE_MAPPINGS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveCourseMappings: (mappings: Record<string, string>): void => {
    localStorage.setItem(STORAGE_KEYS.COURSE_MAPPINGS, JSON.stringify(mappings));
    window.dispatchEvent(new Event('mappingsUpdated'));
  }
};
