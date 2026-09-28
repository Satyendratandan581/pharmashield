import type { Medicine } from '../types';
import { addDays, todayISO } from '../lib/date';

interface SampleSeed {
  name: string;
  batchNumber: string;
  /** Days from today until expiry. Negative means already expired. */
  daysToExpiry: number;
  shelfLifeMonths: number;
  quantity: number;
  supplier: string;
}

const SEEDS: SampleSeed[] = [
  {
    name: 'Paracetamol 500mg',
    batchNumber: 'PCM001',
    daysToExpiry: 17,
    shelfLifeMonths: 24,
    quantity: 1240,
    supplier: 'Cipla Pharmaceuticals',
  },
  {
    name: 'Amoxicillin 500mg',
    batchNumber: 'AMX204',
    daysToExpiry: 9,
    shelfLifeMonths: 24,
    quantity: 860,
    supplier: 'Sun Pharma Industries',
  },
  {
    name: 'Cetirizine 10mg',
    batchNumber: 'CTZ078',
    daysToExpiry: 62,
    shelfLifeMonths: 30,
    quantity: 1500,
    supplier: 'Dr. Reddy’s Laboratories',
  },
  {
    name: 'Omeprazole 20mg',
    batchNumber: 'OMP512',
    daysToExpiry: 26,
    shelfLifeMonths: 24,
    quantity: 940,
    supplier: 'Lupin Limited',
  },
  {
    name: 'Ibuprofen 400mg',
    batchNumber: 'IBU901',
    daysToExpiry: 78,
    shelfLifeMonths: 36,
    quantity: 720,
    supplier: 'Glenmark Pharmaceuticals',
  },
  {
    name: 'Metformin 500mg',
    batchNumber: 'MTN330',
    daysToExpiry: 168,
    shelfLifeMonths: 36,
    quantity: 2100,
    supplier: 'USV Private Limited',
  },
  {
    name: 'Azithromycin 250mg',
    batchNumber: 'AZT119',
    daysToExpiry: -12,
    shelfLifeMonths: 24,
    quantity: 430,
    supplier: 'Alkem Laboratories',
  },
  {
    name: 'Cough Syrup (Dextromethorphan)',
    batchNumber: 'CSY033',
    daysToExpiry: 4,
    shelfLifeMonths: 24,
    quantity: 310,
    supplier: 'Hindustan Syrups',
  },
  {
    name: 'Insulin Glargine 100IU/ml',
    batchNumber: 'INS045',
    daysToExpiry: -40,
    shelfLifeMonths: 24,
    quantity: 165,
    supplier: 'Sanofi India',
  },
  {
    name: 'Vitamin D3 60,000 IU',
    batchNumber: 'VIT220',
    daysToExpiry: 245,
    shelfLifeMonths: 24,
    quantity: 980,
    supplier: 'Mankind Pharma',
  },
  {
    name: 'Ondansetron 4mg',
    batchNumber: 'OND611',
    daysToExpiry: 115,
    shelfLifeMonths: 24,
    quantity: 640,
    supplier: 'Hetero Laboratories',
  },
  {
    name: 'Pantoprazole 40mg',
    batchNumber: 'PNT388',
    daysToExpiry: 3,
    shelfLifeMonths: 24,
    quantity: 275,
    supplier: 'Torrent Pharmaceuticals',
  },
];

/**
 * Sample inventory built relative to today so the demo always shows a healthy
 * mix of expired / critical / expiring / safe batches.
 */
export function createSampleMedicines(): Medicine[] {
  const today = todayISO();
  const baseTime = Date.now() - SEEDS.length * 60_000;

  return SEEDS.map((seed, index) => {
    const expiryDate = addDays(today, seed.daysToExpiry);
    return {
      id: `sample-${seed.batchNumber.toLowerCase()}`,
      name: seed.name,
      batchNumber: seed.batchNumber,
      manufacturingDate: addDays(expiryDate, -seed.shelfLifeMonths * 30),
      expiryDate,
      quantity: seed.quantity,
      supplier: seed.supplier,
      createdAt: baseTime + index * 60_000,
    };
  });
}
