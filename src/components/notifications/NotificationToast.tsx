import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { X, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export const NotificationToastManager: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Show the most recent unread notification that hasn't been shown yet
  useEffect(() => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length > 0 && !activeToast) {
      // Just show the newest one for now
      setActiveToast(unread[0].id);
      
      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notifications, activeToast]);

  if (!activeToast) return null;

  const notification = notifications.find(n => n.id === activeToast);
  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'SUCCESS': return <CheckCircle size={20} color="var(--success-color, #34C759)" />;
      case 'WARNING': return <AlertTriangle size={20} color="var(--warning-color, #FF9500)" />;
      case 'ERROR': return <XCircle size={20} color="var(--danger-color)" />;
      default: return <Info size={20} color="var(--accent-color)" />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      animation: 'spring-down 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      maxWidth: '90vw',
      width: '400px'
    }}>
      <div className="glass-panel-elevated" style={{
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        borderRadius: '16px',
        border: '1px solid var(--glass-border)',
        background: 'var(--bg-color)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        <div style={{ marginTop: '2px' }}>
          {getIcon()}
        </div>
        <div style={{ flex: 1 }}>
          <h4 className="text-body" style={{ fontWeight: 600, marginBottom: '4px' }}>{notification.title}</h4>
          <p className="text-metadata">{notification.message}</p>
        </div>
        <button 
          onClick={() => {
            setActiveToast(null);
            removeNotification(notification.id);
          }}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
