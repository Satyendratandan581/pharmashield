import { Link, useSearchParams } from 'react-router-dom';
import { useMedicines } from '../context/MedicineContext';
import { useToast } from '../components/Toast';
import { MedicineFormModal } from '../components/MedicineFormModal';
import { MedicineTable } from '../components/MedicineTable';
import { PageHeader, SectionCard, EmptyState } from '../components/ui';
import { PillIcon, PlusIcon } from '../components/icons';
import type { MedicineDraft } from '../types';
import type { MedicineView } from '../lib/expiry';

export function MedicinesPage() {
  const { medicines, addMedicine, removeMedicine } = useMedicines();
  const toast = useToast();
  // The form is driven by the URL so `/medicines?add=1` can open it from anywhere.
  const [searchParams, setSearchParams] = useSearchParams();
  const formOpen = searchParams.get('add') === '1';

  const openForm = () => setSearchParams({ add: '1' });
  const closeForm = () => setSearchParams({});

  const handleAdd = (draft: MedicineDraft) => {
    const added = addMedicine(draft);
    closeForm();

    const isUrgent = added.status === 'expired' || added.status === 'critical';
    const message = `${added.name} (${added.batchNumber}) · ${added.daysLabel} remaining · ${added.meta.label}`;

    if (isUrgent) {
      toast.pushToast({
        title: `${added.name} added as ${added.meta.label}`,
        description: message,
        tone: 'warning',
      });
    } else {
      toast.success(`${added.name} added`, message);
    }
  };

  const handleRemove = (medicine: MedicineView) => {
    const confirmed = window.confirm(
      `Remove ${medicine.name} (${medicine.batchNumber}) from stock? This clears ${medicine.quantity} units.`,
    );
    if (!confirmed) return;

    removeMedicine(medicine.id);
    toast.info(
      `${medicine.name} removed`,
      `Batch ${medicine.batchNumber} is no longer in stock.`,
    );
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Medicine Management"
        subtitle="Add batches, review quantities and remove expired stock."
        actions={
          <button
            type="button"
            onClick={openForm}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2"
          >
            <PlusIcon className="h-4 w-4" />
            Add Medicine
          </button>
        }
      />

      <SectionCard
        title="Inventory"
        description={`${medicines.length} ${medicines.length === 1 ? 'batch' : 'batches'} in stock · sorted by expiry urgency`}
        bodyClassName=""
      >
        <MedicineTable
          medicines={medicines}
          onRemove={handleRemove}
          emptyState={
            <EmptyState
              icon={<PillIcon className="h-5 w-5" />}
              title="No medicines found"
              description="Adjust the search or filter, or add a new medicine batch to the inventory."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={openForm}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Add Medicine
                  </button>
                  <Link
                    to="/alerts"
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    View alerts
                  </Link>
                </div>
              }
            />
          }
        />
      </SectionCard>

      <MedicineFormModal open={formOpen} onClose={closeForm} onSubmit={handleAdd} />
    </div>
  );
}
