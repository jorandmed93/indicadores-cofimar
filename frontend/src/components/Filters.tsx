import React from 'react';
import { RefreshCw, Filter } from 'lucide-react';

interface FiltersProps {
  years: number[];
  aguajes: string[];
  months: string[];
  sectors: string[];
  certifications: string[];
  
  selectedYear: string;
  setSelectedYear: (val: string) => void;
  selectedAguaje: string;
  setSelectedAguaje: (val: string) => void;
  selectedMonth: string;
  setSelectedMonth: (val: string) => void;
  selectedSector: string;
  setSelectedSector: (val: string) => void;
  selectedCert: string;
  setSelectedCert: (val: string) => void;
  
  onReset: () => void;
}

const selectClass = "bg-cofimar-surface border border-cofimar-border text-cofimar-text text-xs px-3.5 py-2 rounded-lg focus:border-cofimar-primary focus:outline-none transition shadow-sm";

const Filters: React.FC<FiltersProps> = ({
  years,
  aguajes,
  months,
  sectors,
  certifications,
  selectedYear,
  setSelectedYear,
  selectedAguaje,
  setSelectedAguaje,
  selectedMonth,
  setSelectedMonth,
  selectedSector,
  setSelectedSector,
  selectedCert,
  setSelectedCert,
  onReset,
}) => {
  return (
    <div className="glass-card p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 bg-cofimar-primary/10 rounded-lg flex items-center justify-center border border-cofimar-primary/20">
          <Filter className="w-4 h-4 text-cofimar-primary" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-cofimar-text">Filtros Avanzados</h4>
          <p className="text-[10px] text-cofimar-text-muted">Analiza sectores y aguajes en tiempo real</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:flex md:items-center gap-3 flex-1 justify-end max-w-5xl">
        {/* Year */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-cofimar-text-muted uppercase tracking-wider mb-1">Año</span>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={`${selectClass} min-w-[90px]`}>
            <option value="">TODOS</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Sector */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-cofimar-text-muted uppercase tracking-wider mb-1">Sector</span>
          <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)} className={`${selectClass} min-w-[130px]`}>
            <option value="">TODOS</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Aguaje */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-cofimar-text-muted uppercase tracking-wider mb-1">Aguaje</span>
          <select value={selectedAguaje} onChange={(e) => setSelectedAguaje(e.target.value)} className={`${selectClass} min-w-[110px]`}>
            <option value="">TODOS</option>
            {aguajes.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Month */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-cofimar-text-muted uppercase tracking-wider mb-1">Mes</span>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={`${selectClass} min-w-[110px]`}>
            <option value="">TODOS</option>
            {months.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
          </select>
        </div>

        {/* Certification */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-cofimar-text-muted uppercase tracking-wider mb-1">Certificación</span>
          <select value={selectedCert} onChange={(e) => setSelectedCert(e.target.value)} className={`${selectClass} min-w-[130px]`}>
            <option value="">TODOS</option>
            {certifications.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Reset */}
        <div className="flex items-end h-full">
          <button
            onClick={onReset}
            className="w-full md:w-auto h-[38px] flex items-center justify-center space-x-2 bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover border border-cofimar-border text-cofimar-text px-4 rounded-lg transition duration-150 mt-5 md:mt-0 font-medium text-xs font-mono shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cofimar-primary" />
            <span>LIMPIAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
