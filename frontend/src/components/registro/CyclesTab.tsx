import React from 'react';
import { Edit2, Trash2, Fish } from 'lucide-react';

interface CyclesTabProps {
  cycles: any[];
  role: 'admin' | 'viewer';
  activeTab: 'cycles' | 'closed_cycles';
  onRegisterHarvest: (pondCode: string) => void;
  onEdit: (cycle: any) => void;
  onDelete: (id: number) => void;
  isExcelMode?: boolean;
  onRowChange?: (id: string, field: string, value: any) => void;
  editedRows?: Record<string, any>;
}

const inlineInputClass = "bg-cofimar-bg border border-cofimar-border/60 focus:border-cofimar-primary rounded px-1.5 py-0.5 w-full text-[11px] font-mono text-cofimar-text focus:outline-none transition-all duration-150";

export const CyclesTab: React.FC<CyclesTabProps> = ({
  cycles,
  role,
  activeTab,
  onRegisterHarvest,
  onEdit,
  onDelete,
  isExcelMode = false,
  onRowChange,
  editedRows
}) => {
  return (
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
              {activeTab === 'cycles'
                ? 'No hay ciclos productivos activos.'
                : 'No hay ciclos cosechados registrados.'}
            </td>
          </tr>
        ) : (
          cycles.map((c, idx) => {
            const rowId = c.id.toString();
            const rowEdits = editedRows?.[rowId] || {};
            const isRowEdited = Object.keys(rowEdits).length > 0;

            const aguajeVal = rowEdits.aguaje !== undefined ? rowEdits.aguaje : c.aguaje || '';
            const harvestDateVal = rowEdits.harvest_date !== undefined ? rowEdits.harvest_date : c.harvest_date || '';
            const hectaresVal = rowEdits.hectares !== undefined ? rowEdits.hectares : c.hectares || 0;
            const totalLbsVal = rowEdits.total_lbs !== undefined ? rowEdits.total_lbs : c.total_lbs || 0;
            const lbsHaVal = rowEdits.lbs_ha !== undefined ? rowEdits.lbs_ha : c.lbs_ha || 0;
            const survivalVal = rowEdits.survival_pct !== undefined ? rowEdits.survival_pct : c.survival_pct || 0;
            const feedLbsVal = rowEdits.feed_lbs !== undefined ? rowEdits.feed_lbs : c.feed_lbs || 0;

            return (
              <tr 
                key={idx} 
                className={`hover:bg-cofimar-surface-secondary transition ${
                  isExcelMode ? 'bg-cofimar-surface/30' : ''
                } ${isRowEdited ? 'bg-cofimar-primary/5 hover:bg-cofimar-primary/10' : ''}`}
              >
                {/* Piscina (Read-only) */}
                <td className="py-3 px-5 font-bold text-cofimar-primary">{c.pond_code}</td>

                {/* Aguaje */}
                <td className="py-3 px-5">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="text" 
                      className={inlineInputClass}
                      value={aguajeVal}
                      onChange={(e) => onRowChange?.(rowId, 'aguaje', e.target.value.toUpperCase())}
                    />
                  ) : (
                    <span className="text-cofimar-text">{c.aguaje}</span>
                  )}
                </td>

                {/* Fecha Cosecha */}
                <td className="py-3 px-5">
                  {isExcelMode && role === 'admin' && activeTab === 'closed_cycles' ? (
                    <input 
                      type="date" 
                      className={inlineInputClass}
                      value={harvestDateVal}
                      onChange={(e) => onRowChange?.(rowId, 'harvest_date', e.target.value)}
                    />
                  ) : (
                    <span className="text-cofimar-text-muted font-mono">
                      {c.harvest_date || 'EN CURSO'}
                    </span>
                  )}
                </td>

                {/* Hectáreas */}
                <td className="py-3 px-5 text-right">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="number" 
                      step="0.01"
                      className={`${inlineInputClass} text-right`}
                      value={hectaresVal}
                      onChange={(e) => onRowChange?.(rowId, 'hectares', e.target.value)}
                    />
                  ) : (
                    <span className="text-cofimar-text-muted font-mono">
                      {parseFloat(c.hectares || 0).toFixed(2)}
                    </span>
                  )}
                </td>

                {/* Libras Totales */}
                <td className="py-3 px-5 text-right">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="number" 
                      className={`${inlineInputClass} text-right`}
                      value={totalLbsVal}
                      onChange={(e) => onRowChange?.(rowId, 'total_lbs', e.target.value)}
                    />
                  ) : (
                    <span className="text-cofimar-text font-mono">
                      {c.total_lbs ? Math.round(c.total_lbs).toLocaleString() : '0'}
                    </span>
                  )}
                </td>

                {/* Lbs/Ha (Read-only or auto-recalc) */}
                <td className="py-3 px-5 text-right font-bold text-cofimar-text font-mono">
                  {c.lbs_ha ? Math.round(c.lbs_ha).toLocaleString() : '0'}
                </td>

                {/* Sobrevivencia */}
                <td className="py-3 px-5 text-right font-bold text-cofimar-accent font-mono">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="number" 
                      step="0.1"
                      className={`${inlineInputClass} text-right`}
                      value={survivalVal}
                      onChange={(e) => onRowChange?.(rowId, 'survival_pct', e.target.value)}
                    />
                  ) : (
                    c.survival_pct ? `${parseFloat(c.survival_pct).toFixed(1)}%` : '0%'
                  )}
                </td>

                {/* Alimento Lbs */}
                <td className="py-3 px-5 text-right">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="number" 
                      className={`${inlineInputClass} text-right`}
                      value={feedLbsVal}
                      onChange={(e) => onRowChange?.(rowId, 'feed_lbs', e.target.value)}
                    />
                  ) : (
                    <span className="text-cofimar-text font-mono">
                      {c.feed_lbs ? Math.round(c.feed_lbs).toLocaleString() : '0'}
                    </span>
                  )}
                </td>

                {/* FCA */}
                <td className="py-3 px-5 text-right font-mono">
                  {c.fca ? (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.fca <= 1.35
                          ? 'bg-cofimar-success/15 text-cofimar-success'
                          : c.fca <= 1.7
                          ? 'bg-cofimar-warning/15 text-cofimar-warning'
                          : 'bg-cofimar-danger/15 text-cofimar-danger'
                      }`}
                    >
                      {parseFloat(c.fca).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-cofimar-text-muted text-[10px]">0.00</span>
                  )}
                </td>

                {/* Acciones */}
                {role === 'admin' && (
                  <td className="py-3 px-5 whitespace-nowrap min-w-[120px]">
                    <div className="flex items-center justify-center gap-2">
                      {activeTab === 'cycles' && !isExcelMode && (
                        <button
                          onClick={() => onRegisterHarvest(c.pond_code)}
                          className="bg-cofimar-success/15 hover:bg-cofimar-success text-cofimar-success hover:text-cofimar-bg px-2.5 py-1.5 rounded-lg border border-cofimar-success/30 text-[10px] font-mono font-bold transition inline-flex items-center gap-1.5"
                          title="Registrar Pesca / Raleo"
                        >
                          <Fish className="w-3.5 h-3.5" />
                          <span>COSECHAR</span>
                        </button>
                      )}
                      <button
                        disabled={isExcelMode}
                        onClick={() => onEdit(c)}
                        className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-primary p-1.5 rounded-lg border border-cofimar-border transition disabled:opacity-30"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={isExcelMode}
                        onClick={() => onDelete(c.id)}
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
