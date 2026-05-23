import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { Loader2, TrendingUp, Calendar, Compass, ShieldAlert, Award, ArrowRight } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

interface PondDetailProps {
  pondCode: string;
}

const PondDetail: React.FC<PondDetailProps> = ({ pondCode }) => {
  const [loading, setLoading] = useState(true);
  const [pondStats, setPondStats] = useState<any>(null);
  const [pondCycles, setPondCycles] = useState<any[]>([]);
  const [activeCycle, setActiveCycle] = useState<any>(null);

  useEffect(() => {
    if (!pondCode) return;
    setLoading(true);

    // Fetch pond general aggregations
    const fetchPondSummary = client.get('/summary/by-pond', { params: { pond_code: pondCode } });
    // Fetch all chronological cycles for this pond
    const fetchPondCycles = client.get('/cycles', { 
      params: { 
        pond_code: pondCode, 
        limit: 50, 
        sort_by: 'harvest_date', 
        sort_dir: 'asc' // chronological
      } 
    });

    Promise.all([fetchPondSummary, fetchPondCycles])
      .then(([summaryRes, cyclesRes]) => {
        if (summaryRes.data && summaryRes.data.length > 0) {
          setPondStats(summaryRes.data[0]);
        } else {
          setPondStats(null);
        }
        
        const sortedCycles = cyclesRes.data.data;
        setPondCycles(sortedCycles);
        if (sortedCycles.length > 0) {
          setActiveCycle(sortedCycles[sortedCycles.length - 1]); // default to most recent
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [pondCode]);

  if (!pondCode) {
    return (
      <div className="p-8 h-[500px] flex flex-col items-center justify-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-cofimar-accent animate-bounce" />
        <h3 className="text-lg font-bold text-white">Ninguna piscina seleccionada</h3>
        <p className="text-slate-400 text-xs max-w-sm text-center">
          Por favor, haz clic en el código de una piscina en el listado de Ciclos o Dashboard para analizar su historial.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-cofimar-surface border border-cofimar-border p-3.5 rounded-xl shadow-2xl">
          <p className="text-xs font-bold text-white mb-2">Cosecha: {label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} className="text-xs font-mono" style={{ color: item.color }}>
              {item.name}: <span className="font-bold">
                {item.name.includes('%') ? `${parseFloat(item.value).toFixed(1)}%` : Math.round(item.value).toLocaleString()}
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
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <Compass className="w-8 h-8 text-cofimar-accent animate-spin-slow" />
          Historial de Piscina: <span className="text-cofimar-accent">{pondCode}</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Evolución del rendimiento, FCA, sobrevivencia y control de calidad a lo largo de los ciclos de producción.
        </p>
      </div>

      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-cofimar-accent animate-spin" />
          <span className="text-slate-450 font-mono text-xs">Cargando base histórica de la piscina...</span>
        </div>
      ) : (
        <div className="space-y-7">
          
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-5 rounded-2xl border-l-4 border-l-cofimar-accent shadow-xl">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Rendimiento Histórico</span>
              <h4 className="text-2xl font-display font-bold text-white mt-1.5 font-mono">
                {pondStats ? `${Math.round(parseFloat(pondStats.avg_lbs_ha)).toLocaleString()} lbs/ha` : 'N/A'}
              </h4>
              <p className="text-[10px] text-slate-400 mt-2">Promedio sobre {pondCycles.length} ciclos</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border-l-4 border-l-cofimar-primary shadow-xl">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">FCA Promedio</span>
              <h4 className="text-2xl font-display font-bold text-white mt-1.5 font-mono">
                {pondStats ? parseFloat(pondStats.avg_fca).toFixed(2) : 'N/A'}
              </h4>
              <p className="text-[10px] text-slate-400 mt-2">Eficiencia alimentación</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border-l-4 border-l-cofimar-success shadow-xl">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Sobrevivencia Promedio</span>
              <h4 className="text-2xl font-display font-bold text-white mt-1.5 font-mono">
                {pondStats ? `${parseFloat(pondStats.avg_survival).toFixed(1)}%` : 'N/A'}
              </h4>
              <p className="text-[10px] text-slate-400 mt-2">Salud y biomasa estimada</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border-l-4 border-l-slate-550 shadow-xl">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Área & Certificación</span>
              <h4 className="text-lg font-display font-bold text-white mt-1.5 truncate">
                {pondStats ? `${parseFloat(pondStats.avg_days).toFixed(0)} días (Prom)` : 'N/A'}
              </h4>
              <p className="text-[10px] text-slate-450 mt-2">Duración promedio ciclo</p>
            </div>
          </div>

          {/* Historical Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LBS/HA Trend */}
            <div className="glass-card p-6 rounded-2xl shadow-xl">
              <h3 className="text-base font-bold text-white mb-6">Evolución de Rendimiento (LBS/HA)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pondCycles}>
                    <defs>
                      <linearGradient id="lbsColorDetail" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F5A623" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="harvest_date" stroke="#64748B" fontSize={8} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={8} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="lbs_ha" stroke="#F5A623" strokeWidth={2.5} fillOpacity={1} fill="url(#lbsColorDetail)" name="LBS/HA" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Survival & FCA Trend */}
            <div className="glass-card p-6 rounded-2xl shadow-xl">
              <h3 className="text-base font-bold text-white mb-6">Evolución Sobrevivencia %</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pondCycles}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="harvest_date" stroke="#64748B" fontSize={8} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={8} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="survival_pct" stroke="#00C9A7" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Sobrevivencia %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Chronological Cycle Cards */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Historial de Ciclos Cosechados</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {pondCycles.map((c, idx) => {
                const isActive = activeCycle?.id === c.id;
                const lbs = parseFloat(c.lbs_ha);
                const isGood = lbs >= 7000;
                const isBad = lbs < 4000;

                return (
                  <div 
                    key={idx}
                    onClick={() => setActiveCycle(c)}
                    className={`p-5 rounded-2xl cursor-pointer border transition hover-scale ${
                      isActive 
                        ? 'bg-slate-800/60 border-cofimar-accent shadow-lg shadow-cofimar-accent/5' 
                        : 'bg-cofimar-surface/90 border-cofimar-border/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[9px] font-mono text-slate-400 font-bold">
                          {c.aguaje}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-2">Cosecha: {c.harvest_date}</h4>
                      </div>
                      
                      <div className="text-right">
                        <span className={`text-sm font-mono font-bold block ${
                          isGood ? 'text-cofimar-success' : isBad ? 'text-cofimar-danger' : 'text-cofimar-warning'
                        }`}>
                          {Math.round(lbs).toLocaleString()}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">LBS/HA</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-cofimar-border/30 text-center font-mono text-[10px]">
                      <div>
                        <span className="text-slate-500 block">DÍAS</span>
                        <span className="text-slate-300 font-semibold">{c.days} d</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">FCA</span>
                        <span className="text-slate-300 font-semibold">{parseFloat(c.fca).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">SOBREV.</span>
                        <span className="text-slate-300 font-semibold">{parseFloat(c.survival_pct).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default PondDetail;
