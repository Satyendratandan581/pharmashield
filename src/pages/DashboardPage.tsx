import { useNavigate } from 'react-router-dom';
import { useMedicines } from '../context/MedicineContext';
import { formatNumber } from '../lib/date';
import { StatCard } from '../components/StatCard';
import { AlertCard } from '../components/AlertCard';
import { SectionCard, PageHeader, EmptyState } from '../components/ui';
import {
  BellIcon,
  BoxesIcon,
  ClockIcon,
  PillIcon,
  PlusIcon,
  WarningIcon,
} from '../components/icons';

export function DashboardPage() {
  const { stats, alerts, medicines } = useMedicines();
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Live overview of inventory health and expiry risk."
        actions={
          <button
            type="button"
            onClick={() => navigate('/medicines?add=1')}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2"
          >
            <PlusIcon className="h-4 w-4" />
            Add Medicine
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Medicines"
          value={stats.totalMedicines}
          hint={`${stats.totalBatches} active ${stats.totalBatches === 1 ? 'batch' : 'batches'} tracked`}
          icon={<PillIcon className="h-5 w-5" />}
          tone="brand"
        />
        <StatCard
          label="Total Stock"
          value={formatNumber(stats.activeStock)}
          hint={`Units in active stock · ${formatNumber(stats.quarantinedStock)} units expired`}
          icon={<BoxesIcon className="h-5 w-5" />}
          tone="blue"
        />
        <StatCard
          label="Expiring Within 30 Days"
          value={stats.expiringWithin30Days}
          hint="Critical · requires immediate action"
          icon={<ClockIcon className="h-5 w-5" />}
          tone="orange"
        />
        <StatCard
          label="Expired Medicines"
          value={stats.expired}
          hint="Remove from active stock immediately"
          icon={<WarningIcon className="h-5 w-5" />}
          tone="rose"
        />
      </div>

      <div className="mt-6">
        <SectionCard
          title="Recent Alerts"
          description="Generated automatically from expiry status. Most urgent first."
          action={
            <button
              type="button"
              onClick={() => navigate('/alerts')}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              View all alerts
            </button>
          }
          bodyClassName="p-5"
        >
          {alerts.length === 0 ? (
            <EmptyState
              icon={<BellIcon className="h-5 w-5" />}
              title="No alerts"
              description="Add medicines to start generating expiry alerts automatically."
              action={
                <button
                  type="button"
            onClick={() => navigate('/medicines?add=1')}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  Add Medicine
                </button>
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onSelect={() => navigate('/alerts')}
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Expiring Soonest"
          description="The five batches closest to (or past) their expiry date."
          action={
            <button
              type="button"
              onClick={() => navigate('/medicines?add=1')}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Manage medicines
            </button>
          }
          bodyClassName="px-5"
        >
          <ul className="divide-y divide-slate-50">
            {medicines.slice(0, 5).map((medicine) => (
              <li key={medicine.id} className="flex items-center gap-4 py-3.5">
                <span className="text-base leading-none" aria-hidden>
                  {medicine.meta.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {medicine.name}{' '}
                    <span className="font-normal text-slate-500">({medicine.batchNumber})</span>
                  </p>
                  <p className="truncate text-xs text-slate-500">{medicine.supplier}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-slate-500">Quantity</p>
                  <p className="text-sm font-semibold tabular-nums text-slate-900">
                    {formatNumber(medicine.quantity)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Remaining</p>
                  <p className="text-sm font-semibold tabular-nums text-slate-900">
                    {medicine.daysLabel}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
