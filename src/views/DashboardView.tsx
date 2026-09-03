import React, { useState, useEffect } from 'react';
import { useClock } from '../contexts/ClockContext';
import { useTodos } from '../features/todo/hooks/useTodos';
import { ClassCard } from '../components/ClassCard';
import { BreakCard } from '../components/BreakCard';
import { DashboardAtmosphere } from '../features/dashboard/components/DashboardAtmosphere';
import { WeatherCard } from '../features/dashboard/components/WeatherCard';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { Calendar, CheckSquare, Bell, Sun, Moon } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationPanel } from '../components/notifications/NotificationPanel';
export const DashboardView: React.FC<{ onChangeView: (view: string) => void }> = ({ onChangeView }) => {
  const { formattedTime, formattedDate, currentEvent, nextEvent } = useClock();
  const { tasks } = useTodos();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [greeting, setGreeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 20) return 'Good evening';
    return 'Good night';
  });

  useEffect(() => {
    // Optionally keep updating it if the app stays open across boundaries
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setGreeting('Good morning');
      else if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
      else if (hour >= 17 && hour < 20) setGreeting('Good evening');
      else setGreeting('Good night');
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <DashboardAtmosphere>
      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
        <header className="spring-up stagger-1" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="text-large-title">{greeting}, Sreejith</h2>
            <p className="text-metadata" style={{ fontSize: '16px', marginTop: '8px', color: 'var(--text-secondary)' }}>Ready for another productive day?</p>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'baseline', marginTop: '16px' }}>
              <p className="text-timer" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}>{formattedTime}</p>
              <p className="text-body" style={{ fontWeight: 600 }}>{formattedDate}</p>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <button 
              className="glass-button" 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}
            >
              {(() => {
                const hour = new Date().getHours();
                if (hour >= 5 && hour < 17) return <Sun size={24} />;
                return <Moon size={24} />;
              })()}
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '8px', right: '10px', width: '10px', height: '10px', background: 'var(--accent-color)', borderRadius: '50%', border: '2px solid var(--app-bg)' }} />
              )}
            </button>
            {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
          </div>
        </header>

        {/* Classes Section at the Top */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <section className="spring-up stagger-2">
            <h3 className="text-section-title" style={{ marginBottom: '16px' }}>Current Event</h3>
            {currentEvent ? (
              currentEvent.type === 'CLASS' ? (
                <ClassCard event={currentEvent as any} isActive={true} />
              ) : (
                <BreakCard event={currentEvent as any} isActive={true} />
              )
            ) : (
              <SpotlightCard style={{ padding: '32px', textAlign: 'center' }}>
                <p className="text-body text-secondary">No class right now</p>
              </SpotlightCard>
            )}
          </section>

          <section className="spring-up stagger-3">
            <h3 className="text-section-title" style={{ marginBottom: '16px' }}>Up Next</h3>
            {nextEvent ? (
              nextEvent.type === 'CLASS' ? (
                <ClassCard event={nextEvent as any} isActive={false} />
              ) : (
                <BreakCard event={nextEvent as any} isActive={false} />
              )
            ) : (
              <SpotlightCard style={{ padding: '32px', textAlign: 'center' }}>
                <p className="text-body text-secondary">No more events today 🎉</p>
              </SpotlightCard>
            )}
          </section>
        </div>

        {/* Weather & Progress Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Weather Widget */}
          <div className="spring-up stagger-4">
            <WeatherCard />
          </div>

          {/* Quick Access & Progress */}
          <div className="spring-up stagger-5" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <SpotlightCard style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="text-section-title">Task Progress</h3>
                <span className="text-metadata" style={{ fontWeight: 600 }}>{Math.round(progressPercent)}%</span>
              </div>
              <div className="progress-bar-container" style={{ height: '8px', marginBottom: '8px' }}>
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${progressPercent}%`, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} 
                />
              </div>
              <p className="text-metadata text-secondary">{completedTasks} of {tasks.length} tasks completed</p>
            </SpotlightCard>

            <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
              <SpotlightCard style={{ padding: '24px', flex: 1, cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} onClick={() => onChangeView('mess')}>
                <Calendar size={24} color="var(--accent-color)" style={{ marginBottom: '12px' }} />
                <h3 className="text-card-title">Mess Menu</h3>
                <p className="text-metadata text-secondary" style={{ marginTop: '4px' }}>View today's meals</p>
              </SpotlightCard>
              
              <SpotlightCard style={{ padding: '24px', flex: 1, cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} onClick={() => onChangeView('todo')}>
                <CheckSquare size={24} color="var(--success-color)" style={{ marginBottom: '12px' }} />
                <h3 className="text-card-title">Tasks</h3>
                <p className="text-metadata text-secondary" style={{ marginTop: '4px' }}>{tasks.filter(t => !t.completed).length} remaining</p>
              </SpotlightCard>
            </div>
          </div>
        </div>
      </div>
    </DashboardAtmosphere>
  );
};
