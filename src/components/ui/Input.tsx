import React from 'react';
import clsx from 'clsx';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export function Input({ className, label, hint, ...props }: Props) {
  return (
    <label className="block">
      {label ? <div className="mb-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">{label}</div> : null}
      <input
        className={clsx(
          'h-11 w-full rounded-xl border border-zinc-200 bg-white/80 px-3 text-sm text-zinc-900 shadow-sm outline-none transition',
          'placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20',
          'dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-50 dark:placeholder:text-zinc-500',
          className
        )}
        {...props}
      />
      {hint ? <div className="mt-1 text-xs text-zinc-500">{hint}</div> : null}
    </label>
  );
}

