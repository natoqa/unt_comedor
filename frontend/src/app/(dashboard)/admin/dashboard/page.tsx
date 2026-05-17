'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { KpiCard, ChartCard, EmptyState } from '@/components/shared/DashboardComponents';
import { ratingService } from '@/services';
import type { GlobalStats, ShiftStats, TrendPoint } from '@/services/rating.service';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useRouter } from 'next/navigation';
import { SHIFT_LABELS } from '@/types';
import type { MealShift } from '@/types';

const DIMENSION_LABELS: Record<string, string> = {
  taste: 'Sabor',
  quantity: 'Cantidad',
  variety: 'Variedad',
  hygiene: 'Higiene',
  service: 'Atención',
};

const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
const SHIFT_COLORS: Record<string, string> = {
  BREAKFAST: '#f59e0b',
  LUNCH: '#ef4444',
  DINNER: '#6366f1',
};
const PIE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#6366f1'];

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [shiftStats, setShiftStats] = useState<ShiftStats[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gStats, sStats, tData] = await Promise.all([
        ratingService.getGlobalStats(),
        ratingService.getStatsByShift(),
        ratingService.getTrends(period),
      ]);
      setGlobalStats(gStats);
      setShiftStats(sStats);
      setTrends(tData);
    } catch {
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = () => { logout(); router.push('/login'); };

  // ── Datos procesados para gráficas ──

  // Radar: promedios por dimensión
  const radarData = globalStats
    ? Object.entries(globalStats.dimensions).map(([key, value]) => ({
        dimension: DIMENSION_LABELS[key] || key,
        valor: value ?? 0,
        fullMark: 5,
      }))
    : [];

  // Barras: comparación por turno
  const shiftBarData = shiftStats.map((s) => ({
    turno: SHIFT_LABELS[s.shift as MealShift] || s.shift,
    promedio: s.overallAverage ?? 0,
    valoraciones: s.totalRatings,
    ...Object.fromEntries(
      Object.entries(s.dimensions).map(([k, v]) => [DIMENSION_LABELS[k] || k, v ?? 0])
    ),
  }));

  // Líneas: tendencias
  const trendData = trends.map((t) => ({
    fecha: new Date(t.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
    Sabor: t.taste,
    Cantidad: t.quantity,
    Variedad: t.variety,
    Higiene: t.hygiene,
    Atención: t.service,
  }));

  // Pie: distribución
  const pieData = globalStats?.distribution?.map((d) => ({
    name: `${d.stars} ★`,
    value: d.count,
  })) || [];

  // Dimensiones detalladas por turno para la tabla
  const dimensionKeys = ['taste', 'quantity', 'variety', 'hygiene', 'service'] as const;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Navbar */}
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🍽️</span>
            <span className="font-semibold">UNT Comedor</span>
            <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-xs font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin')} className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Panel</button>
            <button onClick={() => router.push('/admin/menus')} className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Menús</button>
            <ThemeToggle />
            <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
            <button onClick={handleLogout} className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Salir</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard de Satisfacción 📊</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Métricas y análisis para mejora continua del servicio</p>
          </div>
          <div className="flex gap-1 p-1 bg-[hsl(var(--secondary))] rounded-lg">
            {([
              { key: 'week' as const, label: 'Semana' },
              { key: 'month' as const, label: 'Mes' },
              { key: 'quarter' as const, label: 'Trimestre' },
            ]).map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  period === p.key
                    ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm'
                    : 'text-[hsl(var(--muted-foreground))]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !globalStats || globalStats.totalRatings === 0 ? (
          <EmptyState message="Aún no hay valoraciones para mostrar estadísticas" />
        ) : (
          <div className="space-y-6">
            {/* ── KPIs ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Satisfacción General"
                value={globalStats.overallAverage?.toFixed(1) ?? '—'}
                subtitle="de 5.0 puntos"
                icon="⭐"
                color={
                  (globalStats.overallAverage ?? 0) >= 4 ? 'success' :
                  (globalStats.overallAverage ?? 0) >= 3 ? 'warning' : 'danger'
                }
              />
              <KpiCard
                title="Total Valoraciones"
                value={globalStats.totalRatings}
                subtitle="en el periodo"
                icon="📝"
                color="primary"
              />
              <KpiCard
                title="Mejor Dimensión"
                value={
                  Object.entries(globalStats.dimensions)
                    .filter(([, v]) => v !== null)
                    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]
                    ? `${DIMENSION_LABELS[Object.entries(globalStats.dimensions).filter(([, v]) => v !== null).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0][0]]}`
                    : '—'
                }
                subtitle={
                  Object.entries(globalStats.dimensions)
                    .filter(([, v]) => v !== null)
                    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]
                    ? `${(Object.entries(globalStats.dimensions).filter(([, v]) => v !== null).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0][1] ?? 0).toFixed(1)} / 5`
                    : ''
                }
                icon="🏆"
                color="success"
              />
              <KpiCard
                title="Peor Dimensión"
                value={
                  Object.entries(globalStats.dimensions)
                    .filter(([, v]) => v !== null)
                    .sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0))[0]
                    ? `${DIMENSION_LABELS[Object.entries(globalStats.dimensions).filter(([, v]) => v !== null).sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0))[0][0]]}`
                    : '—'
                }
                subtitle={
                  Object.entries(globalStats.dimensions)
                    .filter(([, v]) => v !== null)
                    .sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0))[0]
                    ? `${(Object.entries(globalStats.dimensions).filter(([, v]) => v !== null).sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0))[0][1] ?? 0).toFixed(1)} / 5`
                    : ''
                }
                icon="⚠️"
                color="danger"
              />
            </div>

            {/* ── Radar + Distribución ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar de dimensiones */}
              <ChartCard title="Promedio por Dimensión" subtitle="Perfil de satisfacción en las 5 áreas evaluadas">
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData} outerRadius="70%">
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis
                        dataKey="dimension"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 5]}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      />
                      <Radar
                        name="Promedio"
                        dataKey="valor"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : <EmptyState message="Sin datos" />}
              </ChartCard>

              {/* Distribución tipo pie */}
              <ChartCard title="Distribución de Calificaciones" subtitle="Proporción de estrellas otorgadas">
                {pieData.some((d) => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyState message="Sin datos" />}
              </ChartCard>
            </div>

            {/* ── Tendencias ── */}
            <ChartCard
              title="Tendencias de Satisfacción"
              subtitle={`Evolución diaria — último${period === 'week' ? 's 7 días' : period === 'month' ? ' mes' : ' trimestre'}`}
            >
              {trendData.length > 1 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="fecha"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 5]}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                    {['Sabor', 'Cantidad', 'Variedad', 'Higiene', 'Atención'].map(
                      (dim, i) => (
                        <Line
                          key={dim}
                          type="monotone"
                          dataKey={dim}
                          stroke={CHART_COLORS[i]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                          connectNulls
                        />
                      )
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : <EmptyState message="Se necesitan al menos 2 días con datos para mostrar tendencias" />}
            </ChartCard>

            {/* ── Comparación por turno ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Comparación por Turno" subtitle="Promedio general por turno">
                {shiftBarData.some((d) => d.promedio > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={shiftBarData} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="turno"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis
                        domain={[0, 5]}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="promedio" radius={[6, 6, 0, 0]}>
                        {shiftBarData.map((entry, i) => {
                          const shiftKey = shiftStats[i]?.shift || '';
                          return <Cell key={i} fill={SHIFT_COLORS[shiftKey] || CHART_COLORS[i]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState message="Sin datos por turno" />}
              </ChartCard>

              {/* Tabla detallada por turno */}
              <ChartCard title="Detalle por Turno y Dimensión" subtitle="Promedios desglosados">
                {shiftStats.some((s) => s.totalRatings > 0) ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[hsl(var(--border))]">
                          <th className="text-left py-2 font-medium text-[hsl(var(--muted-foreground))]">Dimensión</th>
                          {shiftStats.map((s) => (
                            <th key={s.shift} className="text-center py-2 font-medium text-[hsl(var(--muted-foreground))]">
                              {SHIFT_LABELS[s.shift as MealShift] || s.shift}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dimensionKeys.map((dim) => (
                          <tr key={dim} className="border-b border-[hsl(var(--border)/0.5)]">
                            <td className="py-2.5 font-medium">{DIMENSION_LABELS[dim]}</td>
                            {shiftStats.map((s) => {
                              const val = s.dimensions[dim];
                              const color =
                                val === null ? 'text-[hsl(var(--muted-foreground))]' :
                                val >= 4 ? 'text-emerald-600' :
                                val >= 3 ? 'text-amber-600' : 'text-red-500';
                              return (
                                <td key={s.shift} className={`text-center py-2.5 font-semibold ${color}`}>
                                  {val?.toFixed(1) ?? '—'}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        <tr className="font-bold">
                          <td className="py-2.5">Promedio</td>
                          {shiftStats.map((s) => (
                            <td key={s.shift} className="text-center py-2.5 text-[hsl(var(--primary))]">
                              {s.overallAverage?.toFixed(1) ?? '—'}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : <EmptyState message="Sin datos" />}
              </ChartCard>
            </div>

            {/* ── Dimensiones en barras horizontales ── */}
            <ChartCard title="Promedios por Dimensión" subtitle="Vista comparativa de las 5 áreas">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={radarData} layout="vertical" barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 5]}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="dimension"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [value.toFixed(2), 'Promedio']}
                  />
                  <Bar dataKey="valor" radius={[0, 6, 6, 0]}>
                    {radarData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* ── Comentarios recientes ── */}
            <ChartCard
              title="Comentarios Recientes"
              subtitle={`Últimos ${globalStats.recentComments.length} comentarios anónimos`}
            >
              {globalStats.recentComments.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {globalStats.recentComments.map((c, i) => {
                    const avg = (c.taste + c.quantity + c.variety + c.hygiene + c.service) / 5;
                    return (
                      <div
                        key={i}
                        className="p-3 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.2)] transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              avg >= 4 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              avg >= 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              ⭐ {avg.toFixed(1)}
                            </span>
                            <span className="text-xs text-[hsl(var(--muted-foreground))]">
                              {SHIFT_LABELS[c.menu.shift as MealShift]} — {new Date(c.menu.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                            {new Date(c.createdAt).toLocaleDateString('es-PE')}
                          </span>
                        </div>
                        <p className="text-sm text-[hsl(var(--foreground))]">{c.comment}</p>
                      </div>
                    );
                  })}
                </div>
              ) : <EmptyState message="Aún no hay comentarios" />}
            </ChartCard>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
