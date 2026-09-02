import { Restaurant, RestaurantSettings } from '../types';

/**
 * List of reserved system paths that should NEVER be treated as restaurant slugs.
 */
export const RESERVED_ROUTES = new Set([
  '',
  'login',
  'cadastro',
  'cadastrar',
  'register',
  'onboarding',
  'dashboard',
  'admin',
  'demo',
  'configuracoes',
  'settings',
  'conta',
  'esqueci-minha-senha',
  'forgot-password',
  'api',
  'favicon.ico',
  'assets',
  'index.html',
]);

/**
 * Normalizes a raw string into a URL-friendly slug.
 * e.g. "BM Lanches" -> "bm-lanches", "Pizza & Burger!" -> "pizza-burger"
 */
export function normalizeSlug(rawSlug?: string | null): string {
  if (!rawSlug) return '';
  return rawSlug
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/^(\/|#|\/r\/|r\/)+/, '') // remove prefix slashes/hashes
    .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric with hyphen
    .replace(/(^-|-$)+/g, '');       // trim hyphens
}

/**
 * Single source of truth for extracting the restaurant slug.
 * Analyzes pathname (e.g. `/bm-lanches` -> `bm-lanches`) and handles backward compatibility migrations.
 * 
 * Works for:
 * - `/bm-lanches` -> "bm-lanches"
 * - `/pizza-do-joao?mesa=10` -> "pizza-do-joao"
 * - `/sushi-premium/` -> "sushi-premium"
 * - `#/r/bm-lanches` -> "bm-lanches" (migrates URL to `/bm-lanches`)
 * - `/r/bm-lanches` -> "bm-lanches" (migrates URL to `/bm-lanches`)
 * 
 * Returns normalized slug string or null if not a restaurant menu route.
 */
export function getPublicRestaurantSlug(urlOrPathname?: string): string | null {
  // 1. Explicit input passed
  if (urlOrPathname !== undefined && urlOrPathname !== null) {
    let raw = urlOrPathname.trim();
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      try {
        const parsed = new URL(raw);
        raw = parsed.pathname || parsed.hash || '';
      } catch {
        // keep raw
      }
    }

    // Check old hash pattern #/r/:slug
    if (raw.includes('#/r/') || raw.startsWith('#/')) {
      const hashPart = raw.split('#')[1] || '';
      const cleanHash = hashPart.split('?')[0].replace(/^\/+/, '');
      const hashSegments = cleanHash.split('/').filter(Boolean);
      let hashSlug = '';
      if (hashSegments[0] === 'r' && hashSegments[1]) {
        hashSlug = hashSegments[1];
      } else if (hashSegments[0] && !RESERVED_ROUTES.has(hashSegments[0].toLowerCase())) {
        hashSlug = hashSegments[0];
      }
      if (hashSlug) {
        const normalized = normalizeSlug(decodeURIComponent(hashSlug));
        if (normalized && !RESERVED_ROUTES.has(normalized)) {
          return normalized;
        }
      }
    }

    // Check pathname
    const cleanPath = raw.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
    const segments = cleanPath.split('/').filter(Boolean);
    if (segments.length === 0) return null;

    let candidate = '';
    if (segments[0] === 'r' && segments[1]) {
      candidate = segments[1];
    } else {
      candidate = segments[0];
    }

    const normalized = normalizeSlug(decodeURIComponent(candidate));
    if (!normalized || RESERVED_ROUTES.has(normalized)) {
      return null;
    }
    return normalized;
  }

  // 2. Browser window context
  if (typeof window === 'undefined') return null;

  // Check old hash for backward compatibility and migration
  const hash = window.location.hash || '';
  if (hash) {
    const cleanHash = hash.replace(/^#\/?/, '').split('?')[0];
    const hashSegments = cleanHash.split('/').filter(Boolean);
    let hashSlug = '';
    if (hashSegments[0] === 'r' && hashSegments[1]) {
      hashSlug = hashSegments[1];
    } else if (hashSegments[0] && !RESERVED_ROUTES.has(hashSegments[0].toLowerCase())) {
      hashSlug = hashSegments[0];
    }

    if (hashSlug) {
      const normalized = normalizeSlug(decodeURIComponent(hashSlug));
      if (normalized && !RESERVED_ROUTES.has(normalized)) {
        // Migrate URL seamlessly to clean path /:slug
        try {
          const search = window.location.search || (hash.includes('?') ? `?${hash.split('?')[1]}` : '');
          window.history.replaceState(null, '', `/${normalized}${search}`);
        } catch {
          // ignore
        }
        return normalized;
      }
    }
  }

  // Check standard pathname
  const pathname = window.location.pathname || '';
  const cleanPath = pathname.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
  const segments = cleanPath.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  let candidate = '';
  if (segments[0] === 'r' && segments[1]) {
    candidate = segments[1];
    // Migrate /r/:slug to /:slug
    try {
      const normalized = normalizeSlug(decodeURIComponent(candidate));
      if (normalized && !RESERVED_ROUTES.has(normalized)) {
        const search = window.location.search;
        window.history.replaceState(null, '', `/${normalized}${search}`);
        return normalized;
      }
    } catch {
      // ignore
    }
  } else {
    candidate = segments[0];
  }

  const normalized = normalizeSlug(decodeURIComponent(candidate));
  if (!normalized || RESERVED_ROUTES.has(normalized)) {
    return null;
  }

  return normalized;
}

/**
 * Alias for getPublicRestaurantSlug for backward compatibility
 */
export const getRestaurantSlugFromUrl = getPublicRestaurantSlug;

/**
 * Extracts the table/mesa number from a URL, search query, or hash if present.
 */
export function getTableNumberFromUrl(urlOrSearch?: string): string | undefined {
  const raw = urlOrSearch !== undefined
    ? urlOrSearch
    : (typeof window !== 'undefined' ? `${window.location.search}&${window.location.hash}` : '');

  if (!raw) return undefined;

  const questionIndex = raw.indexOf('?');
  const searchPart = questionIndex !== -1 ? raw.slice(questionIndex + 1) : raw;

  const params = new URLSearchParams(searchPart);
  const table = params.get('mesa') || params.get('table') || undefined;
  return table ? decodeURIComponent(table).trim() : undefined;
}

/**
 * Generates the definitive clean public URL for a given restaurant or slug.
 * Format: `${origin}/${slug}` (with optional `?mesa=${tableNumber}`)
 * 
 * Example: `https://app-card-pio.vercel.app/bm-lanches`
 * NEVER includes `#/r/`.
 */
export function getRestaurantPublicUrl(
  restaurantOrSlug?: Restaurant | RestaurantSettings | string | null,
  options?: { tableNumber?: string | number }
): string {
  let slug = '';

  if (typeof restaurantOrSlug === 'string') {
    slug = normalizeSlug(restaurantOrSlug);
  } else if (restaurantOrSlug && typeof restaurantOrSlug === 'object') {
    if ('settings' in restaurantOrSlug && restaurantOrSlug.settings?.slug) {
      slug = normalizeSlug(restaurantOrSlug.settings.slug);
    } else if ('slug' in restaurantOrSlug && typeof (restaurantOrSlug as any).slug === 'string') {
      slug = normalizeSlug((restaurantOrSlug as any).slug);
    }
  }

  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : '';

  if (!slug) {
    return origin ? `${origin}/` : '/';
  }

  let url = origin ? `${origin}/${slug}` : `/${slug}`;

  if (options?.tableNumber) {
    const tableStr = String(options.tableNumber).trim();
    if (tableStr) {
      url += `?mesa=${encodeURIComponent(tableStr)}`;
    }
  }

  return url;
}

/**
 * Generates a ready-to-use WhatsApp sharing URL containing the restaurant's name and exact public link.
 */
export function getRestaurantWhatsAppShareUrl(
  restaurantOrSlug?: Restaurant | RestaurantSettings | string | null,
  options?: { tableNumber?: string | number }
): string {
  const url = getRestaurantPublicUrl(restaurantOrSlug, options);
  let name = 'nosso cardápio';

  if (typeof restaurantOrSlug === 'object' && restaurantOrSlug !== null) {
    if ('settings' in restaurantOrSlug && restaurantOrSlug.settings?.name) {
      name = restaurantOrSlug.settings.name;
    } else if ('name' in restaurantOrSlug && typeof (restaurantOrSlug as any).name === 'string') {
      name = (restaurantOrSlug as any).name;
    }
  }

  const text = `Confira o cardápio digital de *${name}* e faça seu pedido direto pelo WhatsApp:\n\n${url}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Generates a unique, collision-free slug for a new restaurant.
 */
export function generateUniqueSlug(
  name: string,
  existingSlugs: string[]
): string {
  let baseSlug = normalizeSlug(name) || `loja-${Date.now().toString().slice(-4)}`;
  if (RESERVED_ROUTES.has(baseSlug)) {
    baseSlug = `${baseSlug}-loja`;
  }
  const normalizedExisting = existingSlugs.map(s => normalizeSlug(s));

  if (!normalizedExisting.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  while (normalizedExisting.includes(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}

/**
 * Dynamically updates document title and Open Graph meta tags for the active restaurant.
 */
export function updateRestaurantMetaTags(
  restaurant: Restaurant | null,
  options?: { tableNumber?: string | number }
): void {
  if (typeof document === 'undefined') return;

  if (!restaurant) {
    document.title = 'Cardápio não encontrado — MenuZap';
    return;
  }

  const name = restaurant.settings.name || 'Cardápio Digital';
  const description = restaurant.settings.description || `Confira o cardápio digital de ${name} e faça seu pedido pelo WhatsApp!`;
  const url = getRestaurantPublicUrl(restaurant, options);
  const image = restaurant.settings.logoUrl || restaurant.settings.coverUrl || '';

  // Document Title
  document.title = `${name} — Cardápio Digital & Pedidos WhatsApp`;

  // Helper for setting meta property/name
  const setMetaTag = (attrName: string, attrVal: string, content: string) => {
    let tag = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attrName, attrVal);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  // Set standard and OG tags
  setMetaTag('name', 'description', description);
  setMetaTag('property', 'og:title', `${name} — Cardápio Digital`);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', url);
  if (image) {
    setMetaTag('property', 'og:image', image);
  }
}
