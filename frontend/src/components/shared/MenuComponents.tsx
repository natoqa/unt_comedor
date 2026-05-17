'use client';

import type { MealShift } from '@/types';
import { SHIFT_LABELS } from '@/types';

import { Coffee, Sun, Moon } from 'lucide-react';

// ── Badge de turno ──
export function ShiftBadge({ shift, className = '' }: { shift: MealShift; className?: string }) {
  const styles: Record<MealShift, string> = {
    BREAKFAST: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-500/30',
    LUNCH: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-500/30',
    DINNER: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-500/30',
  };
  const icons: Record<MealShift, React.ReactElement> = {
    BREAKFAST: <Coffee className="w-3.5 h-3.5" />,
    LUNCH: <Sun className="w-3.5 h-3.5" />,
    DINNER: <Moon className="w-3.5 h-3.5" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles[shift]} ${className}`}
    >
      {icons[shift]}
      {SHIFT_LABELS[shift]}
    </span>
  );
}

// ── Card de info nutricional ──
export function NutritionCard({
  calories,
  proteins,
  carbs,
  fats,
  iron,
}: {
  calories?: number;
  proteins?: number;
  carbs?: number;
  fats?: number;
  iron?: number;
}) {
  const items = [
    { label: 'Calorías', value: calories, unit: 'kcal', color: 'text-red-500' },
    { label: 'Proteínas', value: proteins, unit: 'g', color: 'text-blue-500' },
    { label: 'Carbohidratos', value: carbs, unit: 'g', color: 'text-amber-500' },
    { label: 'Grasas', value: fats, unit: 'g', color: 'text-orange-500' },
    { label: 'Hierro', value: iron, unit: 'mg', color: 'text-green-500' },
  ];

  const hasData = items.some((i) => i.value !== undefined && i.value !== null);
  if (!hasData) return null;

  return (
    <div className="grid grid-cols-5 gap-0.5 sm:gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="text-center p-0.5 sm:p-2 rounded sm:rounded-lg bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-center border border-slate-200 dark:border-slate-700/50"
        >
          <p className={`text-[8px] sm:text-lg font-bold ${item.color} leading-none sm:leading-tight`}>
            {item.value ?? '—'}
          </p>
          <p className="text-[5px] sm:text-[8px] text-slate-500 dark:text-slate-400 uppercase tracking-tight sm:tracking-wide leading-none mt-0.5 sm:mt-0">
            {item.unit}
          </p>
          <p className="text-[5px] sm:text-[8px] text-slate-500 dark:text-slate-400 leading-none mt-0.5 sm:mt-0 truncate">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
