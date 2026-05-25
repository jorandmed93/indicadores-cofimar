import React, { useState } from 'react';
import { Compass, Eye, EyeOff, Sun, Moon, AlertTriangle, LogIn } from 'lucide-react';
import client from '../api/client';

interface LoginProps {
  onLogin: (username: string, role: 'admin' | 'viewer') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, theme, setTheme }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await client.post('/users/login', {
        username: username.trim(),
        password: password.trim()
      });
      onLogin(res.data.username, res.data.role);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Usuario o contraseña incorrectos. Por favor, intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-cofimar-bg text-cofimar-text transition-colors duration-300 relative">
      
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <div className="flex bg-cofimar-surface-secondary p-0.5 rounded-lg border border-cofimar-border">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-md transition-all duration-150 ${
              theme === 'light' 
                ? 'bg-cofimar-surface text-cofimar-primary shadow-sm' 
                : 'text-cofimar-text-muted hover:text-cofimar-text-secondary'
            }`}
            title="Tema Claro"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-md transition-all duration-150 ${
              theme === 'dark' 
                ? 'bg-cofimar-surface text-cofimar-primary shadow-sm' 
                : 'text-cofimar-text-muted hover:text-cofimar-text-secondary'
            }`}
            title="Tema Oscuro"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm p-8 bg-cofimar-surface rounded-2xl border border-cofimar-border shadow-sm relative z-10 space-y-6">
        
        {/* Brand */}
        <div className="flex flex-col items-center space-y-2.5 text-center">
          <div className="w-10 h-10 bg-cofimar-primary rounded-lg flex items-center justify-center shadow-sm">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight text-cofimar-text">
              Inicia sesión con tu ID
            </h1>
            <p className="text-xs text-cofimar-text-muted mt-1 font-body">
              Gestiona tus ciclos de Cofimar
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-cofimar-danger/5 border border-cofimar-danger/15 p-3 rounded-lg flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-cofimar-danger flex-shrink-0" />
            <span className="text-[11px] font-mono text-cofimar-danger leading-tight">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-cofimar-surface-secondary border border-cofimar-border rounded-lg px-3 py-2.5 font-body text-xs text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-150 placeholder:text-cofimar-text-faint"
              placeholder="Usuario o ID de Cofimar"
            />
          </div>

          <div className="space-y-1 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-cofimar-surface-secondary border border-cofimar-border rounded-lg pl-3 pr-9 py-2.5 font-body text-xs text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition-all duration-150 placeholder:text-cofimar-text-faint"
              placeholder="Contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-cofimar-text-faint hover:text-cofimar-primary transition"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-cofimar-primary hover:opacity-95 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition duration-150 shadow-sm font-mono text-xs mt-4"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>INICIAR SESIÓN</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Access Presets */}
        <div className="pt-4 border-t border-cofimar-border space-y-2">
          <span className="text-[8px] font-mono text-cofimar-text-faint uppercase tracking-wider block text-center">
            CUENTAS DE ACCESO RÁPIDO
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleApplyPreset('admin', 'admin')}
              className="p-2.5 bg-cofimar-surface-secondary hover:bg-cofimar-primary/5 border border-cofimar-border rounded-lg text-left transition duration-150 group"
            >
              <span className="font-sans font-bold text-[10px] text-cofimar-primary group-hover:underline block">Admin ID</span>
              <span className="text-[9px] text-cofimar-text-faint block mt-0.5 font-mono">User: admin</span>
            </button>
            <button
              onClick={() => handleApplyPreset('lector', 'lector')}
              className="p-2.5 bg-cofimar-surface-secondary hover:bg-cofimar-primary/5 border border-cofimar-border rounded-lg text-left transition duration-150 group"
            >
              <span className="font-sans font-bold text-[10px] text-cofimar-accent group-hover:underline block">Lector ID</span>
              <span className="text-[9px] text-cofimar-text-faint block mt-0.5 font-mono">User: lector</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
