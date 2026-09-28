import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { DraftErrors, MedicineDraft } from '../types';
import { isValidISODate, daysUntil, formatDate, formatDaysRemaining, todayISO } from '../lib/date';
import { getExpiryStatus, STATUS_META } from '../lib/expiry';
import { CloseIcon, PillIcon } from './icons';

const EMPTY_DRAFT: MedicineDraft = {
  name: '',
  batchNumber: '',
  manufacturingDate: '',
  expiryDate: '',
  quantity: '',
  supplier: '',
};

const FIELD_CLASS =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

function validate(draft: MedicineDraft): DraftErrors {
  const errors: DraftErrors = {};

  if (!draft.name.trim()) errors.name = 'Medicine name is required.';
  if (!draft.batchNumber.trim()) errors.batchNumber = 'Batch number is required.';

  if (!draft.manufacturingDate) {
    errors.manufacturingDate = 'Manufacturing date is required.';
  } else if (!isValidISODate(draft.manufacturingDate)) {
    errors.manufacturingDate = 'Use a valid date.';
  }

  if (!draft.expiryDate) {
    errors.expiryDate = 'Expiry date is required.';
  } else if (!isValidISODate(draft.expiryDate)) {
    errors.expiryDate = 'Use a valid date.';
  } else if (isValidISODate(draft.manufacturingDate) && draft.expiryDate <= draft.manufacturingDate) {
    errors.expiryDate = 'Expiry date must be after the manufacturing date.';
  }

  const quantity = Number(draft.quantity);
  if (!draft.quantity.trim()) {
    errors.quantity = 'Quantity is required.';
  } else if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
    errors.quantity = 'Enter a whole number greater than 0.';
  }

  if (!draft.supplier.trim()) errors.supplier = 'Supplier is required.';

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-rose-600">{message}</p>;
}

export function MedicineFormModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: MedicineDraft) => void;
}) {
  const [draft, setDraft] = useState<MedicineDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(EMPTY_DRAFT);
      setErrors({});
      setSubmitted(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Live preview of the automatic expiry calculation while the user types.
  const preview = useMemo(() => {
    if (!isValidISODate(draft.expiryDate)) return null;
    const days = daysUntil(draft.expiryDate);
    const meta = STATUS_META[getExpiryStatus(days)];
    return { days, label: formatDaysRemaining(days), meta, date: formatDate(draft.expiryDate) };
  }, [draft.expiryDate]);

  const setField = (field: keyof MedicineDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    if (submitted) {
      setErrors((current) => {
        const next = validate({ ...draft, [field]: value });
        return { ...current, [field]: next[field] };
      });
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(draft);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-medicine-title"
        className="relative flex max-h-[92vh] w-full max-w-2xl animate-toast-in flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <PillIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 id="add-medicine-title" className="text-base font-bold text-slate-900">
                Add Medicine
              </h2>
              <p className="text-xs text-slate-500">
                Expiry status and alerts are generated automatically.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close dialog"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-700">
                  Medicine Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="name"
                  value={draft.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. Paracetamol 500mg"
                  className={`mt-1.5 ${FIELD_CLASS} ${errors.name ? 'border-rose-400' : ''}`}
                />
                <FieldError message={errors.name} />
              </div>

              <div>
                <label htmlFor="batchNumber" className="text-sm font-medium text-slate-700">
                  Batch Number <span className="text-rose-500">*</span>
                </label>
                <input
                  id="batchNumber"
                  value={draft.batchNumber}
                  onChange={(e) => setField('batchNumber', e.target.value)}
                  placeholder="e.g. PCM002"
                  className={`mt-1.5 ${FIELD_CLASS} ${errors.batchNumber ? 'border-rose-400' : ''}`}
                />
                <FieldError message={errors.batchNumber} />
              </div>

              <div>
                <label htmlFor="quantity" className="text-sm font-medium text-slate-700">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={draft.quantity}
                  onChange={(e) => setField('quantity', e.target.value)}
                  placeholder="e.g. 500"
                  className={`mt-1.5 ${FIELD_CLASS} ${errors.quantity ? 'border-rose-400' : ''}`}
                />
                <FieldError message={errors.quantity} />
              </div>

              <div>
                <label htmlFor="manufacturingDate" className="text-sm font-medium text-slate-700">
                  Manufacturing Date <span className="text-rose-500">*</span>
                </label>
                <input
                  id="manufacturingDate"
                  type="date"
                  max={todayISO()}
                  value={draft.manufacturingDate}
                  onChange={(e) => setField('manufacturingDate', e.target.value)}
                  className={`mt-1.5 ${FIELD_CLASS} ${
                    errors.manufacturingDate ? 'border-rose-400' : ''
                  }`}
                />
                <FieldError message={errors.manufacturingDate} />
              </div>

              <div>
                <label htmlFor="expiryDate" className="text-sm font-medium text-slate-700">
                  Expiry Date <span className="text-rose-500">*</span>
                </label>
                <input
                  id="expiryDate"
                  type="date"
                  value={draft.expiryDate}
                  onChange={(e) => setField('expiryDate', e.target.value)}
                  className={`mt-1.5 ${FIELD_CLASS} ${errors.expiryDate ? 'border-rose-400' : ''}`}
                />
                <FieldError message={errors.expiryDate} />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="supplier" className="text-sm font-medium text-slate-700">
                  Supplier <span className="text-rose-500">*</span>
                </label>
                <input
                  id="supplier"
                  value={draft.supplier}
                  onChange={(e) => setField('supplier', e.target.value)}
                  placeholder="e.g. Cipla Pharmaceuticals"
                  className={`mt-1.5 ${FIELD_CLASS} ${errors.supplier ? 'border-rose-400' : ''}`}
                />
                <FieldError message={errors.supplier} />
              </div>
            </div>

            {preview ? (
              <div
                className={`mt-5 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${preview.meta.card}`}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Auto-calculated status
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    Expiry {preview.date} ·{' '}
                    <span className="font-bold text-slate-900">{preview.label}</span> remaining
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${preview.meta.badge}`}
                >
                  {preview.meta.icon} {preview.meta.label}
                </span>
              </div>
            ) : null}
          </div>

          <footer className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2"
            >
              Add Medicine
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
