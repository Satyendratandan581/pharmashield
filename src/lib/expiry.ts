import type { ExpiryStatus, Medicine } from '../types';
import { daysUntil, formatDaysRemaining } from './date';

export interface StatusMeta {
  status: ExpiryStatus;
  /** Short label, e.g. `Critical` */
  label: string;
  /** Emoji dot used in the spec */
  icon: string;
  /** Requirement text, e.g. `Expires within 30 days` */
  headline: string;
  /** What the store/pharmacy should do about it */
  action: string;
  /** Tailwind classes for the badge */
  badge: string;
  /** Tailwind classes for the dot */
  dot: string;
  /** Tailwind classes for the alert card accent + icon chip */
  card: string;
  /** Sort weight: 0 is the most urgent */
  order: number;
}

/** Thresholds in days remaining. */
export const CRITICAL_THRESHOLD = 30;
export const EXPIRING_THRESHOLD = 90;

/**
 * The single source of truth for expiry classification.
 * expired  -> less than 0 days
 * critical -> 0 to 30 days
 * expiring -> 31 to 90 days
 * safe     -> more than 90 days
 */
export function getExpiryStatus(daysRemaining: number): ExpiryStatus {
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= CRITICAL_THRESHOLD) return 'critical';
  if (daysRemaining <= EXPIRING_THRESHOLD) return 'expiring';
  return 'safe';
}

export const STATUS_META: Record<ExpiryStatus, StatusMeta> = {
  expired: {
    status: 'expired',
    label: 'Expired',
    icon: '🔴',
    headline: 'Expired — remove from active stock',
    action: 'Quarantine and dispose of as per company policy.',
    badge: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
    dot: 'bg-rose-500',
    card: 'border-rose-200 bg-rose-50/60 hover:border-rose-300',
    order: 0,
  },
  critical: {
    status: 'critical',
    label: 'Critical',
    icon: '🟠',
    headline: 'Expires within 30 days',
    action: 'Prioritise issue, or return the batch to the supplier.',
    badge: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20',
    dot: 'bg-orange-500',
    card: 'border-orange-200 bg-orange-50/60 hover:border-orange-300',
    order: 1,
  },
  expiring: {
    status: 'expiring',
    label: 'Expiring Soon',
    icon: '🟡',
    headline: 'Expires within 90 days',
    action: 'Plan stock rotation before the batch reaches expiry.',
    badge: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20',
    dot: 'bg-amber-400',
    card: 'border-amber-200 bg-amber-50/60 hover:border-amber-300',
    order: 2,
  },
  safe: {
    status: 'safe',
    label: 'Safe',
    icon: '🟢',
    headline: 'More than 90 days remaining',
    action: 'No action required. Keep monitoring as usual.',
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
    dot: 'bg-emerald-500',
    card: 'border-emerald-200 bg-emerald-50/60 hover:border-emerald-300',
    order: 3,
  },
};

export const STATUS_ORDER: ExpiryStatus[] = ['expired', 'critical', 'expiring', 'safe'];

/** A medicine joined with everything the UI needs to render it. */
export interface MedicineView extends Medicine {
  daysRemaining: number;
  status: ExpiryStatus;
  meta: StatusMeta;
  daysLabel: string;
}

/** Enriches a medicine with the auto-calculated expiry status. */
export function toMedicineView(medicine: Medicine): MedicineView {
  const daysRemaining = daysUntil(medicine.expiryDate);
  const status = getExpiryStatus(daysRemaining);
  return {
    ...medicine,
    daysRemaining,
    status,
    meta: STATUS_META[status],
    daysLabel: formatDaysRemaining(daysRemaining),
  };
}

export interface Alert {
  id: string;
  status: ExpiryStatus;
  icon: string;
  label: string;
  headline: string;
  action: string;
  count: number;
  totalUnits: number;
  /** Most urgent medicines inside this bucket. */
  medicines: MedicineView[];
  /** Tailwind classes for the alert card. */
  card: string;
  order: number;
}

/**
 * Automatically generates one alert per expiry status, most urgent first.
 * Statuses with no medicines are dropped.
 */
export function buildAlerts(medicines: MedicineView[]): Alert[] {
  return STATUS_ORDER.map((status) => {
    const bucket = medicines
      .filter((medicine) => medicine.status === status)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
    const meta = STATUS_META[status];
    return {
      id: `alert-${status}`,
      status,
      icon: meta.icon,
      label: meta.label,
      headline: meta.headline,
      action: meta.action,
      count: bucket.length,
      totalUnits: bucket.reduce((sum, medicine) => sum + medicine.quantity, 0),
      medicines: bucket,
      card: meta.card,
      order: meta.order,
    };
  })
    .filter((alert) => alert.count > 0)
    .sort((a, b) => a.order - b.order);
}

export interface InventoryStats {
  totalMedicines: number;
  totalBatches: number;
  /** Units in active stock, i.e. everything not yet expired. */
  activeStock: number;
  /** Units sitting in expired batches. */
  quarantinedStock: number;
  expiringWithin30Days: number;
  expiringWithin90Days: number;
  expired: number;
  totalAlerts: number;
  criticalAlerts: number;
}

export function computeStats(medicines: MedicineView[]): InventoryStats {
  const sum = (list: MedicineView[]) => list.reduce((total, m) => total + m.quantity, 0);
  const byStatus = (status: ExpiryStatus) => medicines.filter((m) => m.status === status);

  const expired = byStatus('expired');
  const critical = byStatus('critical');
  const expiring = byStatus('expiring');
  const active = medicines.filter((m) => m.status !== 'expired');

  return {
    totalMedicines: new Set(medicines.map((m) => m.name.toLowerCase())).size,
    totalBatches: medicines.length,
    activeStock: sum(active),
    quarantinedStock: sum(expired),
    expiringWithin30Days: critical.length,
    expiringWithin90Days: critical.length + expiring.length,
    expired: expired.length,
    totalAlerts: expired.length + critical.length + expiring.length,
    criticalAlerts: expired.length + critical.length,
  };
}

/** Most urgent first: expired, then by soonest expiry. */
export function sortByUrgency(medicines: MedicineView[]): MedicineView[] {
  return [...medicines].sort((a, b) => {
    if (a.status !== b.status) return a.meta.order - b.meta.order;
    return a.daysRemaining - b.daysRemaining;
  });
}
