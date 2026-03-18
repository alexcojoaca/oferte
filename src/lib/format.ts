export function formatMoneyEur(value: number) {
  return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ro-RO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function negotiatedPercent(offerPrice: number, listPrice: number) {
  if (!listPrice) return 0;
  return ((offerPrice - listPrice) / listPrice) * 100;
}

export function formatPercent(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

