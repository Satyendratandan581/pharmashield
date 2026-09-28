export const MS_PER_DAY = 86_400_000;

const pad = (n: number) => String(n).padStart(2, '0');

/** Parses `yyyy-mm-dd` as a *local* midnight date (avoids UTC off-by-one). */
export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map((part) => Number(part));
  return new Date(year, (month || 1) - 1, day || 1);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, days: number): string {
  const date = startOfDay(parseISODate(iso));
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function addMonths(iso: string, months: number): string {
  const date = startOfDay(parseISODate(iso));
  date.setMonth(date.getMonth() + months);
  return toISODate(date);
}

/** Whole days from today until `iso`. Negative means the date is in the past. */
export function daysUntil(iso: string, from: Date = new Date()): number {
  const target = startOfDay(parseISODate(iso)).getTime();
  const base = startOfDay(from).getTime();
  return Math.round((target - base) / MS_PER_DAY);
}

/** `15/10/2026` */
export function formatDate(iso: string): string {
  const date = parseISODate(iso);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatTodayLong(from: Date = new Date()): string {
  return from.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = parseISODate(value);
  return !Number.isNaN(date.getTime()) && toISODate(date) === value;
}

/** `17 days` / `1 day` / `today` / `12 days ago` */
export function formatDaysRemaining(days: number): string {
  if (days < 0) {
    const ago = Math.abs(days);
    return ago === 1 ? '1 day ago' : `${ago} days ago`;
  }
  if (days === 0) return 'today';
  return days === 1 ? '1 day' : `${days} days`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-IN');
}
