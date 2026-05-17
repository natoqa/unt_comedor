'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }

    if (
      !isLoading &&
      isAuthenticated &&
      allowedRoles &&
      user &&
      !allowedRoles.includes(user.role)
    ) {
      router.push('/unauthorized');
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
