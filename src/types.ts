export type ExpiryStatus = 'expired' | 'critical' | 'expiring' | 'safe';

export interface Medicine {
  id: string;
  name: string;
  batchNumber: string;
  /** ISO date string, `yyyy-mm-dd` */
  manufacturingDate: string;
  /** ISO date string, `yyyy-mm-dd` */
  expiryDate: string;
  quantity: number;
  supplier: string;
  createdAt: number;
}

/** Shape used by the Add Medicine form (quantity stays a string while typing). */
export interface MedicineDraft {
  name: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: string;
  supplier: string;
}

export type DraftErrors = Partial<Record<keyof MedicineDraft, string>>;
