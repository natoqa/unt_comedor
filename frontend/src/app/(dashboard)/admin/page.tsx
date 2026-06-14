'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Utensils,
  Users,
  Search,
  BarChart3,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { userService, DashboardStats } from '@/services/user.service';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async (isBackground = false) => {
      try {
        if (!isBackground) setLoading(true);
        const data = await userService.getDashboardStats();
        setStats(data);
      } catch (error) {
        if (!isBackground) toast.error('Error al cargar las estadísticas del dashboard');
      } finally {
        if (!isBackground) setLoading(false);
      }
    };
    
    fetchStats();

    // Polling cada 10 segundos
    const intervalId = setInterval(() => {
      fetchStats(true);
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Resumen Operativo</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Visión general del sistema del comedor y operaciones diarias.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden transition-colors">
          {loading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm z-10 flex items-center justify-center"><div className="w-5 h-5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" /></div>}
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
            <Users size={20} />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.activeStudents ?? '...'}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Estudiantes Activos</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden transition-colors">
          {loading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm z-10 flex items-center justify-center"><div className="w-5 h-5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" /></div>}
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
            <Utensils size={20} />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.totalMenus ?? '...'}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Menús Registrados</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden transition-colors">
          {loading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm z-10 flex items-center justify-center"><div className="w-5 h-5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" /></div>}
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
            <Users size={20} />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.ratingsToday ?? '...'}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Valoraciones Hoy</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link href="/admin/menus" className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:border-indigo-100 dark:hover:border-indigo-500 hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 sm:gap-3 group">
            <div className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <Utensils size={22} strokeWidth={1.5} />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white text-center">Gestionar Menús</span>
          </Link>
          <Link href="/admin/users" className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:border-indigo-100 dark:hover:border-indigo-500 hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 sm:gap-3 group">
            <div className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <Users size={22} strokeWidth={1.5} />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white text-center">Gestionar Usuarios</span>
          </Link>
          <button className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:border-indigo-100 dark:hover:border-indigo-500 hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 sm:gap-3 group">
            <div className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <BarChart3 size={22} strokeWidth={1.5} />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white text-center">Ver Métricas</span>
          </button>
        </div>
      </div>

      {/* Bottom Split Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        {loading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl"><div className="w-5 h-5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" /></div>}
        {/* Left Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Estado del Comedor</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Estudiantes Activos</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stats?.activeStudents ?? '...'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Menús Registrados</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stats?.totalMenus ?? '...'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Valoraciones Hoy</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stats?.ratingsToday ?? '...'}</span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Salud del Sistema</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Valoraciones Positivas (&ge;4⭐)</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stats?.positiveRatingsPercentage ?? 0}%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Quejas Registradas</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stats?.complaints ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">Alertas de Calidad <AlertCircle size={14} className="text-slate-400 dark:text-slate-500" /></span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{(stats?.complaints ?? 0) > 0 ? 1 : 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
