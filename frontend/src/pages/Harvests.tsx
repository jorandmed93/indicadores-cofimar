import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { 
  Loader2, Search, ArrowUpDown, ChevronLeft, ChevronRight, 
  Droplet, CheckCircle, AlertTriangle, Scale, User, Calendar, Award, FileText
} from 'lucide-react';

const Harvests: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [harvests, setHarvests] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit, setLimit] = useState(25);

  const [search, setSearch] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCertification, setSelectedCertification] = useState('');
  const [sectors, setSectors] = useState<string[]>([]);
  
  const [avgDiffLbs, setAvgDiffLbs] = useState(0);
  const [maxDiffLbs, setMaxDiffLbs] = useState(0);

  // State for drill-down individual harvest inspection
  const [selectedHarvest, setSelectedHarvest] = useState<any | null>(null);

  useEffect(() => {
    client.get('/catalog/sectors').then(res => setSectors(res.data)).catch(console.error);
  }, []);

  const fetchHarvests = () => {
    setLoading(true);
    const params: any = { page, limit };
    if (search) params.pond_code = search;
    if (selectedActivity) params.activity = selectedActivity;
    if (selectedSector) params.sector = selectedSector;
    if (selectedMonth) params.month = selectedMonth;
    if (selectedCertification) params.certification = selectedCertification;

    client.get('/harvests', { params })
      .then(res => {
        setHarvests(res.data.data);
        setTotal(res.data.total);
        setPages(res.data.pages);
        
        let diffSum = 0;
        let maxDiff = 0;
        res.data.data.forEach((h: any) => {
          const diff = Math.abs(parseFloat(h.lbs_plant || 0) - parseFloat(h.lbs_farm || 0));
          diffSum += diff;
          if (diff > maxDiff) maxDiff = diff;
        });
        setAvgDiffLbs(res.data.data.length ? diffSum / res.data.data.length : 0);
        setMaxDiffLbs(maxDiff);
        
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchHarvests(); }, [page, limit, selectedActivity, selectedSector, selectedMonth, selectedCertification, search]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedActivity('');
    setSelectedSector('');
    setSelectedMonth('');
    setSelectedCertification('');
    setPage(1);
  };

  const selectClass = "bg-cofimar-surface border border-cofimar-border text-cofimar-text text-xs px-3.5 py-2.5 rounded-lg focus:border-cofimar-primary focus:outline-none transition min-w-[130px]";

  return (
    <div className="p-8 space-y-7">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-bold text-cofimar-text flex items-center gap-3">
          <Droplet className="w-8 h-8 text-cofimar-primary" />
          Control de Cosechas & QC
        </h1>
        <p className="text-cofimar-text-muted text-sm mt-1">
          Registro detallado de transacciones de pesca/raleos con control de mermas y calidad planta vs camaronera (COSECHAS). <span className="text-cofimar-primary font-bold font-mono text-xs ml-2">💡 Haz clic en una fila para ver el desglose completo</span>
        </p>
      </div>

      {/* QC Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-lg border-l-4 border-l-cofimar-primary flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 bg-cofimar-primary/10 rounded-lg flex items-center justify-center border border-cofimar-primary/20">
            <Scale className="w-5 h-5 text-cofimar-primary" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-cofimar-text-muted uppercase tracking-wider block">Merma Promedio (Libras)</span>
            <h4 className="text-2xl font-display font-bold text-cofimar-text mt-1 font-mono">
              {loading ? '...' : `${Math.round(avgDiffLbs).toLocaleString()} lbs`}
            </h4>
          </div>
        </div>

        <div className="glass-card p-5 rounded-lg border-l-4 border-l-cofimar-danger flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 bg-cofimar-danger/10 rounded-lg flex items-center justify-center border border-cofimar-danger/20">
            <AlertTriangle className="w-5 h-5 text-cofimar-danger" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-cofimar-text-muted uppercase tracking-wider block">Merma Máxima Registrada</span>
            <h4 className="text-2xl font-display font-bold text-cofimar-text mt-1 font-mono">
              {loading ? '...' : `${Math.round(maxDiffLbs).toLocaleString()} lbs`}
            </h4>
          </div>
        </div>

        <div className="glass-card p-5 rounded-lg border-l-4 border-l-cofimar-success flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 bg-cofimar-success/10 rounded-lg flex items-center justify-center border border-cofimar-success/20">
            <CheckCircle className="w-5 h-5 text-cofimar-success" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-cofimar-text-muted uppercase tracking-wider block">Total Transacciones</span>
            <h4 className="text-2xl font-display font-bold text-cofimar-text mt-1 font-mono">
              {loading ? '...' : total.toLocaleString()}
            </h4>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-card p-5 rounded-lg flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-cofimar-text-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar piscina (ej: DO 10, GT)..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-cofimar-surface-secondary border border-cofimar-border text-cofimar-text text-xs pl-10 pr-4 py-2.5 rounded-lg focus:border-cofimar-primary focus:outline-none transition placeholder:text-cofimar-text-faint font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select value={selectedActivity} onChange={(e) => { setSelectedActivity(e.target.value); setPage(1); }} className={selectClass}>
              <option value="">ACTIVIDAD</option>
              <option value="PESCA">PESCA (FINAL)</option>
              <option value="RALEO">RALEO (PARCIAL)</option>
            </select>
            
            <select value={selectedSector} onChange={(e) => { setSelectedSector(e.target.value); setPage(1); }} className={selectClass}>
              <option value="">SECTOR</option>
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setPage(1); }} className={selectClass}>
              <option value="">MES</option>
              {["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select value={selectedCertification} onChange={(e) => { setSelectedCertification(e.target.value); setPage(1); }} className={selectClass}>
              <option value="">CERTIFICACIÓN</option>
              {["CONVENCIONAL", "ASC", "BAP", "ASC-BAP"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {(search || selectedActivity || selectedSector || selectedMonth || selectedCertification) && (
              <button 
                onClick={handleResetFilters}
                className="bg-cofimar-danger/10 border border-cofimar-danger/30 text-cofimar-danger hover:bg-cofimar-danger/25 px-4 py-2.5 rounded-lg text-xs font-semibold font-mono transition"
              >
                LIMPIAR FILTROS
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-cofimar-primary animate-spin" />
          <span className="text-cofimar-text-muted font-mono text-xs">Cargando transacciones de báscula...</span>
        </div>
      ) : (
        <div className="glass-card rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-cofimar-surface-secondary text-cofimar-text-muted font-mono border-b border-cofimar-border">
                <tr>
                  <th className="py-4 px-5">PISCINA</th>
                  <th className="py-4 px-5">ACTIVIDAD</th>
                  <th className="py-4 px-5">FECHA</th>
                  <th className="py-4 px-5">SECTOR</th>
                  <th className="py-4 px-5 text-right">LBS CAMARONERA</th>
                  <th className="py-4 px-5 text-right">LBS PLANTA</th>
                  <th className="py-4 px-5 text-right text-cofimar-accent">MERMA LBS</th>
                  <th className="py-4 px-5 text-right">GR CAMARONERA</th>
                  <th className="py-4 px-5 text-right">GR PLANTA</th>
                  <th className="py-4 px-5 text-right text-cofimar-accent">DIF GRAMAJE</th>
                  <th className="py-4 px-5">JEFE DE SECTOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cofimar-border">
                {harvests.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-10 text-center font-mono text-cofimar-text-muted">
                      No se registraron transacciones.
                    </td>
                  </tr>
                ) : (
                  harvests.map((h, idx) => {
                    const diffLbs = parseFloat(h.lbs_plant || 0) - parseFloat(h.lbs_farm || 0);
                    const diffGr = parseFloat(h.gr_plant || 0) - parseFloat(h.gr_farm || 0);
                    const isSevereMerma = Math.abs(diffLbs) > 1000;
                    
                    return (
                      <tr 
                        key={idx} 
                        onClick={() => setSelectedHarvest(h)}
                        className="hover:bg-cofimar-surface-hover/30 cursor-pointer transition border-b border-cofimar-border hover:text-cofimar-primary"
                      >
                        <td className="py-3.5 px-5 font-mono font-bold text-cofimar-primary">{h.pond_code}</td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            h.activity === 'PESCA' 
                              ? 'bg-cofimar-success/15 text-cofimar-success border border-cofimar-success/20' 
                              : 'bg-cofimar-warning/15 text-cofimar-warning border border-cofimar-warning/20'
                          }`}>
                            {h.activity}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-cofimar-text">{h.harvest_date}</td>
                        <td className="py-3.5 px-5 text-cofimar-text-muted">{h.sector}</td>
                        <td className="py-3.5 px-5 text-right font-mono text-cofimar-text">{Math.round(h.lbs_farm || 0).toLocaleString()}</td>
                        <td className="py-3.5 px-5 text-right font-mono text-cofimar-text">{Math.round(h.lbs_plant || 0).toLocaleString()}</td>
                        <td className={`py-3.5 px-5 text-right font-mono font-bold ${isSevereMerma ? 'text-cofimar-danger' : 'text-cofimar-accent'}`}>
                          {Math.round(diffLbs).toLocaleString()} lbs
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono text-cofimar-text">{parseFloat(h.gr_farm || 0).toFixed(2)}</td>
                        <td className="py-3.5 px-5 text-right font-mono text-cofimar-text">{parseFloat(h.gr_plant || 0).toFixed(2)}</td>
                        <td className={`py-3.5 px-5 text-right font-mono font-bold ${Math.abs(diffGr) > 0.5 ? 'text-cofimar-danger' : 'text-cofimar-accent'}`}>
                          {diffGr > 0 ? '+' : ''}{diffGr.toFixed(2)} gr
                        </td>
                        <td className="py-3.5 px-5 text-cofimar-text-muted">{h.sector_chief}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-cofimar-panel-bg border-t border-cofimar-border py-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
            <span className="text-cofimar-text-muted">
              Mostrando <span className="text-cofimar-text font-bold">{harvests.length}</span> de <span className="text-cofimar-text font-bold">{total}</span> transacciones
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover border border-cofimar-border disabled:opacity-30 text-cofimar-text-secondary p-1.5 rounded transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-cofimar-text-secondary px-2">
                Pág. <span className="text-cofimar-text font-bold">{page}</span> de <span className="text-cofimar-text font-bold">{pages}</span>
              </span>
              <button
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
                className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover border border-cofimar-border disabled:opacity-30 text-cofimar-text-secondary p-1.5 rounded transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drill-down Harvest Inspection Modal */}
      {selectedHarvest && (() => {
        const diffLbs = parseFloat(selectedHarvest.lbs_plant || 0) - parseFloat(selectedHarvest.lbs_farm || 0);
        const diffGr = parseFloat(selectedHarvest.gr_plant || 0) - parseFloat(selectedHarvest.gr_farm || 0);
        const pctMerma = selectedHarvest.lbs_farm ? (diffLbs / selectedHarvest.lbs_farm) * 100 : 0;
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Blur Backdrop */}
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
              onClick={() => setSelectedHarvest(null)}
            />
            
            {/* Modal Box */}
            <div className="relative bg-cofimar-surface border border-cofimar-border w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300 transform scale-100 animate-in fade-in zoom-in-95">
              {/* Modal Header */}
              <div className="p-6 border-b border-cofimar-border flex items-center justify-between bg-cofimar-surface-secondary">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-cofimar-primary/10 rounded-xl flex items-center justify-center border border-cofimar-primary/20">
                    <Droplet className="w-6 h-6 text-cofimar-primary" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cofimar-primary uppercase tracking-widest font-bold">
                      Control de Calidad (QC) & Pesca
                    </span>
                    <h2 className="text-xl font-bold text-cofimar-text mt-0.5">
                      Piscina: <span className="text-cofimar-primary">{selectedHarvest.pond_code}</span> {selectedHarvest.pond_name ? `(${selectedHarvest.pond_name})` : ''}
                    </h2>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedHarvest(null)}
                  className="bg-cofimar-bg hover:bg-cofimar-surface border border-cofimar-border text-cofimar-text hover:text-cofimar-primary px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
                >
                  CERRAR
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-8 overflow-y-auto flex-1 space-y-6">
                
                {/* Visual Status Indicator Banner */}
                <div className={`p-5 rounded-xl border flex items-center justify-between shadow-sm ${
                  selectedHarvest.activity === 'PESCA' 
                    ? 'bg-cofimar-success/5 border-cofimar-success/20 text-cofimar-success' 
                    : 'bg-cofimar-warning/5 border-cofimar-warning/20 text-cofimar-warning'
                }`}>
                  <div className="flex items-center space-x-3.5">
                    <CheckCircle className="w-5 h-5" />
                    <div>
                      <span className="text-xs font-mono uppercase font-bold tracking-wider">Actividad Registrada</span>
                      <p className="text-sm font-bold mt-0.5">
                        {selectedHarvest.activity === 'PESCA' ? 'PESCA FINAL DE CICLO' : 'RALEO PARCIAL DE MANTENIMIENTO'}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold border px-3 py-1.5 rounded bg-black/10 border-current shadow-sm">
                    FECHA DE REGISTRO: {selectedHarvest.harvest_date}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Admin & Location Details */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-cofimar-text uppercase tracking-wider font-mono flex items-center gap-2 border-b border-cofimar-border pb-2.5">
                      <User className="w-4 h-4 text-cofimar-text-muted" />
                      Información Administrativa
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-cofimar-bg/20 border border-cofimar-border/60 p-5 rounded-xl shadow-sm">
                        <span className="text-[10px] font-mono text-cofimar-text-muted uppercase tracking-wider block">Sector</span>
                        <p className="text-xs font-bold text-cofimar-text mt-1.5">{selectedHarvest.sector || 'N/A'}</p>
                      </div>
                      <div className="bg-cofimar-bg/20 border border-cofimar-border/60 p-5 rounded-xl shadow-sm">
                        <span className="text-[10px] font-mono text-cofimar-text-muted uppercase tracking-wider block">Jefe de Sector</span>
                        <p className="text-xs font-bold text-cofimar-text mt-1.5">{selectedHarvest.sector_chief || 'N/A'}</p>
                      </div>
                      <div className="bg-cofimar-bg/20 border border-cofimar-border/60 p-5 rounded-xl shadow-sm">
                        <span className="text-[10px] font-mono text-cofimar-text-muted uppercase tracking-wider block">Mes / Período</span>
                        <p className="text-xs font-bold text-cofimar-text mt-1.5 font-mono">{selectedHarvest.month || 'N/A'}</p>
                      </div>
                      <div className="bg-cofimar-bg/20 border border-cofimar-border/60 p-5 rounded-xl shadow-sm">
                        <span className="text-[10px] font-mono text-cofimar-text-muted uppercase tracking-wider block">Certificación</span>
                        <p className="text-xs font-bold text-cofimar-text mt-1.5">{selectedHarvest.certification || 'SIN CERTIFICACIÓN'}</p>
                      </div>
                    </div>

                    <div className="bg-cofimar-bg/20 border border-cofimar-border/60 p-4 rounded-xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center space-x-2.5">
                        <Calendar className="w-4 h-4 text-cofimar-primary" />
                        <span className="text-xs text-cofimar-text-secondary">Fecha de Cosecha</span>
                      </div>
                      <span className="text-xs font-bold font-mono text-cofimar-text">{selectedHarvest.harvest_date}</span>
                    </div>
                  </div>

                  {/* Right Column: Weight & QC Metrics */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-cofimar-text uppercase tracking-wider font-mono flex items-center gap-2 border-b border-cofimar-border pb-2.5">
                      <Scale className="w-4 h-4 text-cofimar-text-muted" />
                      Balances de Báscula (Planta vs Campo)
                    </h3>

                    {/* Weight (Lbs) Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-cofimar-bg/20 border border-cofimar-border/60 p-4 rounded-xl text-right shadow-sm">
                        <span className="text-[10px] font-mono text-cofimar-text-muted uppercase block text-left tracking-wider">Lbs Camaronera</span>
                        <span className="text-base font-bold text-cofimar-text font-mono mt-1.5 block">{Math.round(selectedHarvest.lbs_farm || 0).toLocaleString()} lbs</span>
                      </div>
                      <div className="bg-cofimar-bg/20 border border-cofimar-border/60 p-4 rounded-xl text-right shadow-sm">
                        <span className="text-[10px] font-mono text-cofimar-text-muted uppercase block text-left tracking-wider">Lbs Planta (Real)</span>
                        <span className="text-base font-bold text-cofimar-text font-mono mt-1.5 block">{Math.round(selectedHarvest.lbs_plant || 0).toLocaleString()} lbs</span>
                      </div>
                    </div>

                    {/* Weight Loss (Merma) Alert Card */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm ${
                      Math.abs(diffLbs) > 1000 
                        ? 'bg-cofimar-danger/10 border-cofimar-danger/20 text-cofimar-danger' 
                        : 'bg-cofimar-accent/10 border-cofimar-accent/20 text-cofimar-accent'
                    }`}>
                      <div>
                        <span className="text-[10px] font-mono uppercase block font-bold tracking-wider">Merma Registrada (Diferencia)</span>
                        <span className="text-lg font-bold font-mono block mt-1">{Math.round(diffLbs).toLocaleString()} lbs</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase block font-bold tracking-wider">Variación %</span>
                        <span className="text-lg font-bold font-mono block mt-1">{diffLbs > 0 ? '+' : ''}{pctMerma.toFixed(2)}%</span>
                      </div>
                    </div>

                    {/* Gramaje (QC) */}
                    <div className="border border-cofimar-border rounded-xl overflow-hidden shadow-sm bg-cofimar-bg/10">
                      <div className="bg-cofimar-surface-secondary px-4 py-2.5 border-b border-cofimar-border">
                        <span className="text-[10px] font-mono text-cofimar-text-muted uppercase font-bold tracking-wider">Muestreos de Gramaje (QC)</span>
                      </div>
                      <div className="p-5 space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-cofimar-text-secondary">Gramaje Camaronera:</span>
                          <span className="font-mono text-cofimar-text font-bold">{parseFloat(selectedHarvest.gr_farm || 0).toFixed(2)} gr</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-cofimar-text-secondary">Gramaje Planta:</span>
                          <span className="font-mono text-cofimar-text font-bold">{parseFloat(selectedHarvest.gr_plant || 0).toFixed(2)} gr</span>
                        </div>
                        <div className="border-t border-cofimar-border pt-3 flex justify-between text-xs">
                          <span className="text-cofimar-text font-bold">Diferencia de Gramos:</span>
                          <span className={`font-mono font-bold ${Math.abs(diffGr) > 0.5 ? 'text-cofimar-danger' : 'text-cofimar-accent'}`}>
                            {diffGr > 0 ? '+' : ''}{diffGr.toFixed(2)} gr
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extra Stats Indicator */}
                {selectedHarvest.animals && (
                  <div className="bg-cofimar-primary/5 border border-cofimar-primary/20 p-5 rounded-xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-cofimar-primary" />
                      <span className="text-xs text-cofimar-text font-bold">Volumen Estimado de Animales Cosechados</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-cofimar-primary">
                      {parseInt(selectedHarvest.animals).toLocaleString()} camarones
                    </span>
                  </div>
                )}

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Harvests;
