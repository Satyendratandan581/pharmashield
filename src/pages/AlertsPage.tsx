import { useState } from 'react';
import { useMedicines } from '../context/MedicineContext';
import { useToast } from '../components/Toast';
import { AlertCard } from '../components/AlertCard';
import { MedicineTable } from '../components/MedicineTable';
import { PageHeader, SectionCard, EmptyState } from '../components/ui';
import { formatNumber } from '../lib/date';
import type { ExpiryStatus } from '../types';
import type { MedicineView } from '../lib/expiry';
import { BellIcon, TrashIcon } from '../components/icons';

export function AlertsPage() {
  const { alerts, medicines, removeMedicine, stats } = useMedicines();
  const toast = useToast();
  const [focus, setFocus] = useState<ExpiryStatus | null>(null);

  const focusedMedicines: MedicineView[] = focus
    ? medicines.filter((medicine) => medicine.status === focus)
    : medicines;

  const handleRemove = (medicine: MedicineView) => {
    removeMedicine(medicine.id);
    toast.info(
      `${medicine.name} removed from active stock`,
      `Batch ${medicine.batchNumber} was quarantined and removed.`,
    );
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Alerts"
        subtitle="Alerts are regenerated automatically whenever a batch is added or removed."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onSelect={(selected) => setFocus(focus === selected.status ? null : selected.status)}
          />
        ))}
      </div>

      {alerts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-card">
          <EmptyState
            icon={<BellIcon className="h-5 w-5" />}
            title="No alerts to show"
            description="There are no batches in the inventory yet. Add a medicine to generate expiry alerts."
          />
        </div>
      ) : (
        <div className="mt-6">
          <SectionCard
            title={focus ? `Batches · ${alerts.find((a) => a.status === focus)?.label}` : 'All tracked batches'}
            description={
              focus
                ? 'Filtered to the selected alert category.'
                : 'Every batch, with its automatically calculated expiry status.'
            }
            action={
              focus ? (
                <button
                  type="button"
                  onClick={() => setFocus(null)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Clear filter
                </button>
              ) : (
                <p className="text-xs text-slate-500">
                  {formatNumber(stats.activeStock)} active units ·{' '}
                  {formatNumber(stats.quarantinedStock)} expired units
                </p>
              )
            }
            bodyClassName=""
          >
            <MedicineTable
              medicines={focusedMedicines}
              onRemove={handleRemove}
              emptyState={
                <EmptyState
                  icon={<TrashIcon className="h-5 w-5" />}
                  title="Nothing in this category"
                  description="No batches currently match the selected alert."
                />
              }
            />
          </SectionCard>
        </div>
      )}
    </div>
  );
}
