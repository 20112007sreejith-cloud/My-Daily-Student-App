import { useState, useEffect, useCallback } from 'react';
import { Todo, TodoList, Tag, TaskPriority } from '../../../models/types';
import { todoService } from '../../../services/todoService';
import { v4 as uuidv4 } from 'uuid';

export const useTodos = () => {
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [lists, setLists] = useState<TodoList[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const loadData = useCallback(() => {
    setTasks(todoService.getTodos());
    setLists(todoService.getLists());
    setTags(todoService.getTags());
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('todosUpdated', loadData);
    window.addEventListener('listsUpdated', loadData);
    window.addEventListener('tagsUpdated', loadData);
    return () => {
      window.removeEventListener('todosUpdated', loadData);
      window.removeEventListener('listsUpdated', loadData);
      window.removeEventListener('tagsUpdated', loadData);
    };
  }, [loadData]);

  const addTask = (title: string, priority: TaskPriority = 'NONE', listId?: string, dueDate?: string, dueTime?: string) => {
    const newTask: Todo = {
      id: uuidv4(),
      title,
      completed: false,
      priority,
      tags: [],
      subtasks: [],
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      listId,
      dueDate,
      dueTime
    };
    todoService.saveTodos([newTask, ...tasks]);
  };

  const updateTask = (id: string, updates: Partial<Todo>) => {
    const updated = tasks.map(t => 
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    todoService.saveTodos(updated);
  };

  const toggleTaskCompletion = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    updateTask(id, { 
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : undefined
    });
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    todoService.saveTodos(updated);
  };

  const toggleTaskFavorite = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    updateTask(id, { favorite: !task.favorite });
  };

  const addList = (name: string) => {
    const newList: TodoList = {
      id: uuidv4(),
      name,
      order: lists.length
    };
    todoService.saveLists([...lists, newList]);
  };

  return {
    tasks,
    lists,
    tags,
    addTask,
    updateTask,
    toggleTaskCompletion,
    toggleTaskFavorite,
    deleteTask,
    addList
  };
};
