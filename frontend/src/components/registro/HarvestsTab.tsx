import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface HarvestsTabProps {
  harvests: any[];
  role: 'admin' | 'viewer';
  onEdit: (harvest: any) => void;
  onDelete: (id: number) => void;
  isExcelMode?: boolean;
  onRowChange?: (id: string, field: string, value: any) => void;
  editedRows?: Record<string, any>;
}

const inlineInputClass = "bg-cofimar-bg border border-cofimar-border/60 focus:border-cofimar-primary rounded px-1.5 py-0.5 w-full text-[11px] font-mono text-cofimar-text focus:outline-none transition-all duration-150";
const inlineSelectClass = "bg-cofimar-bg border border-cofimar-border/60 focus:border-cofimar-primary rounded px-1 py-0.5 w-full text-[11px] font-mono text-cofimar-text focus:outline-none transition-all duration-150";

export const HarvestsTab: React.FC<HarvestsTabProps> = ({ 
  harvests, role, onEdit, onDelete, isExcelMode = false, onRowChange, editedRows 
}) => {
  return (
    <table className="w-full text-left border-collapse">
      <thead className="bg-cofimar-surface-secondary text-cofimar-text-muted font-mono text-xs border-b border-cofimar-border/60">
        <tr>
          <th className="py-4 px-4 w-[110px]">PISCINA</th>
          <th className="py-4 px-4 w-[130px]">ACTIVIDAD</th>
          <th className="py-4 px-4 w-[120px]">FECHA</th>
          <th className="py-4 px-4 text-right w-[110px]">LBS CAM.</th>
          <th className="py-4 px-4 text-right w-[110px]">LBS PLANTA</th>
          <th className="py-4 px-4 text-right w-[90px]">GR CAM.</th>
          <th className="py-4 px-4 text-right w-[90px]">GR PLANTA</th>
          <th className="py-4 px-4">RESPONSABLE</th>
          {role === 'admin' && <th className="py-4 px-4 text-center w-[110px]">ACCIONES</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-cofimar-border/25 font-mono text-xs">
        {harvests.length === 0 ? (
          <tr>
            <td colSpan={role === 'admin' ? 9 : 8} className="py-12 text-center text-cofimar-text-muted">
              No hay transacciones registradas.
            </td>
          </tr>
        ) : (
          harvests.map((h, idx) => {
            const rowId = h.id.toString();
            const rowEdits = editedRows?.[rowId] || {};
            const isRowEdited = Object.keys(rowEdits).length > 0;

            const activityVal = rowEdits.activity !== undefined ? rowEdits.activity : h.activity || 'PESCA';
            const harvestDateVal = rowEdits.harvest_date !== undefined ? rowEdits.harvest_date : h.harvest_date || '';
            const lbsFarmVal = rowEdits.lbs_farm !== undefined ? rowEdits.lbs_farm : h.lbs_farm || 0;
            const lbsPlantVal = rowEdits.lbs_plant !== undefined ? rowEdits.lbs_plant : h.lbs_plant || 0;
            const grFarmVal = rowEdits.gr_farm !== undefined ? rowEdits.gr_farm : h.gr_farm || 0;
            const grPlantVal = rowEdits.gr_plant !== undefined ? rowEdits.gr_plant : h.gr_plant || 0;
            const chiefVal = rowEdits.sector_chief !== undefined ? rowEdits.sector_chief : h.sector_chief || '';

            return (
              <tr 
                key={idx} 
                className={`hover:bg-cofimar-surface-secondary/80 transition ${
                  isExcelMode ? 'bg-cofimar-surface/30' : ''
                } ${isRowEdited ? 'bg-cofimar-primary/5 hover:bg-cofimar-primary/10' : ''}`}
              >
                {/* Piscina (Read-only) */}
                <td className="py-3 px-4 font-bold text-cofimar-primary">{h.pond_code}</td>

                {/* Actividad */}
                <td className="py-3 px-4">
                  {isExcelMode && role === 'admin' ? (
                    <select 
                      className={inlineSelectClass}
                      value={activityVal}
                      onChange={(e) => onRowChange?.(rowId, 'activity', e.target.value)}
                    >
                      <option value="PESCA">PESCA</option>
                      <option value="RALEO">RALEO</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      h.activity === 'PESCA' ? 'bg-cofimar-success/15 text-cofimar-success' : 'bg-cofimar-warning/15 text-cofimar-warning'
                    }`}>
                      {h.activity}
                    </span>
                  )}
                </td>

                {/* Fecha */}
                <td className="py-3 px-4">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="date" 
                      className={inlineInputClass}
                      value={harvestDateVal}
                      onChange={(e) => onRowChange?.(rowId, 'harvest_date', e.target.value)}
                    />
                  ) : (
                    <span className="text-cofimar-text-muted font-mono">{h.harvest_date}</span>
                  )}
                </td>

                {/* Libras Camaronera */}
                <td className="py-3 px-4 text-right">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="number" 
                      className={`${inlineInputClass} text-right`}
                      value={lbsFarmVal}
                      onChange={(e) => onRowChange?.(rowId, 'lbs_farm', e.target.value)}
                    />
                  ) : (
                    <span className="text-cofimar-text font-mono">
                      {Math.round(h.lbs_farm || 0).toLocaleString()}
                    </span>
                  )}
                </td>

                {/* Libras Planta */}
                <td className="py-3 px-4 text-right">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="number" 
                      className={`${inlineInputClass} text-right`}
                      value={lbsPlantVal}
                      onChange={(e) => onRowChange?.(rowId, 'lbs_plant', e.target.value)}
                    />
                  ) : (
                    <span className="text-cofimar-text font-mono">
                      {Math.round(h.lbs_plant || 0).toLocaleString()}
                    </span>
                  )}
                </td>

                {/* Gramaje Camaronera */}
                <td className="py-3 px-4 text-right">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="number" 
                      step="0.01"
                      className={`${inlineInputClass} text-right`}
                      value={grFarmVal}
                      onChange={(e) => onRowChange?.(rowId, 'gr_farm', e.target.value)}
                    />
                  ) : (
                    <span className="text-cofimar-text-muted font-mono">
                      {parseFloat(h.gr_farm || 0).toFixed(2)}
                    </span>
                  )}
                </td>

                {/* Gramaje Planta */}
                <td className="py-3 px-4 text-right">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="number" 
                      step="0.01"
                      className={`${inlineInputClass} text-right`}
                      value={grPlantVal}
                      onChange={(e) => onRowChange?.(rowId, 'gr_plant', e.target.value)}
                    />
                  ) : (
                    <span className="text-cofimar-text-muted font-mono">
                      {parseFloat(h.gr_plant || 0).toFixed(2)}
                    </span>
                  )}
                </td>

                {/* Responsable */}
                <td className="py-3 px-4">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="text" 
                      className={inlineInputClass}
                      value={chiefVal}
                      onChange={(e) => onRowChange?.(rowId, 'sector_chief', e.target.value.toUpperCase())}
                    />
                  ) : (
                    <span className="text-cofimar-text-muted font-sans">{h.sector_chief}</span>
                  )}
                </td>

                {/* Acciones */}
                {role === 'admin' && (
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        disabled={isExcelMode}
                        onClick={() => onEdit(h)}
                        className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-primary p-1.5 rounded-lg border border-cofimar-border transition disabled:opacity-30"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={isExcelMode}
                        onClick={() => onDelete(h.id)}
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
