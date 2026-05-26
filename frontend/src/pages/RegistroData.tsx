import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  Layers, Anchor, Fish, Plus, AlertTriangle, RefreshCw, CheckCircle2, Filter, Save 
} from 'lucide-react';

// Subcomponents
import { PondsTab } from '../components/registro/PondsTab';
import { SeedingsTab } from '../components/registro/SeedingsTab';
import { HarvestsTab } from '../components/registro/HarvestsTab';
import { CyclesTab } from '../components/registro/CyclesTab';
import { CrudModal } from '../components/registro/CrudModal';

interface RegistroDataProps {
  role: 'admin' | 'viewer';
}

const RegistroData: React.FC<RegistroDataProps> = ({ role }) => {
  const [activeTab, setActiveTab] = useState<'ponds' | 'seedings' | 'harvests' | 'cycles' | 'closed_cycles'>('ponds');
  
  // Data lists
  const [ponds, setPonds] = useState<any[]>([]);
  const [harvests, setHarvests] = useState<any[]>([]);
  const [seedings, setSeedings] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters State
  const [selectedPondFilter, setSelectedPondFilter] = useState<string>('');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('');

  // Excel Mode (Inline Edit) State
  const [isExcelMode, setIsExcelMode] = useState<boolean>(false);
  const [editedRows, setEditedRows] = useState<Record<string, any>>({});

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null); // For harvests/seedings ID or ponds code
  const [presetHarvestForm, setPresetHarvestForm] = useState<any>(null);

  // Catalogs
  const [allPondsCatalog, setAllPondsCatalog] = useState<any[]>([]);

  const loadPondsCatalog = async () => {
    try {
      const res = await client.get('/ponds');
      setAllPondsCatalog(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'ponds') {
        const res = await client.get('/ponds');
        setPonds(res.data);
      } else if (activeTab === 'harvests') {
        const res = await client.get('/harvests', { params: { limit: 100 } });
        setHarvests(res.data.data || []);
      } else if (activeTab === 'seedings') {
        const res = await client.get('/seedings');
        setSeedings(res.data);
      } else if (activeTab === 'cycles') {
        const res = await client.get('/cycles', { params: { limit: 100, is_closed: false } });
        setCycles(res.data.data || []);
      } else if (activeTab === 'closed_cycles') {
        const res = await client.get('/cycles', { params: { limit: 100, is_closed: true } });
        setCycles(res.data.data || []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Error al cargar la información desde el servidor API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setIsExcelMode(false);
    setEditedRows({});
  }, [activeTab]);

  useEffect(() => {
    loadPondsCatalog();
  }, []);

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditMode(false);
    setSelectedId(null);
    setPresetHarvestForm(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleRegisterHarvestForCycle = (pondCode: string) => {
    const matchedPond = allPondsCatalog.find(
      p => p.code.trim().toUpperCase() === pondCode.trim().toUpperCase()
    );
    const finalCode = matchedPond ? matchedPond.code : pondCode;
    const finalChief = matchedPond ? matchedPond.sector_chief || '' : '';
    const finalCert = matchedPond ? matchedPond.certification || 'ASC' : 'ASC';

    setPresetHarvestForm({
      pond_code: finalCode,
      activity: 'RALEO',
      harvest_date: new Date().toISOString().split('T')[0],
      lbs_farm: 0,
      lbs_plant: 0,
      gr_farm: 0,
      gr_plant: 0,
      sector_chief: finalChief,
      certification: finalCert,
      feed_lbs: 0,
      feed_supplier: '',
      feeding_mode: 'AUTOMATICA'
    });

    setEditMode(false);
    setSelectedId(null);
    setError(null);
    setActiveTab('harvests');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditMode(true);
    setPresetHarvestForm(null);
    setError(null);
    
    if (activeTab === 'ponds') {
      setSelectedId(item.code);
    } else {
      setSelectedId(item.id);
    }
    
    setIsModalOpen(true);
  };

  const handleDelete = async (idOrCode: any) => {
    if (!window.confirm('¿Está seguro de eliminar este registro permanentemente?')) return;
    
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'ponds') {
        await client.delete(`/ponds/${idOrCode}`);
        showToast('Piscina eliminada correctamente.');
      } else if (activeTab === 'harvests') {
        await client.delete(`/harvests/${idOrCode}`);
        showToast('Transacción de cosecha eliminada correctamente.');
      } else if (activeTab === 'seedings') {
        await client.delete(`/seedings/${idOrCode}`);
        showToast('Siembra eliminada correctamente.');
      } else if (activeTab === 'cycles' || activeTab === 'closed_cycles') {
        await client.delete(`/cycles/${idOrCode}`);
        showToast('Ciclo productivo eliminado correctamente.');
      }
      fetchData();
      loadPondsCatalog();
    } catch (err: any) {
      console.error(err);
      setError('No se pudo eliminar el registro. Verifique que no tenga dependencias activas.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (msg: string) => {
    showToast(msg);
    fetchData();
    loadPondsCatalog();
  };

  // unique sectors list for filter
  const uniqueSectors = Array.from(
    new Set(allPondsCatalog.map(p => p.sector).filter(Boolean))
  ).map((s: any) => s.toUpperCase());

  // Filter lists based on selectedPondFilter and selectedSectorFilter
  const filteredPonds = ponds.filter(p => {
    const matchesPond = !selectedPondFilter || p.code === selectedPondFilter;
    const matchesSector = !selectedSectorFilter || (p.sector && p.sector.toUpperCase() === selectedSectorFilter.toUpperCase());
    return matchesPond && matchesSector;
  });

  const filteredSeedings = seedings.filter(s => {
    const matchesPond = !selectedPondFilter || s.pond_code === selectedPondFilter;
    const pondInCatalog = allPondsCatalog.find(p => p.code === s.pond_code);
    const matchesSector = !selectedSectorFilter || (pondInCatalog && pondInCatalog.sector && pondInCatalog.sector.toUpperCase() === selectedSectorFilter.toUpperCase());
    return matchesPond && matchesSector;
  });

  const filteredHarvests = harvests.filter(h => {
    const matchesPond = !selectedPondFilter || h.pond_code === selectedPondFilter;
    const pondInCatalog = allPondsCatalog.find(p => p.code === h.pond_code);
    const matchesSector = !selectedSectorFilter || (pondInCatalog && pondInCatalog.sector && pondInCatalog.sector.toUpperCase() === selectedSectorFilter.toUpperCase());
    return matchesPond && matchesSector;
  });

  const filteredCycles = cycles.filter(c => {
    const matchesPond = !selectedPondFilter || c.pond_code === selectedPondFilter;
    const matchesSector = !selectedSectorFilter || (c.sector && c.sector.toUpperCase() === selectedSectorFilter.toUpperCase());
    return matchesPond && matchesSector;
  });

  const handleRowChange = (idOrCode: string, field: string, value: any) => {
    setEditedRows(prev => {
      const rowUpdates = prev[idOrCode] || {};
      return {
        ...prev,
        [idOrCode]: {
          ...rowUpdates,
          [field]: value
        }
      };
    });
  };

  const handleSaveExcelChanges = async () => {
    setLoading(true);
    setError(null);
    try {
      const keys = Object.keys(editedRows);
      
      // Perform updates concurrently
      await Promise.all(
        keys.map(async (key) => {
          const updates = editedRows[key];
          
          if (activeTab === 'ponds') {
            const currentItem = ponds.find(p => p.code === key);
            const payload = {
              code: key,
              sector: updates.sector !== undefined ? updates.sector : currentItem?.sector,
              hectares: updates.hectares !== undefined ? parseFloat(updates.hectares) : parseFloat(currentItem?.hectares || 0),
              certification: updates.certification !== undefined ? updates.certification : currentItem?.certification,
              sector_chief: updates.sector_chief !== undefined ? updates.sector_chief : currentItem?.sector_chief
            };
            await client.put(`/ponds/${key}`, payload);
          } else if (activeTab === 'harvests') {
            const currentItem = harvests.find(h => h.id === parseInt(key));
            const payload = {
              pond_code: updates.pond_code !== undefined ? updates.pond_code : currentItem?.pond_code,
              activity: updates.activity !== undefined ? updates.activity : currentItem?.activity,
              harvest_date: updates.harvest_date !== undefined ? updates.harvest_date : currentItem?.harvest_date,
              lbs_farm: updates.lbs_farm !== undefined ? parseFloat(updates.lbs_farm) : parseFloat(currentItem?.lbs_farm || 0),
              lbs_plant: updates.lbs_plant !== undefined ? parseFloat(updates.lbs_plant) : parseFloat(currentItem?.lbs_plant || 0),
              gr_farm: updates.gr_farm !== undefined ? parseFloat(updates.gr_farm) : parseFloat(currentItem?.gr_farm || 0),
              gr_plant: updates.gr_plant !== undefined ? parseFloat(updates.gr_plant) : parseFloat(currentItem?.gr_plant || 0),
              sector_chief: updates.sector_chief !== undefined ? updates.sector_chief : currentItem?.sector_chief,
              certification: updates.certification !== undefined ? updates.certification : currentItem?.certification,
              feed_lbs: updates.feed_lbs !== undefined ? parseFloat(updates.feed_lbs) : parseFloat(currentItem?.feed_lbs || 0),
              feed_supplier: updates.feed_supplier !== undefined ? updates.feed_supplier : currentItem?.feed_supplier,
              feeding_mode: updates.feeding_mode !== undefined ? updates.feeding_mode : currentItem?.feeding_mode
            };
            await client.put(`/harvests/${key}`, payload);
          } else if (activeTab === 'seedings') {
            const currentItem = seedings.find(s => s.id === parseInt(key));
            const payload = {
              pond_code: updates.pond_code !== undefined ? updates.pond_code : currentItem?.pond_code,
              aguaje: updates.aguaje !== undefined ? updates.aguaje : currentItem?.aguaje,
              seeding_date: updates.seeding_date !== undefined ? updates.seeding_date : currentItem?.seeding_date,
              transfer_date: updates.transfer_date !== undefined ? updates.transfer_date : currentItem?.transfer_date,
              animals: updates.animals !== undefined ? parseInt(updates.animals) : parseInt(currentItem?.animals || 0),
              ablation: updates.ablation !== undefined ? updates.ablation : currentItem?.ablation,
              nauplio: updates.nauplio !== undefined ? updates.nauplio : currentItem?.nauplio,
              laboratory: updates.laboratory !== undefined ? updates.laboratory : currentItem?.laboratory,
              survival_pct: updates.survival_pct !== undefined ? parseFloat(updates.survival_pct) : parseFloat(currentItem?.survival_pct || 0),
              pre_criadero: updates.pre_criadero !== undefined ? updates.pre_criadero : currentItem?.pre_criadero,
              weight_gr: updates.weight_gr !== undefined ? parseFloat(updates.weight_gr) : parseFloat(currentItem?.weight_gr || 0.05),
              dry_days: updates.dry_days !== undefined ? parseInt(updates.dry_days) : parseInt(currentItem?.dry_days || 0)
            };
            await client.put(`/seedings/${key}`, payload);
          } else if (activeTab === 'cycles' || activeTab === 'closed_cycles') {
            const currentItem = cycles.find(c => c.id === parseInt(key));
            const payload = {
              pond_code: currentItem?.pond_code,
              aguaje: updates.aguaje !== undefined ? updates.aguaje : currentItem?.aguaje,
              harvest_date: updates.harvest_date !== undefined ? updates.harvest_date : currentItem?.harvest_date,
              hectares: updates.hectares !== undefined ? parseFloat(updates.hectares) : parseFloat(currentItem?.hectares || 0),
              total_lbs: updates.total_lbs !== undefined ? parseFloat(updates.total_lbs) : parseFloat(currentItem?.total_lbs || 0),
              lbs_ha: updates.lbs_ha !== undefined ? parseFloat(updates.lbs_ha) : parseFloat(currentItem?.lbs_ha || 0),
              survival_pct: updates.survival_pct !== undefined ? parseFloat(updates.survival_pct) : parseFloat(currentItem?.survival_pct || 0),
              feed_lbs: updates.feed_lbs !== undefined ? parseFloat(updates.feed_lbs) : parseFloat(currentItem?.feed_lbs || 0),
              fca: updates.fca !== undefined ? parseFloat(updates.fca) : parseFloat(currentItem?.fca || 0),
              is_closed: currentItem?.is_closed
            };
            await client.put(`/cycles/${key}`, payload);
          }
        })
      );
      
      showToast(`¡Cambios guardados correctamente en ${keys.length} registro(s)!`);
      setEditedRows({});
      setIsExcelMode(false);
      fetchData();
      loadPondsCatalog();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Error al guardar los cambios en lote. Verifique que los campos obligatorios sean correctos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-7 max-w-7xl pt-4">
      {/* Action Header */}
      <div className="flex justify-end">
        {role === 'admin' && activeTab !== 'cycles' && activeTab !== 'closed_cycles' ? (
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center space-x-2 bg-cofimar-surface-active hover:opacity-95 text-cofimar-surface-active-text font-semibold px-6 py-2.5 rounded-lg shadow-sm text-xs font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>AGREGAR {activeTab === 'ponds' ? 'PISCINA' : activeTab === 'seedings' ? 'SIEMBRA' : 'COSECHA'}</span>
          </button>
        ) : role === 'admin' ? (
          <div className="bg-cofimar-primary/10 border border-cofimar-primary/20 text-cofimar-primary text-[10px] font-mono px-3.5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm">
            <span>LOS CICLOS SE INICIAN Y CIERRAN DE FORMA AUTOMÁTICA DESDE SIEMBRAS Y COSECHAS</span>
          </div>
        ) : (
          <div className="bg-cofimar-accent/10 border border-cofimar-accent/20 text-cofimar-accent text-[10px] font-mono px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
            <span>MODO SOLO LECTURA</span>
          </div>
        )}
      </div>

      {/* Toast Success Message */}
      {successMsg && (
        <div className="bg-cofimar-success/15 border border-cofimar-success/30 p-4 rounded-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-cofimar-success" />
          <span className="text-sm font-medium text-cofimar-text">{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-cofimar-border/60 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab('ponds')}
          className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-mono text-sm font-bold transition duration-200 ${
            activeTab === 'ponds' 
              ? 'border-cofimar-primary text-cofimar-primary bg-cofimar-primary/5' 
              : 'border-transparent text-cofimar-text-muted hover:text-cofimar-text'
          }`}
        >
          <Anchor className="w-4 h-4" />
          <span>1. PISCINAS (DATOS)</span>
        </button>
        <button
          onClick={() => setActiveTab('seedings')}
          className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-mono text-sm font-bold transition duration-200 ${
            activeTab === 'seedings' 
              ? 'border-cofimar-primary text-cofimar-primary bg-cofimar-primary/5' 
              : 'border-transparent text-cofimar-text-muted hover:text-cofimar-text'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. HISTORIAL SIEMBRAS</span>
        </button>
        <button
          onClick={() => setActiveTab('harvests')}
          className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-mono text-sm font-bold transition duration-200 ${
            activeTab === 'harvests' 
              ? 'border-cofimar-primary text-cofimar-primary bg-cofimar-primary/5' 
              : 'border-transparent text-cofimar-text-muted hover:text-cofimar-text'
          }`}
        >
          <Fish className="w-4 h-4" />
          <span>3. COSECHAS & QC</span>
        </button>
        <button
          onClick={() => setActiveTab('cycles')}
          className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-mono text-sm font-bold transition duration-200 ${
            activeTab === 'cycles' 
              ? 'border-cofimar-primary text-cofimar-primary bg-cofimar-primary/5' 
              : 'border-transparent text-cofimar-text-muted hover:text-cofimar-text'
          }`}
        >
          <Layers className="w-4 h-4 text-cofimar-accent" />
          <span>4. CICLOS PRODUCTIVOS (ACTIVOS)</span>
        </button>
        <button
          onClick={() => setActiveTab('closed_cycles')}
          className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-mono text-sm font-bold transition duration-200 ${
            activeTab === 'closed_cycles' 
              ? 'border-cofimar-primary text-cofimar-primary bg-cofimar-primary/5' 
              : 'border-transparent text-cofimar-text-muted hover:text-cofimar-text'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-cofimar-success" />
          <span>5. CICLOS COSECHADOS (CERRADOS)</span>
        </button>
      </div>

      {/* Advanced Filters & Excel Toggle Panel */}
      <div className="glass-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-cofimar-border/50 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-cofimar-primary/10 rounded-xl flex items-center justify-center border border-cofimar-primary/25 shadow-sm">
            <Filter className="w-4.5 h-4.5 text-cofimar-primary" />
          </div>
          <div>
            <h4 className="text-sm font-display font-bold text-cofimar-text">Filtros de Búsqueda</h4>
            <p className="text-[10px] text-cofimar-text-muted font-mono">Filtra registros y activa el Modo Excel de edición rápida</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 flex-1 justify-end">
          {/* Pond Filter */}
          <div className="flex flex-col min-w-[160px]">
            <span className="text-[9px] font-mono text-cofimar-text-muted uppercase tracking-wider mb-1">Filtrar Piscina</span>
            <select
              value={selectedPondFilter}
              onChange={(e) => setSelectedPondFilter(e.target.value)}
              className="bg-cofimar-surface-secondary border border-cofimar-border text-cofimar-text text-xs px-3.5 py-2 rounded-lg focus:border-cofimar-primary focus:outline-none transition shadow-sm font-mono"
            >
              <option value="">TODAS LAS PISCINAS</option>
              {allPondsCatalog.map(p => (
                <option key={p.code} value={p.code}>{p.code}</option>
              ))}
            </select>
          </div>

          {/* Sector Filter */}
          <div className="flex flex-col min-w-[160px]">
            <span className="text-[9px] font-mono text-cofimar-text-muted uppercase tracking-wider mb-1">Filtrar Sector</span>
            <select
              value={selectedSectorFilter}
              onChange={(e) => setSelectedSectorFilter(e.target.value)}
              className="bg-cofimar-surface-secondary border border-cofimar-border text-cofimar-text text-xs px-3.5 py-2 rounded-lg focus:border-cofimar-primary focus:outline-none transition shadow-sm font-mono"
            >
              <option value="">TODOS LOS SECTORES</option>
              {uniqueSectors.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(selectedPondFilter || selectedSectorFilter) && (
            <div className="flex items-end h-[38px] mt-4 md:mt-0">
              <button
                onClick={() => {
                  setSelectedPondFilter('');
                  setSelectedSectorFilter('');
                }}
                className="flex items-center justify-center space-x-1.5 bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover border border-cofimar-border text-cofimar-text-muted hover:text-cofimar-text px-3.5 h-[36px] rounded-lg transition duration-150 text-xs font-mono shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>LIMPIAR</span>
              </button>
            </div>
          )}

          {/* Excel Mode Switch Button */}
          {role === 'admin' && (
            <div className="flex items-center gap-3 pl-4 border-l border-cofimar-border/60 h-10 mt-4 md:mt-0">
              <button
                onClick={() => {
                  setIsExcelMode(!isExcelMode);
                  setEditedRows({}); // Reset changes on toggle
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-mono text-xs font-bold transition duration-200 shadow-sm ${
                  isExcelMode
                    ? 'bg-cofimar-success/15 border-cofimar-success text-cofimar-success shadow-success/10'
                    : 'bg-cofimar-surface-secondary border-cofimar-border text-cofimar-text-muted hover:text-cofimar-text'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isExcelMode ? 'bg-cofimar-success animate-pulse' : 'bg-cofimar-text-muted'}`} />
                <span>{isExcelMode ? 'MODO EXCEL ACTIVO 📊' : 'ACTIVAR MODO EXCEL 📊'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CRUD Tables Container */}
      <div className="glass-card rounded-2xl border border-cofimar-border/50 shadow-xl overflow-hidden">
        {loading && !isExcelMode && (
          <div className="p-16 flex items-center justify-center space-x-3 text-cofimar-text-muted font-mono text-sm">
            <RefreshCw className="w-5 h-5 animate-spin text-cofimar-primary" />
            <span>Cargando registros...</span>
          </div>
        )}
        
        {(!loading || isExcelMode) && (
          <div className="overflow-x-auto">
            {activeTab === 'ponds' && (
              <PondsTab 
                ponds={filteredPonds} 
                role={role} 
                onEdit={handleOpenEdit} 
                onDelete={handleDelete} 
                isExcelMode={isExcelMode}
                onRowChange={handleRowChange}
                editedRows={editedRows}
              />
            )}
            {activeTab === 'seedings' && (
              <SeedingsTab 
                seedings={filteredSeedings} 
                role={role} 
                onEdit={handleOpenEdit} 
                onDelete={handleDelete} 
                isExcelMode={isExcelMode}
                onRowChange={handleRowChange}
                editedRows={editedRows}
              />
            )}
            {activeTab === 'harvests' && (
              <HarvestsTab 
                harvests={filteredHarvests} 
                role={role} 
                onEdit={handleOpenEdit} 
                onDelete={handleDelete} 
                isExcelMode={isExcelMode}
                onRowChange={handleRowChange}
                editedRows={editedRows}
              />
            )}
            {(activeTab === 'cycles' || activeTab === 'closed_cycles') && (
              <CyclesTab 
                cycles={filteredCycles} 
                role={role} 
                activeTab={activeTab} 
                onRegisterHarvest={handleRegisterHarvestForCycle} 
                onEdit={handleOpenEdit} 
                onDelete={handleDelete} 
                isExcelMode={isExcelMode}
                onRowChange={handleRowChange}
                editedRows={editedRows}
              />
            )}
          </div>
        )}
      </div>

      {/* Floating Save Actions Bar for Excel Mode */}
      {isExcelMode && Object.keys(editedRows).length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fadeIn">
          <div className="glass-card bg-cofimar-surface/90 backdrop-blur-md border border-cofimar-success/40 shadow-2xl rounded-2xl px-6 py-4 flex items-center justify-between gap-8 min-w-[420px] max-w-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cofimar-success/10 border border-cofimar-success/30 rounded-xl flex items-center justify-center">
                <span className="text-cofimar-success font-mono font-bold animate-pulse text-sm">📊</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold text-cofimar-text">Edición Excel Activa</span>
                <span className="text-[10px] text-cofimar-text-secondary font-mono">
                  {Object.keys(editedRows).length} fila(s) modificada(s) sin guardar.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                disabled={loading}
                onClick={() => {
                  setIsExcelMode(false);
                  setEditedRows({});
                }}
                className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover border border-cofimar-border text-cofimar-text font-bold font-mono px-4 py-2 rounded-lg text-xs transition duration-150 disabled:opacity-50"
              >
                DESCARTAR
              </button>
              <button
                disabled={loading}
                onClick={handleSaveExcelChanges}
                className="bg-cofimar-success hover:bg-cofimar-success/90 text-white font-bold font-mono px-4 py-2 rounded-lg text-xs shadow-md transition duration-150 disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>GUARDAR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CRUD Input Dialog Modal */}
      <CrudModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editMode={editMode}
        selectedId={selectedId}
        activeTab={activeTab}
        allPondsCatalog={allPondsCatalog}
        onSuccess={handleSuccess}
        presetHarvestForm={presetHarvestForm}
      />
    </div>
  );
};

export default RegistroData;
