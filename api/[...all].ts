import { getPublicRestaurantDataBySlug, getAllRestaurants } from './_lib/db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.url || '';

  // Match /api/restaurants/data-by-slug/:slug
  const dataMatch = url.match(/\/api\/restaurants\/data-by-slug\/([^\/?#]+)/);
  if (dataMatch && dataMatch[1]) {
    const slug = dataMatch[1];
    const data = await getPublicRestaurantDataBySlug(slug);
    if (!data || !data.restaurant) {
      return res.status(404).json({ status: 'not_found', error: 'Cardápio não encontrado', slug });
    }
    return res.status(200).json({ status: 'found', ...data });
  }

  // Match /api/restaurants
  if (url.startsWith('/api/restaurants')) {
    const all = await getAllRestaurants();
    return res.status(200).json(all);
  }

  // Default health response
  return res.status(200).json({ status: 'ok', api: 'vercel-serverless-dispatcher', url });
}
