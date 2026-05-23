import React, { useEffect, useState } from 'react';
import client from '../api/client';
import KPICard from '../components/KPICard';
import Filters from '../components/Filters';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { Award, Compass, HelpCircle, LayoutGrid, Loader2 } from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  setSelectedPondCode: (code: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, setSelectedPondCode }) => {
  // Catalogs
  const [sectors, setSectors] = useState<string[]>([]);
  const [aguajes, setAguajes] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const years = [2024, 2025, 2026];
  const months = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  // Selected Filters
  const [selectedYear, setSelectedYear] = useState<string>('2026'); // default 2026 as per excel
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedAguaje, setSelectedAguaje] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedCert, setSelectedCert] = useState<string>('');

  // Dashboard Data State
  const [loading, setLoading] = useState(true);
  const [sectorSummary, setSectorSummary] = useState<any[]>([]);
  const [aguajeSummary, setAguajeSummary] = useState<any[]>([]);
  const [pondSummary, setPondSummary] = useState<any[]>([]);
  const [cycleList, setCycleList] = useState<any[]>([]);
  
  // KPI values
  const [kpiLbsHa, setKpiLbsHa] = useState<number>(0);
  const [kpiFca, setKpiFca] = useState<number>(0);
  const [kpiSurvival, setKpiSurvival] = useState<number>(0);
  const [kpiTotalCycles, setKpiTotalCycles] = useState<number>(0);

  // Load Catalogs
  useEffect(() => {
    client.get('/catalog/sectors').then(res => setSectors(res.data)).catch(console.error);
    client.get('/catalog/aguajes').then(res => setAguajes(res.data)).catch(console.error);
    client.get('/catalog/certifications').then(res => setCertifications(res.data)).catch(console.error);
  }, []);

  // Fetch Dashboard Stats
  useEffect(() => {
    setLoading(true);
    
    // Setup query params
    const params: any = {};
    if (selectedYear) params.year = selectedYear;
    if (selectedSector) params.sector = selectedSector;
    if (selectedAguaje) params.aguaje = selectedAguaje;
    if (selectedMonth) params.month = selectedMonth;
    if (selectedCert) params.certification = selectedCert;

    const fetchSummaryBySector = client.get('/summary/by-sector', { params });
    const fetchSummaryByAguaje = client.get('/summary/by-aguaje', { params });
    const fetchSummaryByPond = client.get('/summary/by-pond', { params });
    const fetchCycles = client.get('/cycles', { params: { ...params, limit: 10 } });

    Promise.all([fetchSummaryBySector, fetchSummaryByAguaje, fetchSummaryByPond, fetchCycles])
      .then(([sectorRes, aguajeRes, pondRes, cyclesRes]) => {
        setSectorSummary(sectorRes.data);
        setAguajeSummary(aguajeRes.data);
        setPondSummary(pondRes.data);
        setCycleList(cyclesRes.data.data);
        setKpiTotalCycles(cyclesRes.data.total);

        // Calculate global KPIs from matching sectors (weighted by cycle counts)
        let totalLbsHaSum = 0;
        let totalFcaSum = 0;
        let totalSurvivalSum = 0;
        let totalCount = 0;

        sectorRes.data.forEach((s: any) => {
          totalLbsHaSum += parseFloat(s.avg_lbs_ha) * s.cycle_count;
          totalFcaSum += parseFloat(s.avg_fca) * s.cycle_count;
          totalSurvivalSum += parseFloat(s.avg_survival) * s.cycle_count;
          totalCount += s.cycle_count;
        });

        if (totalCount > 0) {
          setKpiLbsHa(Math.round(totalLbsHaSum / totalCount));
          setKpiFca(Math.round((totalFcaSum / totalCount) * 100) / 100);
          setKpiSurvival(Math.round((totalSurvivalSum / totalCount) * 10) / 10);
        } else {
          setKpiLbsHa(0);
          setKpiFca(0);
          setKpiSurvival(0);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching dashboard data", err);
        setLoading(false);
      });
  }, [selectedYear, selectedSector, selectedAguaje, selectedMonth, selectedCert]);

  const handleResetFilters = () => {
    setSelectedYear('2026');
    setSelectedSector('');
    setSelectedAguaje('');
    setSelectedMonth('');
    setSelectedCert('');
  };

  // Top 10 high-performance ponds
  const topPonds = [...pondSummary]
    .sort((a, b) => b.avg_lbs_ha - a.avg_lbs_ha)
    .slice(0, 10);

  // Custom chart tooltips for premium feel
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-cofimar-surface border border-cofimar-border p-4 rounded-xl shadow-2xl">
          <p className="text-xs font-bold text-white mb-2">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} className="text-xs font-mono" style={{ color: item.color }}>
              {item.name}: <span className="font-bold">{typeof item.value === 'number' ? item.value.toLocaleString(undefined, {maximumFractionDigits: 2}) : item.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-7 p-8">
      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-cofimar-primary" />
            Dashboard de Indicadores
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Análisis consolidado y rendimiento en tiempo real del ciclo productivo acuícola.
          </p>
        </div>
        
        {/* Quick Date Display */}
        <div className="bg-cofimar-surface border border-cofimar-border px-4 py-2 rounded-xl flex items-center space-x-3 text-xs font-mono">
          <span className="text-slate-400">Periodo Analizado:</span>
          <span className="text-cofimar-primary font-bold">{selectedYear || 'Todos los años'}</span>
        </div>
      </div>

      {/* Global Filters */}
      <Filters
        years={years}
        aguajes={aguajes}
        months={months}
        sectors={sectors}
        certifications={certifications}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedAguaje={selectedAguaje}
        setSelectedAguaje={setSelectedAguaje}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedSector={selectedSector}
        setSelectedSector={setSelectedSector}
        selectedCert={selectedCert}
        setSelectedCert={setSelectedCert}
        onReset={handleResetFilters}
      />

      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-cofimar-primary animate-spin" />
          <span className="text-slate-400 font-mono text-xs">Cargando métricas consolidadas...</span>
        </div>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Promedio LBS/HA"
              value={kpiLbsHa.toLocaleString()}
              subtitle="Rendimiento consolidado"
              type="lbs_ha"
            />
            <KPICard
              title="Factor Conversión (FCA)"
              value={kpiFca || 'N/A'}
              subtitle="Conversión alimento"
              type="fca"
            />
            <KPICard
              title="Sobrevivencia %"
              value={`${kpiSurvival}%`}
              subtitle="Supervivencia estimada"
              type="survival"
            />
            <KPICard
              title="Ciclos Finalizados"
              value={kpiTotalCycles}
              subtitle="Total de piscinas cosechadas"
              type="neutral"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LBS/HA by Sector */}
            <div className="glass-card p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-white">Rendimiento por Sector</h3>
                  <p className="text-[10px] font-mono text-slate-400">Promedio de Libras por Hectárea (LBS/HA)</p>
                </div>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorSummary}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="sector" stroke="#64748B" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={9} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1E293B', opacity: 0.2 }} />
                    <Bar dataKey="avg_lbs_ha" fill="#00C9A7" radius={[4, 4, 0, 0]} name="LBS/HA" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trends by Aguaje */}
            <div className="glass-card p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-white">Evolución por Aguaje</h3>
                  <p className="text-[10px] font-mono text-slate-400">Historial secuencial de aguajes</p>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={aguajeSummary}>
                    <defs>
                      <linearGradient id="lbsColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F5A623" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="aguaje" stroke="#64748B" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={9} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="avg_lbs_ha" stroke="#F5A623" strokeWidth={2.5} fillOpacity={1} fill="url(#lbsColor)" name="LBS/HA" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2: Top Yield Ponds & Recent Cycles */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Yield Ponds */}
            <div className="glass-card p-6 rounded-2xl shadow-xl lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-cofimar-accent" />
                  <div>
                    <h3 className="text-base font-bold text-white">Top 10 Piscinas de Alto Rendimiento</h3>
                    <p className="text-[10px] font-mono text-slate-400">Rendimientos máximos registrados (LBS/HA)</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/40 text-slate-400 font-mono border-b border-cofimar-border/60">
                    <tr>
                      <th className="py-3 px-4 rounded-l-lg">CÓDIGO</th>
                      <th className="py-3 px-4">PISCINA</th>
                      <th className="py-3 px-4">SECTOR</th>
                      <th className="py-3 px-4 text-right">DIAS PROMEDIO</th>
                      <th className="py-3 px-4 text-right">SOBREVIVENCIA</th>
                      <th className="py-3 px-4 text-right">FCA</th>
                      <th className="py-3 px-4 text-right rounded-r-lg">LBS/HA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cofimar-border/30">
                    {topPonds.map((p, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => {
                          setSelectedPondCode(p.pond_code);
                          setActiveTab('pondDetail');
                        }}
                        className="hover:bg-slate-800/20 cursor-pointer transition"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-cofimar-primary">{p.pond_code}</td>
                        <td className="py-3.5 px-4 text-slate-300">{p.pond_name}</td>
                        <td className="py-3.5 px-4 text-slate-400">{p.sector}</td>
                        <td className="py-3.5 px-4 text-right font-mono">{Math.round(p.avg_days)}</td>
                        <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                          p.avg_survival >= 70 ? 'text-cofimar-success' : p.avg_survival >= 50 ? 'text-cofimar-warning' : 'text-cofimar-danger'
                        }`}>
                          {Math.round(p.avg_survival)}%
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono">{parseFloat(p.avg_fca).toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                          {Math.round(p.avg_lbs_ha).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Cosechas List */}
            <div className="glass-card p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-white">Últimos Ciclos</h3>
                  <p className="text-[10px] font-mono text-slate-400 font-medium">Cosechas más recientes</p>
                </div>
              </div>

              <div className="space-y-4">
                {cycleList.map((c, idx) => {
                  const lbs = Math.round(parseFloat(c.lbs_ha));
                  const isGood = lbs >= 7000;
                  const isBad = lbs < 4000;
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setSelectedPondCode(c.pond_code);
                        setActiveTab('pondDetail');
                      }}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/25 border border-cofimar-border/30 hover:border-cofimar-primary/40 cursor-pointer transition hover:bg-slate-800/40"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-cofimar-primary text-xs">{c.pond_code}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{c.aguaje}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-1">{c.sector} • {c.harvest_date}</p>
                      </div>
                      
                      <div className="text-right">
                        <span className={`text-xs font-mono font-bold block ${
                          isGood ? 'text-cofimar-success' : isBad ? 'text-cofimar-danger' : 'text-cofimar-warning'
                        }`}>
                          {lbs.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">LBS/HA</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
