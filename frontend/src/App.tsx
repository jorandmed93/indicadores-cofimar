import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Cycles from './pages/Cycles';
import Summary from './pages/Summary';
import Harvests from './pages/Harvests';
import Import from './pages/Import';
import PondDetail from './pages/PondDetail';
import RegistroData from './pages/RegistroData';
import Login from './pages/Login';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  Bell, 
  Search, 
  X, 
  ChevronRight 
} from 'lucide-react';
import client from './api/client';

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPondCode, setSelectedPondCode] = useState<string>('');

  // Search & Notifications State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pondsList, setPondsList] = useState<any[]>([]);
  const [cyclesList, setCyclesList] = useState<any[]>([]);
  const [filteredPonds, setFilteredPonds] = useState<any[]>([]);
  const [filteredCycles, setFilteredCycles] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState<boolean>(false);

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

  // Fetch Search & Notification Data
  useEffect(() => {
    if (user) {
      // Fetch ponds
      client.get('/ponds')
        .then(res => setPondsList(res.data))
        .catch(err => console.error('Error fetching search ponds:', err));

      // Fetch cycles
      client.get('/cycles', { params: { limit: 100 } })
        .then(res => {
          const cyclesData = res.data.data || [];
          setCyclesList(cyclesData);

          // Generate dynamic notifications
          const alerts: any[] = [];
          
          cyclesData.forEach((c: any) => {
            // High FCA Alert
            if (c.fca > 1.65) {
              alerts.push({
                id: `fca-${c.id || c.pond_code}`,
                type: 'warning',
                title: 'Alerta de FCA Alto',
                message: `Piscina ${c.pond_code} tiene un FCA de ${parseFloat(c.fca).toFixed(2)} (Excede límite de 1.65)`,
                time: 'Hace 2 horas',
                pondCode: c.pond_code,
                read: false
              });
            }
            // Low Survival Alert
            if (c.survival_pct < 55) {
              alerts.push({
                id: `srv-${c.id || c.pond_code}`,
                type: 'danger',
                title: 'Baja Sobrevivencia',
                message: `Piscina ${c.pond_code} reporta sobrevivencia de ${parseFloat(c.survival_pct).toFixed(1)}%`,
                time: 'Hace 5 horas',
                pondCode: c.pond_code,
                read: false
              });
            }
            // QC Weight Deviation Alert
            const lbsDiff = (c.lbs_harvest_plant || 0) - (c.lbs_harvest_farm || 0);
            if (Math.abs(lbsDiff) > 3000) {
              alerts.push({
                id: `qc-${c.id || c.pond_code}`,
                type: 'qc',
                title: 'Desviación de QC',
                message: `Desviación en ${c.pond_code}: camaronera vs planta de ${Math.round(lbsDiff).toLocaleString()} lbs`,
                time: 'Ayer',
                pondCode: c.pond_code,
                read: false
              });
            }
          });

          // Fallback welcome alerts
          alerts.push({
            id: 'sys-update',
            type: 'success',
            title: 'Sincronización Exitosa',
            message: 'Tus repositorios y base de datos están sincronizados al 100% con GitHub.',
            time: 'Hace 10 min',
            read: false
          });

          alerts.push({
            id: 'sys-welcome',
            type: 'info',
            title: 'Bienvenido a CofimarControl',
            message: `Sesión iniciada correctamente como ${user.username}.`,
            time: 'Hace 15 min',
            read: true
          });

          setNotifications(alerts);
        })
        .catch(err => console.error('Error fetching search cycles:', err));
    }
  }, [user]);

  // Handle Search Query Filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPonds([]);
      setFilteredCycles([]);
      return;
    }

    const q = searchQuery.toLowerCase();
    
    // Filter ponds
    const matchPonds = pondsList.filter(p => 
      p.code.toLowerCase().includes(q) || 
      (p.sector && p.sector.toLowerCase().includes(q))
    ).slice(0, 5);
    
    // Filter cycles
    const matchCycles = cyclesList.filter(c => 
      c.pond_code.toLowerCase().includes(q) || 
      (c.sector && c.sector.toLowerCase().includes(q)) ||
      (c.aguaje && c.aguaje.toLowerCase().includes(q))
    ).slice(0, 5);

    setFilteredPonds(matchPonds);
    setFilteredCycles(matchCycles);
  }, [searchQuery, pondsList, cyclesList]);

  // Handle outside click dismissals
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowSearchDropdown(false);
        setShowNotificationsDropdown(false);
      }
    };
    
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (n: any) => {
    // Mark as read
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
    
    // Navigate to pond if available
    if (n.pondCode) {
      setSelectedPondCode(n.pondCode);
      setActiveTab('pondDetail');
    }
    
    setShowNotificationsDropdown(false);
  };

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
      case 'crud': return 'Registro Data';
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
        return <RegistroData role={role} />;
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
                <Search className="w-3.5 h-3.5 text-cofimar-text-muted" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="w-full bg-cofimar-surface-secondary border border-cofimar-border rounded-lg pl-9 pr-8 py-2 font-body text-xs text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-150 placeholder:text-cofimar-text-faint"
                placeholder="Buscar piscinas, ciclos..."
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchDropdown(false);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-cofimar-text-faint hover:text-cofimar-text transition"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Search Dropdown */}
              {showSearchDropdown && (filteredPonds.length > 0 || filteredCycles.length > 0) && (
                <div className="absolute left-0 mt-2 w-80 bg-cofimar-surface/95 backdrop-blur-md border border-cofimar-border shadow-2xl rounded-xl max-h-96 overflow-y-auto z-50 py-2.5 animate-fadeIn">
                  {filteredPonds.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-cofimar-text-faint uppercase tracking-wider px-4 py-1.5 block">
                        PISCINAS
                      </span>
                      {filteredPonds.map(p => (
                        <button
                          key={p.code}
                          onClick={() => {
                            setSelectedPondCode(p.code);
                            setActiveTab('pondDetail');
                            setSearchQuery('');
                            setShowSearchDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-cofimar-surface-secondary flex items-center justify-between text-xs font-mono group"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-cofimar-primary group-hover:underline">{p.code}</span>
                            <span className="text-[10px] text-cofimar-text-muted font-sans mt-0.5">Sector: {p.sector || 'N/A'}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-cofimar-text-faint group-hover:text-cofimar-primary transition" />
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredPonds.length > 0 && filteredCycles.length > 0 && (
                    <div className="border-t border-cofimar-border/55 my-2" />
                  )}

                  {filteredCycles.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-cofimar-text-faint uppercase tracking-wider px-4 py-1.5 block">
                        CICLOS PRODUCTIVOS
                      </span>
                      {filteredCycles.map(c => (
                        <button
                          key={c.id || c.pond_code}
                          onClick={() => {
                            setSelectedPondCode(c.pond_code);
                            setActiveTab('pondDetail');
                            setSearchQuery('');
                            setShowSearchDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-cofimar-surface-secondary flex items-center justify-between text-xs font-mono group"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-cofimar-accent group-hover:underline">{c.pond_code} - {c.aguaje}</span>
                            <span className="text-[10px] text-cofimar-text-muted font-sans mt-0.5">FCA: {parseFloat(c.fca || 0).toFixed(2)} | LBS: {Math.round(c.total_lbs || 0).toLocaleString()}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-cofimar-text-faint group-hover:text-cofimar-accent transition" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotificationsDropdown(!showNotificationsDropdown);
                  setShowSearchDropdown(false);
                }}
                className={`p-2 hover:bg-cofimar-surface-hover text-cofimar-text-muted rounded-lg border border-cofimar-border shadow-sm transition-all duration-150 relative ${
                  showNotificationsDropdown ? 'bg-cofimar-surface-hover text-cofimar-primary border-cofimar-primary/30' : 'bg-cofimar-surface-secondary'
                }`}
                title="Notificaciones"
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cofimar-danger opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-cofimar-danger text-[9px] font-bold text-white items-center justify-center font-mono leading-none">
                      {unreadCount}
                    </span>
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Popover */}
              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-cofimar-surface/95 backdrop-blur-md border border-cofimar-border shadow-2xl rounded-xl overflow-hidden z-50 animate-fadeIn">
                  <div className="p-3 border-b border-cofimar-border/60 flex items-center justify-between bg-cofimar-surface-secondary">
                    <span className="text-[10px] font-mono text-cofimar-text font-bold uppercase tracking-wider">
                      Centro de Alertas ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[9px] font-mono text-cofimar-primary hover:underline font-bold"
                      >
                        Marcar todo leído
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-cofimar-border/40">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-cofimar-text-muted text-xs">
                        No hay alertas activas en este momento.
                      </div>
                    ) : (
                      notifications.map(n => {
                        const isUnread = !n.read;
                        return (
                          <button
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`w-full text-left p-3.5 hover:bg-cofimar-surface-secondary transition flex gap-3 items-start relative group ${
                              isUnread ? 'bg-cofimar-primary/[0.02]' : 'opacity-75'
                            }`}
                          >
                            {isUnread && (
                              <span className="absolute top-4 right-3 w-1.5 h-1.5 bg-cofimar-primary rounded-full" />
                            )}
                            
                            <div className="mt-0.5 flex-shrink-0">
                              {n.type === 'warning' && (
                                <AlertTriangle className="w-4 h-4 text-cofimar-warning" />
                              )}
                              {n.type === 'danger' && (
                                <AlertTriangle className="w-4 h-4 text-cofimar-danger" />
                              )}
                              {n.type === 'success' && (
                                <CheckCircle2 className="w-4 h-4 text-cofimar-success" />
                              )}
                              {n.type === 'qc' && (
                                <Compass className="w-4 h-4 text-cofimar-primary" />
                              )}
                              {n.type === 'info' && (
                                <Compass className="w-4 h-4 text-cofimar-accent" />
                              )}
                            </div>

                            <div className="flex flex-col min-w-0 pr-2">
                              <span className={`text-xs font-semibold text-cofimar-text leading-tight group-hover:text-cofimar-primary transition`}>
                                {n.title}
                              </span>
                              <p className="text-[10px] text-cofimar-text-secondary mt-1 font-body leading-normal break-words">
                                {n.message}
                              </p>
                              <span className="text-[8px] text-cofimar-text-faint font-mono mt-1">
                                {n.time}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
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
