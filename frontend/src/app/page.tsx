'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export const dynamic = 'force-static';

const features = [
  { icon: '📋', title: 'Menú diario', desc: 'Consulta desayuno, almuerzo y cena cada día.' },
  { icon: '🥗', title: 'Info nutricional', desc: 'Calorías, proteínas, carbohidratos y más.' },
  { icon: '⭐', title: 'Valoraciones', desc: 'Califica el servicio y ayúdanos a mejorar.' },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b border-[hsl(var(--border))]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="font-semibold text-lg">UNT Comedor</span>
          </div>
          <nav className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-sm font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
            Universidad Nacional de Trujillo
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight text-[hsl(var(--foreground))]"
          >
            Comedor Universitario{' '}
            <span className="text-[hsl(var(--primary))]">Digital</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg text-[hsl(var(--muted-foreground))] max-w-xl mx-auto"
          >
            Consulta el menú del día, revisa la información nutricional y
            ayúdanos a mejorar el servicio con tu valoración.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium hover:opacity-90 transition-opacity text-center"
            >
              Ver menú de hoy
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-medium hover:bg-[hsl(var(--secondary))] transition-colors text-center"
            >
              Crear cuenta
            </Link>
          </motion.div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-4 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition-colors cursor-default"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="font-medium text-sm">{feature.title}</h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="border-t border-[hsl(var(--border))] py-6"
      >
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
          © {new Date().getFullYear()} Universidad Nacional de Trujillo — Comedor Universitario
        </div>
      </motion.footer>
    </main>
  );
}
