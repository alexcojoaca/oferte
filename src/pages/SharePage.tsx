import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, type Offer, type OfferStatus, type Property } from '../lib/api';
import { formatDateTime, formatMoneyEur, formatPercent, negotiatedPercent } from '../lib/format';
import { getSocket } from '../lib/socket';
import { assetUrl } from '../lib/assets';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { useToast } from '../components/toast/ToastProvider';

export function SharePage() {
  const toast = useToast();
  const { shareToken } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const title = useMemo(() => (property ? `Oferte — ${property.title}` : 'Oferte'), [property]);
  useEffect(() => {
    document.title = title;
  }, [title]);

  async function refresh() {
    if (!shareToken) return;
    const data = await api.shareGet(shareToken);
    setProperty(data.property);
    setOffers(data.offers);
  }

  useEffect(() => {
    void refresh();
  }, [shareToken]);

  useEffect(() => {
    if (!shareToken) return;
    const s = getSocket();
    s.emit('join_share', { shareToken });
    const onUpdate = () => void refresh();
    s.on('offers_updated', onUpdate);
    return () => {
      s.off('offers_updated', onUpdate);
    };
  }, [shareToken]);

  async function setStatus(offerId: string, status: OfferStatus) {
    if (!shareToken) return;
    setBusy(offerId);
    try {
      await api.shareSetStatus(shareToken, offerId, status);
      toast.push({ title: 'Status actualizat', kind: 'success' });
    } catch (err) {
      toast.push({ title: err instanceof Error ? err.message : 'Eroare', kind: 'error' });
    } finally {
      setBusy(null);
    }
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Card>
          <div className="h-5 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm text-zinc-500">Share / Proprietar</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{property.title}</div>
          <div className="mt-1 text-sm text-zinc-500">Preț listare: {formatMoneyEur(property.price)}</div>
        </div>
        <div className="text-xs text-zinc-500">View-only (poți doar schimba statusul ofertelor)</div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Card className="p-0 overflow-hidden">
            {property.image ? <img className="h-56 w-full object-cover" src={assetUrl(property.image)} alt="" /> : null}
            {property.description ? (
              <div className="p-5 text-sm text-zinc-600 dark:text-zinc-300">{property.description}</div>
            ) : (
              <div className="p-5 text-sm text-zinc-500">Fără descriere.</div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-zinc-200 px-5 py-3 text-sm font-semibold dark:border-zinc-800">Oferte (real‑time)</div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {(offers || []).map((o) => {
                const pct = negotiatedPercent(o.price, property.price);
                const pctText = formatPercent(pct);
                const pctColor =
                  pct < 0
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : pct > 0
                      ? 'text-rose-700 dark:text-rose-300'
                      : 'text-zinc-500';
                return (
                  <div key={o.id} className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-12 sm:items-center">
                    <div className="sm:col-span-4">
                      <div className="text-sm font-semibold">{o.name}</div>
                      <div className="mt-1 text-xs text-zinc-500">{formatDateTime(o.createdAt)}</div>
                    </div>
                    <div className="sm:col-span-3">
                      <div className="text-sm font-semibold">{formatMoneyEur(o.price)}</div>
                      <div className={`mt-1 text-xs ${pctColor}`}>{pctText} vs listare</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {o.paymentMethod === 'cash' ? 'Surse proprii' : o.paymentMethod === 'credit' ? 'Credit' : 'Ambele'}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="flex flex-wrap gap-2 sm:col-span-3 sm:justify-end">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy === o.id}
                        onClick={() => setStatus(o.id, 'pending')}
                      >
                        În așteptare
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy === o.id}
                        onClick={() => setStatus(o.id, 'rejected')}
                      >
                        Refuză
                      </Button>
                      <Button size="sm" disabled={busy === o.id} onClick={() => setStatus(o.id, 'accepted')}>
                        Acceptă
                      </Button>
                    </div>
                  </div>
                );
              })}
              {offers && offers.length === 0 ? <div className="px-5 py-6 text-sm text-zinc-500">Încă nu există oferte.</div> : null}
              {!offers ? <div className="px-5 py-6 text-sm text-zinc-500">Se încarcă…</div> : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

