export const API_BASE = import.meta.env.VITE_API_BASE || '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.headers || {}),
      ...(init?.body && !(init?.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {})
    }
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export type User = { id: string; username: string };
export type Property = {
  id: string;
  title: string;
  price: number;
  description: string;
  shareToken: string;
  createdAt: string;
};

export type OfferStatus = 'pending' | 'accepted' | 'rejected';
export type PaymentMethod = 'cash' | 'credit' | 'both';
export type Offer = {
  id: string;
  name: string;
  price: number;
  paymentMethod: PaymentMethod;
  status: OfferStatus;
  createdAt: string;
};

export const api = {
  signup: (username: string, password: string) =>
    request<{ user: User }>('/api/auth/signup', { method: 'POST', body: JSON.stringify({ username, password }) }),
  login: (username: string, password: string) =>
    request<{ user: User }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request<{ ok: true }>('/api/auth/logout', { method: 'POST' }),
  me: () => request<{ user: User }>('/api/auth/me'),

  listProperties: () => request<{ properties: Property[] }>('/api/properties'),
  createProperty: (data: { title: string; price: number; description: string }) =>
    request<{ property: Property }>('/api/properties', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getProperty: (propertyId: string) => request<{ property: Property; offers: Offer[] }>(`/api/properties/${propertyId}`),
  addOffer: (propertyId: string, data: { name: string; price: number; paymentMethod: PaymentMethod }) =>
    request<{ offer: Offer }>(`/api/properties/${propertyId}/offers`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  shareGet: (shareToken: string) => request<{ property: Property; offers: Offer[] }>(`/api/share/${shareToken}`),
  shareSetStatus: (shareToken: string, offerId: string, status: OfferStatus) =>
    request<{ ok: true }>(`/api/share/${shareToken}/offers/${offerId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
};

