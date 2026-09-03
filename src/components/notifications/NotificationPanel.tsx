import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Bell, Check, Trash2, Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

interface NotificationPanelProps {
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle size={16} color="var(--success-color, #34C759)" />;
      case 'WARNING': return <AlertTriangle size={16} color="var(--warning-color, #FF9500)" />;
      case 'ERROR': return <XCircle size={16} color="var(--danger-color)" />;
      default: return <Info size={16} color="var(--accent-color)" />;
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // in minutes
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
      <div className="glass-panel notification-panel" style={{
      position: 'absolute',
      right: '0',
      top: '100%',
      marginTop: '12px',
      width: '350px',
      maxHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      borderRadius: '20px',
      border: '1px solid var(--glass-border)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      background: 'var(--bg-color)',
      overflow: 'hidden',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={20} color="var(--text-primary)" />
          <h3 className="text-body" style={{ fontWeight: 600, margin: 0 }}>Notifications</h3>
          {unreadCount > 0 && (
            <span style={{ background: 'var(--accent-color)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
              {unreadCount}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} title="Mark all as read" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
              <Check size={18} />
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} title="Clear all" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
              <Trash2 size={18} />
            </button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>
      </div>
      
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Bell size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
            <p style={{ margin: 0 }}>You're all caught up!</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              onClick={() => { if (!n.read) markAsRead(n.id); }}
              style={{
                padding: '12px 16px',
                display: 'flex',
                gap: '12px',
                background: n.read ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
                cursor: n.read ? 'default' : 'pointer',
                transition: 'background 0.2s',
                borderLeft: n.read ? '2px solid transparent' : '2px solid var(--accent-color)'
              }}
            >
              <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: n.read ? 500 : 600, color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                  {n.title}
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {n.message}
                </p>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.7, marginTop: '4px', display: 'block' }}>
                  {formatTime(n.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
