import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { Loader2, BarChart3, TrendingUp, Calendar, Compass } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend
} from 'recharts';

const Summary: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'sector' | 'aguaje' | 'month'>('sector');
  const [loading, setLoading] = useState(true);
  
  const [sectorsData, setSectorsData] = useState<any[]>([]);
  const [aguajesData, setAguajesData] = useState<any[]>([]);
  const [monthsData, setMonthsData] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    const fetchSectors = client.get('/summary/by-sector');
    const fetchAguajes = client.get('/summary/by-aguaje');
    const fetchMonths = client.get('/summary/by-month');

    Promise.all([fetchSectors, fetchAguajes, fetchMonths])
      .then(([secRes, aguRes, monRes]) => {
        setSectorsData(secRes.data);
        setAguajesData(aguRes.data);
        setMonthsData(monRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const subTabs = [
    { id: 'sector', label: 'Resumen por Sector', icon: BarChart3 },
    { id: 'aguaje', label: 'Resumen por Aguaje', icon: TrendingUp },
    { id: 'month', label: 'Resumen Mensual', icon: Calendar },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-cofimar-surface border border-cofimar-border p-4.5 rounded-xl shadow-2xl">
          <p className="text-sm font-bold text-cofimar-text mb-2.5">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} className="text-xs font-mono" style={{ color: item.color }}>
              {item.name}: <span className="font-bold text-sm">
                {item.name.includes('%') || item.name.includes('Sobrevivencia') 
                  ? `${parseFloat(item.value).toFixed(1)}%` 
                  : item.name.includes('FCA') 
                    ? parseFloat(item.value).toFixed(2)
                    : Math.round(item.value).toLocaleString()
                }
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderTable = (data: any[], columns: { key: string; label: string; align?: string; format?: (v: any, row?: any) => string; bold?: boolean; color?: string }[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-cofimar-surface-secondary text-cofimar-text-muted font-mono text-xs uppercase tracking-wider border-b border-cofimar-border">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={`py-4.5 px-5.5 ${col.align === 'right' ? 'text-right' : ''} ${i === 0 ? 'rounded-l-lg' : ''} ${i === columns.length - 1 ? 'rounded-r-lg' : ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cofimar-border font-mono">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-cofimar-surface-secondary transition">
              {columns.map((col, i) => {
                const val = col.format ? col.format(row[col.key], row) : row[col.key];
                return (
                  <td key={i} className={`py-4 px-5.5 ${col.align === 'right' ? 'text-right' : ''} ${col.bold ? 'font-bold text-sm' : 'text-sm'} ${col.color === 'primary' ? 'text-cofimar-primary font-bold' : col.color === 'accent' ? 'text-cofimar-accent font-bold' : i === 0 ? 'font-bold text-cofimar-text' : 'text-cofimar-text'}`}>
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-8 space-y-7">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-bold text-cofimar-text flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-cofimar-primary" />
          Resúmenes Consolidados (Pivots)
        </h1>
        <p className="text-cofimar-text-muted text-sm mt-1">
          Análisis de datos agrupados por Sector, Aguaje y Meses.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cofimar-border">
        {subTabs.map(t => {
          const Icon = t.icon;
          const isActive = activeSubTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id as any)}
              className={`flex items-center space-x-2.5 px-6 py-4 font-medium text-sm transition relative ${
                isActive 
                  ? 'text-cofimar-primary border-b-2 border-cofimar-primary' 
                  : 'text-cofimar-text-muted hover:text-cofimar-text'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-cofimar-primary animate-spin" />
          <span className="text-cofimar-text-muted font-mono text-xs">Agrupando indicadores del ciclo...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* SECTORS */}
          {activeSubTab === 'sector' && (
            <div className="space-y-7">
              <div className="glass-card p-6 rounded-lg shadow-sm">
                <h3 className="text-base font-bold text-cofimar-text mb-4">Rendimientos por Sector Productivo</h3>
                {renderTable(sectorsData, [
                  { key: 'sector', label: 'SECTOR', bold: true },
                  { key: 'cycle_count', label: 'CICLOS', align: 'right' },
                  { key: 'avg_days', label: 'PROM. DÍAS', align: 'right', format: (v: any) => `${Math.round(parseFloat(v))} d` },
                  { key: 'avg_survival', label: 'SOBREVIVENCIA %', align: 'right', format: (v: any) => `${parseFloat(v).toFixed(1)}%` },
                  { key: 'avg_fca', label: 'FCA', align: 'right', format: (v: any) => parseFloat(v).toFixed(2) },
                  { key: 'avg_lbs_ha', label: 'LBS/HA', align: 'right', bold: true, color: 'primary', format: (v: any) => Math.round(parseFloat(v)).toLocaleString() },
                ])}
              </div>
              <div className="glass-card p-6 rounded-lg shadow-sm flex flex-col justify-between">
                <h3 className="text-base font-bold text-cofimar-text mb-4">Análisis de Rendimiento LBS/HA por Sector</h3>
                <div className="h-[420px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectorsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--cofimar-border)" vertical={false} />
                      <XAxis dataKey="sector" stroke="var(--cofimar-text-muted)" fontSize={12} tickLine={false} />
                      <YAxis stroke="var(--cofimar-text-muted)" fontSize={12} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="avg_lbs_ha" fill="#34C759" radius={[4, 4, 0, 0]} name="LBS/HA" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* AGUAJE */}
          {activeSubTab === 'aguaje' && (
            <div className="space-y-7">
              <div className="glass-card p-6 rounded-lg shadow-sm">
                <h3 className="text-base font-bold text-cofimar-text mb-4">Rendimiento por Aguaje (Influencia Marea)</h3>
                {renderTable(aguajesData, [
                  { key: 'aguaje', label: 'AGUAJE', bold: true },
                  { key: 'cycle_count', label: 'CICLOS', align: 'right' },
                  { key: 'avg_survival', label: 'SOBREVIVENCIA %', align: 'right', format: (v: any) => `${parseFloat(v).toFixed(1)}%` },
                  { key: 'avg_fca', label: 'FCA', align: 'right', format: (v: any) => parseFloat(v).toFixed(2) },
                  { key: 'avg_lbs_ha', label: 'LBS/HA', align: 'right', bold: true, color: 'accent', format: (v: any) => Math.round(parseFloat(v)).toLocaleString() },
                ])}
              </div>
              <div className="glass-card p-6 rounded-lg shadow-sm flex flex-col justify-between">
                <h3 className="text-base font-bold text-cofimar-text mb-4">Análisis de Rendimiento LBS/HA por Aguaje</h3>
                <div className="h-[420px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aguajesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--cofimar-border)" vertical={false} />
                      <XAxis dataKey="aguaje" stroke="var(--cofimar-text-muted)" fontSize={12} tickLine={false} />
                      <YAxis stroke="var(--cofimar-text-muted)" fontSize={12} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="avg_lbs_ha" fill="#FF9500" radius={[4, 4, 0, 0]} name="LBS/HA" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* MONTHLY */}
          {activeSubTab === 'month' && (
            <div className="space-y-7">
              <div className="glass-card p-6 rounded-lg shadow-sm">
                <h3 className="text-base font-bold text-cofimar-text mb-4">Rendimiento Histórico Mensual</h3>
                {renderTable(monthsData, [
                  { key: 'year', label: 'AÑO / MES', bold: true, format: (v: any, row: any) => `${v} / ${row.month}` },
                  { key: 'cycle_count', label: 'CICLOS', align: 'right' },
                  { key: 'avg_survival', label: 'SOBREVIVENCIA %', align: 'right', format: (v: any) => `${parseFloat(v).toFixed(1)}%` },
                  { key: 'avg_fca', label: 'FCA', align: 'right', format: (v: any) => parseFloat(v).toFixed(2) },
                  { key: 'avg_lbs_ha', label: 'LBS/HA', align: 'right', bold: true, color: 'primary', format: (v: any) => Math.round(parseFloat(v)).toLocaleString() },
                ])}
              </div>
              <div className="glass-card p-6 rounded-lg shadow-sm flex flex-col justify-between">
                <h3 className="text-base font-bold text-cofimar-text mb-4">Evolución Histórica Mensual LBS/HA</h3>
                <div className="h-[420px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--cofimar-border)" vertical={false} />
                      <XAxis dataKey="month" stroke="var(--cofimar-text-muted)" fontSize={12} tickLine={false} />
                      <YAxis stroke="var(--cofimar-text-muted)" fontSize={12} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="avg_lbs_ha" stroke="#34C759" strokeWidth={3} activeDot={{ r: 7 }} name="LBS/HA" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Summary;
