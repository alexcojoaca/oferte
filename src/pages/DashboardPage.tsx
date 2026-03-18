import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Property } from '../lib/api';
import { formatMoneyEur } from '../lib/format';
import { assetUrl } from '../lib/assets';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/toast/ToastProvider';

export function DashboardPage() {
  const toast = useToast();
  const [items, setItems] = useState<Property[] | null>(null);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const shareBase = useMemo(() => `${window.location.origin}/share/`, []);

  async function refresh() {
    const { properties } = await api.listProperties();
    setItems(properties);
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Dashboard</div>
          <div className="mt-1 text-sm text-zinc-500">Creează o proprietate și adaugă oferte.</div>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-4 text-sm font-semibold">Adaugă proprietate</div>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              const p = await api.createProperty({
                title: title.trim(),
                price: Number(price),
                description,
                image
              });
              toast.push({ title: 'Proprietate salvată', kind: 'success' });
              setTitle('');
              setPrice('');
              setDescription('');
              setImage(null);
              await refresh();
              // preselect? skip
              void p;
            } catch (err) {
              toast.push({ title: err instanceof Error ? err.message : 'Eroare la salvare', kind: 'error' });
            } finally {
              setLoading(false);
            }
          }}
        >
          <Input label="Titlu proprietate" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Preț de listare (EUR)" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
          <label className="block sm:col-span-2">
            <div className="mb-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">Descriere</div>
            <textarea
              className="min-h-[110px] w-full rounded-xl border border-zinc-200 bg-white/80 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-50 dark:placeholder:text-zinc-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <div className="mb-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">Poză cover (jpg/png/webp)</div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 dark:text-zinc-300 dark:file:bg-white dark:file:text-zinc-950 dark:hover:file:bg-zinc-200"
            />
          </label>
          <div className="sm:col-span-2">
            <Button className="w-full sm:w-auto" disabled={loading}>
              {loading ? 'Se salvează…' : 'Salvează'}
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {items?.map((p) => (
          <Card key={p.id} className="p-0 overflow-hidden">
            {p.image ? (
              <div className="h-44 w-full bg-zinc-100 dark:bg-zinc-900">
                <img src={assetUrl(p.image)} alt="" className="h-44 w-full object-cover" />
              </div>
            ) : (
              <div className="h-44 w-full bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950" />
            )}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{p.title}</div>
                  <div className="mt-1 text-sm text-zinc-500">{formatMoneyEur(p.price)}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      const url = `${shareBase}${p.shareToken}`;
                      await navigator.clipboard.writeText(url);
                      toast.push({ title: 'Link copiat', kind: 'success' });
                    }}
                  >
                    Copy link
                  </Button>
                  <Link to={`/app/properties/${p.id}`}>
                    <Button size="sm">Deschide</Button>
                  </Link>
                </div>
              </div>
              {p.description ? <div className="mt-3 line-clamp-3 text-sm text-zinc-500">{p.description}</div> : null}
            </div>
          </Card>
        ))}
        {items && items.length === 0 ? (
          <Card className="md:col-span-2">
            <div className="text-sm text-zinc-500">Încă nu ai proprietăți. Creează prima ofertă mai sus.</div>
          </Card>
        ) : null}
        {!items ? (
          <Card className="md:col-span-2">
            <div className="h-4 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </Card>
        ) : null}
      </div>
    </div>
  );
}

