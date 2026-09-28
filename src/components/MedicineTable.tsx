import { useMemo, useState, type ReactNode } from 'react';
import type { ExpiryStatus } from '../types';
import { formatDate, formatNumber } from '../lib/date';
import { STATUS_META, STATUS_ORDER, type MedicineView } from '../lib/expiry';
import { BoxesIcon, SearchIcon, TrashIcon } from './icons';
import { StatusBadge } from './ui';

function daysCellClass(status: ExpiryStatus) {
  if (status === 'expired') return 'text-rose-600';
  if (status === 'critical') return 'text-orange-600';
  if (status === 'expiring') return 'text-amber-700';
  return 'text-slate-700';
}

export function MedicineTable({
  medicines,
  onRemove,
  emptyState,
}: {
  medicines: MedicineView[];
  onRemove: (medicine: MedicineView) => void;
  emptyState: ReactNode;
}) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExpiryStatus | 'all'>('all');

  const counts = useMemo(() => {
    return medicines.reduce<Record<string, number>>((acc, medicine) => {
      acc[medicine.status] = (acc[medicine.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [medicines]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return medicines.filter((medicine) => {
      const matchesStatus = statusFilter === 'all' || medicine.status === statusFilter;
      if (!matchesStatus) return false;
      if (!needle) return true;
      return (
        medicine.name.toLowerCase().includes(needle) ||
        medicine.batchNumber.toLowerCase().includes(needle) ||
        medicine.supplier.toLowerCase().includes(needle)
      );
    });
  }, [medicines, query, statusFilter]);

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, batch or supplier"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
            label="All"
            count={medicines.length}
          />
          {STATUS_ORDER.map((status) => (
            <FilterChip
              key={status}
              active={statusFilter === status}
              onClick={() => setStatusFilter(status)}
              label={STATUS_META[status].label}
              count={counts[status] ?? 0}
              dot={STATUS_META[status].dot}
            />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        emptyState
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Medicine</th>
                  <th className="px-5 py-3">Supplier</th>
                  <th className="px-5 py-3">Mfg Date</th>
                  <th className="px-5 py-3">Expiry Date</th>
                  <th className="px-5 py-3 text-right">Qty</th>
                  <th className="px-5 py-3">Remaining</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((medicine) => (
                  <tr key={medicine.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <BoxesIcon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{medicine.name}</p>
                          <p className="text-xs text-slate-500">Batch {medicine.batchNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{medicine.supplier}</td>
                    <td className="px-5 py-3.5 tabular-nums text-slate-600">
                      {formatDate(medicine.manufacturingDate)}
                    </td>
                    <td className="px-5 py-3.5 font-medium tabular-nums text-slate-900">
                      {formatDate(medicine.expiryDate)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-slate-700">
                      {formatNumber(medicine.quantity)}
                    </td>
                    <td
                      className={`px-5 py-3.5 font-semibold tabular-nums ${daysCellClass(medicine.status)}`}
                    >
                      {medicine.daysLabel}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge meta={medicine.meta} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onRemove(medicine)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Remove ${medicine.name} batch ${medicine.batchNumber}`}
                        title="Remove from stock"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-slate-100 md:hidden">
            {filtered.map((medicine) => (
              <li key={medicine.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{medicine.name}</p>
                    <p className="text-xs text-slate-500">
                      Batch {medicine.batchNumber} · {medicine.supplier}
                    </p>
                  </div>
                  <StatusBadge meta={medicine.meta} size="sm" />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <dt className="text-slate-500">Mfg date</dt>
                    <dd className="font-medium tabular-nums text-slate-800">
                      {formatDate(medicine.manufacturingDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Expiry date</dt>
                    <dd className="font-medium tabular-nums text-slate-800">
                      {formatDate(medicine.expiryDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Quantity</dt>
                    <dd className="font-medium tabular-nums text-slate-800">
                      {formatNumber(medicine.quantity)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Remaining</dt>
                    <dd className={`font-semibold ${daysCellClass(medicine.status)}`}>
                      {medicine.daysLabel}
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => onRemove(medicine)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
  dot,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  dot?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? 'bg-slate-900 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {dot ? <span className={`h-1.5 w-1.5 rounded-full ${dot}`} /> : null}
      {label}
      <span className={active ? 'text-slate-300' : 'text-slate-400'}>{count}</span>
    </button>
  );
}
