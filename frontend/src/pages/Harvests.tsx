import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { 
  Loader2, Search, ArrowUpDown, ChevronLeft, ChevronRight, 
  Droplet, CheckCircle, AlertTriangle, Scale
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
  const [sectors, setSectors] = useState<string[]>([]);
  
  const [avgDiffLbs, setAvgDiffLbs] = useState(0);
  const [maxDiffLbs, setMaxDiffLbs] = useState(0);

  useEffect(() => {
    client.get('/catalog/sectors').then(res => setSectors(res.data)).catch(console.error);
  }, []);

  const fetchHarvests = () => {
    setLoading(true);
    const params: any = { page, limit };
    if (search) params.pond_code = search;
    if (selectedActivity) params.activity = selectedActivity;
    if (selectedSector) params.sector = selectedSector;

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

  useEffect(() => { fetchHarvests(); }, [page, limit, selectedActivity, selectedSector]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHarvests();
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
          Registro detallado de transacciones de pesca/raleos con control de mermas y calidad planta vs camaronera (COSECHAS).
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
      <div className="glass-card p-5 rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center space-x-3 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cofimar-text-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código de piscina..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-cofimar-surface-secondary border border-cofimar-border text-cofimar-text text-xs pl-10 pr-4 py-2.5 rounded-lg focus:border-cofimar-primary focus:outline-none transition placeholder:text-cofimar-text-faint"
            />
          </div>
          <button 
            type="submit"
            className="bg-cofimar-surface-secondary border border-cofimar-border text-cofimar-text-secondary hover:text-cofimar-text px-4 py-2.5 rounded-lg text-xs font-medium font-mono hover:bg-cofimar-surface-hover transition"
          >
            FILTRAR
          </button>
        </form>

        <div className="flex items-center gap-3">
          <select value={selectedActivity} onChange={(e) => { setSelectedActivity(e.target.value); setPage(1); }} className={selectClass}>
            <option value="">ACTIVIDAD</option>
            <option value="PESCA">PESCA (FINAL)</option>
            <option value="RALEO">RALEO (PARCIAL)</option>
          </select>
          <select value={selectedSector} onChange={(e) => { setSelectedSector(e.target.value); setPage(1); }} className={selectClass}>
            <option value="">SECTOR</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
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
                      <tr key={idx} className="hover:bg-cofimar-surface-secondary transition">
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
    </div>
  );
};

export default Harvests;
