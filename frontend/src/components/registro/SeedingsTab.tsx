import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface SeedingsTabProps {
  seedings: any[];
  role: 'admin' | 'viewer';
  onEdit: (seeding: any) => void;
  onDelete: (id: number) => void;
  isExcelMode?: boolean;
  onRowChange?: (id: string, field: string, value: any) => void;
  editedRows?: Record<string, any>;
}

const inlineInputClass = "bg-cofimar-bg border border-cofimar-border/60 focus:border-cofimar-primary rounded px-1.5 py-0.5 w-full text-[11px] font-mono text-cofimar-text focus:outline-none transition-all duration-150";

export const SeedingsTab: React.FC<SeedingsTabProps> = ({ 
  seedings, role, onEdit, onDelete, isExcelMode = false, onRowChange, editedRows 
}) => {
  return (
    <table className="w-full text-left border-collapse">
      <thead className="bg-cofimar-surface-secondary text-cofimar-text-muted font-mono text-xs border-b border-cofimar-border/60">
        <tr>
          <th className="py-4 px-4 w-[110px]">PISCINA</th>
          <th className="py-4 px-4 w-[110px]">AGUAJE</th>
          <th className="py-4 px-4 w-[120px]">FECHA SIEMBRA</th>
          <th className="py-4 px-4 text-right w-[140px]">LARVAS SEMBRADAS</th>
          <th className="py-4 px-4 w-[120px]">LABORATORIO</th>
          <th className="py-4 px-4 w-[120px]">NAUPLIO</th>
          <th className="py-4 px-4 w-[120px]">PRE-CRIADERO</th>
          <th className="py-4 px-4 text-right w-[90px]">DÍAS SECOS</th>
          <th className="py-4 px-4 text-right w-[110px]">SOBREVIVENCIA</th>
          <th className="py-4 px-4 text-center w-[110px]">ESTADO</th>
          {role === 'admin' && <th className="py-4 px-4 text-center w-[110px]">ACCIONES</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-cofimar-border/25 font-mono text-xs">
        {seedings.length === 0 ? (
          <tr>
            <td colSpan={role === 'admin' ? 11 : 10} className="py-12 text-center text-cofimar-text-muted">
              No hay siembras registradas.
            </td>
          </tr>
        ) : (
          seedings.map((s, idx) => {
            const rowId = s.id.toString();
            const rowEdits = editedRows?.[rowId] || {};
            const isRowEdited = Object.keys(rowEdits).length > 0;

            const aguajeVal = rowEdits.aguaje !== undefined ? rowEdits.aguaje : s.aguaje || '';
            const seedingDateVal = rowEdits.seeding_date !== undefined ? rowEdits.seeding_date : s.seeding_date || '';
            const animalsVal = rowEdits.animals !== undefined ? rowEdits.animals : s.animals || 0;
            const labVal = rowEdits.laboratory !== undefined ? rowEdits.laboratory : s.laboratory || '';
            const nauplioVal = rowEdits.nauplio !== undefined ? rowEdits.nauplio : s.nauplio || '';
            const preVal = rowEdits.pre_criadero !== undefined ? rowEdits.pre_criadero : s.pre_criadero || '';
            const dryDaysVal = rowEdits.dry_days !== undefined ? rowEdits.dry_days : s.dry_days || 0;
            const survivalVal = rowEdits.survival_pct !== undefined ? rowEdits.survival_pct : s.survival_pct || 0;

            return (
              <tr 
                key={idx} 
                className={`hover:bg-cofimar-surface-secondary/80 transition ${
                  isExcelMode ? 'bg-cofimar-surface/30' : ''
                } ${isRowEdited ? 'bg-cofimar-primary/5 hover:bg-cofimar-primary/10' : ''}`}
              >
                {/* Piscina (Read-only) */}
                <td className="py-3 px-4 font-bold text-cofimar-primary">{s.pond_code}</td>

                {/* Aguaje */}
                <td className="py-3 px-4">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="text" 
                      className={inlineInputClass}
                      value={aguajeVal}
                      onChange={(e) => onRowChange?.(rowId, 'aguaje', e.target.value.toUpperCase())}
                    />
                  ) : (
                    <span className="text-cofimar-text">{s.aguaje}</span>
                  )}
                </td>

                {/* Fecha Siembra */}
                <td className="py-3 px-4">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="date" 
                      className={inlineInputClass}
                      value={seedingDateVal}
                      onChange={(e) => onRowChange?.(rowId, 'seeding_date', e.target.value)}
                    />
                  ) : (
                    <span className="text-cofimar-text-muted font-mono">{s.seeding_date}</span>
                  )}
                </td>

                {/* Larvas Sembradas */}
                <td className="py-3 px-4 text-right">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="number" 
                      className={`${inlineInputClass} text-right`}
                      value={animalsVal}
                      onChange={(e) => onRowChange?.(rowId, 'animals', e.target.value)}
                    />
                  ) : (
                    <span className="text-cofimar-text font-mono">
                      {(s.animals || 0).toLocaleString()}
                    </span>
                  )}
                </td>

                {/* Laboratorio */}
                <td className="py-3 px-4">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="text" 
                      className={inlineInputClass}
                      value={labVal}
                      onChange={(e) => onRowChange?.(rowId, 'laboratory', e.target.value.toUpperCase())}
                    />
                  ) : (
                    <span className="text-cofimar-text-muted font-sans">{s.laboratory || 'N/A'}</span>
                  )}
                </td>

                {/* Nauplio */}
                <td className="py-3 px-4">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="text" 
                      className={inlineInputClass}
                      value={nauplioVal}
                      onChange={(e) => onRowChange?.(rowId, 'nauplio', e.target.value.toUpperCase())}
                    />
                  ) : (
                    <span className="text-cofimar-text-muted font-sans">{s.nauplio || 'N/A'}</span>
                  )}
                </td>

                {/* Pre-Criadero */}
                <td className="py-3 px-4">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="text" 
                      className={inlineInputClass}
                      value={preVal}
                      onChange={(e) => onRowChange?.(rowId, 'pre_criadero', e.target.value.toUpperCase())}
                    />
                  ) : (
                    <span className="text-cofimar-text-muted font-sans">{s.pre_criadero || 'N/A'}</span>
                  )}
                </td>

                {/* Días Secos */}
                <td className="py-3 px-4 text-right">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="number" 
                      className={`${inlineInputClass} text-right`}
                      value={dryDaysVal}
                      onChange={(e) => onRowChange?.(rowId, 'dry_days', e.target.value)}
                    />
                  ) : (
                    <span className="text-cofimar-text font-mono">{s.dry_days || 0}</span>
                  )}
                </td>

                {/* Sobrevivencia */}
                <td className="py-3 px-4 text-right">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="number" 
                      step="0.01"
                      className={`${inlineInputClass} text-right`}
                      value={survivalVal}
                      onChange={(e) => onRowChange?.(rowId, 'survival_pct', e.target.value)}
                    />
                  ) : (
                    <span className="font-bold text-cofimar-accent font-mono">
                      {parseFloat(s.survival_pct || 0).toFixed(2)}%
                    </span>
                  )}
                </td>

                {/* Estado */}
                <td className="py-3 px-4 text-center whitespace-nowrap">
                  {s.is_closed ? (
                    <span className="bg-cofimar-primary/10 border border-cofimar-primary/30 text-cofimar-primary text-[10px] px-2 py-0.5 rounded-lg font-bold font-mono">
                      COSECHADA
                    </span>
                  ) : (
                    <span className="bg-cofimar-success/10 border border-cofimar-success/30 text-cofimar-success text-[10px] px-2 py-0.5 rounded-lg font-bold font-mono animate-pulse">
                      ACTIVA
                    </span>
                  )}
                </td>

                {/* Acciones */}
                {role === 'admin' && (
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        disabled={isExcelMode}
                        onClick={() => onEdit(s)}
                        className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-primary p-1.5 rounded-lg border border-cofimar-border transition disabled:opacity-30"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={isExcelMode}
                        onClick={() => onDelete(s.id)}
                        className="bg-cofimar-surface-secondary hover:bg-red-50 dark:hover:bg-red-950/20 text-cofimar-danger p-1.5 rounded-lg border border-cofimar-border transition disabled:opacity-30"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};
