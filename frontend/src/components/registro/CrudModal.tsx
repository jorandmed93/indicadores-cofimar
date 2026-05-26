import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, RefreshCw, Save } from 'lucide-react';
import client from '../../api/client';

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
  'WAHOO': 'JUNIOR ESQUIVEL',
  'COCORA': 'JEFE COCORA',
  'MARIA': 'JEFE MARIA',
  'CHUPADORES': 'JEFE CHUPADORES',
  'SOLEDAD': 'JEFE SOLEDAD'
};

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  editMode: boolean;
  selectedId: any;
  activeTab: 'ponds' | 'seedings' | 'harvests' | 'cycles' | 'closed_cycles';
  allPondsCatalog: any[];
  onSuccess: (msg: string) => void;
  // Preset forms if opened from a specific context
  presetHarvestForm?: any;
}

export const CrudModal: React.FC<CrudModalProps> = ({
  isOpen,
  onClose,
  editMode,
  selectedId,
  activeTab,
  allPondsCatalog,
  onSuccess,
  presetHarvestForm
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forms
  const [pondForm, setPondForm] = useState({
    code: '',
    sector: '',
    hectares: 0,
    certification: 'ASC',
    sector_chief: ''
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
    weight_gr: 0.05,
    dry_days: 0
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

  // Fetch record on edit mode
  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    const fetchRecord = async () => {
      setLoading(true);
      try {
        if (editMode && selectedId !== null) {
          if (activeTab === 'ponds') {
            const res = await client.get(`/ponds`);
            const matched = res.data.find((p: any) => p.code === selectedId);
            if (matched) {
              setPondForm({
                code: matched.code,
                sector: matched.sector || '',
                hectares: parseFloat(matched.hectares || 0),
                certification: matched.certification || 'ASC',
                sector_chief: matched.sector_chief || ''
              });
            }
          } else if (activeTab === 'harvests') {
            const res = await client.get(`/harvests/${selectedId}`);
            const matched = res.data;
            if (matched) {
              setHarvestForm({
                pond_code: matched.pond_code || '',
                activity: matched.activity || 'PESCA',
                harvest_date: matched.harvest_date || '',
                lbs_farm: parseFloat(matched.lbs_farm || 0),
                lbs_plant: parseFloat(matched.lbs_plant || 0),
                gr_farm: parseFloat(matched.gr_farm || 0),
                gr_plant: parseFloat(matched.gr_plant || 0),
                sector_chief: matched.sector_chief || '',
                certification: matched.certification || 'ASC',
                feed_lbs: parseFloat(matched.feed_lbs || 0),
                feed_supplier: matched.feed_supplier || '',
                feeding_mode: matched.feeding_mode || 'AUTOMATICA'
              });
            }
          } else if (activeTab === 'seedings') {
            const res = await client.get(`/seedings/${selectedId}`);
            const matched = res.data;
            if (matched) {
              setSeedingForm({
                pond_code: matched.pond_code || '',
                aguaje: matched.aguaje || 'AGUAJE 1',
                seeding_date: matched.seeding_date || '',
                transfer_date: matched.transfer_date || '',
                animals: parseInt(matched.animals || 0),
                ablation: matched.ablation || 'NO',
                nauplio: matched.nauplio || '',
                laboratory: matched.laboratory || '',
                survival_pct: parseFloat(matched.survival_pct || 0),
                pre_criadero: matched.pre_criadero || '',
                weight_gr: parseFloat(matched.weight_gr || 0.05),
                dry_days: parseInt(matched.dry_days || 0)
              });
            }
          } else if (activeTab === 'cycles' || activeTab === 'closed_cycles') {
            const res = await client.get(`/cycles/${selectedId}`);
            const matched = res.data;
            if (matched) {
              setCycleForm({
                harvest_date: matched.harvest_date || '',
                year: parseInt(matched.year || new Date().getFullYear()),
                aguaje: matched.aguaje || 'AGUAJE 1',
                month: matched.month || '',
                pond_code: matched.pond_code || '',
                pond_name: matched.pond_name || '',
                sector: matched.sector || '',
                hectares: parseFloat(matched.hectares || 0),
                certification: matched.certification || 'ASC',
                days: parseInt(matched.days || 0),
                seeding_date: matched.seeding_date || '',
                pre: matched.pre || '',
                seeding_weight: parseFloat(matched.seeding_weight || 0),
                dry_days: parseInt(matched.dry_days || 0),
                animals_seeded: parseInt(matched.animals_seeded || 0),
                laboratory: matched.laboratory || '',
                nauplio: matched.nauplio || '',
                lbs_trawl_farm: parseFloat(matched.lbs_trawl_farm || 0),
                lbs_trawl_plant: parseFloat(matched.lbs_trawl_plant || 0),
                gr_trawl_farm: parseFloat(matched.gr_trawl_farm || 0),
                gr_trawl_plant: parseFloat(matched.gr_trawl_plant || 0),
                lbs_harvest_farm: parseFloat(matched.lbs_harvest_farm || 0),
                lbs_harvest_plant: parseFloat(matched.lbs_harvest_plant || 0),
                gr_harvest_farm: parseFloat(matched.gr_harvest_farm || 0),
                gr_harvest_plant: parseFloat(matched.gr_harvest_plant || 0),
                feed_lbs: parseFloat(matched.feed_lbs || 0),
                feed_supplier: matched.feed_supplier || '',
                feeding_mode: matched.feeding_mode || 'AUTOMATICA',
                sector_chief: matched.sector_chief || ''
              });
            }
          }
        } else {
          // Initialize for creation
          setPondForm({ code: '', sector: '', hectares: 0, certification: 'ASC', sector_chief: '' });
          
          if (presetHarvestForm) {
            setHarvestForm({ ...presetHarvestForm });
          } else {
            const firstPond = allPondsCatalog[0];
            const initialCode = firstPond?.code || '';
            const initialChief = firstPond?.sector_chief || (firstPond?.sector ? SECTOR_CHIEFS[firstPond.sector.toUpperCase()] : '') || '';
            const initialCert = firstPond?.certification || 'ASC';

            setHarvestForm({
              pond_code: initialCode,
              activity: 'PESCA',
              harvest_date: new Date().toISOString().split('T')[0],
              lbs_farm: 0,
              lbs_plant: 0,
              gr_farm: 0,
              gr_plant: 0,
              sector_chief: initialChief,
              certification: initialCert,
              feed_lbs: 0,
              feed_supplier: '',
              feeding_mode: 'AUTOMATICA'
            });
          }

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
            weight_gr: 0.05,
            dry_days: 0
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
        }
      } catch (err: any) {
        console.error(err);
        setError('Error al inicializar el formulario.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [isOpen, editMode, selectedId, activeTab, presetHarvestForm]);

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
      setCycleForm({ ...cycleForm, pond_code: code });
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
          onSuccess('Piscina actualizada correctamente.');
        } else {
          await client.post('/ponds', pondForm);
          onSuccess('Piscina creada correctamente.');
        }
      } else if (activeTab === 'harvests') {
        if (editMode) {
          await client.put(`/harvests/${selectedId}`, harvestForm);
          onSuccess('Cosecha actualizada y KPIs recalculados.');
        } else {
          await client.post('/harvests', harvestForm);
          onSuccess('Cosecha guardada correctamente.');
        }
      } else if (activeTab === 'seedings') {
        if (editMode) {
          await client.put(`/seedings/${selectedId}`, seedingForm);
          onSuccess('Siembra actualizada correctamente.');
        } else {
          await client.post('/seedings', seedingForm);
          onSuccess('Siembra registrada correctamente.');
        }
      } else if (activeTab === 'cycles' || activeTab === 'closed_cycles') {
        if (editMode) {
          await client.put(`/cycles/${selectedId}`, cycleForm);
          onSuccess('Ciclo productivo actualizado y KPIs recalculados.');
        } else {
          await client.post('/cycles', cycleForm);
          onSuccess('Ciclo productivo registrado correctamente.');
        }
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Error al guardar la información. Verifique los campos obligatorios.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
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
            onClick={onClose}
            className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover p-2 rounded-lg border border-cofimar-border text-cofimar-text-muted hover:text-cofimar-text transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error inside modal */}
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
                  onChange={(e) => setPondForm({ ...pondForm, hectares: parseFloat(e.target.value) || 0 })}
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

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Responsable de Sector / Jefe</label>
                <input
                  type="text"
                  value={pondForm.sector_chief}
                  onChange={(e) => setPondForm({ ...pondForm, sector_chief: e.target.value.toUpperCase() })}
                  className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                  placeholder="Ej: GUSTAVO CARRASCO"
                />
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
                  onChange={(e) => {
                    const selectedCode = e.target.value;
                    const matched = allPondsCatalog.find(p => p.code === selectedCode);
                    setHarvestForm({
                      ...harvestForm,
                      pond_code: selectedCode,
                      sector_chief: matched ? matched.sector_chief || '' : harvestForm.sector_chief,
                      certification: matched ? matched.certification || 'ASC' : harvestForm.certification
                    });
                  }}
                  className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                >
                  <option value="">Seleccione Piscina...</option>
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
                  onChange={(e) => setHarvestForm({ ...harvestForm, lbs_farm: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Libras Planta (Plant Lbs) *</label>
                <input
                  type="number"
                  required
                  value={harvestForm.lbs_plant}
                  onChange={(e) => setHarvestForm({ ...harvestForm, lbs_plant: parseFloat(e.target.value) || 0 })}
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
                  onChange={(e) => setHarvestForm({ ...harvestForm, gr_farm: parseFloat(e.target.value) || 0 })}
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
                  onChange={(e) => setHarvestForm({ ...harvestForm, gr_plant: parseFloat(e.target.value) || 0 })}
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
                      onChange={(e) => setHarvestForm({ ...harvestForm, feed_lbs: parseFloat(e.target.value) || 0 })}
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
                  <option value="">Seleccione Piscina...</option>
                  {allPondsCatalog.map((p) => (
                    <option key={p.code} value={p.code}>{p.code}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Aguaje *</label>
                <input
                  type="text"
                  required
                  value={seedingForm.aguaje}
                  onChange={(e) => setSeedingForm({ ...seedingForm, aguaje: e.target.value })}
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (/^\d+$/.test(val)) {
                      setSeedingForm({ ...seedingForm, aguaje: `AGUAJE ${val}` });
                    } else {
                      setSeedingForm({ ...seedingForm, aguaje: val.toUpperCase() });
                    }
                  }}
                  className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                  placeholder="Ej: AGUAJE 11 o 11"
                />
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
                  onChange={(e) => setSeedingForm({ ...seedingForm, animals: parseInt(e.target.value) || 0 })}
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
                  onChange={(e) => setSeedingForm({ ...seedingForm, survival_pct: parseFloat(e.target.value) || 0 })}
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
                <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Pre-Criadero</label>
                <input
                  type="text"
                  value={seedingForm.pre_criadero}
                  onChange={(e) => setSeedingForm({ ...seedingForm, pre_criadero: e.target.value.toUpperCase() })}
                  className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                  placeholder="Ej: PRE-CRIADERO A"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Peso Inicial (Gramaje W) *</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={seedingForm.weight_gr}
                  onChange={(e) => setSeedingForm({ ...seedingForm, weight_gr: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Días Secos de Piscina</label>
                <input
                  type="number"
                  value={seedingForm.dry_days}
                  onChange={(e) => setSeedingForm({ ...seedingForm, dry_days: parseInt(e.target.value) || 0 })}
                  className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                  placeholder="Ej: 15"
                />
              </div>
            </div>
          )}

          {/* --- CYCLES FORM --- */}
          {(activeTab === 'cycles' || activeTab === 'closed_cycles') && (
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
                      <option value="">Seleccione Piscina...</option>
                      {allPondsCatalog.map((p) => (
                        <option key={p.code} value={p.code}>{p.code}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-cofimar-text-muted uppercase block">Aguaje *</label>
                    <input
                      type="text"
                      required
                      value={cycleForm.aguaje}
                      onChange={(e) => setCycleForm({ ...cycleForm, aguaje: e.target.value })}
                      onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (/^\d+$/.test(val)) {
                          setCycleForm({ ...cycleForm, aguaje: `AGUAJE ${val}` });
                        } else {
                          setCycleForm({ ...cycleForm, aguaje: val.toUpperCase() });
                        }
                      }}
                      className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-lg px-4 py-2.5 font-mono text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                      placeholder="Ej: AGUAJE 11 o 11"
                    />
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
                        onChange={(e) => setCycleForm({ ...cycleForm, year: parseInt(e.target.value) || 0 })}
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
                        onChange={(e) => setCycleForm({ ...cycleForm, hectares: parseFloat(e.target.value) || 0 })}
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
                        {Object.keys(SECTOR_CHIEFS).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
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
                      onChange={(e) => setCycleForm({ ...cycleForm, animals_seeded: parseInt(e.target.value) || 0 })}
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
                        onChange={(e) => setCycleForm({ ...cycleForm, days: parseInt(e.target.value) || 0 })}
                        className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-2 py-2.5 font-mono text-xs text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                        placeholder="Días"
                      />
                      <input
                        type="number"
                        value={cycleForm.dry_days}
                        onChange={(e) => setCycleForm({ ...cycleForm, dry_days: parseInt(e.target.value) || 0 })}
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
                          onChange={(e) => setCycleForm({ ...cycleForm, lbs_trawl_farm: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2 font-mono text-xs text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-cofimar-text-muted uppercase block">Gr Raleo Cam.</label>
                        <input
                          type="number"
                          step="0.01"
                          value={cycleForm.gr_trawl_farm}
                          onChange={(e) => setCycleForm({ ...cycleForm, gr_trawl_farm: parseFloat(e.target.value) || 0 })}
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
                          onChange={(e) => setCycleForm({ ...cycleForm, lbs_trawl_plant: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2 font-mono text-xs text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-cofimar-text-muted uppercase block">Gr Raleo Planta</label>
                        <input
                          type="number"
                          step="0.01"
                          value={cycleForm.gr_trawl_plant}
                          onChange={(e) => setCycleForm({ ...cycleForm, gr_trawl_plant: parseFloat(e.target.value) || 0 })}
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
                          onChange={(e) => setCycleForm({ ...cycleForm, lbs_harvest_farm: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2 font-mono text-xs text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-cofimar-text-muted uppercase block">Gr Pesca Cam.</label>
                        <input
                          type="number"
                          step="0.01"
                          value={cycleForm.gr_harvest_farm}
                          onChange={(e) => setCycleForm({ ...cycleForm, gr_harvest_farm: parseFloat(e.target.value) || 0 })}
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
                          onChange={(e) => setCycleForm({ ...cycleForm, lbs_harvest_plant: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-cofimar-bg/50 border border-cofimar-border rounded-xl px-3 py-2 font-mono text-xs text-cofimar-text focus:outline-none focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-cofimar-text-muted uppercase block">Gr Pesca Planta</label>
                        <input
                          type="number"
                          step="0.01"
                          value={cycleForm.gr_harvest_plant}
                          onChange={(e) => setCycleForm({ ...cycleForm, gr_harvest_plant: parseFloat(e.target.value) || 0 })}
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
                      onChange={(e) => setCycleForm({ ...cycleForm, feed_lbs: parseFloat(e.target.value) || 0 })}
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
              onClick={onClose}
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
  );
};
