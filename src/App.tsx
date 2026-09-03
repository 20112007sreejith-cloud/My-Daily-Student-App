import React, { useState, useCallback, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { ClockProvider } from './contexts/ClockContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { DashboardView } from './views/DashboardView';
import { TimetableView } from './views/TimetableView';
import { MessMenuView } from './views/MessMenuView';
import { TodoView } from './features/todo/TodoView';
import { SettingsView } from './views/SettingsView';
import { AmbientEnvironment } from './components/environment/AmbientEnvironment';

import { NotificationToastManager } from './components/notifications/NotificationToast';
import { useNotificationEngine } from './components/notifications/useNotificationEngine';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');

  // Initialize the smart notification engine
  useNotificationEngine();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView onChangeView={setCurrentView} />;
      case 'timetable': return <TimetableView />;
      case 'mess': return <MessMenuView />;
      case 'todo': return <TodoView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView onChangeView={setCurrentView} />;
    }
  };

  useEffect(() => {
    // Remove the static HTML splash screen once React has rendered
    const splash = document.getElementById('native-splash');
    if (splash) {
      // Add a small delay for a smooth transition, then fade it out
      setTimeout(() => {
        splash.style.transition = 'opacity 0.5s ease';
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 500);
      }, 100);
    }
  }, []);

  return (
    <AmbientEnvironment showCelestial={currentView === 'dashboard'}>
      <div className="app-container" style={{ opacity: 1, transition: 'opacity 0.6s ease-in-out' }}>
        <Navigation currentView={currentView} onChangeView={setCurrentView} />
        <main className="main-content fade-in">
          {renderView()}
        </main>
      </div>
    </AmbientEnvironment>
  );
}

function App() {
  return (
    <NotificationProvider>
      <ClockProvider>
        <AppContent />
      </ClockProvider>
      <NotificationToastManager />
    </NotificationProvider>
  );
}

export default App;
