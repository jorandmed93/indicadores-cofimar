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
        <div className="bg-cofimar-surface border border-cofimar-border p-3.5 rounded-xl shadow-2xl">
          <p className="text-xs font-bold text-white mb-2">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} className="text-xs font-mono" style={{ color: item.color }}>
              {item.name}: <span className="font-bold">
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

  return (
    <div className="p-8 space-y-7">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-cofimar-primary" />
          Resúmenes Consolidados (Pivots)
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Análisis de datos agrupados por Sector, Aguaje y Meses.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cofimar-border/60">
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
                  : 'text-slate-400 hover:text-slate-200'
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
          <span className="text-slate-400 font-mono text-xs">Agrupando indicadores del ciclo...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* TAB 1: SECTORS */}
          {activeSubTab === 'sector' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">
              {/* Sector Table */}
              <div className="glass-card p-6 rounded-2xl border border-cofimar-border/50 xl:col-span-2 shadow-xl">
                <h3 className="text-base font-bold text-white mb-4">Rendimientos por Sector Productivo</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-800/40 text-slate-400 font-mono border-b border-cofimar-border/60">
                      <tr>
                        <th className="py-3.5 px-4 rounded-l-lg">SECTOR</th>
                        <th className="py-3.5 px-4 text-right">CICLOS</th>
                        <th className="py-3.5 px-4 text-right">PROM. DÍAS</th>
                        <th className="py-3.5 px-4 text-right">SOBREVIVENCIA %</th>
                        <th className="py-3.5 px-4 text-right">FCA</th>
                        <th className="py-3.5 px-4 text-right rounded-r-lg">LBS/HA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cofimar-border/30">
                      {sectorsData.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/10 transition">
                          <td className="py-3 px-4 font-bold text-white">{s.sector}</td>
                          <td className="py-3 px-4 text-right font-mono text-slate-400">{s.cycle_count}</td>
                          <td className="py-3 px-4 text-right font-mono">{Math.round(parseFloat(s.avg_days))} d</td>
                          <td className="py-3 px-4 text-right font-mono">{parseFloat(s.avg_survival).toFixed(1)}%</td>
                          <td className="py-3 px-4 text-right font-mono">{parseFloat(s.avg_fca).toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-cofimar-primary">
                            {Math.round(parseFloat(s.avg_lbs_ha)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sector chart */}
              <div className="glass-card p-6 rounded-2xl border border-cofimar-border/50 shadow-xl flex flex-col justify-between">
                <h3 className="text-base font-bold text-white mb-4">LBS/HA por Sector</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectorsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                      <XAxis type="number" stroke="#64748B" fontSize={8} tickLine={false} />
                      <YAxis dataKey="sector" type="category" stroke="#64748B" fontSize={8} tickLine={false} width={80} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="avg_lbs_ha" fill="#00C9A7" radius={[0, 4, 4, 0]} name="LBS/HA" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AGUAJE */}
          {activeSubTab === 'aguaje' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">
              {/* Aguaje Table */}
              <div className="glass-card p-6 rounded-2xl border border-cofimar-border/50 xl:col-span-2 shadow-xl">
                <h3 className="text-base font-bold text-white mb-4">Rendimiento por Aguaje (Influencia Marea)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-800/40 text-slate-400 font-mono border-b border-cofimar-border/60">
                      <tr>
                        <th className="py-3.5 px-4 rounded-l-lg">AGUAJE</th>
                        <th className="py-3.5 px-4 text-right">CICLOS</th>
                        <th className="py-3.5 px-4 text-right">SOBREVIVENCIA %</th>
                        <th className="py-3.5 px-4 text-right">FCA</th>
                        <th className="py-3.5 px-4 text-right rounded-r-lg">LBS/HA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cofimar-border/30">
                      {aguajesData.map((a, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/10 transition">
                          <td className="py-3 px-4 font-bold text-white font-mono">{a.aguaje}</td>
                          <td className="py-3 px-4 text-right font-mono text-slate-400">{a.cycle_count}</td>
                          <td className="py-3 px-4 text-right font-mono">{parseFloat(a.avg_survival).toFixed(1)}%</td>
                          <td className="py-3 px-4 text-right font-mono">{parseFloat(a.avg_fca).toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-cofimar-accent">
                            {Math.round(parseFloat(a.avg_lbs_ha)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Aguaje chart */}
              <div className="glass-card p-6 rounded-2xl border border-cofimar-border/50 shadow-xl flex flex-col justify-between">
                <h3 className="text-base font-bold text-white mb-4">LBS/HA por Aguaje</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aguajesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="aguaje" stroke="#64748B" fontSize={8} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={8} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="avg_lbs_ha" fill="#F5A623" radius={[4, 4, 0, 0]} name="LBS/HA" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MONTHLY */}
          {activeSubTab === 'month' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">
              {/* Monthly Table */}
              <div className="glass-card p-6 rounded-2xl border border-cofimar-border/50 xl:col-span-2 shadow-xl">
                <h3 className="text-base font-bold text-white mb-4">Rendimiento Histórico Mensual</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-800/40 text-slate-400 font-mono border-b border-cofimar-border/60">
                      <tr>
                        <th className="py-3.5 px-4 rounded-l-lg">AÑO / MES</th>
                        <th className="py-3.5 px-4 text-right">CICLOS</th>
                        <th className="py-3.5 px-4 text-right">SOBREVIVENCIA %</th>
                        <th className="py-3.5 px-4 text-right">FCA</th>
                        <th className="py-3.5 px-4 text-right rounded-r-lg">LBS/HA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cofimar-border/30">
                      {monthsData.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/10 transition">
                          <td className="py-3 px-4 font-bold text-white font-mono">{m.year} - {m.month}</td>
                          <td className="py-3 px-4 text-right font-mono text-slate-400">{m.cycle_count}</td>
                          <td className="py-3 px-4 text-right font-mono">{parseFloat(m.avg_survival).toFixed(1)}%</td>
                          <td className="py-3 px-4 text-right font-mono">{parseFloat(m.avg_fca).toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-cofimar-primary">
                            {Math.round(parseFloat(m.avg_lbs_ha)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monthly Line Chart */}
              <div className="glass-card p-6 rounded-2xl border border-cofimar-border/50 shadow-xl flex flex-col justify-between">
                <h3 className="text-base font-bold text-white mb-4">Evolución LBS/HA Mensual</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="month" stroke="#64748B" fontSize={8} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={8} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="avg_lbs_ha" stroke="#00C9A7" strokeWidth={2.5} activeDot={{ r: 6 }} name="LBS/HA" />
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
