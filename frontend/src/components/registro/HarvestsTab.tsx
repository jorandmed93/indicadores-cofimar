import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface HarvestsTabProps {
  harvests: any[];
  role: 'admin' | 'viewer';
  onEdit: (harvest: any) => void;
  onDelete: (id: number) => void;
}

export const HarvestsTab: React.FC<HarvestsTabProps> = ({ harvests, role, onEdit, onDelete }) => {
  return (
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
            <td colSpan={role === 'admin' ? 9 : 8} className="py-12 text-center text-cofimar-text-muted">
              No hay transacciones registradas.
            </td>
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
              <td className="py-3 px-5 text-right text-cofimar-text font-mono">
                {Math.round(h.lbs_farm || 0).toLocaleString()}
              </td>
              <td className="py-3 px-5 text-right text-cofimar-text font-mono">
                {Math.round(h.lbs_plant || 0).toLocaleString()}
              </td>
              <td className="py-3 px-5 text-right text-cofimar-text-muted font-mono">
                {parseFloat(h.gr_farm || 0).toFixed(2)}
              </td>
              <td className="py-3 px-5 text-right text-cofimar-text-muted font-mono">
                {parseFloat(h.gr_plant || 0).toFixed(2)}
              </td>
              <td className="py-3 px-5 text-cofimar-text-muted font-sans">{h.sector_chief}</td>
              {role === 'admin' && (
                <td className="py-3 px-5 whitespace-nowrap w-[100px]">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(h)}
                      className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-primary p-1.5 rounded-lg border border-cofimar-border transition"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(h.id)}
                      className="bg-cofimar-surface-secondary hover:bg-red-50 dark:hover:bg-red-950/20 text-cofimar-danger p-1.5 rounded-lg border border-cofimar-border transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};
