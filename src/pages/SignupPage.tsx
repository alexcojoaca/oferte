import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../components/toast/ToastProvider';

export function SignupPage() {
  const nav = useNavigate();
  const { signup } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="mb-8">
        <div className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Oferte Imobiliare</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight">Creează cont</div>
        <div className="mt-1 text-sm text-zinc-500">Doar username + parolă. Fără email.</div>
      </div>

      <Card>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              await signup(username.trim(), password);
              toast.push({ title: 'Cont creat', kind: 'success' });
              nav('/app', { replace: true });
            } catch (err) {
              toast.push({ title: err instanceof Error ? err.message : 'Eroare la signup', kind: 'error' });
            } finally {
              setLoading(false);
            }
          }}
        >
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          <Input
            label="Parolă"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            hint="Minim 6 caractere."
          />
          <Button className="w-full" disabled={loading}>
            {loading ? 'Se creează…' : 'Signup'}
          </Button>
          <div className="text-center text-sm text-zinc-500">
            Ai deja cont?{' '}
            <Link className="text-zinc-900 underline underline-offset-4 dark:text-zinc-50" to="/login">
              Login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

