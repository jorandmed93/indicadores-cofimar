import React from 'react';
import { Edit2, Trash2, Fish } from 'lucide-react';

interface CyclesTabProps {
  cycles: any[];
  role: 'admin' | 'viewer';
  activeTab: 'cycles' | 'closed_cycles';
  onRegisterHarvest: (pondCode: string) => void;
  onEdit: (cycle: any) => void;
  onDelete: (id: number) => void;
}

export const CyclesTab: React.FC<CyclesTabProps> = ({
  cycles,
  role,
  activeTab,
  onRegisterHarvest,
  onEdit,
  onDelete
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
          cycles.map((c, idx) => (
            <tr key={idx} className="hover:bg-cofimar-surface-secondary transition">
              <td className="py-3 px-5 font-bold text-cofimar-primary">{c.pond_code}</td>
              <td className="py-3 px-5 text-cofimar-text">{c.aguaje}</td>
              <td className="py-3 px-5 text-cofimar-text-muted font-mono">
                {c.harvest_date || 'EN CURSO'}
              </td>
              <td className="py-3 px-5 text-right text-cofimar-text-muted font-mono">
                {parseFloat(c.hectares || 0).toFixed(2)}
              </td>
              <td className="py-3 px-5 text-right text-cofimar-text font-mono">
                {c.total_lbs ? Math.round(c.total_lbs).toLocaleString() : 'N/A'}
              </td>
              <td className="py-3 px-5 text-right font-bold text-cofimar-text font-mono">
                {c.lbs_ha ? Math.round(c.lbs_ha).toLocaleString() : 'N/A'}
              </td>
              <td className="py-3 px-5 text-right font-bold text-cofimar-accent font-mono">
                {c.survival_pct ? `${parseFloat(c.survival_pct).toFixed(1)}%` : 'N/A'}
              </td>
              <td className="py-3 px-5 text-right text-cofimar-text font-mono">
                {c.feed_lbs ? Math.round(c.feed_lbs).toLocaleString() : 'N/A'}
              </td>
              <td className="py-3 px-5 text-right">
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
                  <span className="text-cofimar-text-muted text-[10px]">N/A</span>
                )}
              </td>
              {role === 'admin' && (
                <td className="py-3 px-5 whitespace-nowrap min-w-[120px]">
                  <div className="flex items-center justify-center gap-2">
                    {activeTab === 'cycles' && (
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
                      onClick={() => onEdit(c)}
                      className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-primary p-1.5 rounded-lg border border-cofimar-border transition"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(c.id)}
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
