'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

export const dynamic = 'force-static';

const loginSchema = z.object({
  universityId: z.string().min(1, 'El código universitario es obligatorio'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      await login(data);
      toast.success('¡Bienvenido!');
      // Obtener el usuario del localStorage para redirigir según rol
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        router.push(payload.role === 'ADMIN' ? '/admin' : '/student');
      } else {
        router.push('/student');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">

      {/* Panel superior - Imagen del comedor (móvil) — h-[40dvh] para que no se corte */}
      <div className="lg:hidden h-[40dvh] min-h-[220px] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/comedor-background.jpg)' }}
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Panel izquierdo - Imagen del comedor (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/comedor-background.jpg)' }}
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center px-5 py-8 sm:p-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="w-full max-w-md">

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Iniciar Sesión
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2">
              Ingresa con tu código universitario
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Código Universitario */}
            <div>
              <label
                htmlFor="universityId"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2"
              >
                Código Universitario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500" />
                <input
                  id="universityId"
                  type="text"
                  placeholder="Ej: 2020101001"
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                  {...register('universityId')}
                />
              </div>
              {errors.universityId && (
                <p className="text-sm text-[hsl(var(--destructive))] mt-1.5">
                  {errors.universityId.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-9 sm:pl-10 pr-12 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-[hsl(var(--destructive))] mt-1.5">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Link a registro */}
          <p className="text-center text-sm text-slate-600 dark:text-slate-300 mt-6">
            ¿No tienes cuenta?{' '}
            <Link
              href="/register"
              className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
            >
              Regístrate aquí
            </Link>
          </p>

          <p className="text-center text-sm text-slate-600 dark:text-slate-300 mt-2">
            <Link
              href="/"
              className="hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
            >
              ← Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}