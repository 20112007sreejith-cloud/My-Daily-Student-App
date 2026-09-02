import React from 'react';
import { TodoList } from '../../../models/types';
import { Inbox, Calendar, Star, CheckCircle, List as ListIcon, Plus } from 'lucide-react';

interface SidebarProps {
  lists: TodoList[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  onAddList: (name: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ lists, activeFilter, onSelectFilter, onAddList }) => {
  const defaultFilters = [
    { id: 'all', label: 'All Tasks', icon: Inbox },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'upcoming', label: 'Upcoming', icon: Calendar },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'completed', label: 'Completed', icon: CheckCircle },
  ];

  const getFilterStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    borderRadius: '16px',
    cursor: 'pointer',
    background: isActive ? 'var(--glass-bg-3)' : 'transparent',
    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
    fontWeight: isActive ? 600 : 500,
    transition: 'all 0.2s'
  });

  return (
    <aside className="todo-sidebar">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '32px' }}>
        {defaultFilters.map(filter => (
          <div 
            key={filter.id}
            style={getFilterStyle(activeFilter === filter.id)}
            onClick={() => onSelectFilter(filter.id)}
          >
            <filter.icon size={18} />
            {filter.label}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: '8px' }}>
        <h4 className="text-metadata">MY LISTS</h4>
        <button 
          onClick={() => {
            const name = prompt('Enter list name:');
            if (name?.trim()) {
              onAddList(name.trim());
            }
          }}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <Plus size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {lists.length === 0 ? (
          <p className="text-metadata" style={{ padding: '0 16px' }}>No custom lists yet.</p>
        ) : (
          lists.map(list => (
            <div 
              key={list.id}
              style={getFilterStyle(activeFilter === list.id)}
              onClick={() => onSelectFilter(list.id)}
            >
              <ListIcon size={18} />
              {list.name}
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
