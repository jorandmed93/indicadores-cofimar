import React from 'react';
import { 
  LayoutDashboard, 
  TableProperties, 
  BarChart3, 
  FileSpreadsheet, 
  TrendingUp, 
  Compass, 
  Droplet,
  Settings,
  LogOut,
  Key
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPondCode?: string;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  role: 'admin' | 'viewer';
  username: string;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  selectedPondCode,
  theme,
  setTheme,
  role,
  username,
  onLogout
}) => {
  
  const categories = [
    {
      title: 'PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'cycles', label: 'Ciclos Productivos', icon: TableProperties },
      ]
    },
    {
      title: 'OPERACIONES',
      items: [
        { id: 'summary', label: 'Resumen Sectores', icon: BarChart3 },
        { id: 'harvests', label: 'Cosechas & QC', icon: Droplet },
      ]
    },
    {
      title: 'ADMINISTRACIÓN',
      items: [
        { id: 'crud', label: 'Registro Data', icon: Settings },
        { id: 'import', label: 'Cargar Datos', icon: FileSpreadsheet },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-cofimar-surface border-r border-cofimar-border flex flex-col justify-between h-screen sticky top-0 transition-colors duration-300 z-30">
      <div className="flex flex-col overflow-y-auto flex-1">
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-cofimar-border flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-cofimar-primary rounded-lg flex items-center justify-center shadow-sm">
              <Compass className="w-5 h-5 text-white font-bold" />
            </div>
            <div>
              <span className="font-display font-bold text-base tracking-tight text-cofimar-text block">
                CofimarControl
              </span>
              <p className="text-[9px] text-cofimar-text-faint font-mono tracking-widest uppercase mt-0.5">
                Indicadores 2026
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-6 flex-1">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-1.5">
              <span className="text-[9px] font-bold text-cofimar-text-faint uppercase tracking-widest px-3 block">
                {cat.title}
              </span>
              <div className="space-y-0.5">
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-150 group ${
                        isActive
                          ? 'bg-cofimar-surface-active text-cofimar-surface-active-text shadow-sm font-semibold'
                          : 'text-cofimar-text-secondary hover:text-cofimar-text hover:bg-cofimar-surface-secondary'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${
                        isActive ? 'text-cofimar-surface-active-text' : 'text-cofimar-text-muted group-hover:text-cofimar-text-secondary'
                      }`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {selectedPondCode && (
            <div className="space-y-1.5 pt-2 border-t border-cofimar-border">
              <span className="text-[9px] font-bold text-cofimar-text-faint uppercase tracking-widest px-3 block">
                DETALLES
              </span>
              <button
                onClick={() => setActiveTab('pondDetail')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-150 group ${
                  activeTab === 'pondDetail'
                    ? 'bg-cofimar-surface-active text-cofimar-surface-active-text shadow-sm font-semibold'
                    : 'text-cofimar-text-secondary hover:text-cofimar-text hover:bg-cofimar-surface-secondary'
                }`}
              >
                <TrendingUp className={`w-4 h-4 ${activeTab === 'pondDetail' ? 'text-cofimar-surface-active-text' : 'text-cofimar-text-muted'}`} />
                <span className="truncate">Piscina: {selectedPondCode}</span>
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* User Session */}
      <div className="p-4 border-t border-cofimar-border bg-cofimar-panel-bg space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 bg-cofimar-surface-active text-cofimar-surface-active-text rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-cofimar-text truncate capitalize leading-none mb-1">
                {username}
              </span>
              <span className="text-[9px] text-cofimar-text-muted font-mono tracking-wider truncate leading-none">
                {role === 'admin' ? 'Administrador' : 'Lector'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <button 
              className="p-1.5 hover:bg-cofimar-surface-secondary text-cofimar-text-faint hover:text-cofimar-text-secondary rounded-md transition"
              title="Configurar Perfil"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-cofimar-text-faint hover:text-red-500 rounded-md transition"
              title="Cerrar Sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
