import clsx from 'clsx';
import type { OfferStatus } from '../../lib/api';

export function StatusBadge({ status, className }: { status: OfferStatus; className?: string }) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium';
  if (status === 'accepted')
    return <span className={clsx(base, 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', className)}>Acceptată</span>;
  if (status === 'rejected')
    return <span className={clsx(base, 'bg-rose-500/15 text-rose-700 dark:text-rose-300', className)}>Refuzată</span>;
  return <span className={clsx(base, 'bg-amber-500/15 text-amber-700 dark:text-amber-300', className)}>În așteptare</span>;
}

