import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Medicine, MedicineDraft } from '../types';
import { createSampleMedicines } from '../data/sampleMedicines';
import {
  buildAlerts,
  computeStats,
  sortByUrgency,
  toMedicineView,
  type Alert,
  type InventoryStats,
  type MedicineView,
} from '../lib/expiry';
import { clearMedicines, loadMedicines, saveMedicines } from '../lib/storage';

interface MedicineContextValue {
  /** Medicines enriched with the auto-calculated expiry status. */
  medicines: MedicineView[];
  alerts: Alert[];
  stats: InventoryStats;
  /** Adds a medicine and returns the enriched result. */
  addMedicine: (draft: MedicineDraft) => MedicineView;
  /** Removes a batch from stock (used for expired stock). */
  removeMedicine: (id: string) => void;
  resetToSampleData: () => void;
  findMedicine: (id: string) => MedicineView | undefined;
}

const MedicineContext = createContext<MedicineContextValue | null>(null);

function initMedicines(): Medicine[] {
  const stored = loadMedicines();
  if (stored) return stored;
  const samples = createSampleMedicines();
  saveMedicines(samples);
  return samples;
}

export function MedicineProvider({ children }: { children: ReactNode }) {
  const [medicines, setMedicines] = useState<Medicine[]>(initMedicines);

  useEffect(() => {
    saveMedicines(medicines);
  }, [medicines]);

  const views = useMemo(() => medicines.map(toMedicineView), [medicines]);
  const sorted = useMemo(() => sortByUrgency(views), [views]);
  const alerts = useMemo(() => buildAlerts(views), [views]);
  const stats = useMemo(() => computeStats(views), [views]);

  const addMedicine = useCallback((draft: MedicineDraft): MedicineView => {
    const medicine: Medicine = {
      id: `med-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      name: draft.name.trim(),
      batchNumber: draft.batchNumber.trim().toUpperCase(),
      manufacturingDate: draft.manufacturingDate,
      expiryDate: draft.expiryDate,
      quantity: Number(draft.quantity),
      supplier: draft.supplier.trim(),
      createdAt: Date.now(),
    };
    setMedicines((current) => [medicine, ...current]);
    return toMedicineView(medicine);
  }, []);

  const removeMedicine = useCallback((id: string) => {
    setMedicines((current) => current.filter((medicine) => medicine.id !== id));
  }, []);

  const resetToSampleData = useCallback(() => {
    clearMedicines();
    setMedicines(createSampleMedicines());
  }, []);

  const findMedicine = useCallback(
    (id: string) => views.find((medicine) => medicine.id === id),
    [views],
  );

  const value = useMemo<MedicineContextValue>(
    () => ({
      medicines: sorted,
      alerts,
      stats,
      addMedicine,
      removeMedicine,
      resetToSampleData,
      findMedicine,
    }),
    [sorted, alerts, stats, addMedicine, removeMedicine, resetToSampleData, findMedicine],
  );

  return <MedicineContext.Provider value={value}>{children}</MedicineContext.Provider>;
}

export function useMedicines(): MedicineContextValue {
  const context = useContext(MedicineContext);
  if (!context) throw new Error('useMedicines must be used inside <MedicineProvider>');
  return context;
}
