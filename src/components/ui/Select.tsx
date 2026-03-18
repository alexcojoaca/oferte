import React from 'react';
import clsx from 'clsx';

type Option = { value: string; label: string };

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Option[];
};

export function Select({ className, label, options, ...props }: Props) {
  return (
    <label className="block">
      {label ? <div className="mb-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">{label}</div> : null}
      <select
        className={clsx(
          'h-11 w-full rounded-xl border border-zinc-200 bg-white/80 px-3 text-sm text-zinc-900 shadow-sm outline-none transition',
          'focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20',
          'dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-50',
          className
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

