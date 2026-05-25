import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface SeedingsTabProps {
  seedings: any[];
  role: 'admin' | 'viewer';
  onEdit: (seeding: any) => void;
  onDelete: (id: number) => void;
}

export const SeedingsTab: React.FC<SeedingsTabProps> = ({ seedings, role, onEdit, onDelete }) => {
  return (
    <table className="w-full text-left border-collapse">
      <thead className="bg-cofimar-surface-secondary text-cofimar-text-muted font-mono text-xs border-b border-cofimar-border/60">
        <tr>
          <th className="py-4 px-5">PISCINA</th>
          <th className="py-4 px-5">AGUAJE</th>
          <th className="py-4 px-5">FECHA SIEMBRA</th>
          <th className="py-4 px-5 text-right">LARVAS SEMBRADAS</th>
          <th className="py-4 px-5">LABORATORIO</th>
          <th className="py-4 px-5">NAUPLIO</th>
          <th className="py-4 px-5">PRE-CRIADERO</th>
          <th className="py-4 px-5 text-right">DÍAS SECOS</th>
          <th className="py-4 px-5 text-right">SOBREVIVENCIA (%)</th>
          <th className="py-4 px-5 text-center">ESTADO</th>
          {role === 'admin' && <th className="py-4 px-5 text-center">ACCIONES</th>}
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
          seedings.map((s, idx) => (
            <tr key={idx} className="hover:bg-cofimar-surface-secondary transition">
              <td className="py-3 px-5 font-bold text-cofimar-primary">{s.pond_code}</td>
              <td className="py-3 px-5 text-cofimar-text">{s.aguaje}</td>
              <td className="py-3 px-5 text-cofimar-text-muted font-mono">{s.seeding_date}</td>
              <td className="py-3 px-5 text-right text-cofimar-text font-mono">
                {(s.animals || 0).toLocaleString()}
              </td>
              <td className="py-3 px-5 text-cofimar-text-muted font-sans">{s.laboratory || 'N/A'}</td>
              <td className="py-3 px-5 text-cofimar-text-muted font-sans">{s.nauplio || 'N/A'}</td>
              <td className="py-3 px-5 text-cofimar-text-muted font-sans">{s.pre_criadero || 'N/A'}</td>
              <td className="py-3 px-5 text-right text-cofimar-text font-mono">{s.dry_days || 0}</td>
              <td className="py-3 px-5 text-right font-bold text-cofimar-accent font-mono">
                {parseFloat(s.survival_pct || 0).toFixed(2)}%
              </td>
              <td className="py-3 px-5 text-center whitespace-nowrap">
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
              {role === 'admin' && (
                <td className="py-3 px-5 whitespace-nowrap w-[100px]">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(s)}
                      className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-primary p-1.5 rounded-lg border border-cofimar-border transition"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(s.id)}
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
