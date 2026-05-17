const APP_TIMEZONE = 'America/Lima';

export function getTodayDateString(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE }).format(new Date());
}

export function formatMenuDateShort(dateValue: string): string {
  const datePart = dateValue.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-PE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: APP_TIMEZONE,
  });
}

export function formatMenuDate(dateValue: string): string {
  const datePart = dateValue.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    timeZone: APP_TIMEZONE,
  });
}

export function formatTodayHeading(): string {
  return new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: APP_TIMEZONE,
  });
}
