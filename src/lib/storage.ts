import type { Medicine } from '../types';

const MEDICINES_KEY = 'pharmashield.medicines.v1';
const SESSION_KEY = 'pharmashield.session.v1';

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadMedicines(): Medicine[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(MEDICINES_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as Medicine[];
  } catch {
    return null;
  }
}

export function saveMedicines(medicines: Medicine[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(MEDICINES_KEY, JSON.stringify(medicines));
  } catch {
    // Storage full or blocked - the app still works from React state.
  }
}

export function clearMedicines(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(MEDICINES_KEY);
}

export interface Session {
  email: string;
  name: string;
  signedInAt: number;
}

export function saveSession(session: Session): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): Session | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(SESSION_KEY);
}
