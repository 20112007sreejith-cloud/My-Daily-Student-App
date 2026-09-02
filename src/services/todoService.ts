import { Todo, TodoList, Tag } from '../models/types';

const STORAGE_KEYS = {
  TODOS: 'vitap_todos_v2',
  LISTS: 'vitap_todo_lists',
  TAGS: 'vitap_todo_tags',
};

export const todoService = {
  // Tasks
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
    window.dispatchEvent(new Event('todosUpdated'));
  },

  // Lists
  getLists: (): TodoList[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LISTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLists: (lists: TodoList[]): void => {
    localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
    window.dispatchEvent(new Event('listsUpdated'));
  },

  // Tags
  getTags: (): Tag[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TAGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTags: (tags: Tag[]): void => {
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    window.dispatchEvent(new Event('tagsUpdated'));
  }
};
