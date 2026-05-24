import React from 'react';
import { TrendingUp, Award, Activity, Layers } from 'lucide-react';

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
  
  const getStyleConfig = () => {
    switch (type) {
      case 'lbs_ha':
        return {
          icon: TrendingUp,
          bg: 'bg-[#34C759]/10',
          text: 'text-[#34C759]',
          badge: 'bg-[#34C759]/10 text-[#34C759]'
        };
      case 'fca':
        return {
          icon: Activity,
          bg: 'bg-[#FF3B30]/10',
          text: 'text-[#FF3B30]',
          badge: 'bg-[#FF3B30]/10 text-[#FF3B30]'
        };
      case 'survival':
        return {
          icon: Award,
          bg: 'bg-[#FF9500]/10',
          text: 'text-[#FF9500]',
          badge: 'bg-[#FF9500]/10 text-[#FF9500]'
        };
      default:
        return {
          icon: Layers,
          bg: 'bg-cofimar-primary/10',
          text: 'text-cofimar-primary',
          badge: 'bg-cofimar-primary/10 text-cofimar-primary'
        };
    }
  };

  const style = getStyleConfig();
  const Icon = style.icon;

  return (
    <div className="bg-cofimar-surface border border-cofimar-border p-5 rounded-lg flex flex-col justify-between hover-scale shadow-sm transition-all duration-200">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-8 h-8 ${style.bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${style.text}`} />
        </div>

        {trend ? (
          <div className={`flex items-center space-x-0.5 text-[10px] font-mono font-bold ${
            trend.isPositive ? 'text-[#34C759]' : 'text-[#FF3B30]'
          }`}>
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </div>
        ) : (
          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${style.badge}`}>
            {type === 'neutral' ? 'CICLOS' : type}
          </span>
        )}
      </div>

      {/* Main Numbers */}
      <div className="space-y-1">
        <h3 className="text-2xl font-display font-bold text-cofimar-text tracking-tight leading-none">
          {value}
        </h3>
        <p className="text-[10px] text-cofimar-text-muted font-medium tracking-tight">
          {title}
        </p>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-[9px] text-cofimar-text-faint font-mono mt-3 border-t border-cofimar-border pt-2 truncate">
          {subtitle}
        </p>
      )}

    </div>
  );
};

export default KPICard;
