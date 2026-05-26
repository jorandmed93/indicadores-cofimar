import React, { useState } from 'react';
import client, { API_BASE_URL } from '../api/client';
import { 
  FileSpreadsheet, Upload, Loader2, CheckCircle2, XCircle, 
  Info, HelpCircle, FileCheck, RefreshCcw, Download, AlertTriangle
} from 'lucide-react';

interface ImportProps {
  role: 'admin' | 'viewer';
}

const Import: React.FC<ImportProps> = ({ role }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleReseed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress('Re-sembrando base de datos desde el archivo del Repositorio...');

    try {
      const res = await client.post('/import/reseed');
      setResult(res.data.details);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Ocurrió un error al re-sembrar la base de datos.');
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress('Cargando y procesando archivo Excel...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await client.post('/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      });
      setResult(res.data);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Ocurrió un error inesperado al procesar el archivo Excel.');
      setLoading(false);
    }
  };

  const triggerReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="p-8 space-y-7 max-w-4xl pt-4">
      {/* Main Upload Box */}
      <div className="glass-card p-8 rounded-lg shadow-sm">
        {role === 'viewer' ? (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 bg-cofimar-accent/10 rounded-lg flex items-center justify-center border border-cofimar-accent/25 mx-auto">
              <AlertTriangle className="w-7 h-7 text-cofimar-accent animate-pulse" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-base font-bold text-cofimar-text uppercase tracking-wider">Modo Solo Lectura Activado</h3>
              <p className="text-cofimar-text-muted text-xs leading-relaxed">
                Actualmente estás navegando con el rol de <strong className="text-cofimar-accent">Visitante (Lector)</strong>. 
                No tienes permisos para realizar cargas de archivos Excel, sincronizaciones o modificaciones sobre la base de datos del servidor.
              </p>
              <p className="text-[10px] text-cofimar-text-faint font-mono mt-4">
                Tip: Cambia tu rol a "Administrador" en la barra lateral para habilitar esta funcionalidad.
              </p>
            </div>
          </div>
        ) : !loading && !result && !error ? (
          <form onSubmit={handleUpload} className="space-y-6 text-center">
            <div className="flex justify-end">
              <a
                href={`${API_BASE_URL}/import/template`}
                download="plantilla_indicadores_2026.xlsx"
                className="flex items-center space-x-2 bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover border border-cofimar-border text-cofimar-text-secondary hover:text-cofimar-text px-4 py-2 rounded-lg transition font-mono text-[10px] font-bold"
              >
                <Download className="w-3.5 h-3.5 text-cofimar-primary" />
                <span>DESCARGAR PLANTILLA EXCEL OFICIAL</span>
              </a>
            </div>
            <div className="border-2 border-dashed border-cofimar-border hover:border-cofimar-primary/60 rounded-lg p-10 transition duration-200 bg-cofimar-surface-secondary/30 relative group">
              <input
                type="file"
                accept=".xlsm,.xlsx"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-cofimar-primary/10 rounded-lg flex items-center justify-center border border-cofimar-primary/20 group-hover:scale-105 transition duration-200">
                  <Upload className="w-7 h-7 text-cofimar-primary animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-cofimar-text">
                    {file ? file.name : 'Arrastra o selecciona el archivo Excel de Indicadores'}
                  </h3>
                  <p className="text-[10px] text-cofimar-text-muted font-mono mt-1.5">
                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Formatos soportados: .xlsm, .xlsx'}
                  </p>
                </div>
              </div>
            </div>

            {file ? (
              <button
                type="submit"
                className="w-full bg-cofimar-primary hover:bg-cofimar-primary/95 text-white font-bold py-3 rounded-lg transition duration-200 shadow-lg shadow-cofimar-primary/25 font-mono text-sm"
              >
                MIGRAR & PROCESAR BASE DE DATOS
              </button>
            ) : (
              <div className="border border-cofimar-border/60 rounded-lg p-5 bg-cofimar-surface-secondary/20 space-y-3 mt-4">
                <div className="flex items-start space-x-3 text-left">
                  <RefreshCcw className="w-4 h-4 text-cofimar-primary mt-0.5 flex-shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-cofimar-text uppercase tracking-wider font-mono">Sincronización Rápida (Repositorio)</h4>
                    <p className="text-[11px] text-cofimar-text-muted leading-relaxed">
                      ¿Has subido o actualizado el archivo <strong className="text-cofimar-primary font-mono">BASE INDICADORES 2026.xlsm</strong> en tu repositorio de GitHub? Recarga toda la base de datos local y recalcula KPIs con un solo clic.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReseed}
                  className="w-full flex items-center justify-center space-x-2 bg-cofimar-surface-secondary hover:bg-cofimar-primary hover:text-white border border-cofimar-border hover:border-cofimar-primary py-2.5 rounded-lg transition-all duration-200 font-mono text-xs font-bold text-cofimar-text-secondary"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>RECARGAR BASE DE DATOS DESDE ARCHIVO DE REPOSITORIO</span>
                </button>
              </div>
            )}
          </form>
        ) : loading ? (
          <div className="py-10 flex flex-col items-center justify-center space-y-4 text-center">
            <Loader2 className="w-12 h-12 text-cofimar-primary animate-spin" />
            <div>
              <h3 className="text-sm font-bold text-cofimar-text">Procesando y recalculando KPIs...</h3>
              <p className="text-cofimar-text-muted text-xs font-mono mt-1.5">{progress}</p>
            </div>
            <p className="text-[10px] text-cofimar-text-faint max-w-xs font-mono">
              Esto migrará de forma transaccional piscinas, raleos, siembras y recalculará la sobrevivencia, FCA e incrementos semanales.
            </p>
          </div>
        ) : result ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-3.5 bg-cofimar-success/10 p-4 rounded-lg border border-cofimar-success/20">
              <CheckCircle2 className="w-6 h-6 text-cofimar-success flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-cofimar-text">¡Sincronización Completada Exitosamente!</h3>
                <p className="text-cofimar-text-muted text-xs mt-0.5">La base de datos se actualizó y todos los KPIs fueron recalculados.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'CICLOS (BASE 2026)', value: result.imported_cycles },
                { label: 'PISCINAS (DATOS)', value: result.imported_ponds },
                { label: 'TRANS. (COSECHAS)', value: result.imported_harvests },
                { label: 'SIEMBRAS (HISTÓRICO)', value: result.imported_seedings },
              ].map((item, idx) => (
                <div key={idx} className="bg-cofimar-surface-secondary p-4 rounded-lg border border-cofimar-border text-center font-mono">
                  <span className="text-[10px] text-cofimar-text-muted block">{item.label}</span>
                  <span className="text-2xl font-bold text-cofimar-text block mt-1">{item.value}</span>
                </div>
              ))}
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="bg-cofimar-danger/5 p-4 rounded-lg border border-cofimar-danger/20 space-y-2">
                <h4 className="text-xs font-bold text-cofimar-danger font-mono">LOG DE ERRORES ({result.errors.length}):</h4>
                <ul className="text-[10px] font-mono text-cofimar-text-secondary list-disc pl-4 space-y-1">
                  {result.errors.map((e: string, idx: number) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={triggerReset}
              className="w-full flex items-center justify-center space-x-2 bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover border border-cofimar-border text-cofimar-text-secondary py-3 rounded-lg transition duration-200 font-mono text-xs font-bold"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>CARGAR OTRO ARCHIVO</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-3.5 bg-cofimar-danger/10 p-4 rounded-lg border border-cofimar-danger/20">
              <XCircle className="w-6 h-6 text-cofimar-danger flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-cofimar-text">Fallo en el Procesamiento</h3>
                <p className="text-cofimar-text-muted text-xs mt-0.5">El parser Excel no pudo completar la importación.</p>
              </div>
            </div>

            <div className="bg-cofimar-surface-secondary p-4 rounded-lg border border-cofimar-border text-xs font-mono text-cofimar-danger whitespace-pre-wrap">
              {error}
            </div>

            <button
              onClick={triggerReset}
              className="w-full flex items-center justify-center space-x-2 bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover border border-cofimar-border text-cofimar-text-secondary py-3 rounded-lg transition duration-200 font-mono text-xs font-bold"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>REINTENTAR CARGA</span>
            </button>
          </div>
        )}
      </div>

      {/* Guide Details */}
      <div className="glass-card p-6 rounded-lg shadow-sm space-y-4">
        <h3 className="text-base font-bold text-cofimar-text flex items-center gap-2">
          <Info className="w-4 h-4 text-cofimar-primary" />
          Estructura del Libro Excel Requerida
        </h3>
        
        <div className="text-xs text-cofimar-text-muted space-y-3 font-mono">
          <p>Para garantizar una correcta migración e integridad referencial, el libro de Excel debe contener las siguientes hojas:</p>
          <ul className="list-decimal pl-5 space-y-2 text-[11px]">
            <li>
              <span className="text-cofimar-text font-bold">BASE 2026:</span> Registro de ciclos cosechados (con columnas <span className="text-cofimar-primary">FECHA, CODIGO, HAS, SOBREVIVENCIA, FCA</span>). La fila 0 se ignora (metadatos de secciones) y la fila 1 contiene los encabezados oficiales.
            </li>
            <li>
              <span className="text-cofimar-text font-bold">DATOS:</span> Catálogo de piscinas con columnas <span className="text-cofimar-primary">sector/pisc, has, CERTIFICADA</span>.
            </li>
            <li>
              <span className="text-cofimar-text font-bold">COSECHAS:</span> Control de básculas por eventos con columnas <span className="text-cofimar-primary">SECTOR/PISCINA, ACTIVIDAD (PESCA/RALEO), libras (farm), libras planta, COSECHA (fecha)</span>.
            </li>
            <li>
              <span className="text-cofimar-text font-bold">SIEMBRAS:</span> Histórico de transferencia larvaria con columnas <span className="text-cofimar-primary">PISCINA, AGUAJE, siembra (fecha), LARVA (cantidad)</span>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Import;
