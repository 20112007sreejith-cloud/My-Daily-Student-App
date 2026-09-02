import React, { useState, useEffect } from 'react';
import { GlassCard, GlassButton } from '../components/ui/GlassComponents';
import { storageService } from '../services/storageService';
import { UserSettings } from '../models/types';
import { Moon, Sun, Monitor, Bell, MonitorPlay, AlertTriangle, Settings as SettingsIcon } from 'lucide-react';
import { geminiService } from '../services/geminiService';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(storageService.getSettings());
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    storageService.saveSettings(settings);
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.style.setProperty('color-scheme', 'dark');
    } else if (settings.theme === 'light') {
      document.documentElement.style.setProperty('color-scheme', 'light');
    } else {
      document.documentElement.style.removeProperty('color-scheme');
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [settings]);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear ALL data (Timetable, Mess Menu, Todos, Settings)? This cannot be undone.")) {
      storageService.clearAllData();
      window.location.reload();
    }
  };

  const handleTestConnection = async () => {
    if (!settings.geminiApiKey) return;
    setConnectionStatus('testing');
    const success = await geminiService.testConnection(settings.geminiApiKey);
    setConnectionStatus(success ? 'success' : 'error');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '24px 0' }}>
        <h2 className="text-large-title" style={{ position: 'relative', zIndex: 1 }}>Settings</h2>
        
        {/* Subtle Zen Circle */}
        <div style={{
          position: 'absolute', top: '-10px', left: '-20px', width: '120px', height: '120px',
          opacity: 0.05, zIndex: 0, pointerEvents: 'none',
          animation: 'fadeIn 2s ease-out'
        }}>
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" color="var(--text-primary)">
            <path d="M 50 10 A 40 40 0 1 1 45 10" strokeLinecap="round" />
          </svg>
        </div>

        <div style={{
          width: '48px', height: '48px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'spin 20s linear infinite',
          color: 'var(--text-tertiary)',
          position: 'relative', zIndex: 1
        }}>
          <SettingsIcon size={24} />
        </div>
      </header>

      <section style={{ marginBottom: '32px' }}>
        <h3 className="text-section-title" style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Appearance</h3>
        <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="text-body" style={{ fontWeight: 600 }}>Theme</p>
              <p className="text-metadata">Choose your interface style.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', background: 'var(--glass-bg-2)', padding: '4px', borderRadius: '12px', position: 'relative' }}>
              <button 
                onClick={() => updateSetting('theme', 'light')}
                style={{ 
                  padding: '8px', borderRadius: '8px', border: 'none', 
                  background: settings.theme === 'light' ? 'var(--glass-bg-3)' : 'transparent', 
                  color: settings.theme === 'light' ? '#FFB300' : 'var(--text-primary)', 
                  cursor: 'pointer',
                  transform: settings.theme === 'light' ? 'scale(1.1) rotate(15deg)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                <Sun size={20} />
              </button>
              <button 
                onClick={() => updateSetting('theme', 'dark')}
                style={{ 
                  padding: '8px', borderRadius: '8px', border: 'none', 
                  background: settings.theme === 'dark' ? 'var(--glass-bg-3)' : 'transparent', 
                  color: settings.theme === 'dark' ? '#90CAF9' : 'var(--text-primary)', 
                  cursor: 'pointer',
                  transform: settings.theme === 'dark' ? 'scale(1.1) rotate(-15deg)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                <Moon size={20} />
              </button>
              <button 
                onClick={() => updateSetting('theme', 'system')}
                style={{ 
                  padding: '8px', borderRadius: '8px', border: 'none', 
                  background: settings.theme === 'system' ? 'var(--glass-bg-3)' : 'transparent', 
                  color: settings.theme === 'system' ? 'var(--accent-color)' : 'var(--text-primary)', 
                  cursor: 'pointer',
                  transform: settings.theme === 'system' ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                <Monitor size={20} />
              </button>
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--glass-border)', margin: '8px 0' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <MonitorPlay size={20} color="var(--accent-color)" />
              <div>
                <p className="text-body" style={{ fontWeight: 600 }}>Reduced Motion</p>
                <p className="text-metadata">Disable UI animations.</p>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={settings.reducedMotion}
              onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </div>

        </GlassCard>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h3 className="text-section-title" style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>AI Capabilities</h3>
        <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="text-body" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Gemini API Key
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                style={{ fontSize: '12px', color: 'var(--break-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Get your free key <span>↗</span>
              </a>
            </label>
            <p className="text-metadata" style={{ marginTop: '-4px', marginBottom: '4px' }}>Used for vision parsing. Your key is stored locally.</p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={settings.geminiApiKey || ''}
                onChange={(e) => {
                  updateSetting('geminiApiKey', e.target.value);
                  setConnectionStatus('idle');
                }}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg-2)', color: 'var(--text-primary)' }}
              />
              <GlassButton 
                onClick={handleTestConnection} 
                disabled={!settings.geminiApiKey || connectionStatus === 'testing'}
                style={{ padding: '8px 16px' }}
              >
                {connectionStatus === 'testing' ? 'Testing...' : 'Verify'}
              </GlassButton>
            </div>
            
            {connectionStatus === 'success' && (
              <p style={{ color: 'var(--accent-color)', fontSize: '0.875rem' }}>✅ Connected successfully! Your API key is valid.</p>
            )}
            {connectionStatus === 'error' && (
              <p style={{ color: 'var(--danger-color)', fontSize: '0.875rem' }}>❌ Connection failed. Please check your API key.</p>
            )}
          </div>
        </GlassCard>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h3 className="text-section-title" style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Preferences</h3>
        <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Bell size={20} color="var(--accent-color)" />
              <div>
                <p className="text-body" style={{ fontWeight: 600 }}>Notifications</p>
                <p className="text-metadata">Enable class and task reminders.</p>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={settings.notificationsEnabled}
              onChange={(e) => updateSetting('notificationsEnabled', e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </div>
          
          <div style={{ height: '1px', background: 'var(--glass-border)', margin: '8px 0' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="text-body" style={{ fontWeight: 600 }}>24-Hour Time Format</p>
              <p className="text-metadata">Use 24-hour format instead of AM/PM.</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.format24h}
              onChange={(e) => updateSetting('format24h', e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </div>

        </GlassCard>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h3 className="text-section-title" style={{ marginBottom: '16px', color: 'var(--danger-color)' }}>Danger Zone</h3>
        <GlassCard style={{ padding: '24px', border: '1px solid rgba(255,59,48,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <AlertTriangle size={20} color="var(--danger-color)" />
              <div>
                <p className="text-body" style={{ fontWeight: 600, color: 'var(--danger-color)' }}>Reset Application</p>
                <p className="text-metadata">Clear all saved timetable, mess, and todo data.</p>
              </div>
            </div>
            <GlassButton variant="danger" onClick={handleClearData}>
              Clear Data
            </GlassButton>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};
