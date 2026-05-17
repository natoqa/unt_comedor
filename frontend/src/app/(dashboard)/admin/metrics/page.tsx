'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ratingService, GlobalStats, ShiftStats, TrendPoint } from '@/services/rating.service';
import { Star, MessageSquare, Utensils, ThumbsUp, Calendar, Loader2, TrendingUp, ArrowUpCircle, ArrowDownCircle, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatMenuDate } from '@/lib/date';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function MetricsAndRatingsPage() {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [shiftStats, setShiftStats] = useState<ShiftStats[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [extremes, setExtremes] = useState<any>(null);
  const [shiftExtremes, setShiftExtremes] = useState<any>(null);
  const [shiftView, setShiftView] = useState<'best' | 'worst'>('best');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function loadAllStats() {
      try {
        const [global, shifts, trendData, extremesData, shiftExtremesData] = await Promise.all([
          ratingService.getGlobalStats(),
          ratingService.getStatsByShift(),
          ratingService.getTrends('week'),
          ratingService.getMenuExtremes(7),
          ratingService.getShiftExtremes(7),
        ]);
        setGlobalStats(global);
        setShiftStats(shifts);
        setTrends(trendData);
        setExtremes(extremesData);
        setShiftExtremes(shiftExtremesData);
      } catch (error) {
        console.error('Error cargando métricas:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAllStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!globalStats) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <Star className="w-12 h-12 mb-4 text-slate-300" />
        <p>No hay datos de métricas disponibles.</p>
      </div>
    );
  }

  const { overallAverage, totalRatings, dimensions, recentComments } = globalStats;
  const avg = overallAverage ? overallAverage.toFixed(1) : '0.0';

  // Format trends for Recharts
  const chartTrends = trends.map(t => ({
    ...t,
    dateLabel: format(new Date(t.date), 'dd MMM', { locale: es }),
    Promedio: t.taste !== null ? Number(((t.taste + (t.quantity||0) + (t.variety||0) + (t.hygiene||0) + (t.service||0)) / 5).toFixed(1)) : 0,
  }));

  // Format shifts for BarChart
  const chartShifts = shiftStats.map(s => ({
    name: s.shift === 'BREAKFAST' ? 'Desayuno' : s.shift === 'LUNCH' ? 'Almuerzo' : 'Cena',
    Promedio: s.overallAverage ? Number(s.overallAverage.toFixed(1)) : 0,
    Total: s.totalRatings
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Métricas y Valoraciones</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Análisis de rendimiento, satisfacción y comentarios de los estudiantes.</p>
        </div>
        <button
          onClick={async () => {
            setExporting(true);
            try {
              await ratingService.exportExcel();
              toast.success('Archivo Excel descargado');
            } catch {
              toast.error('Error al exportar datos');
            } finally {
              setExporting(false);
            }
          }}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Download size={16} />
          {exporting ? 'Exportando...' : 'Exportar Excel'}
        </button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center transition-colors">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <Star className="fill-amber-500 w-8 h-8" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white">{avg}</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Calificación Promedio</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center transition-colors">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-3">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{totalRatings}</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Total de Valoraciones</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            Desglose por Criterio
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Sabor</span>
              <span className="font-semibold text-slate-900 dark:text-white">{dimensions.taste?.toFixed(1) || '0.0'} ⭐</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Cantidad</span>
              <span className="font-semibold text-slate-900 dark:text-white">{dimensions.quantity?.toFixed(1) || '0.0'} ⭐</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Higiene</span>
              <span className="font-semibold text-slate-900 dark:text-white">{dimensions.hygiene?.toFixed(1) || '0.0'} ⭐</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Servicio</span>
              <span className="font-semibold text-slate-900 dark:text-white">{dimensions.service?.toFixed(1) || '0.0'} ⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Extremes Section (Day) */}
      {extremes && (extremes.bestMenu || extremes.worstMenu) && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Desempeño por Día (Últimos 7 días)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {extremes.bestMenu && (
              <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-6 border border-emerald-100 dark:border-emerald-900/30 flex flex-col justify-center">
                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-2">
                  <ArrowUpCircle className="w-5 h-5" />
                  Mejor Día
                </h3>
                <p className="font-semibold text-slate-900 dark:text-white mt-2 text-lg capitalize">
                  {formatMenuDate(extremes.bestMenu.date)}
                </p>
                <div className="mt-3 inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800 self-start">
                  <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                  {extremes.bestMenu.average.toFixed(2)} / 15
                </div>
              </div>
            )}
            {extremes.worstMenu && (
              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 border border-red-100 dark:border-red-900/30 flex flex-col justify-center">
                <h3 className="text-sm font-bold text-red-700 dark:text-red-400 mb-1 flex items-center gap-2">
                  <ArrowDownCircle className="w-5 h-5" />
                  Peor Día
                </h3>
                <p className="font-semibold text-slate-900 dark:text-white mt-2 text-lg capitalize">
                  {formatMenuDate(extremes.worstMenu.date)}
                </p>
                <div className="mt-3 inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-full font-bold border border-red-200 dark:border-red-800 self-start">
                  <Star className="w-4 h-4 fill-red-500 text-red-500" />
                  {extremes.worstMenu.average.toFixed(2)} / 15
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Extremes Section (Shifts) */}
      {shiftExtremes && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Utensils className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Desempeño por Turnos (Últimos 7 días)
            </h2>
            <select
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 font-medium"
              value={shiftView}
              onChange={(e) => setShiftView(e.target.value as 'best' | 'worst')}
            >
              <option value="best">Mostrar Mejores Turnos</option>
              <option value="worst">Mostrar Peores Turnos</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {['breakfast', 'lunch', 'dinner'].map((shiftType) => {
              const shiftData = shiftExtremes[shiftType as keyof typeof shiftExtremes][shiftView];
              const title = shiftType === 'breakfast' ? 'Desayuno' : shiftType === 'lunch' ? 'Almuerzo' : 'Cena';
              const colorClass = shiftView === 'best' ? 'emerald' : 'red';
              const Icon = shiftView === 'best' ? ArrowUpCircle : ArrowDownCircle;

              if (!shiftData) return (
                <div key={shiftType} className={`bg-${colorClass}-50 dark:bg-${colorClass}-900/10 rounded-xl p-5 border border-${colorClass}-100 dark:border-${colorClass}-900/30 opacity-50 flex items-center justify-center`}>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No hay datos de {title}</p>
                </div>
              );

              return (
                <div key={shiftType} className={`bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden transition-colors`}>
                  <div className={`absolute top-0 left-0 w-1 h-full bg-${colorClass}-500`} />
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">{title}</h3>
                    <Icon className={`w-5 h-5 text-${colorClass}-500`} />
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white text-base mb-1">
                    {format(new Date(shiftData.date), "EEEE, d 'de' MMMM", { locale: es })}
                  </p>
                  <div className={`mt-3 inline-flex items-center gap-1.5 bg-${colorClass}-50 dark:bg-slate-900 text-${colorClass}-700 dark:text-${colorClass}-400 px-2.5 py-1 rounded-md font-bold text-sm border border-${colorClass}-100 dark:border-${colorClass}-800`}>
                    <Star className={`w-3.5 h-3.5 fill-${colorClass}-500 text-${colorClass}-500`} />
                    {shiftData.average.toFixed(2)} ⭐
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Tendencia de Satisfacción (Semana)
          </h2>
          <div className="h-48 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dateLabel" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="Promedio" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  dot={{ fill: '#4f46e5', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart Shifts */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Desempeño por Turno
          </h2>
          <div className="h-48 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartShifts} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="Promedio" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Comments */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Comentarios Recientes
        </h2>

        {recentComments && recentComments.length > 0 ? (
          <div className="space-y-4">
            {recentComments.map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                      A
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Anónimo</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(item.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">
                          <Utensils className="w-3 h-3" />
                          {item.menu.shift === 'BREAKFAST' ? 'Desayuno' : item.menu.shift === 'LUNCH' ? 'Almuerzo' : 'Cena'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {((item.taste + item.quantity + item.variety + item.hygiene + item.service) / 5).toFixed(1)}
                    </span>
                  </div>
                </div>
                {item.comment ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-3 rounded border border-slate-100 dark:border-slate-700">
                    "{item.comment}"
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic">Sin comentario escrito.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 text-slate-300" />
            <p>No hay comentarios recientes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
