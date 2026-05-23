import React, { useState, useEffect } from 'react';
import client, { API_BASE_URL } from '../api/client';
import { 
  Layers, Anchor, Fish, Plus, Edit2, Trash2, Save, X, 
  CheckCircle2, AlertTriangle, ChevronRight, RefreshCw, HelpCircle
} from 'lucide-react';

const Crud: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ponds' | 'harvests' | 'seedings'>('ponds');
  
  // Data lists
  const [ponds, setPonds] = useState<any[]>([]);
  const [harvests, setHarvests] = useState<any[]>([]);
  const [seedings, setSeedings] = useState<any[]>([]);
  
  // Catalogs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null); // For harvests/seedings ID or ponds code

  // Form structures
  const [pondForm, setPondForm] = useState({
    code: '',
    sector: '',
    hectares: 0,
    certification: 'ASC'
  });

  const [harvestForm, setHarvestForm] = useState({
    pond_code: '',
    activity: 'PESCA',
    harvest_date: new Date().toISOString().split('T')[0],
    lbs_farm: 0,
    lbs_plant: 0,
    gr_farm: 0,
    gr_plant: 0,
    sector_chief: '',
    certification: 'ASC'
  });

  const [seedingForm, setSeedingForm] = useState({
    pond_code: '',
    aguaje: 'AGUAJE 1',
    seeding_date: new Date().toISOString().split('T')[0],
    transfer_date: '',
    animals: 100000,
    ablation: 'NO',
    nauplio: '',
    laboratory: '',
    survival_pct: 0,
    pre_criadero: '',
    weight_gr: 0.05
  });

  // Fetch functions
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
  }, [activeTab]);

  // Load catalogs for forms
  const [allPondsCatalog, setAllPondsCatalog] = useState<any[]>([]);
  const loadPondsCatalog = async () => {
    try {
      const res = await client.get('/ponds');
      setAllPondsCatalog(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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
    setError(null);
    
    // Reset forms
    setPondForm({ code: '', sector: '', hectares: 0, certification: 'ASC' });
    setHarvestForm({
      pond_code: allPondsCatalog[0]?.code || '',
      activity: 'PESCA',
      harvest_date: new Date().toISOString().split('T')[0],
      lbs_farm: 0,
      lbs_plant: 0,
      gr_farm: 0,
      gr_plant: 0,
      sector_chief: '',
      certification: 'ASC'
    });
    setSeedingForm({
      pond_code: allPondsCatalog[0]?.code || '',
      aguaje: 'AGUAJE 1',
      seeding_date: new Date().toISOString().split('T')[0],
      transfer_date: '',
      animals: 100000,
      ablation: 'NO',
      nauplio: '',
      laboratory: '',
      survival_pct: 0,
      pre_criadero: '',
      weight_gr: 0.05
    });
    
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditMode(true);
    setError(null);
    
    if (activeTab === 'ponds') {
      setSelectedId(item.code);
      setPondForm({
        code: item.code,
        sector: item.sector || '',
        hectares: parseFloat(item.hectares || 0),
        certification: item.certification || 'ASC'
      });
    } else if (activeTab === 'harvests') {
      setSelectedId(item.id);
      setHarvestForm({
        pond_code: item.pond_code || '',
        activity: item.activity || 'PESCA',
        harvest_date: item.harvest_date || '',
        lbs_farm: parseFloat(item.lbs_farm || 0),
        lbs_plant: parseFloat(item.lbs_plant || 0),
        gr_farm: parseFloat(item.gr_farm || 0),
        gr_plant: parseFloat(item.gr_plant || 0),
        sector_chief: item.sector_chief || '',
        certification: item.certification || 'ASC'
      });
    } else if (activeTab === 'seedings') {
      setSelectedId(item.id);
      setSeedingForm({
        pond_code: item.pond_code || '',
        aguaje: item.aguaje || 'AGUAJE 1',
        seeding_date: item.seeding_date || '',
        transfer_date: item.transfer_date || '',
        animals: parseInt(item.animals || 0),
        ablation: item.ablation || 'NO',
        nauplio: item.nauplio || '',
        laboratory: item.laboratory || '',
        survival_pct: parseFloat(item.survival_pct || 0),
        pre_criadero: item.pre_criadero || '',
        weight_gr: parseFloat(item.weight_gr || 0.05)
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (activeTab === 'ponds') {
        if (editMode) {
          await client.put(`/ponds/${selectedId}`, pondForm);
          showToast('Piscina actualizada correctamente.');
        } else {
          await client.post('/ponds', pondForm);
          showToast('Piscina creada correctamente.');
        }
      } else if (activeTab === 'harvests') {
        if (editMode) {
          await client.put(`/harvests/${selectedId}`, harvestForm);
          showToast('Cosecha actualizada y KPIs recalculados.');
        } else {
          await client.post('/harvests', harvestForm);
          showToast('Cosecha guardada correctamente.');
        }
      } else if (activeTab === 'seedings') {
        if (editMode) {
          await client.put(`/seedings/${selectedId}`, seedingForm);
          showToast('Siembra actualizada correctamente.');
        } else {
          await client.post('/seedings', seedingForm);
          showToast('Siembra registrada correctamente.');
        }
      }
      
      setIsModalOpen(false);
      fetchData();
      loadPondsCatalog();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Error al guardar la información. Verifique los campos obligatorios.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-7 max-w-7xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Layers className="w-8 h-8 text-cofimar-primary" />
            Formularios CRUD
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Administra, añade, edita o elimina la información de Piscinas, Cosechas y Siembras directamente
          </p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center space-x-2 bg-cofimar-primary hover:bg-cofimar-primary/95 text-cofimar-bg font-bold px-5 py-3 rounded-xl transition duration-200 shadow-lg shadow-cofimar-primary/20 text-sm font-mono"
        >
          <Plus className="w-4 h-4" />
          <span>AGREGAR NUEVO REGISTRO</span>
        </button>
      </div>

      {/* Toast Success Message */}
      {successMsg && (
        <div className="bg-cofimar-success/15 border border-cofimar-success/30 p-4.5 rounded-xl flex items-center gap-3.5 animate-fadeIn">
          <CheckCircle2 className="w-5.5 h-5.5 text-cofimar-success" />
          <span className="text-sm font-medium text-white">{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-cofimar-border/60">
        <button
          onClick={() => setActiveTab('ponds')}
          className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-mono text-sm font-bold transition duration-200 ${
            activeTab === 'ponds' 
              ? 'border-cofimar-primary text-cofimar-primary bg-cofimar-primary/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Anchor className="w-4 h-4" />
          <span>1. PISCINAS (DATOS)</span>
        </button>
        <button
          onClick={() => setActiveTab('harvests')}
          className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-mono text-sm font-bold transition duration-200 ${
            activeTab === 'harvests' 
              ? 'border-cofimar-primary text-cofimar-primary bg-cofimar-primary/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Fish className="w-4 h-4" />
          <span>2. COSECHAS & QC</span>
        </button>
        <button
          onClick={() => setActiveTab('seedings')}
          className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-mono text-sm font-bold transition duration-200 ${
            activeTab === 'seedings' 
              ? 'border-cofimar-primary text-cofimar-primary bg-cofimar-primary/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. HISTORIAL SIEMBRAS</span>
        </button>
      </div>

      {/* CRUD Tables Container */}
      <div className="glass-card rounded-2xl border border-cofimar-border/50 shadow-xl overflow-hidden">
        {loading && (
          <div className="p-16 flex items-center justify-center space-x-3 text-slate-400 font-mono text-sm">
            <RefreshCw className="w-5 h-5 animate-spin text-cofimar-primary" />
            <span>Cargando registros...</span>
          </div>
        )}
        
        {!loading && (
          <div className="overflow-x-auto">
            {activeTab === 'ponds' && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-800/40 text-slate-400 font-mono text-xs border-b border-cofimar-border/60">
                  <tr>
                    <th className="py-4 px-6">CÓDIGO PISCINA</th>
                    <th className="py-4 px-6">SECTOR</th>
                    <th className="py-4 px-6 text-right">HECTÁREAS (HAS)</th>
                    <th className="py-4 px-6">CERTIFICACIÓN</th>
                    <th className="py-4 px-6 text-center">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cofimar-border/25 font-mono text-sm">
                  {ponds.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">No hay piscinas registradas.</td>
                    </tr>
                  ) : (
                    ponds.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/10 transition">
                        <td className="py-3 px-6 font-bold text-cofimar-primary">{p.code}</td>
                        <td className="py-3 px-6 text-white font-sans">{p.sector || 'N/A'}</td>
                        <td className="py-3 px-6 text-right text-slate-300">{parseFloat(p.hectares || 0).toFixed(2)} ha</td>
                        <td className="py-3 px-6">
                          <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] px-2.5 py-0.5 rounded font-mono font-bold">
                            {p.certification || 'CONVENCIONAL'}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-center space-x-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="bg-slate-800 hover:bg-slate-700 text-cofimar-primary p-1.5 rounded-lg border border-cofimar-primary/20 transition"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.code)}
                            className="bg-slate-800 hover:bg-cofimar-danger/20 text-cofimar-danger p-1.5 rounded-lg border border-cofimar-danger/20 transition"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'harvests' && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-800/40 text-slate-400 font-mono text-xs border-b border-cofimar-border/60">
                  <tr>
                    <th className="py-4 px-5">PISCINA</th>
                    <th className="py-4 px-5">ACTIVIDAD</th>
                    <th className="py-4 px-5">FECHA</th>
                    <th className="py-4 px-5 text-right">LBS CAM.</th>
                    <th className="py-4 px-5 text-right">LBS PLANTA</th>
                    <th className="py-4 px-5 text-right">GR CAM.</th>
                    <th className="py-4 px-5 text-right">GR PLANTA</th>
                    <th className="py-4 px-5">RESPONSABLE</th>
                    <th className="py-4 px-5 text-center">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cofimar-border/25 font-mono text-xs">
                  {harvests.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">No hay transacciones registradas.</td>
                    </tr>
                  ) : (
                    harvests.map((h, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/10 transition">
                        <td className="py-3 px-5 font-bold text-cofimar-primary">{h.pond_code}</td>
                        <td className="py-3 px-5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            h.activity === 'PESCA' ? 'bg-cofimar-success/15 text-cofimar-success' : 'bg-cofimar-warning/15 text-cofimar-warning'
                          }`}>
                            {h.activity}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-slate-350">{h.harvest_date}</td>
                        <td className="py-3 px-5 text-right text-slate-200">{Math.round(h.lbs_farm || 0).toLocaleString()}</td>
                        <td className="py-3 px-5 text-right text-slate-200">{Math.round(h.lbs_plant || 0).toLocaleString()}</td>
                        <td className="py-3 px-5 text-right text-slate-350">{parseFloat(h.gr_farm || 0).toFixed(2)}</td>
                        <td className="py-3 px-5 text-right text-slate-350">{parseFloat(h.gr_plant || 0).toFixed(2)}</td>
                        <td className="py-3 px-5 text-slate-400 font-sans">{h.sector_chief}</td>
                        <td className="py-3 px-5 text-center space-x-2">
                          <button
                            onClick={() => handleOpenEdit(h)}
                            className="bg-slate-800 hover:bg-slate-700 text-cofimar-primary p-1.5 rounded-lg border border-cofimar-primary/20 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(h.id)}
                            className="bg-slate-800 hover:bg-cofimar-danger/20 text-cofimar-danger p-1.5 rounded-lg border border-cofimar-danger/20 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'seedings' && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-800/40 text-slate-400 font-mono text-xs border-b border-cofimar-border/60">
                  <tr>
                    <th className="py-4 px-5">PISCINA</th>
                    <th className="py-4 px-5">AGUAJE</th>
                    <th className="py-4 px-5">FECHA SIEMBRA</th>
                    <th className="py-4 px-5 text-right">LARVAS SEMBRADAS</th>
                    <th className="py-4 px-5">LABORATORIO</th>
                    <th className="py-4 px-5">NAUPLIO</th>
                    <th className="py-4 px-5 text-right">SOBREVIVENCIA (%)</th>
                    <th className="py-4 px-5 text-center">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cofimar-border/25 font-mono text-xs">
                  {seedings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">No hay siembras registradas.</td>
                    </tr>
                  ) : (
                    seedings.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/10 transition">
                        <td className="py-3 px-5 font-bold text-cofimar-primary">{s.pond_code}</td>
                        <td className="py-3 px-5 text-white">{s.aguaje}</td>
                        <td className="py-3 px-5 text-slate-350">{s.seeding_date}</td>
                        <td className="py-3 px-5 text-right text-slate-200">{(s.animals || 0).toLocaleString()}</td>
                        <td className="py-3 px-5 text-slate-300 font-sans">{s.laboratory || 'N/A'}</td>
                        <td className="py-3 px-5 text-slate-400 font-sans">{s.nauplio || 'N/A'}</td>
                        <td className="py-3 px-5 text-right font-bold text-cofimar-accent">{parseFloat(s.survival_pct || 0).toFixed(2)}%</td>
                        <td className="py-3 px-5 text-center space-x-2">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="bg-slate-800 hover:bg-slate-700 text-cofimar-primary p-1.5 rounded-lg border border-cofimar-primary/20 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="bg-slate-800 hover:bg-cofimar-danger/20 text-cofimar-danger p-1.5 rounded-lg border border-cofimar-danger/20 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* CRUD Input Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card w-full max-w-2xl rounded-2xl border border-cofimar-border/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-cofimar-border/60 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-white">
                  {editMode ? 'Editar Registro' : 'Agregar Nuevo Registro'}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  MÓDULO: {activeTab.toUpperCase()} {editMode ? `[ID/CODE: ${selectedId}]` : ''}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error in modal */}
            {error && (
              <div className="mx-6 mt-6 bg-cofimar-danger/10 border border-cofimar-danger/20 p-3.5 rounded-xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-cofimar-danger flex-shrink-0" />
                <span className="text-xs font-mono text-cofimar-danger">{error}</span>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-200">
              
              {/* --- PONDS FORM --- */}
              {activeTab === 'ponds' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Código Piscina *</label>
                    <input
                      type="text"
                      required
                      disabled={editMode}
                      value={pondForm.code}
                      onChange={(e) => setPondForm({ ...pondForm, code: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary disabled:opacity-50"
                      placeholder="Ej: TU 02"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Sector</label>
                    <input
                      type="text"
                      value={pondForm.sector}
                      onChange={(e) => setPondForm({ ...pondForm, sector: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                      placeholder="Ej: TUNA"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Hectáreas (Has) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={pondForm.hectares}
                      onChange={(e) => setPondForm({ ...pondForm, hectares: parseFloat(e.target.value) })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Certificación</label>
                    <select
                      value={pondForm.certification}
                      onChange={(e) => setPondForm({ ...pondForm, certification: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    >
                      <option value="ASC">ASC</option>
                      <option value="ASC-BAP">ASC-BAP</option>
                      <option value="CONVENCIONAL">CONVENCIONAL</option>
                    </select>
                  </div>
                </div>
              )}

              {/* --- HARVESTS FORM --- */}
              {activeTab === 'harvests' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Piscina Relacionada *</label>
                    <select
                      required
                      value={harvestForm.pond_code}
                      onChange={(e) => setHarvestForm({ ...harvestForm, pond_code: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    >
                      {allPondsCatalog.map((p) => (
                        <option key={p.code} value={p.code}>{p.code} ({p.sector || 'Sin sector'})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Actividad *</label>
                    <select
                      value={harvestForm.activity}
                      onChange={(e) => setHarvestForm({ ...harvestForm, activity: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    >
                      <option value="PESCA">PESCA (Liquidación Final)</option>
                      <option value="RALEO">RALEO (Cosecha Intermedia)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Fecha de Cosecha *</label>
                    <input
                      type="date"
                      required
                      value={harvestForm.harvest_date}
                      onChange={(e) => setHarvestForm({ ...harvestForm, harvest_date: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Jefe de Sector / Responsable</label>
                    <input
                      type="text"
                      value={harvestForm.sector_chief}
                      onChange={(e) => setHarvestForm({ ...harvestForm, sector_chief: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                      placeholder="Ej: GUSTAVO CARRASCO"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Libras Camaronera (Farm Lbs) *</label>
                    <input
                      type="number"
                      required
                      value={harvestForm.lbs_farm}
                      onChange={(e) => setHarvestForm({ ...harvestForm, lbs_farm: parseFloat(e.target.value) })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Libras Planta (Plant Lbs) *</label>
                    <input
                      type="number"
                      required
                      value={harvestForm.lbs_plant}
                      onChange={(e) => setHarvestForm({ ...harvestForm, lbs_plant: parseFloat(e.target.value) })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Gramaje Camaronera *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={harvestForm.gr_farm}
                      onChange={(e) => setHarvestForm({ ...harvestForm, gr_farm: parseFloat(e.target.value) })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Gramaje Planta *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={harvestForm.gr_plant}
                      onChange={(e) => setHarvestForm({ ...harvestForm, gr_plant: parseFloat(e.target.value) })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Certificación de Cosecha</label>
                    <select
                      value={harvestForm.certification}
                      onChange={(e) => setHarvestForm({ ...harvestForm, certification: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    >
                      <option value="ASC">ASC</option>
                      <option value="ASC-BAP">ASC-BAP</option>
                      <option value="CONVENCIONAL">CONVENCIONAL</option>
                    </select>
                  </div>
                </div>
              )}

              {/* --- SEEDINGS FORM --- */}
              {activeTab === 'seedings' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Piscina *</label>
                    <select
                      required
                      value={seedingForm.pond_code}
                      onChange={(e) => setSeedingForm({ ...seedingForm, pond_code: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    >
                      {allPondsCatalog.map((p) => (
                        <option key={p.code} value={p.code}>{p.code}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Aguaje *</label>
                    <select
                      value={seedingForm.aguaje}
                      onChange={(e) => setSeedingForm({ ...seedingForm, aguaje: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    >
                      <option value="AGUAJE 1">AGUAJE 1</option>
                      <option value="AGUAJE 2">AGUAJE 2</option>
                      <option value="QUIEBRA 1">QUIEBRA 1</option>
                      <option value="QUIEBRA 2">QUIEBRA 2</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Fecha de Siembra *</label>
                    <input
                      type="date"
                      required
                      value={seedingForm.seeding_date}
                      onChange={(e) => setSeedingForm({ ...seedingForm, seeding_date: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Fecha Transferencia</label>
                    <input
                      type="date"
                      value={seedingForm.transfer_date}
                      onChange={(e) => setSeedingForm({ ...seedingForm, transfer_date: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Cantidad de Larvas *</label>
                    <input
                      type="number"
                      required
                      value={seedingForm.animals}
                      onChange={(e) => setSeedingForm({ ...seedingForm, animals: parseInt(e.target.value) })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Laboratorio Origen</label>
                    <input
                      type="text"
                      value={seedingForm.laboratory}
                      onChange={(e) => setSeedingForm({ ...seedingForm, laboratory: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                      placeholder="Ej: LAB COFIMAR"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Cepa de Nauplio</label>
                    <input
                      type="text"
                      value={seedingForm.nauplio}
                      onChange={(e) => setSeedingForm({ ...seedingForm, nauplio: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                      placeholder="Ej: CEPA WILD"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Sobrevivencia Estimada (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={seedingForm.survival_pct}
                      onChange={(e) => setSeedingForm({ ...seedingForm, survival_pct: parseFloat(e.target.value) })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Ablación</label>
                    <select
                      value={seedingForm.ablation}
                      onChange={(e) => setSeedingForm({ ...seedingForm, ablation: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    >
                      <option value="SÍ">SÍ (Ablada)</option>
                      <option value="NO">NO (Sin ablar)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-450 uppercase block">Peso Inicial (Gramaje W) *</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={seedingForm.weight_gr}
                      onChange={(e) => setSeedingForm({ ...seedingForm, weight_gr: parseFloat(e.target.value) })}
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-cofimar-primary"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-cofimar-border/60 flex items-center justify-end space-x-3.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-5 py-2.5 rounded-xl transition duration-200 text-xs font-mono"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 bg-cofimar-primary hover:bg-cofimar-primary/95 text-cofimar-bg font-bold px-6 py-2.5 rounded-xl transition duration-200 shadow-lg shadow-cofimar-primary/20 text-xs font-mono"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{editMode ? 'GUARDAR CAMBIOS' : 'REGISTRAR INFORMACIÓN'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Crud;
