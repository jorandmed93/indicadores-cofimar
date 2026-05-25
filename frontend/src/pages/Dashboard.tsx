import React, { useEffect, useState } from 'react';
import client from '../api/client';
import KPICard from '../components/KPICard';
import Filters from '../components/Filters';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { 
  Award, Compass, HelpCircle, LayoutGrid, Loader2, ArrowUpRight, ArrowDownRight, 
  CalendarRange, Sparkles, RefreshCw, Printer
} from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  setSelectedPondCode: (code: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, setSelectedPondCode }) => {
  // Navigation / View Tabs
  const [activeView, setActiveView] = useState<'standard' | 'yoy'>('standard');

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
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return new Date().getFullYear().toString();
  });
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedAguaje, setSelectedAguaje] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const monthsList = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    return monthsList[new Date().getMonth()];
  });
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

  // Year vs Year State
  const [yoyLoading, setYoyLoading] = useState(false);
  const [yoyData, setYoyData] = useState<any>(null);
  const [yoyMetric, setYoyMetric] = useState<'avg_lbs_ha' | 'avg_fca' | 'avg_survival'>('avg_lbs_ha');

  // Load Catalogs
  useEffect(() => {
    client.get('/catalog/sectors').then(res => setSectors(res.data)).catch(console.error);
    client.get('/catalog/aguajes').then(res => setAguajes(res.data)).catch(console.error);
    client.get('/catalog/certifications').then(res => setCertifications(res.data)).catch(console.error);
  }, []);

  // Fetch Dashboard Stats
  useEffect(() => {
    if (activeView === 'standard') {
      setLoading(true);
      
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
    }
  }, [selectedYear, selectedSector, selectedAguaje, selectedMonth, selectedCert, activeView]);

  // Fetch Year vs Year Stats
  useEffect(() => {
    if (activeView === 'yoy') {
      setYoyLoading(true);
      const params: any = {};
      if (selectedSector) params.sector = selectedSector;

      client.get('/summary/compare-years', { params })
        .then(res => {
          setYoyData(res.data);
          setYoyLoading(false);
        })
        .catch(err => {
          console.error("Error fetching YoY data", err);
          setYoyLoading(false);
        });
    }
  }, [selectedSector, activeView]);

  const handleResetFilters = () => {
    const monthsList = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    const currentMonth = monthsList[new Date().getMonth()];
    
    setSelectedYear(new Date().getFullYear().toString());
    setSelectedSector('');
    setSelectedAguaje('');
    setSelectedMonth(currentMonth);
    setSelectedCert('');
  };

  const topPonds = [...pondSummary]
    .sort((a, b) => b.avg_lbs_ha - a.avg_lbs_ha)
    .slice(0, 10);

  const sortedSectors = [...sectorSummary]
    .sort((a, b) => b.avg_lbs_ha - a.avg_lbs_ha);
  const leaderSector = sortedSectors[0];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-cofimar-surface border border-cofimar-border p-4 rounded-lg shadow-2xl">
          <p className="text-xs font-bold text-cofimar-text mb-2">{label}</p>
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

  // YoY Variation Calculator Helper
  const getVariation = (val2025: number, val2026: number, inverse = false) => {
    if (!val2025) return { pct: '0.0%', isPositive: true };
    const diff = val2026 - val2025;
    const pctVal = (diff / val2025) * 100;
    const pct = `${pctVal > 0 ? '+' : ''}${pctVal.toFixed(1)}%`;
    // For FCA, a decrease is positive/good
    const isPositive = inverse ? diff <= 0 : diff >= 0;
    return { pct, isPositive };
  };

  return (
    <div className="space-y-7 p-8 pt-4">
      
      {/* View Switcher Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-cofimar-border/50 pb-5">
        <div>
          <h2 className="text-2xl font-display font-bold text-cofimar-text tracking-tight flex items-center gap-2">
            <span>Consola de Indicadores</span>
            <Sparkles className="w-5 h-5 text-cofimar-primary" />
          </h2>
          <p className="text-xs text-cofimar-text-muted mt-1 font-mono uppercase tracking-wider">
            ANÁLISIS E INDICADORES DE PRODUCCIÓN COSECHADOS
          </p>
        </div>

        <div className="flex items-center gap-3 no-print">
          <div className="flex bg-cofimar-surface-secondary border border-cofimar-border p-1 rounded-xl">
            <button
              onClick={() => setActiveView('standard')}
              className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all duration-150 flex items-center gap-2 ${
                activeView === 'standard'
                  ? 'bg-cofimar-surface text-cofimar-primary shadow-sm'
                  : 'text-cofimar-text-muted hover:text-cofimar-text'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>INDICADORES ESTÁNDAR</span>
            </button>
            <button
              onClick={() => setActiveView('yoy')}
              className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all duration-150 flex items-center gap-2 ${
                activeView === 'yoy'
                  ? 'bg-cofimar-surface text-cofimar-primary shadow-sm'
                  : 'text-cofimar-text-muted hover:text-cofimar-text'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>COMPARACIÓN AÑO VS AÑO</span>
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-text hover:text-cofimar-primary font-bold px-4 py-2.5 rounded-xl border border-cofimar-border transition-all duration-150 text-xs font-mono flex items-center gap-2"
            title="Exportar esta vista a reporte PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>EXPORTAR PDF</span>
          </button>
        </div>
      </div>

      {activeView === 'standard' ? (
        <>
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
              <span className="text-cofimar-text-muted font-mono text-xs">Cargando métricas consolidadas...</span>
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
                <div className="glass-card p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-base font-bold text-cofimar-text">Rendimiento por Sector</h3>
                      <p className="text-[10px] font-mono text-cofimar-text-muted">Promedio de Libras por Hectárea (LBS/HA)</p>
                    </div>
                    {leaderSector && (
                      <div className="flex items-center space-x-2 bg-cofimar-primary/10 border border-cofimar-primary/20 px-3 py-1.5 rounded-lg">
                        <span className="text-[10px] font-mono text-cofimar-primary uppercase font-bold">Líder: {leaderSector.sector}</span>
                        <span className="text-[10px] font-mono text-cofimar-text font-bold bg-cofimar-primary/20 px-1.5 py-0.5 rounded">
                          {Math.round(leaderSector.avg_lbs_ha).toLocaleString()} LBS/HA
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sortedSectors}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--cofimar-border)" vertical={false} />
                        <XAxis dataKey="sector" stroke="var(--cofimar-text-muted)" fontSize={9} tickLine={false} />
                        <YAxis stroke="var(--cofimar-text-muted)" fontSize={9} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--cofimar-border)', opacity: 0.15 }} />
                        <Bar dataKey="avg_lbs_ha" fill="var(--cofimar-primary)" radius={[4, 4, 0, 0]} name="LBS/HA" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Trends by Aguaje */}
                <div className="glass-card p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-base font-bold text-cofimar-text">Evolución por Aguaje</h3>
                      <p className="text-[10px] font-mono text-cofimar-text-muted">Historial secuencial de aguajes</p>
                    </div>
                  </div>

                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={aguajeSummary}>
                        <defs>
                          <linearGradient id="lbsColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#5856D6" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#5856D6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--cofimar-border)" vertical={false} />
                        <XAxis dataKey="aguaje" stroke="var(--cofimar-text-muted)" fontSize={9} tickLine={false} />
                        <YAxis stroke="var(--cofimar-text-muted)" fontSize={9} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="avg_lbs_ha" stroke="#5856D6" strokeWidth={2} fillOpacity={1} fill="url(#lbsColor)" name="LBS/HA" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Yield Ponds */}
                <div className="glass-card p-6 rounded-lg shadow-sm lg:col-span-2">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-cofimar-accent" />
                      <div>
                        <h3 className="text-base font-bold text-cofimar-text">Top 10 Piscinas de Alto Rendimiento</h3>
                        <p className="text-[10px] font-mono text-cofimar-text-muted">Rendimientos máximos registrados (LBS/HA)</p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-cofimar-surface-secondary text-cofimar-text-muted font-mono border-b border-cofimar-border">
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
                      <tbody className="divide-y divide-cofimar-border">
                        {topPonds.map((p, idx) => (
                          <tr 
                            key={idx} 
                            onClick={() => {
                              setSelectedPondCode(p.pond_code);
                              setActiveTab('pondDetail');
                            }}
                            className="hover:bg-cofimar-surface-secondary cursor-pointer transition"
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-cofimar-primary">{p.pond_code}</td>
                            <td className="py-3.5 px-4 text-cofimar-text-secondary">{p.pond_name}</td>
                            <td className="py-3.5 px-4 text-cofimar-text-muted">{p.sector}</td>
                            <td className="py-3.5 px-4 text-right font-mono text-cofimar-text">{Math.round(p.avg_days)}</td>
                            <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                              p.avg_survival >= 70 ? 'text-cofimar-success' : p.avg_survival >= 50 ? 'text-cofimar-warning' : 'text-cofimar-danger'
                            }`}>
                              {Math.round(p.avg_survival)}%
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-cofimar-text">{parseFloat(p.avg_fca).toFixed(2)}</td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-cofimar-text">
                              {Math.round(p.avg_lbs_ha).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Cycles */}
                <div className="glass-card p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-base font-bold text-cofimar-text">Últimos Ciclos</h3>
                      <p className="text-[10px] font-mono text-cofimar-text-muted font-medium">Cosechas más recientes</p>
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
                          className="flex items-center justify-between p-3.5 rounded-lg bg-cofimar-surface-secondary border border-cofimar-border hover:border-cofimar-primary/40 cursor-pointer transition shadow-sm"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-cofimar-primary text-xs">{c.pond_code}</span>
                              <span className="text-[10px] text-cofimar-text-muted font-mono">{c.aguaje}</span>
                            </div>
                            <p className="text-[10px] text-cofimar-text-faint truncate mt-1">{c.sector} • {c.harvest_date}</p>
                          </div>
                          
                          <div className="text-right">
                            <span className={`text-xs font-mono font-bold block ${
                              isGood ? 'text-cofimar-success' : isBad ? 'text-cofimar-danger' : 'text-cofimar-warning'
                            }`}>
                              {lbs.toLocaleString()}
                            </span>
                            <span className="text-[9px] text-cofimar-text-muted font-mono">LBS/HA</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        /* Year vs Year Comparative View */
        <>
          {/* YoY Filters */}
          <div className="glass-card p-5 rounded-2xl border border-cofimar-border/50 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:w-[250px]">
              <label className="text-[9px] font-mono text-cofimar-text-muted uppercase tracking-wider block mb-1.5">
                FILTRAR POR SECTOR
              </label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full bg-cofimar-surface border border-cofimar-border rounded-xl px-4 py-2.5 text-xs text-cofimar-text focus:outline-none focus:border-cofimar-primary transition font-mono uppercase"
              >
                <option value="">TODOS LOS SECTORES</option>
                {sectors.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => { setSelectedSector(''); }}
              className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-text px-4 py-2.5 rounded-xl border border-cofimar-border transition text-xs font-mono w-full sm:w-auto"
            >
              RESTABLECER
            </button>
          </div>

          {yoyLoading || !yoyData ? (
            <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-cofimar-primary animate-spin" />
              <span className="text-cofimar-text-muted font-mono text-xs">Calculando variaciones anuales...</span>
            </div>
          ) : (
            <>
              {/* Comparative YoY KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* LBS/HA YoY Card */}
                {(() => {
                  const val25 = yoyData.overall["2025"].avg_lbs_ha;
                  const val26 = yoyData.overall["2026"].avg_lbs_ha;
                  const { pct, isPositive } = getVariation(val25, val26);
                  return (
                    <div className="glass-card p-6 rounded-2xl border border-cofimar-border/50 shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
                      <div>
                        <span className="text-[10px] font-mono text-cofimar-text-muted uppercase font-bold tracking-wider block">
                          RENDIMIENTO LBS/HA
                        </span>
                        <div className="grid grid-cols-2 gap-2 mt-3.5">
                          <div>
                            <span className="text-[9px] font-mono text-cofimar-text-faint block uppercase">2025 PROMEDIO</span>
                            <span className="text-base font-bold text-cofimar-text-secondary font-mono">{Math.round(val25).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-cofimar-primary block uppercase">2026 PROMEDIO</span>
                            <span className="text-lg font-bold text-cofimar-primary font-mono">{Math.round(val26).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-cofimar-border/25 pt-2.5 mt-3">
                        <span className="text-[10px] text-cofimar-text-muted font-mono">Diferencia anual</span>
                        <span className={`text-xs font-mono font-bold flex items-center gap-1 ${isPositive ? 'text-cofimar-success' : 'text-cofimar-danger'}`}>
                          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {pct}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* FCA YoY Card */}
                {(() => {
                  const val25 = yoyData.overall["2025"].avg_fca;
                  const val26 = yoyData.overall["2026"].avg_fca;
                  const { pct, isPositive } = getVariation(val25, val26, true);
                  return (
                    <div className="glass-card p-6 rounded-2xl border border-cofimar-border/50 shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
                      <div>
                        <span className="text-[10px] font-mono text-cofimar-text-muted uppercase font-bold tracking-wider block">
                          CONVERSIÓN ALIMENTO (FCA)
                        </span>
                        <div className="grid grid-cols-2 gap-2 mt-3.5">
                          <div>
                            <span className="text-[9px] font-mono text-cofimar-text-faint block uppercase">2025 PROMEDIO</span>
                            <span className="text-base font-bold text-cofimar-text-secondary font-mono">{val25 ? val25.toFixed(2) : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-cofimar-accent block uppercase">2026 PROMEDIO</span>
                            <span className="text-lg font-bold text-cofimar-accent font-mono">{val26 ? val26.toFixed(2) : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-cofimar-border/25 pt-2.5 mt-3">
                        <span className="text-[10px] text-cofimar-text-muted font-mono">Eficiencia alimenticia</span>
                        <span className={`text-xs font-mono font-bold flex items-center gap-1 ${isPositive ? 'text-cofimar-success' : 'text-cofimar-danger'}`}>
                          {isPositive ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          {pct}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Survival YoY Card */}
                {(() => {
                  const val25 = yoyData.overall["2025"].avg_survival;
                  const val26 = yoyData.overall["2026"].avg_survival;
                  const { pct, isPositive } = getVariation(val25, val26);
                  return (
                    <div className="glass-card p-6 rounded-2xl border border-cofimar-border/50 shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
                      <div>
                        <span className="text-[10px] font-mono text-cofimar-text-muted uppercase font-bold tracking-wider block">
                          SOBREVIVENCIA ESTIMADA
                        </span>
                        <div className="grid grid-cols-2 gap-2 mt-3.5">
                          <div>
                            <span className="text-[9px] font-mono text-cofimar-text-faint block uppercase">2025 PROMEDIO</span>
                            <span className="text-base font-bold text-cofimar-text-secondary font-mono">{val25 ? `${Math.round(val25)}%` : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-cofimar-success block uppercase">2026 PROMEDIO</span>
                            <span className="text-lg font-bold text-cofimar-success font-mono">{val26 ? `${Math.round(val26)}%` : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-cofimar-border/25 pt-2.5 mt-3">
                        <span className="text-[10px] text-cofimar-text-muted font-mono">Variación en %</span>
                        <span className={`text-xs font-mono font-bold flex items-center gap-1 ${isPositive ? 'text-cofimar-success' : 'text-cofimar-danger'}`}>
                          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {pct}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Finished Cycles YoY Card */}
                {(() => {
                  const val25 = yoyData.overall["2025"].cycle_count;
                  const val26 = yoyData.overall["2026"].cycle_count;
                  const { pct, isPositive } = getVariation(val25, val26);
                  return (
                    <div className="glass-card p-6 rounded-2xl border border-cofimar-border/50 shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
                      <div>
                        <span className="text-[10px] font-mono text-cofimar-text-muted uppercase font-bold tracking-wider block">
                          CICLOS PRODUCTIVOS FINALIZADOS
                        </span>
                        <div className="grid grid-cols-2 gap-2 mt-3.5">
                          <div>
                            <span className="text-[9px] font-mono text-cofimar-text-faint block uppercase">2025 TOTAL</span>
                            <span className="text-base font-bold text-cofimar-text-secondary font-mono">{val25}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-cofimar-text block uppercase">2026 TOTAL</span>
                            <span className="text-lg font-bold text-cofimar-text font-mono">{val26}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-cofimar-border/25 pt-2.5 mt-3">
                        <span className="text-[10px] text-cofimar-text-muted font-mono">Variación cantidad</span>
                        <span className={`text-xs font-mono font-bold flex items-center gap-1 ${isPositive ? 'text-cofimar-success' : 'text-cofimar-danger'}`}>
                          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {pct}
                        </span>
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* Dual-Axis Recharts Month-over-Month YoY Chart */}
              <div className="glass-card p-6 rounded-2xl border border-cofimar-border/50 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-cofimar-text flex items-center gap-2">
                      <span>Curvas Comparativas Año vs Año (MoM)</span>
                    </h3>
                    <p className="text-[10px] font-mono text-cofimar-text-muted uppercase mt-0.5">
                      Comparativa del indicador mensual registrado para 2025 vs 2026
                    </p>
                  </div>

                  <div className="flex bg-cofimar-bg/85 border border-cofimar-border p-1 rounded-xl">
                    <button
                      onClick={() => setYoyMetric('avg_lbs_ha')}
                      className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition ${
                        yoyMetric === 'avg_lbs_ha' ? 'bg-cofimar-primary text-white' : 'text-cofimar-text-muted hover:text-cofimar-text'
                      }`}
                    >
                      LBS/HA
                    </button>
                    <button
                      onClick={() => setYoyMetric('avg_fca')}
                      className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition ${
                        yoyMetric === 'avg_fca' ? 'bg-cofimar-accent text-white' : 'text-cofimar-text-muted hover:text-cofimar-text'
                      }`}
                    >
                      FCA
                    </button>
                    <button
                      onClick={() => setYoyMetric('avg_survival')}
                      className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition ${
                        yoyMetric === 'avg_survival' ? 'bg-cofimar-success text-white' : 'text-cofimar-text-muted hover:text-cofimar-text'
                      }`}
                    >
                      SOBREVIVENCIA
                    </button>
                  </div>
                </div>

                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yoyData.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--cofimar-border)" vertical={false} />
                      <XAxis dataKey="month" stroke="var(--cofimar-text-muted)" fontSize={9} tickLine={false} />
                      <YAxis stroke="var(--cofimar-text-muted)" fontSize={9} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--cofimar-border)', opacity: 0.1 }} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                      <Bar 
                        dataKey={`2025.${yoyMetric}`} 
                        fill="#5856D6" 
                        opacity={0.35}
                        name="Año 2025" 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey={`2026.${yoyMetric}`} 
                        fill={yoyMetric === 'avg_fca' ? 'var(--cofimar-accent)' : yoyMetric === 'avg_survival' ? 'var(--cofimar-success)' : 'var(--cofimar-primary)'} 
                        name="Año 2026" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </>
      )}

    </div>
  );
};

export default Dashboard;
