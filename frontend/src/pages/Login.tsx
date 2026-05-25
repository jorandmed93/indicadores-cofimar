import React, { useState } from 'react';
import { Compass, Eye, EyeOff, Sun, Moon, AlertTriangle, LogIn, ShieldAlert, Key, UserCheck } from 'lucide-react';
import client from '../api/client';

interface LoginProps {
  onLogin: (username: string, role: 'admin' | 'viewer', token?: string) => void;
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
      onLogin(res.data.username, res.data.role, res.data.access_token);
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

  // Determine if it is a lockout warning
  const isLockoutError = error?.includes('bloqueada') || error?.includes('bloqueo') || error?.includes('intentos');

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-cofimar-bg text-cofimar-text transition-colors duration-300 relative overflow-hidden">
      
      {/* Deep Ocean Decorative Orbs for Cofimar Brand */}
      <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-[#139A8C]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-cofimar-primary/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Elegant Marine Wave Line Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <div className="flex bg-cofimar-surface-secondary/85 backdrop-blur-md p-0.5 rounded-lg border border-cofimar-border shadow-sm">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-md transition-all duration-150 ${
              theme === 'light' 
                ? 'bg-cofimar-surface text-cofimar-primary shadow-sm font-semibold' 
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
                ? 'bg-cofimar-surface text-cofimar-primary shadow-sm font-semibold' 
                : 'text-cofimar-text-muted hover:text-cofimar-text-secondary'
            }`}
            title="Tema Oscuro"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Container with Deep Navy Glow */}
      <div className="relative w-full max-w-md z-10">
        
        {/* Glow behind the card */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cofimar-primary/20 to-[#139A8C]/30 rounded-2xl blur-md opacity-80" />
        
        {/* Card Body */}
        <div className="relative w-full p-8 md:p-10 bg-cofimar-surface/95 backdrop-blur-md rounded-2xl border border-cofimar-border/90 shadow-2xl space-y-6">
          
          {/* Brand Header */}
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-14 h-14 bg-gradient-to-tr from-cofimar-primary to-[#139A8C] rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition duration-300">
              <Compass className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl tracking-wider text-cofimar-text uppercase">
                GRUPO COFIMAR
              </h1>
              <p className="text-[10px] text-cofimar-primary font-mono tracking-widest uppercase font-bold mt-1.5">
                Control de Indicadores Acuáticos 2026
              </p>
            </div>
          </div>

          {/* High Security Lockout Indicator / Error Messages */}
          {error && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 animate-headShake ${
              isLockoutError 
                ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                : 'bg-cofimar-danger/5 border-cofimar-danger/15 text-cofimar-danger'
            }`}>
              {isLockoutError ? (
                <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5 animate-pulse" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-cofimar-danger flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-widest font-bold block">
                  {isLockoutError ? 'ALERTA DE SEGURIDAD' : 'FALLO DE AUTENTICACIÓN'}
                </span>
                <p className="text-xs leading-normal font-mono font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Input Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest font-bold text-cofimar-text-muted flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                Matrícula de Usuario
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-cofimar-surface-secondary/70 border border-cofimar-border rounded-xl px-4 py-3.5 font-mono text-xs text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition placeholder:text-cofimar-text-faint"
                placeholder="Ingrese su matrícula"
              />
            </div>

            {/* Input Password */}
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-mono uppercase tracking-widest font-bold text-cofimar-text-muted flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                Contraseña Corporativa
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-cofimar-surface-secondary/70 border border-cofimar-border rounded-xl pl-4 pr-10 py-3.5 font-mono text-xs text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition placeholder:text-cofimar-text-faint"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-cofimar-text-faint hover:text-cofimar-primary transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Security Handshake */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2.5 bg-gradient-to-r from-cofimar-primary to-[#139A8C] hover:opacity-95 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition duration-200 shadow-md font-mono text-xs mt-6 tracking-widest"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>AUTENTICAR FIRMA DIGITAL</span>
                </>
              )}
            </button>
          </form>

          {/* Secure SSL notice instead of buttons */}
          <div className="pt-4 border-t border-cofimar-border/60 flex items-center justify-between text-[9px] font-mono text-cofimar-text-muted">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ENCRIPTACIÓN SSL ACTIVA
            </span>
            <span>PROYECTO COFIMAR 2026</span>
          </div>

        </div>
      </div>

      {/* Restrictive corporate warning footer */}
      <p className="mt-8 text-center text-[9px] font-mono text-cofimar-text-faint max-w-xs leading-normal">
        Este sistema es de propiedad privada de GRUPO COFIMAR. El acceso no autorizado constituirá una violación de las leyes de seguridad de la información.
      </p>
    </div>
  );
};

export default Login;
