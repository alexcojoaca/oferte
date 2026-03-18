import React from 'react';
import clsx from 'clsx';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-zinc-200 bg-white/70 p-5 shadow-soft backdrop-blur',
        'dark:border-zinc-800 dark:bg-zinc-900/60',
        className
      )}
      {...props}
    />
  );
}

