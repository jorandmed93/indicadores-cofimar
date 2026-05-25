import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  Calendar, Shield, RefreshCw, Search
} from 'lucide-react';

export const Bitacora: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');

  // Selected log detail popup
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { limit: 100 };
      if (filterUser.trim()) params.username = filterUser.trim();
      if (filterAction) params.action = filterAction;
      if (filterEntity) params.entity = filterEntity;

      const res = await client.get('/audit/logs', { params });
      setLogs(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Error al obtener la bitácora de cambios desde la API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAction, filterEntity]);

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '';
    const dateObj = new Date(isoStr);
    return dateObj.toLocaleString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="bg-cofimar-success/15 border border-cofimar-success/35 text-cofimar-success px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold">CREATE</span>;
      case 'UPDATE':
        return <span className="bg-cofimar-accent/15 border border-cofimar-accent/35 text-cofimar-accent px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold">UPDATE</span>;
      case 'DELETE':
        return <span className="bg-cofimar-danger/15 border border-cofimar-danger/35 text-cofimar-danger px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold">DELETE</span>;
      default:
        return <span className="bg-cofimar-surface-active/10 border border-cofimar-border text-cofimar-text-muted px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold">{action}</span>;
    }
  };

  const getEntityLabel = (entity: string) => {
    const map: any = {
      'pond': 'PISCINA',
      'seeding': 'SIEMBRA',
      'harvest': 'COSECHA',
      'cycle': 'CICLO',
      'user': 'USUARIO'
    };
    return map[entity] || entity.toUpperCase();
  };

  // Render pretty JSON values
  const renderJson = (jsonStr: string) => {
    if (!jsonStr) return <span className="text-cofimar-text-faint font-mono text-xs">Vacio / Nulo</span>;
    try {
      const parsed = JSON.parse(jsonStr);
      return (
        <pre className="bg-cofimar-bg/80 border border-cofimar-border/40 p-4 rounded-xl text-xs font-mono text-cofimar-text-secondary overflow-x-auto max-h-[300px] leading-relaxed">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch {
      return <pre className="bg-cofimar-bg p-4 rounded-xl text-xs font-mono overflow-x-auto">{jsonStr}</pre>;
    }
  };

  return (
    <div className="p-8 space-y-7 max-w-7xl pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-cofimar-text tracking-tight">
            Bitácora de Cambios (Logs)
          </h2>
          <p className="text-xs text-cofimar-text-muted mt-1 flex items-center gap-1.5 font-mono">
            <Shield className="w-3.5 h-3.5 text-cofimar-primary" />
            TRAZABILIDAD COMPLETA DE CREACIÓN, EDICIÓN Y ELIMINACIÓN DE REGISTROS
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-text hover:text-cofimar-primary font-bold px-4 py-2 rounded-lg border border-cofimar-border transition duration-200 text-xs font-mono flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>ACTUALIZAR BITÁCORA</span>
        </button>
      </div>

      {/* Filters Area */}
      <div className="glass-card p-5 rounded-2xl border border-cofimar-border/50 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-cofimar-text-muted" />
          <input
            type="text"
            placeholder="Buscar por usuario (ej: admin)..."
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
            className="w-full bg-cofimar-bg/30 border border-cofimar-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary transition duration-150"
          />
        </div>

        <div className="w-full md:w-[200px]">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full bg-cofimar-bg/30 border border-cofimar-border rounded-xl px-4 py-2.5 text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary transition"
          >
            <option value="">TODAS LAS ACCIONES</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <div className="w-full md:w-[200px]">
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="w-full bg-cofimar-bg/30 border border-cofimar-border rounded-xl px-4 py-2.5 text-sm text-cofimar-text focus:outline-none focus:border-cofimar-primary transition"
          >
            <option value="">TODOS LOS MÓDULOS</option>
            <option value="pond">PISCINAS (PONDS)</option>
            <option value="seeding">SIEMBRAS (SEEDINGS)</option>
            <option value="harvest">COSECHAS (HARVESTS)</option>
            <option value="cycle">CICLOS (CYCLES)</option>
            <option value="user">USUARIOS (USERS)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card rounded-2xl border border-cofimar-border/50 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 flex items-center justify-center space-x-3 text-cofimar-text-muted font-mono text-sm">
            <RefreshCw className="w-5 h-5 animate-spin text-cofimar-primary" />
            <span>Cargando bitácora...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-cofimar-danger font-mono text-sm">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-cofimar-surface-secondary text-cofimar-text-muted font-mono text-xs border-b border-cofimar-border/60">
                <tr>
                  <th className="py-4 px-6">FECHA / HORA</th>
                  <th className="py-4 px-6">USUARIO</th>
                  <th className="py-4 px-6">ACCIÓN</th>
                  <th className="py-4 px-6">MÓDULO</th>
                  <th className="py-4 px-6">REGISTRO (ID/CÓDIGO)</th>
                  <th className="py-4 px-6 text-center">DETALLES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cofimar-border/25 font-mono text-xs">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-cofimar-text-muted">
                      No hay registros en la bitácora que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  logs.map((l, idx) => (
                    <tr key={idx} className="hover:bg-cofimar-surface-secondary/75 transition">
                      <td className="py-3 px-6 text-cofimar-text-muted flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        {formatDate(l.timestamp)}
                      </td>
                      <td className="py-3 px-6 text-cofimar-text font-bold uppercase">{l.username}</td>
                      <td className="py-3 px-6">{getActionBadge(l.action)}</td>
                      <td className="py-3 px-6 text-cofimar-text">{getEntityLabel(l.entity)}</td>
                      <td className="py-3 px-6 text-cofimar-primary font-bold">{l.entity_id}</td>
                      <td className="py-3 px-6 text-center w-[120px]">
                        <button
                          onClick={() => setSelectedLog(l)}
                          className="bg-cofimar-bg/80 hover:bg-cofimar-primary text-cofimar-text hover:text-cofimar-bg px-3 py-1.5 rounded-lg border border-cofimar-border transition font-sans font-medium text-[10px]"
                        >
                          INSPECCIONAR
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Detail Popup Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[8px] animate-fadeIn">
          <div className="glass-card w-full max-w-4xl rounded-2xl border border-cofimar-border/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-cofimar-border/60 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-cofimar-text flex items-center gap-2">
                  <span>Auditoría de Cambios</span>
                  {getActionBadge(selectedLog.action)}
                </h3>
                <span className="text-[10px] text-cofimar-text-muted font-mono mt-0.5 block">
                  MÓDULO: {selectedLog.entity.toUpperCase()} | ID: {selectedLog.entity_id} | USUARIO: {selectedLog.username.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover px-4 py-2 rounded-lg border border-cofimar-border text-xs text-cofimar-text-muted hover:text-cofimar-text transition font-mono font-bold"
              >
                CERRAR
              </button>
            </div>

            {/* Diffs Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-cofimar-bg/10 text-cofimar-text">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Old State */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-cofimar-text-muted uppercase font-bold tracking-wider block">
                    VALORES ANTERIORES (OLD STATE)
                  </span>
                  {selectedLog.old_values ? (
                    renderJson(selectedLog.old_values)
                  ) : (
                    <div className="bg-cofimar-bg/30 border border-cofimar-border/40 p-12 text-center rounded-xl text-xs font-mono text-cofimar-text-faint">
                      NINGUNO (NUEVO REGISTRO)
                    </div>
                  )}
                </div>

                {/* New State */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-cofimar-text-muted uppercase font-bold tracking-wider block">
                    NUEVOS VALORES (NEW STATE)
                  </span>
                  {selectedLog.new_values ? (
                    renderJson(selectedLog.new_values)
                  ) : (
                    <div className="bg-cofimar-bg/30 border border-cofimar-border/40 p-12 text-center rounded-xl text-xs font-mono text-cofimar-text-faint">
                      NINGUNO (REGISTRO ELIMINADO)
                    </div>
                  )}
                </div>

              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};
