import React, { useRef, useEffect, useState } from 'react';
import { Home, Calendar, Coffee, CheckSquare, Settings } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onChangeView: (view: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView }) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, left: 0, height: 0, width: 0, opacity: 0 });
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'mess', label: 'Mess', icon: Coffee },
    { id: 'todo', label: 'Todo', icon: CheckSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const sidebarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update active indicator position
    const updateIndicator = () => {
      const activeIndex = navItems.findIndex(i => i.id === currentView);
      if (activeIndex === -1) return;
      
      const isDesktop = window.innerWidth >= 768;
      if (isDesktop && sidebarRef.current) {
        const buttons = sidebarRef.current.querySelectorAll('.nav-sidebar-btn');
        if (buttons[activeIndex]) {
          const btn = buttons[activeIndex] as HTMLElement;
          setIndicatorStyle({
            top: btn.offsetTop,
            left: btn.offsetLeft,
            height: btn.offsetHeight,
            width: btn.offsetWidth,
            opacity: 1
          });
        }
      } else if (!isDesktop && bottomBarRef.current) {
        const buttons = bottomBarRef.current.querySelectorAll('.nav-bottom-btn');
        if (buttons[activeIndex]) {
          const btn = buttons[activeIndex] as HTMLElement;
          const size = btn.offsetHeight;
          setIndicatorStyle({
            top: btn.offsetTop,
            left: btn.offsetLeft + (btn.offsetWidth - size) / 2,
            height: size,
            width: size,
            opacity: 1
          });
        }
      }
    };
    
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [currentView]);

  return (
    <>
      <style>{`
        .nav-sidebar { display: none; }
        .nav-bottom-bar {
          display: flex; position: fixed; bottom: 24px; left: 16px; right: 16px; z-index: 50;
        }
        .nav-bottom-inner {
          display: flex; justify-content: space-around; align-items: center; padding: 8px; width: 100%; position: relative;
        }
        .nav-bottom-btn {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: none; border: none; height: 56px; cursor: pointer; position: relative; z-index: 10;
        }
        .nav-sidebar-btn {
          display: flex; align-items: center; gap: 16px; padding: 12px 16px; border-radius: 16px;
          border: 1px solid transparent; cursor: pointer; background: transparent; z-index: 2;
          transition: color 0.3s ease;
        }
        .nav-active-indicator {
          position: absolute;
          background: var(--glass-bg-3);
          border: 1px solid var(--glass-border);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05), inset 0 0 10px var(--ambient-glow-1);
          border-radius: 16px;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 1;
        }
        @media (max-width: 767px) {
          .nav-active-indicator { border-radius: 50%; background: rgba(0, 122, 255, 0.15); border: none; }
        }
        @media (min-width: 768px) {
          .nav-sidebar {
            display: flex; flex-direction: column; width: 280px; height: 100vh; position: fixed;
            left: 0; top: 0; padding: 24px; z-index: 50; border-right: 1px solid var(--glass-border);
          }
          .nav-bottom-bar { display: none; }
        }
      `}</style>
      
      {/* Desktop Sidebar */}
      <div className="nav-sidebar washi-glass" ref={sidebarRef}>
        <div style={{ marginBottom: '40px', marginTop: '16px', padding: '0 16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 100 100" style={{ transform: 'rotate(-45deg)' }}>
              {/* Handle */}
              <rect x="46" y="70" width="8" height="25" rx="2" fill="var(--text-secondary)" />
              <line x1="46" y1="75" x2="54" y2="75" stroke="var(--bg-color)" strokeWidth="1" />
              <line x1="46" y1="80" x2="54" y2="80" stroke="var(--bg-color)" strokeWidth="1" />
              <line x1="46" y1="85" x2="54" y2="85" stroke="var(--bg-color)" strokeWidth="1" />
              
              {/* Tsuba (Guard) */}
              <rect x="42" y="66" width="16" height="4" rx="1" fill="var(--text-primary)" />
              
              {/* Blade */}
              <path d="M 48 66 L 48 15 Q 50 5 50 5 Q 50 5 52 15 L 52 66 Z" fill="var(--katana-silver)" />
              {/* Blade edge highlight */}
              <path d="M 50 15 Q 50 5 50 5 Q 50 5 52 15 L 52 66 L 50 66 Z" fill="#ffffff" opacity="0.6" />
            </svg>
            <h1 className="text-section-title" style={{ fontWeight: 800, letterSpacing: '4px', textTransform: 'uppercase' }}>KATANA</h1>
          </div>
          <p className="text-metadata" style={{ letterSpacing: '1px' }}>VIT-AP Companion</p>
        </div>
        
        {/* Subtle brush stroke divider */}
        <div style={{ width: '100%', height: '1px', background: 'var(--glass-border)', marginBottom: '24px', opacity: 0.5, maskImage: 'linear-gradient(to right, transparent, black, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black, transparent)' }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
          <div className="nav-active-indicator" style={indicatorStyle} />
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className="nav-sidebar-btn"
                style={{
                  color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  animation: `fadeIn 0.5s ease backwards ${index * 0.1}s`
                }}
              >
                <Icon size={20} />
                <span style={{ letterSpacing: '0.5px' }}>{item.label}</span>
              </button>
            );
          })}
        </div>
        
        <div style={{ flex: 1 }} />
        {/* Bottom subtle katana mark */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', opacity: 0.3, paddingBottom: '16px' }}>
          <div style={{ width: '40px', height: '2px', background: 'var(--text-secondary)', transform: 'rotate(-45deg)' }} />
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="nav-bottom-bar">
        <div className="glass-panel-elevated nav-bottom-inner" style={{ borderRadius: '32px' }} ref={bottomBarRef}>
          <div className="nav-active-indicator" style={indicatorStyle} />
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className="nav-bottom-btn"
                style={{
                  color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                }}
              >
                <Icon size={24} />
                {isActive && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor', position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)' }} />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
