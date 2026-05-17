'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Utensils,
  Users,
  Star,
  BarChart3,
  LogOut,
  ExternalLink,
  Menu as MenuIcon,
  Settings,
  Bell,
  X
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Gestión de Menús', href: '/admin/menus', icon: Utensils },
    { name: 'Gestión de Usuarios', href: '/admin/users', icon: Users },
    { name: 'Métricas y Valoraciones', href: '/admin/metrics', icon: BarChart3 },
    { name: 'Configuración', href: '/admin/settings', icon: Settings },
  ];

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="dark h-screen w-full bg-slate-50 dark:bg-slate-900 flex text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col text-slate-800 dark:text-slate-300 transition-colors shadow-xl">
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <span className="text-lg font-bold text-indigo-700 dark:text-white tracking-tight">Centro de Mando</span>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-6 px-4">
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-4 px-2 tracking-wider">
                  GESTIÓN COMEDOR
                </div>
                <nav className="space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-sm">{link.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </aside>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col shrink-0 text-slate-800 dark:text-slate-300 transition-colors">
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <span className="text-lg font-bold text-indigo-700 dark:text-white tracking-tight">Centro de Mando</span>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-4 px-2 tracking-wider">
              GESTIÓN COMEDOR
            </div>
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors">
          {/* Topbar */}
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 transition-colors">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <MenuIcon size={20} />
              </button>
              <div className="flex items-center gap-2">
                <img 
                  src="/admin-logo.png" 
                  alt="Logo" 
                  className="w-18 h-18 rounded-lg object-contain"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 relative">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
              </button>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                    {user?.name || 'Administrador'}
                  </p>
                  <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                    ADMINISTRADOR
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border-0 dark:border dark:border-indigo-500/20">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </header>

          {/* Children View */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
