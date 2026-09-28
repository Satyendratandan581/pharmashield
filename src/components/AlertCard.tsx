import { formatDate, formatNumber } from '../lib/date';
import type { Alert } from '../lib/expiry';
import { ArrowRightIcon } from './icons';

export function AlertCard({
  alert,
  onSelect,
}: {
  alert: Alert;
  onSelect?: (alert: Alert) => void;
}) {
  const isUrgent = alert.status === 'expired' || alert.status === 'critical';

  return (
    <button
      type="button"
      onClick={() => onSelect?.(alert)}
      className={`group flex w-full flex-col rounded-2xl border p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover ${alert.card} ${
        !onSelect ? 'cursor-default' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg leading-none" aria-hidden>
          {alert.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{alert.label}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                isUrgent ? 'bg-white/80 text-slate-700' : 'bg-white/70 text-slate-600'
              }`}
            >
              {alert.count} {alert.count === 1 ? 'batch' : 'batches'}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-600">{alert.headline}</p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-600">{alert.action}</p>

      <ul className="mt-3 space-y-1.5 border-t border-white/70 pt-3">
        {alert.medicines.slice(0, 3).map((medicine) => (
          <li key={medicine.id} className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate font-medium text-slate-700">
              {medicine.name}{' '}
              <span className="font-normal text-slate-500">({medicine.batchNumber})</span>
            </span>
            <span className="shrink-0 tabular-nums text-slate-500">
              {formatDate(medicine.expiryDate)}
            </span>
          </li>
        ))}
        {alert.count > 3 ? (
          <li className="text-xs font-medium text-slate-500">
            +{alert.count - 3} more {alert.count - 3 === 1 ? 'batch' : 'batches'} ·{' '}
            {formatNumber(alert.totalUnits)} units
          </li>
        ) : null}
      </ul>

      {onSelect ? (
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-700 transition group-hover:gap-1.5">
          Review batches
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </span>
      ) : null}
    </button>
  );
}
