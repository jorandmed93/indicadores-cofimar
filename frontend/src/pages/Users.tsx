import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  Users as UsersIcon, Plus, Edit2, Trash2, Shield, Eye, EyeOff, X, Save, AlertTriangle, Loader2 
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'viewer';
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Form state
  const [usernameForm, setUsernameForm] = useState<string>('');
  const [passwordForm, setPasswordForm] = useState<string>('');
  const [roleForm, setRoleForm] = useState<'admin' | 'viewer'>('viewer');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get('/users');
      setUsers(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Error al obtener la lista de usuarios desde el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditMode(false);
    setSelectedUserId(null);
    setUsernameForm('');
    setPasswordForm('');
    setRoleForm('viewer');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditMode(true);
    setSelectedUserId(user.id);
    setUsernameForm(user.username);
    setPasswordForm(''); // Leave password empty unless updating
    setRoleForm(user.role);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleDelete = async (userId: number, username: string) => {
    if (!window.confirm(`¿Está seguro que desea eliminar al usuario '${username}'?`)) {
      return;
    }
    try {
      await client.delete(`/users/${userId}`);
      showToast(`Usuario '${username}' eliminado exitosamente.`);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || 'Error al eliminar el usuario.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameForm.trim()) {
      alert('El nombre de usuario es obligatorio.');
      return;
    }

    if (!editMode && !passwordForm.trim()) {
      alert('La contraseña es obligatoria para nuevos usuarios.');
      return;
    }

    try {
      if (editMode && selectedUserId !== null) {
        const payload: any = {
          username: usernameForm.trim(),
          role: roleForm
        };
        if (passwordForm.trim()) {
          payload.password = passwordForm.trim();
        }
        await client.put(`/users/${selectedUserId}`, payload);
        showToast(`Usuario '${usernameForm}' actualizado con éxito.`);
      } else {
        await client.post('/users', {
          username: usernameForm.trim(),
          password: passwordForm.trim(),
          role: roleForm
        });
        showToast(`Usuario '${usernameForm}' creado con éxito.`);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || 'Ocurrió un error al guardar el usuario.');
    }
  };

  return (
    <div className="p-8 space-y-7 animate-fadeIn">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-cofimar-text flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-cofimar-primary" />
            Módulo de Usuarios
          </h1>
          <p className="text-cofimar-text-muted text-sm mt-1">
            Administra los usuarios del sistema, sus contraseñas y sus permisos de acceso (Administrador o Lector).
          </p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="bg-cofimar-primary hover:opacity-95 text-white px-5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          NUEVO USUARIO
        </button>
      </div>

      {/* Success Notification Toast */}
      {successMsg && (
        <div className="bg-cofimar-success/5 border border-cofimar-success/20 p-4 rounded-xl flex items-center gap-3 max-w-xl animate-fadeIn">
          <span className="w-2 h-2 bg-cofimar-success rounded-full animate-ping" />
          <span className="text-xs font-mono text-cofimar-success font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-cofimar-primary animate-spin" />
          <span className="text-cofimar-text-muted font-mono text-xs">Cargando usuarios...</span>
        </div>
      ) : error ? (
        <div className="bg-cofimar-danger/5 border border-cofimar-danger/15 p-6 rounded-xl flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-cofimar-danger flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-cofimar-danger">Ocurrió un error</h4>
            <p className="text-xs font-mono text-cofimar-text-muted mt-1">{error}</p>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-cofimar-border shadow-sm overflow-hidden bg-cofimar-surface">
          <div className="p-6 border-b border-cofimar-border/55">
            <h3 className="text-base font-bold text-cofimar-text">Usuarios Registrados</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-cofimar-surface-secondary text-cofimar-text-muted font-mono text-xs border-b border-cofimar-border/60">
                <tr>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">USUARIO</th>
                  <th className="py-4 px-6">PERFIL / ROL</th>
                  <th className="py-4 px-6 text-center">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cofimar-border/25 font-mono text-sm">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-cofimar-text-muted">No hay usuarios registrados.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-cofimar-surface-secondary transition">
                      <td className="py-4 px-6 text-cofimar-text-muted">#{u.id}</td>
                      <td className="py-4 px-6 font-bold text-cofimar-text">{u.username}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide ${
                          u.role === 'admin' 
                            ? 'bg-cofimar-primary/10 text-cofimar-primary border border-cofimar-primary/20' 
                            : 'bg-cofimar-accent/10 text-cofimar-accent border border-cofimar-accent/20'
                        }`}>
                          <Shield className="w-3 h-3" />
                          {u.role === 'admin' ? 'ADMINISTRADOR' : 'LECTURA / VIEWER'}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap w-[150px]">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-primary p-1.5 rounded-lg border border-cofimar-border transition"
                            title="Editar Usuario"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.username)}
                            className="bg-cofimar-surface-secondary hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 p-1.5 rounded-lg border border-cofimar-border transition"
                            title="Eliminar Usuario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-cofimar-surface border border-cofimar-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="p-6 border-b border-cofimar-border flex items-center justify-between bg-cofimar-surface-secondary">
              <div>
                <span className="text-[10px] font-mono text-cofimar-primary uppercase tracking-widest font-bold">
                  MÓDULO DE USUARIOS
                </span>
                <h2 className="text-xl font-bold text-cofimar-text mt-1">
                  {editMode ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
                </h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-cofimar-surface-secondary hover:bg-cofimar-surface-hover text-cofimar-text-muted rounded-lg border border-cofimar-border transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 font-sans text-xs">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-cofimar-text-secondary font-mono uppercase tracking-wider font-bold">
                    NOMBRE DE USUARIO / ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={usernameForm}
                    onChange={(e) => setUsernameForm(e.target.value)}
                    className="w-full bg-cofimar-surface-secondary border border-cofimar-border rounded-lg px-3 py-2.5 text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition placeholder:text-cofimar-text-faint font-mono"
                    placeholder="Ej: jmedina"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5 relative">
                  <label className="text-cofimar-text-secondary font-mono uppercase tracking-wider font-bold block">
                    {editMode ? 'CONTRASENA (DEJAR VACIA PARA NO CAMBIAR)' : 'CONTRASEÑA *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!editMode}
                      value={passwordForm}
                      onChange={(e) => setPasswordForm(e.target.value)}
                      className="w-full bg-cofimar-surface-secondary border border-cofimar-border rounded-lg pl-3 pr-9 py-2.5 text-cofimar-text focus:outline-none focus:border-cofimar-primary focus:ring-1 focus:ring-cofimar-primary/30 transition placeholder:text-cofimar-text-faint font-mono"
                      placeholder={editMode ? '••••••••' : 'Ingrese contraseña'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-cofimar-text-faint hover:text-cofimar-primary transition"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Role Selector */}
                <div className="space-y-1.5">
                  <label className="text-cofimar-text-secondary font-mono uppercase tracking-wider font-bold">
                    ROL / NIVEL DE ACCESO *
                  </label>
                  <select
                    value={roleForm}
                    onChange={(e) => setRoleForm(e.target.value as 'admin' | 'viewer')}
                    className="w-full bg-cofimar-surface-secondary border border-cofimar-border rounded-lg px-3 py-2.5 text-cofimar-text focus:outline-none focus:border-cofimar-primary transition font-mono"
                  >
                    <option value="viewer">Lector (Solo Lectura, sin permisos de edición)</option>
                    <option value="admin">Administrador (Control total y edición de data)</option>
                  </select>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 border-t border-cofimar-border bg-cofimar-surface-secondary flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-cofimar-bg/60 hover:bg-cofimar-bg border border-cofimar-border text-cofimar-text px-5 py-2.5 rounded-xl font-mono text-[10px] font-bold transition shadow-sm"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="bg-cofimar-primary hover:opacity-95 text-white px-5 py-2.5 rounded-xl font-mono text-[10px] font-bold flex items-center gap-2 shadow-sm transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  GUARDAR INFORMACIÓN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
