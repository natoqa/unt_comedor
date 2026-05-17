'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { ShiftBadge } from '@/components/shared/MenuComponents';
import { menuService } from '@/services';
import { useRouter } from 'next/navigation';
import type { Menu, MealShift } from '@/types';
import { SHIFT_LABELS } from '@/types';
import { formatMenuDateShort } from '@/lib/date';
import { resolveMenuImageUrl } from '@/lib/imageUrl';
import { Pencil, Trash2, Calendar as CalendarIcon, Utensils, Star, Flame, Search, Filter } from 'lucide-react';

const MEAL_SHIFTS: MealShift[] = ['BREAKFAST', 'LUNCH', 'DINNER'];

const SHIFT_DEFAULTS: Record<MealShift, { startTime: string; endTime: string }> = {
  BREAKFAST: { startTime: '07:00', endTime: '09:00' },
  LUNCH: { startTime: '12:00', endTime: '14:00' },
  DINNER: { startTime: '19:00', endTime: '21:00' },
};

type ShiftSectionData = {
  menuId?: string;
  startTime: string;
  endTime: string;
  description: string;
  calories: string;
  proteins: string;
  carbs: string;
  fats: string;
  iron: string;
  dishes: { name: string; category: string }[];
  image: File | null;
  imagePreview: string | null;
};

const emptyShiftSection = (shift: MealShift): ShiftSectionData => ({
  startTime: SHIFT_DEFAULTS[shift].startTime,
  endTime: SHIFT_DEFAULTS[shift].endTime,
  description: '',
  calories: '',
  proteins: '',
  carbs: '',
  fats: '',
  iron: '',
  dishes: [{ name: '', category: 'Principal' }],
  image: null,
  imagePreview: null,
});

const sectionFromMenu = (menu: Menu): ShiftSectionData => ({
  menuId: menu.id,
  startTime: menu.startTime,
  endTime: menu.endTime,
  description: menu.description || '',
  calories: menu.calories?.toString() || '',
  proteins: menu.proteins?.toString() || '',
  carbs: menu.carbs?.toString() || '',
  fats: menu.fats?.toString() || '',
  iron: menu.iron?.toString() || '',
  dishes: menu.dishes.map((d) => ({ name: d.name, category: d.category || '' })),
  image: null,
  imagePreview:
    resolveMenuImageUrl(menu.images.find((img) => img.shift === menu.shift)) ??
    null,
});

function ShiftMenuSection({
  shift,
  data,
  onChange,
  inputClass,
  fieldClass,
}: {
  shift: MealShift;
  data: ShiftSectionData;
  onChange: (data: ShiftSectionData) => void;
  inputClass: string;
  fieldClass: string;
}) {
  const addDish = () => onChange({ ...data, dishes: [...data.dishes, { name: '', category: '' }] });
  const removeDish = (i: number) =>
    onChange({ ...data, dishes: data.dishes.filter((_, idx) => idx !== i) });

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Hora inicio</label>
          <input
            type="time"
            className={inputClass}
            value={data.startTime}
            onChange={(e) => onChange({ ...data, startTime: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Hora fin</label>
          <input
            type="time"
            className={inputClass}
            value={data.endTime}
            onChange={(e) => onChange({ ...data, endTime: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={2}
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder={`Descripción del ${SHIFT_LABELS[shift].toLowerCase()}...`}
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">
          Imagen del menú completo <span className="text-red-500">*</span>
        </label>
        <label
          className={`relative flex items-center justify-center h-36 rounded-lg border-2 border-dashed cursor-pointer overflow-hidden transition-colors ${data.imagePreview
              ? 'border-indigo-500'
              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500/50'
            }`}
        >
          {data.imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.imagePreview}
              alt={SHIFT_LABELS[shift]}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">Clic para subir imagen</span>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              onChange({
                ...data,
                image: file,
                imagePreview: file ? URL.createObjectURL(file) : data.imagePreview,
              });
            }}
          />
        </label>
      </div>

      <div>
        <label className="block text-xs font-medium mb-2">Información nutricional</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {[
            { key: 'calories' as const, label: 'Calorías', ph: 'kcal' },
            { key: 'proteins' as const, label: 'Proteínas', ph: 'g' },
            { key: 'carbs' as const, label: 'Carbos', ph: 'g' },
            { key: 'fats' as const, label: 'Grasas', ph: 'g' },
            { key: 'iron' as const, label: 'Hierro', ph: 'mg' },
          ].map((n) => (
            <div key={n.key}>
              <input
                type="number"
                step="0.1"
                min="0"
                className={`${inputClass} text-center`}
                placeholder={n.ph}
                value={data[n.key]}
                onChange={(e) => onChange({ ...data, [n.key]: e.target.value })}
              />
              <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 mt-1">{n.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium">Platos</label>
          <button type="button" onClick={addDish} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
            + Agregar plato
          </button>
        </div>
        <div className="space-y-2">
          {data.dishes.map((dish, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_7.5rem_auto] gap-2 items-center">
              <input
                className={`${fieldClass} min-w-0`}
                placeholder="Nombre del plato"
                value={dish.name}
                onChange={(e) => {
                  const updated = [...data.dishes];
                  updated[i] = { ...updated[i], name: e.target.value };
                  onChange({ ...data, dishes: updated });
                }}
              />
              <select
                className={`${fieldClass} w-full col-span-1 sm:col-span-1`}
                value={dish.category}
                onChange={(e) => {
                  const updated = [...data.dishes];
                  updated[i] = { ...updated[i], category: e.target.value };
                  onChange({ ...data, dishes: updated });
                }}
              >
                <option value="">Categoría</option>
                {['Entrada', 'Principal', 'Guarnición', 'Bebida', 'Postre', 'Fruta'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {data.dishes.length > 1 ? (
                <button type="button" onClick={() => removeDish(i)} className="text-red-500 hover:text-red-700 px-2 shrink-0">
                  ✕
                </button>
              ) : (
                <span className="w-8 shrink-0" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuFormModal({
  editDate,
  onClose,
  onSaved,
}: {
  editDate?: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!editDate;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [date, setDate] = useState(editDate || '');
  const [activeShift, setActiveShift] = useState<MealShift>('BREAKFAST');
  const [sections, setSections] = useState<Record<MealShift, ShiftSectionData>>({
    BREAKFAST: emptyShiftSection('BREAKFAST'),
    LUNCH: emptyShiftSection('LUNCH'),
    DINNER: emptyShiftSection('DINNER'),
  });

  const isSectionComplete = (shift: MealShift) => {
    const section = sections[shift];
    return (
      Boolean(section.description.trim()) &&
      Boolean(section.image || section.imagePreview) &&
      section.dishes.some((d) => d.name.trim())
    );
  };

  useEffect(() => {
    if (!editDate) return;
    const loadDayMenus = async () => {
      setLoadingData(true);
      try {
        const res = await menuService.getAll({ date: editDate, limit: 10 });
        const next: Record<MealShift, ShiftSectionData> = {
          BREAKFAST: emptyShiftSection('BREAKFAST'),
          LUNCH: emptyShiftSection('LUNCH'),
          DINNER: emptyShiftSection('DINNER'),
        };
        res.data.forEach((menu) => {
          next[menu.shift] = sectionFromMenu(menu);
        });
        setSections(next);
        setDate(editDate);
      } catch {
        toast.error('Error al cargar menús del día');
      } finally {
        setLoadingData(false);
      }
    };
    loadDayMenus();
  }, [editDate]);

  const updateSection = (shift: MealShift, data: ShiftSectionData) => {
    setSections((prev) => ({ ...prev, [shift]: data }));
  };

  const buildPayload = (shift: MealShift, section: ShiftSectionData) => ({
    date,
    shift,
    startTime: section.startTime,
    endTime: section.endTime,
    description: section.description.trim(),
    calories: section.calories ? parseInt(section.calories) : undefined,
    proteins: section.proteins ? parseFloat(section.proteins) : undefined,
    carbs: section.carbs ? parseFloat(section.carbs) : undefined,
    fats: section.fats ? parseFloat(section.fats) : undefined,
    iron: section.iron ? parseFloat(section.iron) : undefined,
    dishes: section.dishes.filter((d) => d.name.trim()),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error('Selecciona una fecha');
      return;
    }

    for (const shift of MEAL_SHIFTS) {
      const section = sections[shift];
      const label = SHIFT_LABELS[shift];

      if (!section.description.trim()) {
        toast.error(`Agrega la descripción de ${label}`);
        return;
      }
      if (!section.image && !section.imagePreview) {
        toast.error(`Sube la imagen de ${label}`);
        return;
      }
      if (section.dishes.filter((d) => d.name.trim()).length === 0) {
        toast.error(`Agrega al menos un plato en ${label}`);
        return;
      }
    }

    setLoading(true);
    try {
      for (const shift of MEAL_SHIFTS) {
        const section = sections[shift];
        const payload = buildPayload(shift, section);
        let menuId = section.menuId;

        if (isEdit && menuId) {
          await menuService.update(menuId, payload);
        } else if (!isEdit) {
          const created = await menuService.create(payload);
          menuId = created.id;
        } else if (isEdit && !menuId) {
          const created = await menuService.create(payload);
          menuId = created.id;
        }

        if (menuId && section.image) {
          await menuService.uploadImages(menuId, { [shift]: section.image });
        }
      }

      toast.success(isEdit ? 'Menús del día actualizados' : 'Menús del día creados');
      onSaved();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow';
  const fieldClass =
    'px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold dark:text-white">{isEdit ? 'Editar menús del día' : 'Nuevo menú del día'}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Completa desayuno, almuerzo y cena para la fecha seleccionada
              </p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl">
              &times;
            </button>
          </div>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={inputClass}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isEdit}
              />
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Selecciona el turno que deseas configurar
              </p>
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                {MEAL_SHIFTS.map((shift) => (
                  <button
                    key={shift}
                    type="button"
                    onClick={() => setActiveShift(shift)}
                    className={`py-2.5 px-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${activeShift === shift
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    {SHIFT_LABELS[shift]}
                    {isSectionComplete(shift) && (
                      <span className="text-[10px] text-green-600 dark:text-green-400" title="Completo">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <ShiftMenuSection
              key={activeShift}
              shift={activeShift}
              data={sections[activeShift]}
              onChange={(data) => updateSection(activeShift, data)}
              inputClass={inputClass}
              fieldClass={fieldClass}
            />

            <div className="flex gap-3 pt-2 sticky bottom-0 bg-white dark:bg-slate-800 pb-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : isEdit ? (
                  'Actualizar menús'
                ) : (
                  'Crear menús del día'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminMenusPage() {
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [shiftFilter, setShiftFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const groupedMenus = useMemo(() => {
    const groups: Record<string, Menu[]> = {};
    menus.forEach((menu) => {
      const d = menu.date.split('T')[0];
      if (!groups[d]) groups[d] = [];
      groups[d].push(menu);
    });
    return Object.entries(groups).map(([date, dayMenus]) => ({
      date,
      menus: dayMenus,
    }));
  }, [menus]);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await menuService.getAll({
        page,
        limit: 30,
        shift: shiftFilter || undefined,
        date: dateFilter || undefined,
        search: search || undefined,
      });
      setMenus(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch {
      toast.error('Error al cargar menús');
    } finally {
      setLoading(false);
    }
  }, [page, shiftFilter, dateFilter, search]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleDeleteDate = async (menusForDate: Menu[]) => {
    if (!confirm('¿Eliminar todos los menús de este día?')) return;
    try {
      await Promise.all(menusForDate.map((m) => menuService.delete(m.id)));
      toast.success('Menús del día eliminados');
      fetchMenus();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold dark:text-white">Gestión de Menús</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Crea el menú completo del día: desayuno, almuerzo y cena
            </p>
          </div>
          <button
            onClick={() => {
              setEditingDate(null);
              setShowModal(true);
            }}
            className="px-4 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:opacity-90"
          >
            + Nuevo menú del día
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Buscar menús por platos..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="relative sm:w-48">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="date"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-600 dark:text-slate-300"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="relative sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <select
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-600 dark:text-slate-300 appearance-none"
              value={shiftFilter}
              onChange={(e) => {
                setShiftFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos los turnos</option>
              <option value="BREAKFAST">Desayuno</option>
              <option value="LUNCH">Almuerzo</option>
              <option value="DINNER">Cena</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : menus.length === 0 ? (
          <div className="text-center py-20 text-[hsl(var(--muted-foreground))]">
            <p className="text-4xl mb-3">📋</p>
            <p>No se encontraron menús</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Turno</th>
                    <th className="px-6 py-4 hidden md:table-cell">Platos Principales</th>
                    <th className="px-6 py-4 hidden lg:table-cell text-center">Calorías</th>
                    <th className="px-6 py-4 hidden sm:table-cell text-center">Valoración</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {groupedMenus.map((group) => {
                    const firstMenu = group.menus[0];
                    const totalCalories = group.menus.reduce((acc, m) => acc + (m.calories || 0), 0);
                    const totalRatings = group.menus.reduce((acc, m) => acc + ((m as any)._count?.ratings ?? 0), 0);
                    const allDishes = group.menus.flatMap(m => m.dishes.map(d => d.name)).join(', ');

                    return (
                    <tr key={group.date} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors group/row">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <span className="font-medium text-slate-900 dark:text-white">
                            {formatMenuDateShort(firstMenu.date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                           {group.menus.map(m => (
                             <ShiftBadge key={m.id} shift={m.shift} className="w-[110px] justify-start" />
                           ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell max-w-xs">
                        <div className="flex flex-col gap-2">
                          {group.menus.map(m => {
                            const dishes = m.dishes.map(d => d.name).join(', ');
                            return (
                              <div key={m.id} className="flex items-center gap-2 h-6">
                                <Utensils className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                <span className="text-slate-600 dark:text-slate-300 text-sm truncate" title={dishes}>
                                  {dishes}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-center whitespace-nowrap">
                        {totalCalories > 0 ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs font-semibold border border-orange-100 dark:border-orange-500/20" title="Calorías totales del día">
                            <Flame className="w-3.5 h-3.5" />
                            {totalCalories} kcal
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-1" title="Valoraciones totales del día">
                          <Star className={`w-4 h-4 ${totalRatings > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {totalRatings}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingDate(group.date);
                              setShowModal(true);
                            }}
                            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 shadow-sm transition-all"
                            title="Editar día completo"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDate(group.menus)}
                            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-sm transition-all"
                            title="Eliminar día completo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-sm disabled:opacity-40 hover:bg-[hsl(var(--secondary))]"
            >
              ← Anterior
            </button>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-sm disabled:opacity-40 hover:bg-[hsl(var(--secondary))]"
            >
              Siguiente →
            </button>
          </div>
        )}

      {showModal && (
        <MenuFormModal
          editDate={editingDate}
          onClose={() => {
            setShowModal(false);
            setEditingDate(null);
          }}
          onSaved={fetchMenus}
        />
      )}
    </div>
  );
}
