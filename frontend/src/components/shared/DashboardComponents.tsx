'use client';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: { value: number; label: string };
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

const colorMap = {
  primary: 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function KpiCard({ title, value, subtitle, icon, trend, color = 'primary' }: KpiCardProps) {
  return (
    <div className="p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{title}</p>
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${colorMap[color]}`}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {trend && (
          <span className={`text-xs font-medium ${trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
          </span>
        )}
        {subtitle && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[hsl(var(--foreground))]">{title}</h3>
          {subtitle && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-[hsl(var(--muted-foreground))]">
      <p className="text-3xl mb-2">📊</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}
