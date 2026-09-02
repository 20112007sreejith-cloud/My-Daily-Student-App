import React, { useState } from 'react';
import { Todo } from '../../../models/types';
import { GlassCard } from '../../../components/ui/GlassComponents';
import { Trash2, Calendar, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ParticleBurst } from '../../../components/environment/ParticleBurst';

interface TaskItemProps {
  task: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onToggleFavorite }) => {
  const [burstPos, setBurstPos] = useState<{ x: number, y: number } | null>(null);

  const handleToggle = (e: React.MouseEvent) => {
    if (!task.completed) {
      setBurstPos({ x: e.clientX, y: e.clientY });
    }
    onToggle();
  };

  return (
    <GlassCard 
      style={{ 
        padding: '12px 16px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        borderLeft: task.priority === 'HIGH' ? '3px solid var(--danger-color)' : 
                    task.priority === 'MEDIUM' ? '3px solid var(--warning-color)' : 'none'
      }}
    >
      {burstPos && (
        <ParticleBurst 
          x={burstPos.x} 
          y={burstPos.y} 
          color="var(--success-color)" 
          onComplete={() => setBurstPos(null)} 
        />
      )}
      <div 
        onClick={handleToggle}
        style={{ 
          width: '20px', 
          height: '20px', 
          borderRadius: '6px', 
          border: task.completed ? 'none' : '2px solid var(--glass-border-strong)', 
          background: task.completed ? 'var(--accent-color)' : 'transparent',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer',
          transition: 'all 0.2s',
          position: 'relative'
        }}
      >
        {task.completed && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'fadeIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }} className="katana-slash-container">
        <p className="text-body" style={{ 
          fontWeight: 500, 
          color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
          transition: 'all 0.4s ease'
        }}>
          {task.title}
          {task.completed && <div className="katana-slash-line" />}
        </p>
        
        {/* Render 3 Sakura petals randomly if recently completed and priority was high */}
        {task.completed && task.priority === 'HIGH' && burstPos && (
          <>
            <div className="sakura-petal" style={{ top: '50%', left: '50%', animation: 'sakuraDrift 1.5s ease-out forwards', filter: 'none', width: '8px', height: '6px' }} />
            <div className="sakura-petal" style={{ top: '30%', left: '40%', animation: 'sakuraDrift 2s ease-out forwards 0.1s', filter: 'none', width: '6px', height: '4px' }} />
            <div className="sakura-petal" style={{ top: '70%', left: '60%', animation: 'sakuraDrift 1.8s ease-out forwards 0.2s', filter: 'none', width: '10px', height: '7px' }} />
          </>
        )}
        
        {(task.dueDate || task.dueTime) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: 'var(--accent-color)' }}>
            <Calendar size={12} />
            <span className="text-metadata" style={{ color: 'var(--accent-color)' }}>
              {task.dueDate && format(new Date(task.dueDate), 'MMM d, yyyy')}
              {task.dueDate && task.dueTime && ' · '}
              {task.dueTime && (() => {
                const [h, m] = task.dueTime.split(':');
                const hour = parseInt(h);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour % 12 || 12;
                return `${hour12}:${m} ${ampm}`;
              })()}
            </span>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '8px', opacity: task.completed ? 1 : 0.4 }} className="task-actions">
        <button 
          onClick={onToggleFavorite} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer', 
            color: task.favorite ? 'var(--warning-color)' : 'var(--text-tertiary)',
            transition: 'all 0.2s',
            opacity: task.favorite ? 1 : undefined
          }}
        >
          <Star size={16} fill={task.favorite ? 'var(--warning-color)' : 'none'} />
        </button>
        <button 
          onClick={onDelete} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer', 
            color: 'var(--text-tertiary)',
            transition: 'all 0.2s'
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </GlassCard>
  );
};
