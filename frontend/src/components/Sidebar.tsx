import React from 'react';
import { 
  LayoutDashboard, 
  TableProperties, 
  BarChart3, 
  FileSpreadsheet, 
  TrendingUp, 
  Compass, 
  Droplet,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPondCode?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, selectedPondCode }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cycles', label: 'Ciclos Productivos', icon: TableProperties },
    { id: 'summary', label: 'Resumen Sectores', icon: BarChart3 },
    { id: 'harvests', label: 'Cosechas & QC', icon: Droplet },
    { id: 'crud', label: 'Formularios CRUD', icon: Settings },
    { id: 'import', label: 'Cargar Datos', icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-64 bg-cofimar-surface border-r border-cofimar-border/60 flex flex-col justify-between h-screen sticky top-0">
      <div className="flex flex-col">
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-cofimar-border/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-cofimar-primary rounded-lg flex items-center justify-center shadow-lg shadow-cofimar-primary/20">
              <Compass className="w-5 h-5 text-cofimar-bg font-bold animate-pulse" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-wider bg-gradient-to-r from-white to-cofimar-text bg-clip-text text-transparent">
                COFIMAR
              </span>
              <p className="text-[10px] text-cofimar-primary font-mono tracking-widest uppercase">
                Indicadores 2026
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cofimar-primary/15 to-cofimar-primary/5 text-cofimar-primary border-l-2 border-cofimar-primary'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-cofimar-primary' : 'text-slate-400 group-hover:text-white'
                }`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {selectedPondCode && (
            <button
              onClick={() => setActiveTab('pondDetail')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                activeTab === 'pondDetail'
                  ? 'bg-gradient-to-r from-cofimar-accent/15 to-cofimar-accent/5 text-cofimar-accent border-l-2 border-cofimar-accent'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <TrendingUp className={`w-4 h-4 ${
                activeTab === 'pondDetail' ? 'text-cofimar-accent' : 'text-slate-400'
              }`} />
              <span className="truncate">Piscina: {selectedPondCode}</span>
            </button>
          )}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-6 border-t border-cofimar-border/60">
        <div className="flex items-center space-x-3 bg-cofimar-bg/50 p-3 rounded-xl border border-cofimar-border/30">
          <div className="w-2.5 h-2.5 bg-cofimar-success rounded-full animate-ping" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">Cofimar Server</p>
            <p className="text-[10px] text-slate-500 font-mono">v1.0.0-PROD</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
