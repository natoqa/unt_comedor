'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[hsl(var(--background))]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <p className="text-7xl mb-4">🍽️</p>
        <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-2">404</h1>
        <p className="text-lg text-[hsl(var(--muted-foreground))] mb-6">
          Esta página no está en el menú
        </p>
        <Link
          href="/"
          className="inline-flex px-5 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium hover:opacity-90 transition-opacity"
        >
          Volver al inicio
        </Link>
      </motion.div>
    </main>
  );
}
