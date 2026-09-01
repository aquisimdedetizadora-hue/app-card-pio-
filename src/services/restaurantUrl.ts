import { Restaurant, RestaurantSettings } from '../types';

/**
 * Normalizes a raw string into a URL-friendly slug.
 * e.g. "BM Lanches" -> "bm-lanches", "Burger House!" -> "burger-house"
 */
export function normalizeSlug(rawSlug?: string | null): string {
  if (!rawSlug) return '';
  return rawSlug
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric with hyphen
    .replace(/(^-|-$)+/g, '');       // trim hyphens
}

/**
 * Generates the definitive public URL for a given restaurant or slug.
 * Format: `${origin}/#/r/${slug}` (with optional `?mesa=${tableNumber}`)
 * 
 * NEVER returns a demo fallback when an entity is supplied.
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
    return origin ? `${origin}/#/` : '/#/';
  }

  let url = `${origin}/#/r/${slug}`;

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

  const text = `Confira o cardápio digital do *${name}* e faça seu pedido direto pelo WhatsApp:\n\n${url}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
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
