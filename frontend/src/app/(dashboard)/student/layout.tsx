'use client';

import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, Phone, QrCode, LogOut, Ticket, Utensils, History } from 'lucide-react';

function StudentNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/student', label: 'Menú de Hoy', icon: Utensils },
    { href: '/student/tickets', label: 'Reclamos', icon: Ticket },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-300 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/student" className="flex items-center gap-2 sm:gap-3">
            <img src="/admin-logo.png" alt="Logo UNT Comedor" className="w-10 h-10 sm:w-18 sm:h-18 object-contain" />
            <span className="hidden sm:block font-semibold text-white">UNT Comedor</span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-6 ml-2 sm:ml-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs sm:text-sm font-medium transition-colors relative py-2 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-indigo-500'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon size={14} className="sm:hidden" />
                  <span className="hidden sm:inline">{link.label}</span>
                  <span className="sm:hidden">{link.label.split(' ')[0]}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-200">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.universityId}</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-600 border border-slate-700 flex items-center justify-center text-white text-xs sm:text-sm font-medium">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

function StudentFooter() {
  return (
    <footer className="mt-auto bg-slate-900 border-t border-slate-800 text-slate-300 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 text-white mb-4">
              <img src="/admin-logo.png" alt="Logo UNT Comedor" className="w-12 h-12 object-contain" />
              <span className="font-semibold text-lg">UNT Comedor</span>
            </div>
            <p className="text-sm text-slate-400">
              Sistema de gestión del comedor universitario. Genera tu código y revisa nuestros menús diarios fácilmente.
            </p>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Horario de Atención
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-slate-400">
              <div>
                <strong className="block text-slate-200 mb-2 font-medium">Lunes a Viernes</strong>
                <ul className="space-y-1.5">
                  <li>Desayuno: 6:45 - 9:20 am</li>
                  <li>Almuerzo: 11:45 - 2:15 pm</li>
                  <li>Cena: 6:30 - 8:45 pm</li>
                </ul>
              </div>
              <div>
                <strong className="block text-slate-200 mb-2 font-medium">Sábado</strong>
                <ul className="space-y-1.5">
                  <li>Desayuno: 7:00 - 9:30 am</li>
                  <li>Almuerzo: 12:00 - 2:15 pm</li>
                  <li>Cena: 6:30 - 8:30 pm</li>
                </ul>
              </div>
              <div>
                <strong className="block text-slate-200 mb-2 font-medium">Dom y Feriados</strong>
                <ul className="space-y-1.5">
                  <li>Desayuno: S/N</li>
                  <li>Almuerzo: S/N</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Recepción
            </h3>
            <div className="mb-6 text-sm text-slate-400">
              <p className="mb-1">Consultas o justificaciones:</p>
              <p className="text-slate-200">Don Víctor — <a href="tel:948238934" className="text-indigo-400 hover:text-indigo-300 transition-colors">948 238 934</a></p>
            </div>
            <a
              href="https://bigbarcode.11zon.com/es/barcode-generator/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
            >
              <QrCode className="w-4 h-4" />
              Generar Código
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} UNT Comedor Universitario. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
      <div className="dark min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-800 dark:text-slate-100 transition-colors">
        <StudentNavbar />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <StudentFooter />
      </div>
    </ProtectedRoute>
  );
}
