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
}

export const PondsTab: React.FC<PondsTabProps> = ({ ponds, role, onEdit, onDelete }) => {
  return (
    <table className="w-full text-left border-collapse">
      <thead className="bg-cofimar-surface-secondary text-cofimar-text-muted font-mono text-xs border-b border-cofimar-border/60">
        <tr>
          <th className="py-4 px-6">CÓDIGO PISCINA</th>
          <th className="py-4 px-6">SECTOR</th>
          <th className="py-4 px-6 text-right">HECTÁREAS (HAS)</th>
          <th className="py-4 px-6">CERTIFICACIÓN</th>
          <th className="py-4 px-6">RESPONSABLE SECTOR</th>
          {role === 'admin' && <th className="py-4 px-6 text-center">ACCIONES</th>}
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
          ponds.map((p, idx) => (
            <tr key={idx} className="hover:bg-cofimar-surface-secondary transition">
              <td className="py-3 px-6 font-bold text-cofimar-primary">{p.code}</td>
              <td className="py-3 px-6 text-cofimar-text font-sans">{p.sector || 'N/A'}</td>
              <td className="py-3 px-6 text-right text-cofimar-text-muted">
                {parseFloat(p.hectares || 0).toFixed(2)} ha
              </td>
              <td className="py-3 px-6">
                <span className="bg-cofimar-bg border border-cofimar-border text-cofimar-text text-[10px] px-2.5 py-0.5 rounded font-mono font-bold">
                  {p.certification || 'CONVENCIONAL'}
                </span>
              </td>
              <td className="py-3 px-6 text-cofimar-text font-mono font-medium">
                {p.sector_chief || (p.sector ? SECTOR_CHIEFS[p.sector.toUpperCase()] : '') || 'N/A'}
              </td>
              {role === 'admin' && (
                <td className="py-3 px-6 whitespace-nowrap w-[100px]">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(p)}
                      className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-primary p-1.5 rounded-lg border border-cofimar-border transition"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(p.code)}
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
