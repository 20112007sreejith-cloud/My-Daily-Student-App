import React, { useState, useEffect } from 'react';
import { GlassCard, GlassButton } from '../components/ui/GlassComponents';
import { storageService } from '../services/storageService';
import { Todo } from '../models/types';
import { Plus, Check, Trash2, Calendar, BookOpen } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const TodoView: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [newCourse, setNewCourse] = useState('');

  useEffect(() => {
    setTodos(storageService.getTodos());
  }, []);

  const saveTodos = (updated: Todo[]) => {
    storageService.saveTodos(updated);
    setTodos(updated);
  };

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const newTodo: Todo = {
      id: uuidv4(),
      title: newTitle,
      completed: false,
      priority: newPriority,
      courseCode: newCourse.trim() || undefined,
      tags: [],
      subtasks: [],
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveTodos([newTodo, ...todos]);
    setNewTitle('');
    setNewCourse('');
    setNewPriority('MEDIUM');
    setIsAdding(false);
  };

  const toggleComplete = (id: string) => {
    const updated = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTodos(updated);
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter(t => t.id !== id);
    saveTodos(updated);
  };

  const pendingTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 className="text-large-title">Tasks</h2>
        <GlassButton onClick={() => setIsAdding(true)}>
          <Plus size={16} style={{ marginRight: '8px' }} />
          Add Task
        </GlassButton>
      </header>

      {isAdding && (
        <GlassCard elevated style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 className="text-card-title" style={{ marginBottom: '16px' }}>New Task</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="text" 
              placeholder="What needs to be done?" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px',
                border: '1px solid var(--glass-border)', background: 'var(--glass-bg-1)',
                color: 'var(--text-primary)', outline: 'none'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Course (e.g. STS2010)" 
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: '12px', minWidth: '150px',
                  border: '1px solid var(--glass-border)', background: 'var(--glass-bg-1)',
                  color: 'var(--text-primary)', outline: 'none'
                }}
              />
              <select 
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: '12px', minWidth: '150px',
                  border: '1px solid var(--glass-border)', background: 'var(--glass-bg-1)',
                  color: 'var(--text-primary)', outline: 'none'
                }}
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <GlassButton variant="secondary" onClick={() => setIsAdding(false)}>Cancel</GlassButton>
              <GlassButton onClick={handleAdd}>Save Task</GlassButton>
            </div>
          </div>
        </GlassCard>
      )}

      {todos.length === 0 && !isAdding ? (
        <GlassCard style={{ padding: '64px 32px', textAlign: 'center' }}>
          <h3 className="text-section-title" style={{ marginBottom: '16px' }}>You're all caught up 🎉</h3>
          <p className="text-body text-secondary" style={{ marginBottom: '24px' }}>
            Enjoy your free time, or add a new task.
          </p>
          <GlassButton onClick={() => setIsAdding(true)}>
            Add Task
          </GlassButton>
        </GlassCard>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {pendingTodos.map(todo => (
              <GlassCard key={todo.id} style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                  onClick={() => toggleComplete(todo.id)}
                  style={{ 
                    width: '24px', height: '24px', borderRadius: '6px', 
                    border: '2px solid var(--glass-border-strong)', background: 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p className="text-body" style={{ fontWeight: 600 }}>{todo.title}</p>
                  {(todo.courseCode || todo.priority === 'HIGH') && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                      {todo.courseCode && <span className="text-metadata" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BookOpen size={12}/> {todo.courseCode}</span>}
                      {todo.priority === 'HIGH' && <span className="text-metadata" style={{ color: 'var(--danger-color)', fontWeight: 600 }}>High Priority</span>}
                    </div>
                  )}
                </div>
                <button onClick={() => deleteTodo(todo.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                  <Trash2 size={20} />
                </button>
              </GlassCard>
            ))}
          </div>

          {completedTodos.length > 0 && (
            <div>
              <h3 className="text-section-title" style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Completed</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.6 }}>
                {completedTodos.map(todo => (
                  <GlassCard key={todo.id} style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                      onClick={() => toggleComplete(todo.id)}
                      style={{ 
                        width: '24px', height: '24px', borderRadius: '6px', 
                        background: 'var(--accent-color)', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white'
                      }}
                    >
                      <Check size={16} />
                    </button>
                    <div style={{ flex: 1 }}>
                      <p className="text-body" style={{ textDecoration: 'line-through' }}>{todo.title}</p>
                    </div>
                    <button onClick={() => deleteTodo(todo.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                      <Trash2 size={20} />
                    </button>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
