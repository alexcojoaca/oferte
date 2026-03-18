import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../ui/Button';
import { useEffect, useMemo, useState } from 'react';

function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    const v = localStorage.getItem('theme');
    if (v === 'dark') return true;
    if (v === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return useMemo(() => ({ dark, setDark }), [dark]);
}

export function AppLayout() {
  const nav = useNavigate();
  const { state, logout } = useAuth();
  const { dark, setDark } = useDarkMode();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/app" className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Oferte Imobiliare
          </Link>
          <div className="hidden text-xs text-zinc-500 sm:block">
            {state.status === 'authed' ? `Conectat ca ${state.user.username}` : ''}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDark(!dark)}>
            {dark ? 'Light' : 'Dark'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              await logout();
              nav('/login');
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}

