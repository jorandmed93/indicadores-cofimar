import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { Loader2, BarChart3, TrendingUp, Calendar, Compass, Printer } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend
} from 'recharts';

const SECTOR_COORDINATES: { [key: string]: { x: number; y: number; w: number; h: number; zone: string } } = {
  'BARRACUDA': { x: 50, y: 80, w: 120, h: 70, zone: 'Zona Norte' },
  'CATANUDA': { x: 190, y: 80, w: 120, h: 70, zone: 'Zona Norte' },
  'CHERNA': { x: 330, y: 80, w: 120, h: 70, zone: 'Zona Norte' },
  'DELFIN': { x: 470, y: 80, w: 120, h: 70, zone: 'Zona Norte' },
  'GUATO': { x: 610, y: 80, w: 120, h: 70, zone: 'Zona Norte' },
  'WAHOO': { x: 750, y: 80, w: 120, h: 70, zone: 'Zona Norte' },

  'DORADO': { x: 50, y: 190, w: 120, h: 70, zone: 'Zona Centro' },
  'MERO': { x: 190, y: 190, w: 120, h: 70, zone: 'Zona Centro' },
  'PAMPANO': { x: 330, y: 190, w: 120, h: 70, zone: 'Zona Centro' },
  'PARGO ROJO': { x: 470, y: 190, w: 120, h: 70, zone: 'Zona Centro' },
  'ROBALO': { x: 610, y: 190, w: 120, h: 70, zone: 'Zona Centro' },
  'TAMBULERO': { x: 750, y: 190, w: 120, h: 70, zone: 'Zona Centro' },

  'MANTARRAYA': { x: 50, y: 300, w: 120, h: 70, zone: 'Zona Sur' },
  'TIBURON': { x: 190, y: 300, w: 120, h: 70, zone: 'Zona Sur' },
  'TUNA': { x: 330, y: 300, w: 120, h: 70, zone: 'Zona Sur' },
  'PI': { x: 470, y: 300, w: 120, h: 70, zone: 'Zona Sur' },
  'PT': { x: 610, y: 300, w: 120, h: 70, zone: 'Zona Sur' },

  'K1': { x: 50, y: 410, w: 100, h: 60, zone: 'Zona Especial' },
  'K2': { x: 170, y: 410, w: 100, h: 60, zone: 'Zona Especial' },
  'K3': { x: 290, y: 410, w: 100, h: 60, zone: 'Zona Especial' },
  'OR': { x: 410, y: 410, w: 100, h: 60, zone: 'Zona Especial' },
  'R1': { x: 530, y: 410, w: 100, h: 60, zone: 'Zona Especial' },
  'R2': { x: 650, y: 410, w: 100, h: 60, zone: 'Zona Especial' },
};

const Summary: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'map' | 'sector' | 'aguaje' | 'month'>('map');
  const [loading, setLoading] = useState(true);
  const [mapMetric, setMapMetric] = useState<'lbs_ha' | 'survival'>('lbs_ha');
  const [mapTooltip, setMapTooltip] = useState<{ sectorName: string; x: number; y: number; data: any } | null>(null);
  
  const [sectorsData, setSectorsData] = useState<any[]>([]);
  const [aguajesData, setAguajesData] = useState<any[]>([]);
  const [monthsData, setMonthsData] = useState<any[]>([]);

  // State for drill-down cycles breakdown
  const [selectedGroup, setSelectedGroup] = useState<{ type: 'sector' | 'aguaje' | 'month'; name: string; params: any } | null>(null);
  const [groupCycles, setGroupCycles] = useState<any[]>([]);
  const [loadingCycles, setLoadingCycles] = useState(false);

  const handleMapMouseEnter = (sectorName: string, data: any, e: React.MouseEvent) => {
    setMapTooltip({
      sectorName,
      x: e.clientX,
      y: e.clientY,
      data
    });
  };

  const handleMapMouseLeave = () => {
    setMapTooltip(null);
  };

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

  const handleRowClick = (type: 'sector' | 'aguaje' | 'month', name: string, filterParams: any) => {
    setSelectedGroup({ type, name, params: filterParams });
    setLoadingCycles(true);
    setGroupCycles([]);
    
    client.get('/cycles', { params: { ...filterParams, limit: 100 } })
      .then(res => {
        setGroupCycles(res.data.data);
        setLoadingCycles(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingCycles(false);
      });
  };

  const subTabs = [
    { id: 'map', label: 'Mapa de Sectores', icon: Compass },
    { id: 'sector', label: 'Resumen por Sector', icon: BarChart3 },
    { id: 'aguaje', label: 'Resumen por Aguaje', icon: TrendingUp },
    { id: 'month', label: 'Resumen Mensual', icon: Calendar },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-cofimar-surface border border-cofimar-border p-4 rounded-xl shadow-2xl">
          <p className="text-sm font-bold text-cofimar-text mb-2">{label}</p>
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

  const renderTable = (
    data: any[], 
    columns: { key: string; label: string; align?: string; format?: (v: any, row?: any) => string; bold?: boolean; color?: string }[],
    onRowClick?: (row: any) => void
  ) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-cofimar-surface-secondary text-cofimar-text-muted font-mono text-xs uppercase tracking-wider border-b border-cofimar-border">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={`py-4 px-6 ${col.align === 'right' ? 'text-right' : ''} ${i === 0 ? 'rounded-l-lg' : ''} ${i === columns.length - 1 ? 'rounded-r-lg' : ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cofimar-border font-mono">
          {data.map((row, idx) => (
            <tr 
              key={idx} 
              onClick={() => onRowClick && onRowClick(row)}
              className={`hover:bg-cofimar-surface-hover/30 transition border-b border-cofimar-border ${onRowClick ? 'cursor-pointer hover:text-cofimar-primary' : ''}`}
            >
              {columns.map((col, i) => {
                const val = col.format ? col.format(row[col.key], row) : row[col.key];
                return (
                  <td key={i} className={`py-4 px-6 ${col.align === 'right' ? 'text-right' : ''} ${col.bold ? 'font-bold text-sm' : 'text-sm'} ${col.color === 'primary' ? 'text-cofimar-primary font-bold' : col.color === 'accent' ? 'text-cofimar-accent font-bold' : i === 0 ? 'font-bold text-cofimar-text' : 'text-cofimar-text'}`}>
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
      {/* Executive PDF Print Header */}
      <div className="hidden print:flex flex-row justify-between items-center border-b-2 border-cofimar-primary pb-4 mb-6 w-full font-mono text-[10px] text-cofimar-text-muted">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cofimar-primary flex items-center justify-center text-white font-bold text-sm tracking-tighter">
            CF
          </div>
          <div>
            <h1 className="text-sm font-bold text-cofimar-text tracking-wider">GRUPO COFIMAR</h1>
            <p className="text-[8px] uppercase tracking-widest text-cofimar-primary">Resúmenes y Pivots Consolidados</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <p className="font-bold text-cofimar-text">REPORTE DE DESEMPEÑO DE SECTORES Y MAREAS</p>
          <p className="text-[8px] mt-0.5">FECHA: {new Date().toLocaleDateString()} &bull; USUARIO: ADMINISTRADOR</p>
        </div>
      </div>
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-cofimar-text flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cofimar-primary" />
            Resúmenes Consolidados (Pivots)
          </h1>
          <p className="text-cofimar-text-muted text-sm mt-1">
            Análisis de datos agrupados por Sector, Aguaje y Meses. <span className="text-cofimar-primary font-bold font-mono text-xs ml-2">💡 Haz clic en una fila para ver el detalle de sus ciclos</span>
          </p>
        </div>
        
        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 bg-cofimar-accent/10 hover:bg-cofimar-accent/20 border border-cofimar-border text-cofimar-text hover:text-cofimar-primary px-4 py-2.5 rounded-lg transition font-medium text-xs font-mono no-print"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>EXPORTAR PDF</span>
        </button>
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
          {/* MAPA DE SECTORES */}
          {activeSubTab === 'map' && (
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl shadow-sm border border-cofimar-border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-cofimar-border/50 pb-5 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-cofimar-text flex items-center gap-2">
                      <span>Mapa Interactivo de Sectores</span>
                      <span className="text-[10px] font-mono font-bold bg-cofimar-primary/10 text-cofimar-primary border border-cofimar-primary/20 px-2 py-0.5 rounded-full">LIVE PERFORMANCE</span>
                    </h3>
                    <p className="text-xs text-cofimar-text-muted mt-1">
                      Esquema espacial coloreado por rendimiento de cosecha. Haz clic en un sector para abrir su bitácora de ciclos.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 no-print">
                    <span className="text-xs font-bold font-mono text-cofimar-text-muted">MÉTRICA ACTIVA:</span>
                    <div className="flex bg-cofimar-surface-secondary border border-cofimar-border p-0.5 rounded-lg">
                      <button
                        onClick={() => setMapMetric('lbs_ha')}
                        className={`px-3 py-1.5 text-[10px] font-bold font-mono rounded-md transition ${
                          mapMetric === 'lbs_ha'
                            ? 'bg-cofimar-surface text-cofimar-primary shadow-xs'
                            : 'text-cofimar-text-muted hover:text-cofimar-text'
                        }`}
                      >
                        LBS/HA
                      </button>
                      <button
                        onClick={() => setMapMetric('survival')}
                        className={`px-3 py-1.5 text-[10px] font-bold font-mono rounded-md transition ${
                          mapMetric === 'survival'
                            ? 'bg-cofimar-surface text-cofimar-primary shadow-xs'
                            : 'text-cofimar-text-muted hover:text-cofimar-text'
                        }`}
                      >
                        SOBREVIVENCIA %
                      </button>
                    </div>
                  </div>
                </div>

                {/* Map Grid Container */}
                <div className="relative overflow-x-auto border border-cofimar-border/60 rounded-xl bg-cofimar-surface-secondary/20 p-6 flex justify-center">
                  <div className="relative w-[920px] h-[520px] select-none flex-shrink-0">
                    
                    {/* Canal de Abastecimiento Principal (Water Canal) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                      <defs>
                        <linearGradient id="canalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#007AFF" stopOpacity="0.05" />
                          <stop offset="50%" stopColor="#007AFF" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#007AFF" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      
                      {/* Ocean/Estuary Input left */}
                      <path d="M 0,40 L 40,40" stroke="#007AFF" strokeWidth="4" strokeDasharray="5,3" opacity="0.6" />
                      <text x="5" y="30" fill="#007AFF" fontSize="8" fontFamily="monospace" fontWeight="bold">ESTUARIO</text>

                      {/* Main supply canal line */}
                      <rect x="40" y="25" width="840" height="30" rx="6" fill="url(#canalGradient)" stroke="#007AFF" strokeWidth="1" opacity="0.7" />
                      <text x="440" y="44" fill="#007AFF" fontSize="9" fontFamily="monospace" fontWeight="bold" letterSpacing="2" textAnchor="middle">CANAL DE ABASTECIMIENTO GENERAL</text>
                      
                      {/* Flow vectors from canal to sectors */}
                      {Object.keys(SECTOR_COORDINATES).map((key, idx) => {
                        const coord = SECTOR_COORDINATES[key];
                        if (coord.zone === 'Zona Norte') {
                          return (
                            <g key={idx}>
                              <path d={`M ${coord.x + 60},55 L ${coord.x + 60},80`} stroke="#007AFF" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.5" />
                              <polygon points={`${coord.x + 60},80 ${coord.x + 57},75 ${coord.x + 63},75`} fill="#007AFF" opacity="0.6" />
                            </g>
                          );
                        }
                        return null;
                      })}
                    </svg>

                    {/* Sector Cards */}
                    {Object.keys(SECTOR_COORDINATES).map((sectorName) => {
                      const coord = SECTOR_COORDINATES[sectorName];
                      // Find real sector data from API
                      const sectorInfo = sectorsData.find(
                        s => s.sector.toUpperCase() === sectorName.toUpperCase()
                      );

                      // Calculate performance color
                      let bgColor = 'rgba(142, 142, 147, 0.04)';
                      let borderColor = 'var(--cofimar-border)';
                      let textColor = 'var(--cofimar-text-muted)';
                      let badgeBg = 'var(--cofimar-badge-bg)';
                      let badgeText = 'var(--cofimar-badge-text)';
                      let badgeLabel = 'INACTIVO';
                      let valStr = 'S/D';

                      if (sectorInfo) {
                        const lbsHaVal = parseFloat(sectorInfo.avg_lbs_ha || 0);
                        const survVal = parseFloat(sectorInfo.avg_survival || 0);

                        if (mapMetric === 'lbs_ha') {
                          valStr = `${Math.round(lbsHaVal).toLocaleString()} LBS/HA`;
                          if (lbsHaVal >= 3500) {
                            bgColor = 'rgba(52, 199, 89, 0.08)';
                            borderColor = '#34C759';
                            textColor = '#34C759';
                            badgeBg = 'rgba(52, 199, 89, 0.1)';
                            badgeText = '#34C759';
                            badgeLabel = 'ALTA EFIC.';
                          } else if (lbsHaVal >= 2000) {
                            bgColor = 'rgba(255, 149, 0, 0.08)';
                            borderColor = '#FF9500';
                            textColor = '#FF9500';
                            badgeBg = 'rgba(255, 149, 0, 0.1)';
                            badgeText = '#FF9500';
                            badgeLabel = 'REGULAR';
                          } else {
                            bgColor = 'rgba(255, 59, 48, 0.08)';
                            borderColor = '#FF3B30';
                            textColor = '#FF3B30';
                            badgeBg = 'rgba(255, 59, 48, 0.1)';
                            badgeText = '#FF3B30';
                            badgeLabel = 'ALERTA';
                          }
                        } else {
                          valStr = `${survVal.toFixed(1)}% SOBR.`;
                          if (survVal >= 75) {
                            bgColor = 'rgba(52, 199, 89, 0.08)';
                            borderColor = '#34C759';
                            textColor = '#34C759';
                            badgeBg = 'rgba(52, 199, 89, 0.1)';
                            badgeText = '#34C759';
                            badgeLabel = 'ALTA';
                          } else if (survVal >= 55) {
                            bgColor = 'rgba(255, 149, 0, 0.08)';
                            borderColor = '#FF9500';
                            textColor = '#FF9500';
                            badgeBg = 'rgba(255, 149, 0, 0.1)';
                            badgeText = '#FF9500';
                            badgeLabel = 'MEDIA';
                          } else {
                            bgColor = 'rgba(255, 59, 48, 0.08)';
                            borderColor = '#FF3B30';
                            textColor = '#FF3B30';
                            badgeBg = 'rgba(255, 59, 48, 0.1)';
                            badgeText = '#FF3B30';
                            badgeLabel = 'BAJA';
                          }
                        }
                      }

                      return (
                        <div
                          key={sectorName}
                          style={{
                            left: coord.x,
                            top: coord.y,
                            width: coord.w,
                            height: coord.h,
                            backgroundColor: bgColor,
                            borderColor: borderColor,
                          }}
                          onClick={() => handleRowClick('sector', sectorName, { sector: sectorName })}
                          onMouseEnter={(e) => handleMapMouseEnter(sectorName, sectorInfo, e)}
                          onMouseLeave={handleMapMouseLeave}
                          className="absolute border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:brightness-105 active:scale-95 group z-10"
                        >
                          <div className="flex items-start justify-between min-w-0">
                            <span className="text-[10px] font-mono font-bold tracking-tight text-cofimar-text truncate pr-1">
                              {sectorName}
                            </span>
                            <span
                              style={{ backgroundColor: badgeBg, color: badgeText }}
                              className="text-[7px] font-mono font-bold px-1 py-0.5 rounded-sm flex-shrink-0"
                            >
                              {badgeLabel}
                            </span>
                          </div>

                          <div className="flex flex-col mt-1">
                            <span className="text-xs font-mono font-bold tracking-tighter" style={{ color: textColor }}>
                              {valStr}
                            </span>
                            <span className="text-[8px] font-sans text-cofimar-text-muted mt-0.5">
                              {sectorInfo ? `${sectorInfo.cycle_count} Ciclos` : 'Sin datos'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend & Color Scale description */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-cofimar-border/50 text-xs font-mono no-print">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-500/10 border border-emerald-500" />
                    <span className="text-cofimar-text-muted">Desempeño Alto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-orange-500/10 border border-orange-500" />
                    <span className="text-cofimar-text-muted">Desempeño Regular</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-red-500/10 border border-red-500" />
                    <span className="text-cofimar-text-muted">Desempeño Crítico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-zinc-500/5 border border-zinc-500/30" />
                    <span className="text-cofimar-text-muted">Sin Datos / Inactivo</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                ], (row) => handleRowClick('sector', row.sector, { sector: row.sector }))}
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
                ], (row) => handleRowClick('aguaje', row.aguaje, { aguaje: row.aguaje }))}
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
                ], (row) => handleRowClick('month', `${row.year} / ${row.month}`, { year: row.year, month: row.month }))}
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

      {/* Drill-down Cycles Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blur backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedGroup(null)}
          />
          
          {/* Modal content */}
          <div className="relative bg-cofimar-surface border border-cofimar-border w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden transition-all duration-300 transform scale-100">
            {/* Header */}
            <div className="p-6 border-b border-cofimar-border flex items-center justify-between bg-cofimar-surface-secondary">
              <div>
                <span className="text-[10px] font-mono text-cofimar-primary uppercase tracking-widest font-bold">
                  Desglose de Ciclos Productivos
                </span>
                <h2 className="text-xl font-bold text-cofimar-text mt-1">
                  {selectedGroup.type === 'sector' ? 'Sector' : selectedGroup.type === 'aguaje' ? 'Aguaje' : 'Período'}: <span className="text-cofimar-primary">{selectedGroup.name}</span>
                </h2>
              </div>
              <button 
                onClick={() => setSelectedGroup(null)}
                className="bg-cofimar-bg/60 hover:bg-cofimar-bg border border-cofimar-border text-cofimar-text hover:text-cofimar-primary px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
              >
                CERRAR
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingCycles ? (
                <div className="h-[250px] flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-8 h-8 text-cofimar-primary animate-spin" />
                  <span className="text-cofimar-text-muted font-mono text-xs">Obteniendo ciclos productivos...</span>
                </div>
              ) : groupCycles.length === 0 ? (
                <div className="h-[250px] flex flex-col items-center justify-center space-y-2">
                  <span className="text-cofimar-text-muted font-mono text-sm">No se encontraron ciclos para este grupo.</span>
                </div>
              ) : (
                <div className="overflow-x-auto border border-cofimar-border rounded-xl shadow-inner bg-cofimar-bg/10">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-cofimar-surface-secondary text-cofimar-text-muted font-mono uppercase border-b border-cofimar-border">
                      <tr>
                        <th className="py-3 px-4 rounded-l-lg">CÓDIGO</th>
                        <th className="py-3 px-4">PISCINA</th>
                        <th className="py-3 px-4">SECTOR</th>
                        <th className="py-3 px-4">FECHA COSECHA</th>
                        <th className="py-3 px-4 text-right">DÍAS</th>
                        <th className="py-3 px-4 text-right">LARVAS SEMBRADAS</th>
                        <th className="py-3 px-4 text-right">SOBREVIVENCIA</th>
                        <th className="py-3 px-4 text-right">FCA</th>
                        <th className="py-3 px-4 text-right rounded-r-lg">LBS/HA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cofimar-border font-mono">
                      {groupCycles.map((c, idx) => (
                        <tr key={idx} className="hover:bg-cofimar-surface-secondary/60 transition">
                          <td className="py-3.5 px-4 font-bold text-cofimar-primary">{c.pond_code}</td>
                          <td className="py-3.5 px-4 text-cofimar-text-secondary">{c.pond_name}</td>
                          <td className="py-3.5 px-4 text-cofimar-text-muted">{c.sector}</td>
                          <td className="py-3.5 px-4 text-cofimar-text-muted">{c.harvest_date}</td>
                          <td className="py-3.5 px-4 text-right text-cofimar-text">{c.days} d</td>
                          <td className="py-3.5 px-4 text-right text-cofimar-text">{parseInt(c.animals_seeded || 0).toLocaleString()}</td>
                          <td className={`py-3.5 px-4 text-right font-bold ${
                            c.survival_pct >= 70 ? 'text-cofimar-success' : c.survival_pct >= 50 ? 'text-cofimar-warning' : 'text-cofimar-danger'
                          }`}>
                            {parseFloat(c.survival_pct).toFixed(1)}%
                          </td>
                          <td className="py-3.5 px-4 text-right text-cofimar-text">{parseFloat(c.fca).toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-cofimar-primary">
                            {Math.round(parseFloat(c.lbs_ha)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Map Tooltip */}
      {mapTooltip && (
        <div
          style={{ left: mapTooltip.x, top: mapTooltip.y }}
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-[calc(100%+12px)] animate-fadeIn no-print"
        >
          <div className="bg-cofimar-surface/95 backdrop-blur-md border border-cofimar-border p-4 rounded-xl shadow-2xl w-60 space-y-2.5">
            <div className="border-b border-cofimar-border/60 pb-2">
              <span className="text-[8px] font-mono text-cofimar-primary uppercase tracking-widest font-bold block">
                {SECTOR_COORDINATES[mapTooltip.sectorName]?.zone || 'Sector Cofimar'}
              </span>
              <h4 className="text-sm font-bold text-cofimar-text mt-0.5">
                Sector: {mapTooltip.sectorName}
              </h4>
            </div>

            {mapTooltip.data ? (
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-cofimar-text-muted">Ciclos Totales:</span>
                  <span className="font-bold text-cofimar-text">{mapTooltip.data.cycle_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cofimar-text-muted">Promedio Días:</span>
                  <span className="font-bold text-cofimar-text">{Math.round(parseFloat(mapTooltip.data.avg_days || 0))} d</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cofimar-text-muted">Sobrevivencia:</span>
                  <span className="font-bold text-cofimar-success">{parseFloat(mapTooltip.data.avg_survival || 0).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cofimar-text-muted">Promedio FCA:</span>
                  <span className="font-bold text-cofimar-text">{parseFloat(mapTooltip.data.avg_fca || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-cofimar-border/40 pt-1.5 mt-1.5">
                  <span className="text-cofimar-text-muted">Rendimiento:</span>
                  <span className="font-bold text-cofimar-primary">{Math.round(parseFloat(mapTooltip.data.avg_lbs_ha || 0)).toLocaleString()} LBS/HA</span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-cofimar-text-muted italic">
                Sin ciclos registrados en este período.
              </p>
            )}
          </div>
          {/* Tooltip caret arrow */}
          <div className="w-3 h-3 bg-cofimar-surface border-r border-b border-cofimar-border transform rotate-45 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1.5" />
        </div>
      )}
    </div>
  );
};

export default Summary;
