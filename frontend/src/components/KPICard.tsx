import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  type: 'lbs_ha' | 'fca' | 'survival' | 'cycles' | 'neutral';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, type, trend }) => {
  // Determine color coding based on KPI type and value
  const getKpiStatus = () => {
    if (type === 'lbs_ha') {
      const v = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
      if (v >= 7000) return { border: 'border-l-4 border-l-cofimar-success', text: 'text-cofimar-success', bg: 'bg-cofimar-success/5' };
      if (v >= 4000) return { border: 'border-l-4 border-l-cofimar-warning', text: 'text-cofimar-warning', bg: 'bg-cofimar-warning/5' };
      return { border: 'border-l-4 border-l-cofimar-danger', text: 'text-cofimar-danger', bg: 'bg-cofimar-danger/5' };
    }
    if (type === 'fca') {
      const v = typeof value === 'number' ? value : parseFloat(String(value));
      if (v === 0) return { border: 'border-l-4 border-l-slate-600', text: 'text-slate-400', bg: 'bg-slate-800/10' };
      if (v < 1.35) return { border: 'border-l-4 border-l-cofimar-success', text: 'text-cofimar-success', bg: 'bg-cofimar-success/5' };
      if (v <= 1.70) return { border: 'border-l-4 border-l-cofimar-warning', text: 'text-cofimar-warning', bg: 'bg-cofimar-warning/5' };
      return { border: 'border-l-4 border-l-cofimar-danger', text: 'text-cofimar-danger', bg: 'bg-cofimar-danger/5' };
    }
    if (type === 'survival') {
      const v = typeof value === 'number' ? value : parseFloat(String(value).replace(/%/g, ''));
      if (v >= 70) return { border: 'border-l-4 border-l-cofimar-success', text: 'text-cofimar-success', bg: 'bg-cofimar-success/5' };
      if (v >= 50) return { border: 'border-l-4 border-l-cofimar-warning', text: 'text-cofimar-warning', bg: 'bg-cofimar-warning/5' };
      return { border: 'border-l-4 border-l-cofimar-danger', text: 'text-cofimar-danger', bg: 'bg-cofimar-danger/5' };
    }
    return { border: 'border-l-4 border-l-cofimar-primary', text: 'text-cofimar-primary', bg: 'bg-cofimar-primary/5' };
  };

  const status = getKpiStatus();

  return (
    <div className={`glass-card p-6 rounded-2xl flex flex-col justify-between hover-scale shadow-xl shadow-cofimar-bg/30 ${status.border}`}>
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-medium">
            {title}
          </span>
          <h3 className="text-3xl font-display font-bold text-white mt-1.5 tracking-tight">
            {value}
          </h3>
        </div>
        
        {/* Metric Type Indicator Badge */}
        <div className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider ${status.bg} ${status.text}`}>
          {type.toUpperCase()}
        </div>
      </div>

      <div className="flex items-center justify-between mt-5 border-t border-cofimar-border/30 pt-3">
        <span className="text-xs text-slate-400 truncate">
          {subtitle || 'Promedio de ciclos activos'}
        </span>

        {trend && (
          <div className={`flex items-center space-x-1 text-xs font-mono font-bold ${
            trend.isPositive ? 'text-cofimar-success' : 'text-cofimar-danger'
          }`}>
            {trend.isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
