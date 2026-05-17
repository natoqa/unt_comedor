/** Zona horaria del comedor (Perú) */
const APP_TIMEZONE = 'America/Lima';

/** Fecha de hoy en formato YYYY-MM-DD (Lima) */
export function getTodayDateString(timeZone = APP_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date());
}

/** Convierte YYYY-MM-DD a Date estable para columnas @db.Date */
export function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

/** Rango [inicio, fin) para filtrar un solo día en la BD */
export function getDateOnlyRange(dateStr: string): { gte: Date; lt: Date } {
  const gte = parseDateOnly(dateStr);
  const lt = parseDateOnly(dateStr);
  lt.setUTCDate(lt.getUTCDate() + 1);
  return { gte, lt };
}
