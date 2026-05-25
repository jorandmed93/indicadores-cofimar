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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-cofimar-bg text-cofimar-text transition-colors duration-300 relative overflow-hidden">
      
      {/* Dynamic Geometric Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cofimar-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cofimar-accent/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Cyber Grid Background Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <div className="flex bg-cofimar-surface-secondary/80 backdrop-blur-md p-0.5 rounded-lg border border-cofimar-border shadow-sm">
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

      {/* Main Container with Neon Glowing Border Effect */}
      <div className="relative w-full max-w-md z-10">
        
        {/* Glow behind the card */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cofimar-primary/30 to-cofimar-accent/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
        
        {/* Card Body */}
        <div className="relative w-full p-8 md:p-10 bg-cofimar-surface/90 backdrop-blur-md rounded-2xl border border-cofimar-border/80 shadow-2xl space-y-6">
          
          {/* Brand Header */}
          <div className="flex flex-col items-center space-y-3.5 text-center">
            <div className="w-12 h-12 bg-gradient-to-tr from-cofimar-primary to-cofimar-accent rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition duration-300">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-cofimar-text to-cofimar-text-secondary bg-clip-text text-transparent">
                Control de Indicadores
              </h1>
              <p className="text-xs text-cofimar-text-muted mt-1 font-body">
                Sistema de Seguridad de Cuentas Cofimar Control
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
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold block">
                  {isLockoutError ? 'ALERTA DE SEGURIDAD' : 'FALLO DE AUTENTICACIÓN'}
                </span>
                <p className="text-xs leading-normal font-mono font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest font-bold text-cofimar-text-muted flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                ID DE USUARIO / MATRÍCULA
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-cofimar-surface-secondary/70 border border-cofimar-border rounded-xl px-4 py-3 font-mono text-xs text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition placeholder:text-cofimar-text-faint"
                placeholder="Ej: admin, jmedina, lector"
              />
            </div>

            {/* Input Password */}
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-mono uppercase tracking-widest font-bold text-cofimar-text-muted flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                CONTRASEÑA ENCRIPTADA
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-cofimar-surface-secondary/70 border border-cofimar-border rounded-xl pl-4 pr-10 py-3 font-mono text-xs text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition placeholder:text-cofimar-text-faint"
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
              className="w-full flex items-center justify-center space-x-2.5 bg-gradient-to-r from-cofimar-primary to-cofimar-accent hover:opacity-95 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md font-mono text-xs mt-6 tracking-widest"
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

          {/* Quick Access Presets (Secured with Badge) */}
          <div className="pt-5 border-t border-cofimar-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-mono text-cofimar-text-faint uppercase tracking-widest font-bold">
                MÓDULOS DE ACCESO SEGURO
              </span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-cofimar-primary/10 text-cofimar-primary border border-cofimar-primary/10">
                ACTIVE SHIELD
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleApplyPreset('admin', 'admin')}
                className="p-3 bg-cofimar-surface-secondary/40 hover:bg-cofimar-primary/5 border border-cofimar-border/60 hover:border-cofimar-primary/20 rounded-xl text-left transition duration-200 group"
              >
                <span className="font-sans font-bold text-[10px] text-cofimar-primary group-hover:underline block">ADMIN ACCESS</span>
                <span className="text-[8px] text-cofimar-text-faint block mt-0.5 font-mono">ID: admin</span>
              </button>
              <button
                onClick={() => handleApplyPreset('lector', 'lector')}
                className="p-3 bg-cofimar-surface-secondary/40 hover:bg-cofimar-accent/5 border border-cofimar-border/60 hover:border-cofimar-accent/20 rounded-xl text-left transition duration-200 group"
              >
                <span className="font-sans font-bold text-[10px] text-cofimar-accent group-hover:underline block">LECTOR ACCESS</span>
                <span className="text-[8px] text-cofimar-text-faint block mt-0.5 font-mono">ID: lector</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
