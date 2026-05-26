import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

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

interface PondsTabProps {
  ponds: any[];
  role: 'admin' | 'viewer';
  onEdit: (pond: any) => void;
  onDelete: (code: string) => void;
  isExcelMode?: boolean;
  onRowChange?: (code: string, field: string, value: any) => void;
  editedRows?: Record<string, any>;
}

const inlineInputClass = "bg-cofimar-bg border border-cofimar-border/60 focus:border-cofimar-primary rounded px-2 py-1 w-full text-xs font-mono text-cofimar-text focus:outline-none transition-all duration-150";
const inlineSelectClass = "bg-cofimar-bg border border-cofimar-border/60 focus:border-cofimar-primary rounded px-1.5 py-1 w-full text-xs font-mono text-cofimar-text focus:outline-none transition-all duration-150";

export const PondsTab: React.FC<PondsTabProps> = ({ 
  ponds, role, onEdit, onDelete, isExcelMode = false, onRowChange, editedRows 
}) => {
  return (
    <table className="w-full text-left border-collapse">
      <thead className="bg-cofimar-surface-secondary text-cofimar-text-muted font-mono text-xs border-b border-cofimar-border/60">
        <tr>
          <th className="py-4 px-6 w-[160px]">CÓDIGO PISCINA</th>
          <th className="py-4 px-6 w-[180px]">SECTOR</th>
          <th className="py-4 px-6 text-right w-[160px]">HECTÁREAS (HAS)</th>
          <th className="py-4 px-6 w-[180px]">CERTIFICACIÓN</th>
          <th className="py-4 px-6">RESPONSABLE SECTOR</th>
          {role === 'admin' && <th className="py-4 px-6 text-center w-[120px]">ACCIONES</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-cofimar-border/25 font-mono text-sm">
        {ponds.length === 0 ? (
          <tr>
            <td colSpan={role === 'admin' ? 6 : 5} className="py-12 text-center text-cofimar-text-muted">
              No hay piscinas registradas.
            </td>
          </tr>
        ) : (
          ponds.map((p, idx) => {
            const rowEdits = editedRows?.[p.code] || {};
            const isRowEdited = Object.keys(rowEdits).length > 0;
            
            const sectorVal = rowEdits.sector !== undefined ? rowEdits.sector : p.sector || '';
            const hectaresVal = rowEdits.hectares !== undefined ? rowEdits.hectares : p.hectares;
            const certVal = rowEdits.certification !== undefined ? rowEdits.certification : p.certification || 'ASC';
            const chiefVal = rowEdits.sector_chief !== undefined ? rowEdits.sector_chief : p.sector_chief || '';

            return (
              <tr 
                key={idx} 
                className={`hover:bg-cofimar-surface-secondary/80 transition ${
                  isExcelMode ? 'bg-cofimar-surface/30' : ''
                } ${isRowEdited ? 'bg-cofimar-primary/5 hover:bg-cofimar-primary/10' : ''}`}
              >
                {/* Código (Read-only) */}
                <td className="py-3 px-6 font-bold text-cofimar-primary">{p.code}</td>

                {/* Sector */}
                <td className="py-3 px-6">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="text" 
                      className={inlineInputClass}
                      value={sectorVal}
                      onChange={(e) => onRowChange?.(p.code, 'sector', e.target.value.toUpperCase())}
                    />
                  ) : (
                    <span className="text-cofimar-text font-sans">{p.sector || 'N/A'}</span>
                  )}
                </td>

                {/* Hectáreas */}
                <td className="py-3 px-6 text-right">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="number" 
                      step="0.01"
                      className={`${inlineInputClass} text-right`}
                      value={hectaresVal}
                      onChange={(e) => onRowChange?.(p.code, 'hectares', e.target.value)}
                    />
                  ) : (
                    <span className="text-cofimar-text-muted">
                      {parseFloat(p.hectares || 0).toFixed(2)} ha
                    </span>
                  )}
                </td>

                {/* Certificación */}
                <td className="py-3 px-6">
                  {isExcelMode && role === 'admin' ? (
                    <select 
                      className={inlineSelectClass}
                      value={certVal}
                      onChange={(e) => onRowChange?.(p.code, 'certification', e.target.value)}
                    >
                      <option value="ASC">ASC</option>
                      <option value="ASC-BAP">ASC-BAP</option>
                      <option value="CONVENCIONAL">CONVENCIONAL</option>
                    </select>
                  ) : (
                    <span className="bg-cofimar-bg border border-cofimar-border text-cofimar-text text-[10px] px-2.5 py-0.5 rounded font-mono font-bold">
                      {p.certification || 'CONVENCIONAL'}
                    </span>
                  )}
                </td>

                {/* Responsable */}
                <td className="py-3 px-6">
                  {isExcelMode && role === 'admin' ? (
                    <input 
                      type="text" 
                      className={inlineInputClass}
                      value={chiefVal}
                      onChange={(e) => onRowChange?.(p.code, 'sector_chief', e.target.value.toUpperCase())}
                    />
                  ) : (
                    <span className="text-cofimar-text font-mono font-medium">
                      {p.sector_chief || (p.sector ? SECTOR_CHIEFS[p.sector.toUpperCase()] : '') || 'N/A'}
                    </span>
                  )}
                </td>

                {/* Acciones */}
                {role === 'admin' && (
                  <td className="py-3 px-6 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        disabled={isExcelMode}
                        onClick={() => onEdit(p)}
                        className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-primary p-1.5 rounded-lg border border-cofimar-border transition disabled:opacity-30"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={isExcelMode}
                        onClick={() => onDelete(p.code)}
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
