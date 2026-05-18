'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { ShiftBadge, NutritionCard } from '@/components/shared/MenuComponents';
import { RatingModal } from '@/components/shared/RatingModal';
import { menuService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import type { Menu, MealShift } from '@/types';
import { formatMenuDate, formatTodayHeading, getTodayDateString } from '@/lib/date';
import { Calendar, Coffee, Sun, Moon, Search } from 'lucide-react';

function MenuCard({
  menu,
  onRateClick,
  showDate = false,
}: {
  menu: Menu;
  onRateClick: () => void;
  showDate?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group relative border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden hover:border-indigo-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Imágenes */}
      {(() => {
        const coverImage =
          menu.images?.find((img) => img.shift === menu.shift) ?? menu.images?.[0];
        if (!coverImage) return null;
        return (
          <div className="relative h-40 sm:h-48 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
            <Image
              src={coverImage.url}
              alt={`Menú ${menu.shift}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        );
      })()}

      <div className="p-2 sm:p-4 flex flex-col h-[calc(100%-6rem)] sm:h-auto sm:min-h-[calc(100%-9rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 flex-wrap gap-1 shrink-0">
          <ShiftBadge shift={menu.shift} />
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
            {menu.startTime} - {menu.endTime}
          </span>
        </div>
        {showDate && (
          <p className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2 capitalize tracking-wide shrink-0">
            {formatMenuDate(menu.date)}
          </p>
        )}

        {menu.description && (
          <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 mb-2 sm:mb-3 line-clamp-2 shrink-0">
            {menu.description}
          </p>
        )}

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto sm:overflow-visible max-h-[250px] sm:max-h-none pr-1 sm:pr-0 space-y-2">
          {/* Platos */}
          <div className="space-y-1.5">
            {menu.dishes.map((dish) => (
              <div key={dish.id} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-500 shrink-0 mt-1.5 sm:mt-2" />
                <div className="flex-1">
                  <span className="text-[11px] sm:text-base font-medium text-slate-900 dark:text-white leading-tight block">{dish.name}</span>
                  {dish.category && (
                    <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                      {dish.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Nutrición expandible */}
          {(menu.calories || menu.proteins) && (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[10px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 w-full flex justify-between items-center"
              >
                <span>{expanded ? 'Ocultar' : 'Ver info'}</span>
                <span className="text-sm leading-none">{expanded ? '▾' : '▸'}</span>
              </button>
              {expanded && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <NutritionCard
                    calories={menu.calories}
                    proteins={menu.proteins}
                    carbs={menu.carbs}
                    fats={menu.fats}
                    iron={menu.iron}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
            <span className="text-amber-400 text-lg sm:text-xl leading-none">★</span>
            {(menu as Menu & { _count?: { ratings: number } })._count?.ratings ?? 0}
          </div>
          <button
            onClick={onRateClick}
            className="text-xs sm:text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 dark:hover:shadow-none transition-all font-medium w-full sm:w-auto"
          >
            Valorar Menú
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentContent() {
  const { user } = useAuth();
  const [todayMenus, setTodayMenus] = useState<Menu[]>([]);
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'today' | 'history'>('today');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [ratingMenu, setRatingMenu] = useState<Menu | null>(null);
  const [shiftFilter, setShiftFilter] = useState<MealShift | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar menú de hoy al montar
  const fetchToday = async () => {
    try {
      let menus = await menuService.getToday();
      if (menus.length === 0) {
        const res = await menuService.getAll({
          date: getTodayDateString(),
          limit: 10,
        });
        menus = res.data;
      }
      setTodayMenus(menus);
    } catch {
      toast.error('Error al cargar el menú de hoy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  // Cargar historial cuando cambia la vista o filtros
  useEffect(() => {
    if (view !== 'history') return;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Cargar menús con filtro de fecha si está especificado
        const res = await menuService.getAll(dateFilter ? { date: dateFilter } : {});
        console.log('Respuesta del servicio de menús:', res);

        // Manejar diferentes formatos de respuesta
        let menusData: Menu[] = [];
        if (Array.isArray(res)) {
          menusData = res;
        } else if (res?.data && Array.isArray(res.data)) {
          menusData = res.data;
        } else if (typeof res === 'object' && Object.keys(res).length > 0) {
          // Si es un objeto pero no tiene .data, asumir que es un array de menús
          menusData = Object.values(res).flat().filter(item => item && typeof item === 'object');
        }

        // Si hay paginación, cargar todas las páginas
        if (res?.pagination && res.pagination.totalPages > 1) {
          for (let page = 2; page <= res.pagination.totalPages; page++) {
            try {
              const pageRes = await menuService.getAll({
                ...(dateFilter ? { date: dateFilter } : {}),
                page
              });
              if (pageRes?.data && Array.isArray(pageRes.data)) {
                menusData = [...menusData, ...pageRes.data];
              }
            } catch (error) {
              console.error(`Error cargando página ${page}:`, error);
            }
          }
        }

        // Filtrar menús válidos con fecha
        menusData = menusData.filter(menu => menu?.date);

        setAllMenus(menusData);

        // Expandir automáticamente el último día (más reciente)
        if (menusData && menusData.length > 0) {
          const sortedByDate = [...menusData].sort((a: Menu, b: Menu) => {
            try {
              const dateA = a?.date ? new Date(a.date).getTime() : 0;
              const dateB = b?.date ? new Date(b.date).getTime() : 0;
              return dateB - dateA;
            } catch {
              return 0;
            }
          });
          const lastDate = sortedByDate[0]?.date || '';
          if (lastDate) {
            setExpandedDates(new Set([lastDate]));
          }
        }
      } catch (error) {
        console.error('Error cargando historial:', error);
        toast.error('Error al cargar historial');
        setAllMenus([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [view, dateFilter]);

  const today = formatTodayHeading();

  const shiftOrder: MealShift[] = ['BREAKFAST', 'LUNCH', 'DINNER'];
  const filteredToday = todayMenus
    .filter((menu) => shiftFilter === 'ALL' || menu.shift === shiftFilter)
    .filter((menu) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        menu.dishes.some((d) => d.name.toLowerCase().includes(q)) ||
        menu.description?.toLowerCase().includes(q)
      );
    });
  const sortedToday = [...filteredToday].sort(
    (a, b) => shiftOrder.indexOf(a.shift) - shiftOrder.indexOf(b.shift)
  );

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Main Content */}
        <div className="mb-12">
          {/* Saludo */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              ¡Hola, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
              {today}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
            {[
              { key: 'today' as const, label: 'Menú de Hoy', icon: Sun },
              { key: 'history' as const, label: 'Historial', icon: Calendar },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setView(tab.key);
                    if (tab.key === 'today') setLoading(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === tab.key
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Vista: Menú de hoy ── */}
          {view === 'today' && (
            <>
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {/* Búsqueda */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por plato..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:text-white transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {/* Filtro por turno */}
                <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                  {([
                    { key: 'ALL' as const, label: 'Todos' },
                    { key: 'BREAKFAST' as const, label: 'Desayuno' },
                    { key: 'LUNCH' as const, label: 'Almuerzo' },
                    { key: 'DINNER' as const, label: 'Cena' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setShiftFilter(opt.key)}
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                        shiftFilter === opt.key
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : sortedToday.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-5xl mb-4">📋</p>
                  <p className="text-lg font-medium text-slate-900 dark:text-white">
                    Aún no se ha publicado el menú de hoy
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Revisa más tarde o consulta el historial
                  </p>
                  <button
                    onClick={() => setView('history')}
                    className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Ver historial de menús →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {sortedToday.map((menu) => (
                    <MenuCard key={menu.id} menu={menu} onRateClick={() => setRatingMenu(menu)} showDate={false} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Vista: Historial ── */}
          {view === 'history' && (
            <>
              {/* Filtros del historial */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por plato..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:text-white transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <input
                  type="date"
                  className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow [color-scheme:dark] dark:text-white"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                  }}
                />
                {(dateFilter || searchQuery) && (
                  <button
                    onClick={() => {
                      setDateFilter('');
                      setSearchQuery('');
                    }}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline self-center whitespace-nowrap"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>

              {/* Resultados agrupados por fecha */}
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (() => {
                // Filtrar por búsqueda
                const searchFiltered = allMenus.filter((menu) => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    menu.dishes.some((d) => d.name.toLowerCase().includes(q)) ||
                    menu.description?.toLowerCase().includes(q)
                  );
                });

                if (searchFiltered.length === 0) return (
                  <div className="text-center py-20">
                    <p className="text-5xl mb-4">🔍</p>
                    <p className="text-lg font-medium text-slate-900 dark:text-white">
                      No se encontraron menús
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      Intenta con otros filtros
                    </p>
                  </div>
                );

                // Agrupar menús por fecha
                const groupedMenus = searchFiltered.reduce((acc, menu) => {
                  const dateKey = menu?.date || 'Sin fecha';
                  if (!acc[dateKey]) {
                    acc[dateKey] = [];
                  }
                  acc[dateKey].push(menu);
                  return acc;
                }, {} as Record<string, Menu[]>);

                // Ordenar fechas en orden descendente (más recientes primero)
                const sortedDates = Object.keys(groupedMenus)
                  .filter(date => date !== 'Sin fecha') // Filtrar "Sin fecha" al inicio
                  .sort((a, b) => {
                    try {
                      return new Date(b).getTime() - new Date(a).getTime();
                    } catch {
                      return 0;
                    }
                  })
                  .concat(
                    Object.keys(groupedMenus).filter(date => date === 'Sin fecha') // Agregar "Sin fecha" al final
                  );

                // Función para formatear fecha legible
                const formatDateHeader = (dateStr: string) => {
                  try {
                    return formatMenuDate(dateStr);
                  } catch {
                    return dateStr; // Retornar la cadena original en caso de error
                  }
                };

                const toggleDateExpanded = (date: string) => {
                  const newExpanded = new Set(expandedDates);
                  if (newExpanded.has(date)) {
                    newExpanded.delete(date);
                  } else {
                    newExpanded.add(date);
                  }
                  setExpandedDates(newExpanded);
                };

                return (
                  <div className="space-y-4">
                    {sortedDates.map((date) => {
                      const isExpanded = expandedDates.has(date);
                      const menusForDate = groupedMenus[date];

                      return (
                        <div key={date} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                          {/* Header colapsable */}
                          <button
                            onClick={() => toggleDateExpanded(date)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
                          >
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {formatDateHeader(date)}
                            </span>
                            <span className="text-lg leading-none text-indigo-600 dark:text-indigo-400">
                              {isExpanded ? '▾' : '▸'}
                            </span>
                          </button>

                          {/* Contenido expandible */}
                          {isExpanded && (
                            <div className="p-4 bg-white dark:bg-slate-800">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                                {menusForDate.map((menu) => (
                                  <MenuCard key={menu.id} menu={menu} onRateClick={() => setRatingMenu(menu)} showDate={false} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </>
          )}
        </div>

      </div>

      {ratingMenu && (
        <RatingModal
          menu={ratingMenu}
          onClose={() => setRatingMenu(null)}
          onRated={() => {
            if (view === 'today') {
              fetchToday();
            }
            setRatingMenu(null);
          }}
        />
      )}
    </>
  );
}

export default function StudentPage() {
  return <StudentContent />;
}
