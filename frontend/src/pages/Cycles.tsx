import React, { useEffect, useState } from 'react';
import client, { API_BASE_URL } from '../api/client';
import { 
  Loader2, Search, ArrowUpDown, ChevronLeft, ChevronRight, 
  Download, Eye, X, Compass, CheckCircle2, AlertTriangle, XCircle
} from 'lucide-react';

interface CyclesProps {
  setSelectedPondCode: (code: string) => void;
  setActiveTab: (tab: string) => void;
}

const Cycles: React.FC<CyclesProps> = ({ setSelectedPondCode, setActiveTab }) => {
  // Data State
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit, setLimit] = useState(25);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedAguaje, setSelectedAguaje] = useState('');
  const [selectedCert, setSelectedCert] = useState('');
  const [sortBy, setSortBy] = useState('harvest_date');
  const [sortDir, setSortDir] = useState('desc');

  // Catalogs
  const [sectors, setSectors] = useState<string[]>([]);
  const [aguajes, setAguajes] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);

  // Detail panel
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    client.get('/catalog/sectors').then(res => setSectors(res.data)).catch(console.error);
    client.get('/catalog/aguajes').then(res => setAguajes(res.data)).catch(console.error);
    client.get('/catalog/certifications').then(res => setCertifications(res.data)).catch(console.error);
  }, []);

  const fetchCycles = () => {
    setLoading(true);
    const params: any = { page, limit, sort_by: sortBy, sort_dir: sortDir };
    if (search) params.search = search;
    if (selectedSector) params.sector = selectedSector;
    if (selectedAguaje) params.aguaje = selectedAguaje;
    if (selectedCert) params.certification = selectedCert;

    client.get('/cycles', { params })
      .then(res => {
        setCycles(res.data.data);
        setTotal(res.data.total);
        setPages(res.data.pages);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchCycles(); }, [page, limit, sortBy, sortDir, selectedSector, selectedAguaje, selectedCert]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCycles();
  };

  useEffect(() => {
    if (selectedCycleId === null) { setSelectedCycle(null); return; }
    setLoadingDetail(true);
    client.get(`/cycles/${selectedCycleId}`)
      .then(res => { setSelectedCycle(res.data); setLoadingDetail(false); })
      .catch(err => { console.error(err); setLoadingDetail(false); });
  }, [selectedCycleId]);

  const toggleSort = (field: string) => {
    if (sortBy === field) { setSortDir(sortDir === 'desc' ? 'asc' : 'desc'); }
    else { setSortBy(field); setSortDir('desc'); }
    setPage(1);
  };

  const getExportUrl = (format: 'xlsx' | 'csv') => {
    const params = new URLSearchParams();
    params.append('format', format);
    if (selectedSector) params.append('sector', selectedSector);
    if (selectedAguaje) params.append('aguaje', selectedAguaje);
    if (selectedCert) params.append('certification', selectedCert);
    return `${API_BASE_URL}/cycles/export?${params.toString()}`;
  };

  const selectClass = "bg-cofimar-surface border border-cofimar-border text-cofimar-text text-xs px-3.5 py-2.5 rounded-lg focus:border-cofimar-primary focus:outline-none transition min-w-[130px]";

  return (
    <div className="p-8 space-y-7 relative min-h-screen">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-cofimar-text flex items-center gap-3">
            <Compass className="w-8 h-8 text-cofimar-primary" />
            Ciclos Productivos
          </h1>
          <p className="text-cofimar-text-muted text-sm mt-1">
            Listado general interactivo de ciclos productivos y liquidación de cosechas (BASE 2026).
          </p>
        </div>

        {/* Export */}
        <div className="flex items-center gap-3">
          <a
            href={getExportUrl('csv')}
            className="flex items-center space-x-2 bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover border border-cofimar-border text-cofimar-text-secondary hover:text-cofimar-text px-4 py-2.5 rounded-lg transition font-medium text-xs font-mono"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORTAR CSV</span>
          </a>
          <a
            href={getExportUrl('xlsx')}
            className="flex items-center space-x-2 bg-cofimar-primary/10 hover:bg-cofimar-primary/20 border border-cofimar-primary/30 text-cofimar-primary px-4 py-2.5 rounded-lg transition font-medium text-xs font-mono"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORTAR EXCEL</span>
          </a>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-card p-5 rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center space-x-3 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cofimar-text-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Piscina o Responsable..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-cofimar-surface-secondary border border-cofimar-border text-cofimar-text text-xs pl-10 pr-4 py-2.5 rounded-lg focus:border-cofimar-primary focus:outline-none transition placeholder:text-cofimar-text-faint"
            />
          </div>
          <button 
            type="submit"
            className="bg-cofimar-surface-secondary border border-cofimar-border text-cofimar-text-secondary hover:text-cofimar-text px-4 py-2.5 rounded-lg text-xs font-medium font-mono hover:bg-cofimar-surface-hover transition"
          >
            BUSCAR
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <select value={selectedSector} onChange={(e) => { setSelectedSector(e.target.value); setPage(1); }} className={selectClass}>
            <option value="">SECTORES</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={selectedAguaje} onChange={(e) => { setSelectedAguaje(e.target.value); setPage(1); }} className={selectClass}>
            <option value="">AGUAJES</option>
            {aguajes.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={selectedCert} onChange={(e) => { setSelectedCert(e.target.value); setPage(1); }} className={selectClass}>
            <option value="">CERTIFICACIÓN</option>
            {certifications.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-cofimar-primary animate-spin" />
          <span className="text-cofimar-text-muted font-mono text-xs">Cargando base de ciclos productivos...</span>
        </div>
      ) : (
        <div className="glass-card rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-cofimar-surface-secondary text-cofimar-text-muted font-mono border-b border-cofimar-border">
                <tr>
                  <th className="py-4 px-5">ACCIONES</th>
                  <th className="py-4 px-5 cursor-pointer hover:text-cofimar-text" onClick={() => toggleSort('harvest_date')}>
                    FECHA COSECHA <ArrowUpDown className="w-3 h-3 inline-block ml-1" />
                  </th>
                  <th className="py-4 px-5">PISCINA</th>
                  <th className="py-4 px-5">SECTOR</th>
                  <th className="py-4 px-5 text-right">HAS</th>
                  <th className="py-4 px-5 text-center">CERT.</th>
                  <th className="py-4 px-5 text-right">DÍAS</th>
                  <th className="py-4 px-5 text-right">ANIM. SEMBRADOS</th>
                  <th className="py-4 px-5 text-right">LIBRAS TOTALES</th>
                  <th className="py-4 px-5 text-right" onClick={() => toggleSort('lbs_ha')}>
                    LBS/HA <ArrowUpDown className="w-3 h-3 inline-block ml-1" />
                  </th>
                  <th className="py-4 px-5 text-right" onClick={() => toggleSort('fca')}>
                    FCA <ArrowUpDown className="w-3 h-3 inline-block ml-1" />
                  </th>
                  <th className="py-4 px-5 text-right" onClick={() => toggleSort('survival_pct')}>
                    SOBREVIVENCIA <ArrowUpDown className="w-3 h-3 inline-block ml-1" />
                  </th>
                  <th className="py-4 px-5">JEFE DE SECTOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cofimar-border">
                {cycles.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-10 text-center font-mono text-cofimar-text-muted">
                      No se encontraron ciclos productivos con los filtros especificados.
                    </td>
                  </tr>
                ) : (
                  cycles.map((c) => {
                    const lbs = parseFloat(c.lbs_ha || 0);
                    let rowColor = 'hover:bg-cofimar-surface-secondary';
                    if (lbs >= 7000) rowColor = 'bg-cofimar-success/5 hover:bg-cofimar-success/10 border-l-2 border-l-cofimar-success';
                    else if (lbs < 4000) rowColor = 'bg-cofimar-danger/5 hover:bg-cofimar-danger/10 border-l-2 border-l-cofimar-danger';
                    else if (lbs >= 4000) rowColor = 'bg-cofimar-warning/5 hover:bg-cofimar-warning/10 border-l-2 border-l-cofimar-warning';

                    return (
                      <tr key={c.id} className={`${rowColor} transition`}>
                        <td className="py-3 px-5">
                          <button
                            onClick={() => setSelectedCycleId(c.id)}
                            className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover border border-cofimar-border text-cofimar-text-secondary p-1.5 rounded-lg flex items-center justify-center transition"
                            title="Ver detalles"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="py-3 px-5 font-mono text-cofimar-text">{c.harvest_date}</td>
                        <td 
                          className="py-3 px-5 font-mono font-bold text-cofimar-primary cursor-pointer hover:underline"
                          onClick={() => { setSelectedPondCode(c.pond_code); setActiveTab('pondDetail'); }}
                        >
                          {c.pond_code}
                        </td>
                        <td className="py-3 px-5 text-cofimar-text-muted">{c.sector}</td>
                        <td className="py-3 px-5 text-right font-mono text-cofimar-text">{parseFloat(c.hectares || 0).toFixed(2)}</td>
                        <td className="py-3 px-5 text-center">
                          <span className="bg-cofimar-badge-bg px-2 py-0.5 rounded text-[10px] font-mono text-cofimar-badge-text font-bold border border-cofimar-border">
                            {c.certification}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-right font-mono text-cofimar-text">{c.days}</td>
                        <td className="py-3 px-5 text-right font-mono text-cofimar-text">{parseInt(c.animals_seeded || 0).toLocaleString()}</td>
                        <td className="py-3 px-5 text-right font-mono text-cofimar-text">{Math.round(c.total_lbs || 0).toLocaleString()}</td>
                        <td className="py-3 px-5 text-right font-mono font-bold text-cofimar-text">{Math.round(c.lbs_ha || 0).toLocaleString()}</td>
                        <td className="py-3 px-5 text-right font-mono text-cofimar-text">{parseFloat(c.fca || 0).toFixed(2)}</td>
                        <td className="py-3 px-5 text-right font-mono text-cofimar-text">{parseFloat(c.survival_pct || 0).toFixed(1)}%</td>
                        <td className="py-3 px-5 text-cofimar-text-muted">{c.sector_chief}</td>
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
              Mostrando <span className="text-cofimar-text font-bold">{cycles.length}</span> de <span className="text-cofimar-text font-bold">{total}</span> ciclos
            </span>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="text-cofimar-text-muted">Filas por página:</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                  className="bg-cofimar-surface border border-cofimar-border text-cofimar-text px-2 py-1 rounded focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

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
        </div>
      )}

      {/* Detail Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[500px] md:w-[650px] bg-cofimar-surface border-l border-cofimar-border shadow-2xl transition-transform duration-300 transform ${
        selectedCycleId !== null ? 'translate-x-0' : 'translate-x-full'
      } z-50 overflow-y-auto`}>
        {selectedCycleId !== null && (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-cofimar-border pb-4">
              <div>
                <span className="text-[10px] font-mono text-cofimar-primary font-bold tracking-wider uppercase">Detalle Ciclo Productivo</span>
                <h2 className="text-xl font-display font-bold text-cofimar-text mt-1">Piscina: {selectedCycle?.pond_code || '...'}</h2>
              </div>
              <button
                onClick={() => setSelectedCycleId(null)}
                className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-text-muted hover:text-cofimar-text p-2 rounded-lg border border-cofimar-border transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cofimar-primary animate-spin" />
              </div>
            ) : selectedCycle && (
              <div className="space-y-6 text-sm">
                
                {/* Section 1 */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold tracking-wider text-cofimar-primary uppercase border-b border-cofimar-border pb-1">
                    1. Identificadores & Tiempos
                  </h4>
                  <div className="grid grid-cols-2 gap-3.5 bg-cofimar-surface-secondary p-3.5 rounded-lg border border-cofimar-border">
                    <div><span className="text-[10px] text-cofimar-text-muted block">ID Ciclo</span><span className="font-mono text-cofimar-text">{selectedCycle.id}</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Fecha Cosecha</span><span className="font-mono text-cofimar-text">{selectedCycle.harvest_date}</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Marea (Aguaje)</span><span className="font-mono text-cofimar-text">{selectedCycle.aguaje}</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Mes / Año</span><span className="font-mono text-cofimar-text">{selectedCycle.month} {selectedCycle.year}</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Hectáreas (HAS)</span><span className="font-mono text-cofimar-text">{parseFloat(selectedCycle.hectares).toFixed(2)} ha</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Días del Ciclo</span><span className="font-mono text-cofimar-text">{selectedCycle.days} días</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Fecha de Siembra</span><span className="font-mono text-cofimar-text">{selectedCycle.seeding_date || 'N/A'}</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Días Secos Piscina</span><span className="font-mono text-cofimar-text">{selectedCycle.dry_days} días</span></div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold tracking-wider text-cofimar-primary uppercase border-b border-cofimar-border pb-1">
                    2. Siembra & Origen Larva
                  </h4>
                  <div className="grid grid-cols-2 gap-3.5 bg-cofimar-surface-secondary p-3.5 rounded-lg border border-cofimar-border">
                    <div><span className="text-[10px] text-cofimar-text-muted block">Animales Sembrados</span><span className="font-mono text-cofimar-text">{parseInt(selectedCycle.animals_seeded).toLocaleString()}</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Densidad / ha</span><span className="font-mono text-cofimar-text">{parseInt(selectedCycle.density_ha).toLocaleString()}</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Densidad / m²</span><span className="font-mono text-cofimar-text">{parseFloat(selectedCycle.density_m2).toFixed(2)} / m²</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Pre-Criadero</span><span className="font-mono text-cofimar-text">{selectedCycle.pre || 'DIRECTA'}</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Peso de Siembra</span><span className="font-mono text-cofimar-text">{parseFloat(selectedCycle.seeding_weight).toFixed(3)} gr</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Laboratorio Larva</span><span className="font-mono text-cofimar-text truncate block" title={selectedCycle.laboratory}>{selectedCycle.laboratory || 'N/A'}</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Nauplio</span><span className="font-mono text-cofimar-text truncate block" title={selectedCycle.nauplio}>{selectedCycle.nauplio || 'N/A'}</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Tipo Siembra</span><span className="bg-cofimar-badge-bg px-2 py-0.5 rounded text-[10px] font-mono text-cofimar-badge-text">{selectedCycle.seeding_type}</span></div>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold tracking-wider text-cofimar-primary uppercase border-b border-cofimar-border pb-1">
                    3. Sección Raleos (Cosecha Parcial)
                  </h4>
                  <div className="grid grid-cols-2 gap-3.5 bg-cofimar-surface-secondary p-3.5 rounded-lg border border-cofimar-border">
                    <div><span className="text-[10px] text-cofimar-text-muted block">Libras Raleo Camaronera</span><span className="font-mono text-cofimar-text">{Math.round(selectedCycle.lbs_trawl_farm).toLocaleString()} lbs</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Libras Raleo Planta</span><span className="font-mono text-cofimar-text">{Math.round(selectedCycle.lbs_trawl_plant).toLocaleString()} lbs</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Gramaje Camaronera</span><span className="font-mono text-cofimar-text">{parseFloat(selectedCycle.gr_trawl_farm).toFixed(2)} gr</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Gramaje Planta</span><span className="font-mono text-cofimar-text">{parseFloat(selectedCycle.gr_trawl_plant).toFixed(2)} gr</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">LBS/HA Raleo</span><span className="font-mono text-cofimar-text">{Math.round(selectedCycle.lbs_ha_trawl).toLocaleString()} lbs/ha</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Camarones Raleados</span><span className="font-mono text-cofimar-text">{parseInt(selectedCycle.animals_trawl || 0).toLocaleString()}</span></div>
                  </div>
                </div>

                {/* Section 4 */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold tracking-wider text-cofimar-primary uppercase border-b border-cofimar-border pb-1">
                    4. Sección Liquidación (Cosecha Pesca Final)
                  </h4>
                  <div className="grid grid-cols-2 gap-3.5 bg-cofimar-surface-secondary p-3.5 rounded-lg border border-cofimar-border">
                    <div><span className="text-[10px] text-cofimar-text-muted block">Libras Camaronera</span><span className="font-mono text-cofimar-text">{Math.round(selectedCycle.lbs_harvest_farm).toLocaleString()} lbs</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Libras Planta Cosecha</span><span className="font-mono text-cofimar-text">{Math.round(selectedCycle.lbs_harvest_plant).toLocaleString()} lbs</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Gramaje Camaronera</span><span className="font-mono text-cofimar-text">{parseFloat(selectedCycle.gr_harvest_farm).toFixed(2)} gr</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Gramaje Planta Cosecha</span><span className="font-mono text-cofimar-text">{parseFloat(selectedCycle.gr_harvest_plant).toFixed(2)} gr</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">LBS/HA Pesca</span><span className="font-mono text-cofimar-text">{Math.round(selectedCycle.lbs_ha_harvest).toLocaleString()} lbs/ha</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Camarones Cosechados</span><span className="font-mono text-cofimar-text">{parseInt(selectedCycle.animals_harvest || 0).toLocaleString()}</span></div>
                  </div>
                </div>

                {/* Section 5 */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold tracking-wider text-cofimar-primary uppercase border-b border-cofimar-border pb-1">
                    5. Resultados Consolidados & KPIs
                  </h4>
                  <div className="grid grid-cols-2 gap-3.5 bg-cofimar-surface-secondary p-3.5 rounded-lg border border-cofimar-border">
                    <div><span className="text-[10px] text-cofimar-text-muted block">Libras Totales (Raleo+Pesca)</span><span className="font-mono text-cofimar-text font-bold">{Math.round(selectedCycle.total_lbs).toLocaleString()} lbs</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Camarones Totales</span><span className="font-mono text-cofimar-text">{parseInt(selectedCycle.total_animals).toLocaleString()}</span></div>
                    <div>
                      <span className="text-[10px] text-cofimar-primary block font-bold">Rendimiento (LBS/HA)</span>
                      <span className={`font-mono text-base font-bold ${
                        selectedCycle.lbs_ha >= 7000 ? 'text-cofimar-success' : selectedCycle.lbs_ha < 4000 ? 'text-cofimar-danger' : 'text-cofimar-warning'
                      }`}>{Math.round(selectedCycle.lbs_ha).toLocaleString()} lbs/ha</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cofimar-primary block font-bold">Conversión Alimento (FCA)</span>
                      <span className={`font-mono text-base font-bold ${
                        selectedCycle.fca < 1.35 ? 'text-cofimar-success' : selectedCycle.fca > 1.70 ? 'text-cofimar-danger' : 'text-cofimar-warning'
                      }`}>{parseFloat(selectedCycle.fca).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cofimar-text-secondary block font-bold">Sobrevivencia %</span>
                      <span className={`font-mono text-base font-bold ${
                        selectedCycle.survival_pct >= 70 ? 'text-cofimar-success' : selectedCycle.survival_pct < 50 ? 'text-cofimar-danger' : 'text-cofimar-warning'
                      }`}>{parseFloat(selectedCycle.survival_pct).toFixed(1)}%</span>
                    </div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Balanceado Consumido</span><span className="font-mono text-cofimar-text">{Math.round(selectedCycle.feed_lbs).toLocaleString()} lbs</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">LBS/HA/DIA</span><span className="font-mono text-cofimar-text">{parseFloat(selectedCycle.lbs_ha_day).toFixed(2)} lbs/ha/dia</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">KG Alim/HA/DIA</span><span className="font-mono text-cofimar-text">{parseFloat(selectedCycle.kg_ha).toFixed(2)} kg/ha/dia</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Incremento Semanal (Gramos)</span><span className="font-mono text-cofimar-text">{parseFloat(selectedCycle.weekly_increment).toFixed(2)} gr/sem</span></div>
                    <div><span className="text-[10px] text-cofimar-text-muted block">Certificación Orgánica</span><span className="font-mono text-cofimar-text font-bold">{selectedCycle.certification}</span></div>
                  </div>
                </div>

                {/* Section 6 */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold tracking-wider text-cofimar-primary uppercase border-b border-cofimar-border pb-1">
                    6. Diferencias & Control de Calidad (QC)
                  </h4>
                  <div className="grid grid-cols-2 gap-3.5 bg-cofimar-surface-secondary p-3.5 rounded-lg border border-cofimar-border">
                    <div>
                      <span className="text-[10px] text-cofimar-text-muted block">Diferencia Raleo (LBS)</span>
                      <span className={`font-mono ${Math.abs(selectedCycle.diff_trawl_lbs) > 500 ? 'text-cofimar-danger font-bold' : 'text-cofimar-text-secondary'}`}>
                        {Math.round(selectedCycle.diff_trawl_lbs).toLocaleString()} lbs
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cofimar-text-muted block">Diferencia Pesca (LBS)</span>
                      <span className={`font-mono ${Math.abs(selectedCycle.diff_harvest_lbs) > 500 ? 'text-cofimar-danger font-bold' : 'text-cofimar-text-secondary'}`}>
                        {Math.round(selectedCycle.diff_harvest_lbs).toLocaleString()} lbs
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cofimar-text-muted block">Diferencia Raleo Gramaje</span>
                      <span className={`font-mono ${Math.abs(selectedCycle.diff_trawl_gr) > 2 ? 'text-cofimar-danger font-bold' : 'text-cofimar-text-secondary'}`}>
                        {parseFloat(selectedCycle.diff_trawl_gr).toFixed(2)} gr
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cofimar-text-muted block">Diferencia Cosecha Gramaje</span>
                      <span className={`font-mono ${Math.abs(selectedCycle.diff_harvest_gr) > 2 ? 'text-cofimar-danger font-bold' : 'text-cofimar-text-secondary'}`}>
                        {parseFloat(selectedCycle.diff_harvest_gr).toFixed(2)} gr
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cofimar-text-muted block">Jefe de Sector</span>
                      <span className="font-mono text-cofimar-text font-bold">{selectedCycle.sector_chief}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cycles;
