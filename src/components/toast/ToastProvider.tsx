import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import clsx from 'clsx';

type Toast = { id: string; title: string; kind: 'success' | 'error' | 'info' };

type ToastContextValue = {
  push: (t: { title: string; kind?: Toast['kind'] }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: { title: string; kind?: Toast['kind'] }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const toast: Toast = { id, title: t.title, kind: t.kind || 'info' };
    setToasts((prev) => [toast, ...prev].slice(0, 3));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 2800);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              'pointer-events-auto w-[320px] rounded-2xl border px-4 py-3 text-sm shadow-card backdrop-blur',
              'bg-white/80 border-zinc-200 text-zinc-900 dark:bg-zinc-900/70 dark:border-zinc-800 dark:text-zinc-50',
              t.kind === 'success' && 'border-emerald-400/40',
              t.kind === 'error' && 'border-rose-400/40'
            )}
          >
            {t.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

