import React, { useState } from 'react';
import { useTodos } from './hooks/useTodos';
import { Sidebar } from './components/Sidebar';
import { TaskItem } from './components/TaskItem';
import { DateTimePicker } from './components/DateTimePicker';
import { GlassCard } from '../../components/ui/GlassComponents';
import { Calendar, X, Menu } from 'lucide-react';
import { format } from 'date-fns';

export const TodoView: React.FC = () => {
  const { tasks, lists, addList, addTask, toggleTaskCompletion, toggleTaskFavorite, deleteTask, updateTask } = useTodos();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleQuickAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      let finalDueDate: string | undefined = newDate ? newDate.toISOString() : undefined;
      let finalDueTime: string | undefined = undefined;
      
      if (newDate) {
        // Extract time part from the JS Date to store separately if needed by our data model
        const h = newDate.getHours().toString().padStart(2, '0');
        const m = newDate.getMinutes().toString().padStart(2, '0');
        finalDueTime = `${h}:${m}`;
      }

      let title = newTaskTitle.trim();
      
      if (!finalDueDate && title.toLowerCase().includes('today')) {
        finalDueDate = new Date().toISOString();
        title = title.replace(/today/i, '').trim();
      }
      
      addTask(
        title, 
        'NONE', 
        activeFilter !== 'all' && activeFilter !== 'today' && activeFilter !== 'completed' ? activeFilter : undefined, 
        finalDueDate,
        finalDueTime
      );
      
      setNewTaskTitle('');
      setNewDate(null);
      setShowDatePicker(false);
    }
  };

  const getFilteredTasks = () => {
    let filtered = tasks;
    
    if (activeFilter === 'completed') {
      filtered = filtered.filter(t => t.completed);
    } else {
      filtered = filtered.filter(t => !t.completed);
      
      if (activeFilter === 'all') {
        // No additional list filtering needed
      } else if (activeFilter === 'today') {
        filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString());
      } else if (activeFilter === 'upcoming') {
        filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate) > new Date());
      } else if (activeFilter === 'favorites') {
        filtered = filtered.filter(t => t.favorite);
      } else {
        filtered = filtered.filter(t => t.listId === activeFilter);
      }
    }
    
    return filtered;
  };

  const displayedTasks = getFilteredTasks();

  return (
    <div style={{ display: 'flex', gap: '32px', height: '100%', minHeight: 'calc(100vh - 120px)' }}>
      {/* Mobile Overlay */}
      <div 
        className={`todo-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />

      <div className={`todo-sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar 
          lists={lists} 
          activeFilter={activeFilter} 
          onSelectFilter={(f) => {
            setActiveFilter(f);
            setIsSidebarOpen(false); // Close sidebar on mobile when a filter is selected
          }} 
          onAddList={addList}
        />
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flex: 1 }}>
            <div>
              <h2 className="text-large-title" style={{ textTransform: 'capitalize' }}>
                {activeFilter === 'all' ? 'All Tasks' : 
                 lists.find(l => l.id === activeFilter)?.name || activeFilter}
              </h2>
              <p className="text-metadata" style={{ marginTop: '8px' }}>
                {displayedTasks.length} tasks {activeFilter === 'completed' ? 'completed' : 'remaining'}
              </p>
            </div>
            {activeFilter !== 'completed' && displayedTasks.length > 0 && (
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--accent-color)',
                boxShadow: '0 4px 12px rgba(0, 122, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'float 4s ease-in-out infinite'
              }}>
                <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>✓</span>
              </div>
            )}
          </div>
        </header>

        {activeFilter !== 'completed' && (
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Quick add task (press Enter to save)..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={handleQuickAdd}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--glass-bg-1)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
              />
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                style={{ 
                  padding: '0 20px', 
                  borderRadius: '12px', 
                  border: `1px solid ${showDatePicker || newDate ? 'var(--accent-color)' : 'var(--glass-border)'}`, 
                  background: showDatePicker || newDate ? 'rgba(0,122,255,0.1)' : 'var(--glass-bg-1)', 
                  color: showDatePicker || newDate ? 'var(--accent-color)' : 'var(--text-secondary)', 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Calendar size={20} />
                {newDate && <span style={{ fontWeight: 600, fontSize: '14px' }}>{format(newDate, 'MMM d, h:mm a')}</span>}
              </button>
            </div>

            {showDatePicker && (
              <GlassCard 
                elevated 
                style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  right: 0, 
                  marginTop: '8px', 
                  padding: '16px', 
                  zIndex: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: 'var(--bg-color)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 className="text-metadata" style={{ color: 'var(--text-primary)' }}>Set Date & Time</h4>
                  <button 
                    onClick={() => setShowDatePicker(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <DateTimePicker 
                  initialDate={newDate || undefined} 
                  onSelect={setNewDate} 
                  onClose={() => setShowDatePicker(false)} 
                />
                
                {newDate && (
                  <button 
                    onClick={() => {
                      setNewDate(null);
                      setShowDatePicker(false);
                    }}
                    style={{ 
                      padding: '8px', 
                      borderRadius: '8px', 
                      border: 'none', 
                      background: 'rgba(255,59,48,0.1)', 
                      color: 'var(--danger-color)', 
                      cursor: 'pointer',
                      fontWeight: 600,
                      marginTop: '4px'
                    }}
                  >
                    Clear Date
                  </button>
                )}
              </GlassCard>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
          {displayedTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onToggle={() => toggleTaskCompletion(task.id)}
              onDelete={() => deleteTask(task.id)}
              onToggleFavorite={() => toggleTaskFavorite(task.id)}
            />
          ))}
          
          {displayedTasks.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>
              <p className="text-body text-secondary">
                {activeFilter === 'completed' ? 'No completed tasks yet.' : "You're all caught up!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
