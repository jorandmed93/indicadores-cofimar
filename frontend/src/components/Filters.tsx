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
    <div className="glass-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg border border-cofimar-border/50">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 bg-cofimar-primary/10 rounded-lg flex items-center justify-center border border-cofimar-primary/20">
          <Filter className="w-4 h-4 text-cofimar-primary" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Filtros Avanzados</h4>
          <p className="text-[10px] text-slate-400">Analiza sectores y aguajes en tiempo real</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:flex md:items-center gap-3 flex-1 justify-end max-w-5xl">
        {/* Year Filter */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Año</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-cofimar-bg/80 border border-cofimar-border text-slate-200 text-xs px-3.5 py-2 rounded-xl focus:border-cofimar-primary focus:outline-none transition min-w-[90px]"
          >
            <option value="">TODOS</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Sector Filter */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Sector</span>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-cofimar-bg/80 border border-cofimar-border text-slate-200 text-xs px-3.5 py-2 rounded-xl focus:border-cofimar-primary focus:outline-none transition min-w-[130px]"
          >
            <option value="">TODOS</option>
            {sectors.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Aguaje Filter */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Aguaje</span>
          <select
            value={selectedAguaje}
            onChange={(e) => setSelectedAguaje(e.target.value)}
            className="bg-cofimar-bg/80 border border-cofimar-border text-slate-200 text-xs px-3.5 py-2 rounded-xl focus:border-cofimar-primary focus:outline-none transition min-w-[110px]"
          >
            <option value="">TODOS</option>
            {aguajes.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Mes</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-cofimar-bg/80 border border-cofimar-border text-slate-200 text-xs px-3.5 py-2 rounded-xl focus:border-cofimar-primary focus:outline-none transition min-w-[110px]"
          >
            <option value="">TODOS</option>
            {months.map(m => (
              <option key={m} value={m}>{m.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Certification Filter */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Certificación</span>
          <select
            value={selectedCert}
            onChange={(e) => setSelectedCert(e.target.value)}
            className="bg-cofimar-bg/80 border border-cofimar-border text-slate-200 text-xs px-3.5 py-2 rounded-xl focus:border-cofimar-primary focus:outline-none transition min-w-[130px]"
          >
            <option value="">TODOS</option>
            {certifications.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end h-full">
          <button
            onClick={onReset}
            className="w-full md:w-auto h-[38px] flex items-center justify-center space-x-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-slate-300 hover:text-white px-4 rounded-xl transition duration-200 mt-5 md:mt-0 font-medium text-xs font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>LIMPIAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
