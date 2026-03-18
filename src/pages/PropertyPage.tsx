import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Offer, type PaymentMethod, type Property } from '../lib/api';
import { formatDateTime, formatMoneyEur, formatPercent, negotiatedPercent } from '../lib/format';
import { getSocket } from '../lib/socket';
import { assetUrl } from '../lib/assets';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { StatusBadge } from '../components/ui/Badge';
import { useToast } from '../components/toast/ToastProvider';

export function PropertyPage() {
  const toast = useToast();
  const { propertyId } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [offers, setOffers] = useState<Offer[] | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [loading, setLoading] = useState(false);

  const shareUrl = useMemo(() => (property ? `${window.location.origin}/share/${property.shareToken}` : ''), [property]);

  async function refresh() {
    if (!propertyId) return;
    const data = await api.getProperty(propertyId);
    setProperty(data.property);
    setOffers(data.offers);
  }

  useEffect(() => {
    void refresh();
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId) return;
    const s = getSocket();
    s.emit('join_property', { propertyId });
    const onUpdate = () => void refresh();
    s.on('offers_updated', onUpdate);
    return () => {
      s.off('offers_updated', onUpdate);
    };
  }, [propertyId]);

  if (!property) {
    return (
      <Card>
        <div className="h-5 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-3 h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm text-zinc-500">
            <Link className="underline underline-offset-4" to="/app">
              Dashboard
            </Link>{' '}
            / Proprietate
          </div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{property.title}</div>
          <div className="mt-1 text-sm text-zinc-500">Preț listare: {formatMoneyEur(property.price)}</div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              await navigator.clipboard.writeText(shareUrl);
              toast.push({ title: 'Link share copiat', kind: 'success' });
            }}
          >
            Copy share link
          </Button>
          <a href={shareUrl} target="_blank" rel="noreferrer">
            <Button size="sm">Deschide share</Button>
          </a>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {property.image ? <img className="h-56 w-full object-cover" src={assetUrl(property.image)} alt="" /> : null}
        {property.description ? <div className="p-5 text-sm text-zinc-600 dark:text-zinc-300">{property.description}</div> : null}
      </Card>

      <Card className="p-6">
        <div className="mb-4 text-sm font-semibold">Adaugă ofertă</div>
        <form
          className="grid gap-3 sm:grid-cols-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!propertyId) return;
            setLoading(true);
            try {
              await api.addOffer(propertyId, { name: name.trim(), price: Number(price), paymentMethod });
              toast.push({ title: 'Ofertă adăugată', kind: 'success' });
              setName('');
              setPrice('');
              setPaymentMethod('cash');
              await refresh();
            } catch (err) {
              toast.push({ title: err instanceof Error ? err.message : 'Eroare la ofertă', kind: 'error' });
            } finally {
              setLoading(false);
            }
          }}
        >
          <Input label="Nume ofertant" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Preț ofertă (EUR)" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Select
            label="Metodă de plată"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            options={[
              { value: 'cash', label: 'Surse proprii' },
              { value: 'credit', label: 'Credit' },
              { value: 'both', label: 'Ambele' }
            ]}
          />
          <div className="flex items-end">
            <Button className="w-full" disabled={loading}>
              {loading ? 'Se adaugă…' : 'Adaugă ofertă'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="border-b border-zinc-200 px-5 py-3 text-sm font-semibold dark:border-zinc-800">Oferte</div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {(offers || []).map((o) => {
            const pct = negotiatedPercent(o.price, property.price);
            const pctText = formatPercent(pct);
            const pctColor =
              pct < 0 ? 'text-emerald-700 dark:text-emerald-300' : pct > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-zinc-500';
            return (
              <div key={o.id} className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-12 sm:items-center">
                <div className="sm:col-span-4">
                  <div className="text-sm font-semibold">{o.name}</div>
                  <div className="mt-1 text-xs text-zinc-500">{formatDateTime(o.createdAt)}</div>
                </div>
                <div className="sm:col-span-3">
                  <div className="text-sm font-semibold">{formatMoneyEur(o.price)}</div>
                  <div className={`mt-1 text-xs ${pctColor}`}>{pctText} vs listare</div>
                </div>
                <div className="sm:col-span-3">
                  <StatusBadge status={o.status} />
                  <div className="mt-1 text-xs text-zinc-500">
                    {o.paymentMethod === 'cash' ? 'Surse proprii' : o.paymentMethod === 'credit' ? 'Credit' : 'Ambele'}
                  </div>
                </div>
              </div>
            );
          })}
          {offers && offers.length === 0 ? <div className="px-5 py-6 text-sm text-zinc-500">Încă nu există oferte.</div> : null}
          {!offers ? <div className="px-5 py-6 text-sm text-zinc-500">Se încarcă…</div> : null}
        </div>
      </Card>
    </div>
  );
}

