import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/hooks/useAuth';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'UNT Comedor - Sistema de Gestión del Comedor Universitario',
  description:
    'Plataforma de gestión del menú y evaluación de calidad del comedor universitario de la Universidad Nacional de Trujillo.',
  keywords: ['UNT', 'comedor', 'universitario', 'Trujillo', 'menú'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme');
                  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
