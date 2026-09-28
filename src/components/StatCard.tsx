import type { ReactNode } from 'react';

export type CardTone = 'brand' | 'blue' | 'orange' | 'rose';

const TONES: Record<CardTone, { icon: string; accent: string }> = {
  brand: { icon: 'bg-brand-50 text-brand-600', accent: 'from-brand-500/10' },
  blue: { icon: 'bg-sky-50 text-sky-600', accent: 'from-sky-500/10' },
  orange: { icon: 'bg-orange-50 text-orange-600', accent: 'from-orange-500/10' },
  rose: { icon: 'bg-rose-50 text-rose-600', accent: 'from-rose-500/10' },
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'brand',
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: ReactNode;
  tone?: CardTone;
}) {
  const styles = TONES[tone];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
      <div
        className={`pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${styles.accent} to-transparent`}
      />
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles.icon}`}>
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
