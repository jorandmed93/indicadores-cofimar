import React, { useState, useEffect } from 'react';
import client, { API_BASE_URL } from '../api/client';
import { 
  Layers, Anchor, Fish, Plus, Edit2, Trash2, Save, X, 
  CheckCircle2, AlertTriangle, ChevronRight, RefreshCw, HelpCircle
} from 'lucide-react';

const SECTOR_CHIEFS: { [key: string]: string } = {
  'BARRACUDA': 'GUSTAVO CARRASCO',
  'CATANUDA': 'VICTOR QUINTANA',
  'CHERNA': 'SANTIAGO OBRIEN',
  'DELFIN': 'RONNIE REYES',
  'DORADO': 'JOSE CEDEÑO',
  'GUATO': 'JULIO SANTOS',
  'MANTARRAYA': 'GUSTAVO CARRASCO',
  'MERO': 'RONNIE REYES',
  'PAMPANO': 'GUSTAVO CARRASCO',
  'PARGO ROJO': 'WILMER TORRES',
  'ROBALO': 'VICTOR QUINTANA',
  'TAMBULERO': 'ALFONSO GRUNAUER',
  'TIBURON': 'ALFONSO GRUNAUER',
  'TUNA': 'GUSTAVO CARRASCO',
  'WAHOO': 'JUNIOR ESQUIVEL'
};

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
    certification: 'ASC',
    feed_lbs: 0,
    feed_supplier: '',
    feeding_mode: 'AUTOMATICA'
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

  const [cycleForm, setCycleForm] = useState({
    harvest_date: new Date().toISOString().split('T')[0],
    year: new Date().getFullYear(),
    aguaje: 'AGUAJE 1',
    month: '',
    pond_code: '',
    pond_name: '',
    sector: '',
    hectares: 0,
    certification: 'ASC',
    days: 0,
    seeding_date: '',
    pre: '',
    seeding_weight: 0,
    dry_days: 0,
    animals_seeded: 0,
    laboratory: '',
    nauplio: '',
    lbs_trawl_farm: 0,
    lbs_trawl_plant: 0,
    gr_trawl_farm: 0,
    gr_trawl_plant: 0,
    lbs_harvest_farm: 0,
    lbs_harvest_plant: 0,
    gr_harvest_farm: 0,
    gr_harvest_plant: 0,
    feed_lbs: 0,
    feed_supplier: '',
    feeding_mode: 'AUTOMATICA',
    sector_chief: ''
  });

  const handleCyclePondChange = (code: string) => {
    const selectedPond = allPondsCatalog.find(p => p.code === code);
    if (selectedPond) {
      const sectorUpper = (selectedPond.sector || '').toUpperCase();
      setCycleForm({
        ...cycleForm,
        pond_code: code,
        hectares: parseFloat(selectedPond.hectares || 0),
        sector: sectorUpper,
        certification: selectedPond.certification || 'ASC',
        pond_name: selectedPond.code.split(' ')[1] || '',
        sector_chief: SECTOR_CHIEFS[sectorUpper] || cycleForm.sector_chief
      });
    } else {
      setCycleForm({
        ...cycleForm,
        pond_code: code
      });
    }
  };

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
      certification: 'ASC',
      feed_lbs: 0,
      feed_supplier: '',
      feeding_mode: 'AUTOMATICA'
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
    setCycleForm({
      harvest_date: new Date().toISOString().split('T')[0],
      year: new Date().getFullYear(),
      aguaje: 'AGUAJE 1',
      month: '',
      pond_code: allPondsCatalog[0]?.code || '',
      pond_name: '',
      sector: '',
      hectares: 0,
      certification: 'ASC',
      days: 0,
      seeding_date: '',
      pre: '',
      seeding_weight: 0,
      dry_days: 0,
      animals_seeded: 0,
      laboratory: '',
      nauplio: '',
      lbs_trawl_farm: 0,
      lbs_trawl_plant: 0,
      gr_trawl_farm: 0,
      gr_trawl_plant: 0,
      lbs_harvest_farm: 0,
      lbs_harvest_plant: 0,
      gr_harvest_farm: 0,
      gr_harvest_plant: 0,
      feed_lbs: 0,
      feed_supplier: '',
      feeding_mode: 'AUTOMATICA',
      sector_chief: ''
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
        certification: item.certification || 'ASC',
        feed_lbs: parseFloat(item.feed_lbs || 0),
        feed_supplier: item.feed_supplier || '',
        feeding_mode: item.feeding_mode || 'AUTOMATICA'
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
    } else if (activeTab === 'cycles' || activeTab === 'closed_cycles') {
      setSelectedId(item.id);
      setCycleForm({
        harvest_date: item.harvest_date || '',
        year: parseInt(item.year || new Date().getFullYear()),
        aguaje: item.aguaje || 'AGUAJE 1',
        month: item.month || '',
        pond_code: item.pond_code || '',
        pond_name: item.pond_name || '',
        sector: item.sector || '',
        hectares: parseFloat(item.hectares || 0),
        certification: item.certification || 'ASC',
        days: parseInt(item.days || 0),
        seeding_date: item.seeding_date || '',
        pre: item.pre || '',
        seeding_weight: parseFloat(item.seeding_weight || 0),
        dry_days: parseInt(item.dry_days || 0),
        animals_seeded: parseInt(item.animals_seeded || 0),
        laboratory: item.laboratory || '',
        nauplio: item.nauplio || '',
        lbs_trawl_farm: parseFloat(item.lbs_trawl_farm || 0),
        lbs_trawl_plant: parseFloat(item.lbs_trawl_plant || 0),
        gr_trawl_farm: parseFloat(item.gr_trawl_farm || 0),
        gr_trawl_plant: parseFloat(item.gr_trawl_plant || 0),
        lbs_harvest_farm: parseFloat(item.lbs_harvest_farm || 0),
        lbs_harvest_plant: parseFloat(item.lbs_harvest_plant || 0),
        gr_harvest_farm: parseFloat(item.gr_harvest_farm || 0),
        gr_harvest_plant: parseFloat(item.gr_harvest_plant || 0),
        feed_lbs: parseFloat(item.feed_lbs || 0),
        feed_supplier: item.feed_supplier || '',
        feeding_mode: item.feeding_mode || 'AUTOMATICA',
        sector_chief: item.sector_chief || ''
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
      } else if (activeTab === 'cycles' || activeTab === 'closed_cycles') {
        if (editMode) {
          await client.put(`/cycles/${selectedId}`, cycleForm);
          showToast('Ciclo productivo actualizado y KPIs recalculados.');
        } else {
          await client.post('/cycles', cycleForm);
          showToast('Ciclo productivo registrado correctamente.');
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
    <div className="p-8 space-y-7 max-w-7xl pt-4">
      {/* Action Header (GabarraControl Style) */}
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
      <div className="flex border-b border-cofimar-border/60">
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

      {/* CRUD Tables Container */}
      <div className="glass-card rounded-2xl border border-cofimar-border/50 shadow-xl overflow-hidden">
        {loading && (
          <div className="p-16 flex items-center justify-center space-x-3 text-cofimar-text-muted font-mono text-sm">
            <RefreshCw className="w-5 h-5 animate-spin text-cofimar-primary" />
            <span>Cargando registros...</span>
          </div>
        )}
        
        {!loading && (
          <div className="overflow-x-auto">
            {activeTab === 'ponds' && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-cofimar-surface-secondary text-cofimar-text-muted font-mono text-xs border-b border-cofimar-border/60">
                  <tr>
                    <th className="py-4 px-6">CÓDIGO PISCINA</th>
                    <th className="py-4 px-6">SECTOR</th>
                    <th className="py-4 px-6 text-right">HECTÁREAS (HAS)</th>
                    <th className="py-4 px-6">CERTIFICACIÓN</th>
                    {role === 'admin' && <th className="py-4 px-6 text-center">ACCIONES</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cofimar-border/25 font-mono text-sm">
                  {ponds.length === 0 ? (
                    <tr>
                      <td colSpan={role === 'admin' ? 5 : 4} className="py-12 text-center text-cofimar-text-muted">No hay piscinas registradas.</td>
                    </tr>
                  ) : (
                    ponds.map((p, idx) => (
                      <tr key={idx} className="hover:bg-cofimar-surface-secondary transition">
                        <td className="py-3 px-6 font-bold text-cofimar-primary">{p.code}</td>
                        <td className="py-3 px-6 text-cofimar-text font-sans">{p.sector || 'N/A'}</td>
                        <td className="py-3 px-6 text-right text-cofimar-text-muted">{parseFloat(p.hectares || 0).toFixed(2)} ha</td>
                        <td className="py-3 px-6">
                          <span className="bg-cofimar-bg border border-cofimar-border text-cofimar-text text-[10px] px-2.5 py-0.5 rounded font-mono font-bold">
                            {p.certification || 'CONVENCIONAL'}
                          </span>
                        </td>
                        {role === 'admin' && (
                          <td className="py-3 px-6 text-center space-x-2">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-primary p-1.5 rounded-lg border border-cofimar-border transition"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.code)}
                              className="bg-cofimar-surface-secondary hover:bg-red-50 dark:hover:bg-red-950/20 text-cofimar-danger p-1.5 rounded-lg border border-cofimar-border transition"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'harvests' && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-cofimar-surface-secondary text-cofimar-text-muted font-mono text-xs border-b border-cofimar-border/60">
                  <tr>
                    <th className="py-4 px-5">PISCINA</th>
                    <th className="py-4 px-5">ACTIVIDAD</th>
                    <th className="py-4 px-5">FECHA</th>
                    <th className="py-4 px-5 text-right">LBS CAM.</th>
                    <th className="py-4 px-5 text-right">LBS PLANTA</th>
                    <th className="py-4 px-5 text-right">GR CAM.</th>
                    <th className="py-4 px-5 text-right">GR PLANTA</th>
                    <th className="py-4 px-5">RESPONSABLE</th>
                    {role === 'admin' && <th className="py-4 px-5 text-center">ACCIONES</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cofimar-border/25 font-mono text-xs">
                  {harvests.length === 0 ? (
                    <tr>
                      <td colSpan={role === 'admin' ? 9 : 8} className="py-12 text-center text-cofimar-text-muted">No hay transacciones registradas.</td>
                    </tr>
                  ) : (
                    harvests.map((h, idx) => (
                      <tr key={idx} className="hover:bg-cofimar-surface-secondary transition">
                        <td className="py-3 px-5 font-bold text-cofimar-primary">{h.pond_code}</td>
                        <td className="py-3 px-5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            h.activity === 'PESCA' ? 'bg-cofimar-success/15 text-cofimar-success' : 'bg-cofimar-warning/15 text-cofimar-warning'
                          }`}>
                            {h.activity}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-cofimar-text-muted font-mono">{h.harvest_date}</td>
                        <td className="py-3 px-5 text-right text-cofimar-text font-mono">{Math.round(h.lbs_farm || 0).toLocaleString()}</td>
                        <td className="py-3 px-5 text-right text-cofimar-text font-mono">{Math.round(h.lbs_plant || 0).toLocaleString()}</td>
                        <td className="py-3 px-5 text-right text-cofimar-text-muted font-mono">{parseFloat(h.gr_farm || 0).toFixed(2)}</td>
                        <td className="py-3 px-5 text-right text-cofimar-text-muted font-mono">{parseFloat(h.gr_plant || 0).toFixed(2)}</td>
                        <td className="py-3 px-5 text-cofimar-text-muted font-sans">{h.sector_chief}</td>
                        {role === 'admin' && (
                          <td className="py-3 px-5 text-center space-x-2">
                            <button
                              onClick={() => handleOpenEdit(h)}
                              className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-primary p-1.5 rounded-lg border border-cofimar-border transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(h.id)}
                              className="bg-cofimar-surface-secondary hover:bg-red-50 dark:hover:bg-red-950/20 text-cofimar-danger p-1.5 rounded-lg border border-cofimar-border transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'seedings' && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-cofimar-surface-secondary text-cofimar-text-muted font-mono text-xs border-b border-cofimar-border/60">
                  <tr>
                    <th className="py-4 px-5">PISCINA</th>
                    <th className="py-4 px-5">AGUAJE</th>
                    <th className="py-4 px-5">FECHA SIEMBRA</th>
                    <th className="py-4 px-5 text-right">LARVAS SEMBRADAS</th>
                    <th className="py-4 px-5">LABORATORIO</th>
                    <th className="py-4 px-5">NAUPLIO</th>
                    <th className="py-4 px-5 text-right">SOBREVIVENCIA (%)</th>
                    {role === 'admin' && <th className="py-4 px-5 text-center">ACCIONES</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cofimar-border/25 font-mono text-xs">
                  {seedings.length === 0 ? (
                    <tr>
                      <td colSpan={role === 'admin' ? 8 : 7} className="py-12 text-center text-cofimar-text-muted">No hay siembras registradas.</td>
                    </tr>
                  ) : (
                    seedings.map((s, idx) => (
                      <tr key={idx} className="hover:bg-cofimar-surface-secondary transition">
                        <td className="py-3 px-5 font-bold text-cofimar-primary">{s.pond_code}</td>
                        <td className="py-3 px-5 text-cofimar-text">{s.aguaje}</td>
                        <td className="py-3 px-5 text-cofimar-text-muted font-mono">{s.seeding_date}</td>
                        <td className="py-3 px-5 text-right text-cofimar-text font-mono">{(s.animals || 0).toLocaleString()}</td>
                        <td className="py-3 px-5 text-cofimar-text-muted font-sans">{s.laboratory || 'N/A'}</td>
                        <td className="py-3 px-5 text-cofimar-text-muted font-sans">{s.nauplio || 'N/A'}</td>
                        <td className="py-3 px-5 text-right font-bold text-cofimar-accent font-mono">{parseFloat(s.survival_pct || 0).toFixed(2)}%</td>
                        {role === 'admin' && (
                          <td className="py-3 px-5 text-center space-x-2">
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-primary p-1.5 rounded-lg border border-cofimar-border transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="bg-cofimar-surface-secondary hover:bg-red-50 dark:hover:bg-red-950/20 text-cofimar-danger p-1.5 rounded-lg border border-cofimar-border transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {(activeTab === 'cycles' || activeTab === 'closed_cycles') && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-cofimar-surface-secondary text-cofimar-text-muted font-mono text-xs border-b border-cofimar-border/60">
                  <tr>
                    <th className="py-4 px-5">PISCINA</th>
                    <th className="py-4 px-5">AGUAJE</th>
                    <th className="py-4 px-5">FECHA COSECHA</th>
                    <th className="py-4 px-5 text-right">HAS</th>
                    <th className="py-4 px-5 text-right">LBS TOTALES</th>
                    <th className="py-4 px-5 text-right">LBS/HA</th>
                    <th className="py-4 px-5 text-right">SOBREVIVENCIA</th>
                    <th className="py-4 px-5 text-right">ALIMENTO (LBS)</th>
                    <th className="py-4 px-5 text-right text-cofimar-primary">FCA</th>
                    {role === 'admin' && <th className="py-4 px-5 text-center">ACCIONES</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cofimar-border/25 font-mono text-xs">
                  {cycles.length === 0 ? (
                    <tr>
                      <td colSpan={role === 'admin' ? 10 : 9} className="py-12 text-center text-cofimar-text-muted">
                        {activeTab === 'cycles' ? 'No hay ciclos productivos activos.' : 'No hay ciclos cosechados registrados.'}
                      </td>
                    </tr>
                  ) : (
                    cycles.map((c, idx) => (
                      <tr key={idx} className="hover:bg-cofimar-surface-secondary transition">
                        <td className="py-3 px-5 font-bold text-cofimar-primary">{c.pond_code}</td>
                        <td className="py-3 px-5 text-cofimar-text">{c.aguaje}</td>
                        <td className="py-3 px-5 text-cofimar-text-muted font-mono">{c.harvest_date || 'EN CURSO'}</td>
                        <td className="py-3 px-5 text-right text-cofimar-text-muted font-mono">{parseFloat(c.hectares || 0).toFixed(2)}</td>
                        <td className="py-3 px-5 text-right text-cofimar-text font-mono">{c.total_lbs ? Math.round(c.total_lbs).toLocaleString() : 'N/A'}</td>
                        <td className="py-3 px-5 text-right font-bold text-cofimar-text font-mono">{c.lbs_ha ? Math.round(c.lbs_ha).toLocaleString() : 'N/A'}</td>
                        <td className="py-3 px-5 text-right font-bold text-cofimar-accent font-mono">{c.survival_pct ? `${parseFloat(c.survival_pct).toFixed(1)}%` : 'N/A'}</td>
                        <td className="py-3 px-5 text-right text-cofimar-text font-mono">{c.feed_lbs ? Math.round(c.feed_lbs).toLocaleString() : 'N/A'}</td>
                        <td className="py-3 px-5 text-right">
                          {c.fca ? (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.fca <= 1.35 ? 'bg-cofimar-success/15 text-cofimar-success' : c.fca <= 1.70 ? 'bg-cofimar-warning/15 text-cofimar-warning' : 'bg-cofimar-danger/15 text-cofimar-danger'
                            }`}>
                              {parseFloat(c.fca).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-cofimar-text-muted text-[10px]">N/A</span>
                          )}
                        </td>
                        {role === 'admin' && (
                          <td className="py-3 px-5 text-center space-x-2">
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-primary p-1.5 rounded-lg border border-cofimar-border transition"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="bg-cofimar-surface-secondary hover:bg-red-50 dark:hover:bg-red-950/20 text-cofimar-danger p-1.5 rounded-lg border border-cofimar-border transition"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[8px] animate-fadeIn">
          <div className="glass-card w-full max-w-2xl rounded-2xl border border-cofimar-border/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-cofimar-border/60 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-cofimar-text">
                  {editMode ? 'Editar Registro' : 'Agregar Nuevo Registro'}
                </h3>
                <span className="text-[10px] text-cofimar-text-muted font-mono">
                  MÓDULO: {activeTab.toUpperCase()} {editMode ? `[ID/CODE: ${selectedId}]` : ''}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover p-2 rounded-lg border border-cofimar-border text-cofimar-text-muted hover:text-cofimar-text transition"
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
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-cofimar-text bg-cofimar-bg/10">
              
              {/* --- PONDS FORM --- */}
              {activeTab === 'ponds' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Código Piscina *</label>
                    <input
                      type="text"
                      required
                      disabled={editMode}
                      value={pondForm.code}
                      onChange={(e) => setPondForm({ ...pondForm, code: e.target.value.toUpperCase() })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200 disabled:opacity-50"
                      placeholder="Ej: TU 02"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Sector</label>
                    <input
                      type="text"
                      value={pondForm.sector}
                      onChange={(e) => setPondForm({ ...pondForm, sector: e.target.value.toUpperCase() })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                      placeholder="Ej: TUNA"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Hectáreas (Has) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={pondForm.hectares}
                      onChange={(e) => setPondForm({ ...pondForm, hectares: parseFloat(e.target.value) })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Certificación</label>
                    <select
                      value={pondForm.certification}
                      onChange={(e) => setPondForm({ ...pondForm, certification: e.target.value })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
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
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Piscina Relacionada *</label>
                    <select
                      required
                      value={harvestForm.pond_code}
                      onChange={(e) => setHarvestForm({ ...harvestForm, pond_code: e.target.value })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                    >
                      {allPondsCatalog.map((p) => (
                        <option key={p.code} value={p.code}>{p.code} ({p.sector || 'Sin sector'})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Actividad *</label>
                    <select
                      value={harvestForm.activity}
                      onChange={(e) => setHarvestForm({ ...harvestForm, activity: e.target.value })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                    >
                      <option value="PESCA">PESCA (Liquidación Final)</option>
                      <option value="RALEO">RALEO (Cosecha Intermedia)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Fecha de Cosecha *</label>
                    <input
                      type="date"
                      required
                      value={harvestForm.harvest_date}
                      onChange={(e) => setHarvestForm({ ...harvestForm, harvest_date: e.target.value })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Jefe de Sector / Responsable</label>
                    <input
                      type="text"
                      value={harvestForm.sector_chief}
                      onChange={(e) => setHarvestForm({ ...harvestForm, sector_chief: e.target.value })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                      placeholder="Ej: GUSTAVO CARRASCO"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Libras Camaronera (Farm Lbs) *</label>
                    <input
                      type="number"
                      required
                      value={harvestForm.lbs_farm}
                      onChange={(e) => setHarvestForm({ ...harvestForm, lbs_farm: parseFloat(e.target.value) })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Libras Planta (Plant Lbs) *</label>
                    <input
                      type="number"
                      required
                      value={harvestForm.lbs_plant}
                      onChange={(e) => setHarvestForm({ ...harvestForm, lbs_plant: parseFloat(e.target.value) })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Gramaje Camaronera *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={harvestForm.gr_farm}
                      onChange={(e) => setHarvestForm({ ...harvestForm, gr_farm: parseFloat(e.target.value) })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Gramaje Planta *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={harvestForm.gr_plant}
                      onChange={(e) => setHarvestForm({ ...harvestForm, gr_plant: parseFloat(e.target.value) })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Certificación de Cosecha</label>
                    <select
                      value={harvestForm.certification}
                      onChange={(e) => setHarvestForm({ ...harvestForm, certification: e.target.value })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                    >
                      <option value="ASC">ASC</option>
                      <option value="ASC-BAP">ASC-BAP</option>
                      <option value="CONVENCIONAL">CONVENCIONAL</option>
                    </select>
                  </div>

                  {harvestForm.activity === 'PESCA' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Alimento Consumido en el Ciclo (Lbs) *</label>
                        <input
                          type="number"
                          required
                          value={harvestForm.feed_lbs}
                          onChange={(e) => setHarvestForm({ ...harvestForm, feed_lbs: parseFloat(e.target.value) })}
                          className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                          placeholder="Para cálculo de FCA"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Proveedor de Balanceado</label>
                        <input
                          type="text"
                          value={harvestForm.feed_supplier}
                          onChange={(e) => setHarvestForm({ ...harvestForm, feed_supplier: e.target.value.toUpperCase() })}
                          className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                          placeholder="Ej: SKRETTING, VITAPRO"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Modo de Alimentación</label>
                        <select
                          value={harvestForm.feeding_mode}
                          onChange={(e) => setHarvestForm({ ...harvestForm, feeding_mode: e.target.value })}
                          className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                        >
                          <option value="AUTOMATICA">AUTOMÁTICA</option>
                          <option value="MANUAL">MANUAL</option>
                          <option value="MIXTA">MIXTA</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* --- SEEDINGS FORM --- */}
              {activeTab === 'seedings' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Piscina *</label>
                    <select
                      required
                      value={seedingForm.pond_code}
                      onChange={(e) => setSeedingForm({ ...seedingForm, pond_code: e.target.value })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                    >
                      {allPondsCatalog.map((p) => (
                        <option key={p.code} value={p.code}>{p.code}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Aguaje *</label>
                    <select
                      value={seedingForm.aguaje}
                      onChange={(e) => setSeedingForm({ ...seedingForm, aguaje: e.target.value })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                    >
                      <option value="AGUAJE 1">AGUAJE 1</option>
                      <option value="AGUAJE 2">AGUAJE 2</option>
                      <option value="QUIEBRA 1">QUIEBRA 1</option>
                      <option value="QUIEBRA 2">QUIEBRA 2</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Fecha de Siembra *</label>
                    <input
                      type="date"
                      required
                      value={seedingForm.seeding_date}
                      onChange={(e) => setSeedingForm({ ...seedingForm, seeding_date: e.target.value })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Fecha Transferencia</label>
                    <input
                      type="date"
                      value={seedingForm.transfer_date}
                      onChange={(e) => setSeedingForm({ ...seedingForm, transfer_date: e.target.value })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Cantidad de Larvas *</label>
                    <input
                      type="number"
                      required
                      value={seedingForm.animals}
                      onChange={(e) => setSeedingForm({ ...seedingForm, animals: parseInt(e.target.value) })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Laboratorio Origen</label>
                    <input
                      type="text"
                      value={seedingForm.laboratory}
                      onChange={(e) => setSeedingForm({ ...seedingForm, laboratory: e.target.value.toUpperCase() })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                      placeholder="Ej: LAB COFIMAR"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Cepa de Nauplio</label>
                    <input
                      type="text"
                      value={seedingForm.nauplio}
                      onChange={(e) => setSeedingForm({ ...seedingForm, nauplio: e.target.value.toUpperCase() })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                      placeholder="Ej: CEPA WILD"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Sobrevivencia Estimada (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={seedingForm.survival_pct}
                      onChange={(e) => setSeedingForm({ ...seedingForm, survival_pct: parseFloat(e.target.value) })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Ablación</label>
                    <select
                      value={seedingForm.ablation}
                      onChange={(e) => setSeedingForm({ ...seedingForm, ablation: e.target.value })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                    >
                      <option value="SÍ">SÍ (Ablada)</option>
                      <option value="NO">NO (Sin ablar)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Peso Inicial (Gramaje W) *</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={seedingForm.weight_gr}
                      onChange={(e) => setSeedingForm({ ...seedingForm, weight_gr: parseFloat(e.target.value) })}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {/* --- CYCLES FORM --- */}
              {activeTab === 'cycles' && (
                <div className="space-y-6">
                  {/* Sección 1: Datos Generales */}
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cofimar-primary border-b border-cofimar-border/30 pb-1.5 mb-3">1. DATOS GENERALES</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Piscina *</label>
                        <select
                          required
                          value={cycleForm.pond_code}
                          onChange={(e) => handleCyclePondChange(e.target.value)}
                          className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                        >
                          {allPondsCatalog.map((p) => (
                            <option key={p.code} value={p.code}>{p.code}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Aguaje *</label>
                        <select
                          value={cycleForm.aguaje}
                          onChange={(e) => setCycleForm({ ...cycleForm, aguaje: e.target.value })}
                          className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                        >
                          <option value="AGUAJE 1">AGUAJE 1</option>
                          <option value="AGUAJE 2">AGUAJE 2</option>
                          <option value="QUIEBRA 1">QUIEBRA 1</option>
                          <option value="QUIEBRA 2">QUIEBRA 2</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Fecha de Cosecha *</label>
                        <input
                          type="date"
                          required
                          value={cycleForm.harvest_date}
                          onChange={(e) => {
                            const dateStr = e.target.value;
                            if (dateStr) {
                              const dateParts = dateStr.split('-');
                              if (dateParts.length === 3) {
                                const parsedYear = parseInt(dateParts[0], 10);
                                const monthIdx = parseInt(dateParts[1], 10) - 1;
                                const monthsList = [
                                  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                                  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
                                ];
                                const parsedMonth = monthsList[monthIdx] || '';
                                setCycleForm({
                                  ...cycleForm,
                                  harvest_date: dateStr,
                                  year: parsedYear,
                                  month: parsedMonth
                                });
                                return;
                              }
                            }
                            setCycleForm({ ...cycleForm, harvest_date: dateStr });
                          }}
                          className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Año / Mes</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={cycleForm.year}
                            onChange={(e) => setCycleForm({ ...cycleForm, year: parseInt(e.target.value) })}
                            className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                            placeholder="Año"
                          />
                          <select
                            value={cycleForm.month}
                            onChange={(e) => setCycleForm({ ...cycleForm, month: e.target.value })}
                            className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                          >
                            <option value="">MES...</option>
                            <option value="ENERO">ENERO</option>
                            <option value="FEBRERO">FEBRERO</option>
                            <option value="MARZO">MARZO</option>
                            <option value="ABRIL">ABRIL</option>
                            <option value="MAYO">MAYO</option>
                            <option value="JUNIO">JUNIO</option>
                            <option value="JULIO">JULIO</option>
                            <option value="AGOSTO">AGOSTO</option>
                            <option value="SEPTIEMBRE">SEPTIEMBRE</option>
                            <option value="OCTUBRE">OCTUBRE</option>
                            <option value="NOVIEMBRE">NOVIEMBRE</option>
                            <option value="DICIEMBRE">DICIEMBRE</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Jefe de Sector</label>
                        <input
                          type="text"
                          value={cycleForm.sector_chief}
                          onChange={(e) => setCycleForm({ ...cycleForm, sector_chief: e.target.value })}
                          className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                          placeholder="Ej: GUSTAVO CARRASCO"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Hectáreas / Sector</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={cycleForm.hectares}
                            onChange={(e) => setCycleForm({ ...cycleForm, hectares: parseFloat(e.target.value) })}
                            className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                            placeholder="Hectáreas"
                          />
                          <select
                            value={cycleForm.sector}
                            onChange={(e) => {
                              const sec = e.target.value;
                              setCycleForm({
                                ...cycleForm,
                                sector: sec,
                                sector_chief: SECTOR_CHIEFS[sec] || cycleForm.sector_chief
                              });
                            }}
                            className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                          >
                            <option value="">SECTOR...</option>
                            <option value="BARRACUDA">BARRACUDA</option>
                            <option value="CATANUDA">CATANUDA</option>
                            <option value="CHERNA">CHERNA</option>
                            <option value="DELFIN">DELFIN</option>
                            <option value="DORADO">DORADO</option>
                            <option value="GUATO">GUATO</option>
                            <option value="MANTARRAYA">MANTARRAYA</option>
                            <option value="MERO">MERO</option>
                            <option value="PAMPANO">PAMPANO</option>
                            <option value="PARGO ROJO">PARGO ROJO</option>
                            <option value="ROBALO">ROBALO</option>
                            <option value="TAMBULERO">TAMBULERO</option>
                            <option value="TIBURON">TIBURON</option>
                            <option value="TUNA">TUNA</option>
                            <option value="WAHOO">WAHOO</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sección 2: Datos de Siembra */}
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cofimar-primary border-b border-cofimar-border/30 pb-1.5 mb-3">2. DATOS DE SIEMBRA</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Fecha de Siembra</label>
                        <input
                          type="date"
                          value={cycleForm.seeding_date}
                          onChange={(e) => setCycleForm({ ...cycleForm, seeding_date: e.target.value })}
                          className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Larvas Sembradas</label>
                        <input
                          type="number"
                          value={cycleForm.animals_seeded}
                          onChange={(e) => setCycleForm({ ...cycleForm, animals_seeded: parseInt(e.target.value) })}
                          className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Laboratorio / Nauplio</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={cycleForm.laboratory}
                            onChange={(e) => setCycleForm({ ...cycleForm, laboratory: e.target.value.toUpperCase() })}
                            className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                            placeholder="Laboratorio"
                          />
                          <input
                            type="text"
                            value={cycleForm.nauplio}
                            onChange={(e) => setCycleForm({ ...cycleForm, nauplio: e.target.value.toUpperCase() })}
                            className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                            placeholder="Nauplio"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Días / Secos / Pre</label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            value={cycleForm.days}
                            onChange={(e) => setCycleForm({ ...cycleForm, days: parseInt(e.target.value) })}
                            className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-2 py-2.5 font-mono text-xs text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                            placeholder="Días"
                          />
                          <input
                            type="number"
                            value={cycleForm.dry_days}
                            onChange={(e) => setCycleForm({ ...cycleForm, dry_days: parseInt(e.target.value) })}
                            className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-2 py-2.5 font-mono text-xs text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                            placeholder="Secos"
                          />
                          <input
                            type="text"
                            value={cycleForm.pre}
                            onChange={(e) => setCycleForm({ ...cycleForm, pre: e.target.value })}
                            className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-2 py-2.5 font-mono text-xs text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                            placeholder="Pre-criad"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sección 3: Raleos y Cosecha */}
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cofimar-primary border-b border-cofimar-border/30 pb-1.5 mb-3">3. RESULTADOS DE COSECHA</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Raleos */}
                      <div className="space-y-3 p-3.5 bg-cofimar-surface-secondary rounded-xl border border-cofimar-border/20">
                        <span className="text-[10px] font-mono font-bold text-cofimar-accent block uppercase">Raleo (Parcial)</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-cofimar-text-muted uppercase block">Lbs Raleo Cam.</label>
                            <input
                              type="number"
                              value={cycleForm.lbs_trawl_farm}
                              onChange={(e) => setCycleForm({ ...cycleForm, lbs_trawl_farm: parseFloat(e.target.value) })}
                              className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2 font-mono text-xs text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-cofimar-text-muted uppercase block">Gr Raleo Cam.</label>
                            <input
                              type="number"
                              step="0.01"
                              value={cycleForm.gr_trawl_farm}
                              onChange={(e) => setCycleForm({ ...cycleForm, gr_trawl_farm: parseFloat(e.target.value) })}
                              className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2 font-mono text-xs text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-cofimar-text-muted uppercase block">Lbs Raleo Planta</label>
                            <input
                              type="number"
                              value={cycleForm.lbs_trawl_plant}
                              onChange={(e) => setCycleForm({ ...cycleForm, lbs_trawl_plant: parseFloat(e.target.value) })}
                              className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2 font-mono text-xs text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-cofimar-text-muted uppercase block">Gr Raleo Planta</label>
                            <input
                              type="number"
                              step="0.01"
                              value={cycleForm.gr_trawl_plant}
                              onChange={(e) => setCycleForm({ ...cycleForm, gr_trawl_plant: parseFloat(e.target.value) })}
                              className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2 font-mono text-xs text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cosecha Final */}
                      <div className="space-y-3 p-3.5 bg-cofimar-surface-secondary rounded-xl border border-cofimar-border/20">
                        <span className="text-[10px] font-mono font-bold text-cofimar-success block uppercase">Pesca (Final)</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-cofimar-text-muted uppercase block">Lbs Pesca Cam.</label>
                            <input
                              type="number"
                              value={cycleForm.lbs_harvest_farm}
                              onChange={(e) => setCycleForm({ ...cycleForm, lbs_harvest_farm: parseFloat(e.target.value) })}
                              className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2 font-mono text-xs text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-cofimar-text-muted uppercase block">Gr Pesca Cam.</label>
                            <input
                              type="number"
                              step="0.01"
                              value={cycleForm.gr_harvest_farm}
                              onChange={(e) => setCycleForm({ ...cycleForm, gr_harvest_farm: parseFloat(e.target.value) })}
                              className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2 font-mono text-xs text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-cofimar-text-muted uppercase block">Lbs Pesca Planta</label>
                            <input
                              type="number"
                              value={cycleForm.lbs_harvest_plant}
                              onChange={(e) => setCycleForm({ ...cycleForm, lbs_harvest_plant: parseFloat(e.target.value) })}
                              className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2 font-mono text-xs text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-cofimar-text-muted uppercase block">Gr Pesca Planta</label>
                            <input
                              type="number"
                              step="0.01"
                              value={cycleForm.gr_harvest_plant}
                              onChange={(e) => setCycleForm({ ...cycleForm, gr_harvest_plant: parseFloat(e.target.value) })}
                              className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2 font-mono text-xs text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sección 4: Alimento Balanceado */}
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cofimar-primary border-b border-cofimar-border/30 pb-1.5 mb-3">4. CONTROL DE ALIMENTO BALANCEADO</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Libras de Balanceado (feed_lbs) *</label>
                        <input
                          type="number"
                          required
                          value={cycleForm.feed_lbs}
                          onChange={(e) => setCycleForm({ ...cycleForm, feed_lbs: parseFloat(e.target.value) })}
                          className="w-full bg-cofimar-bg/50 border border-cofimar-primary/40 rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200 font-bold"
                          placeholder="Ej: 95000"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Proveedor Balanceado</label>
                        <select
                          value={cycleForm.feed_supplier}
                          onChange={(e) => setCycleForm({ ...cycleForm, feed_supplier: e.target.value })}
                          className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                        >
                          <option value="">PROVEEDOR...</option>
                          <option value="SK">SK (Skretting)</option>
                          <option value="NC">NC (Nicovita)</option>
                          <option value="CG">CG (Cargill)</option>
                          <option value="VP">VP (Vitapro)</option>
                          <option value="AL">AL (Alicorp)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Modo Alimentación</label>
                        <select
                          value={cycleForm.feeding_mode}
                          onChange={(e) => setCycleForm({ ...cycleForm, feeding_mode: e.target.value })}
                          className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                        >
                          <option value="AUTOMATICA">AUTOMÁTICA</option>
                          <option value="BOLEO">BOLEO (Manual)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-cofimar-border/60 flex items-center justify-end space-x-3.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-text-muted hover:text-cofimar-text font-bold px-5 py-2.5 rounded-xl border border-cofimar-border transition duration-200 text-xs font-mono"
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

export default RegistroData;
