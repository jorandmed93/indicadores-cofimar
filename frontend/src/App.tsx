import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Cycles from './pages/Cycles';
import Summary from './pages/Summary';
import Harvests from './pages/Harvests';
import Import from './pages/Import';
import PondDetail from './pages/PondDetail';
import Crud from './pages/Crud';
import Login from './pages/Login';

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPondCode, setSelectedPondCode] = useState<string>('');

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('cofimar-theme') as 'light' | 'dark') || 'dark';
  });

  const [user, setUser] = useState<{ username: string; role: 'admin' | 'viewer' } | null>(() => {
    const stored = localStorage.getItem('cofimar-user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Apply theme class to <html>
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('cofimar-theme', theme);
  }, [theme]);

  const role = user?.role || 'viewer';

  const handleLogin = (username: string, userRole: 'admin' | 'viewer') => {
    const newUser = { username, role: userRole };
    setUser(newUser);
    localStorage.setItem('cofimar-user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cofimar-user');
    setActiveTab('dashboard');
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'cycles': return 'Ciclos Productivos';
      case 'summary': return 'Resumen Sectores';
      case 'harvests': return 'Cosechas & QC';
      case 'crud': return 'Formularios CRUD';
      case 'import': return 'Cargar Datos';
      case 'pondDetail': return `Piscina: ${selectedPondCode}`;
      default: return 'CofimarControl';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            setActiveTab={setActiveTab} 
            setSelectedPondCode={setSelectedPondCode} 
          />
        );
      case 'cycles':
        return (
          <Cycles 
            setSelectedPondCode={setSelectedPondCode} 
            setActiveTab={setActiveTab} 
          />
        );
      case 'summary':
        return <Summary />;
      case 'harvests':
        return <Harvests />;
      case 'import':
        return <Import role={role} />;
      case 'crud':
        return <Crud role={role} />;
      case 'pondDetail':
        return <PondDetail pondCode={selectedPondCode} />;
      default:
        return (
          <Dashboard 
            setActiveTab={setActiveTab} 
            setSelectedPondCode={setSelectedPondCode} 
          />
        );
    }
  };

  if (!user) {
    return (
      <Login 
        onLogin={handleLogin} 
        theme={theme} 
        setTheme={setTheme} 
      />
    );
  }

  return (
    <div className="flex bg-cofimar-bg text-cofimar-text min-h-screen transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        selectedPondCode={selectedPondCode || undefined}
        theme={theme}
        setTheme={setTheme}
        role={role}
        username={user.username}
        onLogout={handleLogout}
      />

      {/* Main Content Area with Header */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-20 bg-cofimar-surface border-b border-cofimar-border flex items-center justify-between px-8 flex-shrink-0 z-20 transition-colors duration-300">
          <div className="flex items-center">
            <h2 className="text-xl font-display font-bold text-cofimar-text">
              {getTabTitle()}
            </h2>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Search Box */}
            <div className="relative w-64 hidden sm:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cofimar-text-faint pointer-events-none">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </span>
              <input
                type="text"
                className="w-full bg-cofimar-surface-secondary border border-cofimar-border rounded-lg pl-9 pr-4 py-2 font-body text-xs text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-150 placeholder:text-cofimar-text-faint"
                placeholder="Buscar piscinas, ciclos..."
              />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-text-muted rounded-lg border border-cofimar-border shadow-sm transition-all duration-150"
              title="Cambiar tema visual"
            >
              {theme === 'dark' ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"></path></svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              )}
            </button>

            {/* Notification Bell */}
            <button
              className="p-2 bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-text-muted rounded-lg border border-cofimar-border shadow-sm transition-all duration-150 relative"
              title="Notificaciones"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-cofimar-danger rounded-full" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 bg-cofimar-bg overflow-y-auto transition-colors duration-300">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
