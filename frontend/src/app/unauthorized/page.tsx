'use client';

import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
          Acceso Denegado
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-6">
          No tienes permisos para acceder a esta sección.
        </p>
        <Link
          href="/"
          className="inline-flex px-5 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium hover:opacity-90 transition-opacity"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
