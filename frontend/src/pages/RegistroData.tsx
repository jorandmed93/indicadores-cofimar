import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  Layers, Anchor, Fish, Plus, AlertTriangle, RefreshCw, CheckCircle2 
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
              <PondsTab 
                ponds={ponds} 
                role={role} 
                onEdit={handleOpenEdit} 
                onDelete={handleDelete} 
              />
            )}
            {activeTab === 'seedings' && (
              <SeedingsTab 
                seedings={seedings} 
                role={role} 
                onEdit={handleOpenEdit} 
                onDelete={handleDelete} 
              />
            )}
            {activeTab === 'harvests' && (
              <HarvestsTab 
                harvests={harvests} 
                role={role} 
                onEdit={handleOpenEdit} 
                onDelete={handleDelete} 
              />
            )}
            {(activeTab === 'cycles' || activeTab === 'closed_cycles') && (
              <CyclesTab 
                cycles={cycles} 
                role={role} 
                activeTab={activeTab} 
                onRegisterHarvest={handleRegisterHarvestForCycle} 
                onEdit={handleOpenEdit} 
                onDelete={handleDelete} 
              />
            )}
          </div>
        )}
      </div>

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
