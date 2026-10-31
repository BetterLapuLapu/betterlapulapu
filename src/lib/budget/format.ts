import { formatNumber, formatPeso } from '../format';

/** ₱4.74B, ₱369M, ₱850K. null is "—" (no such line), never zero. */
export const php = (n: number | null | undefined) =>
  formatPeso(n, { compact: true });

/** Exact pesos, without centavos: ₱4,744,932,000. */
export function phpFull(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return '₱' + Math.round(n).toLocaleString('en-PH');
}

/** A signed change: +₱150M, −₱14.0B, or "no change". */
export function phpDelta(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  if (n === 0) return 'no change';
  return (n > 0 ? '+' : '−') + php(Math.abs(n));
}

export const count = (n: number) => formatNumber(n);

/** "1 project", "433 projects". */
export function plural(n: number, one: string, many = one + 's'): string {
  return `${count(n)} ${n === 1 ? one : many}`;
}

export function date(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Manila',
      });
}

/** "Cebu 6th District Engineering Office" → "Cebu 6th DEO", for tight spaces. */
export const shortOffice = (office: string) =>
  office.replace(/ District Engineering Office$/, ' DEO');
