'use client';

import { Search, Users, UserPlus, Edit2, Trash2, X, Eye, EyeOff, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { userService, User, CreateUserData, UpdateUserData } from '@/services/user.service';
import { toast } from 'sonner';

function UserFormModal({
  user,
  onClose,
  onSaved,
}: {
  user?: User | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!user;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    universityId: user?.universityId || '',
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'STUDENT',
    isActive: user?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        const updateData: UpdateUserData = {
          name: form.name,
          email: form.email,
          role: form.role,
          isActive: form.isActive,
        };
        await userService.update(user!.id, updateData);
        toast.success('Usuario actualizado');
      } else {
        if (!form.password) {
          toast.error('La contraseña es obligatoria');
          setLoading(false);
          return;
        }
        const createData: CreateUserData = {
          universityId: form.universityId,
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        };
        await userService.create(createData);
        toast.success('Usuario creado');
      }
      onSaved();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Codigo Universitario
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={form.universityId}
                onChange={(e) => setForm({ ...form, universityId: e.target.value })}
                placeholder="Ej: 2024101001"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre del usuario"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="usuario@unitru.edu.pe"
            />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Rol
              </label>
              <select
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="STUDENT">Estudiante</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Estado
                </label>
                <select
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={form.isActive ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : isEdit ? (
                'Actualizar'
              ) : (
                'Crear Usuario'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAll({
        page,
        limit: 10,
        search,
        role: roleFilter,
      });
      const payload = response.data as any;
      setUsers(payload?.data || []);
      if (payload?.pagination) {
        setTotalPages(payload.pagination.totalPages);
      }
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter, page]);

  const handleDelete = async (user: User) => {
    if (!confirm(`¿Eliminar al usuario "${user.name}"? Esta accion no se puede deshacer.`)) return;
    try {
      await userService.delete(user.id);
      toast.success('Usuario eliminado');
      fetchUsers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion de Usuarios</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Administra los accesos y roles del sistema.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              setExporting(true);
              try {
                await userService.exportExcel({ search, role: roleFilter });
                toast.success('Archivo Excel descargado');
              } catch {
                toast.error('Error al exportar usuarios');
              } finally {
                setExporting(false);
              }
            }}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Download size={16} />
            {exporting ? 'Exportando...' : 'Exportar Excel'}
          </button>
          <button
            onClick={() => { setEditingUser(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <UserPlus size={18} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-w-[150px] dark:text-white"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos los Roles</option>
          <option value="ADMIN">Administrador</option>
          <option value="STUDENT">Estudiante</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden relative min-h-[300px] transition-colors">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="px-4 sm:px-6 py-4">Usuario</th>
                <th className="px-4 sm:px-6 py-4 hidden sm:table-cell">Rol</th>
                <th className="px-4 sm:px-6 py-4 hidden md:table-cell">Estado</th>
                <th className="px-4 sm:px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs truncate">{user.email}</p>
                        <span className="sm:hidden inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                          {user.role === 'ADMIN' ? 'Admin' : 'Estudiante'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-semibold tracking-wide">
                      {user.role === 'ADMIN' ? 'Administrador' : 'Estudiante'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-max gap-1.5 ${
                      user.isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-slate-400 dark:bg-slate-500'}`}></span>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => { setEditingUser(user); setShowModal(true); }}
                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              ← Anterior
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <UserFormModal
          user={editingUser}
          onClose={() => { setShowModal(false); setEditingUser(null); }}
          onSaved={fetchUsers}
        />
      )}
    </div>
  );
}
