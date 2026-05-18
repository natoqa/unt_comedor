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
import { Eye, EyeOff, User, Lock, Mail, UserCircle } from 'lucide-react';

const registerSchema = z
  .object({
    universityId: z
      .string()
      .min(4, 'Mínimo 4 caracteres')
      .max(20, 'Máximo 20 caracteres'),
    name: z
      .string()
      .min(2, 'Mínimo 2 caracteres')
      .max(100, 'Máximo 100 caracteres'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(6, 'Mínimo 6 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Debe contener mayúscula, minúscula y número'
      ),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      await registerUser(data);
      toast.success('¡Cuenta creada exitosamente!');
      router.push('/student');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al registrar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: {
    name: keyof RegisterForm;
    label: string;
    type: string;
    placeholder: string;
    icon: React.ReactNode;
  }[] = [
    {
      name: 'universityId',
      label: 'Código Universitario',
      type: 'text',
      placeholder: 'Ej: 2024101001',
      icon: <User className="w-5 h-5" />,
    },
    {
      name: 'name',
      label: 'Nombre Completo',
      type: 'text',
      placeholder: 'Ej: Ana Lucía Paredes',
      icon: <UserCircle className="w-5 h-5" />,
    },
    {
      name: 'email',
      label: 'Email Institucional',
      type: 'email',
      placeholder: 'tu.email@unitru.edu.pe',
      icon: <Mail className="w-5 h-5" />,
    },
    {
      name: 'password',
      label: 'Contraseña',
      type: 'password',
      placeholder: '••••••••',
      icon: <Lock className="w-5 h-5" />,
    },
    {
      name: 'confirmPassword',
      label: 'Confirmar Contraseña',
      type: 'password',
      placeholder: '••••••••',
      icon: <Lock className="w-5 h-5" />,
    },
  ];

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Panel superior - Imagen del comedor (móvil) */}
      <div className="lg:hidden h-48 relative overflow-hidden">
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
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="w-full max-w-md">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Crear Cuenta
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Completa tus datos para registrarte
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2"
                >
                  {field.label}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    {field.icon}
                  </span>
                  <input
                    id={field.name}
                    type={
                      field.name === 'password' ? (showPassword ? 'text' : 'password') :
                      field.name === 'confirmPassword' ? (showConfirmPassword ? 'text' : 'password') :
                      field.type
                    }
                    placeholder={field.placeholder}
                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                    {...register(field.name)}
                  />
                  {(field.name === 'password' || field.name === 'confirmPassword') && (
                    <button
                      type="button"
                      onClick={() => field.name === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {field.name === 'password' ? (showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />) :
                       showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  )}
                </div>
                {errors[field.name] && (
                  <p className="text-sm text-[hsl(var(--destructive))] mt-1.5">
                    {errors[field.name]?.message}
                  </p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registrando...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-300 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
            >
              Inicia sesión
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
