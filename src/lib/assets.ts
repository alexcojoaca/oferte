const ASSET_BASE = import.meta.env.VITE_API_BASE || '';

export function assetUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Backend stocheaza imaginea ca `/uploads/<file>`.
  // In productie, o prefixam cu URL-ul backendului.
  return `${ASSET_BASE}${path}`;
}

